/**
 * Property Tests for Fit Analysis ARIA Live Region Announcements
 *
 * Tests Property 14 from the design document:
 * - Property 14: ARIA Live Region Announcements
 *
 * @see Requirements 7.2, 7.6
 */

import * as fc from 'fast-check';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { ResultsSection } from '@/components/fit-analysis/ResultsSection';
import {
  MatchAssessment,
  ConfidenceLevel,
  RecommendationType,
  GapSeverity,
  EvidenceType,
} from '@/types/fit-analysis';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Arbitraries for generating test data
const confidenceLevelArb = fc.constantFrom<ConfidenceLevel>(
  'strong_match',
  'partial_match',
  'limited_match'
);

const recommendationTypeArb = fc.constantFrom<RecommendationType>(
  'proceed',
  'consider',
  'reconsider'
);

const gapSeverityArb = fc.constantFrom<GapSeverity>('minor', 'moderate', 'significant');

const evidenceTypeArb = fc.constantFrom<EvidenceType>('experience', 'project', 'skill');

const evidenceArb = fc.record({
  type: evidenceTypeArb,
  title: fc.string({ minLength: 1, maxLength: 50 }),
  reference: fc.string({ minLength: 1, maxLength: 50 }),
  excerpt: fc.string({ minLength: 1, maxLength: 200 }),
});

const alignmentAreaArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  evidence: fc.array(evidenceArb, { minLength: 1, maxLength: 3 }),
});

const gapAreaArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  severity: gapSeverityArb,
});

const recommendationArb = fc.record({
  type: recommendationTypeArb,
  summary: fc.string({ minLength: 1, maxLength: 200 }),
  details: fc.string({ minLength: 1, maxLength: 500 }),
});

const matchAssessmentArb: fc.Arbitrary<MatchAssessment> = fc.record({
  id: fc.uuid(),
  timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  jobDescriptionPreview: fc.string({ minLength: 1, maxLength: 100 }),
  confidenceScore: confidenceLevelArb,
  alignmentAreas: fc.array(alignmentAreaArb, { minLength: 0, maxLength: 3 }),
  gapAreas: fc.array(gapAreaArb, { minLength: 0, maxLength: 3 }),
  recommendation: recommendationArb,
});

/**
 * Feature: fit-analysis-module, Property 14: ARIA Live Region Announcements
 *
 * For any Match_Assessment that appears after analysis completion, the result
 * SHALL be announced to screen readers via an ARIA live region, and focus
 * SHALL move to the results section.
 *
 * **Validates: Requirements 7.2, 7.6**
 */
describe('Property 14: ARIA Live Region Announcements', () => {
  it('renders live region with announcement for any assessment', () => {
    fc.assert(
      fc.property(matchAssessmentArb, (assessment) => {
        cleanup();
        const onNewAnalysis = jest.fn();

        render(
          <ResultsSection
            assessment={assessment}
            onNewAnalysis={onNewAnalysis}
            announceResults={true}
          />
        );

        // Live region should exist
        const liveRegion = screen.getByTestId('live-region');
        expect(liveRegion).toBeInTheDocument();

        // Live region should have correct ARIA attributes
        expect(liveRegion).toHaveAttribute('role', 'status');
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
        expect(liveRegion).toHaveAttribute('aria-atomic', 'true');

        // Live region should contain announcement text
        const content = liveRegion.textContent || '';
        expect(content).toContain('Analysis complete');

        cleanup();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('announcement includes confidence level for any assessment', () => {
    fc.assert(
      fc.property(matchAssessmentArb, (assessment) => {
        cleanup();
        const onNewAnalysis = jest.fn();

        render(
          <ResultsSection
            assessment={assessment}
            onNewAnalysis={onNewAnalysis}
            announceResults={true}
          />
        );

        const liveRegion = screen.getByTestId('live-region');
        const content = liveRegion.textContent || '';

        // Should include confidence level label
        const confidenceLabels = ['Strong Match', 'Partial Match', 'Limited Match'];
        const hasConfidenceLabel = confidenceLabels.some((label) =>
          content.includes(label)
        );
        expect(hasConfidenceLabel).toBe(true);

        cleanup();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('announcement includes alignment and gap counts', () => {
    fc.assert(
      fc.property(matchAssessmentArb, (assessment) => {
        cleanup();
        const onNewAnalysis = jest.fn();

        render(
          <ResultsSection
            assessment={assessment}
            onNewAnalysis={onNewAnalysis}
            announceResults={true}
          />
        );

        const liveRegion = screen.getByTestId('live-region');
        const content = liveRegion.textContent || '';

        // Should include counts
        expect(content).toContain(`${assessment.alignmentAreas.length} alignment`);
        expect(content).toContain(`${assessment.gapAreas.length} gap`);

        cleanup();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('results section is focusable for any assessment', () => {
    fc.assert(
      fc.property(matchAssessmentArb, (assessment) => {
        cleanup();
        const onNewAnalysis = jest.fn();

        render(
          <ResultsSection
            assessment={assessment}
            onNewAnalysis={onNewAnalysis}
            announceResults={true}
          />
        );

        const resultsSection = screen.getByTestId('results-section');

        // Results section should be focusable (tabIndex -1 for programmatic focus)
        expect(resultsSection).toHaveAttribute('tabIndex', '-1');

        // Should be able to focus programmatically
        resultsSection.focus();
        expect(document.activeElement).toBe(resultsSection);

        cleanup();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('does not announce when announceResults is false', () => {
    fc.assert(
      fc.property(matchAssessmentArb, (assessment) => {
        cleanup();
        const onNewAnalysis = jest.fn();

        render(
          <ResultsSection
            assessment={assessment}
            onNewAnalysis={onNewAnalysis}
            announceResults={false}
          />
        );

        const liveRegion = screen.getByTestId('live-region');
        const content = liveRegion.textContent || '';

        // Should be empty when announceResults is false
        expect(content).toBe('');

        cleanup();
        return true;
      }),
      { numRuns: 3 }
    );
  });
});
