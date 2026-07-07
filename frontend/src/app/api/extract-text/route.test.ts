/**
 * Text Extraction API Route Tests
 *
 * @jest-environment node
 */

const mockExtractTextFromFile = jest.fn();
const mockMaxFileSize = 10 * 1024 * 1024;
jest.mock('@/lib/file-text-extractor', () => ({
  extractTextFromFile: (...args: unknown[]) => mockExtractTextFromFile(...args),
  MAX_FILE_SIZE: mockMaxFileSize,
}));

jest.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    time: () => jest.fn(),
  }),
}));

// Mock the API security helpers (rate limit for VULN-002)
const mockExtractTextLimiterCheck = jest.fn().mockReturnValue(true);
jest.mock('@/lib/api-security', () => ({
  clientIp: () => '127.0.0.1',
  extractTextLimiter: { check: (...args: unknown[]) => mockExtractTextLimiterCheck(...args) },
}));

class MockNextRequest {
  public method: string;
  public headers: Map<string, string>;
  private formDataFn: () => Promise<FormData>;

  constructor(_url: string, init?: { method?: string; headers?: Record<string, string>; formData?: () => Promise<FormData> }) {
    this.method = init?.method || 'GET';
    this.headers = new Map(Object.entries(init?.headers || {}));
    this.formDataFn = init?.formData ?? (async () => new FormData());
  }

  async formData() {
    return this.formDataFn();
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

function createRequestWithFile(file: File | null): MockNextRequest {
  const fd = new FormData();
  if (file) fd.append('file', file);
  return new MockNextRequest('http://localhost:3000/api/extract-text', {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    formData: async () => fd,
  });
}

function makeFile(content: string, name = 'test.txt', type = 'text/plain'): File {
  return new File([content], name, { type });
}

describe('POST /api/extract-text', () => {
  beforeEach(() => {
    mockExtractTextFromFile.mockReset();
    mockExtractTextLimiterCheck.mockReset();
    mockExtractTextLimiterCheck.mockReturnValue(true);
    mockExtractTextFromFile.mockResolvedValue({ success: true, text: 'extracted text' });
  });

  describe('Rate Limiting (VULN-002)', () => {
    it('should return 429 when the per-IP extract-text rate limit is exceeded', async () => {
      mockExtractTextLimiterCheck.mockReturnValue(false);
      const request = createRequestWithFile(makeFile('hello'));
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(429);
      expect(mockExtractTextFromFile).not.toHaveBeenCalled();
    });

    it('should allow requests when under the rate limit', async () => {
      const request = createRequestWithFile(makeFile('hello'));
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);
      expect(response.status).toBe(200);
    });
  });
});
