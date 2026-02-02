/**
 * Types and interfaces for the guardrails service
 */

/**
 * Types of guardrail checks available
 */
export type GuardrailCheckType =
  | 'prompt_injection'
  | 'jailbreak'
  | 'off_topic'
  | 'content_moderation';

/**
 * Result of a single guardrail check
 */
export interface GuardrailCheckResult {
  checkType: GuardrailCheckType;
  passed: boolean;
  confidence: number;
  details?: string;
}

/**
 * Overall result of guardrail validation
 */
export interface GuardrailValidationResult {
  passed: boolean;
  failedCheck?: GuardrailCheckType;
  userMessage: string;
  checks: GuardrailCheckResult[];
}

/**
 * Configuration for off-topic detection
 */
export interface TopicScope {
  allowedTopics: string[];
  description: string;
}

/**
 * Configuration for a specific endpoint's guardrails
 */
export interface GuardrailConfig {
  /** Which checks to run */
  enabledChecks: GuardrailCheckType[];
  /** Topic scope for off-topic detection */
  topicScope?: TopicScope;
  /** Confidence threshold for blocking (0-1, default 0.8) */
  blockThreshold?: number;
  /** Whether to validate output as well as input */
  validateOutput?: boolean;
}

/**
 * Types of security events for logging
 */
export type SecurityEventType =
  | 'prompt_injection'
  | 'jailbreak'
  | 'off_topic'
  | 'content_moderation'
  | 'output_blocked';

/**
 * Security event log entry
 */
export interface SecurityEvent {
  timestamp: string;
  eventType: SecurityEventType;
  endpoint: string;
  confidence: number;
  blocked: boolean;
  /** Anonymized request identifier */
  requestId: string;
  /** Additional context (no PII or message content) */
  metadata?: {
    checkDuration?: number;
    inputLength?: number;
  };
}
