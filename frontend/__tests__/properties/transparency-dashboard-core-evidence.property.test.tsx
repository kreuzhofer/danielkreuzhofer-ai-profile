/**
 * Property Test: Core Strength Evidence Requirement
 *
 * Feature: transparency-dashboard
 * Property 13: Core Strength Evidence Requirement
 *
 * For any Skill in the Core_Strengths tier, it SHALL have at least one Evidence item,
 * and skills without evidence SHALL NOT be displayed in the Core_Strengths tier.
 *
 * **Validates: Requirements 5.1, 5.4**
 */

import React from 'react';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { TransparencyDashboardProvider } from '@/context/TransparencyDashboardContext';
import { TransparencyDashboard } from '@/app/transparency/TransparencyDashboard';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';

// =============================================================================
// Arbitraries
// =============================================================================

/**
 * Arbitrary for generating valid evidence items
 */
const evidenceArbitrary = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('project', 'experience', 'certification') as fc.Arbitrary<'project' | 'experience' | 'certification'>,
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  reference: fc.string({ minLength: 1, maxLength: 100 }).map(s => `/${s.replace(/^\/+/, '')}`),
});

/**
 * Arbitrary for generating core strength skills WITH evidence
 */
const coreStrengthWithEvidenceArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  tier: fc.constant('core_strength' as SkillTier),
  context: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  yearsOfExperience: fc.option(fc.integer({ min: 1, max: 30 }), { nil: undefined }),
  category: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  evidence: fc.array(evidenceArbitrary, { minLength: 1, maxLength: 3 }),
});

/**
 * Arbitrary for generating core strength skills WITHOUT evidence
 */
const coreStrengthWithoutEvidenceArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  tier: fc.constant('core_strength' as SkillTier),
  context: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  yearsOfExperience: fc.option(fc.integer({ min: 1, max: 30 }), { nil: undefined }),
  category: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  evidence: fc.constant([]),
});

// =============================================================================
// Property Tests
// =============================================================================

describe('Property 13: Core Strength Evidence Requirement', () => {
  /**
   * Property: Core strengths WITH evidence SHALL be displayed
   */
  it('displays core strength skills that have evidence', () => {
    fc.assert(
      fc.property(
        fc.array(coreStrengthWithEvidenceArbitrary, { minLength: 1, maxLength: 3 }),
        (coreStrengths) => {
          const { container, unmount } = render(
            <TransparencyDashboardProvider initialSkills={coreStrengths} initialGaps={[]}>
              <TransparencyDashboard />
            </TransparencyDashboardProvider>
          );

          // Each core strength with evidence should be displayed
          for (const skill of coreStrengths) {
            const skillCard = container.querySelector(`[data-testid="skill-card-${skill.id}"]`);
            expect(skillCard).toBeInTheDocument();
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Core strengths WITHOUT evidence SHALL NOT be displayed
   */
  it('does not display core strength skills without evidence', () => {
    fc.assert(
      fc.property(
        fc.array(coreStrengthWithoutEvidenceArbitrary, { minLength: 1, maxLength: 3 }),
        (coreStrengthsWithoutEvidence) => {
          const { container, unmount } = render(
            <TransparencyDashboardProvider initialSkills={coreStrengthsWithoutEvidence} initialGaps={[]}>
              <TransparencyDashboard />
            </TransparencyDashboardProvider>
          );

          // Core strengths without evidence should NOT be displayed
          for (const skill of coreStrengthsWithoutEvidence) {
            const skillCard = container.querySelector(`[data-testid="skill-card-${skill.id}"]`);
            expect(skillCard).not.toBeInTheDocument();
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Mixed core strengths - only those with evidence are displayed
   */
  it('filters out core strengths without evidence from mixed set', () => {
    fc.assert(
      fc.property(
        fc.array(coreStrengthWithEvidenceArbitrary, { minLength: 1, maxLength: 2 }),
        fc.array(coreStrengthWithoutEvidenceArbitrary, { minLength: 1, maxLength: 2 }),
        (withEvidence, withoutEvidence) => {
          const allSkills: Skill[] = [...withEvidence, ...withoutEvidence];

          const { container, unmount } = render(
            <TransparencyDashboardProvider initialSkills={allSkills} initialGaps={[]}>
              <TransparencyDashboard />
            </TransparencyDashboardProvider>
          );

          // Skills WITH evidence should be displayed
          for (const skill of withEvidence) {
            const skillCard = container.querySelector(`[data-testid="skill-card-${skill.id}"]`);
            expect(skillCard).toBeInTheDocument();
          }

          // Skills WITHOUT evidence should NOT be displayed
          for (const skill of withoutEvidence) {
            const skillCard = container.querySelector(`[data-testid="skill-card-${skill.id}"]`);
            expect(skillCard).not.toBeInTheDocument();
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });
});
