import { getScorecard } from "@/lib/scorecard/registry";
import { buildResult } from "@/lib/scorecard/result";
import { buildScorecardReport } from "@/lib/scorecard/report-model";
import type { Answers } from "@/lib/scorecard/types";

const reg = getScorecard("ki-fuehrungs-check")!;

/** Build answers from terse overrides, defaulting each question to its first option. */
function answers(overrides: Partial<Answers>): Answers {
  const base: Answers = {};
  for (const q of reg.definition.questions) base[q.id] = q.options[0].id;
  return { ...base, ...overrides };
}

describe("KI-Führungs-Check registration", () => {
  it("is registered and resolvable by slug", () => {
    expect(reg).toBeDefined();
    expect(reg.definition.slug).toBe("ki-fuehrungs-check");
  });

  it("every band/outcome has a content block + a label", () => {
    const bands = reg.definition.outcome.type === "bands" ? reg.definition.outcome.bands : [];
    expect(bands).toHaveLength(4);
    for (const b of bands) {
      expect(reg.content.byOutcome[b.key]).toBeDefined();
      expect(reg.content.outcomeLabel[b.key]).toBeDefined();
    }
  });

  it("all-best → Vorbild (100), all-worst → Einkäufer (0)", () => {
    const best = buildResult(reg.definition, answers({}));
    expect(best.score).toBe(100);
    expect(best.outcome).toBe("vorbild");

    const worst = buildResult(
      reg.definition,
      answers({ S1: "nie", S2: "nein", S3: "nein", S4: "delegiert" }),
    );
    expect(worst.score).toBe(0);
    expect(worst.outcome).toBe("einkaeufer");
  });

  it("qualifies a GF at a mid-size company; not a team member at a tiny one", () => {
    expect(buildResult(reg.definition, answers({ K1: "gf", K2: "50-250" })).qualified).toBe(true);
    expect(buildResult(reg.definition, answers({ K1: "team", K2: "u50" })).qualified).toBe(false);
  });

  it("builds a complete report for every band", () => {
    const cases: { ans: Answers; outcome: string }[] = [
      { ans: answers({ S1: "nie", S2: "nein", S3: "nein", S4: "delegiert" }), outcome: "einkaeufer" },
      { ans: answers({ S1: "selten", S2: "eher-nicht", S3: "unsicher", S4: "it-thema" }), outcome: "verwalter" },
      { ans: answers({ S1: "woechentlich", S2: "einzelne", S3: "meistens", S4: "ohne-system" }), outcome: "mitmacher" },
      { ans: answers({}), outcome: "vorbild" },
    ];
    for (const c of cases) {
      const result = buildResult(reg.definition, c.ans);
      expect(result.outcome).toBe(c.outcome);
      const report = buildScorecardReport(reg, result, c.ans);
      expect(report.diagnose.length).toBeGreaterThan(0);
      expect(report.schritte).toHaveLength(3);
      expect(report.antiPattern.length).toBeGreaterThan(0);
    }
  });

  it("shows the K3 personalisation paragraph", () => {
    const ans = answers({ K3: "keine-zeit" });
    const report = buildScorecardReport(reg, buildResult(reg.definition, ans), ans);
    expect(report.bedeutung[0]).toContain("fängst Du klein an");
  });

  it("RAND source uses the corrected framing (42 of 50), not the secondary '84% of failures'", () => {
    const rand = reg.content.sources.find((s) => s.id === "rand2024")!;
    expect(rand.text).toContain("42 von 50");
    expect(rand.text).not.toMatch(/84 ?% aller/i);
  });
});
