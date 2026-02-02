/**
 * Chat API Route
 *
 * This API route handles chat messages from the frontend and returns
 * AI-generated responses using the knowledge base context.
 *
 * @see Requirements 3.1, 3.2, 3.3, 3.5, 4.1, 4.3, 6.1, 6.2, 6.3, 10.4
 */

import { NextRequest } from 'next/server';
import { loadAndCompileKnowledge } from '@/lib/knowledge-loader';
import { streamChatCompletion, LLMError, LLMErrorType } from '@/lib/llm-client';
import type { ChatAPIRequest, ConversationMessage } from '@/types/chat';
import {
  GuardrailsService,
  CHAT_GUARDRAIL_CONFIG,
} from '@/lib/guardrails/guardrails-service';
import { createAnonymizedRequestId } from '@/lib/guardrails/security-logger';

/**
 * User-friendly error messages mapped by error type
 * These messages are safe to display to users and never expose technical details
 *
 * @see Requirements 6.1, 6.2, 6.3 - Error handling with user-friendly messages
 */
const USER_FRIENDLY_ERROR_MESSAGES: Record<LLMErrorType, string> = {
  network: 'Unable to connect. Please check your connection and try again.',
  timeout: 'The response is taking too long. Please try again.',
  server: 'Something went wrong on our end. Please try again.',
  rate_limit: 'Too many requests. Please wait a moment and try again.',
  invalid_response: 'Received an unexpected response. Please try again.',
  api_key_missing: 'Something went wrong on our end. Please try again.',
};

/**
 * Get a user-friendly error message for an LLM error type
 * Never exposes technical details or API keys
 *
 * @param errorType - The type of LLM error
 * @returns A user-friendly error message
 */
function getUserFriendlyErrorMessage(errorType: LLMErrorType): string {
  return USER_FRIENDLY_ERROR_MESSAGES[errorType] || 'An unexpected error occurred. Please try again.';
}

/**
 * Validate the request body structure
 */
function validateRequest(body: unknown): body is ChatAPIRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const request = body as ChatAPIRequest;

  if (!Array.isArray(request.messages)) {
    return false;
  }

  return request.messages.every(
    (msg): msg is ConversationMessage =>
      typeof msg === 'object' &&
      msg !== null &&
      (msg.role === 'user' || msg.role === 'assistant') &&
      typeof msg.content === 'string'
  );
}

/**
 * Create an SSE-formatted message
 */
function createSSEMessage(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * POST /api/chat
 *
 * Accepts a messages array and returns a streaming response with AI-generated content.
 * Uses Server-Sent Events (SSE) format for streaming.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();

    if (!validateRequest(body)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format. Expected { messages: Array<{ role, content }> }' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { messages } = body;

    // Ensure there's at least one message
    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one message is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the latest user message for guardrails validation
    const latestUserMessage = messages.filter((m: ConversationMessage) => m.role === 'user').pop();
    
    if (latestUserMessage) {
      // Initialize guardrails service
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        const guardrailsService = new GuardrailsService(apiKey, 'chat');
        const requestId = createAnonymizedRequestId(request);
        
        // Validate input against guardrails
        const validationResult = await guardrailsService.validateInput(
          latestUserMessage.content,
          CHAT_GUARDRAIL_CONFIG,
          requestId
        );

        if (!validationResult.passed) {
          // Return rejection message via SSE without calling LLM
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode(
                  createSSEMessage({ 
                    type: 'chunk', 
                    content: validationResult.userMessage 
                  })
                )
              );
              controller.enqueue(
                new TextEncoder().encode(
                  createSSEMessage({ type: 'done' })
                )
              );
              controller.close();
            },
          });

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }
      }
    }

    // Load and compile knowledge context
    const compiledKnowledge = await loadAndCompileKnowledge();
    const systemPrompt = compiledKnowledge.systemPrompt;

    // Create a streaming response using SSE format
    // Stream LLM responses directly to the client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the LLM response
          // @see Requirements 3.2 (streaming), 3.3 (conversation context), 3.5 (peer tone)
          for await (const chunk of streamChatCompletion(systemPrompt, messages)) {
            controller.enqueue(
              new TextEncoder().encode(
                createSSEMessage({ type: 'chunk', content: chunk })
              )
            );
          }

          // Send completion event
          controller.enqueue(
            new TextEncoder().encode(
              createSSEMessage({ type: 'done' })
            )
          );

          controller.close();
        } catch (error) {
          // Handle errors with user-friendly messages
          // @see Requirements 6.1 (timeout), 6.2 (network errors), 6.3 (user-friendly messages)
          // SECURITY: Never expose technical details, API keys, or stack traces
          let errorMessage = 'An unexpected error occurred. Please try again.';
          
          if (error instanceof LLMError) {
            // Use the mapped user-friendly message for the error type
            // This ensures consistent, safe messages that don't expose internals
            errorMessage = getUserFriendlyErrorMessage(error.type);
            
            // Log the error for debugging (server-side only, no PII)
            console.error(`Chat API LLM error [${error.type}]:`, error.message);
          } else if (error instanceof Error) {
            // For unknown errors, use a generic message
            // SECURITY: Don't expose internal error details to the client
            console.error('Chat API unexpected error:', error.name, error.message);
            errorMessage = 'Something went wrong on our end. Please try again.';
          }
          
          controller.enqueue(
            new TextEncoder().encode(
              createSSEMessage({ type: 'error', message: errorMessage })
            )
          );
          controller.close();
        }
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    // Handle JSON parsing errors or other unexpected errors
    // @see Requirements 6.3 - Never expose technical details
    // SECURITY: Log for debugging but return generic message to client
    if (error instanceof SyntaxError) {
      console.error('Chat API JSON parse error:', error.message);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.error('Chat API error:', error instanceof Error ? error.message : 'Unknown error');

    return new Response(
      JSON.stringify({ error: 'Something went wrong on our end. Please try again.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
