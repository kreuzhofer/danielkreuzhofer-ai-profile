/**
 * Property Test: Gaps Section Always Visible
 *
 * Feature: transparency-dashboard
 * Property 12: Gaps Section Always Visible
 *
 * For any rendered Transparency_Dashboard, the Explicit_Gaps section SHALL be present
 * in the DOM and not hidden (display: none or visibility: hidden).
 *
 * **Validates: Requirements 4.4**
 */

import React from 'react';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { TransparencyDashboardProvider } from '@/context/TransparencyDashboardContext';
import { TransparencyDashboard } from '@/app/transparency/TransparencyDashboard';
import type { Skill, ExplicitGap, SkillTier } from '@/types/transparency-dashboard';

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
 * Arbitrary for generating valid skills
 */
const skillArbitrary = (tier: SkillTier, requireEvidence: boolean = false) => fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  tier: fc.constant(tier),
  context: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  yearsOfExperience: fc.option(fc.integer({ min: 1, max: 30 }), { nil: undefined }),
  category: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  evidence: requireEvidence 
    ? fc.array(evidenceArbitrary, { minLength: 1, maxLength: 3 })
    : fc.array(evidenceArbitrary, { minLength: 0, maxLength: 3 }),
});

/**
 * Arbitrary for generating valid explicit gaps
 */
const gapArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  explanation: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  alternativeFocus: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
});

// =============================================================================
// Property Tests
// =============================================================================

describe('Property 12: Gaps Section Always Visible', () => {
  /**
   * Property: Gaps section SHALL be present in DOM even when empty
   */
  it('gaps section is present in DOM when gaps array is empty', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary('core_strength', true), { minLength: 0, maxLength: 3 }),
        fc.array(skillArbitrary('working_knowledge', false), { minLength: 0, maxLength: 3 }),
        (coreStrengths, workingKnowledge) => {
          const allSkills: Skill[] = [...coreStrengths, ...workingKnowledge];

          const { container, unmount } = render(
            <TransparencyDashboardProvider initialSkills={allSkills} initialGaps={[]}>
              <TransparencyDashboard />
            </TransparencyDashboardProvider>
          );

          // Gaps section should be present even with empty gaps array
          const gapsSection = container.querySelector('[data-testid="explicit-gaps-section"]');
          expect(gapsSection).toBeInTheDocument();

          // Empty message should be displayed
          const emptyMessage = container.querySelector('[data-testid="empty-gaps-message"]');
          expect(emptyMessage).toBeInTheDocument();

          unmount();
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Gaps section SHALL be present in DOM when gaps exist
   */
  it('gaps section is present in DOM when gaps array has items', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary('core_strength', true), { minLength: 0, maxLength: 3 }),
        fc.array(skillArbitrary('working_knowledge', false), { minLength: 0, maxLength: 3 }),
        fc.array(gapArbitrary, { minLength: 1, maxLength: 3 }),
        (coreStrengths, workingKnowledge, gaps) => {
          const allSkills: Skill[] = [...coreStrengths, ...workingKnowledge];

          const { container, unmount } = render(
            <TransparencyDashboardProvider initialSkills={allSkills} initialGaps={gaps}>
              <TransparencyDashboard />
            </TransparencyDashboardProvider>
          );

          // Gaps section should be present
          const gapsSection = container.querySelector('[data-testid="explicit-gaps-section"]');
          expect(gapsSection).toBeInTheDocument();

          // Gap cards should be displayed
          const gapCards = container.querySelectorAll('[data-testid^="gap-card-"]');
          expect(gapCards.length).toBe(gaps.length);

          unmount();
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Gaps section SHALL NOT be hidden (display: none or visibility: hidden)
   */
  it('gaps section is not hidden via CSS', () => {
    fc.assert(
      fc.property(
        fc.array(gapArbitrary, { minLength: 0, maxLength: 3 }),
        (gaps) => {
          const { container, unmount } = render(
            <TransparencyDashboardProvider initialSkills={[]} initialGaps={gaps}>
              <TransparencyDashboard />
            </TransparencyDashboardProvider>
          );

          const gapsSection = container.querySelector('[data-testid="explicit-gaps-section"]');
          expect(gapsSection).toBeInTheDocument();

          if (gapsSection) {
            const computedStyle = window.getComputedStyle(gapsSection);
            // Should not be hidden
            expect(computedStyle.display).not.toBe('none');
            expect(computedStyle.visibility).not.toBe('hidden');
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });
});
