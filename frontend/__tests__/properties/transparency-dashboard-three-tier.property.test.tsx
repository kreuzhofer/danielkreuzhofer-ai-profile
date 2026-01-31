/**
 * Property Test: Three-Tier Section Rendering
 *
 * Feature: transparency-dashboard
 * Property 1: Three-Tier Section Rendering
 *
 * For any valid skill data set, the Transparency_Dashboard SHALL render exactly three
 * distinct Tier_Sections (Core_Strengths, Working_Knowledge, Explicit_Gaps) in the DOM,
 * with Core_Strengths appearing first in document order.
 *
 * **Validates: Requirements 1.1, 1.2**
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

/**
 * Arbitrary for generating a complete dashboard data set
 */
const dashboardDataArbitrary = fc.record({
  coreStrengths: fc.array(skillArbitrary('core_strength', true), { minLength: 0, maxLength: 3 }),
  workingKnowledge: fc.array(skillArbitrary('working_knowledge', false), { minLength: 0, maxLength: 3 }),
  gaps: fc.array(gapArbitrary, { minLength: 0, maxLength: 3 }),
});

// =============================================================================
// Property Tests
// =============================================================================

describe('Property 1: Three-Tier Section Rendering', () => {
  /**
   * Property: Dashboard SHALL render exactly three tier sections
   */
  it('renders exactly three tier sections for any valid data set', () => {
    fc.assert(
      fc.property(dashboardDataArbitrary, (data) => {
        const allSkills: Skill[] = [
          ...data.coreStrengths,
          ...data.workingKnowledge,
        ];

        const { container, unmount } = render(
          <TransparencyDashboardProvider initialSkills={allSkills} initialGaps={data.gaps}>
            <TransparencyDashboard />
          </TransparencyDashboardProvider>
        );

        // Should have exactly three tier sections
        const coreStrengthsSection = container.querySelector('[data-testid="core-strengths-section"]');
        const workingKnowledgeSection = container.querySelector('[data-testid="working-knowledge-section"]');
        const explicitGapsSection = container.querySelector('[data-testid="explicit-gaps-section"]');

        expect(coreStrengthsSection).toBeInTheDocument();
        expect(workingKnowledgeSection).toBeInTheDocument();
        expect(explicitGapsSection).toBeInTheDocument();

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Core Strengths section SHALL appear first in document order
   */
  it('renders Core Strengths section first in document order', () => {
    fc.assert(
      fc.property(dashboardDataArbitrary, (data) => {
        const allSkills: Skill[] = [
          ...data.coreStrengths,
          ...data.workingKnowledge,
        ];

        const { container, unmount } = render(
          <TransparencyDashboardProvider initialSkills={allSkills} initialGaps={data.gaps}>
            <TransparencyDashboard />
          </TransparencyDashboardProvider>
        );

        // Get all tier sections in document order
        const allSections = container.querySelectorAll('[data-testid$="-section"]');
        const sectionTestIds = Array.from(allSections).map(s => s.getAttribute('data-testid'));

        // Filter to only tier sections
        const tierSections = sectionTestIds.filter(id => 
          id === 'core-strengths-section' || 
          id === 'working-knowledge-section' || 
          id === 'explicit-gaps-section'
        );

        // Core Strengths should be first
        expect(tierSections[0]).toBe('core-strengths-section');

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Sections SHALL appear in correct order (Core, Working, Gaps)
   */
  it('renders sections in correct order: Core Strengths, Working Knowledge, Explicit Gaps', () => {
    fc.assert(
      fc.property(dashboardDataArbitrary, (data) => {
        const allSkills: Skill[] = [
          ...data.coreStrengths,
          ...data.workingKnowledge,
        ];

        const { container, unmount } = render(
          <TransparencyDashboardProvider initialSkills={allSkills} initialGaps={data.gaps}>
            <TransparencyDashboard />
          </TransparencyDashboardProvider>
        );

        // Get positions of each section
        const coreSection = container.querySelector('[data-testid="core-strengths-section"]');
        const workingSection = container.querySelector('[data-testid="working-knowledge-section"]');
        const gapsSection = container.querySelector('[data-testid="explicit-gaps-section"]');

        // All sections should exist
        expect(coreSection).toBeInTheDocument();
        expect(workingSection).toBeInTheDocument();
        expect(gapsSection).toBeInTheDocument();

        // Check document order using compareDocumentPosition
        if (coreSection && workingSection && gapsSection) {
          // Core should come before Working
          const coreBeforeWorking = coreSection.compareDocumentPosition(workingSection) & Node.DOCUMENT_POSITION_FOLLOWING;
          expect(coreBeforeWorking).toBeTruthy();

          // Working should come before Gaps
          const workingBeforeGaps = workingSection.compareDocumentPosition(gapsSection) & Node.DOCUMENT_POSITION_FOLLOWING;
          expect(workingBeforeGaps).toBeTruthy();
        }

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });
});
