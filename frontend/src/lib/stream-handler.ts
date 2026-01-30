/**
 * Stream Handler for SSE Chat Responses
 *
 * Parses Server-Sent Events from the chat API and provides
 * callbacks for handling streaming content updates.
 *
 * @see Requirements 3.2, 3.4
 */

import type { ChatSSEEvent } from '@/types/chat';

export interface StreamHandlerCallbacks {
  onChunk: (content: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

/**
 * Parse a single SSE line into an event object
 */
export function parseSSELine(line: string): ChatSSEEvent | null {
  // SSE format: "data: {json}"
  if (!line.startsWith('data: ')) {
    return null;
  }

  const jsonStr = line.slice(6); // Remove "data: " prefix
  
  // Handle [DONE] marker (OpenAI style)
  if (jsonStr === '[DONE]') {
    return { type: 'done' };
  }

  try {
    return JSON.parse(jsonStr) as ChatSSEEvent;
  } catch {
    // Invalid JSON - ignore this line
    return null;
  }
}

/**
 * Process a stream of SSE events from the chat API
 *
 * @param response - The fetch Response object with a readable stream
 * @param callbacks - Callbacks for handling stream events
 */
export async function processStream(
  response: Response,
  callbacks: StreamHandlerCallbacks
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError('No response body available');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let accumulatedContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Process any remaining buffer content
        if (buffer.trim()) {
          const lines = buffer.split('\n');
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              const event = parseSSELine(trimmedLine);
              if (event) {
                handleEvent(event, callbacks, accumulatedContent, (content) => {
                  accumulatedContent = content;
                });
              }
            }
          }
        }
        callbacks.onComplete();
        break;
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines from buffer
      const lines = buffer.split('\n');
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const event = parseSSELine(trimmedLine);
        if (event) {
          const shouldStop = handleEvent(event, callbacks, accumulatedContent, (content) => {
            accumulatedContent = content;
          });
          if (shouldStop) {
            return;
          }
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Stream processing failed';
    callbacks.onError(errorMessage);
  } finally {
    reader.releaseLock();
  }
}

/**
 * Handle a single SSE event
 * @returns true if processing should stop
 */
function handleEvent(
  event: ChatSSEEvent,
  callbacks: StreamHandlerCallbacks,
  accumulatedContent: string,
  setAccumulatedContent: (content: string) => void
): boolean {
  switch (event.type) {
    case 'chunk':
      if (event.content) {
        const newContent = accumulatedContent + event.content;
        setAccumulatedContent(newContent);
        callbacks.onChunk(newContent);
      }
      return false;

    case 'done':
      callbacks.onComplete();
      return true;

    case 'error':
      callbacks.onError(event.message || 'Unknown error occurred');
      return true;

    default:
      // Unknown event type - ignore
      return false;
  }
}

/**
 * Create a fetch request to the chat API with proper headers
 */
export function createChatRequest(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Request {
  return new Request('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });
}

/**
 * Send a chat message and process the streaming response
 *
 * @param messages - The conversation history
 * @param callbacks - Callbacks for handling stream events
 * @param signal - Optional AbortSignal for cancellation
 */
export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  callbacks: StreamHandlerCallbacks,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
      signal,
    });

    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage = 'Failed to send message';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Use status text if JSON parsing fails
        errorMessage = response.statusText || errorMessage;
      }
      callbacks.onError(errorMessage);
      return;
    }

    await processStream(response, callbacks);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      callbacks.onError('Request was cancelled');
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
    callbacks.onError(errorMessage);
  }
}
