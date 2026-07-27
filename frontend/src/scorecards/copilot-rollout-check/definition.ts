/**
 * Copilot-Rollout-Check — engine definition (scoring config).
 * v1 from vault `funnels/copilot-rollout-check/06-quiz-spec.md` (Video #09);
 * v2 (27.07.2026, Video #10) adds the Nutzungs-Block N1–N4 from Beat 5 of
 * `10-copilot-ausgerollt-keiner-nutzt`. Higher score = better prepared.
 * Σ S1–S4 + N1–N4 (max 24) → bands. K1/K2 wortgleich KI-Führungs-Check.
 */

import type { ScorecardDefinition } from "@/lib/scorecard/types";

export const definition: ScorecardDefinition = {
  slug: "copilot-rollout-check",
  scoring: { maxPoints: 24, direction: "higher-better" },
  outcome: {
    type: "bands",
    // Band KEYS are frozen: stored v1 results reference them (old report links).
    // Only the LABELS were renamed for v2 (content.outcomeLabel).
    bands: [
      { key: "blindflug", min: 0, max: 25 },
      { key: "bauchgefuehl", min: 26, max: 50 },
      { key: "fast-startklar", min: 51, max: 75 },
      { key: "rollout-ready", min: 76, max: 100 },
    ],
  },
  // Weakest of the eight Dimensionen = "Dein erster Auftrag" (IT oder Entscheider).
  nextLever: { over: "category", pick: "min" },
  qualification: { requireQualifies: ["K1", "K2"] },
  attributePrefix: "rollout_",
  questions: [
    // ── Block 1 — Kontext (keine Punkte, Qualifikations-Daten) ──────────────
    {
      id: "K1",
      kind: "context",
      attributeKey: "rollout_rolle",
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
      attributeKey: "rollout_groesse",
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
      kind: "context",
      attributeKey: "rollout_copilot_stand",
      prompt: "Wo steht ihr mit Microsoft Copilot gerade?",
      options: [
        { id: "rollout-geplant", label: "Rollout ist geplant, noch nicht gestartet" },
        { id: "gekauft-kaum-genutzt", label: "Lizenzen sind gekauft, werden aber kaum genutzt" },
        { id: "gekauft-aktiv", label: "Lizenzen sind gekauft und im aktiven Einsatz" },
        { id: "gratis-variante", label: "Nur die Gratis-Variante (Copilot Chat), einzelne testen" },
        { id: "nichts-offizielles", label: "Noch nichts Offizielles, einzelne nutzen wohl private KI-Tools" },
      ],
    },

    // ── Block 2 — Diagnose (je 0–3; „Weiß nicht" ist überall die 0) ─────────
    {
      id: "S1",
      kind: "score",
      category: "anbieter",
      prompt:
        "Ist bei euch dokumentiert, welche KI-Anbieter-Schalter (Anthropic, OpenAI, Mistral, " +
        "Vorschau-Modelle) im Admin Center aktiv sind, und wer das mit welcher Begründung entschieden hat?",
      options: [
        { id: "dokumentiert", label: "Ja, pro Schalter dokumentiert: was an ist, wer entschieden hat, warum", points: 3 },
        { id: "bekannt", label: "Wir wissen, was an ist, aber festgehalten ist nichts", points: 2 },
        { id: "nie-draufgeschaut", label: "Nein, da hat noch nie jemand draufgeschaut", points: 1 },
        { id: "weiss-nicht", label: "Weiß nicht, welche Schalter gemeint sind", points: 0 },
      ],
    },
    {
      id: "S2",
      kind: "score",
      category: "training",
      prompt:
        "Habt ihr schriftlich bestätigt, dass eure Firmendaten bei keinem aktivierten Anbieter " +
        "ins Modell-Training fließen?",
      options: [
        { id: "schriftlich", label: "Ja, schriftlich, für jede aktivierte Stufe", points: 3 },
        { id: "muendlich", label: "Mündlich geklärt bzw. wir verlassen uns auf den Vertrag", points: 2 },
        { id: "nie-geprueft", label: "Nein, nie geprüft", points: 1 },
        { id: "weiss-nicht", label: "Weiß nicht, ob das bei uns geregelt ist", points: 0 },
      ],
    },
    {
      id: "S3",
      kind: "score",
      category: "berechtigungen",
      prompt:
        "Gab es ein Berechtigungs-Review für die Datenquellen, die Copilot sehen wird (SharePoint, " +
        "OneDrive, Postfächer), bevor Lizenzen verteilt werden bzw. wurden?",
      options: [
        { id: "review-abgeschlossen", label: "Ja, Review abgeschlossen, Über-Berechtigungen bereinigt", points: 3 },
        { id: "review-geplant", label: "Review ist fest eingeplant, vor dem Rollout", points: 2 },
        { id: "ohne-review", label: "Nein, Rollout lief bzw. läuft ohne Review", points: 1 },
        { id: "weiss-nicht", label: "Weiß nicht, was Copilot bei uns alles sehen kann", points: 0 },
      ],
    },
    {
      id: "S4",
      kind: "score",
      category: "lizenz",
      prompt:
        "Wisst ihr, welche Lizenz-Schiene und Zahlweise für euch die richtige ist (Copilot Business " +
        "vs. Enterprise-Add-on, jährlich vs. monatlich)?",
      options: [
        { id: "bewusst-entschieden", label: "Ja, bewusst entschieden bzw. Kriterien sind klar", points: 3 },
        { id: "schiene-ja", label: "Die Schiene ja, die Zahlweise haben wir nie verglichen", points: 2 },
        { id: "haendler", label: "Wir haben genommen, was der Händler vorgeschlagen hat", points: 1 },
        { id: "weiss-nicht", label: "Weiß nicht, dass es da Unterschiede gibt", points: 0 },
      ],
    },

    // ── Block 3 — Nutzungs-Führung (je 0–3; die vier Schritte aus Video #10) ─
    {
      id: "N1",
      kind: "score",
      category: "use-case",
      prompt:
        "Habt ihr einen konkreten Prozess benannt, den Copilot besser machen soll (z. B. Angebote, " +
        "Reklamationen, Besprechungs-Nachbereitung)?",
      options: [
        { id: "benannt", label: "Ja, ein benannter Prozess mit Verantwortlichem", points: 3 },
        { id: "ideen-liste", label: "Es gibt eine Ideen-Liste, entschieden ist nichts", points: 2 },
        { id: "fuer-alle", label: "Nein, die Lizenzen sind für alle gedacht", points: 1 },
        { id: "weiss-nicht", label: "Weiß nicht, wer das entschieden haben müsste", points: 0 },
      ],
    },
    {
      id: "N2",
      kind: "score",
      category: "basislinie",
      prompt:
        "Ist der Ist-Zustand dieses Prozesses gemessen (Dauer, Häufigkeit, Kosten), und gibt es " +
        "eine aufgeschriebene Wert-Hypothese?",
      options: [
        { id: "gemessen", label: "Ja, gemessen und Hypothese schriftlich", points: 3 },
        { id: "geschaetzt", label: "Grobe Schätzungen, aufgeschrieben ist nichts", points: 2 },
        { id: "gefuehl", label: "Nein, Erfolg würden wir am Gefühl festmachen", points: 1 },
        { id: "weiss-nicht", label: "Weiß nicht, was da zu messen wäre", points: 0 },
      ],
    },
    {
      id: "N3",
      kind: "score",
      category: "befaehigung",
      prompt:
        "Können die Menschen, deren Alltag dieser Prozess ist, heute damit arbeiten?",
      options: [
        { id: "arbeiten", label: "Ja, sie arbeiten damit und wissen, was sie tun", points: 3 },
        { id: "schulung", label: "Es gab eine allgemeine Schulung, keine Einführung am eigenen Prozess", points: 2 },
        { id: "nur-verteilt", label: "Nein, die Lizenz wurde verteilt, mehr nicht", points: 1 },
        { id: "weiss-nicht", label: "Weiß nicht, ob überhaupt jemand damit arbeitet", points: 0 },
      ],
    },
    {
      id: "N4",
      kind: "score",
      category: "entscheid",
      prompt:
        "Gibt es einen festen Termin, an dem Basislinie gegen Ergebnis gehalten wird und die Daten " +
        "über skalieren oder abschalten entscheiden?",
      options: [
        { id: "termin-steht", label: "Ja, Termin steht, Kriterien sind klar", points: 3 },
        { id: "irgendwann", label: "Wir wollen irgendwann bewerten, fest ist nichts", points: 2 },
        { id: "laeuft-weiter", label: "Nein, das Thema läuft einfach weiter", points: 1 },
        { id: "weiss-nicht", label: "Weiß nicht, wer das bewerten würde", points: 0 },
      ],
    },

    // ── Block 4 — Kontext (Personalisierung) ────────────────────────────────
    {
      id: "K4",
      kind: "context",
      attributeKey: "rollout_bremse",
      prompt: "Was bremst euren Copilot-Rollout am meisten?",
      options: [
        { id: "datenschutz", label: "Datenschutz-Unsicherheit" },
        { id: "kosten", label: "Unklare Kosten" },
        { id: "it-kapazitaet", label: "IT hat keine Kapazität" },
        { id: "zustaendigkeit", label: "Niemand fühlt sich zuständig" },
        { id: "nichts", label: "Nichts, wir rollen einfach aus" },
      ],
    },
  ],
};
