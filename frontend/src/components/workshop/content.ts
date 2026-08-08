// src/components/workshop/content.ts

/** Privacy page href (existing legal route). */
export const PRIVACY_HREF = '/datenschutz';

/** Workshop slugs — the first and currently only workshop. */
export const KI_SOUVERAENITAET_SLUG = 'ki-souveraenitaet';

export interface AgendaBlock {
  /** Block number, 1-based. */
  n: number;
  name: string;
  /** Duration only, e.g. "15 Min". */
  time: string;
  /** Short fragment — not a sentence. */
  content: string;
  /** The artefact this block produces, or null if it produces no artefact. */
  result: string | null;
}

/**
 * Landingpage copy. Deliberately terse: the Content-Leitfaden norm is
 * 200–300 words ("Kurze Formeln statt Romane"). Workshop *teaching* content
 * (Nadella-Paradox, CLOUD Act details) belongs in the workshop, not here —
 * this page sells the decision to attend, not the subject matter. The two
 * exceptions are urgency and authority one-liners (Fable-5, DSK) that make
 * the case *to attend*, without teaching the substance.
 */
export const workshopContent = {
  hero: {
    eyebrow: 'KI-Coaching mit Kante',
    headline: 'KI-Souveränität im Mittelstand: Deine Rechnung, deine Roadmap',
    intro: `Wie abhängig ist Dein Unternehmen bei KI — und ist Dir das recht?

Darauf gibt es zwei Antworten: Bauchgefühl oder Anbieter-Folien. Beides trägt keine Entscheidung.

In 90 Minuten machst Du daraus eine Rechnung. Mit Deinen Zahlen.`,
    /** One-line urgency anchor — the Fable-5 case makes this a Vorstandsfrage, not theory. */
    urgency: 'Fable-5-Fall: Das beste Modell der Welt war drei Wochen vom Markt — per US-Exportkontrolle.',
  },

  /** The five facts a Geschäftsführer needs in five seconds. Termin is injected from the DB. */
  atAGlance: {
    heading: 'Auf einen Blick',
    duration: '90 Minuten · live online',
    price: '99 € netto pro Unternehmen, bis 2 Personen',
    capacity: '5 Plätze',
    preWork: 'Pre-Work: 30 Minuten, Pflicht',
    payment: 'Rechnung per Mail — keine Kreditkarte',
  },

  outcome: {
    eyebrow: 'Dein Ergebnis',
    heading: 'Zwei Artefakte, die es vorher nicht gab',
    artefacts: [
      {
        name: 'Souveränitäts-Rechnung',
        body: 'Dein wichtigster KI-Fall in Euro. Eine Seite, vorstandstauglich.',
      },
      {
        name: '90-Tage-Roadmap',
        body: 'Drei Maßnahmen, mit Verantwortlichem und Messpunkt.',
      },
    ],
  },

  agenda: {
    eyebrow: 'Ablauf',
    heading: '90 Minuten, geführte Arbeits-Session',
    blocks: [
      { n: 1, name: 'Lage', time: '15 Min', content: 'Die eine Kernfrage. Gemeinsames Raster.', result: null },
      { n: 2, name: 'Finden', time: '20 Min', content: 'Deine Top-3-Workloads, Daten-Ampel.', result: 'Workload-Karte' },
      { n: 3, name: 'Messen', time: '30 Min', content: 'Drei Wege in Euro.', result: 'Deine Rechnung' },
      { n: 4, name: 'Entscheiden', time: '20 Min', content: 'Bleibt / wechselt / wird gemessen.', result: 'Deine Roadmap' },
      { n: 5, name: 'Abschluss', time: '5 Min', content: 'Wie Du den Rest selbst rechnest.', result: null },
    ] as AgendaBlock[],
  },

  demarcation: {
    eyebrow: 'Abgrenzung',
    heading: 'Was Du NICHT bekommst',
    bullets: [
      'Keine Folienschlacht',
      'Kein Server- oder Cloud-Verkauf',
      'Keine Einzelfall-Beratung',
    ],
    kante:
      'Ich habe eigene KI-Hardware und bezahle Cloud-Anbieter. Ich verkaufe hier nichts außer der Rechnung. „Cloud bleibt für uns richtig" ist ein valides Ergebnis.',
  },

  /** External authority — the one argument Daniel does not make himself. */
  authority: {
    eyebrow: 'Beweis',
    heading: 'Die deutsche Aufsicht sagt es, nicht nur ich',
    body: 'EU-Rechenzentrum plus Vertragszusage ist keine Souveränität. Genau das rechnen wir aus.',
    source: 'DSK-Kriterien 2.6 / 2.4',
  },

  /** Details that did not fit the at-a-glance box. */
  framework: {
    eyebrow: 'Rahmen',
    heading: 'Das Kleingedruckte',
    items: [
      { label: 'Aufzeichnung', value: 'Zahlende Teilnehmer bekommen sie.' },
      { label: 'Ablauf', value: 'Rechnung per Mail. Platz ist fix nach Zahlung.' },
      { label: 'Pilot', value: 'Läuft ab 3 Firmen. Verschoben? Platz bleibt oder Rechnung storniert.' },
    ],
  },

  consent: {
    newsletter: `Mit der Angabe meiner E-Mail-Adresse willige ich ein, von Daniel Kreuzhofer regelmäßig Informationen, Tipps und Angebote rund um KI per E-Mail zu erhalten. Meine Daten werden nicht an Dritte weitergegeben. Eine Abmeldung ist jederzeit möglich.`,
  },

  legal: {
    stornoConditions:
      'Bei Verschiebung behältst Du Deinen Platz, oder ich storniere die Rechnung, wenn der neue Termin nicht passt.',
    privacyHref: PRIVACY_HREF,
  },

  form: {
    ctaLabel: 'Platz reservieren',
    notBookableLabel: 'Anmeldung aktuell nicht möglich — der Termin wird noch festgelegt.',
  },
} as const;
