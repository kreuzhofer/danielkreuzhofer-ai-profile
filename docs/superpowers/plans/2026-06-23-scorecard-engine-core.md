# Scorecard Engine Core (M1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pure, config-driven scorecard scoring engine (scoring → outcome → qualification → next-lever → result), fully test-driven, with zero IO and no changes to existing code.

**Architecture:** A new `frontend/src/lib/scorecard/` module of referentially-transparent functions that take a `ScorecardDefinition` (config) + `Answers` and produce a `ScorecardResult`. Outcome resolution is a pluggable preset (`bands` | `argmax`). The Engpass-Check is untouched; this is additive.

**Tech Stack:** TypeScript, Jest, fast-check (property tests, `numRuns: 3`). Tests are co-located `*.test.ts`. Run from repo root with `npm test --prefix frontend -- <path>`.

**Design source:** `docs/superpowers/specs/2026-06-23-scorecard-engine-design.md`

**Scope note (M1):** Engine core only. The `result` carries scoring outputs (`rawSum`, `score`, `outcome`, `categoryScores`, `nextLever`, `qualified`). CleverReach attribute mapping (`kfc_*`) is deliberately **not** here — it is derived at sync time in M2 (separation of concerns; keeps the engine pure). `content`/`branding`/`meta` belong to the renderer (M3) and are not part of the engine contract.

---

### Task 1: Engine types + test fixture

**Files:**
- Create: `frontend/src/lib/scorecard/types.ts`
- Create: `frontend/src/lib/scorecard/__fixtures__/sample-definition.ts`

- [ ] **Step 1: Write `types.ts`**

```ts
/**
 * Generic scorecard engine — domain types.
 *
 * The engine is a pure rule-strecke: a ScorecardDefinition (config) + Answers
 * produce a ScorecardResult. No IO, no LLM, no randomness. Content/branding/meta
 * are renderer concerns and live with each scorecard, not in this contract.
 */

export interface AnswerOption {
  /** Stable id — the stored answer value. Never reorder/rename without a migration. */
  id: string;
  label: string;
  /** Score points (score questions only). */
  points?: number;
  /** Category/dimension this answer feeds (score questions only). */
  category?: string;
  /** Context questions: this answer counts toward qualification. */
  qualifies?: boolean;
  /** Context questions: the CRM attribute value this answer maps to (M2). */
  attributeValue?: string;
}

export interface Question {
  id: string;
  kind: "context" | "score";
  prompt: string;
  /** Score question → the category it feeds (defaults to a per-question dimension). */
  category?: string;
  /** Context question → the CRM attribute key, e.g. "kfc_rolle" (used in M2). */
  attributeKey?: string;
  options: AnswerOption[];
}

export type Answers = Record<string, string>; // questionId → optionId

export interface Band {
  key: string;
  min: number; // inclusive, on the normalized 0..100 score
  max: number; // inclusive
}

export type OutcomeConfig =
  | { type: "bands"; bands: Band[] }
  | {
      type: "argmax";
      over: "category";
      pick: "max" | "min";
      /** category key → outcome key */
      outcomes: Record<string, string>;
    };
// Future (same seam, not in v1): | { type: "rules"; rules: ... }

export interface NextLeverConfig {
  over: "category";
  pick: "min" | "max";
}

export interface QualificationConfig {
  /** Question ids whose selected option must be `qualifies: true` (AND). */
  requireQualifies: string[];
}

export interface ScorecardDefinition {
  slug: string;
  questions: Question[];
  scoring: {
    /** Max attainable raw points across score questions (for normalization). */
    maxPoints: number;
    /** Affects copy only, not math. */
    direction: "higher-better" | "higher-worse";
  };
  outcome: OutcomeConfig;
  nextLever?: NextLeverConfig;
  qualification: QualificationConfig;
  /** CRM attribute prefix, e.g. "kfc_" (used in M2). */
  attributePrefix: string;
}

export interface ScorecardResult {
  rawSum: number;
  /** Normalized 0..100. */
  score: number;
  /** Outcome key (a band key or an argmax outcome). */
  outcome: string;
  /** Per-category sums (omitted when the scorecard has no categories). */
  categoryScores?: Record<string, number>;
  /** Category key picked by nextLever (omitted when not configured). */
  nextLever?: string;
  qualified: boolean;
}
```

- [ ] **Step 2: Write the fixture `__fixtures__/sample-definition.ts`**

```ts
import type { ScorecardDefinition } from "../types";

/** A small KFC-shaped definition (2 context + 2 score questions, maxPoints 6). */
export const SAMPLE_DEFINITION: ScorecardDefinition = {
  slug: "sample",
  questions: [
    {
      id: "K1",
      kind: "context",
      prompt: "Rolle?",
      attributeKey: "x_rolle",
      options: [
        { id: "gf", label: "GF", qualifies: true, attributeValue: "gf" },
        { id: "team", label: "Team" },
      ],
    },
    {
      id: "K2",
      kind: "context",
      prompt: "Größe?",
      attributeKey: "x_groesse",
      options: [
        { id: "mid", label: "50–250", qualifies: true, attributeValue: "mid" },
        { id: "small", label: "unter 50" },
      ],
    },
    {
      id: "S1",
      kind: "score",
      prompt: "Eigennutzung?",
      category: "nutzung",
      options: [
        { id: "daily", label: "Täglich", points: 3 },
        { id: "weekly", label: "Wöchentlich", points: 2 },
        { id: "rare", label: "Selten", points: 1 },
        { id: "never", label: "Nie", points: 0 },
      ],
    },
    {
      id: "S2",
      kind: "score",
      prompt: "Sichtbarkeit?",
      category: "sichtbarkeit",
      options: [
        { id: "active", label: "Aktiv", points: 3 },
        { id: "some", label: "Einzelne", points: 2 },
        { id: "no", label: "Nein", points: 0 },
      ],
    },
  ],
  scoring: { maxPoints: 6, direction: "higher-better" },
  outcome: {
    type: "bands",
    bands: [
      { key: "einkaeufer", min: 0, max: 25 },
      { key: "verwalter", min: 26, max: 50 },
      { key: "mitmacher", min: 51, max: 75 },
      { key: "vorbild", min: 76, max: 100 },
    ],
  },
  nextLever: { over: "category", pick: "min" },
  qualification: { requireQualifies: ["K1", "K2"] },
  attributePrefix: "x_",
};
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit -p frontend/tsconfig.json 2>&1 | grep -i "lib/scorecard" || echo "scorecard clean"`
Expected: `scorecard clean`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/scorecard/types.ts frontend/src/lib/scorecard/__fixtures__/sample-definition.ts
git commit -m "feat(scorecard): engine types + test fixture"
```

---

### Task 2: Raw sum + normalize

**Files:**
- Create: `frontend/src/lib/scorecard/scoring.ts`
- Test: `frontend/src/lib/scorecard/scoring.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { SAMPLE_DEFINITION } from "./__fixtures__/sample-definition";
import { computeRawSum, normalizeScore } from "./scoring";

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/lib/scorecard/scoring.test.ts`
Expected: FAIL — "Cannot find module './scoring'" / functions not defined.

- [ ] **Step 3: Write minimal implementation in `scoring.ts`**

```ts
/**
 * Generic scorecard scoring — pure functions.
 */

import type { AnswerOption, Answers, Question, ScorecardDefinition } from "./types";

function selectedOption(q: Question, answers: Answers): AnswerOption | undefined {
  const optionId = answers[q.id];
  return optionId ? q.options.find((o) => o.id === optionId) : undefined;
}

/** Sum of `points` across score questions (0 for unanswered). Context never counts. */
export function computeRawSum(def: ScorecardDefinition, answers: Answers): number {
  return def.questions
    .filter((q) => q.kind === "score")
    .reduce((sum, q) => sum + (selectedOption(q, answers)?.points ?? 0), 0);
}

/** round(rawSum / maxPoints * 100); 0 when maxPoints <= 0. */
export function normalizeScore(rawSum: number, maxPoints: number): number {
  if (maxPoints <= 0) return 0;
  return Math.round((rawSum / maxPoints) * 100);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/lib/scorecard/scoring.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/scorecard/scoring.ts frontend/src/lib/scorecard/scoring.test.ts
git commit -m "feat(scorecard): raw sum + score normalization"
```

---

### Task 3: Per-category scores

**Files:**
- Modify: `frontend/src/lib/scorecard/scoring.ts`
- Modify: `frontend/src/lib/scorecard/scoring.test.ts`

- [ ] **Step 1: Add the failing test**

```ts
import { computeCategoryScores } from "./scoring";

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/lib/scorecard/scoring.test.ts`
Expected: FAIL — `computeCategoryScores` not exported.

- [ ] **Step 3: Add to `scoring.ts`**

```ts
/** Sum of `points` per category across score questions that declare one. */
export function computeCategoryScores(
  def: ScorecardDefinition,
  answers: Answers,
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const q of def.questions) {
    if (q.kind !== "score" || !q.category) continue;
    scores[q.category] = (scores[q.category] ?? 0) + (selectedOption(q, answers)?.points ?? 0);
  }
  return scores;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/lib/scorecard/scoring.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/scorecard/scoring.ts frontend/src/lib/scorecard/scoring.test.ts
git commit -m "feat(scorecard): per-category scores"
```

---

### Task 4: Outcome resolution — bands

**Files:**
- Create: `frontend/src/lib/scorecard/outcome.ts`
- Test: `frontend/src/lib/scorecard/outcome.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { resolveOutcome } from "./outcome";
import type { OutcomeConfig } from "./types";

const BANDS: OutcomeConfig = {
  type: "bands",
  bands: [
    { key: "einkaeufer", min: 0, max: 25 },
    { key: "verwalter", min: 26, max: 50 },
    { key: "mitmacher", min: 51, max: 75 },
    { key: "vorbild", min: 76, max: 100 },
  ],
};

describe("resolveOutcome — bands", () => {
  it.each([
    [0, "einkaeufer"],
    [25, "einkaeufer"],
    [26, "verwalter"],
    [50, "verwalter"],
    [51, "mitmacher"],
    [75, "mitmacher"],
    [76, "vorbild"],
    [100, "vorbild"],
  ])("score %i → %s", (score, key) => {
    expect(resolveOutcome(BANDS, { score, categoryScores: {} })).toBe(key);
  });

  it("throws (fail-fast) when no band matches the score", () => {
    const gappy: OutcomeConfig = { type: "bands", bands: [{ key: "a", min: 0, max: 10 }] };
    expect(() => resolveOutcome(gappy, { score: 50, categoryScores: {} })).toThrow(/no band/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/lib/scorecard/outcome.test.ts`
Expected: FAIL — module/function not found.

- [ ] **Step 3: Write minimal implementation in `outcome.ts`**

```ts
/**
 * Generic outcome resolution — pluggable presets (bands | argmax).
 * Fail-fast on misconfiguration (CLAUDE.md §3): a missing band/mapping throws.
 */

import type { OutcomeConfig } from "./types";

export interface OutcomeContext {
  score: number;
  categoryScores: Record<string, number>;
}

export function resolveOutcome(config: OutcomeConfig, ctx: OutcomeContext): string {
  if (config.type === "bands") {
    const band = config.bands.find((b) => ctx.score >= b.min && ctx.score <= b.max);
    if (!band) throw new Error(`No band matches score ${ctx.score}`);
    return band.key;
  }
  throw new Error(`Unsupported outcome type`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/lib/scorecard/outcome.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/scorecard/outcome.ts frontend/src/lib/scorecard/outcome.test.ts
git commit -m "feat(scorecard): outcome resolution — bands"
```

---

### Task 5: Outcome resolution — argmax

**Files:**
- Modify: `frontend/src/lib/scorecard/outcome.ts`
- Modify: `frontend/src/lib/scorecard/outcome.test.ts`

- [ ] **Step 1: Add the failing test**

```ts
describe("resolveOutcome — argmax", () => {
  const ARGMAX: OutcomeConfig = {
    type: "argmax",
    over: "category",
    pick: "max",
    outcomes: { nutzung: "doer", sichtbarkeit: "communicator" },
  };

  it("picks the outcome of the highest category", () => {
    expect(resolveOutcome(ARGMAX, { score: 0, categoryScores: { nutzung: 3, sichtbarkeit: 1 } })).toBe(
      "doer",
    );
  });

  it("pick:min selects the lowest category", () => {
    const min: OutcomeConfig = { ...ARGMAX, pick: "min" };
    expect(resolveOutcome(min, { score: 0, categoryScores: { nutzung: 3, sichtbarkeit: 1 } })).toBe(
      "communicator",
    );
  });

  it("ties resolve to the first category in iteration order", () => {
    expect(resolveOutcome(ARGMAX, { score: 0, categoryScores: { nutzung: 2, sichtbarkeit: 2 } })).toBe(
      "doer",
    );
  });

  it("throws when there are no category scores", () => {
    expect(() => resolveOutcome(ARGMAX, { score: 0, categoryScores: {} })).toThrow(/categor/i);
  });

  it("throws when the winning category has no mapped outcome", () => {
    const bad: OutcomeConfig = { ...ARGMAX, outcomes: { sichtbarkeit: "communicator" } };
    expect(() => resolveOutcome(bad, { score: 0, categoryScores: { nutzung: 3 } })).toThrow(/outcome/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/lib/scorecard/outcome.test.ts`
Expected: FAIL — argmax branch throws "Unsupported outcome type".

- [ ] **Step 3: Replace the `throw` branch in `outcome.ts`**

Replace the final `throw new Error(\`Unsupported outcome type\`);` with:

```ts
  // argmax
  const entries = Object.entries(ctx.categoryScores);
  if (entries.length === 0) throw new Error("argmax outcome needs category scores");
  const winner = entries.reduce((best, cur) =>
    config.pick === "max"
      ? cur[1] > best[1]
        ? cur
        : best
      : cur[1] < best[1]
        ? cur
        : best,
  );
  const key = config.outcomes[winner[0]];
  if (!key) throw new Error(`No outcome mapped for category ${winner[0]}`);
  return key;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/lib/scorecard/outcome.test.ts`
Expected: PASS (14 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/scorecard/outcome.ts frontend/src/lib/scorecard/outcome.test.ts
git commit -m "feat(scorecard): outcome resolution — argmax"
```

---

### Task 6: Qualification

**Files:**
- Create: `frontend/src/lib/scorecard/qualification.ts`
- Test: `frontend/src/lib/scorecard/qualification.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { SAMPLE_DEFINITION } from "./__fixtures__/sample-definition";
import { isQualified } from "./qualification";

describe("isQualified", () => {
  it("is true when every required question's answer qualifies", () => {
    expect(isQualified(SAMPLE_DEFINITION, { K1: "gf", K2: "mid" })).toBe(true);
  });

  it.each([
    ["K1 disqualifies", { K1: "team", K2: "mid" }],
    ["K2 disqualifies", { K1: "gf", K2: "small" }],
    ["K1 unanswered", { K2: "mid" }],
  ])("is false when %s", (_label, answers) => {
    expect(isQualified(SAMPLE_DEFINITION, answers)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/lib/scorecard/qualification.test.ts`
Expected: FAIL — module/function not found.

- [ ] **Step 3: Write `qualification.ts`**

```ts
/**
 * Generic qualification — AND over the required questions' `qualifies` flag.
 */

import type { Answers, ScorecardDefinition } from "./types";

export function isQualified(def: ScorecardDefinition, answers: Answers): boolean {
  return def.qualification.requireQualifies.every((qid) => {
    const q = def.questions.find((x) => x.id === qid);
    const opt = q?.options.find((o) => o.id === answers[qid]);
    return opt?.qualifies === true;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/lib/scorecard/qualification.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/scorecard/qualification.ts frontend/src/lib/scorecard/qualification.test.ts
git commit -m "feat(scorecard): qualification logic"
```

---

### Task 7: Next lever (weakest/strongest category)

**Files:**
- Create: `frontend/src/lib/scorecard/next-lever.ts`
- Test: `frontend/src/lib/scorecard/next-lever.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { computeNextLever } from "./next-lever";

describe("computeNextLever", () => {
  it("pick:min returns the lowest-scoring category", () => {
    expect(computeNextLever({ over: "category", pick: "min" }, { nutzung: 3, sichtbarkeit: 0 })).toBe(
      "sichtbarkeit",
    );
  });

  it("pick:max returns the highest-scoring category", () => {
    expect(computeNextLever({ over: "category", pick: "max" }, { nutzung: 3, sichtbarkeit: 0 })).toBe(
      "nutzung",
    );
  });

  it("ties resolve to the first category in iteration order", () => {
    expect(computeNextLever({ over: "category", pick: "min" }, { a: 2, b: 2 })).toBe("a");
  });

  it("returns undefined when there are no categories", () => {
    expect(computeNextLever({ over: "category", pick: "min" }, {})).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/lib/scorecard/next-lever.test.ts`
Expected: FAIL — module/function not found.

- [ ] **Step 3: Write `next-lever.ts`**

```ts
/**
 * Generic "next lever" — the weakest (or strongest) category, used to point the
 * lead at their most impactful next step. Ties resolve to the first category.
 */

import type { NextLeverConfig } from "./types";

export function computeNextLever(
  config: NextLeverConfig,
  categoryScores: Record<string, number>,
): string | undefined {
  const entries = Object.entries(categoryScores);
  if (entries.length === 0) return undefined;
  const winner = entries.reduce((best, cur) =>
    config.pick === "min"
      ? cur[1] < best[1]
        ? cur
        : best
      : cur[1] > best[1]
        ? cur
        : best,
  );
  return winner[0];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/lib/scorecard/next-lever.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/scorecard/next-lever.ts frontend/src/lib/scorecard/next-lever.test.ts
git commit -m "feat(scorecard): next-lever (weakest/strongest category)"
```

---

### Task 8: Result builder (orchestration)

**Files:**
- Create: `frontend/src/lib/scorecard/result.ts`
- Test: `frontend/src/lib/scorecard/result.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { SAMPLE_DEFINITION } from "./__fixtures__/sample-definition";
import { buildResult } from "./result";

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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/lib/scorecard/result.test.ts`
Expected: FAIL — module/function not found.

- [ ] **Step 3: Write `result.ts`**

```ts
/**
 * Generic scorecard result — orchestrates the pure engine pieces into the
 * ScorecardResult that gets denormalized into `result jsonb` (M2).
 */

import type { Answers, ScorecardDefinition, ScorecardResult } from "./types";
import { computeCategoryScores, computeRawSum, normalizeScore } from "./scoring";
import { resolveOutcome } from "./outcome";
import { computeNextLever } from "./next-lever";
import { isQualified } from "./qualification";

export function buildResult(def: ScorecardDefinition, answers: Answers): ScorecardResult {
  const rawSum = computeRawSum(def, answers);
  const score = normalizeScore(rawSum, def.scoring.maxPoints);
  const categoryScores = computeCategoryScores(def, answers);
  const hasCategories = Object.keys(categoryScores).length > 0;
  const outcome = resolveOutcome(def.outcome, { score, categoryScores });
  const nextLever =
    def.nextLever && hasCategories ? computeNextLever(def.nextLever, categoryScores) : undefined;

  return {
    rawSum,
    score,
    outcome,
    categoryScores: hasCategories ? categoryScores : undefined,
    nextLever,
    qualified: isQualified(def, answers),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/lib/scorecard/result.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/scorecard/result.ts frontend/src/lib/scorecard/result.test.ts
git commit -m "feat(scorecard): result builder (orchestration)"
```

---

### Task 9: Result invariants (property-based)

**Files:**
- Modify: `frontend/src/lib/scorecard/result.test.ts`

- [ ] **Step 1: Add the failing property test**

```ts
import fc from "fast-check";

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
```

- [ ] **Step 2: Run test to verify it fails (or passes meaningfully)**

Run: `npm test --prefix frontend -- src/lib/scorecard/result.test.ts`
Expected: PASS if invariants already hold (this guards them); if a generated case throws (e.g. a band gap), that's a real bug to fix in `outcome.ts`/the fixture. The SAMPLE bands are exhaustive over 0..100, so expect PASS.

> Note: this property test exercises existing behavior, so it may pass immediately. That is acceptable here — its purpose is a regression guard on the invariants, and the engine functions it covers were each built test-first in Tasks 2–8.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/scorecard/result.test.ts
git commit -m "test(scorecard): result invariants (property-based)"
```

---

### Task 10: Module barrel + verification

**Files:**
- Create: `frontend/src/lib/scorecard/index.ts`

- [ ] **Step 1: Write the barrel `index.ts`**

```ts
export * from "./types";
export { computeRawSum, normalizeScore, computeCategoryScores } from "./scoring";
export { resolveOutcome, type OutcomeContext } from "./outcome";
export { isQualified } from "./qualification";
export { computeNextLever } from "./next-lever";
export { buildResult } from "./result";
```

- [ ] **Step 2: Run the full scorecard suite + lint + typecheck**

Run: `npm test --prefix frontend -- src/lib/scorecard`
Expected: PASS (all suites green).

Run: `cd frontend && npx eslint src/lib/scorecard && cd ..`
Expected: clean (exit 0).

Run: `npx tsc --noEmit -p frontend/tsconfig.json 2>&1 | grep -i "lib/scorecard" || echo "scorecard clean"`
Expected: `scorecard clean`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/scorecard/index.ts
git commit -m "feat(scorecard): public barrel for the engine core"
```

---

## Follow-on plans (not in this plan)

These get their own detailed plans once M1 lands (and, for M3, once you approve the KFC content):

- **M2 — Funnel backend:** `scorecard_submissions` Drizzle table + additive migration + repo; `POST /api/scorecard/[slug]/submit` (server-side re-`buildResult` over untrusted answers, persist, send DOI mail); `GET /api/scorecard/confirm?token=` (confirm → delivery mail Variante A/B by `qualified` → CleverReach push, deriving `kfc_*` attributes from result+answers+definition); registry (`src/scorecards/*`); retention purge extended; rate-limiting. Reuses `src/lib/email`, the CleverReach client, and the `confirm.ts`/token patterns.
- **M3 — Renderer + KFC live:** generic `ScorecardApp`/`ResultScreen` (config + content-block driven, branded via CSS variables); `app/[scorecardSlug]/page.tsx` with `generateStaticParams` from the registry; KFC `definition.ts` + `content.ts` + `branding.ts`; Datenschutz section. Gated on KFC content approval (vault spec is draft-v1).

## Self-Review

- **Spec coverage (M1 scope):** scoring ✓ (Tasks 2–3), outcome bands+argmax ✓ (Tasks 4–5), qualification ✓ (Task 6), next-lever ✓ (Task 7), result builder + invariants ✓ (Tasks 8–9), types/contract ✓ (Task 1). Persistence/API/renderer/KFC are explicitly M2/M3.
- **Placeholders:** none — every step has complete code or an exact command.
- **Type consistency:** `ScorecardDefinition`, `Answers`, `OutcomeConfig`, `OutcomeContext`, `ScorecardResult`, `NextLeverConfig` and the function names (`computeRawSum`, `normalizeScore`, `computeCategoryScores`, `resolveOutcome`, `isQualified`, `computeNextLever`, `buildResult`) are defined in Task 1 / first-use and reused consistently; the barrel (Task 10) re-exports exactly those.
