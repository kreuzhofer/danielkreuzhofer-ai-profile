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
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center
                 bg-[var(--gradient-hero)] px-4 pb-20 -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 text-center"
    >
      <div className="relative z-10 max-w-4xl mx-auto flex-1 flex flex-col justify-center">
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
    </section>
  );
}

export default CoachingHero;
