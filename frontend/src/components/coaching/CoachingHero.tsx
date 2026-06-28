// src/components/coaching/CoachingHero.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { coachingContent, BOOKING_URL } from './content';

export function CoachingHero() {
  const { hero } = coachingContent;
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative flex min-h-[calc(86vh-4rem)] flex-col items-center
                 bg-[var(--gradient-hero)] px-4 pb-6 -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 text-center"
    >
      <div className="relative z-10 mx-auto flex max-w-4xl flex-1 flex-col justify-center">
        <p className="text-[var(--secondary-400)] text-xs font-bold tracking-[0.18em] uppercase mb-3">
          {hero.eyebrow}
        </p>
        <h1 className="brand-display text-4xl md:text-5xl lg:text-6xl text-[var(--foreground)] mb-5">
          {hero.headline}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-[var(--foreground-muted)] max-w-2xl mx-auto mb-10">
          {hero.tagline}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" size="lg" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
            {hero.primaryCta}
          </Button>
          <Button variant="secondary" size="lg" href={hero.secondaryHref}>
            {hero.secondaryCta}
          </Button>
        </div>
      </div>

      {/* Scroll cue — a visible lead-over into the sections below (Beweis peeks above the fold). */}
      <a
        href="#proof"
        aria-label="Weiter zu den Inhalten"
        className="relative z-10 mt-4 inline-flex flex-col items-center gap-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Mehr erfahren</span>
        <svg className="h-5 w-5 motion-safe:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </a>
    </section>
  );
}

export default CoachingHero;
