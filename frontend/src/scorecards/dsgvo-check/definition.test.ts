import { definition } from "./definition";

test("has the 8 contract question ids with correct kinds", () => {
  const byId = Object.fromEntries(definition.questions.map((q) => [q.id, q]));
  expect(byId.Q_TOOLS.kind).toBe("multi");
  expect(byId.Q_USECASE.kind).toBe("multi");
  expect(byId.Q_COMPLIANCE.kind).toBe("multi");
  expect(byId.C1.kind).toBe("context");
  expect(byId.Q_TIER.kind).toBe("context");
  expect(definition.qualification.requireQualifies).toContain("C1");
});

test("Q_TIER option ids match the Tier type", () => {
  const ids = definition.questions.find((q) => q.id === "Q_TIER")!.options.map((o) => o.id);
  expect(ids.sort()).toEqual(["business", "cloud", "free", "gemischt"]);
});
