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
import { createLogger } from '@/lib/logger';
import type { AnalyzeRequest, AnalyzeResponse } from '@/types/fit-analysis';

const log = createLogger('AnalyzeAPI');

// =============================================================================
// Constants
// =============================================================================

/**
 * Timeout for analysis requests in milliseconds (60 seconds)
 * Increased from 30s to accommodate longer job descriptions and model response times
 * @see Requirement 6.1 - timeout handling
 */
const ANALYSIS_TIMEOUT_MS = 60000;

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
 * @see Requirement 6.1 - timeout handling
 */
async function executeAnalysisWithTimeout(
  jobDescription: string
): Promise<string> {
  const endTiming = log.time('Analysis execution');
  
  log.info('Building analysis prompt', { 
    jobDescriptionLength: jobDescription.length 
  });
  
  // Build the analysis prompt with portfolio context
  const promptStartTime = Date.now();
  const prompt = await buildAnalysisPrompt(jobDescription);
  log.debug('Prompt built', { 
    promptLength: prompt.length,
    buildTimeMs: Date.now() - promptStartTime 
  });

  // Create a promise that rejects after timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      log.warn('Analysis timeout reached', { timeoutMs: ANALYSIS_TIMEOUT_MS });
      reject(new LLMError('timeout', `Analysis timed out after ${ANALYSIS_TIMEOUT_MS / 1000} seconds`, true));
    }, ANALYSIS_TIMEOUT_MS);
  });

  log.info('Calling LLM for analysis');
  
  // Race between the LLM call and timeout
  // Use getChatCompletion for non-streaming response
  const analysisPromise = getChatCompletion(
    prompt,
    [{ role: 'user', content: 'Please analyze this job description and provide your assessment in the JSON format specified.' }],
    { timeout: ANALYSIS_TIMEOUT_MS }
  );

  const result = await Promise.race([analysisPromise, timeoutPromise]);
  
  endTiming();
  log.info('LLM response received', { responseLength: result.length });
  
  return result;
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
  const requestId = Math.random().toString(36).substring(7);
  log.info('Analysis request received', { requestId });
  
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      log.warn('JSON parse error', { requestId });
      return createErrorResponse(
        ERROR_CODES.INVALID_REQUEST,
        'Invalid request format',
        400
      );
    }

    // Validate request structure
    if (!validateRequest(body)) {
      log.warn('Invalid request structure', { requestId });
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
      log.warn('Empty job description submitted', { requestId });
      return createErrorResponse(
        ERROR_CODES.EMPTY_JOB_DESCRIPTION,
        'Please enter a job description to analyze.',
        400
      );
    }

    log.info('Starting analysis', { 
      requestId, 
      jobDescriptionLength: jobDescription.length 
    });

    // Execute analysis with timeout handling
    let llmResponse: string;
    try {
      llmResponse = await executeAnalysisWithTimeout(jobDescription);
    } catch (error) {
      if (error instanceof LLMError) {
        // Handle timeout specifically
        // @see Requirement 6.1 - timeout handling
        if (error.type === 'timeout') {
          log.error('Analysis timeout', error, { requestId });
          return createErrorResponse(
            ERROR_CODES.TIMEOUT,
            'The analysis is taking too long. Please try again.',
            504
          );
        }

        // Handle other LLM errors
        // @see Requirement 6.3 - User-friendly error messages
        log.error(`LLM error [${error.type}]`, error, { requestId });
        return createErrorResponse(
          ERROR_CODES.LLM_ERROR,
          getUserFriendlyErrorMessage(error.type),
          500
        );
      }

      // Handle unexpected errors
      log.error('Unexpected error during LLM call', error, { requestId });
      return createErrorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        'Something went wrong on our end. Please try again.',
        500
      );
    }

    // Parse the LLM response into MatchAssessment
    log.debug('Parsing LLM response', { requestId, responseLength: llmResponse.length });
    const parseResult = parseAnalysisResponse(llmResponse, { jobDescription });

    if (!parseResult.success) {
      log.error('Parse error', new Error(parseResult.error), { 
        requestId,
        responsePreview: llmResponse.substring(0, 200) 
      });
      return createErrorResponse(
        ERROR_CODES.PARSE_ERROR,
        'Received an unexpected response. Please try again.',
        500
      );
    }

    log.info('Analysis completed successfully', { 
      requestId,
      confidence: parseResult.assessment.confidenceScore,
      alignmentsCount: parseResult.assessment.alignmentAreas.length,
      gapsCount: parseResult.assessment.gapAreas.length
    });

    // Return successful response
    // @see Requirement 2.1 - Generate MatchAssessment
    return NextResponse.json({
      success: true,
      assessment: parseResult.assessment,
    });

  } catch (error) {
    // Handle any unexpected errors
    // SECURITY: Log for debugging but return generic message to client
    log.error('Unexpected error', error, { requestId });

    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Something went wrong on our end. Please try again.',
      500
    );
  }
}
