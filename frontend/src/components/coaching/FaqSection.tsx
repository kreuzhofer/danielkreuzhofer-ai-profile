// src/components/coaching/FaqSection.tsx
import React from 'react';
import { coachingContent } from './content';

export function FaqSection() {
  const { faq } = coachingContent;
  return (
    <section id="faq" aria-label="FAQ" className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--primary-400)]">
          {faq.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-6">{faq.heading}</h2>
        <div className="space-y-3">
          {faq.items.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <summary className="cursor-pointer list-none font-medium text-[var(--foreground)] flex items-center justify-between gap-4">
                {item.q}
                <span aria-hidden="true" className="text-[var(--foreground-muted)] group-open:rotate-45 transition-transform">＋</span>
              </summary>
              <p className="mt-3 text-[var(--foreground-muted)] leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
