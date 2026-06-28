// src/components/coaching/LandingSection.tsx
import React from 'react';
import type { Accent } from './content';

export interface LandingSectionProps {
  id: string;
  eyebrow: string;
  heading: string;
  intro: string;
  bullets: string[];
  accent: Accent;
}

const ACCENT_TEXT: Record<Accent, string> = {
  primary: 'text-[var(--primary-400)]',
  secondary: 'text-[var(--secondary-400)]',
};

const ACCENT_MARKER: Record<Accent, string> = {
  primary: 'bg-[var(--primary-500)]',
  secondary: 'bg-[var(--secondary-400)]',
};

export function LandingSection({ id, eyebrow, heading, intro, bullets, accent }: LandingSectionProps) {
  return (
    <section id={id} aria-label={heading} className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <p className={`text-xs font-bold tracking-[0.18em] uppercase mb-3 ${ACCENT_TEXT[accent]}`}>
          {eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-4">{heading}</h2>
        <p className="text-[var(--foreground-muted)] text-lg mb-6">{intro}</p>
        <ul className="space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-[var(--foreground)]">
              <span className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${ACCENT_MARKER[accent]}`} aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default LandingSection;
