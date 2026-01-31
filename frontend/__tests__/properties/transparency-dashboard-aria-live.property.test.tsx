import fc from 'fast-check';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { SkillDetailPanel } from '@/components/transparency-dashboard/SkillDetailPanel';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';

/**
 * Feature: transparency-dashboard, Property 16: ARIA Live Region Announcements
 *
 * For any Skill_Detail_Panel that opens, an ARIA live region SHALL announce
 * the panel content to screen readers.
 *
 * **Validates: Requirements 6.3**
 */
describe('Property 16: ARIA Live Region Announcements', () => {
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

  it('announces panel opening via ARIA live region for any skill', async () => {
    await fc.assert(
      fc.asyncProperty(skillArbitrary, async (skill: Skill) => {
        render(<SkillDetailPanel skill={skill} isOpen={true} onClose={() => {}} />);

        // Live region should be present
        const liveRegion = screen.getByTestId('live-region');
        expect(liveRegion).toBeInTheDocument();

        // Live region should have correct ARIA attributes
        expect(liveRegion).toHaveAttribute('role', 'status');
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
        expect(liveRegion).toHaveAttribute('aria-atomic', 'true');

        // Live region should announce the skill name
        await waitFor(() => {
          expect(liveRegion).toHaveTextContent(skill.name);
        });

        cleanup();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('does not render live region when panel is closed', async () => {
    await fc.assert(
      fc.asyncProperty(skillArbitrary, async (skill: Skill) => {
        render(<SkillDetailPanel skill={skill} isOpen={false} onClose={() => {}} />);

        // Live region should not be present when panel is closed
        const liveRegion = screen.queryByTestId('live-region');
        expect(liveRegion).not.toBeInTheDocument();

        cleanup();
        return true;
      }),
      { numRuns: 3 }
    );
  });
});
