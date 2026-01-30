/**
 * Stream Handler Tests
 *
 * Tests for SSE stream parsing and processing
 */

import { parseSSELine, processStream, type StreamHandlerCallbacks } from './stream-handler';

describe('stream-handler', () => {
  describe('parseSSELine', () => {
    it('parses chunk events correctly', () => {
      const line = 'data: {"type":"chunk","content":"Hello"}';
      const result = parseSSELine(line);
      expect(result).toEqual({ type: 'chunk', content: 'Hello' });
    });

    it('parses done events correctly', () => {
      const line = 'data: {"type":"done"}';
      const result = parseSSELine(line);
      expect(result).toEqual({ type: 'done' });
    });

    it('parses error events correctly', () => {
      const line = 'data: {"type":"error","message":"Something went wrong"}';
      const result = parseSSELine(line);
      expect(result).toEqual({ type: 'error', message: 'Something went wrong' });
    });

    it('handles OpenAI-style [DONE] marker', () => {
      const line = 'data: [DONE]';
      const result = parseSSELine(line);
      expect(result).toEqual({ type: 'done' });
    });

    it('returns null for non-data lines', () => {
      expect(parseSSELine('event: message')).toBeNull();
      expect(parseSSELine(': comment')).toBeNull();
      expect(parseSSELine('')).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      const line = 'data: {invalid json}';
      const result = parseSSELine(line);
      expect(result).toBeNull();
    });
  });

  describe('processStream', () => {
    function createMockResponse(chunks: string[]): Response {
      const encoder = new TextEncoder();
      let index = 0;

      const stream = new ReadableStream({
        pull(controller) {
          if (index < chunks.length) {
            controller.enqueue(encoder.encode(chunks[index]));
            index++;
          } else {
            controller.close();
          }
        },
      });

      return new Response(stream);
    }

    it('processes streaming chunks and accumulates content', async () => {
      const chunks = [
        'data: {"type":"chunk","content":"Hello"}\n\n',
        'data: {"type":"chunk","content":" World"}\n\n',
        'data: {"type":"done"}\n\n',
      ];

      const response = createMockResponse(chunks);
      const receivedChunks: string[] = [];
      let completed = false;
      let errorMessage: string | null = null;

      const callbacks: StreamHandlerCallbacks = {
        onChunk: (content) => receivedChunks.push(content),
        onComplete: () => { completed = true; },
        onError: (error) => { errorMessage = error; },
      };

      await processStream(response, callbacks);

      expect(receivedChunks).toEqual(['Hello', 'Hello World']);
      expect(completed).toBe(true);
      expect(errorMessage).toBeNull();
    });

    it('handles error events from stream', async () => {
      const chunks = [
        'data: {"type":"chunk","content":"Partial"}\n\n',
        'data: {"type":"error","message":"Server error"}\n\n',
      ];

      const response = createMockResponse(chunks);
      let errorMessage: string | null = null;

      const callbacks: StreamHandlerCallbacks = {
        onChunk: () => {},
        onComplete: () => {},
        onError: (error) => { errorMessage = error; },
      };

      await processStream(response, callbacks);

      expect(errorMessage).toBe('Server error');
    });

    it('handles response with no body', async () => {
      const response = new Response(null);
      let errorMessage: string | null = null;

      const callbacks: StreamHandlerCallbacks = {
        onChunk: () => {},
        onComplete: () => {},
        onError: (error) => { errorMessage = error; },
      };

      await processStream(response, callbacks);

      expect(errorMessage).toBe('No response body available');
    });

    it('handles chunks split across multiple reads', async () => {
      // Simulate a chunk being split in the middle
      const chunks = [
        'data: {"type":"chu',
        'nk","content":"Split"}\n\ndata: {"type":"done"}\n\n',
      ];

      const response = createMockResponse(chunks);
      const receivedChunks: string[] = [];
      let completed = false;

      const callbacks: StreamHandlerCallbacks = {
        onChunk: (content) => receivedChunks.push(content),
        onComplete: () => { completed = true; },
        onError: () => {},
      };

      await processStream(response, callbacks);

      expect(receivedChunks).toEqual(['Split']);
      expect(completed).toBe(true);
    });
  });
});
