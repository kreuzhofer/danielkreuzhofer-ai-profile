import { render, screen } from "@testing-library/react";
import { DsgvoReportDoc } from "./DsgvoReportDoc";
import { recommend } from "./recommend";
import { definition } from "./definition";
import { content } from "./content";
import { branding } from "./branding";
import type { ScorecardRegistration } from "@/lib/scorecard/registry";

const reg = { definition, content, branding } as unknown as ScorecardRegistration;

test("renders full plan, a DPA link, the reward templates and the Rechtsstand badge", () => {
  const answers = { Q_TOOLS: ["chatgpt"], Q_TIER: "business", Q_DATA: "intern", Q_USECASE: ["produktivitaet"], Q_SHADOW: "ja", Q_COMPLIANCE: ["nichts"], C1: "gf" };
  render(<DsgvoReportDoc registration={reg} result={recommend(answers)} answers={answers} />);
  expect(screen.getByText(/Muster KI-Nutzungsrichtlinie/i)).toBeInTheDocument();
  // "Stand der Recherche" appears in both the badge and the disclaimer — use getAllByText
  expect(screen.getAllByText(/Stand der Recherche/i).length).toBeGreaterThan(0);
  expect(screen.getByRole("link", { name: /AVV|DPA/i })).toBeInTheDocument();
});
