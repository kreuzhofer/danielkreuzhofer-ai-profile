// src/components/coaching/MethodTimeline.tsx
import React from 'react';
import { coachingContent } from './content';

export function MethodTimeline() {
  const { method } = coachingContent;
  return (
    <section id="method" aria-label={method.heading} className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--primary-400)]">
          {method.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-2">{method.heading}</h2>
        <p className="text-[var(--secondary-400)] font-semibold mb-8">{method.subline}</p>
        <ol className="space-y-6">
          {method.phases.map((phase, i) => (
            <li
              key={phase.name}
              className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  <span className="text-[var(--primary-400)] mr-2">{i + 1}.</span>
                  {phase.name}
                </h3>
                <span className="flex-shrink-0 text-sm font-medium text-[var(--foreground-muted)]">{phase.weeks}</span>
              </div>
              <ul className="space-y-2">
                {phase.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[var(--foreground-muted)] text-sm">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--primary-500)]" aria-hidden="true" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default MethodTimeline;
