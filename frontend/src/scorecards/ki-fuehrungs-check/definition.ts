/**
 * KI-Führungs-Check — engine definition (scoring config).
 * Transcribed from vault `funnels/ki-fuehrungs-check/06-quiz-spec.md` (A–C freigegeben).
 * Higher score = more KI-leadership. Σ S1–S4 (max 12) → bands = Führungs-Typ.
 */

import type { ScorecardDefinition } from "@/lib/scorecard/types";

export const definition: ScorecardDefinition = {
  slug: "ki-fuehrungs-check",
  scoring: { maxPoints: 12, direction: "higher-better" },
  outcome: {
    type: "bands",
    bands: [
      { key: "einkaeufer", min: 0, max: 25 },
      { key: "verwalter", min: 26, max: 50 },
      { key: "mitmacher", min: 51, max: 75 },
      { key: "vorbild", min: 76, max: 100 },
    ],
  },
  // Weakest of the four leadership dimensions = the concrete next lever.
  nextLever: { over: "category", pick: "min" },
  qualification: { requireQualifies: ["K1", "K2"] },
  attributePrefix: "kfc_",
  questions: [
    // ── Block 1 — Kontext (keine Punkte) ────────────────────────────────────
    {
      id: "K1",
      kind: "context",
      attributeKey: "kfc_rolle",
      prompt: "Was beschreibt Deine Rolle am besten?",
      options: [
        { id: "vertriebsleiter", label: "Vertriebsleiter / Head of Sales", qualifies: true },
        { id: "gf", label: "Geschäftsführer / Inhaber", qualifies: true },
        { id: "bereichsleitung", label: "Bereichsleitung (Marketing, Service, Operations)", qualifies: true },
        { id: "it-leitung", label: "IT-Leitung" },
        { id: "team", label: "Team-Mitglied ohne Führungsverantwortung" },
        { id: "sonstiges", label: "Sonstiges" },
      ],
    },
    {
      id: "K2",
      kind: "context",
      attributeKey: "kfc_groesse",
      prompt: "Wie viele Mitarbeitende hat euer Unternehmen?",
      options: [
        { id: "u50", label: "unter 50" },
        { id: "50-250", label: "50–250", qualifies: true },
        { id: "250-1000", label: "250–1.000", qualifies: true },
        { id: "1000-2000", label: "1.000–2.000", qualifies: true },
        { id: "ue2000", label: "über 2.000" },
      ],
    },

    // ── Block 2 — Diagnose (Score-Fragen, je 0–3, höher = mehr Führung) ──────
    {
      id: "S1",
      kind: "score",
      category: "eigennutzung",
      prompt: "Wie oft nutzt Du KI selbst für Deine eigene Arbeit?",
      options: [
        { id: "taeglich", label: "Täglich, fester Teil meines Tages", points: 3 },
        { id: "woechentlich", label: "Mehrmals pro Woche", points: 2 },
        { id: "selten", label: "Selten, mal ausprobiert", points: 1 },
        { id: "nie", label: "Nie", points: 0 },
      ],
    },
    {
      id: "S2",
      kind: "score",
      category: "sichtbarkeit",
      prompt: "Weiß Dein Team, dass und wie Du KI nutzt?",
      options: [
        { id: "aktiv", label: "Ja, ich kommuniziere es aktiv mit Beispielen", points: 3 },
        { id: "einzelne", label: "Einzelne wissen es", points: 2 },
        { id: "eher-nicht", label: "Eher nicht", points: 1 },
        { id: "nein", label: "Nein, ich mache es nicht sichtbar", points: 0 },
      ],
    },
    {
      id: "S3",
      kind: "score",
      category: "bounds",
      prompt:
        "Könntest Du beurteilen, ob ein KI-Ergebnis Deines Teams wirklich gut ist oder nur plausibel klingt?",
      options: [
        { id: "sicher", label: "Ja, sicher", points: 3 },
        { id: "meistens", label: "Meistens", points: 2 },
        { id: "unsicher", label: "Eher unsicher", points: 1 },
        { id: "nein", label: "Nein", points: 0 },
      ],
    },
    {
      id: "S4",
      kind: "score",
      category: "fuehrung",
      prompt: "Wie läuft KI bei euch gerade?",
      options: [
        { id: "chefsache", label: "Ich treibe es als Chefsache und nutze selbst", points: 3 },
        { id: "ohne-system", label: "Ich nutze selbst, aber ohne System", points: 2 },
        { id: "it-thema", label: "Es ist ein IT-/Tool-Thema", points: 1 },
        { id: "delegiert", label: "Eingekauft und ans Team delegiert", points: 0 },
        {
          id: "schatten",
          label: "Noch nichts Offizielles, einzelne nutzen wohl privat KI, ich hab keinen Überblick",
          points: 0,
        },
      ],
    },

    // ── Block 3 — Kontext (Personalisierung) ────────────────────────────────
    {
      id: "K3",
      kind: "context",
      attributeKey: "kfc_bremse",
      prompt: "Was hält Dich am meisten davon ab, selbst mehr mit KI zu arbeiten?",
      options: [
        { id: "keine-zeit", label: "Keine Zeit" },
        { id: "wo-anfangen", label: "Weiß nicht, wo anfangen" },
        { id: "datenschutz", label: "Datenschutz-Unsicherheit" },
        { id: "skeptisch", label: "Skeptisch, ob es echten Nutzen bringt" },
      ],
    },
  ],
};
