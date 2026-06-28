// src/components/home/AboutTeaser.tsx
import React from 'react';
import Link from 'next/link';
import { homeContent } from './content';

export function AboutTeaser() {
  const { about } = homeContent;
  return (
    <section id="about-teaser" aria-label={about.heading} className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--primary-400)]">
          {about.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-4">{about.heading}</h2>
        <p className="text-[var(--foreground-muted)] text-lg mb-6">{about.body}</p>
        <Link
          href={about.href}
          className="inline-flex items-center text-sm font-medium text-[var(--primary-400)] hover:text-[var(--primary-300)]"
        >
          {about.cta} <span aria-hidden="true" className="ml-1">→</span>
        </Link>
      </div>
    </section>
  );
}

export default AboutTeaser;
