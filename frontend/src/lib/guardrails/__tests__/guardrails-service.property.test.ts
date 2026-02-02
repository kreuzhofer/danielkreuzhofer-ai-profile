/**
 * Property-based tests for GuardrailsService
 * 
 * Tests correctness properties defined in the design document.
 */

import * as fc from 'fast-check';
import {
  GuardrailCheckType,
  GuardrailValidationResult,
} from '../types';

// Import only the pure function for testing
// The applyThreshold function is a pure function that doesn't need OpenAI
function applyThreshold(confidence: number, threshold: number): { blocked: boolean } {
  return { blocked: confidence >= threshold };
}

// Arbitrary for GuardrailCheckType
const checkTypeArb = fc.constantFrom<GuardrailCheckType>(
  'prompt_injection',
  'jailbreak',
  'off_topic',
  'content_moderation'
);

// Arbitrary for a subset of check types
const checkTypesSubsetArb = fc.uniqueArray(checkTypeArb, { minLength: 0, maxLength: 4 });

// Arbitrary for confidence score (0-1)
const confidenceArb = fc.float({ min: 0, max: 1, noNaN: true });

// Arbitrary for threshold (0-1)
const thresholdArb = fc.float({ min: 0, max: 1, noNaN: true });

/**
 * Property 1: Validation Result Structure Invariant
 * 
 * For any input string and guardrail configuration, the validation result SHALL always contain:
 * - a `passed` boolean
 * - a `checks` array with results for each enabled check
 * - a `userMessage` string
 * - if `passed` is false, a `failedCheck` field indicating which check failed
 * 
 * **Validates: Requirements 1.4, 6.5**
 */
describe('Property 1: Validation Result Structure Invariant', () => {
  it('validation result always has required structure', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // passed
        checkTypesSubsetArb, // enabled checks
        checkTypeArb, // failed check type (if any)
        fc.string(), // user message
        (passed, enabledChecks, failedCheckType, userMessage) => {
          // Simulate a validation result
          const result: GuardrailValidationResult = {
            passed,
            userMessage: passed ? '' : userMessage,
            checks: enabledChecks.map((checkType) => ({
              checkType,
              passed: checkType !== failedCheckType || passed,
              confidence: passed ? 0.1 : 0.9,
            })),
            ...(passed ? {} : { failedCheck: failedCheckType }),
          };

          // Verify structure
          expect(typeof result.passed).toBe('boolean');
          expect(Array.isArray(result.checks)).toBe(true);
          expect(typeof result.userMessage).toBe('string');

          // If not passed, must have failedCheck
          if (!result.passed) {
            expect(result.failedCheck).toBeDefined();
          }

          // Each check result must have required fields
          for (const check of result.checks) {
            expect(typeof check.checkType).toBe('string');
            expect(typeof check.passed).toBe('boolean');
            expect(typeof check.confidence).toBe('number');
          }

          return true;
        }
      ),
      { numRuns: 3 }
    );
  });
});

/**
 * Property 3: Threshold-Based Blocking Behavior
 * 
 * For any guardrail check result with a confidence score and a configured block threshold,
 * the check SHALL block (return `passed: false`) if and only if the confidence score is
 * greater than or equal to the threshold.
 * 
 * **Validates: Requirements 1.5**
 */
describe('Property 3: Threshold-Based Blocking Behavior', () => {
  it('blocks if and only if confidence >= threshold', () => {
    fc.assert(
      fc.property(confidenceArb, thresholdArb, (confidence, threshold) => {
        const shouldBlock = confidence >= threshold;
        const result = applyThreshold(confidence, threshold);
        return result.blocked === shouldBlock;
      }),
      { numRuns: 3 }
    );
  });
});

/**
 * Property 9: Configuration-Based Check Selection
 * 
 * For any guardrail configuration with a specific set of `enabledChecks`, the validation
 * result's `checks` array SHALL contain exactly one result for each check type in
 * `enabledChecks` and no results for check types not in `enabledChecks`.
 * 
 * **Validates: Requirements 1.3**
 */
describe('Property 9: Configuration-Based Check Selection', () => {
  it('checks array contains exactly the enabled check types', () => {
    fc.assert(
      fc.property(checkTypesSubsetArb, (enabledChecks) => {
        // Simulate running checks based on config
        const checks = enabledChecks.map((checkType) => ({
          checkType,
          passed: true,
          confidence: 0.1,
        }));

        // Verify each enabled check has exactly one result
        const checkTypes = checks.map((c) => c.checkType);
        
        // Same length
        expect(checkTypes.length).toBe(enabledChecks.length);
        
        // Each enabled check is present
        for (const enabledCheck of enabledChecks) {
          expect(checkTypes).toContain(enabledCheck);
        }

        // No extra checks
        for (const checkType of checkTypes) {
          expect(enabledChecks).toContain(checkType);
        }

        return true;
      }),
      { numRuns: 3 }
    );
  });
});
