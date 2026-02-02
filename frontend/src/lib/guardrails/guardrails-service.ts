/**
 * GuardrailsService - Main service for validating inputs and outputs against safety policies
 */

import OpenAI from 'openai';
import {
  jailbreak,
  moderationCheck,
  topicalAlignment,
  Category,
} from '@openai/guardrails';
import {
  GuardrailCheckType,
  GuardrailCheckResult,
  GuardrailValidationResult,
  GuardrailConfig,
  TopicScope,
} from './types';
import { getRejectionMessage } from './messages';
import { logSecurityEvent } from './security-logger';
import { createLogger } from '../logger';

const log = createLogger('GuardrailsService');

/**
 * Predefined configuration for Chat API guardrails
 */
export const CHAT_GUARDRAIL_CONFIG: GuardrailConfig = {
  enabledChecks: ['prompt_injection', 'jailbreak', 'off_topic', 'content_moderation'],
  topicScope: {
    allowedTopics: [
      'professional experience',
      'skills and expertise',
      'projects and portfolio',
      'career background',
      'technical decisions',
      'general greetings',
      'contact information',
    ],
    description:
      "Questions about Daniel Kreuzhofer's professional background, experience, skills, and projects",
  },
  blockThreshold: 0.8,
  validateOutput: true,
};

/**
 * Predefined configuration for Fit Analysis API guardrails
 */
export const FIT_ANALYSIS_GUARDRAIL_CONFIG: GuardrailConfig = {
  enabledChecks: ['prompt_injection', 'jailbreak', 'content_moderation'],
  topicScope: {
    allowedTopics: [
      'job descriptions',
      'role requirements',
      'qualifications',
      'candidate fit assessment',
    ],
    description: 'Job description analysis and fit assessment',
  },
  blockThreshold: 0.8,
  validateOutput: false, // Output is structured JSON, less risk
};

/**
 * Default block threshold if not specified in config
 */
const DEFAULT_BLOCK_THRESHOLD = 0.8;

/**
 * Model to use for LLM-based guardrail checks
 */
const GUARDRAIL_MODEL = 'gpt-4o-mini';

/**
 * Main guardrails service class
 */
export class GuardrailsService {
  private openai: OpenAI;
  private endpoint: string;

  constructor(apiKey: string, endpoint: string = 'unknown') {
    this.openai = new OpenAI({ apiKey });
    this.endpoint = endpoint;
  }

  /**
   * Validate user input against configured guardrails
   */
  async validateInput(
    input: string,
    config: GuardrailConfig,
    requestId?: string
  ): Promise<GuardrailValidationResult> {
    const startTime = Date.now();
    const threshold = config.blockThreshold ?? DEFAULT_BLOCK_THRESHOLD;
    const checks: GuardrailCheckResult[] = [];

    try {
      // Run enabled checks
      const checkPromises: Promise<GuardrailCheckResult>[] = [];

      for (const checkType of config.enabledChecks) {
        switch (checkType) {
          case 'prompt_injection':
            checkPromises.push(this.runPromptInjectionCheck(input));
            break;
          case 'jailbreak':
            checkPromises.push(this.runJailbreakCheck(input));
            break;
          case 'content_moderation':
            checkPromises.push(this.runContentModerationCheck(input));
            break;
          case 'off_topic':
            if (config.topicScope) {
              checkPromises.push(this.runOffTopicCheck(input, config.topicScope));
            }
            break;
        }
      }

      const results = await Promise.all(checkPromises);
      checks.push(...results);

      // Find first failed check above threshold
      const failedCheck = checks.find(
        (check) => !check.passed && check.confidence >= threshold
      );

      if (failedCheck) {
        const duration = Date.now() - startTime;

        // Log security event
        logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: failedCheck.checkType,
          endpoint: this.endpoint,
          confidence: failedCheck.confidence,
          blocked: true,
          requestId: requestId ?? 'unknown',
          metadata: {
            checkDuration: duration,
            inputLength: input.length,
          },
        });

        return {
          passed: false,
          failedCheck: failedCheck.checkType,
          userMessage: getRejectionMessage(
            failedCheck.checkType,
            this.endpoint as 'chat' | 'fit_analysis'
          ),
          checks,
        };
      }

      return {
        passed: true,
        userMessage: '',
        checks,
      };
    } catch (error) {
      // Fail-open: allow the request but log the failure
      log.error('Guardrails check failed', error);
      return {
        passed: true,
        userMessage: '',
        checks,
      };
    }
  }

  /**
   * Validate AI output before returning to client
   */
  async validateOutput(
    output: string,
    config: GuardrailConfig,
    requestId?: string
  ): Promise<GuardrailValidationResult> {
    const threshold = config.blockThreshold ?? DEFAULT_BLOCK_THRESHOLD;
    const checks: GuardrailCheckResult[] = [];

    try {
      // Only run content moderation on output
      const moderationResult = await this.runContentModerationCheck(output);
      checks.push(moderationResult);

      if (!moderationResult.passed && moderationResult.confidence >= threshold) {
        // Log security event
        logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: 'output_blocked',
          endpoint: this.endpoint,
          confidence: moderationResult.confidence,
          blocked: true,
          requestId: requestId ?? 'unknown',
        });

        return {
          passed: false,
          failedCheck: 'content_moderation',
          userMessage:
            "I apologize, but I can't provide that response. Let me help you with something else about Daniel's professional background.",
          checks,
        };
      }

      return {
        passed: true,
        userMessage: '',
        checks,
      };
    } catch (error) {
      // Fail-open for output validation
      log.error('Output validation failed', error);
      return {
        passed: true,
        userMessage: '',
        checks,
      };
    }
  }

  /**
   * Run prompt injection detection check
   */
  private async runPromptInjectionCheck(input: string): Promise<GuardrailCheckResult> {
    try {
      // Use jailbreak check as it covers prompt injection patterns
      // The @openai/guardrails prompt_injection_detection is designed for tool calls
      const ctx = { guardrailLlm: this.openai };
      const config = {
        model: GUARDRAIL_MODEL,
        confidence_threshold: 0.5,
        include_reasoning: false,
        max_turns: 1,
      };

      const result = await jailbreak(ctx, input, config);

      return {
        checkType: 'prompt_injection',
        passed: !result.tripwireTriggered,
        confidence: result.tripwireTriggered ? 0.9 : 0.1,
        details: result.tripwireTriggered ? 'Potential prompt injection detected' : undefined,
      };
    } catch (error) {
      log.error('Prompt injection check failed', error);
      // Fail-open
      return {
        checkType: 'prompt_injection',
        passed: true,
        confidence: 0,
      };
    }
  }

  /**
   * Run jailbreak detection check
   */
  private async runJailbreakCheck(input: string): Promise<GuardrailCheckResult> {
    try {
      const ctx = { guardrailLlm: this.openai };
      const config = {
        model: GUARDRAIL_MODEL,
        confidence_threshold: 0.5,
        include_reasoning: false,
        max_turns: 1,
      };

      const result = await jailbreak(ctx, input, config);

      return {
        checkType: 'jailbreak',
        passed: !result.tripwireTriggered,
        confidence: result.tripwireTriggered ? 0.9 : 0.1,
        details: result.tripwireTriggered ? 'Potential jailbreak attempt detected' : undefined,
      };
    } catch (error) {
      log.error('Jailbreak check failed', error);
      // Fail-open
      return {
        checkType: 'jailbreak',
        passed: true,
        confidence: 0,
      };
    }
  }

  /**
   * Run content moderation check
   */
  private async runContentModerationCheck(input: string): Promise<GuardrailCheckResult> {
    try {
      const ctx = { guardrailLlm: this.openai };
      const config = {
        categories: [
          Category.HATE,
          Category.HATE_THREATENING,
          Category.HARASSMENT,
          Category.HARASSMENT_THREATENING,
          Category.SEXUAL,
          Category.VIOLENCE,
          Category.VIOLENCE_GRAPHIC,
        ],
      };

      const result = await moderationCheck(ctx, input, config);

      return {
        checkType: 'content_moderation',
        passed: !result.tripwireTriggered,
        confidence: result.tripwireTriggered ? 0.95 : 0.05,
        details: result.tripwireTriggered ? 'Content policy violation detected' : undefined,
      };
    } catch (error) {
      log.error('Content moderation check failed', error);
      // Fail-open
      return {
        checkType: 'content_moderation',
        passed: true,
        confidence: 0,
      };
    }
  }

  /**
   * Run off-topic detection check
   */
  private async runOffTopicCheck(
    input: string,
    topicScope: TopicScope
  ): Promise<GuardrailCheckResult> {
    try {
      const ctx = { guardrailLlm: this.openai };
      const config = {
        model: GUARDRAIL_MODEL,
        confidence_threshold: 0.5,
        system_prompt_details: `Allowed topics: ${topicScope.allowedTopics.join(', ')}. Context: ${topicScope.description}. Be lenient with greetings, follow-up questions, and clarifications.`,
        include_reasoning: false,
        max_turns: 1,
      };

      const result = await topicalAlignment(ctx, input, config);

      return {
        checkType: 'off_topic',
        passed: !result.tripwireTriggered,
        confidence: result.tripwireTriggered ? 0.85 : 0.1,
        details: result.tripwireTriggered ? 'Off-topic query detected' : undefined,
      };
    } catch (error) {
      log.error('Off-topic check failed', error);
      // Fail-open
      return {
        checkType: 'off_topic',
        passed: true,
        confidence: 0,
      };
    }
  }
}

/**
 * Apply threshold-based blocking logic
 * Exported for testing
 */
export function applyThreshold(
  confidence: number,
  threshold: number
): { blocked: boolean } {
  return { blocked: confidence >= threshold };
}

/**
 * Create a singleton instance for use across the application
 */
let guardrailsServiceInstance: GuardrailsService | null = null;

export function getGuardrailsService(endpoint: string): GuardrailsService {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  // Create new instance per endpoint for proper logging
  return new GuardrailsService(apiKey, endpoint);
}
