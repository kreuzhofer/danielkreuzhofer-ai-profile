import { SAMPLE_REGISTRATION } from "./__fixtures__/sample-registration";
import { buildScorecardReport } from "./report-model";
import { buildResult } from "./result";

const reg = SAMPLE_REGISTRATION;

describe("buildScorecardReport", () => {
  it("selects the outcome's blocks, interpolates the score, and resolves the label", () => {
    const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" }; // score 50 → verwalter
    const m = buildScorecardReport(reg, buildResult(reg.definition, answers), answers);
    expect(m.outcomeLabel).toBe("Verwalter");
    expect(m.diagnose).toContain("50/100");
    expect(m.schritte).toHaveLength(3);
    expect(m.antiPattern).toBe("Vermeide X.");
  });

  it("includes the personalisation paragraph for the lead's context answer", () => {
    const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" };
    const m = buildScorecardReport(reg, buildResult(reg.definition, answers), answers);
    expect(m.bedeutung).toEqual(["Als GF gilt für Dich besonders …"]);
  });

  it("omits the personalisation paragraph when the answer has no mapping", () => {
    const answers = { K1: "team", K2: "small", S1: "never", S2: "no" };
    const m = buildScorecardReport(reg, buildResult(reg.definition, answers), answers);
    expect(m.bedeutung).toEqual([]);
  });

  it("shows sources whose shownFor includes the outcome (or has none)", () => {
    const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" };
    const m = buildScorecardReport(reg, buildResult(reg.definition, answers), answers);
    expect(m.sources.map((s) => s.id)).toEqual(["s1"]); // s1 has no shownFor → always
  });

  it("throws (fail-fast) when the outcome has no content block", () => {
    const broken = {
      ...reg,
      content: { ...reg.content, byOutcome: { vorbild: reg.content.byOutcome.vorbild } },
    };
    const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" }; // verwalter, not in byOutcome
    expect(() => buildScorecardReport(broken, buildResult(broken.definition, answers), answers)).toThrow(
      /No content for outcome/,
    );
  });
});
