// src/components/coaching/content.ts

/** External Calendly link for the Erstgespräch CTA. Render with target/rel. */
export const BOOKING_URL = 'https://calendly.com/danielkreuzhofer/30min';
export const ENGPASS_HREF = '/engpass-check';
export const ABOUT_HREF = '/about';

export type Accent = 'primary' | 'secondary';

/** A heading + intro + bullet list block (Für-wen, Problem, Ergebnis). */
export interface ListSection {
  eyebrow: string;
  heading: string;
  intro: string;
  bullets: string[];
  accent: Accent;
}

export interface MethodPhase {
  name: string;
  weeks: string;
  points: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface LeadMagnet {
  title: string;
  description: string;
  href: string;
}

export const coachingContent = {
  hero: {
    eyebrow: 'KI-Coaching mit Kante',
    headline: 'Zeig, dass KI funktioniert — in 90 Tagen, ohne Chaos',
    tagline:
      'Done-With-You-Pilot für Bereichsleiter im Mittelstand mit KI-Mandat. Schnell, risikoarm, messbar — statt Theorie und Ideenparken.',
    primaryCta: 'Erstgespräch buchen',
    secondaryCta: 'Engpass-Check (3 Min)',
    secondaryHref: ENGPASS_HREF,
  },
  proof: {
    eyebrow: 'Warum ich',
    heading: 'Senior AI Solutions Architect bei AWS',
    points: [
      '20+ Jahre Enterprise- und Cloud-Architektur',
      'Täglich KI-Systeme für Unternehmen im Einsatz — kein Hype, gebaute Praxis',
      'Strategie statt Tool-Spielerei: Ergebnisse, die intern überzeugen',
    ],
    linkText: 'Mehr über mich',
    linkHref: ABOUT_HREF,
  },
  forWhom: {
    eyebrow: 'Für wen',
    heading: 'Bereichsleiter im Mittelstand mit KI-Mandat',
    intro:
      'Vertriebs-, Marketing-, Service- oder Operations-Leitung, die unter Druck steht, mit KI schnell echten Business-Impact zu liefern.',
    bullets: [
      'Sie suchen einen schnellen, risikoarmen Einstieg — keine Pilot-Friedhöfe',
      'Sie wollen strategische Führung statt Tool-Spielerei',
      'Sie dürfen Bereichsbudget bis 10k netto eigenständig zeichnen',
      'Nicht geeignet für Startups, Hobby-Teams oder Rollen ohne Linien-P&L und KI-Mandat',
    ],
    accent: 'secondary',
  } as ListSection,
  problem: {
    eyebrow: 'Das Problem',
    heading: 'KI-Druck von oben — aber wo anfangen?',
    intro:
      'Ihr Vertriebs-, Service- oder Operations-Prozess ist zu manuell, zu langsam oder zu fehleranfällig. KI könnte helfen — doch zwischen Tool-Flut und Shadow-AI fehlt der erste belastbare Schritt.',
    bullets: [
      'Manuelle Schritte und verpasste Chancen kosten täglich Zeit',
      'Viele Tools, wenig Klarheit, welcher Hebel wirklich zählt',
      'Der erste Pilot soll sitzen — nicht im Sand verlaufen',
    ],
    accent: 'primary',
  } as ListSection,
  method: {
    eyebrow: 'Die Methode',
    heading: 'Smart AI Wins System™',
    subline: 'Bremsen lösen. Pilot planen. Impact liefern.',
    phases: [
      {
        name: 'Kickoff & Analyse',
        weeks: 'Woche 1',
        points: [
          '90-min Strategiegespräch',
          'Prozess analysieren, Engpässe & manuelle Schritte identifizieren',
          '1–2 KI-Hebel mit hohem Potenzial auswählen',
        ],
      },
      {
        name: 'Pilot planen',
        weeks: 'Woche 2–3',
        points: [
          '2 × 60-min Co-Creation Sessions',
          'Schlanken KI-Piloten entwickeln: Ziele, Erfolgskriterien, internes Buy-in',
          'Ergebnis: präsentationsreife Pilotplanung',
        ],
      },
      {
        name: 'Umsetzung & Coaching',
        weeks: 'Woche 4–10',
        points: [
          '4 × 45-min Check-Ins',
          'Sie setzen um — ich begleite, optimiere, beseitige Blocker',
          'Asynchrone E-Mail-Unterstützung zwischen den Terminen',
        ],
      },
      {
        name: 'Impact Review',
        weeks: 'Woche 11–12',
        points: [
          '60-min Abschlusssession',
          'Erfolge messen & dokumentieren',
          'Review der Stakeholder-Präsentation, nächste Schritte klären',
        ],
      },
    ] as MethodPhase[],
  },
  result: {
    eyebrow: 'Das Ergebnis',
    heading: 'Ein echter Win — als Basis zum Skalieren',
    intro: 'Nach 90 Tagen haben Sie nicht mehr Theorie, sondern einen Beweis.',
    bullets: [
      'Ein konkreter, umgesetzter KI-Pilot',
      'Messbarer Impact im Prozess — mehr Effizienz, weniger Fehler',
      'Internes Vertrauen durch belegte Ergebnisse + eine skalierbare Methode',
    ],
    accent: 'secondary',
  } as ListSection,
  investment: {
    eyebrow: 'Investition',
    heading: '5.900 € netto',
    subline: 'Einmalig. Klarer Rahmen. Kein Overhead.',
    includes: [
      '1:1 Coaching-Sessions (alle 2 Wochen, 3 Monate)',
      'Asynchrone Unterstützung via E-Mail oder Loom',
      'Feedback zu internen Präsentationen und Pilotplänen',
      'Zugang zum Smart AI Wins System™ + Templates',
      'Klarer Fahrplan vom ersten Friction-Point bis zum messbaren Ergebnis',
    ],
    cta: 'Erstgespräch buchen',
  },
  faq: {
    eyebrow: 'FAQ',
    heading: 'Häufige Fragen',
    items: [
      {
        q: 'Ist das Coaching oder Umsetzung?',
        a: 'Done-With-You, nicht Done-For-You. Sie führen — ich unterstütze mit Struktur, Klarheit und Strategie.',
      },
      {
        q: 'Mit welchen Tools arbeiten wir?',
        a: 'Technologie-unabhängig. Ich helfe, passende Tools zu wählen, Shadow-AI-Risiken zu vermeiden und clever zwischen Build und Buy zu entscheiden.',
      },
      {
        q: 'Wie viel Zeit muss ich einplanen?',
        a: 'Etwa 1–2 Stunden pro Woche für Calls und Vorbereitung — mehr, wenn Sie selbst umsetzen. Die meisten Piloten lassen sich gut in den Alltag integrieren.',
      },
      {
        q: 'Was, wenn ich nicht technisch bin?',
        a: 'Kein Problem. Sie müssen nicht coden — Sie müssen führen. Ich übersetze Tech in Strategie und Entscheidungsgrundlagen.',
      },
    ] as FaqItem[],
  },
  leadMagnets: {
    eyebrow: 'Noch nicht bereit?',
    heading: 'Erste Schritte ohne Risiko',
    intro:
      'Verschaffen Sie sich in wenigen Minuten Klarheit — und bleiben Sie über den Newsletter zu konkreten KI-Hebeln auf dem Laufenden.',
    magnets: [
      {
        title: 'KI-Engpass-Check',
        description: 'In 3 Minuten zum größten Hebel in Ihrem Prozess.',
        href: '/engpass-check',
      },
      {
        title: 'KI-Führungs-Check',
        description: 'Wie souverän führen Sie Ihr Team durch die KI-Transformation?',
        href: '/ki-fuehrungs-check',
      },
      {
        title: 'DSGVO-Check',
        description: 'Welche KI-Tools Sie wie rechtssicher einsetzen können.',
        href: '/dsgvo-check',
      },
    ] as LeadMagnet[],
    /** Daniel füllt die YouTube-Kanal-URL; leer = Block wird nicht gerendert. */
    youtubeUrl: '',
    youtubeText: 'Neueste Videos auf YouTube',
  },
  finalCta: {
    heading: 'Startklar?',
    body:
      'Kurzes Erstgespräch zum Kennenlernen. Wenn es passt, erhalten Sie noch am selben Tag Ihren Kalenderlink.',
    cta: 'Erstgespräch buchen',
  },
} as const;
