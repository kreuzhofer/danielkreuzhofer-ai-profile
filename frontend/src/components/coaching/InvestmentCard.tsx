// src/components/coaching/InvestmentCard.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { coachingContent, BOOKING_URL } from './content';

export function InvestmentCard() {
  const { investment } = coachingContent;
  return (
    <section id="investment" aria-label="Investition" className="py-12 md:py-16">
      <div className="max-w-2xl mx-auto rounded-2xl border border-[var(--primary-700)] bg-[var(--surface)] p-8 text-center">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--primary-400)]">
          {investment.eyebrow}
        </p>
        <h2 className="brand-display text-3xl md:text-4xl text-[var(--foreground)] mb-2">{investment.heading}</h2>
        <p className="text-[var(--foreground-muted)] mb-6">{investment.subline}</p>
        <ul className="text-left space-y-3 mb-8">
          {investment.includes.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[var(--foreground)]">
              <span className="mt-1 text-[var(--success)]" aria-hidden="true">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Button variant="primary" size="lg" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
          {investment.cta}
        </Button>
      </div>
    </section>
  );
}

export default InvestmentCard;
