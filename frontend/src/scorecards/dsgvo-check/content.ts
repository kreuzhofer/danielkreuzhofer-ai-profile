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

/** A section within a gated report template (heading + bullet points). */
export interface DsgvoTemplateSection {
  heading: string;
  items: string[];
}

/** A full, adaptable template rendered inline in the gated report. */
export interface DsgvoTemplate {
  icon: string;
  title: string;
  intro: string;
  sections: DsgvoTemplateSection[];
}

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
  rewardHeading: "Deine Vorlagen",
  rewardNote:
    "Anpassbare Muster — ersetze die Platzhalter in [eckigen Klammern]. Diese Vorlagen ersetzen keine Rechtsberatung; lass sie vor dem produktiven Einsatz rechtlich prüfen.",
  templates: [
    {
      icon: "📄",
      title: "Muster: KI-Nutzungsrichtlinie",
      intro:
        "Interne Richtlinie für den Einsatz von KI-Tools bei [Unternehmen]. Gültig ab [Datum], mindestens jährlich überprüfen.",
      sections: [
        {
          heading: "1. Zweck & Geltungsbereich",
          items: [
            "Diese Richtlinie regelt den Einsatz von KI-Tools durch alle Mitarbeitenden, Auszubildenden und externen Dienstleister von [Unternehmen].",
            "Ziel: produktiver, rechtssicherer und verantwortungsvoller KI-Einsatz im Einklang mit DSGVO und EU AI Act.",
          ],
        },
        {
          heading: "2. Erlaubte Tools",
          items: [
            "Freigegeben sind ausschließlich die von [IT/Datenschutz] genehmigten Tools. Aktuell freigegeben: [z. B. ChatGPT Enterprise, Claude via AWS Bedrock].",
            "Die Nutzung privater KI-Accounts für dienstliche Aufgaben ist untersagt.",
            "Neue Tools werden vor dem Einsatz von [Verantwortliche:r] geprüft und freigegeben.",
          ],
        },
        {
          heading: "3. Welche Daten dürfen eingegeben werden",
          items: [
            "Erlaubt: allgemeine, nicht personenbezogene Informationen, öffentlich verfügbare Inhalte, anonymisierte Daten.",
            "Ohne ausdrückliche Freigabe verboten: personenbezogene Daten (Kund:innen, Mitarbeitende), Geschäftsgeheimnisse, Zugangsdaten, besondere Kategorien (Art. 9 DSGVO, z. B. Gesundheitsdaten).",
            "Im Zweifel gilt: nichts eingeben und [Datenschutz] fragen.",
          ],
        },
        {
          heading: "4. Verantwortung & Kontrolle",
          items: [
            "KI-Ergebnisse sind Vorschläge, keine Entscheidungen. Jede:r prüft Ergebnisse vor der Verwendung auf Richtigkeit — der Mensch bleibt verantwortlich.",
            "Wo Kund:innen mit KI interagieren, ist das transparent zu machen (Art. 50 EU AI Act).",
            "Verantwortlich für diese Richtlinie: [Name/Rolle], erreichbar unter [E-Mail].",
          ],
        },
        {
          heading: "5. Schulung & Verstöße",
          items: [
            "Alle KI-Nutzenden absolvieren die AI-Literacy-Schulung (Art. 4 EU AI Act, Pflicht seit 02/2025).",
            "Verstöße sind [Vorgesetzte/Datenschutz] zu melden und können arbeitsrechtliche Folgen haben.",
          ],
        },
      ],
    },
    {
      icon: "✅",
      title: "AVV-Checkliste (Auftragsverarbeitung, Art. 28 DSGVO)",
      intro:
        "Prüfe für jeden KI-Anbieter, ob der Auftragsverarbeitungsvertrag (AVV/DPA) diese Punkte abdeckt.",
      sections: [
        {
          heading: "Pflichtinhalte nach Art. 28 Abs. 3",
          items: [
            "Gegenstand, Dauer, Art und Zweck der Verarbeitung sind benannt.",
            "Kategorien betroffener Personen und Datenarten sind beschrieben.",
            "Verarbeitung erfolgt nur auf dokumentierte Weisung von [Unternehmen].",
            "Vertraulichkeitsverpflichtung der eingesetzten Personen ist geregelt.",
            "Technische und organisatorische Maßnahmen (TOMs, Art. 32) sind vereinbart.",
            "Subunternehmer (Sub-Prozessoren): Genehmigung/Information und Weitergabe der Pflichten geregelt.",
            "Unterstützung bei Betroffenenrechten (Auskunft, Löschung, Berichtigung) zugesichert.",
            "Unterstützung bei Datenpannen-Meldungen und Datenschutz-Folgenabschätzung.",
            "Löschung oder Rückgabe der Daten nach Vertragsende ist geregelt.",
            "Nachweis- und Auditrechte von [Unternehmen] sind vereinbart.",
          ],
        },
        {
          heading: "Bei US-/Nicht-EU-Anbietern zusätzlich",
          items: [
            "Standardvertragsklauseln (SCCs) als Fallback vereinbart — nicht allein das DPF.",
            "Transfer Impact Assessment (TIA) ist dokumentiert.",
            "EU-Region / Datenresidenz aktiviert, wo verfügbar.",
          ],
        },
        {
          heading: "Praxis",
          items: [
            "Der AVV ist aktiv unterzeichnet (nicht nur „verfügbar“) und liegt dokumentiert vor.",
            "Eine Liste aller KI-Anbieter mit AVV-Status wird gepflegt.",
          ],
        },
      ],
    },
    {
      icon: "🎓",
      title: "AI-Literacy-Schulungsplan (Art. 4 EU AI Act)",
      intro:
        "Kompakter Plan, um die Schulungspflicht nachweisbar zu erfüllen. Umfang an Rolle und Datenrisiko anpassen.",
      sections: [
        {
          heading: "Zielgruppen",
          items: [
            "Alle Mitarbeitenden, die KI nutzen → Basismodul (~60–90 Min., Pflicht).",
            "Führungskräfte/Entscheider:innen → Zusatzmodul Verantwortung & Governance.",
            "Rollen mit personenbezogenen/Hochrisiko-Daten → Vertiefung Datenschutz.",
          ],
        },
        {
          heading: "Basismodul (alle)",
          items: [
            "Was KI kann und was nicht — Stärken, Halluzinationen, Grenzen.",
            "Freigegebene Tools und erlaubte Daten (Bezug zur KI-Nutzungsrichtlinie).",
            "Personenbezogene und vertrauliche Daten erkennen und schützen.",
            "Ergebnisse kritisch prüfen — der Mensch bleibt verantwortlich.",
            "DSGVO- und EU-AI-Act-Basics (Rechtsgrundlage, Transparenzpflicht).",
          ],
        },
        {
          heading: "Vertiefung (rollenabhängig)",
          items: [
            "Datenschutz im KI-Einsatz, DSFA, Auftragsverarbeitung.",
            "Hochrisiko-Anwendungen (z. B. HR-/Bewerber-Scoring) und ihre Pflichten.",
          ],
        },
        {
          heading: "Nachweis & Wiederholung",
          items: [
            "Teilnahme dokumentieren (Datum, Teilnehmende, Inhalte) — als Nachweis nach Art. 4.",
            "Kurze Verständnis-Bestätigung am Ende (Quiz/Unterschrift).",
            "Auffrischung mindestens jährlich und bei wesentlichen Rechtsänderungen.",
          ],
        },
      ],
    },
  ] as DsgvoTemplate[],
};
