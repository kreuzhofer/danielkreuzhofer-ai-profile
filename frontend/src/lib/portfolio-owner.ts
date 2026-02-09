/**
 * Portfolio Owner Configuration
 *
 * Single source of truth for the portfolio owner's identity.
 * Used by system prompts, fit analysis, guardrails, and UI components
 * to avoid hardcoding the name across the codebase.
 */

export const PORTFOLIO_OWNER = {
  /** Full name */
  name: 'Daniel Kreuzhofer',
  /** First name (for casual references) */
  firstName: 'Daniel',
  /** Professional title / role */
  role: 'Senior Solutions Architect',
  /** Current employer */
  employer: 'Amazon Web Services',
} as const;
