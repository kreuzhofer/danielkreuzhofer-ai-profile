// src/components/home/MicroMagnetSection.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { homeContent } from './content';

export function MicroMagnetSection() {
  const { microMagnet } = homeContent;
  return (
    <section
      id="engpass-check"
      aria-label={microMagnet.heading}
      className="py-12 md:py-16 border-y border-[var(--border)] bg-[var(--surface)]
                 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--primary-400)]">
          {microMagnet.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-4">{microMagnet.heading}</h2>
        <p className="text-[var(--foreground-muted)] text-lg mb-8 max-w-2xl mx-auto">{microMagnet.body}</p>
        <Button variant="primary" size="lg" href={microMagnet.href}>
          {microMagnet.cta}
        </Button>
      </div>
    </section>
  );
}

export default MicroMagnetSection;
