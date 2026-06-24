import fc from "fast-check";
import { buildToolMatrix, classifyRisk, recommend, buildActionPlan } from "./recommend";
import { KNOWN_TOOL_IDS } from "./facts";

test("ChatGPT at free tier + personal data → rot (overlay)", () => {
  const m = buildToolMatrix({ Q_TOOLS: ["chatgpt"], Q_TIER: "free", Q_DATA: "personenbezogen" });
  expect(m[0].verdict).toBe("rot");
});
test("ChatGPT at business tier → gruen", () => {
  const m = buildToolMatrix({ Q_TOOLS: ["chatgpt"], Q_TIER: "business", Q_DATA: "keine" });
  expect(m[0].verdict).toBe("gruen");
});
test("DeepSeek is always rot regardless of tier", () => {
  const m = buildToolMatrix({ Q_TOOLS: ["deepseek"], Q_TIER: "cloud", Q_DATA: "keine" });
  expect(m[0].verdict).toBe("rot");
});
test("unknown selected tool yields a neutral 'individuell prüfen' verdict, never invented", () => {
  const m = buildToolMatrix({ Q_TOOLS: ["andere"], Q_TIER: "business", Q_DATA: "keine" });
  expect(m[0].verdict).toBe("gelb");
  expect(m[0].reason).toMatch(/individuell/i);
});
test("gemischt tier falls back to the tool's least-favourable known tier + upgrade hint", () => {
  const m = buildToolMatrix({ Q_TOOLS: ["claude"], Q_TIER: "gemischt", Q_DATA: "keine" });
  expect(["rot", "gelb"]).toContain(m[0].verdict);
  expect(m[0].upgradePath).toBeTruthy();
});
test("'keine' (noch keine Tools) produces an empty matrix, not a fallback row", () => {
  expect(buildToolMatrix({ Q_TOOLS: ["keine"], Q_TIER: "gemischt", Q_DATA: "keine" })).toEqual([]);
});

test("HR/Scoring use → Hochrisiko with obligations", () => {
  const r = classifyRisk({ Q_USECASE: ["hr"] });
  expect(r.riskClass).toBe("hoch");
  expect(r.obligations.join(" ")).toMatch(/Human Oversight/i);
});
test("customer-service bot → begrenzt (Transparenzpflicht)", () => {
  expect(classifyRisk({ Q_USECASE: ["bot"] }).riskClass).toBe("begrenzt");
});
test("only productivity → minimal", () => {
  expect(classifyRisk({ Q_USECASE: ["produktivitaet"] }).riskClass).toBe("minimal");
});
test("HR wins even when combined with productivity", () => {
  expect(classifyRisk({ Q_USECASE: ["produktivitaet", "hr"] }).riskClass).toBe("hoch");
});

test("action plan = the NOT-checked compliance items, AI-Literacy first", () => {
  const plan = buildActionPlan({ Q_COMPLIANCE: ["avv"], Q_TOOLS: [], Q_SHADOW: "ja" });
  const titles = plan.map((p) => p.title.toLowerCase());
  expect(titles.some((t) => t.includes("literacy"))).toBe(true);
  expect(titles.some((t) => t.includes("avv"))).toBe(false);
  expect(plan[0].title.toLowerCase()).toContain("literacy");
});
test("shadow-AI remediation appears when no overview", () => {
  const plan = buildActionPlan({ Q_COMPLIANCE: ["avv","literacy","richtlinie","euregion","dsfa"], Q_TOOLS: [], Q_SHADOW: "nein" });
  expect(plan.some((p) => /schatten|mitarbeit/i.test(p.title + p.detail))).toBe(true);
});
test("recommend() is ScorecardResult-compatible and self-consistent", () => {
  const r = recommend({ Q_TOOLS: ["chatgpt"], Q_TIER: "free", Q_DATA: "personenbezogen", Q_USECASE: ["hr"], Q_SHADOW: "nein", Q_COMPLIANCE: ["nichts"], C1: "gf", C2: "50-250" });
  expect(r.outcome).toBe(r.ampel);
  expect(typeof r.qualified).toBe("boolean");
  expect(r.score).toBeGreaterThanOrEqual(0);
  expect(r.score).toBeLessThanOrEqual(100);
  expect(r.riskClass).toBe("hoch");
  expect(r.toolMatrix[0].verdict).toBe("rot");
});
test("invariant: every tool verdict references a known tool or the neutral fallback", () => {
  fc.assert(fc.property(
    fc.array(fc.constantFrom(...KNOWN_TOOL_IDS, "andere"), { maxLength: 8 }),
    fc.constantFrom("free","business","cloud","gemischt"),
    (tools, tier) => {
      const r = recommend({ Q_TOOLS: tools, Q_TIER: tier, Q_USECASE: ["produktivitaet"], Q_COMPLIANCE: ["nichts"], Q_SHADOW: "ja" });
      return r.toolMatrix.length === tools.length &&
        r.toolMatrix.every((v) => ["gruen","gelb","rot"].includes(v.verdict));
    },
  ), { numRuns: 3 });
});
