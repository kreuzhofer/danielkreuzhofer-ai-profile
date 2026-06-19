/**
 * Engpass-Check scoring engine — tests.
 *
 * Property tests (fast-check, numRuns: 3) guard the invariants of the pure
 * transformation; example tests pin the band boundaries, tie-break priority,
 * the Weg-Tendenz rule tree, and the qualification logic.
 */

import fc from "fast-check";
import { QUESTIONS } from "./questions";
import type { Answers, Dimension } from "./types";
import {
  computeBand,
  computeDimensions,
  computeResult,
  computeScoreSum,
  computeTyp,
  computeWeg,
  isQualified,
  normalizeScore,
} from "./scoring";

/** fast-check generator: a complete, valid set of answers. */
const answersArb: fc.Arbitrary<Answers> = fc.record(
  Object.fromEntries(
    QUESTIONS.map((q) => [q.id, fc.constantFrom(...q.options.map((o) => o.id))]),
  ),
) as fc.Arbitrary<Answers>;

/** Build answers from terse per-question option ids, defaulting the rest to the best/first. */
function answers(overrides: Partial<Answers>): Answers {
  const base: Answers = {};
  for (const q of QUESTIONS) base[q.id] = q.options[0].id;
  return { ...base, ...overrides };
}

describe("computeScoreSum + normalizeScore", () => {
  it("is 0 when every diagnosis answer is the best option", () => {
    expect(computeScoreSum(answers({}))).toBe(0);
    expect(normalizeScore(0)).toBe(0);
  });

  it("is 17 → 100 when every diagnosis answer is the worst option (S1 caps at 2)", () => {
    const worst = answers({
      S1: "2w-plus", // capped at 2
      S2: "alle",
      S3: "fast-alles",
      S4: "nichts",
      S5: "nein",
      S6: "poc",
    });
    expect(computeScoreSum(worst)).toBe(17);
    expect(normalizeScore(17)).toBe(100);
  });

  it("only S1–S6 count toward the score sum (context answers do not)", () => {
    const sum = computeScoreSum(answers({ S2: "meiste", S4: "wenig" })); // 2 + 2
    expect(sum).toBe(4);
  });

  it("the S1 'weiß nicht' bonus does not inflate the raw score (S1 caps at 2)", () => {
    expect(computeScoreSum(answers({ S1: "unbekannt" }))).toBe(2);
    expect(computeScoreSum(answers({ S1: "2w-plus" }))).toBe(2);
  });

  it("S6 'noch nicht gestartet' adds 0 to the score — only real friction counts (#5)", () => {
    expect(computeScoreSum(answers({ S6: "noch-nicht" }))).toBe(0);
    // a stalled / abandoned project still counts as friction
    expect(computeScoreSum(answers({ S6: "eingestellt" }))).toBe(2);
    expect(computeScoreSum(answers({ S6: "poc" }))).toBe(3);
  });

  it("normalizes with rounding (÷17)", () => {
    expect(normalizeScore(9)).toBe(53); // round(52.94)
    expect(normalizeScore(1)).toBe(6); // round(5.88)
    expect(normalizeScore(16)).toBe(94); // round(94.12)
  });
});

describe("computeBand", () => {
  it.each([
    [0, "feintuning"],
    [30, "feintuning"],
    [31, "spuerbar"],
    [60, "spuerbar"],
    [61, "akut"],
    [100, "akut"],
  ])("score %i → %s", (score, band) => {
    expect(computeBand(score)).toBe(band);
  });
});

describe("computeDimensions", () => {
  it("maps S2–S5 to their dimensions", () => {
    const dims = computeDimensions(
      answers({ S2: "meiste", S3: "viele", S4: "nichts", S5: "kaum" }),
    );
    expect(dims).toEqual({
      "uebergabe-stau": 2,
      "schnittstellen-luecke": 2,
      "wissens-monopol": 3,
      "mess-blindflug": 2,
    });
  });

  it("adds the S1 'weiß nicht' bonus to mess-blindflug only", () => {
    const dims = computeDimensions(answers({ S1: "unbekannt", S5: "teilweise" }));
    expect(dims["mess-blindflug"]).toBe(2); // S5=1 + bonus 1
  });
});

describe("computeTyp (tie-break: mess-blindflug > wissens-monopol > uebergabe-stau > schnittstellen-luecke)", () => {
  const typFor = (d: Partial<Record<Dimension, number>>): Dimension =>
    computeTyp({
      "mess-blindflug": 0,
      "wissens-monopol": 0,
      "uebergabe-stau": 0,
      "schnittstellen-luecke": 0,
      ...d,
    });

  it("picks the strict maximum", () => {
    expect(typFor({ "uebergabe-stau": 3, "mess-blindflug": 1 })).toBe("uebergabe-stau");
  });

  it("mess-blindflug wins any tie", () => {
    expect(typFor({ "mess-blindflug": 2, "schnittstellen-luecke": 2 })).toBe("mess-blindflug");
  });

  it("wissens-monopol beats uebergabe-stau and schnittstellen-luecke on a tie", () => {
    expect(typFor({ "wissens-monopol": 2, "uebergabe-stau": 2, "schnittstellen-luecke": 2 })).toBe(
      "wissens-monopol",
    );
  });

  it("uebergabe-stau beats schnittstellen-luecke on a tie", () => {
    expect(typFor({ "uebergabe-stau": 2, "schnittstellen-luecke": 2 })).toBe("uebergabe-stau");
  });

  it("defaults to mess-blindflug when all dimensions are zero", () => {
    expect(typFor({})).toBe("mess-blindflug");
  });
});

describe("computeWeg (ordered rule tree)", () => {
  it("rule 1: S5 ≥ 2 → stufe-0 (overrides everything, even high S4)", () => {
    const a = answers({ S5: "kaum", S4: "nichts" });
    expect(computeWeg(a, computeTyp(computeDimensions(a)))).toBe("stufe-0");
  });

  it("rule 1 via dimension: S1 'weiß nicht' bonus tips mess-blindflug to stufe-0 even when S5 alone is < 2", () => {
    const a = answers({ S1: "unbekannt", S5: "teilweise" }); // mess-blindflug dim = 1 + bonus 1 = 2
    expect(computeWeg(a, computeTyp(computeDimensions(a)))).toBe("stufe-0");
  });

  it("rule 2: S4 ≥ 2 (S5 < 2) → beschreiben", () => {
    const a = answers({ S4: "wenig", S5: "teilweise" });
    expect(computeWeg(a, computeTyp(computeDimensions(a)))).toBe("beschreiben");
  });

  it("rule 3: dominant uebergabe-stau (S5 < 2, S4 < 2) → weg-a", () => {
    const a = answers({ S2: "alle", S5: "teilweise" });
    expect(computeWeg(a, computeTyp(computeDimensions(a)))).toBe("weg-a");
  });

  it("rule 3: dominant schnittstellen-luecke → weg-a", () => {
    const a = answers({ S3: "fast-alles", S5: "teilweise" });
    expect(computeWeg(a, computeTyp(computeDimensions(a)))).toBe("weg-a");
  });

  it("rule 5: no handoff/interface dominance + IT baut regelmäßig → weg-c-denkbar", () => {
    // S6 drives the score but feeds no dimension → typ stays mess-blindflug at 0
    const a = answers({ S6: "poc", K4: "baut-regelmaessig" });
    expect(computeWeg(a, computeTyp(computeDimensions(a)))).toBe("weg-c-denkbar");
  });

  it("rule 4 fallback: no dominance + IT not C-fähig → weg-b", () => {
    const a = answers({ S6: "poc", K4: "infrastruktur" });
    expect(computeWeg(a, computeTyp(computeDimensions(a)))).toBe("weg-b");
  });
});

describe("isQualified (Setting-Stufe)", () => {
  const qualified = answers({
    K1: "vertriebsleiter",
    K2: "250-1000",
    K3: "ja-budget",
    K5: "quartal",
  });

  it("is true when role, size, mandate and timeframe all qualify", () => {
    expect(isQualified(qualified)).toBe(true);
  });

  it("qualifies when the timeframe is 'Dieses Jahr' (loosened #11)", () => {
    expect(isQualified({ ...qualified, K5: "jahr" })).toBe(true);
  });

  it.each([
    ["role", { K1: "it-leitung" }],
    ["size", { K2: "u50" }],
    ["mandate", { K3: "brach" }],
    ["timeframe", { K5: "kein-druck" }],
  ])("is false when %s disqualifies", (_label, override) => {
    expect(isQualified({ ...qualified, ...override })).toBe(false);
  });
});

describe("computeResult", () => {
  it("aggregates typ, weg, qualification and band into one result", () => {
    const a = answers({
      K1: "gf",
      K2: "50-250",
      K3: "treibe-selbst",
      K5: "halbjahr",
      S1: "2w-plus",
      S2: "alle",
      S5: "teilweise",
    });
    const result = computeResult(a);

    expect(result.typ).toBe("uebergabe-stau");
    expect(result.weg).toBe("weg-a");
    expect(result.qualified).toBe(true);
    expect(result.band).toBe(computeBand(result.score));
  });
});

describe("invariants (property-based)", () => {
  it("score ∈ [0,100], scoreSum ∈ [0,17], band matches score, typ is an argmax dimension", () => {
    fc.assert(
      fc.property(answersArb, (a) => {
        const r = computeResult(a);
        expect(r.scoreSum).toBeGreaterThanOrEqual(0);
        expect(r.scoreSum).toBeLessThanOrEqual(17);
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(100);
        expect(r.band).toBe(computeBand(r.score));

        const maxDim = Math.max(...Object.values(r.dimensions));
        expect(r.dimensions[r.typ]).toBe(maxDim);
        expect(typeof r.qualified).toBe("boolean");
      }),
      { numRuns: 3 },
    );
  });
});
