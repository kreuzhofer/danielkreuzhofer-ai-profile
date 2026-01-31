/**
 * Property Tests for Color Tokens as CSS Variables
 *
 * This test validates that all color tokens defined in the design system
 * are accessible as CSS custom properties with valid CSS color values.
 *
 * **Feature: 005-visual-design-upgrade, Property 1: Color Tokens as CSS Variables**
 * **Validates: Requirements 1.4**
 */

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { colors } from '@/lib/design-tokens';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Valid color shade keys in the design system
 */
const COLOR_SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;
type ColorShade = typeof COLOR_SHADES[number];

/**
 * Valid color palette names in the design system
 */
const COLOR_PALETTES = ['primary', 'secondary', 'neutral'] as const;
type ColorPalette = typeof COLOR_PALETTES[number];

/**
 * Generates the CSS variable name for a color token
 * e.g., ('primary', '500') => '--primary-500'
 */
function getCssVariableName(palette: ColorPalette, shade: ColorShade): string {
  return `--${palette}-${shade}`;
}

/**
 * Validates that a string is a valid hex color format
 * Accepts both 3-digit (#RGB) and 6-digit (#RRGGBB) hex colors
 */
function isValidHexColor(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  // Match #RGB or #RRGGBB format
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

/**
 * Reads the globals.css file and extracts CSS variable definitions
 */
function extractCssVariables(): Map<string, string> {
  const globalsPath = path.join(__dirname, '../../src/app/globals.css');
  const cssContent = fs.readFileSync(globalsPath, 'utf-8');
  
  const variables = new Map<string, string>();
  
  // Match CSS variable definitions like: --primary-500: #14b8a6;
  const variableRegex = /--(primary|secondary|neutral)-(\d+):\s*([^;]+);/g;
  let match;
  
  while ((match = variableRegex.exec(cssContent)) !== null) {
    const varName = `--${match[1]}-${match[2]}`;
    const varValue = match[3].trim();
    variables.set(varName, varValue);
  }
  
  return variables;
}

// Cache the CSS variables to avoid re-reading the file for each test
let cachedCssVariables: Map<string, string> | null = null;

function getCssVariables(): Map<string, string> {
  if (!cachedCssVariables) {
    cachedCssVariables = extractCssVariables();
  }
  return cachedCssVariables;
}

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating color palette names from the design system
 */
const colorPaletteArbitrary = fc.constantFrom(...COLOR_PALETTES);

/**
 * Arbitrary for generating color shade keys from the design system
 */
const colorShadeArbitrary = fc.constantFrom(...COLOR_SHADES);

/**
 * Arbitrary for generating color token combinations (palette + shade)
 */
const colorTokenArbitrary = fc.tuple(colorPaletteArbitrary, colorShadeArbitrary);

// =============================================================================
// Property 1: Color Tokens as CSS Variables
// =============================================================================

/**
 * Feature: 005-visual-design-upgrade, Property 1: Color Tokens as CSS Variables
 *
 * *For any* color token defined in the design system (primary, secondary, neutral palettes),
 * the token SHALL be accessible as a CSS custom property with a valid CSS color value.
 *
 * **Validates: Requirements 1.4**
 */
describe('Property 1: Color Tokens as CSS Variables', () => {
  describe('Color Token to CSS Variable Mapping', () => {
    it('each color token has a corresponding CSS variable defined', () => {
      const cssVariables = getCssVariables();
      
      fc.assert(
        fc.property(colorTokenArbitrary, ([palette, shade]) => {
          const cssVarName = getCssVariableName(palette, shade);
          
          // CSS variable must exist in globals.css
          return cssVariables.has(cssVarName);
        }),
        { numRuns: 3 }
      );
    });

    it('CSS variable values match design token values', () => {
      const cssVariables = getCssVariables();
      
      fc.assert(
        fc.property(colorTokenArbitrary, ([palette, shade]) => {
          const cssVarName = getCssVariableName(palette, shade);
          const cssValue = cssVariables.get(cssVarName);
          const tokenValue = colors[palette][shade];
          
          // CSS variable value must match the design token value
          return cssValue === tokenValue;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('CSS Variable Value Format', () => {
    it('all CSS variable values are valid hex colors', () => {
      const cssVariables = getCssVariables();
      
      fc.assert(
        fc.property(colorTokenArbitrary, ([palette, shade]) => {
          const cssVarName = getCssVariableName(palette, shade);
          const cssValue = cssVariables.get(cssVarName);
          
          // CSS variable value must be a valid hex color
          return cssValue !== undefined && isValidHexColor(cssValue);
        }),
        { numRuns: 3 }
      );
    });

    it('all design token values are valid hex colors', () => {
      fc.assert(
        fc.property(colorTokenArbitrary, ([palette, shade]) => {
          const tokenValue = colors[palette][shade];
          
          // Design token value must be a valid hex color
          return isValidHexColor(tokenValue);
        }),
        { numRuns: 3 }
      );
    });
  });

  /**
   * Exhaustive verification of all color tokens.
   * This ensures complete coverage of all palette/shade combinations.
   */
  describe('Exhaustive Color Token Verification', () => {
    describe('Primary Palette', () => {
      const cssVariables = getCssVariables();
      
      it.each(COLOR_SHADES)('--primary-%s exists and is valid hex', (shade) => {
        const cssVarName = `--primary-${shade}`;
        const cssValue = cssVariables.get(cssVarName);
        const tokenValue = colors.primary[shade];
        
        expect(cssValue).toBeDefined();
        expect(cssValue).toBe(tokenValue);
        expect(isValidHexColor(cssValue!)).toBe(true);
      });
    });

    describe('Secondary Palette', () => {
      const cssVariables = getCssVariables();
      
      it.each(COLOR_SHADES)('--secondary-%s exists and is valid hex', (shade) => {
        const cssVarName = `--secondary-${shade}`;
        const cssValue = cssVariables.get(cssVarName);
        const tokenValue = colors.secondary[shade];
        
        expect(cssValue).toBeDefined();
        expect(cssValue).toBe(tokenValue);
        expect(isValidHexColor(cssValue!)).toBe(true);
      });
    });

    describe('Neutral Palette', () => {
      const cssVariables = getCssVariables();
      
      it.each(COLOR_SHADES)('--neutral-%s exists and is valid hex', (shade) => {
        const cssVarName = `--neutral-${shade}`;
        const cssValue = cssVariables.get(cssVarName);
        const tokenValue = colors.neutral[shade];
        
        expect(cssValue).toBeDefined();
        expect(cssValue).toBe(tokenValue);
        expect(isValidHexColor(cssValue!)).toBe(true);
      });
    });
  });
});
