// src/components/workshop/content.ts

/** Privacy page href (existing legal route). */
export const PRIVACY_HREF = '/datenschutz';

/** Workshop slugs — the first and currently only workshop. */
export const KI_SOUVERAENITAET_SLUG = 'ki-souveraenitaet';

export interface AgendaBlock {
  /** Block number, 1-based. */
  n: number;
  name: string;
  time: string;
  content: string;
  result: string;
}

export const workshopContent = {
  hero: {
    eyebrow: 'KI-Coaching mit Kante',
    headline: 'KI-Souveränität im Mittelstand: Deine Rechnung, deine Roadmap',
    intro: `Wie abhängig ist Dein Unternehmen bei KI, und ist Dir das recht? Zu dieser Frage gibt es heute zwei Sorten Antworten: Bauchgefühl oder Anbieter-Folien. Beides ist keine Entscheidungsgrundlage.

In 90 Minuten machst Du aus der Glaubensfrage eine Rechnung. Live, online, mit Deinen Zahlen. Ich führe Dich Schritt für Schritt durch den Prozess, den ich für mein eigenes Setup durchgerechnet habe: erst Deine KI-Anwendungsfälle und Datenklassen, dann die Kosten der drei Wege (gehostete offene Modelle, Premium-Cloud, eigene Hardware), dann die Entscheidung entlang von vier Dimensionen: Daten, Zugriff, Kosten, Qualität.

Du gehst raus mit zwei Dingen, die es vorher in Deinem Unternehmen nicht gab: Deiner Souveränitäts-Rechnung und Deiner 90-Tage-Roadmap. Alle Vorlagen und das Rechen-Sheet bleiben bei Dir. Die restlichen Anwendungsfälle rechnest Du danach selbst durch, das Vorgehen ist identisch.`,
  },

  agenda: {
    eyebrow: 'Agenda',
    heading: '90 Minuten, geführte Arbeits-Session',
    blocks: [
      {
        n: 1,
        name: 'Lage',
        time: '0:00–0:15',
        content:
          'Problem framen: das Nadella-Paradox, der Fable-5-Fall, die eine Kernfrage („wer kann rechtlich zugreifen, egal wo das RZ steht?"), die drei Fragen aus Video #13; Ablauf + Werkzeuge zeigen.',
        result: 'Gemeinsames Raster',
      },
      {
        n: 2,
        name: 'Finden',
        time: '0:15–0:35',
        content:
          'Workload-Karte: ich zeige meine, Teilnehmer tragen ihre Top-3-Workloads ein + Daten-Ampel; den wichtigsten markieren.',
        result: 'Workload-Karte (Top 3)',
      },
      {
        n: 3,
        name: 'Messen',
        time: '0:35–1:05',
        content:
          'Rechen-Sheet: ich rechne meinen Fall vor, dann rechnet jeder seinen Kern-Workload durch (Volumina aus dem Pre-Work), Fragen jederzeit.',
        result: 'Die eigene Rechnung (Kern-Workload)',
      },
      {
        n: 4,
        name: 'Entscheiden',
        time: '1:05–1:25',
        content:
          'Entscheidungsbaum anwenden (bleibt beim US-Anbieter / EU-Host / lokal / erst messen) entlang der vier Dimensionen: Datenklasse (DSGVO) · territorialer Zugriff (US-Jurisdiktion, CLOUD Act) · Kosten · Qualität. 3 Maßnahmen mit Verantwortlichem notieren.',
        result: 'Die 90-Tage-Roadmap',
      },
      {
        n: 5,
        name: 'Abschluss',
        time: '1:25–1:30',
        content:
          'Wie du zu Hause die restlichen Workloads durchrechnest (gleiche Vorlagen); wer seine Rechnung individuell durchsprechen will: begleitete Umsetzung (ein Satz, kein Pitch-Block).',
        result: 'Verbindlichkeit',
      },
    ] as AgendaBlock[],
  },

  outcome: {
    eyebrow: 'Dein Ergebnis',
    heading: 'Zwei Artefakte, die es vorher nicht gab',
    intro: 'Jedes Unternehmen verlässt den Workshop mit zwei fertigen Ergebnissen:',
    artefacts: [
      'Deine Souveränitäts-Rechnung: Dein wichtigster KI-Anwendungsfall, durchgerechnet in Euro. Eine Seite, vorstandstauglich.',
      'Deine 90-Tage-Roadmap: drei konkrete Maßnahmen, mit Verantwortlichem und Messpunkt.',
    ],
  },

  framework: {
    eyebrow: 'Rahmen',
    heading: 'Termin, Preis, Plätze',
    /** Price label — the numeric value comes from the DB workshop entity. */
    priceLabel: '99 € netto pro Unternehmen, bis zu 2 Personen (Entscheider + IT-Verantwortlicher)',
    capacityLabel: 'nur 5 Unternehmen. Sind sie weg, kommst Du auf die Liste für die nächste Runde.',
    bookingLabel:
      'Ablauf nach Anmeldung: Du bekommst eine Rechnung von mir. Kein Zahlungsformular, keine Kreditkarte. Dein Platz ist fix, sobald die Rechnung bezahlt ist.',
    preWorkLabel:
      'Vorbereitung: Mit der Bestätigung bekommst Du ein kurzes Arbeitsblatt (30 Minuten). Ohne diese Vorbereitung kannst Du im Termin nicht mitrechnen, deshalb ist sie Pflicht.',
    recordingLabel: 'Kannst Du am Termin nicht live dabei sein? Zahlende Teilnehmer bekommen die Aufzeichnung.',
    pilotClause:
      'Die erste Runde findet ab 3 angemeldeten Unternehmen statt. Falls verschoben wird, behältst Du Deinen Platz, oder ich storniere die Rechnung, wenn der neue Termin nicht passt.',
  },

  demarcation: {
    eyebrow: 'Abgrenzung',
    heading: 'Damit Du weißt, was Du NICHT bekommst',
    body: `Keine Folienschlacht, keine Server- oder Cloud-Verkaufsveranstaltung, keine Einzelfall-Beratung. Ich führe durch den Prozess, gerechnet wird mit Deinen Zahlen. Ich habe eigene KI-Hardware im Büro UND bezahle Cloud-Anbieter, ich habe in dieser Frage nichts zu verkaufen außer der Rechnung selbst. Und ein ehrliches Ergebnis ist ausdrücklich möglich: „Cloud bleibt für uns richtig" ist ein valides Resultat.`,
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
