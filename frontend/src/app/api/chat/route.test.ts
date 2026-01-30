/**
 * Chat API Route Tests
 *
 * Tests for the POST /api/chat endpoint.
 *
 * @see Requirements 3.1, 3.2, 3.3, 3.5, 4.1, 4.3, 10.4
 * @jest-environment node
 */

import type { ChatAPIRequest, ChatSSEEvent } from '@/types/chat';

// Mock the knowledge loader before importing the route
jest.mock('@/lib/knowledge-loader', () => ({
  loadAndCompileKnowledge: jest.fn().mockResolvedValue({
    systemPrompt: 'Test system prompt with knowledge context',
    contextSections: [],
    totalTokenEstimate: 100,
  }),
}));

// Mock the LLM client
const mockStreamChatCompletion = jest.fn();
jest.mock('@/lib/llm-client', () => ({
  streamChatCompletion: (...args: unknown[]) => mockStreamChatCompletion(...args),
  LLMError: class LLMError extends Error {
    type: string;
    retryable: boolean;
    constructor(type: string, message: string, retryable: boolean = false) {
      super(message);
      this.name = 'LLMError';
      this.type = type;
      this.retryable = retryable;
    }
  },
}));

// Mock NextRequest and NextResponse for testing
class MockNextRequest {
  private body: string;
  public method: string;
  public headers: Map<string, string>;

  constructor(_url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) {
    this.body = init?.body || '';
    this.method = init?.method || 'GET';
    this.headers = new Map(Object.entries(init?.headers || {}));
  }

  async json() {
    return JSON.parse(this.body);
  }
}

// Set up global mocks before importing the route
jest.mock('next/server', () => ({
  NextRequest: MockNextRequest,
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => {
      return new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  },
}));

// Import the route after mocks are set up
import { POST } from './route';

/**
 * Helper to create a mock request with JSON body
 */
function createRequest(body: unknown): MockNextRequest {
  return new MockNextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * Helper to parse SSE stream into events
 */
async function parseSSEStream(response: Response): Promise<ChatSSEEvent[]> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const events: ChatSSEEvent[] = [];
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE events from buffer
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        try {
          events.push(JSON.parse(data) as ChatSSEEvent);
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  }

  return events;
}

/**
 * Helper to create an async generator from chunks
 */
async function* createMockStream(chunks: string[]): AsyncGenerator<string, void, unknown> {
  for (const chunk of chunks) {
    yield chunk;
  }
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockStreamChatCompletion.mockReset();
    // Default mock implementation that yields test chunks
    mockStreamChatCompletion.mockImplementation(() => 
      createMockStream(['Hello', ', ', 'this is a test response.'])
    );
  });
  describe('Request Validation', () => {
    it('should return 400 for invalid request body', async () => {
      const request = createRequest({ invalid: 'body' });
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Invalid request format');
    });

    it('should return 400 for empty messages array', async () => {
      const request = createRequest({ messages: [] });
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('At least one message is required');
    });

    it('should return 400 for messages with invalid role', async () => {
      const request = createRequest({
        messages: [{ role: 'invalid', content: 'Hello' }],
      });
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
    });

    it('should return 400 for messages with missing content', async () => {
      const request = createRequest({
        messages: [{ role: 'user' }],
      });
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
    });

    it('should return 400 for non-object body', async () => {
      const request = createRequest('not an object');
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
    });

    it('should return 400 for null body', async () => {
      const request = createRequest(null);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
    });
  });

  describe('Valid Requests', () => {
    it('should accept valid request with user message', async () => {
      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: 'Tell me about your experience' }],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should accept valid request with conversation history', async () => {
      const requestBody: ChatAPIRequest = {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
          { role: 'user', content: 'Tell me about your projects' },
        ],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
    });
  });

  describe('SSE Streaming Response', () => {
    it('should return SSE formatted response', async () => {
      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');
    });

    it('should stream chunks followed by done event', async () => {
      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const events = await parseSSEStream(response);

      // Should have at least one chunk and a done event
      expect(events.length).toBeGreaterThan(1);

      // Check that we have chunk events
      const chunkEvents = events.filter((e) => e.type === 'chunk');
      expect(chunkEvents.length).toBeGreaterThan(0);

      // Check that the last event is 'done'
      const lastEvent = events[events.length - 1];
      expect(lastEvent.type).toBe('done');
    });

    it('should include content from LLM response', async () => {
      // Set up mock to return specific content
      mockStreamChatCompletion.mockImplementation(() => 
        createMockStream(['I have worked on ', 'several interesting projects.'])
      );
      
      const userQuestion = 'What projects have you worked on?';
      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: userQuestion }],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const events = await parseSSEStream(response);

      // Combine all chunk content
      const fullContent = events
        .filter((e): e is { type: 'chunk'; content: string } => e.type === 'chunk')
        .map((e) => e.content)
        .join('');

      // Should contain the mocked LLM response
      expect(fullContent).toContain('I have worked on several interesting projects.');
    });
  });

  describe('LLM Client Integration', () => {
    it('should pass system prompt and messages to LLM client', async () => {
      const requestBody: ChatAPIRequest = {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
          { role: 'user', content: 'Tell me about your projects' },
        ],
      };
      const request = createRequest(requestBody);
      await POST(request as unknown as Parameters<typeof POST>[0]);

      // Verify LLM client was called with correct arguments
      expect(mockStreamChatCompletion).toHaveBeenCalledWith(
        'Test system prompt with knowledge context',
        requestBody.messages
      );
    });

    it('should handle LLM errors gracefully', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      // Mock LLM client to throw a timeout error
      mockStreamChatCompletion.mockImplementation(async function* () {
        throw new LLMError('timeout', 'Internal timeout message - should not be shown', true);
      });

      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const events = await parseSSEStream(response);

      // Should have an error event with user-friendly message
      const errorEvent = events.find((e) => e.type === 'error');
      expect(errorEvent).toBeDefined();
      // Should use the mapped user-friendly message, not the internal one
      expect((errorEvent as { type: 'error'; message: string }).message).toBe('The response is taking too long. Please try again.');
    });

    it('should handle rate limit errors with user-friendly message', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      // Mock LLM client to throw a rate limit error
      mockStreamChatCompletion.mockImplementation(async function* () {
        throw new LLMError('rate_limit', 'Rate limit exceeded - internal', true);
      });

      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const events = await parseSSEStream(response);

      const errorEvent = events.find((e) => e.type === 'error');
      expect(errorEvent).toBeDefined();
      expect((errorEvent as { type: 'error'; message: string }).message).toBe('Too many requests. Please wait a moment and try again.');
    });

    it('should handle network errors with user-friendly message', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      // Mock LLM client to throw a network error
      mockStreamChatCompletion.mockImplementation(async function* () {
        throw new LLMError('network', 'Network failure - internal', true);
      });

      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const events = await parseSSEStream(response);

      const errorEvent = events.find((e) => e.type === 'error');
      expect(errorEvent).toBeDefined();
      expect((errorEvent as { type: 'error'; message: string }).message).toBe('Unable to connect. Please check your connection and try again.');
    });

    it('should handle server errors with user-friendly message', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      // Mock LLM client to throw a server error
      mockStreamChatCompletion.mockImplementation(async function* () {
        throw new LLMError('server', 'Internal server error 500 - should not be shown', true);
      });

      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const events = await parseSSEStream(response);

      const errorEvent = events.find((e) => e.type === 'error');
      expect(errorEvent).toBeDefined();
      expect((errorEvent as { type: 'error'; message: string }).message).toBe('Something went wrong on our end. Please try again.');
    });

    it('should handle invalid response errors with user-friendly message', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      // Mock LLM client to throw an invalid response error
      mockStreamChatCompletion.mockImplementation(async function* () {
        throw new LLMError('invalid_response', 'Malformed JSON in response - internal', true);
      });

      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const events = await parseSSEStream(response);

      const errorEvent = events.find((e) => e.type === 'error');
      expect(errorEvent).toBeDefined();
      expect((errorEvent as { type: 'error'; message: string }).message).toBe('Received an unexpected response. Please try again.');
    });

    it('should handle API key missing errors without exposing details', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      // Mock LLM client to throw an API key missing error
      mockStreamChatCompletion.mockImplementation(async function* () {
        throw new LLMError('api_key_missing', 'OPENAI_API_KEY not set - should not be shown', false);
      });

      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const events = await parseSSEStream(response);

      const errorEvent = events.find((e) => e.type === 'error');
      expect(errorEvent).toBeDefined();
      // Should NOT expose API key details
      const errorMessage = (errorEvent as { type: 'error'; message: string }).message;
      expect(errorMessage).not.toContain('API');
      expect(errorMessage).not.toContain('key');
      expect(errorMessage).not.toContain('OPENAI');
      expect(errorMessage).toBe('Something went wrong on our end. Please try again.');
    });

    it('should handle generic errors without exposing details', async () => {
      // Mock LLM client to throw a generic error
      mockStreamChatCompletion.mockImplementation(async function* () {
        throw new Error('Internal API key exposed - should not be shown');
      });

      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const events = await parseSSEStream(response);

      // Should have an error event with generic message
      const errorEvent = events.find((e) => e.type === 'error');
      expect(errorEvent).toBeDefined();
      // Should NOT expose internal error details
      const errorMessage = (errorEvent as { type: 'error'; message: string }).message;
      expect(errorMessage).not.toContain('API key');
      expect(errorMessage).not.toContain('Internal');
      expect(errorMessage).toBe('Something went wrong on our end. Please try again.');
    });
  });

  describe('Knowledge Context Loading', () => {
    it('should load knowledge context for each request', async () => {
      const { loadAndCompileKnowledge } = require('@/lib/knowledge-loader');

      const requestBody: ChatAPIRequest = {
        messages: [{ role: 'user', content: 'Tell me about your skills' }],
      };
      const request = createRequest(requestBody);
      await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(loadAndCompileKnowledge).toHaveBeenCalled();
    });
  });
});
