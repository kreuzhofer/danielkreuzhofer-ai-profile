/**
 * IntroSection Component
 *
 * Displays title, description, and example prompts for the fit analysis feature.
 * Uses inviting language to encourage visitors to try the analysis.
 *
 * @see Requirements 10.1, 10.2, 10.3
 */

import React from 'react';

export interface IntroSectionProps {
  /** Optional className for styling */
  className?: string;
}

/**
 * IntroSection provides context and guidance for the fit analysis feature
 */
export const IntroSection: React.FC<IntroSectionProps> = ({ className = '' }) => {
  return (
    <section
      className={`text-center ${className}`}
      data-testid="intro-section"
    >
      {/* Title */}
      <h1
        className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]"
        data-testid="intro-title"
      >
        Fit Analysis
      </h1>

      {/* Description */}
      <p
        className="mt-4 text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto"
        data-testid="intro-description"
      >
        Curious if my experience aligns with your role? Paste a job description
        below and get an honest, AI-powered assessment of the fit — including
        strengths, potential gaps, and a transparent recommendation.
      </p>

      {/* Features list */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-[var(--foreground-muted)]">
        <div className="flex items-center gap-2">
          <span className="text-[var(--success)]" aria-hidden="true">
            ✓
          </span>
          <span>Evidence-based alignment</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--warning)]" aria-hidden="true">
            ⚠
          </span>
          <span>Transparent gaps</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--primary-400)]" aria-hidden="true">
            💡
          </span>
          <span>Honest recommendations</span>
        </div>
      </div>

      {/* Example prompts */}
      <div
        className="mt-8 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]"
        data-testid="example-prompts"
      >
        <h2 className="text-sm font-medium text-[var(--foreground-muted)] mb-2">
          What kind of roles work best?
        </h2>
        <ul className="text-sm text-[var(--foreground-muted)] space-y-1">
          <li>• Solutions Architect or Technical Lead positions</li>
          <li>• Cloud architecture and AWS-focused roles</li>
          <li>• Full-stack development with TypeScript/React</li>
          <li>• Technical consulting or pre-sales engineering</li>
        </ul>
      </div>
    </section>
  );
};

export default IntroSection;
