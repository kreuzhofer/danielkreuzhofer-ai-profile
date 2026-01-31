import fc from 'fast-check';
import { mapLevelToTier } from '@/lib/transparency-dashboard-loader';

/**
 * Feature: transparency-dashboard, Property 19: Skill Level to Tier Mapping
 *
 * For any skill with level 'expert', it SHALL be mapped to 'core_strength' tier;
 * for level 'proficient' or 'learning', it SHALL be mapped to 'working_knowledge' tier.
 *
 * **Validates: Requirements 9.2**
 */
describe('Property 19: Skill Level to Tier Mapping', () => {
  it('maps expert level to core_strength tier', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('expert', 'EXPERT', 'Expert'),
        (level) => {
          return mapLevelToTier(level) === 'core_strength';
        }
      ),
      { numRuns: 3 }
    );
  });

  it('maps proficient/learning levels to working_knowledge tier', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('proficient', 'learning', 'familiar', 'PROFICIENT', 'LEARNING', 'FAMILIAR'),
        (level) => {
          return mapLevelToTier(level) === 'working_knowledge';
        }
      ),
      { numRuns: 3 }
    );
  });

  it('maps gap level to explicit_gap tier', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('gap', 'GAP', 'Gap'),
        (level) => {
          return mapLevelToTier(level) === 'explicit_gap';
        }
      ),
      { numRuns: 3 }
    );
  });

  it('defaults unknown levels to working_knowledge tier', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('unknown', 'beginner', 'intermediate', 'advanced', 'novice'),
        (level) => {
          return mapLevelToTier(level) === 'working_knowledge';
        }
      ),
      { numRuns: 3 }
    );
  });
});
