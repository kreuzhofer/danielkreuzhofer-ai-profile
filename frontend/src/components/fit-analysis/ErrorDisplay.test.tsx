/**
 * ErrorDisplay Component Tests
 *
 * @see Requirements 6.1, 6.2, 6.3, 6.4
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from './ErrorDisplay';
import { FitAnalysisError } from '@/types/fit-analysis';

describe('ErrorDisplay', () => {
  const mockOnRetry = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
    mockOnDismiss.mockClear();
  });

  describe('rendering', () => {
    it('renders error display', () => {
      const error: FitAnalysisError = {
        type: 'network',
        message: 'Unable to connect',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByTestId('error-display')).toBeInTheDocument();
    });

    it('displays error message', () => {
      const error: FitAnalysisError = {
        type: 'timeout',
        message: 'The analysis is taking too long',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'The analysis is taking too long'
      );
    });

    it('displays suggestions', () => {
      const error: FitAnalysisError = {
        type: 'server',
        message: 'Server error',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByTestId('error-suggestions')).toBeInTheDocument();
    });
  });

  describe('error types', () => {
    it('handles validation error', () => {
      const error: FitAnalysisError = {
        type: 'validation',
        message: 'Invalid input',
        retryable: false,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByTestId('error-display')).toHaveAttribute(
        'data-error-type',
        'validation'
      );
    });

    it('handles network error', () => {
      const error: FitAnalysisError = {
        type: 'network',
        message: 'Network error',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByTestId('error-display')).toHaveAttribute(
        'data-error-type',
        'network'
      );
    });

    it('handles timeout error', () => {
      const error: FitAnalysisError = {
        type: 'timeout',
        message: 'Timeout',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByTestId('error-display')).toHaveAttribute(
        'data-error-type',
        'timeout'
      );
    });

    it('handles server error', () => {
      const error: FitAnalysisError = {
        type: 'server',
        message: 'Server error',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByTestId('error-display')).toHaveAttribute(
        'data-error-type',
        'server'
      );
    });

    it('handles unknown error', () => {
      const error: FitAnalysisError = {
        type: 'unknown',
        message: 'Unknown error',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByTestId('error-display')).toHaveAttribute(
        'data-error-type',
        'unknown'
      );
    });
  });

  describe('retry button', () => {
    it('shows retry button when retryable', () => {
      const error: FitAnalysisError = {
        type: 'network',
        message: 'Network error',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('hides retry button when not retryable', () => {
      const error: FitAnalysisError = {
        type: 'validation',
        message: 'Validation error',
        retryable: false,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
    });

    it('calls onRetry when clicked', () => {
      const error: FitAnalysisError = {
        type: 'network',
        message: 'Network error',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      fireEvent.click(screen.getByTestId('retry-button'));
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('dismiss button', () => {
    it('shows dismiss button when onDismiss provided', () => {
      const error: FitAnalysisError = {
        type: 'network',
        message: 'Network error',
        retryable: true,
      };

      render(
        <ErrorDisplay
          error={error}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByTestId('dismiss-button')).toBeInTheDocument();
    });

    it('hides dismiss button when onDismiss not provided', () => {
      const error: FitAnalysisError = {
        type: 'network',
        message: 'Network error',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.queryByTestId('dismiss-button')).not.toBeInTheDocument();
    });

    it('calls onDismiss when clicked', () => {
      const error: FitAnalysisError = {
        type: 'network',
        message: 'Network error',
        retryable: true,
      };

      render(
        <ErrorDisplay
          error={error}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      fireEvent.click(screen.getByTestId('dismiss-button'));
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has alert role', () => {
      const error: FitAnalysisError = {
        type: 'network',
        message: 'Network error',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('suggestions content', () => {
    it('shows network-specific suggestions', () => {
      const error: FitAnalysisError = {
        type: 'network',
        message: 'Network error',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
    });

    it('shows timeout-specific suggestions', () => {
      const error: FitAnalysisError = {
        type: 'timeout',
        message: 'Timeout',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText(/taking longer than expected/i)).toBeInTheDocument();
    });

    it('shows server-specific suggestions', () => {
      const error: FitAnalysisError = {
        type: 'server',
        message: 'Server error',
        retryable: true,
      };

      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText(/servers are experiencing issues/i)).toBeInTheDocument();
    });
  });
});
