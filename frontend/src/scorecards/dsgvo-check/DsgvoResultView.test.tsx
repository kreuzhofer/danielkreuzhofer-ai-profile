import { render, screen } from "@testing-library/react";
import { DsgvoResultView } from "./DsgvoResultView";
import { recommend } from "./recommend";
import { definition } from "./definition";
import { content } from "./content";
import { branding } from "./branding";
import type { ScorecardRegistration } from "@/lib/scorecard/registry";

// Minimal registration — DsgvoResultView only reads `result` + DSGVO copy. No DB.
const reg = { definition, content, branding } as unknown as ScorecardRegistration;

test("shows the ampel headline, a tool row, and the disclaimer", () => {
  const answers = { Q_TOOLS: ["chatgpt"], Q_TIER: "free", Q_DATA: "personenbezogen", Q_USECASE: ["hr"], Q_SHADOW: "nein", Q_COMPLIANCE: ["nichts"], C1: "gf" };
  render(<DsgvoResultView registration={reg} answers={answers} result={recommend(answers)} />);
  expect(screen.getByText(/Akuter Handlungsbedarf/i)).toBeInTheDocument();
  expect(screen.getByText(/ChatGPT/)).toBeInTheDocument();
  expect(screen.getByText(/keine Rechtsberatung/i)).toBeInTheDocument();
});
