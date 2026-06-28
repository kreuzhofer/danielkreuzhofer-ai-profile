// src/components/home/CoachingPointer.tsx
import React from 'react';
import Link from 'next/link';
import { homeContent } from './content';

/** Soft pointer to the offer for already-warm leads — NOT a hard sales CTA. */
export function CoachingPointer() {
  const { coachingPointer } = homeContent;
  return (
    <section
      id="coaching-pointer"
      aria-label={coachingPointer.heading}
      className="py-12 md:py-16 border-t border-[var(--border)]"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="heading-section text-xl md:text-2xl text-[var(--foreground)] mb-3">
          {coachingPointer.heading}
        </h2>
        <p className="text-[var(--foreground-muted)] mb-6 max-w-2xl mx-auto">{coachingPointer.body}</p>
        <Link
          href={coachingPointer.href}
          className="inline-flex items-center rounded-lg border border-[var(--primary-500)] px-5 py-2.5
                     text-sm font-medium text-[var(--primary-400)] hover:bg-[var(--primary-500)]/10 transition-colors"
        >
          {coachingPointer.cta} <span aria-hidden="true" className="ml-1">→</span>
        </Link>
      </div>
    </section>
  );
}

export default CoachingPointer;
