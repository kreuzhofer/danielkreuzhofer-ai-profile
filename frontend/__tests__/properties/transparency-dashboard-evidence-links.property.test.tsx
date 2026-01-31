/**
 * Property Test: Evidence Links Clickable
 *
 * Feature: transparency-dashboard
 * Property 9: Evidence Links Clickable
 *
 * For any Evidence in a Skill_Detail_Panel, the evidence SHALL be rendered
 * as a clickable element with the evidence type displayed.
 *
 * **Validates: Requirements 3.3, 5.3**
 */

import React from 'react';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { EvidenceList, EvidenceItem } from '@/components/transparency-dashboard/EvidenceList';
import type { Evidence } from '@/types/transparency-dashboard';

// =============================================================================
// Arbitraries
// =============================================================================

/**
 * Arbitrary for generating valid evidence items
 */
const evidenceArbitrary = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('project', 'experience', 'certification') as fc.Arbitrary<Evidence['type']>,
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  reference: fc.oneof(
    // Internal links (start with /)
    fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/^\/+/, '')}`),
    // External links
    fc.webUrl()
  ),
  excerpt: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
});

/**
 * Arbitrary for generating arrays of evidence items
 */
const evidenceArrayArbitrary = fc.array(evidenceArbitrary, { minLength: 1, maxLength: 5 });

// =============================================================================
// Property Tests
// =============================================================================

describe('Property 9: Evidence Links Clickable', () => {
  /**
   * Property: For any evidence item, it SHALL be rendered as a clickable element
   */
  it('renders evidence as clickable anchor elements', () => {
    fc.assert(
      fc.property(evidenceArbitrary, (evidence) => {
        const { unmount } = render(<EvidenceItem evidence={evidence} />);

        // Evidence should be rendered as an anchor element
        const link = screen.getByTestId(`evidence-item-${evidence.id}`);
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href', evidence.reference);

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: For any evidence item, the evidence type SHALL be displayed
   */
  it('displays evidence type for all evidence items', () => {
    fc.assert(
      fc.property(evidenceArbitrary, (evidence) => {
        const { unmount } = render(<EvidenceItem evidence={evidence} />);

        // Evidence type should be displayed
        const typeElement = screen.getByTestId(`evidence-type-${evidence.id}`);
        expect(typeElement).toBeInTheDocument();

        // Type label should match the evidence type
        const expectedLabels: Record<Evidence['type'], string> = {
          project: 'Project',
          experience: 'Experience',
          certification: 'Certification',
        };
        expect(typeElement).toHaveTextContent(expectedLabels[evidence.type]);

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: For any evidence list, all items SHALL be clickable with type displayed
   */
  it('renders all evidence items in a list as clickable with types', () => {
    fc.assert(
      fc.property(evidenceArrayArbitrary, (evidenceArray) => {
        const { unmount } = render(<EvidenceList evidence={evidenceArray} />);

        // Each evidence item should be clickable with type displayed
        for (const evidence of evidenceArray) {
          const link = screen.getByTestId(`evidence-item-${evidence.id}`);
          expect(link.tagName).toBe('A');
          expect(link).toHaveAttribute('href', evidence.reference);

          const typeElement = screen.getByTestId(`evidence-type-${evidence.id}`);
          expect(typeElement).toBeInTheDocument();
        }

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: Evidence items SHALL have type icons displayed
   */
  it('displays type icons for all evidence items', () => {
    fc.assert(
      fc.property(evidenceArbitrary, (evidence) => {
        const { unmount } = render(<EvidenceItem evidence={evidence} />);

        // Type icon should be present
        const iconContainer = screen.getByTestId(`evidence-type-icon-${evidence.id}`);
        expect(iconContainer).toBeInTheDocument();
        expect(iconContainer.querySelector('svg')).toBeInTheDocument();

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });
});
