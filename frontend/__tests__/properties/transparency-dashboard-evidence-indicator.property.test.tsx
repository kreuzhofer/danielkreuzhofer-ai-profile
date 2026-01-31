import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { SkillCard } from '@/components/transparency-dashboard/SkillCard';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';

/**
 * Feature: transparency-dashboard, Property 5: Evidence Indicator Presence
 *
 * For any Skill with a non-empty evidence array, the Skill_Card SHALL display
 * an indicator that additional evidence is available.
 *
 * **Validates: Requirements 2.3**
 */
describe('Property 5: Evidence Indicator Presence', () => {
  // Clean up after each test to prevent DOM pollution
  afterEach(() => {
    cleanup();
  });

  // Arbitrary for skills with non-empty evidence array
  const skillWithEvidenceArbitrary = fc.record({
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
      { minLength: 1, maxLength: 5 } // minLength: 1 ensures non-empty evidence array
    ),
  });

  it('displays evidence indicator when skill has non-empty evidence array', () => {
    fc.assert(
      fc.property(skillWithEvidenceArbitrary, (skill: Skill) => {
        const { getByTestId } = render(
          <SkillCard skill={skill} onClick={() => {}} isSelected={false} />
        );

        // Evidence indicator should be present (Requirement 2.3)
        const evidenceIndicator = getByTestId('evidence-indicator');
        expect(evidenceIndicator).toBeInTheDocument();

        // Verify the indicator shows the evidence count
        expect(evidenceIndicator).toHaveTextContent(String(skill.evidence.length));

        // Clean up for next iteration
        cleanup();

        return true;
      }),
      { numRuns: 3 }
    );
  });
});
