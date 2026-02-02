/**
 * LoadingState Component
 *
 * Displays progress indicator and status message during analysis.
 * Shows real-time progress based on streaming updates from the API.
 *
 * @see Requirement 2.2
 */

'use client';

import React from 'react';
import type { AnalysisProgress } from '@/types/fit-analysis';

export interface LoadingStateProps {
  /** Current analysis progress */
  progress?: AnalysisProgress | null;
  /** Optional className for styling */
  className?: string;
}

/**
 * LoadingState shows a progress indicator during analysis
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  progress,
  className = '',
}) => {
  const percent = progress?.percent ?? 5;
  const message = progress?.message ?? 'Preparing analysis...';

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 ${className}`}
      role="status"
      aria-live="polite"
      data-testid="loading-state"
    >
      {/* Progress indicator */}
      <div className="w-full max-w-md mb-6">
        {/* Progress bar container */}
        <div 
          className="h-3 bg-[var(--primary-900)] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Analysis progress: ${percent}%`}
        >
          {/* Progress bar fill */}
          <div
            className="h-full bg-[var(--primary-500)] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        
        {/* Percentage text */}
        <div className="flex justify-between mt-2 text-sm text-[var(--foreground-muted)]">
          <span>{percent}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Animated icon */}
      <div className="relative mb-4">
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
        className="text-lg font-medium text-[var(--foreground)]"
        data-testid="loading-message"
      >
        {message}
      </p>

      {/* Phase indicators */}
      <div className="mt-6 space-y-2 text-sm text-[var(--foreground-muted)]">
        <PhaseIndicator 
          label="Preparing context" 
          isActive={progress?.phase === 'preparing'} 
          isComplete={percent > 5}
        />
        <PhaseIndicator 
          label="Analyzing fit" 
          isActive={progress?.phase === 'analyzing'} 
          isComplete={percent > 20}
        />
        <PhaseIndicator 
          label="Finding alignments" 
          isActive={progress?.phase === 'finding_alignments'} 
          isComplete={percent > 40}
        />
        <PhaseIndicator 
          label="Identifying gaps" 
          isActive={progress?.phase === 'identifying_gaps'} 
          isComplete={percent > 60}
        />
        <PhaseIndicator 
          label="Generating recommendation" 
          isActive={progress?.phase === 'generating_recommendation'} 
          isComplete={percent > 80}
        />
        <PhaseIndicator 
          label="Finalizing results" 
          isActive={progress?.phase === 'finalizing'} 
          isComplete={percent >= 100}
        />
      </div>

      {/* Screen reader text */}
      <span className="sr-only">
        Analysis in progress: {message} ({percent}% complete)
      </span>
    </div>
  );
};

/**
 * Individual phase indicator with checkmark/spinner
 */
interface PhaseIndicatorProps {
  label: string;
  isActive: boolean;
  isComplete: boolean;
}

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ label, isActive, isComplete }) => {
  return (
    <div className={`flex items-center gap-2 ${isActive ? 'text-[var(--foreground)]' : ''}`}>
      {isComplete ? (
        <span className="text-green-500" aria-hidden="true">✓</span>
      ) : isActive ? (
        <span className="inline-block w-4 h-4 border-2 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      ) : (
        <span className="text-[var(--foreground-muted)]" aria-hidden="true">○</span>
      )}
      <span className={isComplete ? 'line-through opacity-60' : isActive ? 'font-medium' : ''}>
        {label}
      </span>
    </div>
  );
};

export default LoadingState;
