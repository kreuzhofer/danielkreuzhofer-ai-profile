/**
 * DSGVO-Check — renderer content. Quiz shell uses intro/optin/video/resultHeading/
 * outcomeLabel. The report is fully custom (DsgvoResultView / DsgvoReportDoc) and
 * uses nothing from byOutcome; dsgvoCopy below carries all DSGVO-specific copy.
 */

import type { ScorecardContent } from "@/lib/scorecard/content";

export const content: ScorecardContent = {
  intro: {
    eyebrow: "DSGVO-Check",
    heading: "Darfst Du Deine KI-Tools rechtssicher nutzen?",
    lead: "8 Fragen, 3 Minuten: Du bekommst für jedes Tool eine klare Ampel — und einen konkreten Plan, was Du tun musst.",
    startLabel: "Check starten",
    meta: "Kostenlos · Stand der Recherche Juni 2026 · keine Rechtsberatung",
  },
  resultHeading: "Dein DSGVO-Status",
  outcomeLabel: { rot: "Ampel: Rot", gelb: "Ampel: Gelb", gruen: "Ampel: Grün" },
  byOutcome: {},
  sources: [],
  optin: {
    heading: "Hol Dir den vollständigen Maßnahmenplan",
    body: "Mit den direkten AVV/DPA-Links, Schritt-für-Schritt-Upgrades und Vorlagen (KI-Nutzungsrichtlinie, AVV-Checkliste, AI-Literacy-Plan) als dauerhaft abrufbaren Report.",
    button: "Report anfordern",
    consent: "Mit der Anmeldung willige ich ein, Infos und Tipps rund um KI per E-Mail zu erhalten. Abmeldung jederzeit.",
    datenschutzHref: "/datenschutz",
    datenschutzHinweis: "Deine Antworten bleiben bis zur Anmeldung in Deinem Browser. Verarbeitung über Hostinger (Frankfurt) und IONOS (DE); Newsletter über CleverReach (DE).",
    successHeading: "Fast geschafft — bitte E-Mail bestätigen",
    successBody: "Wir haben Dir einen Bestätigungslink geschickt. Ein Klick, dann ist Dein Report da.",
    errorBody: "Das hat nicht geklappt. Bitte prüfe die E-Mail-Adresse und versuch es erneut.",
    emailLabel: "Deine E-Mail-Adresse",
    emailPlaceholder: "name@firma.de",
  },
  video: {
    intro: "Mehr dazu im Video:",
    title: "Sind ChatGPT, Claude & Co DSGVO-konform?",
    label: "Video #01",
    url: "https://www.youtube.com/@DanielKreuzhofer",
  },
};

/** DSGVO-specific copy used only by DsgvoResultView / DsgvoReportDoc. */
export const dsgvoCopy = {
  ampelLabel: { rot: "Rot", gelb: "Gelb", gruen: "Grün" } as Record<string, string>,
  ampelHeadline: {
    rot: "Akuter Handlungsbedarf",
    gelb: "Auf dem Weg — aber mit Lücken",
    gruen: "Souverän aufgestellt",
  } as Record<string, string>,
  verdictLabel: { gruen: "Konform nutzbar", gelb: "Mit Auflagen", rot: "So nicht im Unternehmen" } as Record<string, string>,
  riskLabel: { minimal: "Minimales Risiko", begrenzt: "Begrenztes Risiko", hoch: "Hochrisiko" } as Record<string, string>,
  disclaimer:
    "Dieser Check ersetzt keine Rechtsberatung. Er gibt eine fundierte Ersteinordnung auf Basis öffentlich zugänglicher Quellen (Stand der Recherche Juni 2026).",
  updateNote:
    "Die Rechtslage ändert sich laufend. Wir aktualisieren diesen Check regelmäßig und informieren über wesentliche Neuerungen in unserem Newsletter.",
  rewardHeading: "Deine Vorlagen (im Report enthalten)",
  rewardItems: [
    {
      title: "Muster KI-Nutzungsrichtlinie",
      body: "Vorlage: welche Tools erlaubt sind, welche Daten rein dürfen, wer verantwortlich ist.",
    },
    {
      title: "AVV-Checkliste",
      body: "Was ein Auftragsverarbeitungsvertrag mit einem KI-Anbieter abdecken muss.",
    },
    {
      title: "AI-Literacy-Schulungsplan",
      body: "Kompakter Plan, um die Schulungspflicht (Art. 4) nachweisbar zu erfüllen.",
    },
  ],
};
