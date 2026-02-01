'use client';

import React from 'react';

/**
 * Props for the SuggestionChips component
 */
export interface SuggestionChipsProps {
  /** Array of suggestion strings to display */
  suggestions: string[];
  /** Callback when a suggestion is clicked */
  onSelect: (suggestion: string) => void;
  /** Whether the chips are disabled */
  disabled?: boolean;
  /** Optional label for accessibility */
  label?: string;
}

/**
 * SuggestionChips component - displays clickable suggestion buttons in a conversational style.
 *
 * Features:
 * - Compact, rounded tag-style buttons
 * - Wrapping layout for multiple suggestions
 * - Hover and focus states for interactivity
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <SuggestionChips
 *   suggestions={["What's your experience?", "Tell me about AWS"]}
 *   onSelect={(q) => sendMessage(q)}
 * />
 * ```
 */
export function SuggestionChips({
  suggestions,
  onSelect,
  disabled = false,
  label = 'Suggested questions',
}: SuggestionChipsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap gap-2 mt-3"
      role="group"
      aria-label={label}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion}-${index}`}
          type="button"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className={`
            inline-flex items-center
            px-3 py-1.5
            text-sm
            bg-[var(--primary-900)] text-[var(--primary-300)]
            border border-[var(--primary-800)]
            rounded-full
            transition-all duration-150
            hover:bg-[var(--primary-800)] hover:border-[var(--primary-700)]
            focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-1
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary-900)]
            cursor-pointer
          `}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

export default SuggestionChips;
