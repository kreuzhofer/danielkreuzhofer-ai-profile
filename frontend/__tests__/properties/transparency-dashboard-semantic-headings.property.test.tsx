import fc from 'fast-check';
import { render } from '@testing-library/react';
import { TierSection } from '@/components/transparency-dashboard/TierSection';
import type { SkillTier } from '@/types/transparency-dashboard';

/**
 * Feature: transparency-dashboard, Property 17: Semantic Heading Structure
 *
 * For any Tier_Section in the Transparency_Dashboard, the section title SHALL use
 * semantic heading elements (h2 or h3) for proper document structure.
 *
 * **Validates: Requirements 6.4**
 */
describe('Property 17: Semantic Heading Structure', () => {
  const tierArbitrary = fc.constantFrom<SkillTier>('core_strength', 'working_knowledge', 'explicit_gap');
  const titleArbitrary = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);
  const descriptionArbitrary = fc.string({ minLength: 1, maxLength: 200 });

  it('uses semantic h2 heading for any tier section title', () => {
    fc.assert(
      fc.property(
        tierArbitrary,
        titleArbitrary,
        descriptionArbitrary,
        (tier, title, description) => {
          const { container } = render(
            <TierSection
              title={title}
              description={description}
              skills={[]}
              tier={tier}
            />
          );

          // Find h2 heading - TierSection uses h2 for semantic structure
          const heading = container.querySelector('h2');
          expect(heading).toBeInTheDocument();
          expect(heading?.textContent).toBe(title);

          return true;
        }
      ),
      { numRuns: 3 }
    );
  });

  it('heading has proper accessibility attributes for any tier', () => {
    fc.assert(
      fc.property(
        tierArbitrary,
        titleArbitrary,
        descriptionArbitrary,
        (tier, title, description) => {
          const { container } = render(
            <TierSection
              title={title}
              description={description}
              skills={[]}
              tier={tier}
            />
          );

          // Find h2 heading
          const heading = container.querySelector('h2');
          expect(heading).toBeInTheDocument();

          // Heading should have an id for aria-labelledby reference
          expect(heading?.id).toBeTruthy();
          expect(heading?.id).toContain('heading');

          // Section should reference the heading via aria-labelledby
          const section = container.querySelector('section');
          expect(section).toBeInTheDocument();
          expect(section?.getAttribute('aria-labelledby')).toBe(heading?.id);

          return true;
        }
      ),
      { numRuns: 3 }
    );
  });
});
