/**
 * Property Test: Internal Evidence Links Same Tab
 *
 * Feature: transparency-dashboard
 * Property 14: Internal Evidence Links Same Tab
 *
 * For any Evidence_Link that references internal portfolio content (starts with '/'),
 * the link SHALL NOT have target="_blank" attribute.
 *
 * **Validates: Requirements 5.6**
 */

import React from 'react';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { EvidenceItem } from '@/components/transparency-dashboard/EvidenceList';
import type { Evidence } from '@/types/transparency-dashboard';

// =============================================================================
// Arbitraries
// =============================================================================

/**
 * Arbitrary for generating internal link paths (start with /)
 */
const internalPathArbitrary = fc
  .array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 1, maxLength: 3 })
  .map(segments => `/${segments.join('/')}`);

/**
 * Arbitrary for generating external URLs
 */
const externalUrlArbitrary = fc.webUrl();

/**
 * Arbitrary for generating evidence with internal links
 */
const internalEvidenceArbitrary = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('project', 'experience', 'certification') as fc.Arbitrary<Evidence['type']>,
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  reference: internalPathArbitrary,
  excerpt: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
});

/**
 * Arbitrary for generating evidence with external links
 */
const externalEvidenceArbitrary = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('project', 'experience', 'certification') as fc.Arbitrary<Evidence['type']>,
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  reference: externalUrlArbitrary,
  excerpt: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
});

// =============================================================================
// Property Tests
// =============================================================================

describe('Property 14: Internal Evidence Links Same Tab', () => {
  /**
   * Property: Internal links (starting with '/') SHALL NOT have target="_blank"
   */
  it('internal links do not open in new tab', () => {
    fc.assert(
      fc.property(internalEvidenceArbitrary, (evidence) => {
        const { unmount } = render(<EvidenceItem evidence={evidence} />);

        const link = screen.getByTestId(`evidence-item-${evidence.id}`);
        
        // Internal links should NOT have target="_blank"
        expect(link).not.toHaveAttribute('target', '_blank');
        
        // Verify the reference starts with /
        expect(evidence.reference.startsWith('/')).toBe(true);

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: External links SHALL have target="_blank" for comparison
   */
  it('external links open in new tab', () => {
    fc.assert(
      fc.property(externalEvidenceArbitrary, (evidence) => {
        const { unmount } = render(<EvidenceItem evidence={evidence} />);

        const link = screen.getByTestId(`evidence-item-${evidence.id}`);
        
        // External links SHOULD have target="_blank"
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        
        // Verify the reference does NOT start with /
        expect(evidence.reference.startsWith('/')).toBe(false);

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Internal links should be navigable within the same browsing context
   */
  it('internal links have valid href without external attributes', () => {
    fc.assert(
      fc.property(internalEvidenceArbitrary, (evidence) => {
        const { unmount } = render(<EvidenceItem evidence={evidence} />);

        const link = screen.getByTestId(`evidence-item-${evidence.id}`);
        
        // Should have href attribute
        expect(link).toHaveAttribute('href', evidence.reference);
        
        // Should NOT have rel="noopener noreferrer" (only for external links)
        expect(link).not.toHaveAttribute('rel');

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });
});
