/**
 * Suggestions API Route Tests
 *
 * @jest-environment node
 */

// Mock the LLM client
const mockGetChatCompletion = jest.fn();
jest.mock('@/lib/llm-client', () => ({
  getChatCompletion: (...args: unknown[]) => mockGetChatCompletion(...args),
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    time: () => jest.fn(),
  }),
}));

// Mock the API security helpers (rate limit + bounds)
const mockSuggestionsLimiterCheck = jest.fn().mockReturnValue(true);
jest.mock('@/lib/api-security', () => ({
  clientIp: () => '127.0.0.1',
  suggestionsLimiter: { check: (...args: unknown[]) => mockSuggestionsLimiterCheck(...args) },
  MAX_MESSAGES: 20,
  MAX_MESSAGE_LENGTH: 8192,
  validateMessageBounds: (messages: Array<{ content: string }>) => {
    if (messages.length > 20) return 'Too many messages (max 20).';
    for (const m of messages) {
      if (typeof m.content !== 'string') return 'Invalid message content.';
      if (m.content.length > 8192) return 'Message too long (max 8192 characters).';
    }
    return null;
  },
}));

// Mock portfolio owner (imported by the route for the prompt)
jest.mock('@/lib/portfolio-owner', () => ({
  PORTFOLIO_OWNER: { name: 'Daniel', role: 'Architect', employer: 'AWS' },
}));

// Mock NextRequest
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

jest.mock('next/server', () => ({
  NextRequest: MockNextRequest,
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  },
}));

import { POST } from './route';

function createRequest(body: unknown): MockNextRequest {
  return new MockNextRequest('http://localhost:3000/api/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/suggestions', () => {
  beforeEach(() => {
    mockGetChatCompletion.mockReset();
    mockSuggestionsLimiterCheck.mockReset();
    mockSuggestionsLimiterCheck.mockReturnValue(true);
    mockGetChatCompletion.mockResolvedValue(JSON.stringify({ suggestions: ['q1', 'q2', 'q3'] }));
  });

  describe('Rate Limiting (VULN-002)', () => {
    it('should return 429 when the per-IP suggestions rate limit is exceeded', async () => {
      mockSuggestionsLimiterCheck.mockReturnValue(false);
      const request = createRequest({ messages: [{ role: 'user', content: 'Hello' }] });
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(429);
      expect(mockGetChatCompletion).not.toHaveBeenCalled();
    });

    it('should allow requests when under the rate limit', async () => {
      const request = createRequest({ messages: [{ role: 'user', content: 'Hello' }] });
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);
      expect(response.status).toBe(200);
    });
  });

  describe('Payload Bounds (VULN-002)', () => {
    it('should return 400 when messages exceed MAX_MESSAGES', async () => {
      const tooMany = Array.from({ length: 21 }, () => ({ role: 'user', content: 'x' }));
      const request = createRequest({ messages: tooMany });
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);
      expect(response.status).toBe(400);
      expect(mockGetChatCompletion).not.toHaveBeenCalled();
    });

    it('should return 400 when a message exceeds MAX_MESSAGE_LENGTH', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'x'.repeat(8193) }],
      });
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);
      expect(response.status).toBe(400);
      expect(mockGetChatCompletion).not.toHaveBeenCalled();
    });
  });
});
