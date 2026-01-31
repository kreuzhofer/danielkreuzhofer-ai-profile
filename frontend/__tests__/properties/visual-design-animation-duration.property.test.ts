/**
 * Property Tests for Animation Duration Bounds
 *
 * This test validates that all animation duration tokens in the design system
 * fall within the specified bounds of 150ms to 300ms inclusive.
 *
 * **Feature: 005-visual-design-upgrade, Property 4: Animation Duration Bounds**
 * **Validates: Requirements 4.4**
 */

import * as fc from 'fast-check';
import { animation } from '@/lib/design-tokens';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Parses a duration string (e.g., '150ms') and returns the numeric value in milliseconds.
 * Returns NaN if the format is invalid.
 */
function parseDurationMs(duration: string): number {
  if (typeof duration !== 'string') {
    return NaN;
  }
  
  // Match pattern like '150ms', '200ms', etc.
  const match = duration.match(/^(\d+(?:\.\d+)?)ms$/);
  if (!match) {
    return NaN;
  }
  
  return parseFloat(match[1]);
}

/**
 * Checks if a duration value is within the valid bounds (150ms to 300ms inclusive).
 */
function isWithinBounds(durationMs: number): boolean {
  return durationMs >= 150 && durationMs <= 300;
}

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating animation duration token keys from the design system.
 * This ensures we test all defined duration tokens.
 */
const animationDurationKeyArbitrary = fc.constantFrom(
  ...Object.keys(animation.duration) as (keyof typeof animation.duration)[]
);

// =============================================================================
// Property 4: Animation Duration Bounds
// =============================================================================

/**
 * Feature: 005-visual-design-upgrade, Property 4: Animation Duration Bounds
 *
 * *For any* animation duration token defined in the design system,
 * the duration value SHALL be between 150ms and 300ms inclusive.
 *
 * **Validates: Requirements 4.4**
 */
describe('Property 4: Animation Duration Bounds', () => {
  describe('Animation Duration Tokens', () => {
    it('all duration tokens are within 150ms to 300ms bounds', () => {
      fc.assert(
        fc.property(animationDurationKeyArbitrary, (durationKey) => {
          const durationValue = animation.duration[durationKey];
          const durationMs = parseDurationMs(durationValue);
          
          // Duration must be a valid number
          if (isNaN(durationMs)) {
            return false;
          }
          
          // Duration must be within bounds (150ms to 300ms inclusive)
          return isWithinBounds(durationMs);
        }),
        { numRuns: 3 }
      );
    });

    it('all duration tokens have valid ms format', () => {
      fc.assert(
        fc.property(animationDurationKeyArbitrary, (durationKey) => {
          const durationValue = animation.duration[durationKey];
          
          // Must be a string
          if (typeof durationValue !== 'string') {
            return false;
          }
          
          // Must match the ms format (e.g., '150ms')
          const isValidFormat = /^\d+(?:\.\d+)?ms$/.test(durationValue);
          return isValidFormat;
        }),
        { numRuns: 3 }
      );
    });

    it('duration values are parseable to positive numbers', () => {
      fc.assert(
        fc.property(animationDurationKeyArbitrary, (durationKey) => {
          const durationValue = animation.duration[durationKey];
          const durationMs = parseDurationMs(durationValue);
          
          // Must be a valid positive number
          return !isNaN(durationMs) && durationMs > 0;
        }),
        { numRuns: 3 }
      );
    });
  });

  /**
   * Exhaustive verification of all duration tokens.
   * This test explicitly checks each token to ensure complete coverage.
   */
  describe('Exhaustive Duration Token Verification', () => {
    it('fast duration is within bounds (150ms-300ms)', () => {
      const durationMs = parseDurationMs(animation.duration.fast);
      expect(durationMs).toBeGreaterThanOrEqual(150);
      expect(durationMs).toBeLessThanOrEqual(300);
    });

    it('normal duration is within bounds (150ms-300ms)', () => {
      const durationMs = parseDurationMs(animation.duration.normal);
      expect(durationMs).toBeGreaterThanOrEqual(150);
      expect(durationMs).toBeLessThanOrEqual(300);
    });

    it('slow duration is within bounds (150ms-300ms)', () => {
      const durationMs = parseDurationMs(animation.duration.slow);
      expect(durationMs).toBeGreaterThanOrEqual(150);
      expect(durationMs).toBeLessThanOrEqual(300);
    });
  });
});
