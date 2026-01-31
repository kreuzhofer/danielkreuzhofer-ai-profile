'use client';

import React from 'react';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks';

/**
 * Icon for Skills Transparency
 */
function TransparencyIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
      />
    </svg>
  );
}

/**
 * Icon for Fit Analysis
 */
function FitAnalysisIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
      />
    </svg>
  );
}

/**
 * Props for RecruiterCTASection
 */
export interface RecruiterCTASectionProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * RecruiterCTASection - A visually distinct section targeting recruiters and hiring managers.
 * 
 * Placed after the Skills section to provide a natural progression:
 * "Here are my skills" → "Want proof? Want to check fit?"
 * 
 * Features:
 * - Two CTA cards: Skills Transparency and Fit Analysis
 * - Compelling copy that emphasizes honesty and transparency
 * - Subtle gradient background to stand out from content sections
 * - Responsive layout (stacked on mobile, side-by-side on desktop)
 */
export function RecruiterCTASection({ className = '' }: RecruiterCTASectionProps) {
  const { ref, animationStyle } = useScrollAnimation({ triggerOnce: true });

  return (
    <section
      id="recruiter-tools"
      aria-label="Tools for recruiters and hiring managers"
      className={`py-12 md:py-16 lg:py-20 ${className}`}
    >
      <div
        ref={ref}
        style={animationStyle}
        className="max-w-4xl mx-auto"
      >
        {/* Section intro */}
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-[var(--primary-600)] uppercase tracking-wide mb-2">
            For Recruiters & Hiring Managers
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            I believe in radical transparency
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Skip the guesswork. Get honest insights into my expertise and an AI-powered 
            assessment of how I match your specific requirements.
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills Transparency Card */}
          <Link
            href="/transparency"
            className="group block p-6 bg-white rounded-xl border border-gray-200 
                       hover:border-[var(--primary-300)] hover:shadow-lg 
                       transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--primary-50)] 
                              flex items-center justify-center
                              group-hover:bg-[var(--primary-100)] transition-colors">
                <TransparencyIcon className="w-6 h-6 text-[var(--primary-600)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-1 
                               group-hover:text-[var(--primary-700)] transition-colors">
                  Skills Transparency
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  See evidence-backed expertise, working knowledge areas, and explicit gaps 
                  I&apos;ve chosen not to pursue.
                </p>
                <span className="inline-flex items-center text-sm font-medium 
                                 text-[var(--primary-600)] group-hover:text-[var(--primary-700)]">
                  View dashboard
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Fit Analysis Card */}
          <Link
            href="/fit-analysis"
            className="group block p-6 bg-white rounded-xl border border-gray-200 
                       hover:border-[var(--primary-300)] hover:shadow-lg 
                       transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--primary-50)] 
                              flex items-center justify-center
                              group-hover:bg-[var(--primary-100)] transition-colors">
                <FitAnalysisIcon className="w-6 h-6 text-[var(--primary-600)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-1 
                               group-hover:text-[var(--primary-700)] transition-colors">
                  Fit Analysis
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Paste your job description and get an instant, honest assessment of 
                  alignment, strengths, and potential gaps.
                </p>
                <span className="inline-flex items-center text-sm font-medium 
                                 text-[var(--primary-600)] group-hover:text-[var(--primary-700)]">
                  Analyze fit
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RecruiterCTASection;
