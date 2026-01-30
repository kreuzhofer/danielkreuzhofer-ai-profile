/**
 * Integration Tests for Fit Analysis Flow
 *
 * Tests the complete flow from input to results display.
 *
 * @see Requirements 2.1, 3.1
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FitAnalysisProvider } from '@/context/FitAnalysisContext';
import { FitAnalysisModule } from '@/components/fit-analysis/FitAnalysisModule';

// Mock the fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock sessionStorage
const mockStorage: Record<string, string> = {};
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key: string) => mockStorage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    }),
  },
  writable: true,
});

describe('Fit Analysis Integration Flow', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  const renderFitAnalysis = () => {
    return render(
      <FitAnalysisProvider>
        <FitAnalysisModule />
      </FitAnalysisProvider>
    );
  };

  describe('initial state', () => {
    it('renders the module with intro section', () => {
      renderFitAnalysis();

      expect(screen.getByTestId('fit-analysis-module')).toBeInTheDocument();
      expect(screen.getByTestId('intro-section')).toBeInTheDocument();
      expect(screen.getByTestId('intro-title')).toHaveTextContent('Fit Analysis');
    });

    it('renders input section initially', () => {
      renderFitAnalysis();

      expect(screen.getByTestId('job-description-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('renders history panel', () => {
      renderFitAnalysis();

      expect(screen.getByTestId('history-panel')).toBeInTheDocument();
    });
  });

  describe('input validation', () => {
    it('shows validation error for empty input', () => {
      renderFitAnalysis();

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Submit should not trigger API call
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('shows warning for short input', () => {
      renderFitAnalysis();

      const textarea = screen.getByTestId('job-description-textarea');
      fireEvent.change(textarea, { target: { value: 'Short text' } });

      expect(screen.getByTestId('validation-warning')).toBeInTheDocument();
    });

    it('allows submission with valid input', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          assessment: {
            id: 'test-1',
            timestamp: new Date().toISOString(),
            jobDescriptionPreview: 'Test job description...',
            confidenceScore: 'partial_match',
            alignmentAreas: [],
            gapAreas: [],
            recommendation: {
              type: 'consider',
              summary: 'Worth considering',
              details: 'Good fit overall.',
            },
          },
        }),
      });

      renderFitAnalysis();

      const textarea = screen.getByTestId('job-description-textarea');
      const validInput =
        'This is a valid job description for a Senior Software Engineer position with at least 50 characters.';
      fireEvent.change(textarea, { target: { value: validInput } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('analysis flow', () => {
    it('shows loading state during analysis', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(fetchPromise);

      renderFitAnalysis();

      const textarea = screen.getByTestId('job-description-textarea');
      const validInput =
        'This is a valid job description for a Senior Software Engineer position with at least 50 characters.';
      fireEvent.change(textarea, { target: { value: validInput } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Loading state should appear
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      });

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({
          success: true,
          assessment: {
            id: 'test-1',
            timestamp: new Date().toISOString(),
            jobDescriptionPreview: 'Test job description...',
            confidenceScore: 'partial_match',
            alignmentAreas: [],
            gapAreas: [],
            recommendation: {
              type: 'consider',
              summary: 'Worth considering',
              details: 'Good fit overall.',
            },
          },
        }),
      });
    });

    it('displays results after successful analysis', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          assessment: {
            id: 'test-1',
            timestamp: new Date().toISOString(),
            jobDescriptionPreview: 'Test job description...',
            confidenceScore: 'strong_match',
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
            gapAreas: [],
            recommendation: {
              type: 'proceed',
              summary: 'Excellent fit',
              details: 'All requirements met.',
            },
          },
        }),
      });

      renderFitAnalysis();

      const textarea = screen.getByTestId('job-description-textarea');
      const validInput =
        'This is a valid job description for a Senior Software Engineer position with at least 50 characters.';
      fireEvent.change(textarea, { target: { value: validInput } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('results-section')).toBeInTheDocument();
      });

      expect(screen.getByText('Strong Match')).toBeInTheDocument();
      expect(screen.getByText('Recommended to Proceed')).toBeInTheDocument();
    });

    it('displays error on failed analysis', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          },
        }),
      });

      renderFitAnalysis();

      const textarea = screen.getByTestId('job-description-textarea');
      const validInput =
        'This is a valid job description for a Senior Software Engineer position with at least 50 characters.';
      fireEvent.change(textarea, { target: { value: validInput } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument();
      });
    });
  });

  describe('new analysis flow', () => {
    it('allows starting a new analysis after results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          assessment: {
            id: 'test-1',
            timestamp: new Date().toISOString(),
            jobDescriptionPreview: 'Test job description...',
            confidenceScore: 'partial_match',
            alignmentAreas: [],
            gapAreas: [],
            recommendation: {
              type: 'consider',
              summary: 'Worth considering',
              details: 'Good fit overall.',
            },
          },
        }),
      });

      renderFitAnalysis();

      // Submit analysis
      const textarea = screen.getByTestId('job-description-textarea');
      const validInput =
        'This is a valid job description for a Senior Software Engineer position with at least 50 characters.';
      fireEvent.change(textarea, { target: { value: validInput } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Wait for results
      await waitFor(() => {
        expect(screen.getByTestId('results-section')).toBeInTheDocument();
      });

      // Click new analysis button
      const newAnalysisButton = screen.getByTestId('new-analysis-button');
      fireEvent.click(newAnalysisButton);

      // Should show input section again
      await waitFor(() => {
        expect(screen.getByTestId('job-description-textarea')).toBeInTheDocument();
      });
    });
  });
});
