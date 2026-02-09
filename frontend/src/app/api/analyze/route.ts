/**
 * Fit Analysis API Route with Streaming Progress
 *
 * This API route handles job description analysis requests and returns
 * structured MatchAssessment responses using the LLM client.
 * Supports SSE streaming for progress updates.
 *
 * @see Requirements 2.1, 2.6, 6.1, 6.3
 */

import { NextRequest } from 'next/server';
import { buildAnalysisPrompt } from '@/lib/fit-analysis-prompt';
import { parseAnalysisResponse } from '@/lib/fit-analysis-parser';
import { streamChatCompletion, LLMError, LLMErrorType } from '@/lib/llm-client';
import { createLogger } from '@/lib/logger';
import type { AnalyzeRequest, AnalysisPhase } from '@/types/fit-analysis';
import {
  GuardrailsService,
  FIT_ANALYSIS_GUARDRAIL_CONFIG,
} from '@/lib/guardrails/guardrails-service';
import { createAnonymizedRequestId } from '@/lib/guardrails/security-logger';

const log = createLogger('AnalyzeAPI');

// =============================================================================
// Constants
// =============================================================================

/**
 * Timeout for analysis requests in milliseconds (60 seconds)
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
  GUARDRAIL_BLOCKED: 'GUARDRAIL_BLOCKED',
} as const;

/**
 * User-friendly error messages mapped by error type
 */
const USER_FRIENDLY_ERROR_MESSAGES: Record<LLMErrorType, string> = {
  network: 'Unable to connect. Please check your connection and try again.',
  timeout: 'The analysis is taking too long. Please try again.',
  server: 'Something went wrong on our end. Please try again.',
  rate_limit: 'Too many requests. Please wait a moment and try again.',
  invalid_response: 'Received an unexpected response. Please try again.',
  api_key_missing: 'Something went wrong on our end. Please try again.',
};

/**
 * Phase detection markers in the LLM response
 */
const PHASE_MARKERS: { marker: string; phase: AnalysisPhase }[] = [
  { marker: '"confidence"', phase: 'analyzing' },
  { marker: '"alignments"', phase: 'finding_alignments' },
  { marker: '"gaps"', phase: 'identifying_gaps' },
  { marker: '"recommendation"', phase: 'generating_recommendation' },
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create an SSE-formatted message
 */
function createSSEMessage(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * Get a user-friendly error message for an LLM error type
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
 * Detect the current analysis phase based on accumulated response content
 */
function detectPhase(content: string, currentPhase: AnalysisPhase): AnalysisPhase {
  // Check markers in order - return the latest matching phase
  let detectedPhase = currentPhase;
  
  for (const { marker, phase } of PHASE_MARKERS) {
    if (content.includes(marker)) {
      detectedPhase = phase;
    }
  }
  
  return detectedPhase;
}

// =============================================================================
// Route Handler
// =============================================================================

/**
 * POST /api/analyze
 *
 * Accepts a job description and returns a streaming response with progress
 * updates followed by the final MatchAssessment.
 *
 * SSE Message Types:
 * - { type: 'progress', phase: string, message: string, percent: number }
 * - { type: 'complete', assessment: MatchAssessment }
 * - { type: 'error', code: string, message: string }
 */
export async function POST(request: NextRequest): Promise<Response> {
  const requestId = Math.random().toString(36).substring(7);
  log.info('Analysis request received', { requestId });

  // Parse and validate request
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    log.warn('JSON parse error', { requestId });
    return new Response(
      createSSEMessage({ type: 'error', code: ERROR_CODES.INVALID_REQUEST, message: 'Invalid request format' }),
      { status: 400, headers: { 'Content-Type': 'text/event-stream' } }
    );
  }

  if (!validateRequest(body)) {
    log.warn('Invalid request structure', { requestId });
    return new Response(
      createSSEMessage({ type: 'error', code: ERROR_CODES.INVALID_REQUEST, message: 'Invalid request format. Expected { jobDescription: string }' }),
      { status: 400, headers: { 'Content-Type': 'text/event-stream' } }
    );
  }

  const { jobDescription } = body;

  if (isEmptyJobDescription(jobDescription)) {
    log.warn('Empty job description submitted', { requestId });
    return new Response(
      createSSEMessage({ type: 'error', code: ERROR_CODES.EMPTY_JOB_DESCRIPTION, message: 'Please enter a job description to analyze.' }),
      { status: 400, headers: { 'Content-Type': 'text/event-stream' } }
    );
  }

  // Validate input against guardrails
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    const guardrailsService = new GuardrailsService(apiKey, 'fit_analysis');
    const anonymizedRequestId = createAnonymizedRequestId(request);
    
    const validationResult = await guardrailsService.validateInput(
      jobDescription,
      FIT_ANALYSIS_GUARDRAIL_CONFIG,
      anonymizedRequestId
    );

    if (!validationResult.passed) {
      log.warn('Guardrails blocked input', { requestId, failedCheck: validationResult.failedCheck });
      return new Response(
        createSSEMessage({ 
          type: 'error', 
          code: ERROR_CODES.GUARDRAIL_BLOCKED, 
          message: validationResult.userMessage 
        }),
        { status: 400, headers: { 'Content-Type': 'text/event-stream' } }
      );
    }
  }

  log.info('Starting streaming analysis', { requestId, jobDescriptionLength: jobDescription.length });

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let currentPhase: AnalysisPhase = 'preparing';
      let accumulatedContent = '';

      const sendProgress = (phase: AnalysisPhase) => {
        const phaseConfig: Record<AnalysisPhase, { message: string; percent: number }> = {
          preparing: { message: 'Preparing analysis...', percent: 5 },
          analyzing: { message: 'Analyzing fit...', percent: 20 },
          finding_alignments: { message: 'Finding alignments...', percent: 40 },
          identifying_gaps: { message: 'Identifying gaps...', percent: 60 },
          generating_recommendation: { message: 'Generating recommendation...', percent: 80 },
          finalizing: { message: 'Finalizing results...', percent: 95 },
        };
        
        const config = phaseConfig[phase];
        controller.enqueue(encoder.encode(
          createSSEMessage({ type: 'progress', phase, message: config.message, percent: config.percent })
        ));
      };

      try {
        // Send initial progress
        sendProgress('preparing');

        // Build the analysis prompt
        const endPromptTiming = log.time('Prompt building');
        const prompt = await buildAnalysisPrompt(jobDescription);
        endPromptTiming();

        log.info('Calling LLM for streaming analysis', { requestId });

        // Stream the LLM response and detect phases
        const messages = [{ 
          role: 'user' as const, 
          content: 'Please analyze this job description and provide your assessment in the JSON format specified.' 
        }];

        for await (const chunk of streamChatCompletion(prompt, messages, { timeout: ANALYSIS_TIMEOUT_MS, responseFormat: 'json_object' })) {
          accumulatedContent += chunk;
          
          // Detect phase changes
          const newPhase = detectPhase(accumulatedContent, currentPhase);
          if (newPhase !== currentPhase) {
            currentPhase = newPhase;
            sendProgress(currentPhase);
            log.debug('Phase changed', { requestId, phase: currentPhase });
          }
        }

        // Send finalizing progress
        sendProgress('finalizing');

        log.info('LLM response complete, parsing', { requestId, responseLength: accumulatedContent.length });

        // Parse the complete response
        const parseResult = parseAnalysisResponse(accumulatedContent, { jobDescription });

        if (!parseResult.success) {
          log.error('Parse error', new Error(parseResult.error), { 
            requestId,
            responsePreview: accumulatedContent.substring(0, 200) 
          });
          controller.enqueue(encoder.encode(
            createSSEMessage({ type: 'error', code: ERROR_CODES.PARSE_ERROR, message: 'Received an unexpected response. Please try again.' })
          ));
          controller.close();
          return;
        }

        log.info('Analysis completed successfully', { 
          requestId,
          confidence: parseResult.assessment!.confidenceScore,
          alignmentsCount: parseResult.assessment!.alignmentAreas.length,
          gapsCount: parseResult.assessment!.gapAreas.length
        });

        // Send the complete assessment
        controller.enqueue(encoder.encode(
          createSSEMessage({ type: 'complete', assessment: parseResult.assessment })
        ));
        controller.close();

      } catch (error) {
        log.error('Analysis error', error, { requestId });

        let errorCode: string = ERROR_CODES.INTERNAL_ERROR;
        let errorMessage = 'Something went wrong on our end. Please try again.';

        if (error instanceof LLMError) {
          if (error.type === 'timeout') {
            errorCode = ERROR_CODES.TIMEOUT;
            errorMessage = 'The analysis is taking too long. Please try again.';
          } else {
            errorCode = ERROR_CODES.LLM_ERROR;
            errorMessage = getUserFriendlyErrorMessage(error.type);
          }
        }

        controller.enqueue(encoder.encode(
          createSSEMessage({ type: 'error', code: errorCode, message: errorMessage })
        ));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
