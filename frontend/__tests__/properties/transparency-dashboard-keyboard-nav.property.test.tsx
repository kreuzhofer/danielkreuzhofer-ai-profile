/**
 * Property Test: Keyboard Navigation Support
 *
 * Feature: transparency-dashboard
 * Property 15: Keyboard Navigation Support
 *
 * For any interactive element in the Transparency_Dashboard, it SHALL be focusable
 * via Tab key and activatable via Enter or Space key.
 *
 * **Validates: Requirements 6.2**
 */

import React from 'react';
import fc from 'fast-check';
import { render, fireEvent } from '@testing-library/react';
import { SkillCard } from '@/components/transparency-dashboard/SkillCard';
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
// Property Tests
// =============================================================================

describe('Property 15: Keyboard Navigation Support', () => {
  /**
   * Property: SkillCard SHALL be focusable (has tabindex or is natively focusable)
   */
  it('skill cards are focusable elements', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        const { container, unmount } = render(
          <SkillCard skill={skill} onClick={() => {}} isSelected={false} />
        );

        const skillCard = container.querySelector(`[data-testid="skill-card-${skill.id}"]`);
        expect(skillCard).toBeInTheDocument();

        // Should be a button (natively focusable) or have tabindex
        if (skillCard) {
          const isButton = skillCard.tagName === 'BUTTON';
          const hasTabIndex = skillCard.hasAttribute('tabindex');
          const isAnchor = skillCard.tagName === 'A';
          expect(isButton || hasTabIndex || isAnchor).toBe(true);
        }

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: SkillCard SHALL be activatable via Enter key
   */
  it('skill cards are activatable via Enter key', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        let clicked = false;
        const handleClick = () => { clicked = true; };

        const { container, unmount } = render(
          <SkillCard skill={skill} onClick={handleClick} isSelected={false} />
        );

        const skillCard = container.querySelector(`[data-testid="skill-card-${skill.id}"]`);
        expect(skillCard).toBeInTheDocument();

        if (skillCard) {
          // Simulate Enter key press
          fireEvent.keyDown(skillCard, { key: 'Enter', code: 'Enter' });
          expect(clicked).toBe(true);
        }

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: SkillCard SHALL be activatable via Space key
   */
  it('skill cards are activatable via Space key', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        let clicked = false;
        const handleClick = () => { clicked = true; };

        const { container, unmount } = render(
          <SkillCard skill={skill} onClick={handleClick} isSelected={false} />
        );

        const skillCard = container.querySelector(`[data-testid="skill-card-${skill.id}"]`);
        expect(skillCard).toBeInTheDocument();

        if (skillCard) {
          // Simulate Space key press
          fireEvent.keyDown(skillCard, { key: ' ', code: 'Space' });
          expect(clicked).toBe(true);
        }

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: SkillCard SHALL have appropriate ARIA attributes for accessibility
   */
  it('skill cards have appropriate ARIA attributes', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        const { container, unmount } = render(
          <SkillCard skill={skill} onClick={() => {}} isSelected={false} />
        );

        const skillCard = container.querySelector(`[data-testid="skill-card-${skill.id}"]`);
        expect(skillCard).toBeInTheDocument();

        if (skillCard) {
          // Should have aria-label or accessible name
          const hasAriaLabel = skillCard.hasAttribute('aria-label');
          const hasAriaLabelledBy = skillCard.hasAttribute('aria-labelledby');
          expect(hasAriaLabel || hasAriaLabelledBy).toBe(true);
        }

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });
});
