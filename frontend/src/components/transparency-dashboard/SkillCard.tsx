'use client';

/**
 * SkillCard Component
 *
 * Displays a single skill with its tier indicator, context description,
 * years of experience, and evidence indicator.
 *
 * Features:
 * - Tier indicator with text label (not color-only) for accessibility (Requirement 6.6)
 * - Years of experience display when available (Requirement 2.2)
 * - Evidence indicator when evidence array is non-empty (Requirement 2.3)
 * - Minimum 44×44px touch target for interactive elements (Requirement 2.6)
 *
 * @see Requirements 2.1, 2.2, 2.3, 2.6, 6.6
 */

import React from 'react';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';
import { TIER_CONFIGS } from '@/types/transparency-dashboard';

// =============================================================================
// Props Interfaces
// =============================================================================

export interface SkillCardProps {
  /** The skill to display */
  skill: Skill;
  /** Callback when the card is clicked, receives the button element for focus management */
  onClick: (triggerElement: HTMLButtonElement) => void;
  /** Whether this card is currently selected */
  isSelected: boolean;
}

export interface TierBadgeProps {
  /** The tier to display */
  tier: SkillTier;
  /** Whether to show the full label or abbreviated */
  showLabel?: boolean;
}

export interface YearsIndicatorProps {
  /** Number of years of experience */
  years: number;
}

// =============================================================================
// Tier Badge Component
// =============================================================================

/**
 * Get tier badge styling based on tier type
 */
function getTierBadgeClasses(tier: SkillTier): string {
  const baseClasses = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium';

  switch (tier) {
    case 'core_strength':
      return `${baseClasses} bg-emerald-500/20 text-emerald-400 border border-emerald-500/30`;
    case 'working_knowledge':
      return `${baseClasses} bg-[var(--primary-500)]/20 text-[var(--primary-400)] border border-[var(--primary-500)]/30`;
    case 'explicit_gap':
      return `${baseClasses} bg-slate-500/20 text-slate-400 border border-slate-500/30`;
    default:
      return `${baseClasses} bg-[var(--surface-elevated)] text-[var(--foreground-muted)] border border-[var(--border)]`;
  }
}

/**
 * Get tier icon based on tier type
 * Uses simple SVG icons for accessibility
 */
function TierIcon({ tier }: { tier: SkillTier }) {
  switch (tier) {
    case 'core_strength':
      // Star icon for core strengths
      return (
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    case 'working_knowledge':
      // Book icon for working knowledge
      return (
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      );
    case 'explicit_gap':
      // Circle with slash for explicit gaps
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7" strokeWidth="1.5" />
          <line x1="5" y1="15" x2="15" y2="5" strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Get tier label text
 */
function getTierLabel(tier: SkillTier): string {
  const config = TIER_CONFIGS[tier];
  switch (tier) {
    case 'core_strength':
      return 'Core';
    case 'working_knowledge':
      return 'Working';
    case 'explicit_gap':
      return 'Gap';
    default:
      return config?.title || 'Unknown';
  }
}

/**
 * TierBadge displays the skill tier with both icon and text label
 * to ensure accessibility (not color-only indication).
 *
 * @see Requirement 6.6
 */
export function TierBadge({ tier, showLabel = true }: TierBadgeProps) {
  const label = getTierLabel(tier);

  return (
    <span
      className={getTierBadgeClasses(tier)}
      data-testid="tier-indicator"
      data-tier={tier}
    >
      <TierIcon tier={tier} />
      {showLabel && <span>{label}</span>}
    </span>
  );
}

// =============================================================================
// Years Indicator Component
// =============================================================================

/**
 * YearsIndicator displays the years of experience for a skill.
 *
 * @see Requirement 2.2
 */
export function YearsIndicator({ years }: YearsIndicatorProps) {
  const label = years === 1 ? 'year' : 'years';

  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-[var(--foreground-muted)]"
      data-testid="years-indicator"
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        {years} {label}
      </span>
    </span>
  );
}

// =============================================================================
// Evidence Indicator Component
// =============================================================================

/**
 * EvidenceIndicator shows that a skill has supporting evidence.
 *
 * @see Requirement 2.3
 */
function EvidenceIndicator({ count }: { count: number }) {
  const label = count === 1 ? 'evidence' : 'evidence items';

  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-[var(--foreground-muted)]"
      data-testid="evidence-indicator"
      aria-label={`${count} ${label} available`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{count} {label}</span>
    </span>
  );
}

// =============================================================================
// Card Styling Utilities
// =============================================================================

/**
 * Get card styling based on tier and selection state
 */
function getCardClasses(tier: SkillTier, isSelected: boolean): string {
  const baseClasses = `
    relative w-full min-h-[44px] p-4 rounded-lg
    bg-[var(--surface)] shadow-sm border
    transition-all duration-200 ease-in-out
    cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)]
    hover:shadow-md
  `;

  // Selection state
  const selectedClasses = isSelected ? 'ring-2 ring-offset-2' : '';

  // Tier-specific styling
  switch (tier) {
    case 'core_strength':
      return `${baseClasses} ${selectedClasses}
        border-emerald-500/30 hover:border-emerald-500/50
        focus:ring-emerald-500
        ${isSelected ? 'ring-emerald-500 bg-emerald-500/10' : ''}
      `;
    case 'working_knowledge':
      return `${baseClasses} ${selectedClasses}
        border-[var(--primary-500)]/30 hover:border-[var(--primary-500)]/50
        focus:ring-[var(--primary-500)]
        ${isSelected ? 'ring-[var(--primary-500)] bg-[var(--primary-500)]/10' : ''}
      `;
    case 'explicit_gap':
      return `${baseClasses} ${selectedClasses}
        border-slate-500/30 hover:border-slate-500/50
        focus:ring-slate-500
        ${isSelected ? 'ring-slate-500 bg-slate-500/10' : ''}
      `;
    default:
      return `${baseClasses} ${selectedClasses}
        border-[var(--border)] hover:border-[var(--foreground-subtle)]
        focus:ring-[var(--foreground-subtle)]
      `;
  }
}

// =============================================================================
// SkillCard Component
// =============================================================================

/**
 * SkillCard displays a single skill with its tier, context, and metadata.
 *
 * Features:
 * - Clickable card with 44×44px minimum touch target (Requirement 2.6)
 * - Tier indicator with text/icon (not color-only) (Requirement 6.6)
 * - Years of experience when available (Requirement 2.2)
 * - Evidence indicator when evidence exists (Requirement 2.3)
 * - Keyboard accessible (Enter/Space to activate)
 * - Passes button element to onClick for focus management (Requirement 3.6)
 *
 * @example
 * ```tsx
 * <SkillCard
 *   skill={skill}
 *   onClick={(triggerElement) => selectSkill(skill, triggerElement)}
 *   isSelected={selectedSkill?.id === skill.id}
 * />
 * ```
 */
export function SkillCard({ skill, onClick, isSelected }: SkillCardProps) {
  const { name, tier, context, yearsOfExperience, evidence } = skill;
  const hasEvidence = evidence && evidence.length > 0;
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Handle click - pass the button element for focus management
  const handleClick = () => {
    if (buttonRef.current) {
      onClick(buttonRef.current);
    }
  };

  // Handle keyboard activation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={getCardClasses(tier, isSelected)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
      aria-label={`${name} - ${TIER_CONFIGS[tier].title}. ${context}`}
      data-testid={`skill-card-${skill.id}`}
      data-skill-id={skill.id}
    >
      {/* Card Header: Name and Tier Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className="text-base font-semibold text-[var(--foreground)] text-left"
          data-testid="skill-name"
        >
          {name}
        </h3>
        <TierBadge tier={tier} />
      </div>

      {/* Context Description */}
      <p
        className="text-sm text-[var(--foreground-muted)] text-left mb-3 line-clamp-2"
        data-testid="skill-context"
      >
        {context}
      </p>

      {/* Metadata Row: Years and Evidence */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Years of Experience (Requirement 2.2) */}
        {yearsOfExperience !== undefined && yearsOfExperience > 0 && (
          <YearsIndicator years={yearsOfExperience} />
        )}

        {/* Evidence Indicator (Requirement 2.3) */}
        {hasEvidence && <EvidenceIndicator count={evidence.length} />}
      </div>
    </button>
  );
}

export default SkillCard;
