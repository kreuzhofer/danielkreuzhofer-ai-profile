/**
 * Property Tests for Fit Analysis Input Section
 *
 * These tests validate:
 * - Property 2: Character Count Accuracy
 * - Property 6: Submit Button Disabled During Loading
 *
 * Feature: fit-analysis-module
 *
 * **Validates: Requirements 1.4, 2.5**
 */

import * as fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import { InputSection } from '@/components/fit-analysis/InputSection';

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating strings of various lengths up to the max limit
 * Uses printable characters to ensure meaningful content
 */
const inputTextArbitrary: fc.Arbitrary<string> = fc.string({
  minLength: 0,
  maxLength: 5000,
});

/**
 * Arbitrary for generating strings with unicode characters
 * Tests that character count handles multi-byte characters correctly
 */
const unicodeTextArbitrary: fc.Arbitrary<string> = fc.oneof(
  // ASCII strings
  fc.string({ minLength: 0, maxLength: 100 }),
  // Strings with unicode characters
  fc.array(
    fc.constantFrom(
      'a', 'b', 'c', '1', '2', '3',
      '你', '好', '世', '界', '🌍', '🚀', '✨', '❤️', 'é', 'ñ', 'ü'
    ),
    { minLength: 0, maxLength: 100 }
  ).map((chars) => chars.join(''))
);

/**
 * Arbitrary for generating strings with whitespace
 * Tests that character count includes whitespace characters
 */
const whitespaceIncludedArbitrary: fc.Arbitrary<string> = fc.oneof(
  // Strings with leading/trailing whitespace
  fc.tuple(
    fc.array(fc.constantFrom(' ', '\t', '\n'), { minLength: 0, maxLength: 10 }).map((chars) => chars.join('')),
    fc.string({ minLength: 1, maxLength: 50 }),
    fc.array(fc.constantFrom(' ', '\t', '\n'), { minLength: 0, maxLength: 10 }).map((chars) => chars.join(''))
  ).map(([prefix, content, suffix]) => prefix + content + suffix),
  // Strings with embedded whitespace
  fc.array(
    fc.oneof(
      fc.string({ minLength: 1, maxLength: 10 }),
      fc.constantFrom(' ', '  ', '\t', '\n')
    ),
    { minLength: 1, maxLength: 20 }
  ).map((parts) => parts.join(''))
);

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Parse the displayed character count, handling locale formatting (e.g., "4,990")
 */
const parseDisplayedCount = (element: HTMLElement): number => {
  const text = element.textContent || '0';
  // Remove locale-specific formatting (commas, spaces, etc.)
  return parseInt(text.replace(/[,\s]/g, ''), 10);
};

// =============================================================================
// Default Props for Testing
// =============================================================================

const defaultProps = {
  onChange: jest.fn(),
  onSubmit: jest.fn(),
  isDisabled: false,
  maxLength: 5000,
  minLength: 50,
  placeholder: 'Paste a job description...',
};

// =============================================================================
// Property 2: Character Count Accuracy
// =============================================================================

/**
 * Feature: fit-analysis-module, Property 2: Character Count Accuracy
 *
 * *For any* text input into the job description field, the displayed character count
 * SHALL equal the actual length of the input string.
 *
 * **Validates: Requirements 1.4**
 */
describe('Property 2: Character Count Accuracy', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Character Count Equals String Length', () => {
    it('displays accurate character count for any input string', () => {
      fc.assert(
        fc.property(inputTextArbitrary, (inputText) => {
          render(
            <InputSection
              {...defaultProps}
              value={inputText}
            />
          );

          const currentCount = screen.getByTestId('current-count');
          const displayedCount = parseDisplayedCount(currentCount);

          // Character count should equal the string's length
          const isAccurate = displayedCount === inputText.length;

          // Cleanup for next iteration
          cleanup();

          return isAccurate;
        }),
        { numRuns: 3 }
      );
    });

    it('character count updates correctly when value changes', () => {
      fc.assert(
        fc.property(
          fc.tuple(inputTextArbitrary, inputTextArbitrary),
          ([firstValue, secondValue]) => {
            // Render with first value
            const { rerender } = render(
              <InputSection
                {...defaultProps}
                value={firstValue}
              />
            );

            const firstCount = parseDisplayedCount(screen.getByTestId('current-count'));
            const firstAccurate = firstCount === firstValue.length;

            // Rerender with second value
            rerender(
              <InputSection
                {...defaultProps}
                value={secondValue}
              />
            );

            const secondCount = parseDisplayedCount(screen.getByTestId('current-count'));
            const secondAccurate = secondCount === secondValue.length;

            // Cleanup for next iteration
            cleanup();

            return firstAccurate && secondAccurate;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Character Count with Unicode Characters', () => {
    it('displays accurate character count for unicode strings', () => {
      fc.assert(
        fc.property(unicodeTextArbitrary, (inputText) => {
          render(
            <InputSection
              {...defaultProps}
              value={inputText}
            />
          );

          const currentCount = screen.getByTestId('current-count');
          const displayedCount = parseDisplayedCount(currentCount);

          // Character count should equal JavaScript's string.length
          // (which counts UTF-16 code units, not graphemes)
          const isAccurate = displayedCount === inputText.length;

          // Cleanup for next iteration
          cleanup();

          return isAccurate;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Character Count with Whitespace', () => {
    it('displays accurate character count including whitespace characters', () => {
      fc.assert(
        fc.property(whitespaceIncludedArbitrary, (inputText) => {
          render(
            <InputSection
              {...defaultProps}
              value={inputText}
            />
          );

          const currentCount = screen.getByTestId('current-count');
          const displayedCount = parseDisplayedCount(currentCount);

          // Character count should include all whitespace characters
          const isAccurate = displayedCount === inputText.length;

          // Cleanup for next iteration
          cleanup();

          return isAccurate;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Character Count Edge Cases', () => {
    it('displays 0 for empty string', () => {
      render(
        <InputSection
          {...defaultProps}
          value=""
        />
      );

      const currentCount = screen.getByTestId('current-count');
      const displayedCount = parseDisplayedCount(currentCount);

      expect(displayedCount).toBe(0);
    });

    it('displays accurate count at maximum length boundary', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 4990, max: 5000 }),
          (length) => {
            const inputText = 'a'.repeat(length);

            render(
              <InputSection
                {...defaultProps}
                value={inputText}
              />
            );

            const currentCount = screen.getByTestId('current-count');
            const displayedCount = parseDisplayedCount(currentCount);

            const isAccurate = displayedCount === length;

            // Cleanup for next iteration
            cleanup();

            return isAccurate;
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});

// =============================================================================
// Property 6: Submit Button Disabled During Loading
// =============================================================================

/**
 * Feature: fit-analysis-module, Property 6: Submit Button Disabled During Loading
 *
 * *For any* analysis submission that triggers a loading state, the submit button
 * SHALL be disabled until the analysis completes or an error occurs.
 *
 * **Validates: Requirements 2.5**
 */
describe('Property 6: Submit Button Disabled During Loading', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Submit Button Disabled State', () => {
    it('submit button is disabled when isDisabled is true for any valid input', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 50, maxLength: 5000 }),
          (validInput) => {
            render(
              <InputSection
                {...defaultProps}
                value={validInput}
                isDisabled={true}
              />
            );

            const submitButton = screen.getByTestId('submit-button');
            const isButtonDisabled = submitButton.hasAttribute('disabled');

            cleanup();
            return isButtonDisabled;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('clicking submit button does not call onSubmit when isDisabled is true', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 50, maxLength: 5000 }),
          (validInput) => {
            const mockOnSubmit = jest.fn();

            render(
              <InputSection
                {...defaultProps}
                value={validInput}
                isDisabled={true}
                onSubmit={mockOnSubmit}
              />
            );

            const submitButton = screen.getByTestId('submit-button');
            submitButton.click();

            const wasNotCalled = mockOnSubmit.mock.calls.length === 0;

            cleanup();
            return wasNotCalled;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('submit button is enabled when isDisabled is false for valid input', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 50, maxLength: 5000 }),
          (validInput) => {
            render(
              <InputSection
                {...defaultProps}
                value={validInput}
                isDisabled={false}
              />
            );

            const submitButton = screen.getByTestId('submit-button');
            const isButtonEnabled = !submitButton.hasAttribute('disabled');

            cleanup();
            return isButtonEnabled;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Loading State Transition', () => {
    it('submit button transitions from enabled to disabled when loading starts', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 50, maxLength: 5000 }),
          (validInput) => {
            // First render with isDisabled=false (not loading)
            const { rerender } = render(
              <InputSection
                {...defaultProps}
                value={validInput}
                isDisabled={false}
              />
            );

            const submitButton = screen.getByTestId('submit-button');
            const initiallyEnabled = !submitButton.hasAttribute('disabled');

            // Rerender with isDisabled=true (loading)
            rerender(
              <InputSection
                {...defaultProps}
                value={validInput}
                isDisabled={true}
              />
            );

            const disabledDuringLoading = submitButton.hasAttribute('disabled');

            cleanup();
            return initiallyEnabled && disabledDuringLoading;
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});
