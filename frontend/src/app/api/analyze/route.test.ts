/**
 * Fit Analysis API Route Tests
 *
 * Tests for the POST /api/analyze endpoint.
 *
 * @see Requirements 2.1, 6.1, 6.3
 * @jest-environment node
 */

import type { AnalyzeRequest, AnalyzeResponse, MatchAssessment } from '@/types/fit-analysis';

// =============================================================================
// Mocks
// =============================================================================

// Mock the fit analysis prompt builder
jest.mock('@/lib/fit-analysis-prompt', () => ({
  buildAnalysisPrompt: jest.fn().mockResolvedValue('Test analysis prompt with portfolio context'),
}));

// Mock the logger to avoid console output during tests
jest.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    time: () => jest.fn(),
  }),
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    time: () => jest.fn(),
  },
}));

// Mock the LLM client
const mockGetChatCompletion = jest.fn();
jest.mock('@/lib/llm-client', () => ({
  getChatCompletion: (...args: unknown[]) => mockGetChatCompletion(...args),
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

// Mock the fit analysis parser
const mockParseAnalysisResponse = jest.fn();
jest.mock('@/lib/fit-analysis-parser', () => ({
  parseAnalysisResponse: (...args: unknown[]) => mockParseAnalysisResponse(...args),
}));

// Mock NextRequest for testing
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

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Helper to create a mock request with JSON body
 */
function createRequest(body: unknown): MockNextRequest {
  return new MockNextRequest('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * Create a mock MatchAssessment for testing
 */
function createMockAssessment(overrides?: Partial<MatchAssessment>): MatchAssessment {
  return {
    id: 'test-assessment-id',
    timestamp: new Date('2024-01-15T10:00:00Z'),
    jobDescriptionPreview: 'Senior Software Engineer with 5+ years...',
    confidenceScore: 'partial_match',
    alignmentAreas: [
      {
        id: 'align-1',
        title: 'TypeScript Experience',
        description: 'Strong background in TypeScript development',
        evidence: [
          {
            type: 'project',
            title: 'Portfolio Website',
            reference: 'portfolio-site',
            excerpt: 'Built with Next.js and TypeScript',
          },
        ],
      },
    ],
    gapAreas: [
      {
        id: 'gap-1',
        title: 'Machine Learning',
        description: 'No documented ML experience',
        severity: 'moderate',
      },
    ],
    recommendation: {
      type: 'consider',
      summary: 'Worth exploring if ML is not a core requirement',
      details: 'Strong technical foundation but lacks specific ML experience mentioned in the role.',
    },
    ...overrides,
  };
}

/**
 * Create a valid LLM response JSON string
 */
function createValidLLMResponse(): string {
  return JSON.stringify({
    confidence: 'partial',
    alignments: [
      {
        area: 'TypeScript Experience',
        explanation: 'Strong background in TypeScript development',
        evidence: [
          { source: 'Portfolio Website', detail: 'Built with Next.js and TypeScript' },
        ],
      },
    ],
    gaps: [
      {
        area: 'Machine Learning',
        explanation: 'No documented ML experience',
        severity: 'moderate',
      },
    ],
    recommendation: {
      verdict: 'consider',
      summary: 'Worth exploring if ML is not a core requirement',
      reasoning: 'Strong technical foundation but lacks specific ML experience mentioned in the role.',
    },
  });
}

// =============================================================================
// Tests
// =============================================================================

describe('POST /api/analyze', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementations
    mockGetChatCompletion.mockResolvedValue(createValidLLMResponse());
    mockParseAnalysisResponse.mockReturnValue({
      success: true,
      assessment: createMockAssessment(),
    });
  });

  // ===========================================================================
  // 1. Successful Analysis Tests
  // ===========================================================================

  describe('Successful Analysis', () => {
    it('should return 200 with assessment for valid job description', async () => {
      const requestBody: AnalyzeRequest = {
        jobDescription: 'Senior Software Engineer with 5+ years of experience in TypeScript and React.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(true);
      expect(body.assessment).toBeDefined();
      expect(body.assessment?.confidenceScore).toBe('partial_match');
      expect(body.assessment?.alignmentAreas).toHaveLength(1);
      expect(body.assessment?.gapAreas).toHaveLength(1);
      expect(body.assessment?.recommendation).toBeDefined();
    });

    it('should call buildAnalysisPrompt with job description', async () => {
      const { buildAnalysisPrompt } = require('@/lib/fit-analysis-prompt');
      
      const jobDescription = 'Full Stack Developer position requiring Node.js expertise.';
      const requestBody: AnalyzeRequest = { jobDescription };
      const request = createRequest(requestBody);
      
      await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(buildAnalysisPrompt).toHaveBeenCalledWith(jobDescription);
    });

    it('should call getChatCompletion with built prompt', async () => {
      const requestBody: AnalyzeRequest = {
        jobDescription: 'Backend Engineer with Python experience.',
      };
      const request = createRequest(requestBody);
      
      await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(mockGetChatCompletion).toHaveBeenCalledWith(
        'Test analysis prompt with portfolio context',
        expect.arrayContaining([
          expect.objectContaining({ role: 'user' }),
        ]),
        expect.objectContaining({ timeout: 60000 })
      );
    });

    it('should call parseAnalysisResponse with LLM output and job description', async () => {
      const jobDescription = 'DevOps Engineer with AWS experience.';
      const requestBody: AnalyzeRequest = { jobDescription };
      const request = createRequest(requestBody);
      
      await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(mockParseAnalysisResponse).toHaveBeenCalledWith(
        createValidLLMResponse(),
        expect.objectContaining({ jobDescription })
      );
    });
  });

  // ===========================================================================
  // 2. Invalid Request Format Tests
  // ===========================================================================

  describe('Invalid Request Format', () => {
    it('should return 400 for missing jobDescription field', async () => {
      const request = createRequest({ invalid: 'body' });
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('INVALID_REQUEST');
      expect(body.error?.message).toContain('Invalid request format');
    });

    it('should return 400 for non-string jobDescription', async () => {
      const request = createRequest({ jobDescription: 12345 });
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('INVALID_REQUEST');
    });

    it('should return 400 for null body', async () => {
      const request = createRequest(null);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('INVALID_REQUEST');
    });

    it('should return 400 for array body', async () => {
      const request = createRequest(['not', 'an', 'object']);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('INVALID_REQUEST');
    });
  });

  // ===========================================================================
  // 3. Empty Job Description Tests
  // ===========================================================================

  describe('Empty Job Description', () => {
    it('should return 400 with EMPTY_JOB_DESCRIPTION code for empty string', async () => {
      const requestBody: AnalyzeRequest = { jobDescription: '' };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('EMPTY_JOB_DESCRIPTION');
      expect(body.error?.message).toContain('Please enter a job description');
    });

    it('should return 400 for whitespace-only job description (spaces)', async () => {
      const requestBody: AnalyzeRequest = { jobDescription: '     ' };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('EMPTY_JOB_DESCRIPTION');
    });

    it('should return 400 for whitespace-only job description (tabs and newlines)', async () => {
      const requestBody: AnalyzeRequest = { jobDescription: '\t\n\r\n\t  ' };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('EMPTY_JOB_DESCRIPTION');
    });
  });

  // ===========================================================================
  // 4. LLM Timeout Tests
  // ===========================================================================

  describe('LLM Timeout', () => {
    it('should return 504 with TIMEOUT code when LLM times out', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      mockGetChatCompletion.mockRejectedValue(
        new LLMError('timeout', 'Analysis timed out after 60 seconds', true)
      );

      const requestBody: AnalyzeRequest = {
        jobDescription: 'Senior Engineer position with complex requirements.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(504);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('TIMEOUT');
      expect(body.error?.message).toContain('taking too long');
    });
  });

  // ===========================================================================
  // 5. LLM Network Error Tests
  // ===========================================================================

  describe('LLM Network Error', () => {
    it('should return 500 with LLM_ERROR code for network errors', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      mockGetChatCompletion.mockRejectedValue(
        new LLMError('network', 'Unable to connect to the AI service', true)
      );

      const requestBody: AnalyzeRequest = {
        jobDescription: 'Frontend Developer with React experience.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('LLM_ERROR');
      expect(body.error?.message).toContain('Unable to connect');
    });

    it('should not expose internal network error details', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      mockGetChatCompletion.mockRejectedValue(
        new LLMError('network', 'ECONNREFUSED 127.0.0.1:443 - internal details', true)
      );

      const requestBody: AnalyzeRequest = {
        jobDescription: 'Backend Developer position.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const body: AnalyzeResponse = await response.json();
      expect(body.error?.message).not.toContain('ECONNREFUSED');
      expect(body.error?.message).not.toContain('127.0.0.1');
    });
  });

  // ===========================================================================
  // 6. LLM Server Error Tests
  // ===========================================================================

  describe('LLM Server Error', () => {
    it('should return 500 with LLM_ERROR code for server errors', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      mockGetChatCompletion.mockRejectedValue(
        new LLMError('server', 'OpenAI service is temporarily unavailable', true)
      );

      const requestBody: AnalyzeRequest = {
        jobDescription: 'Data Engineer with SQL expertise.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('LLM_ERROR');
      expect(body.error?.message).toContain('Something went wrong');
    });

    it('should return user-friendly message for rate limit errors', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      mockGetChatCompletion.mockRejectedValue(
        new LLMError('rate_limit', 'Rate limit exceeded - internal', true)
      );

      const requestBody: AnalyzeRequest = {
        jobDescription: 'Product Manager role.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.error?.code).toBe('LLM_ERROR');
      expect(body.error?.message).toContain('Too many requests');
    });

    it('should not expose API key errors to users', async () => {
      const { LLMError } = require('@/lib/llm-client');
      
      mockGetChatCompletion.mockRejectedValue(
        new LLMError('api_key_missing', 'OPENAI_API_KEY not set - should not be shown', false)
      );

      const requestBody: AnalyzeRequest = {
        jobDescription: 'Security Engineer position.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const body: AnalyzeResponse = await response.json();
      expect(body.error?.message).not.toContain('API');
      expect(body.error?.message).not.toContain('key');
      expect(body.error?.message).not.toContain('OPENAI');
      expect(body.error?.message).toBe('Something went wrong on our end. Please try again.');
    });

    it('should handle generic errors without exposing details', async () => {
      mockGetChatCompletion.mockRejectedValue(
        new Error('Internal stack trace with sensitive info')
      );

      const requestBody: AnalyzeRequest = {
        jobDescription: 'QA Engineer role.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.error?.message).not.toContain('stack trace');
      expect(body.error?.message).not.toContain('sensitive');
      expect(body.error?.message).toBe('Something went wrong on our end. Please try again.');
    });
  });

  // ===========================================================================
  // 7. Parse Error Tests (Malformed LLM Response)
  // ===========================================================================

  describe('Parse Error (Malformed LLM Response)', () => {
    it('should return 500 with PARSE_ERROR code when parser fails', async () => {
      mockParseAnalysisResponse.mockReturnValue({
        success: false,
        error: 'Invalid JSON structure: missing confidence field',
      });

      const requestBody: AnalyzeRequest = {
        jobDescription: 'Software Architect with cloud experience.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('PARSE_ERROR');
      expect(body.error?.message).toContain('unexpected response');
    });

    it('should not expose parse error details to users', async () => {
      mockParseAnalysisResponse.mockReturnValue({
        success: false,
        error: 'JSON.parse failed at position 42: unexpected token',
      });

      const requestBody: AnalyzeRequest = {
        jobDescription: 'Mobile Developer with iOS experience.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const body: AnalyzeResponse = await response.json();
      expect(body.error?.message).not.toContain('JSON.parse');
      expect(body.error?.message).not.toContain('position 42');
      expect(body.error?.message).toBe('Received an unexpected response. Please try again.');
    });
  });

  // ===========================================================================
  // 8. Edge Cases
  // ===========================================================================

  describe('Edge Cases', () => {
    it('should handle very long job descriptions', async () => {
      const longDescription = 'A'.repeat(5000);
      const requestBody: AnalyzeRequest = { jobDescription: longDescription };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(true);
    });

    it('should handle job description with special characters', async () => {
      const requestBody: AnalyzeRequest = {
        jobDescription: 'Engineer with C++ & C# experience. Salary: $150k-$200k. Email: jobs@company.com',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(true);
    });

    it('should handle job description with unicode characters', async () => {
      const requestBody: AnalyzeRequest = {
        jobDescription: 'Développeur Senior avec expérience en 日本語 and 中文',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(true);
    });

    it('should trim leading/trailing whitespace but process valid content', async () => {
      const requestBody: AnalyzeRequest = {
        jobDescription: '   Valid job description with surrounding whitespace   ',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      
      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(true);
    });
  });

  // ===========================================================================
  // 9. Response Structure Validation
  // ===========================================================================

  describe('Response Structure', () => {
    it('should return proper JSON content type', async () => {
      const requestBody: AnalyzeRequest = {
        jobDescription: 'Test job description for content type check.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should include all required assessment fields on success', async () => {
      const requestBody: AnalyzeRequest = {
        jobDescription: 'Complete job description for structure validation.',
      };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(true);
      expect(body.assessment).toBeDefined();
      
      const assessment = body.assessment!;
      expect(assessment.id).toBeDefined();
      expect(assessment.timestamp).toBeDefined();
      expect(assessment.jobDescriptionPreview).toBeDefined();
      expect(assessment.confidenceScore).toBeDefined();
      expect(assessment.alignmentAreas).toBeDefined();
      expect(assessment.gapAreas).toBeDefined();
      expect(assessment.recommendation).toBeDefined();
    });

    it('should include error code and message on failure', async () => {
      const requestBody: AnalyzeRequest = { jobDescription: '' };
      const request = createRequest(requestBody);
      const response = await POST(request as unknown as Parameters<typeof POST>[0]);

      const body: AnalyzeResponse = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
      expect(body.error?.code).toBeDefined();
      expect(body.error?.message).toBeDefined();
      expect(typeof body.error?.code).toBe('string');
      expect(typeof body.error?.message).toBe('string');
    });
  });
});
