/**
 * Engpass-Check — the 11 questions.
 *
 * Verbatim from `funnels/engpass-check/06-quiz-spec.md`. Order is the flow order:
 * Block 1 (Kontext K1–K3) → Block 2 (Diagnose S1–S6) → Block 3 (Lösungs-Kontext K4–K5).
 */

import type { Question } from "./types";

export const QUESTIONS: readonly Question[] = [
  // ── Block 1 — Kontext (Qualifikations-Daten, keine Score-Punkte) ──────────
  {
    id: "K1",
    block: 1,
    kind: "context",
    attribute: "ec_rolle",
    prompt: "Was beschreibt Deine Rolle am besten?",
    options: [
      { id: "vertriebsleiter", label: "Vertriebsleiter / Head of Sales", qualifies: true },
      { id: "gf", label: "Geschäftsführer / Inhaber", qualifies: true },
      { id: "bereichsleitung", label: "Bereichsleitung — Marketing, Service oder Operations", qualifies: true },
      { id: "it-leitung", label: "IT-Leitung" },
      { id: "team", label: "Team-Mitglied ohne Führungsverantwortung" },
      { id: "sonstiges", label: "Sonstiges" },
    ],
  },
  {
    id: "K2",
    block: 1,
    kind: "context",
    attribute: "ec_groesse",
    prompt: "Wie viele Mitarbeitende hat euer Unternehmen?",
    options: [
      { id: "u50", label: "unter 50" },
      { id: "50-250", label: "50–250", qualifies: true },
      { id: "250-1000", label: "250–1.000", qualifies: true },
      { id: "1000-2000", label: "1.000–2.000", qualifies: true },
      { id: "ue2000", label: "über 2.000" },
    ],
  },
  {
    id: "K3",
    block: 1,
    kind: "context",
    attribute: "ec_mandat",
    prompt: 'Gibt es bei euch ein KI-Mandat von oben — "Wir müssen was mit KI machen"?',
    options: [
      { id: "ja-budget", label: "Ja, mit Budget", qualifies: true },
      { id: "ja-ohne-budget", label: "Ja, aber ohne Budget", qualifies: true },
      { id: "treibe-selbst", label: "Nein — ich treibe das selbst", qualifies: true },
      { id: "brach", label: "Nein, das Thema liegt brach" },
    ],
  },

  // ── Block 2 — Diagnose (Score-Fragen, je 0–3 Punkte) ──────────────────────
  {
    id: "S1",
    block: 2,
    kind: "score",
    // Kalibrierung (Spec 2026-06-13): Punkte bewusst sanfter (max. 2 statt 3) —
    // "eine Woche" ist im Maschinen-/Anlagenbau oft Normalzustand, kein Engpass.
    prompt: "Wie lange dauert bei euch ein Standardangebot — von Anfrage bis Versand?",
    options: [
      { id: "lt-1d", label: "Unter einem Tag", points: 0 },
      { id: "1-3d", label: "1–3 Tage", points: 0 },
      { id: "woche", label: "Etwa eine Woche", points: 1 },
      { id: "2w-plus", label: "Zwei Wochen oder länger", points: 2 },
      { id: "unbekannt", label: "Weiß ich ehrlich gesagt nicht", points: 2, messBlindflugBonus: 1 },
    ],
  },
  {
    id: "S2",
    block: 2,
    kind: "score",
    dimension: "uebergabe-stau",
    prompt:
      "Wie oft hängt ein Angebot, weil eine andere Abteilung erst prüfen oder freigeben muss — Konstruktion, Technik, Preisfreigabe?",
    options: [
      { id: "selten", label: "Selten", points: 0 },
      { id: "gelegentlich", label: "Gelegentlich", points: 1 },
      { id: "meiste", label: "Bei den meisten", points: 2 },
      { id: "alle", label: "Bei praktisch allen", points: 3 },
    ],
  },
  {
    id: "S3",
    block: 2,
    kind: "score",
    dimension: "schnittstellen-luecke",
    prompt: "Wie viel läuft zwischen euren Systemen von Hand — Copy-Paste, Excel-Export, neu eintippen?",
    options: [
      { id: "kaum", label: "Kaum etwas", points: 0 },
      { id: "einzelne", label: "Einzelne Schritte", points: 1 },
      { id: "viele", label: "Viele Schritte", points: 2 },
      { id: "fast-alles", label: "Fast alles", points: 3 },
    ],
  },
  {
    id: "S4",
    block: 2,
    kind: "score",
    dimension: "wissens-monopol",
    prompt:
      "Wenn morgen euer erfahrenster Vertriebler ausfällt: Wie viel von seinem Wissen steht irgendwo geschrieben?",
    options: [
      { id: "alles", label: "Praktisch alles", points: 0 },
      { id: "meiste", label: "Das meiste", points: 1 },
      { id: "wenig", label: "Wenig", points: 2 },
      { id: "nichts", label: "Nichts — das Wissen ist in Köpfen", points: 3 },
    ],
  },
  {
    id: "S5",
    block: 2,
    kind: "score",
    dimension: "mess-blindflug",
    prompt: "Messt ihr heute Durchlaufzeit, Win-Rate oder Umsatz pro Funnel-Stufe?",
    options: [
      { id: "alle-drei", label: "Alle drei, regelmäßig", points: 0 },
      { id: "teilweise", label: "Teilweise", points: 1 },
      { id: "kaum", label: "Kaum", points: 2 },
      { id: "nein", label: "Nein — oder ich weiß es nicht", points: 3 },
    ],
  },
  {
    id: "S6",
    block: 2,
    // Kalibrierung (#5, 2026-06-18): S6 misst KI-Reife, keinen Prozess-Engpass.
    // „Noch nicht gestartet" ist keine Reibung → 0 Punkte; nur ein gescheitertes
    // bzw. steckengebliebenes Projekt zählt als Engpass-Signal.
    kind: "score",
    prompt: "Habt ihr schon mal ein KI- oder Automatisierungs-Projekt gestartet?",
    options: [
      { id: "produktiv", label: "Ja — läuft produktiv, mit messbarem Effekt", points: 0 },
      { id: "noch-nicht", label: "Nein, noch nicht", points: 0 },
      { id: "eingestellt", label: "Ja — wieder eingestellt", points: 2 },
      { id: "poc", label: "Ja — im Proof of Concept hängengeblieben", points: 3 },
    ],
  },

  // ── Block 3 — Lösungs-Kontext (keine Score-Punkte) ────────────────────────
  {
    id: "K4",
    block: 3,
    kind: "context",
    prompt: "Was macht eure IT?",
    options: [
      { id: "baut-regelmaessig", label: "Baut regelmäßig eigene Software", cFaehig: true },
      { id: "baut-gelegentlich", label: "Baut gelegentlich etwas" },
      { id: "infrastruktur", label: "Reine Infrastruktur — Server, Netzwerk, Lizenzen" },
      { id: "keine-it", label: "Wir haben keine eigene IT" },
    ],
  },
  {
    id: "K5",
    block: 3,
    kind: "context",
    attribute: "ec_zeit",
    prompt: "Bis wann soll euer KI-Thema sichtbare Ergebnisse zeigen?",
    options: [
      { id: "quartal", label: "Dieses Quartal", qualifies: true },
      { id: "halbjahr", label: "Dieses Halbjahr", qualifies: true },
      { id: "jahr", label: "Dieses Jahr" },
      { id: "kein-druck", label: "Kein konkreter Zeitdruck" },
    ],
  },
] as const;

/** Convenience lookups. */
export const QUESTIONS_BY_ID: Readonly<Record<string, Question>> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export const TOTAL_QUESTIONS = QUESTIONS.length;
