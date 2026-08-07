// src/components/workshop/WorkshopSections.tsx
import React from 'react';
import { workshopContent } from './content';
import type { AgendaBlock } from './content';
import type { Workshop } from '@/db/schema';

/** Formats the workshop termin for display, or returns the placeholder. */
function formatTermin(workshop: Workshop | null): string {
  if (!workshop?.termin) return 'Termin wird noch festgelegt';
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(workshop.termin)) + ' Uhr';
}

export function WorkshopHero({ workshop: _workshop }: { workshop: Workshop | null }) {
  void _workshop;
  const { hero } = workshopContent;
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative flex min-h-[calc(70vh-4rem)] flex-col items-center justify-center bg-[var(--gradient-hero)] px-4 pb-6 -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 text-center"
    >
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col justify-center">
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

export function WorkshopAgenda() {
  const { agenda } = workshopContent;
  return (
    <section id="agenda" aria-label={agenda.heading} className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--secondary-400)]">
          {agenda.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-6">{agenda.heading}</h2>
        <div className="space-y-4">
          {agenda.blocks.map((block: AgendaBlock) => (
            <div
              key={block.n}
              className="border-l-2 border-[var(--primary-500)] pl-4 py-1"
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[var(--primary-400)] font-bold text-sm">
                  {block.n}. {block.name}
                </span>
                <span className="text-[var(--foreground-muted)] text-xs font-mono">{block.time}</span>
              </div>
              <p className="text-[var(--foreground)] text-sm mb-1">{block.content}</p>
              <p className="text-[var(--secondary-400)] text-xs font-semibold">→ {block.result}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorkshopOutcome() {
  const { outcome } = workshopContent;
  return (
    <section id="outcome" aria-label={outcome.heading} className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--primary-400)]">
          {outcome.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-4">{outcome.heading}</h2>
        <p className="text-[var(--foreground-muted)] text-lg mb-6">{outcome.intro}</p>
        <ul className="space-y-3">
          {outcome.artefacts.map((a) => (
            <li key={a} className="flex items-start gap-3 text-[var(--foreground)]">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--primary-500)]" aria-hidden="true" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function WorkshopFramework({ workshop }: { workshop: Workshop | null }) {
  const { framework } = workshopContent;
  const terminLabel = formatTermin(workshop);
  return (
    <section id="rahmen" aria-label={framework.heading} className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--secondary-400)]">
          {framework.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-6">{framework.heading}</h2>
        <dl className="space-y-3 text-[var(--foreground)]">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
            <dt className="font-semibold text-[var(--primary-400)] sm:w-32 flex-shrink-0">Termin</dt>
            <dd>{terminLabel}</dd>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
            <dt className="font-semibold text-[var(--primary-400)] sm:w-32 flex-shrink-0">Teilnahme</dt>
            <dd>{framework.priceLabel}</dd>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
            <dt className="font-semibold text-[var(--primary-400)] sm:w-32 flex-shrink-0">Plätze</dt>
            <dd>{framework.capacityLabel}</dd>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
            <dt className="font-semibold text-[var(--primary-400)] sm:w-32 flex-shrink-0">Ablauf</dt>
            <dd>{framework.bookingLabel}</dd>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
            <dt className="font-semibold text-[var(--primary-400)] sm:w-32 flex-shrink-0">{framework.preWorkLabel.split(':')[0]}</dt>
            <dd>{framework.preWorkLabel.split(':').slice(1).join(':').trim()}</dd>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
            <dt className="font-semibold text-[var(--primary-400)] sm:w-32 flex-shrink-0">Aufzeichnung</dt>
            <dd>{framework.recordingLabel}</dd>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
            <dt className="font-semibold text-[var(--primary-400)] sm:w-32 flex-shrink-0">Pilot-Klausel</dt>
            <dd>{framework.pilotClause}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export function WorkshopDemarcation() {
  const { demarcation } = workshopContent;
  return (
    <section id="abgrenzung" aria-label={demarcation.heading} className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--secondary-400)]">
          {demarcation.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-4">{demarcation.heading}</h2>
        <p className="text-[var(--foreground-muted)] text-base whitespace-pre-line">{demarcation.body}</p>
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
          <a href={legal.privacyHref} className="text-[var(--secondary-400)] underline hover:text-[var(--secondary-300)]">
            Datenschutzerklärung
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export function WorkshopForm({ bookable }: { bookable: boolean }) {
  const { form, consent } = workshopContent;
  if (!bookable) {
    return (
      <section id="anmeldung" aria-label="Anmeldung" className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[var(--foreground-muted)] text-lg">{form.notBookableLabel}</p>
        </div>
      </section>
    );
  }
  return (
    <section id="anmeldung" aria-label="Anmeldung" className="py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-6">Platz reservieren</h2>
        <p className="text-[var(--foreground-muted)] text-sm mb-6">
          {/* The form itself is built in ticket #7. For now this is a placeholder. */}
          [Formular folgt in Ticket #7]
        </p>
        <p className="text-[var(--foreground-muted)] text-xs whitespace-pre-line">{consent.newsletter}</p>
      </div>
    </section>
  );
}
