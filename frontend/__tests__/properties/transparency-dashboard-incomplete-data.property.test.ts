import fc from 'fast-check';
import { validateSkill, validateGap } from '@/lib/transparency-dashboard-loader';

/**
 * Feature: transparency-dashboard, Property 20: Graceful Handling of Incomplete Data
 *
 * For any skill data with missing optional fields (yearsOfExperience, evidence),
 * the Transparency_Dashboard SHALL render without errors and display available information.
 *
 * **Validates: Requirements 9.6**
 */
describe('Property 20: Graceful Handling of Incomplete Data', () => {
  // Generate skills with optional fields missing (working_knowledge tier to avoid evidence requirement)
  const skillWithOptionalFieldsArbitrary = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    tier: fc.constantFrom('working_knowledge' as const), // Use working_knowledge to avoid evidence requirement
    context: fc.string({ minLength: 0, maxLength: 200 }),
    category: fc.string({ minLength: 1, maxLength: 30 }),
    evidence: fc.constant([]), // Empty evidence
    yearsOfExperience: fc.option(fc.integer({ min: 1, max: 30 }), { nil: undefined }),
  });

  it('validates skills with missing optional yearsOfExperience', () => {
    fc.assert(
      fc.property(skillWithOptionalFieldsArbitrary, (skill) => {
        // Should validate successfully even without yearsOfExperience
        return validateSkill(skill) === true;
      }),
      { numRuns: 3 }
    );
  });

  it('validates working_knowledge skills with empty evidence array', () => {
    fc.assert(
      fc.property(skillWithOptionalFieldsArbitrary, (skill) => {
        // Working knowledge skills don't require evidence
        return validateSkill(skill) === true;
      }),
      { numRuns: 3 }
    );
  });

  // Generate gaps with optional alternativeFocus missing
  // Use stringMatching to ensure non-whitespace content (validateGap trims and checks for empty)
  const nonEmptyStringArbitrary = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{0,49}$/);
  
  const gapWithOptionalFieldsArbitrary = fc.record({
    id: fc.uuid(),
    name: nonEmptyStringArbitrary,
    explanation: nonEmptyStringArbitrary,
    alternativeFocus: fc.option(nonEmptyStringArbitrary, { nil: undefined }),
  });

  it('validates gaps with missing optional alternativeFocus', () => {
    fc.assert(
      fc.property(gapWithOptionalFieldsArbitrary, (gap) => {
        // Should validate successfully even without alternativeFocus
        return validateGap(gap) === true;
      }),
      { numRuns: 3 }
    );
  });

  // Test that core_strength skills require evidence (validation should fail without it)
  const coreStrengthWithoutEvidenceArbitrary = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    tier: fc.constant('core_strength' as const),
    context: fc.string({ minLength: 0, maxLength: 200 }),
    category: fc.string({ minLength: 1, maxLength: 30 }),
    evidence: fc.constant([]), // Empty evidence - should fail validation for core_strength
    yearsOfExperience: fc.option(fc.integer({ min: 1, max: 30 }), { nil: undefined }),
  });

  it('rejects core_strength skills without evidence', () => {
    fc.assert(
      fc.property(coreStrengthWithoutEvidenceArbitrary, (skill) => {
        // Core strength skills MUST have evidence - validation should fail
        return validateSkill(skill) === false;
      }),
      { numRuns: 3 }
    );
  });

  // Test that core_strength skills with evidence pass validation
  const coreStrengthWithEvidenceArbitrary = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    tier: fc.constant('core_strength' as const),
    context: fc.string({ minLength: 0, maxLength: 200 }),
    category: fc.string({ minLength: 1, maxLength: 30 }),
    evidence: fc.array(
      fc.record({
        id: fc.uuid(),
        type: fc.constantFrom('project' as const, 'experience' as const, 'certification' as const),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        reference: fc.string({ minLength: 1, maxLength: 100 }),
      }),
      { minLength: 1, maxLength: 3 }
    ),
    yearsOfExperience: fc.option(fc.integer({ min: 1, max: 30 }), { nil: undefined }),
  });

  it('validates core_strength skills with evidence', () => {
    fc.assert(
      fc.property(coreStrengthWithEvidenceArbitrary, (skill) => {
        // Core strength skills with evidence should pass validation
        return validateSkill(skill) === true;
      }),
      { numRuns: 3 }
    );
  });
});
