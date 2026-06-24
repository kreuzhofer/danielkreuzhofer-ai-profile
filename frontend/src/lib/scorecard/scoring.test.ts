import { SAMPLE_DEFINITION } from "./__fixtures__/sample-definition";
import { computeCategoryScores, computeRawSum, normalizeScore } from "./scoring";
import type { ScorecardDefinition } from "./types";

describe("computeRawSum", () => {
  it("sums points of score questions only (context answers never count)", () => {
    expect(computeRawSum(SAMPLE_DEFINITION, { K1: "gf", S1: "daily", S2: "active" })).toBe(6);
  });

  it("treats unanswered score questions as 0", () => {
    expect(computeRawSum(SAMPLE_DEFINITION, { S1: "weekly" })).toBe(2);
  });
});

describe("normalizeScore", () => {
  it("normalizes round(sum / maxPoints * 100), clamped at maxPoints 0", () => {
    expect(normalizeScore(6, 6)).toBe(100);
    expect(normalizeScore(3, 6)).toBe(50);
    expect(normalizeScore(0, 6)).toBe(0);
    expect(normalizeScore(5, 0)).toBe(0);
  });
});

describe("computeCategoryScores", () => {
  it("sums points per category (score questions with a category)", () => {
    const scores = computeCategoryScores(SAMPLE_DEFINITION, { S1: "daily", S2: "no" });
    expect(scores).toEqual({ nutzung: 3, sichtbarkeit: 0 });
  });

  it("ignores score questions without a category", () => {
    const noCat = {
      ...SAMPLE_DEFINITION,
      questions: SAMPLE_DEFINITION.questions.map((q) =>
        q.id === "S2" ? { ...q, category: undefined } : q,
      ),
    };
    expect(computeCategoryScores(noCat, { S1: "daily", S2: "active" })).toEqual({ nutzung: 3 });
  });
});

test("computeRawSum ignores multi-select (array) answers without crashing", () => {
  const def = {
    slug: "t",
    scoring: { maxPoints: 3, direction: "higher-better" },
    outcome: { type: "bands", bands: [{ key: "a", min: 0, max: 100 }] },
    qualification: { requireQualifies: [] },
    attributePrefix: "t_",
    questions: [
      { id: "M1", kind: "multi", prompt: "?", options: [{ id: "x" }, { id: "y" }] },
      { id: "S1", kind: "score", category: "c", prompt: "?", options: [{ id: "a", points: 3 }] },
    ],
  } as unknown as ScorecardDefinition;
  expect(computeRawSum(def, { M1: ["x", "y"], S1: "a" })).toBe(3);
});
