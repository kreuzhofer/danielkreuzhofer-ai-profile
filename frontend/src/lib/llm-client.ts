/**
 * LLM Client with Streaming Support
 *
 * This module provides an LLM client that integrates with OpenAI's API
 * to generate streaming responses for the AI chatbot.
 *
 * @see Requirements 3.2, 3.3, 3.5, 4.1, 4.3
 */

import type { ConversationMessage } from '@/types/chat';

// =============================================================================
// Configuration
// =============================================================================

/**
 * LLM client configuration
 */
export interface LLMConfig {
  /** OpenAI API key */
  apiKey: string;
  /** Model to use (default: gpt-4o-mini) */
  model?: string;
  /** Temperature for response generation (default: 0.7) */
  temperature?: number;
  /** Maximum tokens in response (default: 1024) */
  maxTokens?: number;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<Omit<LLMConfig, 'apiKey'>> = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1024,
  timeout: 30000,
};

// =============================================================================
// Types
// =============================================================================

/**
 * OpenAI chat message format
 */
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * OpenAI streaming response chunk
 */
interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

/**
 * Error types for LLM operations
 */
export type LLMErrorType = 'api_key_missing' | 'rate_limit' | 'timeout' | 'network' | 'server' | 'invalid_response';

/**
 * LLM error with type information
 */
export class LLMError extends Error {
  constructor(
    public readonly type: LLMErrorType,
    message: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

// =============================================================================
// Configuration Helpers
// =============================================================================

/**
 * Get the OpenAI API key from environment variables
 * @throws LLMError if API key is not configured
 */
export function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new LLMError(
      'api_key_missing',
      'OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.',
      false
    );
  }
  
  return apiKey;
}

/**
 * Get the model name from environment or use default
 */
export function getModel(): string {
  return process.env.OPENAI_MODEL || DEFAULT_CONFIG.model;
}

/**
 * Build the full configuration from partial config and environment
 */
export function buildConfig(partialConfig?: Partial<LLMConfig>): Required<LLMConfig> {
  return {
    apiKey: partialConfig?.apiKey || getApiKey(),
    model: partialConfig?.model || getModel(),
    temperature: partialConfig?.temperature ?? DEFAULT_CONFIG.temperature,
    maxTokens: partialConfig?.maxTokens ?? DEFAULT_CONFIG.maxTokens,
    timeout: partialConfig?.timeout ?? DEFAULT_CONFIG.timeout,
  };
}

// =============================================================================
// Streaming Chat Completion
// =============================================================================

/**
 * Stream a chat completion from OpenAI
 *
 * This function yields text chunks as they are received from the API,
 * enabling real-time streaming of responses to the user.
 *
 * @param systemPrompt - The system prompt with knowledge context
 * @param messages - The conversation history
 * @param config - Optional configuration overrides
 * @yields Text chunks as they are received
 * @throws LLMError on API failures
 *
 * @see Requirements 3.2 (streaming), 3.3 (conversation context), 3.5 (peer tone)
 */
export async function* streamChatCompletion(
  systemPrompt: string,
  messages: ConversationMessage[],
  config?: Partial<LLMConfig>
): AsyncGenerator<string, void, unknown> {
  const fullConfig = buildConfig(config);
  
  // Build the messages array for OpenAI
  const openAIMessages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ];
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), fullConfig.timeout);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fullConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: fullConfig.model,
        messages: openAIMessages,
        temperature: fullConfig.temperature,
        max_tokens: fullConfig.maxTokens,
        stream: true,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorBody = await response.text();
      
      if (response.status === 429) {
        throw new LLMError(
          'rate_limit',
          'Too many requests. Please wait a moment and try again.',
          true
        );
      }
      
      if (response.status === 401) {
        throw new LLMError(
          'api_key_missing',
          'Invalid API key. Please check your OpenAI API key configuration.',
          false
        );
      }
      
      if (response.status >= 500) {
        throw new LLMError(
          'server',
          'OpenAI service is temporarily unavailable. Please try again.',
          true
        );
      }
      
      throw new LLMError(
        'server',
        `API request failed: ${response.status} ${response.statusText}`,
        true
      );
    }
    
    // Ensure we have a readable stream
    if (!response.body) {
      throw new LLMError(
        'invalid_response',
        'No response body received from API',
        true
      );
    }
    
    // Process the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete SSE messages from the buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith(':')) {
          continue;
        }
        
        // Parse SSE data lines
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6);
          
          // Check for stream end
          if (data === '[DONE]') {
            return;
          }
          
          try {
            const chunk: OpenAIStreamChunk = JSON.parse(data);
            const content = chunk.choices[0]?.delta?.content;
            
            if (content) {
              yield content;
            }
          } catch {
            // Skip malformed JSON chunks
            continue;
          }
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new LLMError(
        'timeout',
        'The response is taking too long. Please try again.',
        true
      );
    }
    
    // Re-throw LLM errors
    if (error instanceof LLMError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new LLMError(
        'network',
        'Unable to connect to the AI service. Please check your connection.',
        true
      );
    }
    
    // Handle other errors
    throw new LLMError(
      'server',
      'An unexpected error occurred. Please try again.',
      true
    );
  }
}

// =============================================================================
// Non-Streaming Chat Completion (for testing/fallback)
// =============================================================================

/**
 * Get a complete chat response (non-streaming)
 *
 * This is useful for testing or when streaming is not needed.
 *
 * @param systemPrompt - The system prompt with knowledge context
 * @param messages - The conversation history
 * @param config - Optional configuration overrides
 * @returns The complete response text
 */
export async function getChatCompletion(
  systemPrompt: string,
  messages: ConversationMessage[],
  config?: Partial<LLMConfig>
): Promise<string> {
  const chunks: string[] = [];
  
  for await (const chunk of streamChatCompletion(systemPrompt, messages, config)) {
    chunks.push(chunk);
  }
  
  return chunks.join('');
}

// =============================================================================
// Exports
// =============================================================================

export default {
  streamChatCompletion,
  getChatCompletion,
  getApiKey,
  getModel,
  buildConfig,
};
