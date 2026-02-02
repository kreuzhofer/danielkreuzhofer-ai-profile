/**
 * Security Logger for guardrail events
 * 
 * Provides structured logging for security events without exposing sensitive data.
 * All log entries are sanitized to prevent log injection attacks.
 */

import { SecurityEvent, SecurityEventType } from './types';
import crypto from 'crypto';

/**
 * Characters that could be used for log injection attacks
 */
const LOG_INJECTION_CHARS = /[\n\r\0]/g;

/**
 * Pattern to detect email addresses
 */
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Pattern to detect IP addresses
 */
const IP_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

/**
 * Fields that should never contain user-provided text
 */
const FORBIDDEN_FIELDS = ['message', 'content', 'input', 'query'];

/**
 * Sanitize a string to prevent log injection attacks
 * Removes newlines, carriage returns, and null bytes
 */
export function sanitizeLogString(value: string): string {
  if (typeof value !== 'string') {
    return String(value);
  }
  return value.replace(LOG_INJECTION_CHARS, ' ');
}

/**
 * Remove PII from a string (emails and IP addresses)
 */
export function removePII(value: string): string {
  if (typeof value !== 'string') {
    return String(value);
  }
  return value.replace(EMAIL_PATTERN, '[email]').replace(IP_PATTERN, '[ip]');
}

/**
 * Sanitize an entire log entry
 * - Removes log injection characters from all string fields
 * - Removes PII from all string fields
 * - Removes forbidden fields that might contain user content
 */
export function sanitizeLogEntry(event: SecurityEvent): SecurityEvent {
  const sanitized: SecurityEvent = {
    timestamp: sanitizeLogString(event.timestamp),
    eventType: event.eventType,
    endpoint: sanitizeLogString(event.endpoint),
    confidence: Math.max(0, Math.min(1, event.confidence)),
    blocked: Boolean(event.blocked),
    requestId: sanitizeLogString(removePII(event.requestId)),
  };

  if (event.metadata) {
    sanitized.metadata = {};
    if (typeof event.metadata.checkDuration === 'number') {
      sanitized.metadata.checkDuration = event.metadata.checkDuration;
    }
    if (typeof event.metadata.inputLength === 'number') {
      sanitized.metadata.inputLength = event.metadata.inputLength;
    }
  }

  return sanitized;
}

/**
 * Validate that a security event has all required fields
 */
export function isValidSecurityEvent(event: unknown): event is SecurityEvent {
  if (!event || typeof event !== 'object') {
    return false;
  }

  const e = event as Record<string, unknown>;

  // Check required fields
  if (typeof e.timestamp !== 'string' || !e.timestamp) {
    return false;
  }

  const validEventTypes: SecurityEventType[] = [
    'prompt_injection',
    'jailbreak',
    'off_topic',
    'content_moderation',
    'output_blocked',
  ];
  if (!validEventTypes.includes(e.eventType as SecurityEventType)) {
    return false;
  }

  if (typeof e.endpoint !== 'string' || !e.endpoint) {
    return false;
  }

  if (typeof e.confidence !== 'number' || e.confidence < 0 || e.confidence > 1) {
    return false;
  }

  if (typeof e.blocked !== 'boolean') {
    return false;
  }

  if (typeof e.requestId !== 'string' || !e.requestId) {
    return false;
  }

  return true;
}

/**
 * Check if a log entry contains any PII
 */
export function containsPII(entry: SecurityEvent): boolean {
  const jsonStr = JSON.stringify(entry);
  return EMAIL_PATTERN.test(jsonStr) || IP_PATTERN.test(jsonStr);
}

/**
 * Check if a log entry contains forbidden fields with user content
 */
export function containsForbiddenFields(entry: Record<string, unknown>): boolean {
  for (const field of FORBIDDEN_FIELDS) {
    if (field in entry && typeof entry[field] === 'string' && entry[field]) {
      return true;
    }
  }
  return false;
}

/**
 * Log a security event
 * 
 * This function:
 * - Sanitizes the event to prevent log injection
 * - Removes any PII
 * - Outputs structured JSON for easy parsing
 * - Never throws errors that could affect the main request flow
 */
export function logSecurityEvent(event: SecurityEvent): void {
  try {
    const sanitizedEvent = sanitizeLogEntry(event);
    // Use console.log for structured JSON output
    // In production, this would be sent to a log aggregation service
    console.log(JSON.stringify(sanitizedEvent));
  } catch (error) {
    // Silently fail - logging should never break the application
    console.error('Failed to log security event:', error);
  }
}

/**
 * Create an anonymized request ID from request metadata
 * Uses a hash of IP + user agent to create a consistent but anonymous identifier
 */
export function createAnonymizedRequestId(request: Request): string {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 
               request.headers.get('x-real-ip') ?? 
               'unknown';
    const userAgent = request.headers.get('user-agent') ?? 'unknown';
    
    // Create a hash of the combined values
    const hash = crypto
      .createHash('sha256')
      .update(`${ip}:${userAgent}`)
      .digest('hex')
      .substring(0, 16);
    
    return hash;
  } catch {
    // Return a random ID if hashing fails
    return crypto.randomBytes(8).toString('hex');
  }
}
