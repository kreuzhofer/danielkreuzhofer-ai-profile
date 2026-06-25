import { render, screen } from "@testing-library/react";
import { DsgvoReportDoc } from "./DsgvoReportDoc";
import { recommend } from "./recommend";

test("renders full plan, a DPA link, the reward templates and the Rechtsstand badge", () => {
  const answers = { Q_TOOLS: ["chatgpt"], Q_TIER: "business", Q_DATA: "intern", Q_USECASE: ["produktivitaet"], Q_SHADOW: "ja", Q_COMPLIANCE: ["nichts"], C1: "gf" };
  render(<DsgvoReportDoc result={recommend(answers)} answers={answers} />);
  // "Stand der Recherche" appears in both the badge and the disclaimer — use getAllByText
  expect(screen.getAllByText(/Stand der Recherche/i).length).toBeGreaterThan(0);
  expect(screen.getByRole("link", { name: /AVV|DPA/i })).toBeInTheDocument();
});

test("the gated report contains the ACTUAL template content, not just titles", () => {
  const answers = { Q_TOOLS: ["chatgpt"], Q_TIER: "business", Q_DATA: "intern", Q_USECASE: ["produktivitaet"], Q_SHADOW: "ja", Q_COMPLIANCE: ["nichts"], C1: "gf" };
  render(<DsgvoReportDoc result={recommend(answers)} answers={answers} />);
  // Real, substantive content from INSIDE the templates (unique to them — the bare
  // titles also echo in the action plan, so we assert section bodies instead).
  expect(screen.getByText(/Zweck & Geltungsbereich/i)).toBeInTheDocument();      // KI-Nutzungsrichtlinie
  expect(screen.getByText(/Pflichtinhalte nach Art\. 28/i)).toBeInTheDocument();  // AVV-Checkliste
  expect(screen.getByText(/Halluzinationen/i)).toBeInTheDocument();               // AI-Literacy-Plan
  // the "Vorlage – Platzhalter anpassen / keine Rechtsberatung" note
  expect(screen.getByText(/eckigen Klammern/i)).toBeInTheDocument();
});
