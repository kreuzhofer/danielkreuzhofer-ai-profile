// src/components/coaching/LeadMagnetsSection.tsx
import React from 'react';
import Link from 'next/link';
import { coachingContent } from './content';

export function LeadMagnetsSection() {
  const { leadMagnets } = coachingContent;
  return (
    <section
      id="lead-magnets"
      aria-label={leadMagnets.heading}
      className="py-12 md:py-16 border-t border-[var(--border)]"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--secondary-400)]">
          {leadMagnets.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-3">{leadMagnets.heading}</h2>
        <p className="text-[var(--foreground-muted)] mb-8 max-w-2xl">{leadMagnets.intro}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {leadMagnets.magnets.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5
                         hover:border-[var(--secondary-500)] transition-colors"
            >
              <h3 className="font-semibold text-[var(--foreground)] mb-1 group-hover:text-[var(--secondary-400)]">
                {m.title}
              </h3>
              <p className="text-sm text-[var(--foreground-muted)]">{m.description}</p>
            </Link>
          ))}
        </div>
        {leadMagnets.youtubeUrl ? (
          <a
            href={leadMagnets.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mt-8 text-sm font-medium text-[var(--secondary-400)] hover:text-[var(--secondary-300)]"
          >
            {leadMagnets.youtubeText}
            <span aria-hidden="true" className="ml-1">→</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}

export default LeadMagnetsSection;
