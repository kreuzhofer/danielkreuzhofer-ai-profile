import { render, screen } from "@testing-library/react";
import { ScorecardReportView } from "./ScorecardReportView";
import { SAMPLE_REGISTRATION } from "@/lib/scorecard/__fixtures__/sample-registration";
import { buildScorecardReport } from "@/lib/scorecard/report-model";
import { buildResult } from "@/lib/scorecard/result";

const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" };
const model = buildScorecardReport(
  SAMPLE_REGISTRATION,
  buildResult(SAMPLE_REGISTRATION.definition, answers),
  answers,
);

const labels = {
  schritte: "Deine Schritte",
  antiPattern: "Vermeide",
  quellen: "Quellen",
  bedeutung: "Was das bedeutet",
};

describe("ScorecardReportView", () => {
  it("renders the outcome, steps, anti-pattern, free tool and sources", () => {
    render(<ScorecardReportView model={model} labels={labels} />);
    expect(screen.getByRole("heading", { name: /Verwalter/ })).toBeInTheDocument();
    expect(screen.getByText("Schritt eins.")).toBeInTheDocument();
    expect(screen.getByText("Vermeide X.")).toBeInTheDocument();
    expect(screen.getByText("Dein Werkzeug")).toBeInTheDocument(); // free-tool label
    const link = screen.getByRole("link", { name: /ansehen/ });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("renders the personalisation section only when non-empty", () => {
    render(<ScorecardReportView model={model} labels={labels} />);
    expect(screen.getByText("Was das bedeutet")).toBeInTheDocument();
    expect(screen.getByText("Als GF gilt für Dich besonders …")).toBeInTheDocument();

    const noPers = { ...model, bedeutung: [] };
    const { container } = render(<ScorecardReportView model={noPers} labels={labels} />);
    expect(container).not.toHaveTextContent("Als GF gilt für Dich besonders");
  });
});
