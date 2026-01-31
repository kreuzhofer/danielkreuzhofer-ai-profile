'use client';

/**
 * TierSection Component
 *
 * Displays a section for a specific skill tier (Core Strengths, Working Knowledge, or Explicit Gaps)
 * with semantic heading structure and visual hierarchy based on tier configuration.
 *
 * @see Requirements 1.1, 1.5, 6.4, 8.1, 8.2, 8.3, 8.4
 */

import React from 'react';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';
import { TIER_CONFIGS } from '@/types/transparency-dashboard';

// =============================================================================
// Props Interface
// =============================================================================

export interface TierSectionProps {
  /** Section title */
  title: string;
  /** Section description */
  description: string;
  /** Skills to display in this tier */
  skills: Skill[];
  /** The tier type for styling */
  tier: SkillTier;
  /** Additional CSS classes */
  className?: string;
  /** Render function for skill cards (allows SkillCard to be passed in) */
  renderSkillCard?: (skill: Skill, index: number) => React.ReactNode;
  /** Children to render instead of default skill grid */
  children?: React.ReactNode;
  /** Additional data attributes */
  'data-testid'?: string;
}

// =============================================================================
// Styling Utilities
// =============================================================================

/**
 * Get grid styling classes based on tier card size
 * - large: 2 columns on desktop, larger gap
 * - medium: 3 columns on desktop, medium gap
 * - small: 4 columns on desktop, smaller gap
 */
function getGridClasses(cardSize: 'large' | 'medium' | 'small'): string {
  switch (cardSize) {
    case 'large':
      return 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6';
    case 'medium':
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4';
    case 'small':
      return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3';
    default:
      return 'grid grid-cols-1 md:grid-cols-2 gap-4';
  }
}

/**
 * Get section background and border styling based on tier emphasis
 */
function getSectionClasses(emphasis: 'high' | 'medium' | 'low'): string {
  const baseClasses = 'rounded-xl p-4 md:p-6';

  switch (emphasis) {
    case 'high':
      // Core strengths: prominent styling with emerald accent
      return `${baseClasses} bg-emerald-50/50 border-2 border-emerald-200`;
    case 'medium':
      // Working knowledge: neutral styling with blue accent
      return `${baseClasses} bg-blue-50/30 border border-blue-200`;
    case 'low':
      // Explicit gaps: subtle styling with slate accent
      return `${baseClasses} bg-slate-50/50 border border-slate-200`;
    default:
      return `${baseClasses} bg-gray-50 border border-gray-200`;
  }
}

/**
 * Get heading styling based on tier emphasis
 */
function getHeadingClasses(emphasis: 'high' | 'medium' | 'low'): string {
  switch (emphasis) {
    case 'high':
      return 'text-2xl md:text-3xl font-bold text-emerald-900';
    case 'medium':
      return 'text-xl md:text-2xl font-semibold text-blue-900';
    case 'low':
      return 'text-lg md:text-xl font-medium text-slate-700';
    default:
      return 'text-xl font-semibold text-gray-900';
  }
}

/**
 * Get description styling based on tier emphasis
 */
function getDescriptionClasses(emphasis: 'high' | 'medium' | 'low'): string {
  switch (emphasis) {
    case 'high':
      return 'text-base text-emerald-700';
    case 'medium':
      return 'text-sm text-blue-700';
    case 'low':
      return 'text-sm text-slate-600';
    default:
      return 'text-sm text-gray-600';
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * TierSection component displays a section for a specific skill tier.
 *
 * Features:
 * - Semantic h2 heading for proper document structure (Requirement 6.4)
 * - Visual hierarchy based on tier (Requirement 8.1-8.4)
 * - Responsive grid layout for skills
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <TierSection
 *   title="Core Strengths"
 *   description="Deep expertise with proven track record"
 *   skills={coreStrengthSkills}
 *   tier="core_strength"
 *   renderSkillCard={(skill) => <SkillCard skill={skill} />}
 * />
 * ```
 */
export function TierSection({
  title,
  description,
  skills,
  tier,
  className = '',
  renderSkillCard,
  children,
  'data-testid': dataTestId,
}: TierSectionProps) {
  const config = TIER_CONFIGS[tier];
  const { styling } = config;

  // Generate unique ID for accessibility
  const sectionId = `tier-section-${tier}`;
  const headingId = `${sectionId}-heading`;

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      className={`${getSectionClasses(styling.emphasis)} ${className} mb-8`}
      data-testid={dataTestId || `tier-section-${tier}`}
      data-tier={tier}
    >
      {/* Section Header */}
      <div className="mb-4 md:mb-6">
        {/* Semantic h2 heading for proper document structure (Requirement 6.4) */}
        <h2
          id={headingId}
          className={getHeadingClasses(styling.emphasis)}
          data-testid={`tier-heading-${tier}`}
        >
          {title}
        </h2>
        <p
          className={`mt-1 md:mt-2 ${getDescriptionClasses(styling.emphasis)}`}
          data-testid={`tier-description-${tier}`}
        >
          {description}
        </p>
      </div>

      {/* Render children if provided, otherwise render default skill grid */}
      {children ? (
        children
      ) : skills.length > 0 ? (
        <div
          className={getGridClasses(styling.cardSize)}
          data-testid={`tier-skills-grid-${tier}`}
          role="list"
          aria-label={`${title} skills`}
        >
          {skills.map((skill, index) => (
            <div
              key={skill.id}
              role="listitem"
              data-testid={`tier-skill-item-${tier}-${index}`}
            >
              {renderSkillCard ? (
                renderSkillCard(skill, index)
              ) : (
                // Placeholder for SkillCard (will be replaced when SkillCard is created)
                <div
                  className={`
                    p-3 md:p-4 rounded-lg bg-white shadow-sm border
                    ${styling.emphasis === 'high' ? 'border-emerald-100' : ''}
                    ${styling.emphasis === 'medium' ? 'border-blue-100' : ''}
                    ${styling.emphasis === 'low' ? 'border-slate-100' : ''}
                  `}
                  data-testid={`skill-placeholder-${skill.id}`}
                >
                  <div className="font-medium text-gray-900">{skill.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{skill.context}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-6 text-gray-500"
          data-testid={`tier-empty-${tier}`}
        >
          <p>No skills in this tier yet.</p>
        </div>
      )}
    </section>
  );
}

export default TierSection;
