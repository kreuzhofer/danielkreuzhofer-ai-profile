import fc from "fast-check";
import { SAMPLE_DEFINITION } from "./__fixtures__/sample-definition";
import { buildResult, resolveResult } from "./result";
import type { ScorecardRegistration } from "./registry";

describe("buildResult", () => {
  it("aggregates sum, score, outcome, category scores, next lever and qualification", () => {
    const r = buildResult(SAMPLE_DEFINITION, { K1: "gf", K2: "mid", S1: "daily", S2: "no" });
    expect(r.rawSum).toBe(3);
    expect(r.score).toBe(50); // round(3/6*100)
    expect(r.outcome).toBe("verwalter"); // 26..50
    expect(r.categoryScores).toEqual({ nutzung: 3, sichtbarkeit: 0 });
    expect(r.nextLever).toBe("sichtbarkeit"); // weakest
    expect(r.qualified).toBe(true);
  });

  it("omits categoryScores and nextLever when the scorecard has no categories", () => {
    const flat = {
      ...SAMPLE_DEFINITION,
      nextLever: undefined,
      questions: SAMPLE_DEFINITION.questions.map((q) =>
        q.kind === "score" ? { ...q, category: undefined } : q,
      ),
    };
    const r = buildResult(flat, { S1: "daily", S2: "active" });
    expect(r.categoryScores).toBeUndefined();
    expect(r.nextLever).toBeUndefined();
    expect(r.outcome).toBe("vorbild"); // score 100
  });

  it("yields no nextLever when it is configured but the scorecard has no categories", () => {
    const noCats = {
      ...SAMPLE_DEFINITION, // keeps nextLever: { over: "category", pick: "min" }
      questions: SAMPLE_DEFINITION.questions.map((q) =>
        q.kind === "score" ? { ...q, category: undefined } : q,
      ),
    };
    const r = buildResult(noCats, { S1: "daily", S2: "active" });
    expect(r.nextLever).toBeUndefined();
    expect(r.categoryScores).toBeUndefined();
  });
});

describe("buildResult invariants (property-based)", () => {
  const answersArb: fc.Arbitrary<Record<string, string>> = fc.record(
    Object.fromEntries(
      SAMPLE_DEFINITION.questions.map((q) => [q.id, fc.constantFrom(...q.options.map((o) => o.id))]),
    ),
  );

  it("score ∈ [0,100], rawSum ∈ [0,maxPoints], outcome is a valid band, lever is a category", () => {
    const bandKeys =
      SAMPLE_DEFINITION.outcome.type === "bands"
        ? SAMPLE_DEFINITION.outcome.bands.map((b) => b.key)
        : [];
    fc.assert(
      fc.property(answersArb, (answers) => {
        const r = buildResult(SAMPLE_DEFINITION, answers);
        expect(r.rawSum).toBeGreaterThanOrEqual(0);
        expect(r.rawSum).toBeLessThanOrEqual(SAMPLE_DEFINITION.scoring.maxPoints);
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(100);
        expect(bandKeys).toContain(r.outcome);
        expect(typeof r.qualified).toBe("boolean");
        if (r.nextLever) expect(Object.keys(r.categoryScores ?? {})).toContain(r.nextLever);
      }),
      { numRuns: 3 },
    );
  });
});

const baseReg = {
  definition: {
    slug: "t",
    scoring: { maxPoints: 0, direction: "higher-better" },
    outcome: { type: "bands", bands: [{ key: "na", min: 0, max: 100 }] },
    qualification: { requireQualifies: [] },
    attributePrefix: "t_",
    questions: [],
  },
} as unknown as ScorecardRegistration;

test("resolveResult uses buildResult when no resolve hook", () => {
  expect(resolveResult(baseReg, {}).outcome).toBe("na");
});

test("resolveResult uses the registration's resolve hook when present", () => {
  const reg = {
    ...baseReg,
    resolve: () => ({ rawSum: 0, score: 50, outcome: "gelb", qualified: true }),
  } as unknown as ScorecardRegistration;
  expect(resolveResult(reg, {}).outcome).toBe("gelb");
});
