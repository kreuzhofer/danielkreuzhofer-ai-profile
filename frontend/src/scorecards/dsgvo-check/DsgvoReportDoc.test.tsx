import { render, screen } from "@testing-library/react";
import { DsgvoReportDoc } from "./DsgvoReportDoc";
import { recommend } from "./recommend";

test("renders full plan, a DPA link, the reward templates and the Rechtsstand badge", () => {
  const answers = { Q_TOOLS: ["chatgpt"], Q_TIER: "business", Q_DATA: "intern", Q_USECASE: ["produktivitaet"], Q_SHADOW: "ja", Q_COMPLIANCE: ["nichts"], C1: "gf" };
  render(<DsgvoReportDoc result={recommend(answers)} answers={answers} />);
  expect(screen.getByText(/Muster KI-Nutzungsrichtlinie/i)).toBeInTheDocument();
  // "Stand der Recherche" appears in both the badge and the disclaimer — use getAllByText
  expect(screen.getAllByText(/Stand der Recherche/i).length).toBeGreaterThan(0);
  expect(screen.getByRole("link", { name: /AVV|DPA/i })).toBeInTheDocument();
});
