/**
 * Property-based tests for SecurityLogger
 * 
 * Tests correctness properties defined in the design document.
 */

import * as fc from 'fast-check';
import { SecurityEvent, SecurityEventType } from '../types';
import {
  sanitizeLogString,
  sanitizeLogEntry,
  removePII,
  isValidSecurityEvent,
  containsPII,
} from '../security-logger';

// Arbitrary for SecurityEventType
const eventTypeArb = fc.constantFrom<SecurityEventType>(
  'prompt_injection',
  'jailbreak',
  'off_topic',
  'content_moderation',
  'output_blocked'
);

// Arbitrary for endpoint
const endpointArb = fc.constantFrom('chat', 'fit_analysis');

// Arbitrary for confidence (0-1)
const confidenceArb = fc.float({ min: 0, max: 1, noNaN: true });

// Arbitrary for a valid security event
const securityEventArb = fc.record({
  timestamp: fc.date().map((d) => d.toISOString()),
  eventType: eventTypeArb,
  endpoint: endpointArb,
  confidence: confidenceArb,
  blocked: fc.boolean(),
  requestId: fc.string({ minLength: 8, maxLength: 16 }).filter((s) => /^[a-f0-9]+$/.test(s) || s.length >= 8),
  metadata: fc.option(
    fc.record({
      checkDuration: fc.nat({ max: 10000 }),
      inputLength: fc.nat({ max: 100000 }),
    }),
    { nil: undefined }
  ),
}).map((event) => ({
  ...event,
  requestId: event.requestId.length >= 8 ? event.requestId : 'abcd1234' + event.requestId,
}));

// Arbitrary for strings with log injection characters
const logInjectionStringArb = fc.array(
  fc.constantFrom('\n', '\r', '\0', 'a', 'b', 'c', ' ', '1', '2', '3'),
  { minLength: 1, maxLength: 50 }
).map((chars) => chars.join(''));

// Arbitrary for strings with email patterns
const emailArb = fc.tuple(
  fc.array(fc.constantFrom('a', 'b', 'c', '1', '2', '3'), { minLength: 1, maxLength: 10 }).map((chars) => chars.join('')),
  fc.constantFrom('gmail.com', 'example.org', 'test.net')
).map(([local, domain]) => `${local}@${domain}`);

// Arbitrary for strings with IP patterns
const ipArb = fc.tuple(
  fc.nat({ max: 255 }),
  fc.nat({ max: 255 }),
  fc.nat({ max: 255 }),
  fc.nat({ max: 255 })
).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);

/**
 * Property 5: Log Entry Structure Completeness
 * 
 * For any blocked request that triggers a security log event, the log entry SHALL contain
 * all required fields: `timestamp` (ISO 8601 format), `eventType` (one of the defined types),
 * `endpoint`, `confidence` (number 0-1), `blocked` (boolean), and `requestId` (non-empty string).
 * 
 * **Validates: Requirements 2.4, 3.4, 4.6, 7.1, 7.3, 7.6**
 */
describe('Property 5: Log Entry Structure Completeness', () => {
  it('sanitized log entries have all required fields', () => {
    fc.assert(
      fc.property(securityEventArb, (event) => {
        const sanitized = sanitizeLogEntry(event);

        // All required fields present
        expect(sanitized.timestamp).toBeDefined();
        expect(typeof sanitized.timestamp).toBe('string');
        expect(sanitized.timestamp.length).toBeGreaterThan(0);

        expect(sanitized.eventType).toBeDefined();
        expect([
          'prompt_injection',
          'jailbreak',
          'off_topic',
          'content_moderation',
          'output_blocked',
        ]).toContain(sanitized.eventType);

        expect(sanitized.endpoint).toBeDefined();
        expect(typeof sanitized.endpoint).toBe('string');

        expect(typeof sanitized.confidence).toBe('number');
        expect(sanitized.confidence).toBeGreaterThanOrEqual(0);
        expect(sanitized.confidence).toBeLessThanOrEqual(1);

        expect(typeof sanitized.blocked).toBe('boolean');

        expect(sanitized.requestId).toBeDefined();
        expect(typeof sanitized.requestId).toBe('string');
        expect(sanitized.requestId.length).toBeGreaterThan(0);

        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('isValidSecurityEvent correctly validates events', () => {
    fc.assert(
      fc.property(securityEventArb, (event) => {
        // Valid events should pass validation
        expect(isValidSecurityEvent(event)).toBe(true);
        return true;
      }),
      { numRuns: 3 }
    );
  });
});

/**
 * Property 6: No PII in Security Logs
 * 
 * For any security log entry, the entry SHALL NOT contain: the original user message content,
 * email addresses, IP addresses in plain text, or any field named "message", "content",
 * "input", or "query" containing user-provided text.
 * 
 * **Validates: Requirements 7.2**
 */
describe('Property 6: No PII in Security Logs', () => {
  it('sanitized log entries do not contain email addresses', () => {
    fc.assert(
      fc.property(securityEventArb, emailArb, (event, email) => {
        // Add email to requestId to test sanitization
        const eventWithEmail: SecurityEvent = {
          ...event,
          requestId: `user-${email}-request`,
        };

        const sanitized = sanitizeLogEntry(eventWithEmail);

        // Should not contain the email
        expect(containsPII(sanitized)).toBe(false);

        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('sanitized log entries do not contain IP addresses', () => {
    fc.assert(
      fc.property(securityEventArb, ipArb, (event, ip) => {
        // Add IP to requestId to test sanitization
        const eventWithIP: SecurityEvent = {
          ...event,
          requestId: `request-from-${ip}`,
        };

        const sanitized = sanitizeLogEntry(eventWithIP);

        // Should not contain the IP
        expect(containsPII(sanitized)).toBe(false);

        return true;
      }),
      { numRuns: 3 }
    );
  });
});

/**
 * Property 7: Structured JSON Log Format
 * 
 * For any security log entry output, the entry SHALL be valid JSON that can be parsed
 * without errors.
 * 
 * **Validates: Requirements 7.4**
 */
describe('Property 7: Structured JSON Log Format', () => {
  it('sanitized log entries can be serialized to valid JSON', () => {
    fc.assert(
      fc.property(securityEventArb, (event) => {
        const sanitized = sanitizeLogEntry(event);

        // Should serialize without error
        let jsonStr: string;
        expect(() => {
          jsonStr = JSON.stringify(sanitized);
        }).not.toThrow();

        // Should parse back without error
        let parsed: unknown;
        expect(() => {
          parsed = JSON.parse(jsonStr!);
        }).not.toThrow();

        // Parsed object should have same structure
        expect(parsed).toHaveProperty('timestamp');
        expect(parsed).toHaveProperty('eventType');
        expect(parsed).toHaveProperty('endpoint');
        expect(parsed).toHaveProperty('confidence');
        expect(parsed).toHaveProperty('blocked');
        expect(parsed).toHaveProperty('requestId');

        return true;
      }),
      { numRuns: 3 }
    );
  });
});

/**
 * Property 8: Log Injection Prevention
 * 
 * For any input string containing potential log injection characters (newlines `\n`,
 * carriage returns `\r`, or null bytes `\0`), the security log entry SHALL have these
 * characters escaped or removed in any logged metadata.
 * 
 * **Validates: Requirements 7.5**
 */
describe('Property 8: Log Injection Prevention', () => {
  it('sanitizeLogString removes log injection characters', () => {
    fc.assert(
      fc.property(logInjectionStringArb, (input) => {
        const sanitized = sanitizeLogString(input);

        // Should not contain newlines, carriage returns, or null bytes
        expect(sanitized).not.toContain('\n');
        expect(sanitized).not.toContain('\r');
        expect(sanitized).not.toContain('\0');

        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('sanitized log entries have no injection characters in any field', () => {
    fc.assert(
      fc.property(securityEventArb, logInjectionStringArb, (event, injectionStr) => {
        // Add injection characters to various fields
        const eventWithInjection: SecurityEvent = {
          ...event,
          endpoint: `chat${injectionStr}`,
          requestId: `req${injectionStr}id`,
        };

        const sanitized = sanitizeLogEntry(eventWithInjection);
        const jsonStr = JSON.stringify(sanitized);

        // JSON should not contain raw injection characters
        expect(jsonStr).not.toContain('\n');
        expect(jsonStr).not.toContain('\r');
        expect(jsonStr).not.toContain('\0');

        return true;
      }),
      { numRuns: 3 }
    );
  });
});
