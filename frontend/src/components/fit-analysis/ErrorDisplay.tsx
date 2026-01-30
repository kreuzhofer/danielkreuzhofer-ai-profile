/**
 * ErrorDisplay Component
 *
 * Displays user-friendly error messages with retry button.
 * Suggests alternatives when LLM is unavailable.
 *
 * @see Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */

import React from 'react';
import { FitAnalysisError, FitAnalysisErrorType } from '@/types/fit-analysis';

export interface ErrorDisplayProps {
  /** The error to display */
  error: FitAnalysisError;
  /** Callback when retry button is clicked */
  onRetry: () => void;
  /** Callback when dismiss button is clicked */
  onDismiss?: () => void;
}

/**
 * Get icon for error type
 */
const getErrorIcon = (type: FitAnalysisErrorType): string => {
  switch (type) {
    case 'validation':
      return '⚠️';
    case 'network':
      return '🌐';
    case 'timeout':
      return '⏱️';
    case 'server':
      return '🔧';
    case 'unknown':
    default:
      return '❌';
  }
};

/**
 * Get CSS classes for error type styling
 */
const getErrorClasses = (type: FitAnalysisErrorType): {
  border: string;
  bg: string;
  icon: string;
} => {
  switch (type) {
    case 'validation':
      return {
        border: 'border-yellow-300',
        bg: 'bg-yellow-50',
        icon: 'text-yellow-600',
      };
    case 'network':
    case 'timeout':
    case 'server':
    case 'unknown':
    default:
      return {
        border: 'border-red-300',
        bg: 'bg-red-50',
        icon: 'text-red-600',
      };
  }
};

/**
 * Get alternative suggestions based on error type
 */
const getAlternativeSuggestions = (type: FitAnalysisErrorType): string[] => {
  switch (type) {
    case 'network':
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Use the contact form to reach out directly',
      ];
    case 'timeout':
      return [
        'The analysis is taking longer than expected',
        'Try with a shorter job description',
        'Use the AI chatbot for quick questions',
      ];
    case 'server':
      return [
        'Our servers are experiencing issues',
        'Try again in a few minutes',
        'Use the contact form as an alternative',
      ];
    case 'validation':
      return ['Please check your input and try again'];
    case 'unknown':
    default:
      return [
        'An unexpected error occurred',
        'Try refreshing the page',
        'Contact us if the problem persists',
      ];
  }
};

/**
 * ErrorDisplay shows user-friendly error messages with recovery options
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  const classes = getErrorClasses(error.type);
  const suggestions = getAlternativeSuggestions(error.type);

  return (
    <div
      className={`border-2 ${classes.border} ${classes.bg} rounded-lg p-4`}
      role="alert"
      data-testid="error-display"
      data-error-type={error.type}
    >
      <div className="flex items-start gap-3">
        {/* Error icon */}
        <span
          className={`flex-shrink-0 text-2xl ${classes.icon}`}
          aria-hidden="true"
        >
          {getErrorIcon(error.type)}
        </span>

        <div className="flex-1 min-w-0">
          {/* Error message */}
          <p
            className="font-medium text-gray-900"
            data-testid="error-message"
          >
            {error.message}
          </p>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <ul
              className="mt-2 text-sm text-gray-600 space-y-1"
              data-testid="error-suggestions"
            >
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-gray-400" aria-hidden="true">
                    •
                  </span>
                  {suggestion}
                </li>
              ))}
            </ul>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-3">
            {error.retryable && (
              <button
                onClick={onRetry}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                data-testid="retry-button"
              >
                Try Again
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                data-testid="dismiss-button"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
