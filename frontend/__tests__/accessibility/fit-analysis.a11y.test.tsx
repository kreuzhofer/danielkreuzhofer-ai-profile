/**
 * Accessibility Tests for Fit Analysis Components
 *
 * Tests WCAG 2.1 AA compliance using jest-axe.
 *
 * @see Requirements 7.1, 7.4
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { InputSection } from '@/components/fit-analysis/InputSection';
import { ConfidenceIndicator } from '@/components/fit-analysis/ConfidenceIndicator';
import { AlignmentList } from '@/components/fit-analysis/AlignmentList';
import { GapList } from '@/components/fit-analysis/GapList';
import { RecommendationCard } from '@/components/fit-analysis/RecommendationCard';
import { ResultsSection } from '@/components/fit-analysis/ResultsSection';
import { HistoryPanel } from '@/components/fit-analysis/HistoryPanel';
import {
  MatchAssessment,
  AlignmentArea,
  GapArea,
  AnalysisHistoryItem,
} from '@/types/fit-analysis';

expect.extend(toHaveNoViolations);

describe('Fit Analysis Accessibility Tests', () => {
  describe('InputSection', () => {
    it('has no accessibility violations when empty', async () => {
      const { container } = render(
        <InputSection
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          isDisabled={false}
          maxLength={5000}
          minLength={50}
          placeholder="Paste a job description here..."
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with content', async () => {
      const { container } = render(
        <InputSection
          value="This is a sample job description for a software engineer position."
          onChange={() => {}}
          onSubmit={() => {}}
          isDisabled={false}
          maxLength={5000}
          minLength={50}
          placeholder="Paste a job description here..."
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when disabled', async () => {
      const { container } = render(
        <InputSection
          value="Sample content"
          onChange={() => {}}
          onSubmit={() => {}}
          isDisabled={true}
          maxLength={5000}
          minLength={50}
          placeholder="Paste a job description here..."
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ConfidenceIndicator', () => {
    it('has no accessibility violations for strong match', async () => {
      const { container } = render(
        <ConfidenceIndicator
          level="strong_match"
          ariaLabel="Overall match confidence: strong match"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations for partial match', async () => {
      const { container } = render(
        <ConfidenceIndicator
          level="partial_match"
          ariaLabel="Overall match confidence: partial match"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations for limited match', async () => {
      const { container } = render(
        <ConfidenceIndicator
          level="limited_match"
          ariaLabel="Overall match confidence: limited match"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('AlignmentList', () => {
    const mockAlignments: AlignmentArea[] = [
      {
        id: 'align-1',
        title: 'TypeScript Experience',
        description: 'Strong background in TypeScript development',
        evidence: [
          {
            type: 'project',
            title: 'Portfolio Website',
            reference: 'portfolio-site',
            excerpt: 'Built with Next.js and TypeScript',
          },
        ],
      },
    ];

    it('has no accessibility violations with items', async () => {
      const { container } = render(<AlignmentList items={mockAlignments} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when empty', async () => {
      const { container } = render(<AlignmentList items={[]} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('GapList', () => {
    const mockGaps: GapArea[] = [
      {
        id: 'gap-1',
        title: 'Machine Learning',
        description: 'No documented ML experience',
        severity: 'moderate',
      },
    ];

    it('has no accessibility violations with items', async () => {
      const { container } = render(<GapList items={mockGaps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when empty', async () => {
      const { container } = render(<GapList items={[]} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('RecommendationCard', () => {
    it('has no accessibility violations for proceed', async () => {
      const { container } = render(
        <RecommendationCard
          recommendation={{
            type: 'proceed',
            summary: 'Excellent fit for this role',
            details: 'All key requirements are well covered.',
          }}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations for consider', async () => {
      const { container } = render(
        <RecommendationCard
          recommendation={{
            type: 'consider',
            summary: 'Worth exploring',
            details: 'Some gaps but strong foundation.',
          }}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations for reconsider', async () => {
      const { container } = render(
        <RecommendationCard
          recommendation={{
            type: 'reconsider',
            summary: 'May not be the right fit',
            details: 'Significant gaps in key requirements.',
          }}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ResultsSection', () => {
    const mockAssessment: MatchAssessment = {
      id: 'test-1',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      jobDescriptionPreview: 'Senior Software Engineer...',
      confidenceScore: 'partial_match',
      alignmentAreas: [
        {
          id: 'align-1',
          title: 'TypeScript',
          description: 'Strong TypeScript skills',
          evidence: [
            {
              type: 'project',
              title: 'Portfolio',
              reference: 'portfolio-site',
              excerpt: 'Built with TypeScript',
            },
          ],
        },
      ],
      gapAreas: [
        {
          id: 'gap-1',
          title: 'ML',
          description: 'No ML experience',
          severity: 'moderate',
        },
      ],
      recommendation: {
        type: 'consider',
        summary: 'Worth considering',
        details: 'Good fit overall.',
      },
    };

    it('has no accessibility violations', async () => {
      const { container } = render(
        <ResultsSection
          assessment={mockAssessment}
          onNewAnalysis={() => {}}
          announceResults={false}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('HistoryPanel', () => {
    const mockItems: AnalysisHistoryItem[] = [
      {
        id: 'history-1',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        jobDescriptionPreview: 'Senior Software Engineer...',
        confidenceScore: 'strong_match',
      },
      {
        id: 'history-2',
        timestamp: new Date('2024-01-14T14:00:00Z'),
        jobDescriptionPreview: 'Machine Learning Engineer...',
        confidenceScore: 'partial_match',
      },
    ];

    it('has no accessibility violations when collapsed', async () => {
      const { container } = render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={() => {}}
          onClearHistory={() => {}}
          defaultExpanded={false}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when expanded', async () => {
      const { container } = render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={() => {}}
          onClearHistory={() => {}}
          defaultExpanded={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when empty', async () => {
      const { container } = render(
        <HistoryPanel
          items={[]}
          onSelectItem={() => {}}
          onClearHistory={() => {}}
          defaultExpanded={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
