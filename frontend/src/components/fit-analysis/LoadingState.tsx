/**
 * LoadingState Component
 *
 * Displays progress indicator and status message during analysis.
 *
 * @see Requirement 2.2
 */

import React from 'react';

export interface LoadingStateProps {
  /** Optional status message to display */
  message?: string;
  /** Optional className for styling */
  className?: string;
}

/**
 * LoadingState shows a loading indicator during analysis
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Analyzing your job description...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 ${className}`}
      role="status"
      aria-live="polite"
      data-testid="loading-state"
    >
      {/* Animated spinner */}
      <div className="relative">
        <div
          className="w-16 h-16 border-4 border-[var(--primary-900)] rounded-full animate-spin"
          style={{ borderTopColor: 'var(--primary-500)' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl" aria-hidden="true">
            🔍
          </span>
        </div>
      </div>

      {/* Status message */}
      <p
        className="mt-4 text-lg font-medium text-[var(--foreground)]"
        data-testid="loading-message"
      >
        {message}
      </p>

      {/* Progress steps */}
      <div className="mt-4 text-sm text-[var(--foreground-muted)] space-y-1 text-center">
        <p>• Reviewing your job description</p>
        <p>• Matching against documented experience</p>
        <p>• Generating honest assessment</p>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">
        Analysis in progress. Please wait while we review the job description.
      </span>
    </div>
  );
};

export default LoadingState;
