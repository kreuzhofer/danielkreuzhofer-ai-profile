'use client';

/**
 * FitAnalysisModule Component
 *
 * Main container component that composes IntroSection, InputSection,
 * LoadingState, ResultsSection, and HistoryPanel.
 *
 * @see Requirements 1.1, 8.1, 10.1
 */

import React from 'react';
import { useFitAnalysis } from '@/context/FitAnalysisContext';
import { JOB_DESCRIPTION_CONSTRAINTS } from '@/types/fit-analysis';
import { InputSection } from './InputSection';
import { ResultsSection } from './ResultsSection';
import { HistoryPanel } from './HistoryPanel';
import { ErrorDisplay } from './ErrorDisplay';
import { IntroSection } from './IntroSection';
import { LoadingState } from './LoadingState';

export interface FitAnalysisModuleProps {
  /** Optional className for styling */
  className?: string;
}

/**
 * FitAnalysisModule is the main container for the fit analysis feature.
 * It orchestrates all sub-components and manages the analysis flow.
 */
export const FitAnalysisModule: React.FC<FitAnalysisModuleProps> = ({
  className = '',
}) => {
  const {
    jobDescription,
    setJobDescription,
    submitAnalysis,
    isAnalyzing,
    currentResult,
    analysisHistory,
    error,
    clearCurrentResult,
    loadHistoryItem,
    clearHistory,
    retryAnalysis,
  } = useFitAnalysis();

  // Convert history items for HistoryPanel
  const historyItems = analysisHistory.map((item) => ({
    id: item.id,
    timestamp: item.timestamp,
    jobDescriptionPreview: item.jobDescriptionPreview,
    confidenceScore: item.confidenceScore,
  }));

  const handleNewAnalysis = () => {
    clearCurrentResult();
    setJobDescription('');
  };

  const handleDismissError = () => {
    // Clear error by triggering a state update
    // The context should handle this
  };

  return (
    <div
      className={`max-w-4xl mx-auto px-4 py-8 ${className}`}
      data-testid="fit-analysis-module"
    >
      {/* Intro Section - always visible */}
      <IntroSection />

      <div className="mt-8 space-y-6">
        {/* Error Display */}
        {error && (
          <ErrorDisplay
            error={error}
            onRetry={retryAnalysis}
            onDismiss={handleDismissError}
          />
        )}

        {/* Loading State */}
        {isAnalyzing && <LoadingState />}

        {/* Results Section - shown when we have results */}
        {currentResult && !isAnalyzing && (
          <ResultsSection
            assessment={currentResult}
            onNewAnalysis={handleNewAnalysis}
          />
        )}

        {/* Input Section - shown when no results or starting new analysis */}
        {!currentResult && !isAnalyzing && (
          <InputSection
            value={jobDescription}
            onChange={setJobDescription}
            onSubmit={submitAnalysis}
            isDisabled={isAnalyzing}
            maxLength={JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH}
            minLength={JOB_DESCRIPTION_CONSTRAINTS.MIN_LENGTH_WARNING}
            placeholder="Paste a job description here to analyze how well it aligns with my experience..."
          />
        )}

        {/* History Panel - always visible */}
        <HistoryPanel
          items={historyItems}
          onSelectItem={loadHistoryItem}
          onClearHistory={clearHistory}
        />
      </div>
    </div>
  );
};

export default FitAnalysisModule;
