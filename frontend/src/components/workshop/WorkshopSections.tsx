// src/components/workshop/WorkshopSections.tsx
import React from 'react';
import { workshopContent } from './content';
import type { AgendaBlock } from './content';
import type { Workshop } from '@/db/schema';

/** Formats the workshop termin for display, or returns the placeholder. */
export function formatTermin(workshop: Workshop | null): string {
  if (!workshop?.termin) return 'Termin wird noch festgelegt';
  return (
    new Intl.DateTimeFormat('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(workshop.termin)) + ' Uhr'
  );
}

export function WorkshopHero() {
  const { hero } = workshopContent;
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative flex min-h-[calc(60vh-4rem)] flex-col items-center justify-center bg-[var(--gradient-hero)] px-4 pb-6 -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 text-center"
    >
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col justify-center">
        <p className="text-[var(--secondary-400)] text-xs font-bold tracking-[0.18em] uppercase mb-3">
          {hero.eyebrow}
        </p>
        <h1 className="brand-display text-3xl md:text-4xl lg:text-5xl text-[var(--foreground)] mb-5">
          {hero.headline}
        </h1>
        <p className="text-base md:text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto whitespace-pre-line">
          {hero.intro}
        </p>
      </div>
    </section>
  );
}

/** The five facts a decision-maker needs in five seconds. */
export function WorkshopAtAGlance({ workshop }: { workshop: Workshop | null }) {
  const { atAGlance } = workshopContent;
  const facts = [
    formatTermin(workshop),
    atAGlance.duration,
    atAGlance.price,
    atAGlance.capacity,
    atAGlance.preWork,
    atAGlance.payment,
  ];
  return (
    <section id="auf-einen-blick" aria-label={atAGlance.heading} className="py-10 md:py-12">
      <div className="max-w-2xl mx-auto rounded-xl border border-[var(--primary-500)]/40 bg-[var(--primary-500)]/5 p-6">
        <h2 className="text-[var(--primary-400)] text-xs font-bold tracking-[0.18em] uppercase mb-4">
          {atAGlance.heading}
        </h2>
        <ul className="space-y-2">
          {facts.map((f) => (
            <li key={f} className="flex items-start gap-3 text-[var(--foreground)]">
              <span
                className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--primary-500)]"
                aria-hidden="true"
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function WorkshopOutcome() {
  const { outcome } = workshopContent;
  return (
    <section id="ergebnis" aria-label={outcome.heading} className="py-10 md:py-14">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--secondary-400)]">
          {outcome.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-6">
          {outcome.heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {outcome.artefacts.map((a) => (
            <div key={a.name} className="rounded-lg border border-[var(--border)] p-4">
              <p className="text-[var(--primary-400)] font-bold mb-1">{a.name}</p>
              <p className="text-[var(--foreground-muted)] text-sm">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorkshopAgenda() {
  const { agenda } = workshopContent;
  return (
    <section id="agenda" aria-label={agenda.heading} className="py-10 md:py-14">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--secondary-400)]">
          {agenda.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-6">
          {agenda.heading}
        </h2>
        <ol className="space-y-3">
          {agenda.blocks.map((block: AgendaBlock) => (
            <li key={block.n} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[var(--primary-400)] font-bold text-sm w-28 flex-shrink-0">
                {block.n} · {block.name}
              </span>
              <span className="text-[var(--foreground-muted)] text-xs font-mono w-16 flex-shrink-0">
                {block.time}
              </span>
              <span className="text-[var(--foreground)] text-sm">{block.content}</span>
              {block.result && (
                <span className="text-[var(--secondary-400)] text-sm font-semibold">
                  → {block.result}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function WorkshopDemarcation() {
  const { demarcation } = workshopContent;
  return (
    <section id="abgrenzung" aria-label={demarcation.heading} className="py-10 md:py-14">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--secondary-400)]">
          {demarcation.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-4">
          {demarcation.heading}
        </h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
          {demarcation.bullets.map((b) => (
            <li key={b} className="text-[var(--foreground)] font-semibold">
              {b}
            </li>
          ))}
        </ul>
        <p className="text-[var(--foreground-muted)] text-base">{demarcation.kante}</p>
      </div>
    </section>
  );
}

export function WorkshopFramework() {
  const { framework } = workshopContent;
  return (
    <section id="rahmen" aria-label={framework.heading} className="py-10 md:py-14">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--secondary-400)]">
          {framework.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-4">
          {framework.heading}
        </h2>
        <dl className="space-y-2 text-[var(--foreground)]">
          {framework.items.map((item) => (
            <div key={item.label} className="flex flex-col sm:flex-row gap-1 sm:gap-3">
              <dt className="font-semibold text-[var(--primary-400)] sm:w-32 flex-shrink-0">
                {item.label}
              </dt>
              <dd className="text-[var(--foreground-muted)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function WorkshopLegal() {
  const { legal } = workshopContent;
  return (
    <section id="rechtliches" aria-label="Rechtliches" className="py-8 md:py-10">
      <div className="max-w-3xl mx-auto">
        <p className="text-[var(--foreground-muted)] text-sm">
          {legal.stornoConditions}{' '}
          <a
            href={legal.privacyHref}
            className="text-[var(--secondary-400)] underline hover:text-[var(--secondary-300)]"
          >
            Datenschutzerklärung
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export function WorkshopFormPlaceholder() {
  const { form } = workshopContent;
  return (
    <section id="anmeldung" aria-label="Anmeldung" className="py-12 md:py-16">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-[var(--foreground-muted)] text-lg">{form.notBookableLabel}</p>
      </div>
    </section>
  );
}
