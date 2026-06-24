import type { ScorecardDefinition } from "@/lib/scorecard/types";

export const definition: ScorecardDefinition = {
  slug: "dsgvo-check",
  // Engine scoring/outcome are unused (recommend() overrides via the resolve hook);
  // a trivial valid outcome satisfies the type.
  scoring: { maxPoints: 0, direction: "higher-better" },
  outcome: { type: "bands", bands: [{ key: "rot", min: 0, max: 33 }, { key: "gelb", min: 34, max: 66 }, { key: "gruen", min: 67, max: 100 }] },
  qualification: { requireQualifies: ["C1"] },
  attributePrefix: "dsgvo_",
  questions: [
    { id: "C1", kind: "context", attributeKey: "dsgvo_rolle", prompt: "Was beschreibt Deine Rolle am besten?", options: [
      { id: "gf", label: "Geschäftsführer / Inhaber", qualifies: true },
      { id: "it", label: "IT-Leitung", qualifies: true },
      { id: "datenschutz", label: "Datenschutz / Legal", qualifies: true },
      { id: "bereichsleitung", label: "Bereichsleitung", qualifies: true },
      { id: "team", label: "Team-Mitglied ohne Führungsverantwortung" },
      { id: "berater", label: "Berater / Sonstiges" },
    ] },
    { id: "C2", kind: "context", attributeKey: "dsgvo_groesse", prompt: "Wie viele Mitarbeitende hat euer Unternehmen?", options: [
      { id: "u10", label: "unter 10" }, { id: "10-49", label: "10–49" }, { id: "50-250", label: "50–250" },
      { id: "250-1000", label: "250–1.000" }, { id: "ue1000", label: "über 1.000" },
    ] },
    { id: "Q_TOOLS", kind: "multi", attributeKey: "dsgvo_tools", prompt: "Welche KI-Tools nutzt oder plant ihr?", options: [
      { id: "chatgpt", label: "ChatGPT" }, { id: "copilot", label: "Microsoft Copilot" }, { id: "claude", label: "Claude" },
      { id: "gemini", label: "Google Gemini" }, { id: "mistral", label: "Mistral / Le Chat" }, { id: "alephalpha", label: "Aleph Alpha / PhariaAI" },
      { id: "local", label: "Lokale Modelle (Ollama o.ä.)" }, { id: "deepseek", label: "DeepSeek" },
      { id: "andere", label: "Andere" }, { id: "keine", label: "Noch keine" },
    ] },
    { id: "Q_TIER", kind: "context", attributeKey: "dsgvo_tier", prompt: "In welcher Form nutzt ihr diese Tools überwiegend?", options: [
      { id: "free", label: "Free / privater Account" }, { id: "business", label: "Bezahlte Business-/Enterprise-Pläne" },
      { id: "cloud", label: "Über Cloud (Azure / AWS Bedrock / Google)" }, { id: "gemischt", label: "Gemischt / weiß nicht" },
    ] },
    { id: "Q_DATA", kind: "context", attributeKey: "dsgvo_daten", prompt: "Welche Daten gebt ihr in die KI ein?", options: [
      { id: "keine", label: "Keine personenbezogenen Daten" }, { id: "intern", label: "Interne Daten, aber keine personenbezogenen" },
      { id: "personenbezogen", label: "Personenbezogene Daten von Kunden/Mitarbeitenden" }, { id: "besondere", label: "Besondere Kategorien (Gesundheit u.ä., Art. 9)" },
    ] },
    { id: "Q_USECASE", kind: "multi", attributeKey: "dsgvo_usecase", prompt: "Wofür setzt ihr KI ein?", options: [
      { id: "produktivitaet", label: "Produktivität (Texte, E-Mails, Recherche)" }, { id: "analyse", label: "Dokumenten-/Datenanalyse" },
      { id: "bot", label: "Kundenservice-Chatbot" }, { id: "hr", label: "HR / Bewerberauswahl / Scoring" },
      { id: "entscheidungen", label: "Automatisierte Entscheidungen über Personen" },
    ] },
    { id: "Q_SHADOW", kind: "context", attributeKey: "dsgvo_shadow", prompt: "Habt ihr einen Überblick, welche KI-Tools eure Mitarbeitenden tatsächlich nutzen?", options: [
      { id: "ja", label: "Ja, klare Richtlinie + Überblick" }, { id: "teilweise", label: "Teilweise" },
      { id: "nein", label: "Nein, vermutlich nutzen einzelne privat KI" }, { id: "keine-ahnung", label: "Keine Ahnung" },
    ] },
    { id: "Q_COMPLIANCE", kind: "multi", attributeKey: "dsgvo_compliance", prompt: "Was habt ihr schon umgesetzt?", options: [
      { id: "avv", label: "AVV/DPA mit den Anbietern" }, { id: "literacy", label: "AI-Literacy-Schulung" }, { id: "richtlinie", label: "KI-Nutzungsrichtlinie" },
      { id: "euregion", label: "EU-Region / Training-Opt-out" }, { id: "dsfa", label: "DSFA wo nötig" }, { id: "nichts", label: "Nichts davon" },
    ] },
  ],
};
