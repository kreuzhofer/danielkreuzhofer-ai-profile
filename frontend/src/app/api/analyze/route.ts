/**
 * Fit Analysis API Route
 *
 * This API route handles job description analysis requests and returns
 * structured MatchAssessment responses using the LLM client.
 *
 * @see Requirements 2.1, 2.6, 6.1, 6.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildAnalysisPrompt } from '@/lib/fit-analysis-prompt';
import { parseAnalysisResponse } from '@/lib/fit-analysis-parser';
import { getChatCompletion, LLMError, LLMErrorType } from '@/lib/llm-client';
import type { AnalyzeRequest, AnalyzeResponse } from '@/types/fit-analysis';

// =============================================================================
// Constants
// =============================================================================

/**
 * Timeout for analysis requests in milliseconds (30 seconds)
 * @see Requirement 6.1 - 30 second timeout
 */
const ANALYSIS_TIMEOUT_MS = 30000;

/**
 * Error codes for API responses
 */
const ERROR_CODES = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  EMPTY_JOB_DESCRIPTION: 'EMPTY_JOB_DESCRIPTION',
  TIMEOUT: 'TIMEOUT',
  LLM_ERROR: 'LLM_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

/**
 * User-friendly error messages mapped by error type
 * These messages are safe to display to users and never expose technical details
 *
 * @see Requirement 6.3 - User-friendly error messages
 */
const USER_FRIENDLY_ERROR_MESSAGES: Record<LLMErrorType, string> = {
  network: 'Unable to connect. Please check your connection and try again.',
  timeout: 'The analysis is taking too long. Please try again.',
  server: 'Something went wrong on our end. Please try again.',
  rate_limit: 'Too many requests. Please wait a moment and try again.',
  invalid_response: 'Received an unexpected response. Please try again.',
  api_key_missing: 'Something went wrong on our end. Please try again.',
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create an error response with consistent structure
 */
function createErrorResponse(
  code: string,
  message: string,
  status: number
): NextResponse<AnalyzeResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

/**
 * Get a user-friendly error message for an LLM error type
 * Never exposes technical details or API keys
 */
function getUserFriendlyErrorMessage(errorType: LLMErrorType): string {
  return USER_FRIENDLY_ERROR_MESSAGES[errorType] || 'An unexpected error occurred. Please try again.';
}

/**
 * Validate the request body structure
 */
function validateRequest(body: unknown): body is AnalyzeRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const request = body as AnalyzeRequest;
  return typeof request.jobDescription === 'string';
}

/**
 * Check if job description is empty or whitespace-only
 */
function isEmptyJobDescription(jobDescription: string): boolean {
  return jobDescription.trim().length === 0;
}

/**
 * Execute analysis with timeout handling
 * @see Requirement 6.1 - 30 second timeout
 */
async function executeAnalysisWithTimeout(
  jobDescription: string
): Promise<string> {
  // Build the analysis prompt with portfolio context
  const prompt = await buildAnalysisPrompt(jobDescription);

  // Create a promise that rejects after timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new LLMError('timeout', 'Analysis timed out after 30 seconds', true));
    }, ANALYSIS_TIMEOUT_MS);
  });

  // Race between the LLM call and timeout
  // Use getChatCompletion for non-streaming response
  const analysisPromise = getChatCompletion(
    prompt,
    [{ role: 'user', content: 'Please analyze this job description and provide your assessment in the JSON format specified.' }],
    { timeout: ANALYSIS_TIMEOUT_MS }
  );

  return Promise.race([analysisPromise, timeoutPromise]);
}

// =============================================================================
// Route Handler
// =============================================================================

/**
 * POST /api/analyze
 *
 * Accepts a job description and returns a structured MatchAssessment.
 *
 * Request body:
 * - jobDescription: string (required, non-empty)
 *
 * Response:
 * - success: true, assessment: MatchAssessment (on success)
 * - success: false, error: { code, message } (on error)
 *
 * Error codes:
 * - INVALID_REQUEST (400): Invalid request format
 * - EMPTY_JOB_DESCRIPTION (400): Empty or whitespace-only job description
 * - TIMEOUT (504): Analysis took longer than 30 seconds
 * - LLM_ERROR (500): LLM service error
 * - PARSE_ERROR (500): Failed to parse LLM response
 * - INTERNAL_ERROR (500): Unexpected server error
 *
 * @see Requirement 2.1 - Process request and generate MatchAssessment
 * @see Requirement 2.6 - Complete analysis within time limit
 * @see Requirement 6.1 - 30 second timeout handling
 * @see Requirement 6.3 - User-friendly error messages
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      console.error('Analyze API JSON parse error');
      return createErrorResponse(
        ERROR_CODES.INVALID_REQUEST,
        'Invalid request format',
        400
      );
    }

    // Validate request structure
    if (!validateRequest(body)) {
      return createErrorResponse(
        ERROR_CODES.INVALID_REQUEST,
        'Invalid request format. Expected { jobDescription: string }',
        400
      );
    }

    const { jobDescription } = body;

    // Validate job description is not empty
    // @see Requirement 2.3 - Prevent submission of empty/whitespace-only input
    if (isEmptyJobDescription(jobDescription)) {
      return createErrorResponse(
        ERROR_CODES.EMPTY_JOB_DESCRIPTION,
        'Please enter a job description to analyze.',
        400
      );
    }

    // Execute analysis with timeout handling
    let llmResponse: string;
    try {
      llmResponse = await executeAnalysisWithTimeout(jobDescription);
    } catch (error) {
      if (error instanceof LLMError) {
        // Handle timeout specifically
        // @see Requirement 6.1 - 30 second timeout
        if (error.type === 'timeout') {
          console.error('Analyze API timeout');
          return createErrorResponse(
            ERROR_CODES.TIMEOUT,
            'The analysis is taking too long. Please try again.',
            504
          );
        }

        // Handle other LLM errors
        // @see Requirement 6.3 - User-friendly error messages
        console.error(`Analyze API LLM error [${error.type}]:`, error.message);
        return createErrorResponse(
          ERROR_CODES.LLM_ERROR,
          getUserFriendlyErrorMessage(error.type),
          500
        );
      }

      // Handle unexpected errors
      console.error('Analyze API unexpected error during LLM call:', error);
      return createErrorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        'Something went wrong on our end. Please try again.',
        500
      );
    }

    // Parse the LLM response into MatchAssessment
    const parseResult = parseAnalysisResponse(llmResponse, { jobDescription });

    if (!parseResult.success) {
      console.error('Analyze API parse error:', parseResult.error);
      return createErrorResponse(
        ERROR_CODES.PARSE_ERROR,
        'Received an unexpected response. Please try again.',
        500
      );
    }

    // Return successful response
    // @see Requirement 2.1 - Generate MatchAssessment
    return NextResponse.json({
      success: true,
      assessment: parseResult.assessment,
    });

  } catch (error) {
    // Handle any unexpected errors
    // SECURITY: Log for debugging but return generic message to client
    console.error('Analyze API error:', error instanceof Error ? error.message : 'Unknown error');

    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Something went wrong on our end. Please try again.',
      500
    );
  }
}
