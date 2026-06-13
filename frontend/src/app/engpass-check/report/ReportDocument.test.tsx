/**
 * ReportDocument — the token-gated page. This is where the implementation
 * toolkit lives (the reason a lead gives their email). Counterpart to the
 * EngpassCheck boundary test, which asserts the toolkit is NOT on the free screen.
 */

import { render, screen } from "@testing-library/react";
import { ReportDocument } from "./ReportDocument";
import { buildReportModel } from "@/lib/engpass-check/report";
import { computeResult } from "@/lib/engpass-check/scoring";
import type { Answers } from "@/lib/engpass-check/types";

function modelFor(a: Answers) {
  return buildReportModel(a, computeResult(a));
}

describe("ReportDocument (gated toolkit page)", () => {
  it("renders the report PLUS the full implementation toolkit", () => {
    const answers: Answers = {
      K1: "gf",
      K2: "50-250",
      K3: "ja-budget",
      S1: "2w-plus",
      S2: "alle", // Übergabe-Stau → Weg A
      S3: "kaum",
      S4: "alles",
      S5: "teilweise",
      S6: "poc",
      K4: "infrastruktur",
      K5: "quartal",
    };
    render(<ReportDocument model={modelFor(answers)} />);

    // Report part (also visible for free on the result screen)
    expect(screen.getByText("Quellen & Belege")).toBeInTheDocument();

    // Toolkit part — gated, the actual reason for the opt-in
    expect(screen.getByRole("heading", { name: /Engpass-Raster/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Entscheidungsbaum/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /geprüfte Cases/ })).toBeInTheDocument();
    expect(screen.getByText(/Bremsen lösen/)).toBeInTheDocument(); // 90-day skeleton
    expect(screen.getByText(/Lüdenscheid/)).toBeInTheDocument(); // a verified case detail
  });
});
