import fc from 'fast-check';
import { render, screen, cleanup, waitFor, act } from '@testing-library/react';
import { SkillDetailPanel } from '@/components/transparency-dashboard/SkillDetailPanel';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';
import React from 'react';

/**
 * Feature: transparency-dashboard, Property 11: Panel Focus Management
 *
 * For any Skill_Detail_Panel that opens, focus SHALL move to the panel element,
 * and when closed, focus SHALL return to the triggering Skill_Card.
 *
 * **Validates: Requirements 3.6**
 */
describe('Property 11: Panel Focus Management', () => {
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

  it('moves focus to close button when panel opens for any skill', async () => {
    await fc.assert(
      fc.asyncProperty(skillArbitrary, async (skill: Skill) => {
        render(<SkillDetailPanel skill={skill} isOpen={true} onClose={() => {}} />);

        // Focus should move to close button when panel opens
        await waitFor(() => {
          const closeButton = screen.getByTestId('skill-detail-close-button');
          expect(closeButton).toHaveFocus();
        });

        cleanup();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('returns focus to trigger element when panel closes for any skill', async () => {
    await fc.assert(
      fc.asyncProperty(skillArbitrary, async (skill: Skill) => {
        // Create a trigger element that can receive focus
        const triggerRef = React.createRef<HTMLButtonElement>();

        // Wrapper component to manage panel state and trigger element
        function TestWrapper() {
          const [isOpen, setIsOpen] = React.useState(true);

          return (
            <div>
              <button
                ref={triggerRef}
                data-testid="trigger-button"
                onClick={() => setIsOpen(true)}
              >
                Open Panel
              </button>
              <SkillDetailPanel
                skill={skill}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                triggerRef={triggerRef}
              />
            </div>
          );
        }

        render(<TestWrapper />);

        // Verify panel is open and close button has focus
        await waitFor(() => {
          const closeButton = screen.getByTestId('skill-detail-close-button');
          expect(closeButton).toHaveFocus();
        });

        // Close the panel by clicking the close button
        const closeButton = screen.getByTestId('skill-detail-close-button');
        await act(async () => {
          closeButton.click();
        });

        // Wait for focus to return to trigger element
        await waitFor(() => {
          const triggerButton = screen.getByTestId('trigger-button');
          expect(triggerButton).toHaveFocus();
        });

        cleanup();
        return true;
      }),
      { numRuns: 3 }
    );
  });
});
