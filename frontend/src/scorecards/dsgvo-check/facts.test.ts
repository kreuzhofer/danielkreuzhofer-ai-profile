import { TOOLS, DPF_STATUS, RECHTSSTAND, AI_ACT_TIMELINE } from "./facts";

test("every tool has a label, source url+asOf, and either tiers or an override", () => {
  for (const [id, t] of Object.entries(TOOLS)) {
    expect(t.label).toBeTruthy();
    expect(t.source.url).toMatch(/^https?:\/\//);
    expect(t.source.asOf).toMatch(/^\d{4}-\d{2}$/);
    const hasTiers = Object.keys(t.tiers).length > 0;
    // Include id in message for easier debugging of failures
    expect([id, hasTiers || !!t.override]).toEqual([id, true]);
  }
});

test("every tier fact has a verdict + reason", () => {
  for (const [id, t] of Object.entries(TOOLS)) {
    for (const [tier, f] of Object.entries(t.tiers)) {
      expect(["gruen", "gelb", "rot"]).toContain(f.verdict);
      // Include context in failure via the asserted value
      expect([`${id}.${tier}`, f.reason]).toEqual([`${id}.${tier}`, expect.any(String)]);
      expect(f.reason).toBeTruthy();
    }
  }
});

test("the required tool set is present", () => {
  ["chatgpt", "claude", "gemini", "copilot", "mistral", "alephalpha", "deepseek", "local"]
    .forEach((id) => expect(TOOLS[id]).toBeDefined());
});

test("Rechtsstand + DPF + timeline are set", () => {
  expect(RECHTSSTAND).toMatch(/^\d{4}-\d{2}$/);
  expect(typeof DPF_STATUS.stable).toBe("boolean");
  expect(AI_ACT_TIMELINE.length).toBeGreaterThan(3);
});
