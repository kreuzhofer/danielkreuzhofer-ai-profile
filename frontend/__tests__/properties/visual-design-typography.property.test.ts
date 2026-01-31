/**
 * Property Tests for Typography Line-Height Ranges
 *
 * This test validates that all font size tokens in the design system
 * have appropriate line-height values based on their category:
 * - Body text sizes (base, lg): line-height ratio 1.5-1.75
 * - Heading sizes (2xl and above): line-height ratio 1.1-1.3
 *
 * **Feature: 005-visual-design-upgrade, Property 3: Typography Line-Height Ranges**
 * **Validates: Requirements 2.3**
 */

import * as fc from 'fast-check';
import { typography } from '@/lib/design-tokens';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Font size tokens categorized by their usage
 */
const BODY_TEXT_SIZES = ['base', 'lg'] as const;
const HEADING_SIZES = ['2xl', '3xl', '4xl', '5xl', '6xl'] as const;

type BodyTextSize = typeof BODY_TEXT_SIZES[number];
type HeadingSize = typeof HEADING_SIZES[number];
type FontSizeKey = keyof typeof typography.fontSize;

/**
 * Parses a rem value string and returns the numeric value.
 * e.g., '1.5rem' => 1.5
 * Returns NaN if the format is invalid.
 */
function parseRemValue(value: string): number {
  if (typeof value !== 'string') {
    return NaN;
  }
  
  const match = value.match(/^(\d+(?:\.\d+)?)rem$/);
  if (!match) {
    return NaN;
  }
  
  return parseFloat(match[1]);
}

/**
 * Parses a line-height value which can be either:
 * - A unitless number (e.g., '1.2')
 * - A rem value (e.g., '1.75rem')
 * 
 * Returns the numeric value (unitless or rem value).
 */
function parseLineHeight(value: string): { value: number; hasUnits: boolean } {
  if (typeof value !== 'string') {
    return { value: NaN, hasUnits: false };
  }
  
  // Try to parse as rem value first
  const remMatch = value.match(/^(\d+(?:\.\d+)?)rem$/);
  if (remMatch) {
    return { value: parseFloat(remMatch[1]), hasUnits: true };
  }
  
  // Try to parse as unitless number
  const unitlessMatch = value.match(/^(\d+(?:\.\d+)?)$/);
  if (unitlessMatch) {
    return { value: parseFloat(unitlessMatch[1]), hasUnits: false };
  }
  
  return { value: NaN, hasUnits: false };
}

/**
 * Calculates the line-height ratio for a given font size token.
 * 
 * If line-height has units (rem), the ratio is calculated by dividing
 * line-height by font-size.
 * 
 * If line-height is unitless, it's already the ratio.
 */
function calculateLineHeightRatio(fontSizeKey: FontSizeKey): number {
  const config = typography.fontSize[fontSizeKey];
  const fontSize = parseRemValue(config.fontSize);
  const lineHeight = parseLineHeight(config.lineHeight);
  
  if (isNaN(fontSize) || isNaN(lineHeight.value)) {
    return NaN;
  }
  
  if (lineHeight.hasUnits) {
    // Line-height has rem units, calculate ratio
    return lineHeight.value / fontSize;
  } else {
    // Line-height is unitless, it's already the ratio
    return lineHeight.value;
  }
}

/**
 * Checks if a line-height ratio is within the body text range (1.5-1.75).
 */
function isWithinBodyTextRange(ratio: number): boolean {
  return ratio >= 1.5 && ratio <= 1.75;
}

/**
 * Checks if a line-height ratio is within the heading range (1.1-1.3).
 */
function isWithinHeadingRange(ratio: number): boolean {
  return ratio >= 1.1 && ratio <= 1.3;
}

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating body text size keys from the design system.
 */
const bodyTextSizeArbitrary = fc.constantFrom(...BODY_TEXT_SIZES);

/**
 * Arbitrary for generating heading size keys from the design system.
 */
const headingSizeArbitrary = fc.constantFrom(...HEADING_SIZES);

// =============================================================================
// Property 3: Typography Line-Height Ranges
// =============================================================================

/**
 * Feature: 005-visual-design-upgrade, Property 3: Typography Line-Height Ranges
 *
 * *For any* font size token in the type scale, the associated line-height SHALL
 * fall within the appropriate range: 1.5-1.75 for body text sizes (base, lg)
 * and 1.1-1.3 for heading sizes (2xl and above).
 *
 * **Validates: Requirements 2.3**
 */
describe('Property 3: Typography Line-Height Ranges', () => {
  describe('Body Text Line-Height Ranges', () => {
    it('body text sizes (base, lg) have line-height ratio within 1.5-1.75', () => {
      fc.assert(
        fc.property(bodyTextSizeArbitrary, (sizeKey) => {
          const ratio = calculateLineHeightRatio(sizeKey);
          
          // Ratio must be a valid number
          if (isNaN(ratio)) {
            return false;
          }
          
          // Ratio must be within body text range (1.5-1.75)
          return isWithinBodyTextRange(ratio);
        }),
        { numRuns: 3 }
      );
    });

    it('body text sizes have valid font-size and line-height values', () => {
      fc.assert(
        fc.property(bodyTextSizeArbitrary, (sizeKey) => {
          const config = typography.fontSize[sizeKey];
          
          // Font size must be a valid rem value
          const fontSize = parseRemValue(config.fontSize);
          if (isNaN(fontSize) || fontSize <= 0) {
            return false;
          }
          
          // Line height must be parseable
          const lineHeight = parseLineHeight(config.lineHeight);
          if (isNaN(lineHeight.value) || lineHeight.value <= 0) {
            return false;
          }
          
          return true;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Heading Line-Height Ranges', () => {
    it('heading sizes (2xl and above) have line-height ratio within 1.1-1.3', () => {
      fc.assert(
        fc.property(headingSizeArbitrary, (sizeKey) => {
          const ratio = calculateLineHeightRatio(sizeKey);
          
          // Ratio must be a valid number
          if (isNaN(ratio)) {
            return false;
          }
          
          // Ratio must be within heading range (1.1-1.3)
          return isWithinHeadingRange(ratio);
        }),
        { numRuns: 3 }
      );
    });

    it('heading sizes have valid font-size and line-height values', () => {
      fc.assert(
        fc.property(headingSizeArbitrary, (sizeKey) => {
          const config = typography.fontSize[sizeKey];
          
          // Font size must be a valid rem value
          const fontSize = parseRemValue(config.fontSize);
          if (isNaN(fontSize) || fontSize <= 0) {
            return false;
          }
          
          // Line height must be parseable
          const lineHeight = parseLineHeight(config.lineHeight);
          if (isNaN(lineHeight.value) || lineHeight.value <= 0) {
            return false;
          }
          
          return true;
        }),
        { numRuns: 3 }
      );
    });
  });

  /**
   * Exhaustive verification of all typography tokens.
   * This ensures complete coverage of all font size configurations.
   */
  describe('Exhaustive Typography Token Verification', () => {
    describe('Body Text Sizes', () => {
      it.each(BODY_TEXT_SIZES)('%s has line-height ratio within 1.5-1.75', (sizeKey) => {
        const ratio = calculateLineHeightRatio(sizeKey);
        expect(ratio).not.toBeNaN();
        expect(ratio).toBeGreaterThanOrEqual(1.5);
        expect(ratio).toBeLessThanOrEqual(1.75);
      });
    });

    describe('Heading Sizes', () => {
      it.each(HEADING_SIZES)('%s has line-height ratio within 1.1-1.3', (sizeKey) => {
        const ratio = calculateLineHeightRatio(sizeKey);
        expect(ratio).not.toBeNaN();
        expect(ratio).toBeGreaterThanOrEqual(1.1);
        expect(ratio).toBeLessThanOrEqual(1.3);
      });
    });
  });

  /**
   * Diagnostic test to show actual line-height ratios for debugging.
   */
  describe('Line-Height Ratio Diagnostics', () => {
    it('displays calculated ratios for all font sizes', () => {
      const allSizes = Object.keys(typography.fontSize) as FontSizeKey[];
      
      for (const sizeKey of allSizes) {
        const config = typography.fontSize[sizeKey];
        const ratio = calculateLineHeightRatio(sizeKey);
        
        // This test always passes but logs the values for debugging
        console.log(
          `${sizeKey}: fontSize=${config.fontSize}, lineHeight=${config.lineHeight}, ratio=${ratio.toFixed(3)}`
        );
        
        expect(ratio).not.toBeNaN();
      }
    });
  });
});
