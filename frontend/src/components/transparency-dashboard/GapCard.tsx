'use client';

/**
 * GapCard Component
 *
 * Displays an explicit gap with its name and explanation.
 * Uses subtle styling (slate/gray tones) that is visible but not attention-grabbing.
 *
 * Features:
 * - Displays gap name and explanation (Requirements 4.1, 4.2)
 * - Shows alternative focus when provided
 * - Uses subtle styling that signals focus, not limitation (Requirement 4.6)
 * - Non-interactive (unlike SkillCard)
 *
 * @see Requirements 1.4, 4.1, 4.2, 4.6
 */

import React from 'react';
import type { ExplicitGap } from '@/types/transparency-dashboard';

// =============================================================================
// Props Interface
// =============================================================================

export interface GapCardProps {
  /** The explicit gap to display */
  gap: ExplicitGap;
}

// =============================================================================
// GapCard Component
// =============================================================================

/**
 * GapCard displays an explicit gap with its name and explanation.
 *
 * The card uses subtle styling (slate/gray tones) to be visible but not
 * attention-grabbing, framing gaps as focus decisions rather than limitations.
 *
 * @example
 * ```tsx
 * <GapCard
 *   gap={{
 *     id: 'gap-mobile-native',
 *     name: 'Native Mobile Development',
 *     explanation: 'Chose to focus on web and cloud architecture',
 *     alternativeFocus: 'Progressive Web Apps and responsive design',
 *   }}
 * />
 * ```
 */
export function GapCard({ gap }: GapCardProps) {
  const { id, name, explanation, alternativeFocus } = gap;

  return (
    <div
      className="p-4 rounded-lg bg-slate-500/10 border border-slate-500/30"
      data-testid={`gap-card-${id}`}
      data-gap-id={id}
    >
      {/* Gap Name */}
      <div className="flex items-start gap-2 mb-2">
        {/* Icon indicating intentional gap */}
        <span
          className="flex-shrink-0 mt-0.5 text-slate-500"
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 20 20"
          >
            <circle cx="10" cy="10" r="7" strokeWidth="1.5" />
            <line x1="5" y1="15" x2="15" y2="5" strokeWidth="1.5" />
          </svg>
        </span>
        <h3
          className="text-base font-medium text-slate-300"
          data-testid={`gap-name-${id}`}
        >
          {name}
        </h3>
      </div>

      {/* Gap Explanation (Requirement 4.2) */}
      <p
        className="text-sm text-slate-400 ml-6"
        data-testid={`gap-explanation-${id}`}
      >
        {explanation}
      </p>

      {/* Alternative Focus (if provided) */}
      {alternativeFocus && (
        <div
          className="mt-2 ml-6 text-sm text-slate-500 italic"
          data-testid={`gap-alternative-${id}`}
        >
          <span className="font-medium not-italic text-slate-400">Instead:</span> {alternativeFocus}
        </div>
      )}
    </div>
  );
}

export default GapCard;
