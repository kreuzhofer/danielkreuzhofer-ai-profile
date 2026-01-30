/**
 * Fit Analysis Input Validation Utilities
 *
 * Provides validation functions for job description input in the Fit Analysis Module.
 * Implements empty/whitespace rejection, minimum length warning, and maximum length validation.
 *
 * @see Requirements 2.3, 2.4, 1.3
 */

import {
  InputValidation,
  JOB_DESCRIPTION_CONSTRAINTS,
} from '@/types/fit-analysis';

/**
 * Validates a job description input string.
 *
 * Validation rules:
 * - Empty or whitespace-only strings are rejected (Requirement 2.3)
 * - Strings under 50 characters show a warning (Requirement 2.4)
 * - Strings over 5,000 characters are rejected (Requirement 1.3)
 *
 * @param input - The job description text to validate
 * @returns InputValidation object with isValid, errorMessage, and warningMessage
 *
 * @example
 * ```typescript
 * const result = validateJobDescription('');
 * // { isValid: false, errorMessage: 'Please enter a job description to analyze.', warningMessage: null }
 *
 * const result = validateJobDescription('Short text');
 * // { isValid: true, errorMessage: null, warningMessage: 'Adding more detail may improve analysis quality.' }
 *
 * const result = validateJobDescription('A sufficiently long job description...');
 * // { isValid: true, errorMessage: null, warningMessage: null }
 * ```
 */
export const validateJobDescription = (input: string): InputValidation => {
  const trimmed = input.trim();

  // Requirement 2.3: Reject empty or whitespace-only input
  if (trimmed.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Please enter a job description to analyze.',
      warningMessage: null,
    };
  }

  // Requirement 1.3: Reject input exceeding maximum length
  if (trimmed.length > JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH) {
    return {
      isValid: false,
      errorMessage: `Job description exceeds maximum length of ${JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH.toLocaleString()} characters.`,
      warningMessage: null,
    };
  }

  // Requirement 2.4: Warn for short input (but still valid)
  if (trimmed.length < JOB_DESCRIPTION_CONSTRAINTS.MIN_LENGTH_WARNING) {
    return {
      isValid: true,
      errorMessage: null,
      warningMessage: 'Adding more detail may improve analysis quality.',
    };
  }

  // Valid input with sufficient length
  return {
    isValid: true,
    errorMessage: null,
    warningMessage: null,
  };
};
