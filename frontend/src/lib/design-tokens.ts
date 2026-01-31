/**
 * Design Tokens for Visual Design System
 *
 * This file defines the core design tokens used throughout the portfolio website.
 * These tokens provide a single source of truth for colors, typography, and animations.
 *
 * Requirements: 1.1, 1.2, 1.4, 1.8, 4.4
 */

/**
 * Color palette type for consistent color scales
 */
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

/**
 * Color palettes for the design system
 *
 * - Primary (Teal): Conveys trust and expertise (Requirement 1.1)
 * - Secondary (Amber): For CTAs and interactive highlights (Requirement 1.2)
 * - Neutral (Gray): For text and backgrounds
 */
export const colors = {
  /**
   * Primary palette - Deep teal for trust/expertise
   * Used for primary actions, links, and brand elements
   */
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Primary accent
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
  /**
   * Secondary palette - Warm amber for CTAs
   * Used for call-to-action buttons and interactive highlights
   */
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Secondary accent
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  /**
   * Neutral palette - Gray scale
   * Used for text, backgrounds, and borders
   */
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
} as const;

/**
 * Semantic colors for status indicators
 * Requirement 1.8: Define semantic color tokens for success, warning, and error states
 */
export const semanticColors = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

/**
 * Font size configuration type
 */
export interface FontSizeConfig {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
}

/**
 * Typography configuration
 *
 * Requirement 2.1: Use Inter or similar modern sans-serif font for headings
 * Requirement 2.2: Define a type scale with at least 6 distinct sizes
 * Requirement 2.3: Define appropriate line-height values
 * Requirement 2.4: Define letter-spacing adjustments for headings and small text
 */
export const typography = {
  /**
   * Font families
   * - sans: Inter for headings and body text
   * - mono: Geist Mono for code blocks
   */
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Geist Mono', 'monospace'],
  },
  /**
   * Font size scale with line-height and letter-spacing
   * Line-heights: 1.5-1.75 for body text, 1.1-1.3 for headings
   */
  fontSize: {
    xs: { fontSize: '0.75rem', lineHeight: '1rem', letterSpacing: '0.025em' },
    sm: { fontSize: '0.875rem', lineHeight: '1.25rem' },
    base: { fontSize: '1rem', lineHeight: '1.75rem' },
    lg: { fontSize: '1.125rem', lineHeight: '1.75rem' },
    xl: { fontSize: '1.25rem', lineHeight: '1.75rem' },
    '2xl': { fontSize: '1.5rem', lineHeight: '1.3' },
    '3xl': { fontSize: '1.875rem', lineHeight: '1.25' },
    '4xl': { fontSize: '2.25rem', lineHeight: '1.2', letterSpacing: '-0.02em' },
    '5xl': { fontSize: '3rem', lineHeight: '1.2', letterSpacing: '-0.02em' },
    '6xl': { fontSize: '3.75rem', lineHeight: '1.1', letterSpacing: '-0.02em' },
  },
} as const;

/**
 * Animation timing tokens
 *
 * Requirement 4.4: Define transition durations between 150-300ms
 */
export const animation = {
  /**
   * Duration tokens for animations
   * - fast: Quick micro-interactions (150ms)
   * - normal: Standard transitions (200ms)
   * - slow: Emphasis animations (300ms)
   */
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  /**
   * Easing functions for smooth animations
   */
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Shadow tokens for elevation
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  hover: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

/**
 * Gradient tokens for backgrounds
 */
export const gradients = {
  hero: {
    light: `linear-gradient(135deg, ${colors.primary[50]} 0%, #ffffff 50%, ${colors.secondary[50]} 100%)`,
    dark: `linear-gradient(135deg, ${colors.primary[950]} 0%, #09090b 50%, ${colors.secondary[950]} 100%)`,
  },
  section: {
    light: `linear-gradient(180deg, #ffffff 0%, ${colors.primary[50]} 100%)`,
    dark: `linear-gradient(180deg, #09090b 0%, ${colors.primary[950]} 100%)`,
  },
} as const;

/**
 * Complete design tokens export
 */
export const designTokens = {
  colors,
  semanticColors,
  typography,
  animation,
  shadows,
  gradients,
} as const;

/**
 * Type exports for TypeScript consumers
 */
export type Colors = typeof colors;
export type SemanticColors = typeof semanticColors;
export type Typography = typeof typography;
export type Animation = typeof animation;
export type Shadows = typeof shadows;
export type Gradients = typeof gradients;
export type DesignTokens = typeof designTokens;

/**
 * Helper to get animation duration in milliseconds
 */
export function getAnimationDurationMs(
  duration: keyof typeof animation.duration
): number {
  const value = animation.duration[duration];
  return parseInt(value.replace('ms', ''), 10);
}

/**
 * Helper to get color value from palette
 */
export function getColor(
  palette: keyof typeof colors,
  shade: keyof ColorScale
): string {
  return colors[palette][shade];
}

/**
 * Helper to get font size configuration
 */
export function getFontSize(
  size: keyof typeof typography.fontSize
): FontSizeConfig {
  return typography.fontSize[size];
}
