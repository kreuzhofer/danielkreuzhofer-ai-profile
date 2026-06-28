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
    headline: 'In 90 Tagen zum KI-Pilot, der intern zählt',
    tagline:
      'Für Vertriebsleiter im Mittelstand mit KI-Mandat: ein strukturierter erster Pilot — begleitet, belastbar, ohne Pilot-Friedhof.',
    primaryCta: 'Erstgespräch buchen',
    secondaryCta: 'Engpass-Check (3 Min)',
    secondaryHref: ENGPASS_HREF,
  },
  proof: {
    eyebrow: 'Warum ich',
    heading: 'Ich sehe täglich, warum KI-Piloten liefern — oder scheitern',
    points: [
      '25+ Jahre Softwareentwicklung & Enterprise-Architektur',
      'Senior AI Solutions Architect bei AWS — KI in der Praxis, nicht in der Theorie',
      'Strategie statt Tool-Spielerei: Ergebnisse, die intern überzeugen',
    ],
    linkText: 'Mehr über mich',
    linkHref: ABOUT_HREF,
  },
  forWhom: {
    eyebrow: 'Für wen',
    heading: 'Für Vertriebsleiter im Mittelstand mit KI-Mandat',
    intro:
      'Und Marketing-, Service- oder Operations-Verantwortliche, die mit KI schnell ein belastbares Ergebnis liefern müssen — aktueller Schwerpunkt: Vertrieb.',
    bullets: [
      'Sie suchen einen schnellen, risikoarmen Einstieg — keine Pilot-Friedhöfe',
      'Sie wollen strategische Führung statt Tool-Spielerei',
      'Der Rahmen passt in Ihre Budget-Hoheit — kein Procurement, kein Eskalationsgespräch mit der Geschäftsführung',
      'Nicht geeignet für Startups, Hobby-Teams oder Rollen ohne Linien-Verantwortung und KI-Mandat',
    ],
    accent: 'secondary',
  } as ListSection,
  problem: {
    eyebrow: 'Das Problem',
    heading: 'KI-Druck von oben — aber wo anfangen?',
    intro:
      'Angebote noch von Hand, CRM-Einträge lückenhaft, Forecast auf Zuruf — und das KI-Mandat liegt trotzdem auf dem Tisch.',
    bullets: [
      'Manuelle Schritte und verpasste Chancen kosten Ihr Team täglich Zeit',
      'Viele Tools, wenig Klarheit — und nicht freigegebene KI-Nutzung im Team',
      'Wer jetzt auf Durchzug stellt, erklärt im Herbst, warum der Pilot noch aussteht',
    ],
    accent: 'primary',
  } as ListSection,
  method: {
    eyebrow: 'Die Methode',
    heading: 'Das 90-Tage-Pilot-System',
    subline: 'Bremsen lösen. Pilot planen. Ergebnis liefern.',
    phases: [
      {
        name: 'Kickoff & Analyse',
        weeks: 'Woche 1',
        points: [
          '90-min Strategiegespräch',
          'Vertriebsprozess analysieren: Engpässe & manuelle Schritte',
          '1–2 KI-Hebel mit hohem Potenzial auswählen',
        ],
      },
      {
        name: 'Pilot planen',
        weeks: 'Woche 2–3',
        points: [
          '2 × 60-min Planungssessions',
          'Schlanken Piloten entwickeln: Ziele, Erfolgskriterien, interne Zustimmung',
          'Ergebnis: präsentationsreife Pilotplanung',
        ],
      },
      {
        name: 'Umsetzung & Begleitung',
        weeks: 'Woche 4–10',
        points: [
          '4 × 45-min Abstimmungen',
          'Sie setzen um — ich begleite, optimiere, räume Blocker aus',
          'Unterstützung per E-Mail zwischen den Terminen',
        ],
      },
      {
        name: 'Ergebnis-Check',
        weeks: 'Woche 11–12',
        points: [
          '60-min Abschlusssession',
          'Ergebnisse messen & dokumentieren',
          'Review der Führungspräsentation, nächste Schritte klären',
        ],
      },
    ] as MethodPhase[],
  },
  result: {
    eyebrow: 'Das Ergebnis',
    heading: 'Beweis statt Theorie — in 90 Tagen',
    intro: 'Nach 90 Tagen haben Sie kein Konzept, sondern einen Beweis.',
    bullets: [
      'Ein konkreter, umgesetzter KI-Pilot',
      'Messbarer Effekt im Vertriebsprozess — mehr Tempo, weniger Fehler',
      'Eine Referenz, mit der Sie intern für den nächsten Schritt argumentieren — belegt, nicht versprochen',
    ],
    accent: 'secondary',
  } as ListSection,
  investment: {
    eyebrow: 'Investition',
    heading: '5.900 € netto',
    subline: 'Einmalig. Klarer Rahmen. Kein Overhead.',
    includes: [
      '1:1 Coaching-Sessions (alle 2 Wochen, 3 Monate)',
      'Begleitung per E-Mail zwischen den Terminen',
      'Feedback zu internen Präsentationen und Pilotplänen',
      'Zugang zum 90-Tage-Pilot-System + Vorlagen',
      'Klarer Fahrplan vom ersten Engpass bis zum messbaren Ergebnis',
      'Im Rahmen Ihrer Budget-Hoheit — kein Procurement, kein Eskalationsgespräch',
    ],
    cta: 'Erstgespräch buchen',
  },
  faq: {
    eyebrow: 'FAQ',
    heading: 'Häufige Fragen',
    items: [
      {
        q: 'Mein Kalender ist voll — wie viel Zeit brauche ich wirklich?',
        a: 'Etwa 1–2 Stunden pro Woche für unsere Calls. Den Rest führen Sie mit Ihrem Team; ich gebe Struktur und kläre Blocker dazwischen. Die meisten Piloten laufen gut neben dem Tagesgeschäft.',
      },
      {
        q: 'Ist das Coaching oder Umsetzung?',
        a: 'Gemeinsam, nicht für Sie. Sie führen — ich unterstütze mit Struktur, Klarheit und Strategie.',
      },
      {
        q: 'Mit welchen Tools arbeiten wir?',
        a: 'Technologie-unabhängig. Ich helfe, passende Tools zu wählen, nicht freigegebene KI-Nutzung im Team zu vermeiden und klug zwischen Eigenlösung und Standardsoftware zu entscheiden.',
      },
      {
        q: 'Was, wenn ich nicht technisch bin?',
        a: 'Kein Problem. Sie müssen nicht programmieren — Sie müssen führen. Ich übersetze Technik in Strategie und Entscheidungsgrundlagen.',
      },
    ] as FaqItem[],
  },
  leadMagnets: {
    eyebrow: 'Noch nicht bereit?',
    heading: 'Erste Schritte ohne Risiko',
    intro:
      'Verschaffen Sie sich in wenigen Minuten Klarheit — und bleiben Sie über den Newsletter zu konkreten KI-Hebeln im Vertrieb auf dem Laufenden.',
    magnets: [
      {
        title: 'KI-Engpass-Check',
        description: 'In 3 Minuten: Welcher Schritt in Ihrem Vertriebsprozess kostet am meisten?',
        href: '/engpass-check',
      },
      {
        title: 'KI-Führungs-Check',
        description: 'Wie souverän führen Sie Ihr Team beim KI-Einsatz?',
        href: '/ki-fuehrungs-check',
      },
      {
        title: 'DSGVO-Check',
        description: 'Darf Ihr Team Kundendaten in KI-Tools eingeben? Klare Antwort in wenigen Fragen.',
        href: '/dsgvo-check',
      },
    ] as LeadMagnet[],
    /** YouTube-Kanal (https erzwungen — externer Link). Leer = Block wird nicht gerendert. */
    youtubeUrl: 'https://www.youtube.com/@DanielKreuzhofer',
    youtubeText: 'Neueste Videos auf YouTube',
  },
  finalCta: {
    heading: 'Ihr nächster Schritt',
    body:
      'Kurzes Erstgespräch, unverbindlich — kein Verkaufsgespräch. Wenn es für beide Seiten passt, planen wir den Start.',
    cta: 'Erstgespräch buchen',
  },
} as const;
