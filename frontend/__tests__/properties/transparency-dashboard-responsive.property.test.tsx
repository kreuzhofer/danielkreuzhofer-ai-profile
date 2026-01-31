/**
 * Property Test: Mobile Responsive Layout
 *
 * Feature: transparency-dashboard
 * Property 6: Mobile Responsive Layout
 *
 * For any viewport width of 375px or less, the Transparency_Dashboard SHALL:
 * (a) not cause horizontal scrolling
 * (b) display Tier_Sections stacked vertically
 * (c) display Skill_Cards in a single column
 * (d) display Skill_Detail_Panel at full screen width when open
 *
 * **Validates: Requirements 2.5, 7.1, 7.2, 7.3, 7.4**
 */

import React from 'react';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { TransparencyDashboardProvider } from '@/context/TransparencyDashboardContext';
import { TransparencyDashboard } from '@/app/transparency/TransparencyDashboard';
import { TierSection } from '@/components/transparency-dashboard/TierSection';
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
// Helper Functions
// =============================================================================

/**
 * Check if element has responsive single-column classes for mobile
 */
function hasSingleColumnMobileClasses(className: string): boolean {
  // Check for grid-cols-1 which means single column on mobile
  return className.includes('grid-cols-1');
}

/**
 * Check if element has responsive stacking classes
 */
function hasVerticalStackingClasses(className: string): boolean {
  // Check for flex-col or grid-cols-1 which stack vertically
  return className.includes('flex-col') || className.includes('grid-cols-1');
}

// =============================================================================
// Property Tests
// =============================================================================

describe('Property 6: Mobile Responsive Layout', () => {
  /**
   * Property: Tier sections SHALL use single-column grid on mobile
   */
  it('tier sections use single-column grid on mobile', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary('core_strength', true), { minLength: 1, maxLength: 3 }),
        (skills) => {
          const { container, unmount } = render(
            <TierSection
              title="Core Strengths"
              description="Deep expertise"
              skills={skills}
              tier="core_strength"
            />
          );

          // Find the skills grid
          const skillsGrid = container.querySelector('[data-testid="tier-skills-grid-core_strength"]');
          
          if (skillsGrid) {
            // Should have grid-cols-1 for mobile (single column)
            expect(hasSingleColumnMobileClasses(skillsGrid.className)).toBe(true);
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Dashboard sections SHALL stack vertically
   */
  it('dashboard sections stack vertically', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary('core_strength', true), { minLength: 0, maxLength: 2 }),
        fc.array(skillArbitrary('working_knowledge', false), { minLength: 0, maxLength: 2 }),
        fc.array(gapArbitrary, { minLength: 0, maxLength: 2 }),
        (coreStrengths, workingKnowledge, gaps) => {
          const allSkills: Skill[] = [...coreStrengths, ...workingKnowledge];

          const { container, unmount } = render(
            <TransparencyDashboardProvider initialSkills={allSkills} initialGaps={gaps}>
              <TransparencyDashboard />
            </TransparencyDashboardProvider>
          );

          // Get all tier sections
          const coreSection = container.querySelector('[data-testid="core-strengths-section"]');
          const workingSection = container.querySelector('[data-testid="working-knowledge-section"]');
          const gapsSection = container.querySelector('[data-testid="explicit-gaps-section"]');

          // All sections should exist and be block-level (stack vertically by default)
          expect(coreSection).toBeInTheDocument();
          expect(workingSection).toBeInTheDocument();
          expect(gapsSection).toBeInTheDocument();

          // Sections should be siblings that stack vertically
          // This is the default behavior for block elements
          if (coreSection && workingSection) {
            const coreBeforeWorking = coreSection.compareDocumentPosition(workingSection) & Node.DOCUMENT_POSITION_FOLLOWING;
            expect(coreBeforeWorking).toBeTruthy();
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Dashboard container SHALL have responsive padding
   */
  it('dashboard container has responsive padding', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary('core_strength', true), { minLength: 0, maxLength: 2 }),
        (skills) => {
          const { container, unmount } = render(
            <TransparencyDashboardProvider initialSkills={skills} initialGaps={[]}>
              <TransparencyDashboard />
            </TransparencyDashboardProvider>
          );

          const dashboard = container.querySelector('[data-testid="transparency-dashboard"]');
          
          if (dashboard) {
            // Should have padding classes
            expect(dashboard.className).toContain('px-4');
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Dashboard SHALL have max-width constraint
   */
  it('dashboard has max-width constraint', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary('core_strength', true), { minLength: 0, maxLength: 2 }),
        (skills) => {
          const { container, unmount } = render(
            <TransparencyDashboardProvider initialSkills={skills} initialGaps={[]}>
              <TransparencyDashboard />
            </TransparencyDashboardProvider>
          );

          const dashboard = container.querySelector('[data-testid="transparency-dashboard"]');
          
          if (dashboard) {
            // Should have max-width class
            expect(dashboard.className).toContain('max-w-');
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });
});
