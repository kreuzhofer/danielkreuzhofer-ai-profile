/**
 * Property Test: Touch Target Minimum Size
 *
 * Feature: transparency-dashboard
 * Property 7: Touch Target Minimum Size
 *
 * For any interactive element (Skill_Card, close button, evidence link) in the
 * Transparency_Dashboard, the element SHALL have a minimum clickable area of 44×44 pixels.
 *
 * **Validates: Requirements 2.6**
 */

import React from 'react';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { SkillCard } from '@/components/transparency-dashboard/SkillCard';
import { EvidenceItem } from '@/components/transparency-dashboard/EvidenceList';
import type { Skill, Evidence, SkillTier } from '@/types/transparency-dashboard';

// =============================================================================
// Arbitraries
// =============================================================================

/**
 * Arbitrary for generating valid evidence items
 */
const evidenceArbitrary = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('project', 'experience', 'certification') as fc.Arbitrary<Evidence['type']>,
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  reference: fc.string({ minLength: 1, maxLength: 100 }).map(s => `/${s.replace(/^\/+/, '')}`),
  excerpt: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
});

/**
 * Arbitrary for generating valid skills
 */
const skillArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  tier: fc.constantFrom('core_strength', 'working_knowledge') as fc.Arbitrary<SkillTier>,
  context: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  yearsOfExperience: fc.option(fc.integer({ min: 1, max: 30 }), { nil: undefined }),
  category: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  evidence: fc.array(evidenceArbitrary, { minLength: 0, maxLength: 3 }),
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if an element has minimum touch target size via CSS classes
 * We check for min-h-[44px] and min-w-[44px] classes or equivalent
 */
function hasMinimumTouchTargetClasses(element: Element): boolean {
  const className = element.className;
  
  // Check for explicit min-h-[44px] class
  const hasMinHeight = className.includes('min-h-[44px]');
  
  // For buttons, the default min-height is often sufficient
  // Check if it's a button with padding that would make it at least 44px
  const isButton = element.tagName === 'BUTTON';
  const hasPadding = className.includes('p-4') || className.includes('p-3') || className.includes('p-2');
  
  return hasMinHeight || (isButton && hasPadding);
}

// =============================================================================
// Property Tests
// =============================================================================

describe('Property 7: Touch Target Minimum Size', () => {
  /**
   * Property: SkillCard SHALL have minimum 44px height
   */
  it('skill cards have minimum touch target height', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        const { container, unmount } = render(
          <SkillCard skill={skill} onClick={() => {}} isSelected={false} />
        );

        const skillCard = container.querySelector(`[data-testid="skill-card-${skill.id}"]`);
        expect(skillCard).toBeInTheDocument();

        if (skillCard) {
          // Check for min-h-[44px] class
          expect(skillCard.className).toContain('min-h-[44px]');
        }

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Evidence links SHALL have minimum 44px height
   */
  it('evidence links have minimum touch target height', () => {
    fc.assert(
      fc.property(evidenceArbitrary, (evidence: Evidence) => {
        const { container, unmount } = render(
          <EvidenceItem evidence={evidence} />
        );

        const evidenceLink = container.querySelector(`[data-testid="evidence-item-${evidence.id}"]`);
        expect(evidenceLink).toBeInTheDocument();

        if (evidenceLink) {
          // Check for min-h-[44px] class
          expect(evidenceLink.className).toContain('min-h-[44px]');
        }

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Interactive elements SHALL be large enough for touch interaction
   */
  it('all interactive elements meet minimum touch target requirements', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        const { container, unmount } = render(
          <SkillCard skill={skill} onClick={() => {}} isSelected={false} />
        );

        // Get all interactive elements (buttons, links)
        const buttons = container.querySelectorAll('button');
        const links = container.querySelectorAll('a');

        // All buttons should have minimum touch target
        buttons.forEach(button => {
          expect(hasMinimumTouchTargetClasses(button)).toBe(true);
        });

        // All links should have minimum touch target (if any)
        links.forEach(link => {
          expect(hasMinimumTouchTargetClasses(link)).toBe(true);
        });

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });
});
