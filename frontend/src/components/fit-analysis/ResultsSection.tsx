/**
 * ResultsSection Component
 *
 * Composes ConfidenceIndicator, AlignmentList, GapList, and RecommendationCard
 * to display the complete analysis results with a disclaimer.
 *
 * @see Requirements 3.1, 7.2, 7.6, 10.4, 10.5
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { MatchAssessment, CONFIDENCE_DISPLAY } from '@/types/fit-analysis';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { AlignmentList } from './AlignmentList';
import { GapList } from './GapList';
import { RecommendationCard } from './RecommendationCard';
import { LiveRegion } from './LiveRegion';
import {
  generateResultsMarkdown,
  generateResultsPdf,
  downloadAsFile,
  buildExportFilename,
} from '@/lib/fit-analysis-export';

export interface ResultsSectionProps {
  /** The match assessment to display */
  assessment: MatchAssessment;
  /** Callback when user wants to start a new analysis */
  onNewAnalysis: () => void;
  /** Full job description text for export (falls back to preview) */
  jobDescriptionFull?: string;
  /** Whether to announce results and manage focus (default: true) */
  announceResults?: boolean;
}

/**
 * ResultsSection displays the complete analysis results
 */
export const ResultsSection: React.FC<ResultsSectionProps> = ({
  assessment,
  onNewAnalysis,
  jobDescriptionFull,
  announceResults = true,
}) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus management: move focus to results when they appear
  useEffect(() => {
    if (announceResults && resultsRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        resultsRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [assessment.id, announceResults]);

  // Build announcement message for screen readers
  const confidenceDisplay = CONFIDENCE_DISPLAY[assessment.confidenceScore];
  const announcementMessage = announceResults
    ? `Analysis complete. ${confidenceDisplay.label}: ${confidenceDisplay.description}. ${assessment.alignmentAreas.length} alignment areas and ${assessment.gapAreas.length} gaps identified.`
    : '';

  const handleDownloadMarkdown = useCallback(() => {
    const markdown = generateResultsMarkdown(assessment, jobDescriptionFull);
    const filename = buildExportFilename(assessment, 'md');
    downloadAsFile(markdown, filename, 'text/markdown');
  }, [assessment, jobDescriptionFull]);

  const handleDownloadPdf = useCallback(() => {
    const doc = generateResultsPdf(assessment, jobDescriptionFull);
    const filename = buildExportFilename(assessment, 'pdf');
    doc.save(filename);
  }, [assessment, jobDescriptionFull]);

  const pdfIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );

  const mdIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
    </svg>
  );

  const downloadButtons = (position: 'top' | 'bottom') => (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDownloadPdf}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[var(--primary-400)] bg-[var(--primary-900)] hover:bg-[var(--primary-800)] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2"
        data-testid={`download-pdf-button${position === 'bottom' ? '-bottom' : ''}`}
        aria-label="Download analysis results as PDF"
      >
        {pdfIcon}
        Download PDF
      </button>
      <button
        onClick={handleDownloadMarkdown}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] bg-[var(--surface-elevated)] hover:bg-[var(--surface)] border border-[var(--border)] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2"
        data-testid={`download-md-button${position === 'bottom' ? '-bottom' : ''}`}
        aria-label="Download analysis results as Markdown"
      >
        {mdIcon}
        Download .md
      </button>
    </div>
  );

  return (
    <>
      {/* ARIA Live Region for screen reader announcements */}
      <LiveRegion
        message={announcementMessage}
        politeness="polite"
        clearAfter={5000}
      />

      <div
        ref={resultsRef}
        className="space-y-6"
        data-testid="results-section"
        role="region"
        aria-label="Analysis Results"
        tabIndex={-1}
      >
        {/* Job title */}
        <h2
          className="text-lg font-semibold text-[var(--foreground)]"
          data-testid="results-job-preview"
        >
          {assessment.jobDescriptionPreview}
        </h2>

        {/* Header with confidence and action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <ConfidenceIndicator
            level={assessment.confidenceScore}
            ariaLabel={`Overall match confidence: ${assessment.confidenceScore.replace('_', ' ')}`}
          />
          <div className="flex items-center gap-2">
            {downloadButtons('top')}
            <button
              onClick={onNewAnalysis}
              className="px-4 py-2 text-sm font-medium text-[var(--primary-400)] bg-[var(--primary-900)] hover:bg-[var(--primary-800)] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2"
              data-testid="new-analysis-button"
            >
              Start New Analysis
            </button>
          </div>
        </div>

        {/* Recommendation Card - prominent placement */}
        <RecommendationCard recommendation={assessment.recommendation} />

        {/* Alignment and Gap sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AlignmentList items={assessment.alignmentAreas} />
          <GapList items={assessment.gapAreas} />
        </div>

        {/* Disclaimer */}
        <div
          className="mt-6 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]"
          data-testid="results-disclaimer"
          role="note"
        >
          <p className="text-sm text-[var(--foreground-muted)]">
            <strong className="text-[var(--foreground)]">Disclaimer:</strong> This analysis is
            generated by AI based on the portfolio owner&apos;s documented experience.
            It provides an honest assessment but should be used as one input among
            many in your evaluation process. The analysis may not capture all nuances
            of the role or the candidate&apos;s full capabilities.
          </p>
        </div>

        {/* Analysis metadata */}
        <div
          className="text-xs text-[var(--foreground-subtle)] text-center"
          data-testid="analysis-metadata"
        >
          Analysis performed on{' '}
          {new Date(assessment.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>

        {/* Bottom download buttons */}
        <div className="flex justify-center">
          {downloadButtons('bottom')}
        </div>
      </div>
    </>
  );
};

export default ResultsSection;
