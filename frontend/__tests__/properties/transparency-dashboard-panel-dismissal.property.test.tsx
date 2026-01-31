import fc from 'fast-check';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SkillDetailPanel } from '@/components/transparency-dashboard/SkillDetailPanel';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';

/**
 * Feature: transparency-dashboard, Property 10: Panel Dismissal Methods
 *
 * For any open Skill_Detail_Panel, the panel SHALL be dismissible via:
 * (a) close button click, (b) Escape key press, and (c) clicking outside the panel.
 *
 * **Validates: Requirements 3.4**
 */
describe('Property 10: Panel Dismissal Methods', () => {
  // Clean up after each test to prevent DOM pollution
  afterEach(() => {
    cleanup();
  });

  // Arbitrary for generating valid skills
  const skillArbitrary = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    tier: fc.constantFrom<SkillTier>('core_strength', 'working_knowledge', 'explicit_gap'),
    context: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
    yearsOfExperience: fc.option(fc.integer({ min: 1, max: 30 }), { nil: undefined }),
    category: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    evidence: fc.array(
      fc.record({
        id: fc.uuid(),
        type: fc.constantFrom('project' as const, 'experience' as const, 'certification' as const),
        title: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        reference: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
      }),
      { minLength: 0, maxLength: 5 }
    ),
  });

  it('is dismissible via close button click for any skill', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        const onClose = jest.fn();
        render(<SkillDetailPanel skill={skill} isOpen={true} onClose={onClose} />);

        // Find and click the close button
        const closeButton = screen.getByTestId('skill-detail-close-button');
        expect(closeButton).toBeInTheDocument();
        fireEvent.click(closeButton);

        // Verify onClose was called exactly once
        expect(onClose).toHaveBeenCalledTimes(1);

        // Clean up for next iteration
        cleanup();

        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('is dismissible via Escape key press for any skill', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        const onClose = jest.fn();
        render(<SkillDetailPanel skill={skill} isOpen={true} onClose={onClose} />);

        // Verify panel is rendered
        expect(screen.getByTestId('skill-detail-panel')).toBeInTheDocument();

        // Press Escape key on document
        fireEvent.keyDown(document, { key: 'Escape' });

        // Verify onClose was called exactly once
        expect(onClose).toHaveBeenCalledTimes(1);

        // Clean up for next iteration
        cleanup();

        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('is dismissible via clicking outside the panel for any skill', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        const onClose = jest.fn();
        render(<SkillDetailPanel skill={skill} isOpen={true} onClose={onClose} />);

        // Find and click the backdrop (outside the panel)
        const backdrop = screen.getByTestId('skill-detail-panel-backdrop');
        expect(backdrop).toBeInTheDocument();
        fireEvent.click(backdrop);

        // Verify onClose was called exactly once
        expect(onClose).toHaveBeenCalledTimes(1);

        // Clean up for next iteration
        cleanup();

        return true;
      }),
      { numRuns: 3 }
    );
  });
});
