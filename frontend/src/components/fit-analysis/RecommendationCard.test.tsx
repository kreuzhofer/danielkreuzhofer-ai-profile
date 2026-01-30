/**
 * RecommendationCard Component Tests
 *
 * @see Requirement 3.6
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecommendationCard } from './RecommendationCard';
import { Recommendation, RecommendationType } from '@/types/fit-analysis';

describe('RecommendationCard', () => {
  const createRecommendation = (
    type: RecommendationType,
    summary: string = 'Test summary',
    details: string = 'Test details'
  ): Recommendation => ({
    type,
    summary,
    details,
  });

  describe('rendering', () => {
    it('renders recommendation card', () => {
      const recommendation = createRecommendation('proceed');
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByTestId('recommendation-card')).toBeInTheDocument();
    });

    it('renders summary and details', () => {
      const recommendation = createRecommendation(
        'consider',
        'Worth exploring if ML is not critical',
        'Strong technical foundation but lacks specific ML experience.'
      );
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByTestId('recommendation-summary')).toHaveTextContent(
        'Worth exploring if ML is not critical'
      );
      expect(screen.getByTestId('recommendation-details')).toHaveTextContent(
        'Strong technical foundation but lacks specific ML experience.'
      );
    });

    it('applies type data attribute', () => {
      const recommendation = createRecommendation('proceed');
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByTestId('recommendation-card')).toHaveAttribute(
        'data-type',
        'proceed'
      );
    });
  });

  describe('proceed recommendation', () => {
    it('displays proceed label', () => {
      const recommendation = createRecommendation('proceed');
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByText('Recommended to Proceed')).toBeInTheDocument();
    });

    it('has proceed type attribute', () => {
      const recommendation = createRecommendation('proceed');
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByTestId('recommendation-card')).toHaveAttribute(
        'data-type',
        'proceed'
      );
    });
  });

  describe('consider recommendation', () => {
    it('displays consider label', () => {
      const recommendation = createRecommendation('consider');
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByText('Worth Considering')).toBeInTheDocument();
    });

    it('has consider type attribute', () => {
      const recommendation = createRecommendation('consider');
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByTestId('recommendation-card')).toHaveAttribute(
        'data-type',
        'consider'
      );
    });
  });

  describe('reconsider recommendation', () => {
    it('displays reconsider label', () => {
      const recommendation = createRecommendation('reconsider');
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByText('May Not Be the Right Fit')).toBeInTheDocument();
    });

    it('has reconsider type attribute', () => {
      const recommendation = createRecommendation('reconsider');
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByTestId('recommendation-card')).toHaveAttribute(
        'data-type',
        'reconsider'
      );
    });
  });

  describe('accessibility', () => {
    it('has proper section labeling', () => {
      const recommendation = createRecommendation('proceed');
      render(<RecommendationCard recommendation={recommendation} />);

      const section = screen.getByRole('region', { name: /recommended to proceed/i });
      expect(section).toBeInTheDocument();
    });

    it('has heading for recommendation', () => {
      const recommendation = createRecommendation('proceed');
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByRole('heading', { name: /recommended to proceed/i })).toBeInTheDocument();
    });
  });

  describe('content variations', () => {
    it('handles long summary text', () => {
      const longSummary = 'This is a very long summary that explains the recommendation in great detail and provides context for the decision.';
      const recommendation = createRecommendation('consider', longSummary);
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByTestId('recommendation-summary')).toHaveTextContent(longSummary);
    });

    it('handles long details text', () => {
      const longDetails = 'This is a very detailed explanation that covers multiple aspects of the analysis including technical skills, domain experience, leadership capabilities, and cultural fit considerations. It provides a comprehensive view of the assessment.';
      const recommendation = createRecommendation('proceed', 'Summary', longDetails);
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByTestId('recommendation-details')).toHaveTextContent(longDetails);
    });

    it('handles minimal content', () => {
      const recommendation = createRecommendation('reconsider', 'No', 'N/A');
      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByTestId('recommendation-summary')).toHaveTextContent('No');
      expect(screen.getByTestId('recommendation-details')).toHaveTextContent('N/A');
    });
  });
});
