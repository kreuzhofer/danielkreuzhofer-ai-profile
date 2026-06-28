// src/components/coaching/FinalCtaSection.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { coachingContent, BOOKING_URL } from './content';

export function FinalCtaSection() {
  const { finalCta } = coachingContent;
  return (
    <section
      id="final-cta"
      aria-label="Erstgespräch buchen"
      className="py-16 md:py-20 text-center bg-[var(--gradient-hero)]
                 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="brand-display text-3xl md:text-4xl text-[var(--foreground)] mb-4">{finalCta.heading}</h2>
        <p className="text-[var(--foreground-muted)] text-lg mb-8">{finalCta.body}</p>
        <Button variant="primary" size="lg" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
          {finalCta.cta}
        </Button>
      </div>
    </section>
  );
}

export default FinalCtaSection;
