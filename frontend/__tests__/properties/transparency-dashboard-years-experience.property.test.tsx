import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { SkillCard } from '@/components/transparency-dashboard/SkillCard';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';

/**
 * Feature: transparency-dashboard, Property 4: Years of Experience Display
 *
 * For any Skill with a defined yearsOfExperience value in the Core_Strengths or Working_Knowledge tier,
 * the Skill_Card SHALL display the years of experience.
 *
 * **Validates: Requirements 2.2**
 */
describe('Property 4: Years of Experience Display', () => {
  // Clean up after each test to prevent DOM pollution
  afterEach(() => {
    cleanup();
  });

  // Arbitrary for skills with years of experience in core_strength or working_knowledge tier
  const skillWithYearsArbitrary = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    tier: fc.constantFrom<SkillTier>('core_strength', 'working_knowledge'),
    context: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
    yearsOfExperience: fc.integer({ min: 1, max: 30 }),
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

  it('displays years of experience when defined for core_strength or working_knowledge skills', () => {
    fc.assert(
      fc.property(skillWithYearsArbitrary, (skill: Skill) => {
        const { getByTestId } = render(
          <SkillCard skill={skill} onClick={() => {}} isSelected={false} />
        );

        // Years indicator should be present (Requirement 2.2)
        const yearsIndicator = getByTestId('years-indicator');
        expect(yearsIndicator).toBeInTheDocument();
        expect(yearsIndicator).toHaveTextContent(String(skill.yearsOfExperience));

        // Clean up for next iteration
        cleanup();

        return true;
      }),
      { numRuns: 3 }
    );
  });
});
