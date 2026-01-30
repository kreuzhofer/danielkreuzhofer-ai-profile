/**
 * LLM Client Tests
 *
 * Tests for the LLM client with streaming support.
 *
 * @see Requirements 3.2, 3.3, 3.5, 4.1, 4.3
 * @jest-environment node
 */

import {
  getApiKey,
  getModel,
  buildConfig,
  streamChatCompletion,
  getChatCompletion,
  LLMError,
} from './llm-client';
import type { ConversationMessage } from '@/types/chat';

// Store original env
const originalEnv = process.env;

describe('LLM Client', () => {
  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getApiKey', () => {
    it('should return API key when set', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      expect(getApiKey()).toBe('test-api-key');
    });

    it('should throw LLMError when API key is not set', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => getApiKey()).toThrow(LLMError);
      expect(() => getApiKey()).toThrow('OpenAI API key is not configured');
    });

    it('should throw non-retryable error for missing API key', () => {
      delete process.env.OPENAI_API_KEY;
      try {
        getApiKey();
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LLMError);
        expect((error as LLMError).type).toBe('api_key_missing');
        expect((error as LLMError).retryable).toBe(false);
      }
    });
  });

  describe('getModel', () => {
    it('should return model from environment when set', () => {
      process.env.OPENAI_MODEL = 'gpt-4';
      expect(getModel()).toBe('gpt-4');
    });

    it('should return default model when not set', () => {
      delete process.env.OPENAI_MODEL;
      expect(getModel()).toBe('gpt-4o-mini');
    });
  });

  describe('buildConfig', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-key';
    });

    it('should use defaults when no config provided', () => {
      const config = buildConfig();
      expect(config.apiKey).toBe('test-key');
      expect(config.model).toBe('gpt-4o-mini');
      expect(config.temperature).toBe(0.7);
      expect(config.maxTokens).toBe(1024);
      expect(config.timeout).toBe(30000);
    });

    it('should override defaults with provided config', () => {
      const config = buildConfig({
        apiKey: 'custom-key',
        model: 'gpt-4',
        temperature: 0.5,
        maxTokens: 2048,
        timeout: 60000,
      });
      expect(config.apiKey).toBe('custom-key');
      expect(config.model).toBe('gpt-4');
      expect(config.temperature).toBe(0.5);
      expect(config.maxTokens).toBe(2048);
      expect(config.timeout).toBe(60000);
    });

    it('should allow partial config overrides', () => {
      const config = buildConfig({ temperature: 0.9 });
      expect(config.apiKey).toBe('test-key');
      expect(config.model).toBe('gpt-4o-mini');
      expect(config.temperature).toBe(0.9);
      expect(config.maxTokens).toBe(1024);
    });

    it('should use environment model when not in config', () => {
      process.env.OPENAI_MODEL = 'gpt-4-turbo';
      const config = buildConfig();
      expect(config.model).toBe('gpt-4-turbo');
    });
  });

  describe('LLMError', () => {
    it('should create error with correct properties', () => {
      const error = new LLMError('timeout', 'Request timed out', true);
      expect(error.name).toBe('LLMError');
      expect(error.type).toBe('timeout');
      expect(error.message).toBe('Request timed out');
      expect(error.retryable).toBe(true);
    });

    it('should default retryable to false', () => {
      const error = new LLMError('api_key_missing', 'No API key');
      expect(error.retryable).toBe(false);
    });
  });

  describe('streamChatCompletion', () => {
    const mockMessages: ConversationMessage[] = [
      { role: 'user', content: 'Hello' },
    ];
    const mockSystemPrompt = 'You are a helpful assistant.';

    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      // Reset fetch mock
      global.fetch = jest.fn();
    });

    it('should throw error when API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;

      const generator = streamChatCompletion(mockSystemPrompt, mockMessages);

      await expect(generator.next()).rejects.toThrow(LLMError);
      await expect(
        streamChatCompletion(mockSystemPrompt, mockMessages).next()
      ).rejects.toThrow('OpenAI API key is not configured');
    });

    it('should handle rate limit errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: () => Promise.resolve('Rate limited'),
      });

      const generator = streamChatCompletion(mockSystemPrompt, mockMessages);

      try {
        await generator.next();
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LLMError);
        expect((error as LLMError).type).toBe('rate_limit');
        expect((error as LLMError).retryable).toBe(true);
      }
    });

    it('should handle unauthorized errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Invalid API key'),
      });

      const generator = streamChatCompletion(mockSystemPrompt, mockMessages);

      try {
        await generator.next();
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LLMError);
        expect((error as LLMError).type).toBe('api_key_missing');
        expect((error as LLMError).retryable).toBe(false);
      }
    });

    it('should handle server errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      });

      const generator = streamChatCompletion(mockSystemPrompt, mockMessages);

      try {
        await generator.next();
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LLMError);
        expect((error as LLMError).type).toBe('server');
        expect((error as LLMError).retryable).toBe(true);
      }
    });

    it('should handle missing response body', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        body: null,
      });

      const generator = streamChatCompletion(mockSystemPrompt, mockMessages);

      try {
        await generator.next();
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LLMError);
        expect((error as LLMError).type).toBe('invalid_response');
      }
    });

    it('should stream chunks from successful response', async () => {
      // Create a mock readable stream
      const chunks = [
        'data: {"id":"1","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
        'data: {"id":"1","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}\n\n',
        'data: [DONE]\n\n',
      ];

      let chunkIndex = 0;
      const mockReader = {
        read: jest.fn().mockImplementation(() => {
          if (chunkIndex < chunks.length) {
            const chunk = chunks[chunkIndex++];
            return Promise.resolve({
              done: false,
              value: new TextEncoder().encode(chunk),
            });
          }
          return Promise.resolve({ done: true, value: undefined });
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        body: {
          getReader: () => mockReader,
        },
      });

      const generator = streamChatCompletion(mockSystemPrompt, mockMessages);
      const results: string[] = [];

      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toEqual(['Hello', ' world']);
    });

    it('should send correct request to OpenAI API', async () => {
      // Mock a simple response that ends immediately
      const mockReader = {
        read: jest.fn().mockResolvedValue({ done: true, value: undefined }),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        body: {
          getReader: () => mockReader,
        },
      });

      const generator = streamChatCompletion(mockSystemPrompt, mockMessages);
      // Consume the generator
      for await (const _ of generator) {
        // Just consume
      }

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          },
          body: expect.stringContaining('"stream":true'),
        })
      );

      // Verify the body contains correct messages
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.messages).toEqual([
        { role: 'system', content: mockSystemPrompt },
        { role: 'user', content: 'Hello' },
      ]);
    });
  });

  describe('getChatCompletion', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      global.fetch = jest.fn();
    });

    it('should return complete response as string', async () => {
      const chunks = [
        'data: {"id":"1","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
        'data: {"id":"1","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}\n\n',
        'data: {"id":"1","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":"stop"}]}\n\n',
        'data: [DONE]\n\n',
      ];

      let chunkIndex = 0;
      const mockReader = {
        read: jest.fn().mockImplementation(() => {
          if (chunkIndex < chunks.length) {
            const chunk = chunks[chunkIndex++];
            return Promise.resolve({
              done: false,
              value: new TextEncoder().encode(chunk),
            });
          }
          return Promise.resolve({ done: true, value: undefined });
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        body: {
          getReader: () => mockReader,
        },
      });

      const result = await getChatCompletion('System prompt', [
        { role: 'user', content: 'Hi' },
      ]);

      expect(result).toBe('Hello world!');
    });
  });
});
