import { getScorecard } from "@/lib/scorecard/registry";
import { buildResult } from "@/lib/scorecard/result";
import { buildScorecardReport } from "@/lib/scorecard/report-model";
import type { Answers } from "@/lib/scorecard/types";

const reg = getScorecard("ki-fuehrungs-check")!;

/** Build answers from terse overrides, defaulting each question to its first option. */
function answers(overrides: Partial<Answers>): Answers {
  const base: Answers = {};
  for (const q of reg.definition.questions) base[q.id] = q.options[0].id;
  const merged: Answers = { ...base };
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined) merged[k] = v;
  }
  return merged;
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

  it("S4 covers the shadow-AI case (nothing official, no overview) as a 0-point option → Einkäufer", () => {
    const s4 = reg.definition.questions.find((q) => q.id === "S4")!;
    const shadow = s4.options.find((o) => o.id === "schatten");
    expect(shadow).toBeDefined();
    expect(shadow!.points).toBe(0);

    const result = buildResult(
      reg.definition,
      answers({ S1: "nie", S2: "nein", S3: "nein", S4: "schatten" }),
    );
    expect(result.score).toBe(0);
    expect(result.outcome).toBe("einkaeufer");
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

  it("ships 28 tips across 6 levers, 4 of them mapped to scoring categories", () => {
    const tipps = reg.content.tipps!;
    expect(tipps).toHaveLength(6);

    const mapped = tipps.map((h) => h.category).filter(Boolean);
    expect(mapped).toEqual(
      expect.arrayContaining(["eigennutzung", "sichtbarkeit", "bounds", "fuehrung"]),
    );
    // every mapped category must be a real scoring category on the definition
    const realCategories = new Set(
      reg.definition.questions.map((q) => ("category" in q ? q.category : undefined)).filter(Boolean),
    );
    for (const c of mapped) expect(realCategories.has(c!)).toBe(true);

    const allTips = tipps.flatMap((h) => h.tipps);
    expect(allTips).toHaveLength(28);
    for (const t of allTips) {
      expect(t.lead.length).toBeGreaterThan(0);
      expect(t.body.length).toBeGreaterThan(0);
      expect(["data", "practice"]).toContain(t.evidence);
    }
  });

  it("opt-in carries a concrete data-processing notice (Engpass parity)", () => {
    const hinweis = reg.content.optin.datenschutzHinweis;
    expect(hinweis).toBeDefined();
    expect(hinweis).toMatch(/CleverReach/);
    expect(hinweis).toMatch(/IONOS/);
  });

  it("K3 datenschutz personalisation does not point at a link the report never delivers", () => {
    const p = reg.content.personalisierung!.byAnswer.datenschutz;
    expect(p).not.toMatch(/Link im Report/i);
    expect(p).not.toMatch(/im Report\)/i);
  });

  it("K3 datenschutz now delivers the DSGVO video as a real clickable link", () => {
    const ans = answers({ K3: "datenschutz" });
    const report = buildScorecardReport(reg, buildResult(reg.definition, ans), ans);
    expect(report.bedeutungLink?.url).toBe("https://youtu.be/UVRIR_MljlQ");
    expect((report.bedeutungLink?.label.length ?? 0)).toBeGreaterThan(0);
  });
});
