/**
 * Property-based tests for rejection messages
 * 
 * Tests correctness properties defined in the design document.
 */

import * as fc from 'fast-check';
import { GuardrailCheckType } from '../types';
import {
  getRejectionMessage,
  containsForbiddenTerms,
  REJECTION_MESSAGES,
  FIT_ANALYSIS_REJECTION_MESSAGES,
  FORBIDDEN_SECURITY_TERMS,
} from '../messages';

// Arbitrary for GuardrailCheckType
const checkTypeArb = fc.constantFrom<GuardrailCheckType>(
  'prompt_injection',
  'jailbreak',
  'off_topic',
  'content_moderation'
);

// Arbitrary for security check types (prompt_injection, jailbreak)
const securityCheckTypeArb = fc.constantFrom<GuardrailCheckType>(
  'prompt_injection',
  'jailbreak'
);

// Arbitrary for endpoint
const endpointArb = fc.constantFrom('chat', 'fit_analysis');

/**
 * Property 4: Security Message Opacity
 * 
 * For any validation result where `failedCheck` is `prompt_injection` or `jailbreak`,
 * the `userMessage` SHALL NOT contain any of the following terms:
 * "injection", "jailbreak", "detected", "blocked", "security", "attack", "malicious".
 * 
 * **Validates: Requirements 6.4**
 */
describe('Property 4: Security Message Opacity', () => {
  it('security rejection messages do not reveal detection methods', () => {
    fc.assert(
      fc.property(securityCheckTypeArb, endpointArb, (checkType, endpoint) => {
        const message = getRejectionMessage(checkType, endpoint);

        // Message should not contain any forbidden terms
        expect(containsForbiddenTerms(message)).toBe(false);

        // Double-check each term individually
        const lowerMessage = message.toLowerCase();
        for (const term of FORBIDDEN_SECURITY_TERMS) {
          expect(lowerMessage).not.toContain(term);
        }

        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('all predefined security messages are opaque', () => {
    // Check all predefined messages for prompt_injection and jailbreak
    const securityTypes: GuardrailCheckType[] = ['prompt_injection', 'jailbreak'];

    for (const checkType of securityTypes) {
      const chatMessage = REJECTION_MESSAGES[checkType];
      const fitMessage = FIT_ANALYSIS_REJECTION_MESSAGES[checkType];

      expect(containsForbiddenTerms(chatMessage)).toBe(false);
      expect(containsForbiddenTerms(fitMessage)).toBe(false);
    }
  });
});

/**
 * Property 2: Blocking Produces User-Friendly Message
 * 
 * For any guardrail check that detects a violation with confidence above the configured
 * threshold, the validation result SHALL have `passed` equal to false AND `userMessage`
 * SHALL be a non-empty string.
 * 
 * **Validates: Requirements 2.2, 3.3, 5.2, 5.4, 6.1**
 */
describe('Property 2: Blocking Produces User-Friendly Message', () => {
  it('all check types produce non-empty rejection messages', () => {
    fc.assert(
      fc.property(checkTypeArb, endpointArb, (checkType, endpoint) => {
        const message = getRejectionMessage(checkType, endpoint);

        // Message must be non-empty
        expect(message.length).toBeGreaterThan(0);

        // Message must be a string
        expect(typeof message).toBe('string');

        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('rejection messages are user-friendly (not technical)', () => {
    fc.assert(
      fc.property(checkTypeArb, endpointArb, (checkType, endpoint) => {
        const message = getRejectionMessage(checkType, endpoint);

        // Messages should not contain technical jargon
        const technicalTerms = ['error', 'exception', 'failed', 'invalid', 'null', 'undefined'];
        const lowerMessage = message.toLowerCase();

        for (const term of technicalTerms) {
          expect(lowerMessage).not.toContain(term);
        }

        return true;
      }),
      { numRuns: 3 }
    );
  });
});
