import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { SkillCard } from '@/components/transparency-dashboard/SkillCard';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';

/**
 * Feature: transparency-dashboard, Property 3: Skill Card Content Completeness
 *
 * For any Skill in the skills data, the rendered Skill_Card SHALL display the skill name,
 * tier indicator (text or icon, not color-only), and context description.
 *
 * **Validates: Requirements 2.1, 6.6**
 */
describe('Property 3: Skill Card Content Completeness', () => {
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

  it('displays name, tier indicator, and context for any skill', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        const { container, unmount } = render(
          <SkillCard skill={skill} onClick={() => {}} isSelected={false} />
        );

        // Skill name is displayed (Requirement 2.1)
        const skillName = container.querySelector('[data-testid="skill-name"]');
        expect(skillName).toBeInTheDocument();
        expect(skillName).toHaveTextContent(skill.name);

        // Tier indicator is present (not color-only) (Requirement 6.6)
        const tierIndicator = container.querySelector('[data-testid="tier-indicator"]');
        expect(tierIndicator).toBeInTheDocument();
        // Verify it has text content or icon (not just color)
        const hasTextContent = tierIndicator?.textContent && tierIndicator.textContent.trim().length > 0;
        const hasIcon = tierIndicator?.querySelector('svg') !== null;
        expect(hasTextContent || hasIcon).toBeTruthy();

        // Context is displayed (Requirement 2.1)
        const skillContext = container.querySelector('[data-testid="skill-context"]');
        expect(skillContext).toBeInTheDocument();
        expect(skillContext).toHaveTextContent(skill.context);

        // Clean up for next iteration
        unmount();

        return true;
      }),
      { numRuns: 3 }
    );
  });
});
