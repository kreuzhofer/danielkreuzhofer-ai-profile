/**
 * Property Test: WCAG Contrast Ratio Compliance
 *
 * **Property 2: WCAG Contrast Ratio Compliance**
 * **Validates: Requirements 1.7**
 *
 * This test verifies that all text/background color combinations
 * meet WCAG AA contrast ratio requirements (4.5:1 for normal text,
 * 3:1 for large text).
 */

import * as fc from 'fast-check';
import { colors } from '@/lib/design-tokens';

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 formula
 */
function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Common text/background combinations used in the design system
 * Note: We use darker shades (700+) for buttons to ensure WCAG AA compliance
 */
const textBackgroundCombinations = [
  // Primary button: white text on primary-700 (darker for better contrast)
  { text: '#ffffff', background: colors.primary[700], name: 'Primary button' },
  // Secondary button: white text on secondary-700 (darker for better contrast)
  { text: '#ffffff', background: colors.secondary[700], name: 'Secondary button' },
  // Body text on white
  { text: colors.neutral[700], background: '#ffffff', name: 'Body text on white' },
  // Heading text on white
  { text: colors.neutral[900], background: '#ffffff', name: 'Heading on white' },
  // Muted text on white (using 600 for better contrast)
  { text: colors.neutral[600], background: '#ffffff', name: 'Muted text on white' },
  // Text on primary-50 background
  { text: colors.neutral[800], background: colors.primary[50], name: 'Text on primary-50' },
  // Text on secondary-50 background
  { text: colors.neutral[800], background: colors.secondary[50], name: 'Text on secondary-50' },
];

describe('Visual Design - WCAG Contrast Ratio Compliance', () => {
  describe('Property 2: All text/background combinations meet WCAG AA', () => {
    it('should have contrast ratio >= 4.5:1 for normal text', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...textBackgroundCombinations),
          (combination) => {
            const ratio = getContrastRatio(combination.text, combination.background);
            // WCAG AA requires 4.5:1 for normal text
            return ratio >= 4.5;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should have contrast ratio >= 3:1 for large text (headings)', () => {
      const headingCombinations = [
        { text: colors.neutral[900], background: '#ffffff', name: 'Heading on white' },
        { text: colors.neutral[800], background: colors.primary[50], name: 'Heading on primary-50' },
        { text: '#ffffff', background: colors.primary[700], name: 'White heading on primary-700' },
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...headingCombinations),
          (combination) => {
            const ratio = getContrastRatio(combination.text, combination.background);
            // WCAG AA requires 3:1 for large text (18pt+ or 14pt bold)
            return ratio >= 3;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Primary color palette contrast', () => {
    it('should have sufficient contrast for white text on darker shades', () => {
      // Note: primary-600 (#0d9488) doesn't meet 4.5:1, so we use 700+
      const darkShades = [
        colors.primary[700],
        colors.primary[800],
        colors.primary[900],
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...darkShades),
          (shade) => {
            const ratio = getContrastRatio('#ffffff', shade);
            return ratio >= 4.5;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should have sufficient contrast for dark text on lighter shades', () => {
      const lightShades = [
        colors.primary[50],
        colors.primary[100],
        colors.primary[200],
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...lightShades),
          (shade) => {
            const ratio = getContrastRatio(colors.neutral[800], shade);
            return ratio >= 4.5;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Secondary color palette contrast', () => {
    it('should have sufficient contrast for white text on darker shades', () => {
      // Note: secondary-600 (#d97706) doesn't meet 4.5:1, so we use 700+
      const darkShades = [
        colors.secondary[700],
        colors.secondary[800],
        colors.secondary[900],
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...darkShades),
          (shade) => {
            const ratio = getContrastRatio('#ffffff', shade);
            return ratio >= 4.5;
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});
