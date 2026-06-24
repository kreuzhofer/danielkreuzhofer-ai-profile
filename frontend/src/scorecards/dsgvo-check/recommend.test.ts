import { buildToolMatrix, classifyRisk } from "./recommend";

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
