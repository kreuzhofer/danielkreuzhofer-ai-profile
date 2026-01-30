/**
 * Property Tests for Fit Analysis Input Validation
 *
 * These tests validate:
 * - Property 4: Empty/Whitespace Rejection
 *
 * Feature: fit-analysis-module
 *
 * **Validates: Requirements 2.3**
 */

import * as fc from 'fast-check';
import { validateJobDescription } from '@/lib/fit-analysis-validation';

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating whitespace-only strings
 * Includes: empty string, spaces, tabs, newlines, carriage returns
 */
const whitespaceOnlyArbitrary: fc.Arbitrary<string> = fc.oneof(
  // Empty string
  fc.constant(''),
  // Strings composed only of whitespace characters
  fc
    .array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 50 })
    .map((chars) => chars.join(''))
);

/**
 * Arbitrary for generating various whitespace combinations
 * Tests different patterns of whitespace that should all be rejected
 */
const whitespacePatternArbitrary: fc.Arbitrary<string> = fc.oneof(
  // Just spaces
  fc
    .array(fc.constant(' '), { minLength: 0, maxLength: 20 })
    .map((chars) => chars.join('')),
  // Just tabs
  fc
    .array(fc.constant('\t'), { minLength: 0, maxLength: 10 })
    .map((chars) => chars.join('')),
  // Just newlines
  fc
    .array(fc.constant('\n'), { minLength: 0, maxLength: 10 })
    .map((chars) => chars.join('')),
  // Just carriage returns
  fc
    .array(fc.constant('\r'), { minLength: 0, maxLength: 10 })
    .map((chars) => chars.join('')),
  // Mixed whitespace
  fc
    .array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 0, maxLength: 30 })
    .map((chars) => chars.join(''))
);

// =============================================================================
// Property 4: Empty/Whitespace Rejection
// =============================================================================

/**
 * Feature: fit-analysis-module, Property 4: Empty/Whitespace Rejection
 *
 * *For any* string composed entirely of whitespace characters (including empty string),
 * attempting to submit it SHALL be prevented, and a validation error message SHALL be displayed.
 *
 * **Validates: Requirements 2.3**
 */
describe('Property 4: Empty/Whitespace Rejection', () => {
  describe('Validation Function Rejects Whitespace-Only Input', () => {
    it('rejects all whitespace-only strings with isValid: false', () => {
      fc.assert(
        fc.property(whitespaceOnlyArbitrary, (whitespaceString) => {
          const result = validateJobDescription(whitespaceString);

          // Validation should fail for whitespace-only input
          return result.isValid === false;
        }),
        { numRuns: 3 }
      );
    });

    it('provides an error message for all whitespace-only strings', () => {
      fc.assert(
        fc.property(whitespaceOnlyArbitrary, (whitespaceString) => {
          const result = validateJobDescription(whitespaceString);

          // Error message should be present and non-empty
          return (
            result.errorMessage !== null &&
            result.errorMessage.length > 0
          );
        }),
        { numRuns: 3 }
      );
    });

    it('rejects various whitespace patterns', () => {
      fc.assert(
        fc.property(whitespacePatternArbitrary, (whitespaceString) => {
          const result = validateJobDescription(whitespaceString);

          // All whitespace patterns should be rejected
          return result.isValid === false && result.errorMessage !== null;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Error Message Content', () => {
    it('error message indicates job description is required', () => {
      fc.assert(
        fc.property(whitespaceOnlyArbitrary, (whitespaceString) => {
          const result = validateJobDescription(whitespaceString);

          // Error message should mention entering a job description
          return (
            result.errorMessage !== null &&
            result.errorMessage.toLowerCase().includes('job description')
          );
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('No Warning Message for Invalid Input', () => {
    it('warning message is null when input is invalid', () => {
      fc.assert(
        fc.property(whitespaceOnlyArbitrary, (whitespaceString) => {
          const result = validateJobDescription(whitespaceString);

          // Warning should be null when there's an error
          return result.warningMessage === null;
        }),
        { numRuns: 3 }
      );
    });
  });
});

// =============================================================================
// Property 5: Short Input Warning
// =============================================================================

/**
 * Feature: fit-analysis-module, Property 5: Short Input Warning
 *
 * *For any* non-empty input string with fewer than 50 characters,
 * the Fit_Analysis_Module SHALL display a warning message about improving analysis quality with more detail.
 *
 * **Validates: Requirements 2.4**
 */
describe('Property 5: Short Input Warning', () => {
  /**
   * Arbitrary for generating short non-empty strings (1-49 characters after trimming)
   * Uses printable ASCII characters to ensure meaningful content
   */
  const shortNonEmptyStringArbitrary: fc.Arbitrary<string> = fc
    .string({ minLength: 1, maxLength: 49 })
    .filter((s) => {
      const trimmed = s.trim();
      return trimmed.length > 0 && trimmed.length < 50;
    });

  describe('Validation Returns Valid for Short Input', () => {
    it('short non-empty input is still valid (isValid: true)', () => {
      fc.assert(
        fc.property(shortNonEmptyStringArbitrary, (shortString) => {
          const result = validateJobDescription(shortString);

          // Short input should still be valid (submission allowed)
          return result.isValid === true;
        }),
        { numRuns: 3 }
      );
    });

    it('short non-empty input has no error message', () => {
      fc.assert(
        fc.property(shortNonEmptyStringArbitrary, (shortString) => {
          const result = validateJobDescription(shortString);

          // No error message for valid short input
          return result.errorMessage === null;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Warning Message for Short Input', () => {
    it('short non-empty input returns a warning message', () => {
      fc.assert(
        fc.property(shortNonEmptyStringArbitrary, (shortString) => {
          const result = validateJobDescription(shortString);

          // Warning message should be present for short input
          return result.warningMessage !== null && result.warningMessage.length > 0;
        }),
        { numRuns: 3 }
      );
    });

    it('warning message mentions improving quality with more detail', () => {
      fc.assert(
        fc.property(shortNonEmptyStringArbitrary, (shortString) => {
          const result = validateJobDescription(shortString);

          // Warning should mention improving quality and more detail
          const warning = result.warningMessage?.toLowerCase() ?? '';
          return (
            warning.includes('detail') ||
            warning.includes('quality') ||
            warning.includes('improve')
          );
        }),
        { numRuns: 3 }
      );
    });
  });
});
