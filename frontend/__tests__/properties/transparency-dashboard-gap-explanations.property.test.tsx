import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { GapCard } from '@/components/transparency-dashboard/GapCard';
import type { ExplicitGap } from '@/types/transparency-dashboard';

/**
 * Feature: transparency-dashboard, Property 2: Gap Explanations Display
 *
 * For any ExplicitGap in the gaps data, the rendered Explicit_Gaps section SHALL display
 * both the gap name AND its explanation text.
 *
 * **Validates: Requirements 1.4, 4.1, 4.2**
 */
describe('Property 2: Gap Explanations Display', () => {
  // Clean up after each test to prevent DOM pollution
  afterEach(() => {
    cleanup();
  });

  // Arbitrary for generating valid explicit gaps
  const gapArbitrary = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    explanation: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
    alternativeFocus: fc.option(
      fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
      { nil: undefined }
    ),
  });

  it('displays both gap name and explanation for any explicit gap', () => {
    fc.assert(
      fc.property(gapArbitrary, (gap: ExplicitGap) => {
        const { container, unmount } = render(<GapCard gap={gap} />);

        // Gap name is displayed (Requirement 4.1)
        const gapName = container.querySelector(`[data-testid="gap-name-${gap.id}"]`);
        expect(gapName).toBeInTheDocument();
        expect(gapName).toHaveTextContent(gap.name);

        // Gap explanation is displayed (Requirement 4.2)
        const gapExplanation = container.querySelector(`[data-testid="gap-explanation-${gap.id}"]`);
        expect(gapExplanation).toBeInTheDocument();
        expect(gapExplanation).toHaveTextContent(gap.explanation);

        // Clean up for next iteration
        unmount();

        return true;
      }),
      { numRuns: 3 }
    );
  });
});
