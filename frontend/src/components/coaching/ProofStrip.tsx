// src/components/coaching/ProofStrip.tsx
import React from 'react';
import Link from 'next/link';
import { coachingContent } from './content';

export function ProofStrip() {
  const { proof } = coachingContent;
  return (
    <section
      id="proof"
      aria-label={proof.heading}
      className="py-10 md:py-12 border-y border-[var(--border)] bg-[var(--surface)]
                 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--primary-400)]">
          {proof.eyebrow}
        </p>
        <h2 className="heading-section text-xl md:text-2xl text-[var(--foreground)] mb-6">
          {proof.heading}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3 mb-6">
          {proof.points.map((p) => (
            <li key={p} className="text-[var(--foreground-muted)] text-sm leading-relaxed">{p}</li>
          ))}
        </ul>
        <Link
          href={proof.linkHref}
          className="inline-flex items-center text-sm font-medium text-[var(--primary-400)] hover:text-[var(--primary-300)]"
        >
          {proof.linkText}
          <span aria-hidden="true" className="ml-1">→</span>
        </Link>
      </div>
    </section>
  );
}

export default ProofStrip;
