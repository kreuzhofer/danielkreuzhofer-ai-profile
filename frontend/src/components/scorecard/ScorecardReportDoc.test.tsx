import { render, screen } from "@testing-library/react";
import { ScorecardReportDoc } from "./ScorecardReportDoc";
import { SAMPLE_REGISTRATION } from "@/lib/scorecard/__fixtures__/sample-registration";
import { buildScorecardReport } from "@/lib/scorecard/report-model";
import { buildResult } from "@/lib/scorecard/result";
import type { TippHebel } from "@/lib/scorecard/content";

const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" };
const model = buildScorecardReport(
  SAMPLE_REGISTRATION,
  buildResult(SAMPLE_REGISTRATION.definition, answers),
  answers,
);
const labels = {
  schritte: "Schritte",
  antiPattern: "Vermeide",
  quellen: "Quellen",
  bedeutung: "Bedeutung",
};

const tipps: TippHebel[] = [
  { category: "alpha", title: "Hebel Alpha", subtitle: "sub a", tipps: [{ lead: "A1", body: "body a1", evidence: "data" }] },
  { category: "beta", title: "Hebel Beta", subtitle: "sub b", tipps: [{ lead: "B1", body: "body b1", evidence: "practice" }] },
  { title: "Bonus-Rituale", subtitle: "sub x", tipps: [{ lead: "Z1", body: "body z1", evidence: "practice" }] },
];

describe("ScorecardReportDoc — tips section", () => {
  it("renders every lever and its tips when tipps are provided", () => {
    render(
      <ScorecardReportDoc model={model} labels={labels} eyebrow="Dein Ergebnis" tipps={tipps} weakestCategory="beta" />,
    );
    expect(screen.getByText("Hebel Alpha")).toBeInTheDocument();
    expect(screen.getByText("Hebel Beta")).toBeInTheDocument();
    expect(screen.getByText("Bonus-Rituale")).toBeInTheDocument();
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("B1")).toBeInTheDocument();
    expect(screen.getByText("Z1")).toBeInTheDocument();
  });

  it("renders the weakest lever first and highlights it", () => {
    const { container } = render(
      <ScorecardReportDoc model={model} labels={labels} eyebrow="Dein Ergebnis" tipps={tipps} weakestCategory="beta" />,
    );
    const titles = Array.from(container.querySelectorAll(".scd-hebel-title")).map((e) => e.textContent);
    expect(titles[0]).toBe("Hebel Beta");
    expect(container.querySelector(".scd-hebel-highlight .scd-hebel-title")?.textContent).toBe("Hebel Beta");
  });

  it("shows no tips section when tipps are absent (matches the free inline view)", () => {
    const { container } = render(
      <ScorecardReportDoc model={model} labels={labels} eyebrow="Dein Ergebnis" />,
    );
    expect(container.querySelector(".scd-tipps")).toBeNull();
  });
});
