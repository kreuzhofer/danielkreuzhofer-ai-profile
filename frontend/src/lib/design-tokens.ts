/**
 * Design Tokens for Visual Design System
 *
 * COLOR PALETTE: "Thoughtful Innovator"
 * 
 * Personality: Creative & innovative, calm & focused, thoughtful communication
 * Impression: Innovative & forward-thinking
 *
 * This file defines the core design tokens used throughout the portfolio website.
 * These tokens provide a single source of truth for colors, typography, and animations.
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
 * - Primary (Indigo): Innovation, creativity, wisdom, technology
 * - Secondary (Orange): Energy, enthusiasm, warmth, action
 * - Neutral (Slate): Calm, focused, professional
 */
export const colors = {
  /**
   * Primary palette - Deep Indigo
   * Conveys innovation, creativity, wisdom, and technology
   */
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Primary accent
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  /**
   * Secondary palette - Warm Coral/Orange
   * Conveys energy, enthusiasm, warmth, and action
   */
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Secondary accent
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  /**
   * Neutral palette - Cool Slate
   * Calm, focused, professional feel
   */
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
} as const;

/**
 * Semantic colors for status indicators
 */
export const semanticColors = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4', // Cyan for tech-forward feel
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
    dark: `linear-gradient(135deg, ${colors.primary[950]} 0%, #0f172a 50%, ${colors.secondary[950]} 100%)`,
  },
  section: {
    light: `linear-gradient(180deg, #ffffff 0%, ${colors.primary[50]} 100%)`,
    dark: `linear-gradient(180deg, #0f172a 0%, ${colors.primary[950]} 100%)`,
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
