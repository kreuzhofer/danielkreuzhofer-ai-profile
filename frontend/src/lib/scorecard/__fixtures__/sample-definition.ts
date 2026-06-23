import type { ScorecardDefinition } from "../types";

/** A small KFC-shaped definition (2 context + 2 score questions, maxPoints 6). */
export const SAMPLE_DEFINITION: ScorecardDefinition = {
  slug: "sample",
  questions: [
    {
      id: "K1",
      kind: "context",
      prompt: "Rolle?",
      attributeKey: "x_rolle",
      options: [
        { id: "gf", label: "GF", qualifies: true, attributeValue: "gf" },
        { id: "team", label: "Team" },
      ],
    },
    {
      id: "K2",
      kind: "context",
      prompt: "Größe?",
      attributeKey: "x_groesse",
      options: [
        { id: "mid", label: "50–250", qualifies: true, attributeValue: "mid" },
        { id: "small", label: "unter 50" },
      ],
    },
    {
      id: "S1",
      kind: "score",
      prompt: "Eigennutzung?",
      category: "nutzung",
      options: [
        { id: "daily", label: "Täglich", points: 3 },
        { id: "weekly", label: "Wöchentlich", points: 2 },
        { id: "rare", label: "Selten", points: 1 },
        { id: "never", label: "Nie", points: 0 },
      ],
    },
    {
      id: "S2",
      kind: "score",
      prompt: "Sichtbarkeit?",
      category: "sichtbarkeit",
      options: [
        { id: "active", label: "Aktiv", points: 3 },
        { id: "some", label: "Einzelne", points: 2 },
        { id: "no", label: "Nein", points: 0 },
      ],
    },
  ],
  scoring: { maxPoints: 6, direction: "higher-better" },
  outcome: {
    type: "bands",
    bands: [
      { key: "einkaeufer", min: 0, max: 25 },
      { key: "verwalter", min: 26, max: 50 },
      { key: "mitmacher", min: 51, max: 75 },
      { key: "vorbild", min: 76, max: 100 },
    ],
  },
  nextLever: { over: "category", pick: "min" },
  qualification: { requireQualifies: ["K1", "K2"] },
  attributePrefix: "x_",
};
