# DSGVO-Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the DSGVO-Check — a dynamic scorecard that, from ~8 questions, returns a readiness Ampel + a per-tool DSGVO traffic-light matrix + a personalized action plan.

**Architecture:** Approach A from the spec (`docs/superpowers/specs/2026-06-24-dsgvo-check-design.md`): reuse the generic scorecard engine for all infra; add the domain logic as custom code isolated in `frontend/src/scorecards/dsgvo-check/`. The engine gets four small, optional, backward-compatible seams (multi-select answers, a `resolve` hook, custom `ResultView`/`ReportDoc` components, a `cleverreachTags` hook). `DsgvoResult extends ScorecardResult`, so it persists in the existing `result jsonb` column with **no migration**.

**Tech Stack:** Next.js 16 / React 19 / TypeScript, Jest + fast-check, Drizzle (no schema migration), existing scorecard funnel (DOI, nodemailer/Handlebars, CleverReach).

**Run tests from `frontend/`:** `npm test --prefix frontend -- <path>`. Lint: `npm run lint --prefix frontend`. Build: `npm run build:local --prefix frontend`.

**Source of all facts (Milestone 2 data):** `/Users/daniel/Documents/vault/04-content/video/07-5-hebel-mit-denen-du-ki-fuehrst/DSGVO- und EU-AI-Act-Konformität gängiger KI-Tools – Bestandsaufnahme Juni 2026.md`.

---

## Milestone 1 — Engine seams (shared, backward-compatible)

Existing scorecards (KFC) and the old Engpass bespoke path must stay green throughout. All seams are additive/optional.

### Task 1: Widen `Answers` for multi-select + guard the pure readers

**Files:**
- Modify: `frontend/src/lib/scorecard/types.ts` (Answers, Question.kind)
- Modify: `frontend/src/lib/scorecard/scoring.ts:7-10` (guard)
- Modify: `frontend/src/lib/scorecard/report-model.ts` (~line 40 personalisierung guard)
- Modify: `frontend/src/db/schema.ts:69` (answers `$type`)
- Test: `frontend/src/lib/scorecard/scoring.test.ts` (add a case)

- [ ] **Step 1: Write the failing test** — append to `scoring.test.ts`:

```ts
import { computeRawSum } from "./scoring";
import type { ScorecardDefinition } from "./types";

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- scoring.test.ts`
Expected: FAIL — `kind: "multi"` not assignable / type error on `["x","y"]` (Answers is `Record<string,string>`).

- [ ] **Step 3: Widen the types.** In `types.ts`, change the `Question.kind` union and `Answers`:

```ts
export interface Question {
  id: string;
  kind: "context" | "score" | "multi";
  // ...unchanged...
}

export type Answers = Record<string, string | string[]>; // questionId → optionId | optionIds
```

In `scoring.ts`, guard `selectedOption` so array values never match an option:

```ts
function selectedOption(q: Question, answers: Answers): AnswerOption | undefined {
  const optionId = answers[q.id];
  if (typeof optionId !== "string") return undefined; // multi-select never feeds scoring
  return q.options.find((o) => o.id === optionId);
}
```

In `report-model.ts`, guard the personalisierung lookup (find the block that reads `answers[c.personalisierung.questionId]`):

```ts
  if (c.personalisierung) {
    const answer = answers[c.personalisierung.questionId];
    if (typeof answer === "string") {
      const para = c.personalisierung.byAnswer[answer];
      if (para) bedeutung.push(para);
      bedeutungLink = c.personalisierung.linkByAnswer?.[answer];
    }
  }
```

In `schema.ts:69`, widen the answers column `$type`:

```ts
    answers: jsonb("answers").notNull().$type<Record<string, string | string[]>>(),
```

- [ ] **Step 4: Run tests**

Run: `npm test --prefix frontend -- scoring.test.ts report-model.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the whole scorecard + KFC suite to confirm no regression**

Run: `npm test --prefix frontend -- src/lib/scorecard src/scorecards`
Expected: PASS (KFC unaffected).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/scorecard/types.ts frontend/src/lib/scorecard/scoring.ts frontend/src/lib/scorecard/report-model.ts frontend/src/db/schema.ts frontend/src/lib/scorecard/scoring.test.ts
git commit -m "feat(scorecard): widen Answers for multi-select questions (kind: multi)"
```

---

### Task 2: Registry seams + `resolveResult` dispatcher

**Files:**
- Modify: `frontend/src/lib/scorecard/registry.ts` (add optional fields + view-prop types)
- Modify: `frontend/src/lib/scorecard/result.ts` (add `resolveResult`)
- Test: `frontend/src/lib/scorecard/result.test.ts` (add cases)

- [ ] **Step 1: Write the failing test** — append to `result.test.ts`:

```ts
import { resolveResult } from "./result";
import type { ScorecardRegistration } from "./registry";

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- result.test.ts`
Expected: FAIL — `resolveResult` is not exported; `resolve` not on `ScorecardRegistration`.

- [ ] **Step 3: Add the seams.** In `registry.ts`, add a React type import and the optional fields to `ScorecardRegistration`:

```ts
import type { ComponentType } from "react";
import type { Answers, ScorecardDefinition, ScorecardResult } from "./types";
// ...existing imports (content, branding)...

/** Props a custom result view receives (free result screen). */
export interface ScorecardResultViewProps {
  registration: ScorecardRegistration;
  answers: Answers;
  result: ScorecardResult;
}

/** Props a custom gated report-doc receives. */
export interface ScorecardReportDocProps {
  registration: ScorecardRegistration;
  result: ScorecardResult;
  answers: Answers;
}

export interface ScorecardRegistration {
  // ...existing required fields unchanged...
  /** Custom result computation; overrides the generic engine when present. */
  resolve?: (answers: Answers) => ScorecardResult;
  /** Custom free-result view; replaces the generic report-card slot when present. */
  ResultView?: ComponentType<ScorecardResultViewProps>;
  /** Custom gated report document; replaces ScorecardReportDoc when present. */
  ReportDoc?: ComponentType<ScorecardReportDocProps>;
  /** Extra CleverReach tags derived from the stored result + answers. */
  cleverreachTags?: (result: ScorecardResult, answers: Answers) => string[];
}
```

In `result.ts`, add the dispatcher (type-only import of the registration to avoid a runtime cycle):

```ts
import type { ScorecardRegistration } from "./registry";

/** Use the scorecard's custom resolver if it has one; otherwise the generic engine. */
export function resolveResult(reg: ScorecardRegistration, answers: Answers): ScorecardResult {
  return reg.resolve ? reg.resolve(answers) : buildResult(reg.definition, answers);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test --prefix frontend -- result.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/scorecard/registry.ts frontend/src/lib/scorecard/result.ts frontend/src/lib/scorecard/result.test.ts
git commit -m "feat(scorecard): add resolve/ResultView/ReportDoc/cleverreachTags registry seams"
```

---

### Task 3: Submit route — accept multi-select answers, use `resolveResult`

**Files:**
- Modify: `frontend/src/app/api/scorecard/[slug]/submit/route.ts:38-50,99,108`
- Test: `frontend/src/app/api/scorecard/[slug]/submit/route.test.ts`

- [ ] **Step 1: Write the failing test** — add a case asserting an answers object with an array value is accepted (mirror the existing test setup in this file for mocking DB/email; reuse its helpers):

```ts
test("accepts answers containing string[] values (multi-select)", () => {
  // isValidBody is the boundary guard under test; import it if exported,
  // otherwise assert via the POST handler returning non-400 for a valid array body.
  const body = { email: "a@b.de", answers: { Q_TOOLS: ["chatgpt", "claude"], C1: "gf" } };
  expect(isValidBody(body)).toBe(true);
});

test("rejects answers with a non-string array element", () => {
  expect(isValidBody({ email: "a@b.de", answers: { Q: [1, 2] } })).toBe(false);
});
```

(If `isValidBody` is not currently exported, add `export` to it in the route file.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- submit/route.test.ts`
Expected: FAIL — current `isValidBody` rejects array values (line 49 requires `typeof v === "string"`).

- [ ] **Step 3: Relax the boundary + use the dispatcher.** In `route.ts`:

Change the `SubmitBody.answers` and validation:

```ts
interface SubmitBody {
  email: string;
  answers: Record<string, string | string[]>;
  tid?: string;
}

const MAX_ANSWERS = 100;
const MAX_MULTI = 30; // upper bound on selected options per multi question

export function isValidBody(body: unknown): body is SubmitBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.email !== "string") return false;
  if (b.tid !== undefined && typeof b.tid !== "string") return false;
  const answers = b.answers;
  if (typeof answers !== "object" || answers === null || Array.isArray(answers)) return false;
  const entries = Object.entries(answers as Record<string, unknown>);
  if (entries.length > MAX_ANSWERS) return false;
  return entries.every(([, v]) => {
    if (typeof v === "string") return true;
    return Array.isArray(v) && v.length <= MAX_MULTI && v.every((e) => typeof e === "string");
  });
}
```

Replace the result computation + insert cast:

```ts
import { resolveResult } from "@/lib/scorecard/result";
// ...
  const result = resolveResult(registration, body.answers);
// ...
      answers: body.answers,
```

(Remove the now-unused `buildResult` import and the `as Record<string, string>` cast.)

- [ ] **Step 4: Run tests**

Run: `npm test --prefix frontend -- submit/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/api/scorecard/[slug]/submit/route.ts frontend/src/app/api/scorecard/[slug]/submit/route.test.ts
git commit -m "feat(scorecard): submit route accepts multi-select answers + custom resolver"
```

---

### Task 4: confirm.ts — append custom CleverReach tags

**Files:**
- Modify: `frontend/src/lib/scorecard/confirm.ts:60`
- Test: `frontend/src/lib/scorecard/confirm.test.ts`

- [ ] **Step 1: Write the failing test** — add a case (reuse the file's existing CleverReach mock) asserting that when the registration has `cleverreachTags`, the pushed tags include the extra ones. Pattern:

```ts
test("appends registration.cleverreachTags to the CleverReach push", async () => {
  // Arrange a registered scorecard whose cleverreachTags returns ["tool:chatgpt"].
  // Confirm a pending submission, then assert addConfirmedNewsletterLead was called
  // with tags containing "tool:chatgpt" (alongside the base [slug] tag).
  // Use the same mocking style as the existing confirm.test.ts cases.
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- confirm.test.ts`
Expected: FAIL — extra tags not present.

- [ ] **Step 3: Implement.** In `confirm.ts`, replace the tag construction inside the `isCleverReachConfigured()` block:

```ts
      const baseTags = qualified
        ? [submission.scorecard, `${submission.scorecard}-qualified`]
        : [submission.scorecard];
      const extra = reg?.cleverreachTags?.(submission.result, submission.answers) ?? [];
      const tags = [...baseTags, ...extra];
      await addConfirmedNewsletterLead({ email: submission.email, tags, source });
```

- [ ] **Step 4: Run tests**

Run: `npm test --prefix frontend -- confirm.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/scorecard/confirm.ts frontend/src/lib/scorecard/confirm.test.ts
git commit -m "feat(scorecard): confirm appends registration.cleverreachTags"
```

---

### Task 5: ScorecardApp — multi-select quiz UI + custom ResultView branch

**Files:**
- Modify: `frontend/src/components/scorecard/ScorecardApp.tsx`
- Test: `frontend/src/components/scorecard/ScorecardApp.test.tsx`

- [ ] **Step 1: Write the failing tests** — add to `ScorecardApp.test.tsx`:

```tsx
test("multi-select question toggles options and advances only via Weiter", async () => {
  // Render a registration whose first question is { kind: "multi", options: x,y }.
  // Click option x → it becomes aria-checked, still on the same question.
  // Click "Weiter" → advances to the next question (or result).
});

test("renders registration.ResultView instead of the generic report at result phase", async () => {
  // Registration with a ResultView that renders data-testid="custom-result".
  // Answer through to result phase, assert custom-result is in the document
  // and OptIn email field is still present.
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- ScorecardApp.test.tsx`
Expected: FAIL — no toggle behavior; ResultView not honored.

- [ ] **Step 3: Implement.** In `ScorecardApp.tsx`:

Extend the `Action` union and reducer:

```ts
type Action =
  | { type: "start" }
  | { type: "answer"; questionId: string; optionId: string }
  | { type: "toggle"; questionId: string; optionId: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" }
  | { type: "hydrate"; state: State };
```

Add the `toggle` and `next` cases to the reducer (place before `back`):

```ts
      case "toggle": {
        const cur = state.answers[action.questionId];
        const arr = Array.isArray(cur) ? cur : [];
        const next = arr.includes(action.optionId)
          ? arr.filter((x) => x !== action.optionId)
          : [...arr, action.optionId];
        return { ...state, answers: { ...state.answers, [action.questionId]: next } };
      }
      case "next": {
        const isLast = state.index >= total - 1;
        return isLast
          ? { phase: "result", index: state.index, answers: state.answers }
          : { phase: "quiz", index: state.index + 1, answers: state.answers };
      }
```

In the `quiz` render branch, pass the new handlers to `Quiz`:

```tsx
          <Quiz
            question={questions[state.index]}
            index={state.index}
            total={total}
            answers={state.answers}
            onAnswer={(optionId) =>
              dispatch({ type: "answer", questionId: questions[state.index].id, optionId })
            }
            onToggle={(optionId) =>
              dispatch({ type: "toggle", questionId: questions[state.index].id, optionId })
            }
            onNext={() => dispatch({ type: "next" })}
            onBack={() => dispatch({ type: "back" })}
          />
```

Rewrite the `Quiz` component to branch on `question.kind === "multi"`:

```tsx
function Quiz({
  question, index, total, answers, onAnswer, onToggle, onNext, onBack,
}: {
  question: Question;
  index: number;
  total: number;
  answers: Answers;
  onAnswer: (optionId: string) => void;
  onToggle: (optionId: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const progress = Math.round(((index + 1) / total) * 100);
  const isMulti = question.kind === "multi";
  const raw = answers[question.id];
  const multiSelected = Array.isArray(raw) ? raw : [];
  const singleSelected = typeof raw === "string" ? raw : undefined;

  return (
    <section className="sc-card sc-quiz" aria-labelledby="sc-question">
      <div className="sc-progress">
        <div className="sc-progress-bar">
          <span className="sc-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="sc-progress-label">
          Frage {index + 1} <span aria-hidden="true">/</span> {total}
        </p>
      </div>

      <h2 id="sc-question" className="sc-question">{question.prompt}</h2>

      <div
        className="sc-options"
        role={isMulti ? "group" : "radiogroup"}
        aria-labelledby="sc-question"
      >
        {question.options.map((option) => {
          const isSelected = isMulti
            ? multiSelected.includes(option.id)
            : singleSelected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role={isMulti ? "checkbox" : "radio"}
              aria-checked={isSelected}
              className={`sc-option${isSelected ? " is-selected" : ""}`}
              onClick={() => (isMulti ? onToggle(option.id) : onAnswer(option.id))}
            >
              <span className="sc-option-dot" aria-hidden="true" />
              <span className="sc-option-label">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sc-quiz-nav">
        <button type="button" className="sc-btn sc-btn-ghost" onClick={onBack}>
          ← Zurück
        </button>
        {isMulti ? (
          <button
            type="button"
            className="sc-btn sc-btn-primary"
            onClick={onNext}
            disabled={multiSelected.length === 0}
          >
            Weiter →
          </button>
        ) : (
          <p className="sc-quiz-hint">Tippe eine Antwort an — es geht sofort weiter.</p>
        )}
      </div>
    </section>
  );
}
```

In the `Result` component, compute the result once via `resolveResult` and branch on `registration.ResultView`:

```tsx
import { resolveResult } from "@/lib/scorecard/result";
// ...
function Result({ registration, answers, onBack, onRestart }: { /* unchanged */ }) {
  const { definition, content } = registration;
  const result = useMemo(() => resolveResult(registration, answers), [registration, answers]);
  const ResultView = registration.ResultView;
  const model = useMemo(
    () => (ResultView ? null : buildScorecardReport(registration, result, answers)),
    [ResultView, registration, result, answers],
  );

  return (
    <section className="sc-result" aria-label={content.resultHeading}>
      <div className="sc-card sc-report-card">
        <p className="sc-eyebrow">{content.resultHeading}</p>
        {ResultView ? (
          <ResultView registration={registration} answers={answers} result={result} />
        ) : (
          <ScorecardReportView model={model!} labels={DEFAULT_REPORT_LABELS} />
        )}
        <div className="sc-result-nav">
          <button type="button" className="sc-btn sc-btn-ghost" onClick={onBack}>← Antworten ändern</button>
          <button type="button" className="sc-btn sc-btn-ghost" onClick={onRestart}>Neu starten</button>
        </div>
      </div>
      <OptIn slug={definition.slug} answers={answers} content={content} />
      {content.video && <VideoVerweis video={content.video} />}
    </section>
  );
}
```

(Remove the now-unused direct `buildResult` import if no longer referenced.)

- [ ] **Step 4: Run tests**

Run: `npm test --prefix frontend -- ScorecardApp.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the full component + KFC suite (no regression)**

Run: `npm test --prefix frontend -- src/components/scorecard src/scorecards`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/scorecard/ScorecardApp.tsx frontend/src/components/scorecard/ScorecardApp.test.tsx
git commit -m "feat(scorecard): multi-select quiz UI + custom ResultView support"
```

---

### Task 6: Report page — custom ReportDoc branch

**Files:**
- Modify: `frontend/src/app/[scorecardSlug]/report/page.tsx`

- [ ] **Step 1: Add the branch.** After resolving `reg` (and before the generic `buildScorecardReport` try/catch), short-circuit to the custom doc when present:

```tsx
  const reg = getScorecard(scorecardSlug);
  if (!reg) notFound();

  if (reg.ReportDoc) {
    const ReportDoc = reg.ReportDoc;
    return (
      <div className="sc-doc">
        <header className="scd-header">
          <div className="scd-header-inner">
            <Link href="/" className="scd-brand" aria-label={`Zur Startseite von ${reg.branding.brandAuthor}`}>
              <span className="scd-brand-name">{reg.branding.brandName}</span>
              <span className="scd-brand-sub">{reg.branding.brandAuthor} · Report</span>
            </Link>
            <PrintButton label="Als PDF speichern" />
          </div>
        </header>
        <ReportDoc registration={reg} result={submission.result} answers={submission.answers} />
      </div>
    );
  }

  // ...existing generic buildScorecardReport path unchanged...
```

- [ ] **Step 2: Verify it compiles + existing report tests pass**

Run: `npm run lint --prefix frontend` then `npm test --prefix frontend -- src/app/api/scorecard`
Expected: lint clean; tests PASS. (No new unit test here — covered by the build + Milestone 4 smoke. The branch is exercised once the DSGVO registration exists.)

- [ ] **Step 3: Commit**

```bash
git add "frontend/src/app/[scorecardSlug]/report/page.tsx"
git commit -m "feat(scorecard): report route renders custom ReportDoc when registered"
```

---

## Milestone 2 — Domain logic: facts + recommend (the heart)

Pure, no IO. This is where TDD pays off most.

### Task 7: DSGVO domain types + `facts.ts`

**Files:**
- Create: `frontend/src/scorecards/dsgvo-check/types.ts`
- Create: `frontend/src/scorecards/dsgvo-check/facts.ts`

- [ ] **Step 1: Write the types.** Create `types.ts`:

```ts
import type { ScorecardResult } from "@/lib/scorecard/types";

export type Verdict = "gruen" | "gelb" | "rot";
export type Ampel = Verdict;
export type RiskClass = "minimal" | "begrenzt" | "hoch";
/** Global tier chosen by the user (Q_TIER). */
export type Tier = "free" | "business" | "cloud" | "gemischt";

export interface TierFact {
  verdict: Verdict;
  reason: string;
  upgradePath?: string;
  dpaUrl?: string;
}

export interface ToolFact {
  label: string;
  vendor: string;
  country: string;
  isEU: boolean;
  /** US-hosted direct offering (drives the SCCs/TIA action when DPF is unstable). */
  usDirect: boolean;
  /** Open tier map keyed by tier-id; not every tool has every tier. */
  tiers: Partial<Record<Exclude<Tier, "gemischt">, TierFact>>;
  /** Per-tool override that beats tier + global overlays (DeepSeek, local). */
  override?: { verdict: Verdict; reason: string };
  /** Time-sensitive note surfaced as a caveat (e.g. pending acquisition). */
  caveat?: string;
  source: { url: string; asOf: string };
}

export interface ToolVerdict {
  toolId: string;
  label: string;
  verdict: Verdict;
  reason: string;
  upgradePath?: string;
  dpaUrl?: string;
  caveat?: string;
}

export interface ActionItem {
  priority: number; // lower = more urgent
  title: string;
  detail: string;
}

export interface DsgvoResult extends ScorecardResult {
  ampel: Ampel;
  toolMatrix: ToolVerdict[];
  riskClass: RiskClass;
  riskObligations: string[];
  actionPlan: ActionItem[];
  shadowAiFlag: boolean;
  usTransferFlag: boolean;
  rechtsstand: string;
}
```

- [ ] **Step 2: Write `facts.ts`** transcribing the fact-check doc. Create `facts.ts` with the exact shape below. **Transcribe every tool from the source doc** — the complete required set is: `chatgpt`, `claude`, `gemini`, `copilot`, `mistral`, `alephalpha`, `deepseek`, `local`. Two fully-worked entries are given as the canonical pattern; fill the rest from the source table (verdict/reason/upgradePath/dpaUrl per tier, `asOf` per the doc's Stand column):

```ts
import type { ToolFact } from "./types";

/** Rechtsstand — drives the Aktualitäts-Badge. Bump on every fact refresh. */
export const RECHTSSTAND = "2026-06";

/** DPF: valid but unstable (PCLOB no quorum, FISA-702 45-day, Latombe CJEU appeal). */
export const DPF_STATUS = {
  valid: true,
  stable: false,
  note: "DPF gilt, ist aber instabil (PCLOB ohne Quorum, FISA-702 nur verlängert, Latombe-Berufung am CJEU ohne Termin). EU-Residenz bevorzugen, SCCs+TIA als Fallback.",
  asOf: "2026-06",
} as const;

export const AI_ACT_TIMELINE = [
  { date: "2025-02-02", item: "Verbotene Praktiken (Art. 5)", status: "in Kraft; Omnibus ergänzt Deepfake-/CSAM-Verbote" },
  { date: "2025-02-02", item: "KI-Literacy-Pflicht (Art. 4)", status: "in Kraft; gilt für alle Betreiber, auch KMU" },
  { date: "2025-08-02", item: "GPAI-Pflichten (Art. 51–55)", status: "in Kraft (Modell-Anbieter)" },
  { date: "2027-12-02", item: "Hochrisiko Annex III (u.a. Beschäftigung/HR)", status: "verschoben via Digital Omnibus (Parlament 16.06.2026); Ratifikation ~Juli 2026 ausstehend" },
  { date: "2028-08-02", item: "Hochrisiko Annex I (Produkte)", status: "verschoben via Digital Omnibus" },
  { date: "2026-08-02", item: "Transparenzpflicht (Art. 50, Basis)", status: "in Kraft; Wasserzeichenpflicht → 2026-12-02" },
] as const;

export const TOOLS: Record<string, ToolFact> = {
  chatgpt: {
    label: "ChatGPT (OpenAI)", vendor: "OpenAI", country: "USA", isEU: false, usDirect: true,
    tiers: {
      free: { verdict: "rot", reason: "Kein vollwertiger AVV, keine EU-Inferenz, Verarbeitung in den USA.", upgradePath: "Auf Team/Enterprise/API mit EU-Region wechseln." },
      business: { verdict: "gruen", reason: "Enterprise/API mit EU-Data-Residency + EU-Inferenz (seit Jan. 2026); DPA aktiv konfigurieren.", dpaUrl: "https://openai.com/de-DE/index/introducing-data-residency-in-europe/" },
      cloud: { verdict: "gruen", reason: "Azure OpenAI „Data Zone Standard (EUR)"; Microsoft DPA automatisch.", dpaUrl: "https://learn.microsoft.com/en-au/answers/questions/2262985/azure-openai-service-in-europe" },
    },
    source: { url: "https://openai.com/de-DE/index/introducing-data-residency-in-europe/", asOf: "2026-04" },
  },
  copilot: {
    label: "Microsoft Copilot", vendor: "Microsoft", country: "USA", isEU: false, usDirect: true,
    tiers: {
      business: { verdict: "gelb", reason: "„Flex Routing" (Default seit 17.04.2026) kann Inferenz in USA/Kanada/Australien verlagern; Anthropic-Subprozessor außerhalb der EU Data Boundary.", upgradePath: "Flex Routing im M365 Admin Center deaktivieren.", dpaUrl: "https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA" },
      free: { verdict: "rot", reason: "Consumer-Version ohne Unternehmens-DPA.", upgradePath: "M365 Copilot (Business) lizenzieren." },
    },
    source: { url: "https://www.privacyofficers.at/wie-microsoft-die-eu-datengrenze-fur-copilot-stillschweigend-aufweicht/", asOf: "2026-04" },
  },
  // TRANSCRIBE FROM SOURCE, same shape:
  // claude: free→rot (Consumer Training-Opt-in seit 08.10.2025), business→gelb (API direkt, US, DPA in Commercial Terms seit 01.01.2026, SCCs; upgradePath „grün via Bedrock/Vertex"), cloud→gruen (AWS Bedrock eu-central-1 / Vertex EU). usDirect: true.
  // gemini: free→rot (Consumer ohne DPA), business→gruen (Workspace Business/Enterprise, EU), cloud→gruen (Vertex AI EU). usDirect: true (consumer).
  // mistral: business→gruen (Le Chat Pro/Team, EU-native), cloud→gruen (API). isEU: true, usDirect: false. caveat: Cloud-Bezug über US-Marktplätze prüfen.
  // alephalpha: business→gruen (Enterprise/On-Prem/STACKIT). isEU: true, usDirect: false. caveat: "Cohere-Übernahme angekündigt 24.04.2026 (unter Vorbehalt) — post-Merger neu bewerten."
  // deepseek: override → { verdict: "rot", reason: "Datenspeicherung in China, kein Angemessenheitsbeschluss; Garante-Ban; EU-Ermittlungen." }. isEU:false, usDirect:false.
  // local: override → { verdict: "gruen", reason: "Self-Hosted in eigener EU-Infrastruktur; keine Auftragsverarbeitung; DSGVO-Pflichten bleiben beim Unternehmen." }. isEU:true, usDirect:false.
};

/** Tools a user can select (Q_TOOLS) that we have facts for. */
export const KNOWN_TOOL_IDS = Object.keys(TOOLS);
```

- [ ] **Step 3: Typecheck**

Run: `npm run lint --prefix frontend`
Expected: clean (no test yet — `facts.test.ts` is Task 11).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/scorecards/dsgvo-check/types.ts frontend/src/scorecards/dsgvo-check/facts.ts
git commit -m "feat(dsgvo-check): domain types + facts data module (fact-check Juni 2026)"
```

---

### Task 8: `recommend.ts` — the tool matrix

**Files:**
- Create: `frontend/src/scorecards/dsgvo-check/recommend.ts`
- Create: `frontend/src/scorecards/dsgvo-check/recommend.test.ts`

Question id contract (used by `recommend` and the definition in Task 13): `C1` Rolle, `C2` Größe, `Q_TOOLS` (multi), `Q_TIER`, `Q_DATA`, `Q_USECASE` (multi), `Q_SHADOW`, `Q_COMPLIANCE` (multi). Option ids are defined in Task 13 and referenced here.

- [ ] **Step 1: Write the failing tests** — `recommend.test.ts`:

```ts
import { buildToolMatrix } from "./recommend";

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- dsgvo-check/recommend.test.ts`
Expected: FAIL — `buildToolMatrix` not defined.

- [ ] **Step 3: Implement `buildToolMatrix`** in `recommend.ts`:

```ts
import type { Answers } from "@/lib/scorecard/types";
import { TOOLS, DPF_STATUS } from "./facts";
import type { ToolVerdict, Tier, Verdict, ToolFact, TierFact } from "./types";

const ORDER: Verdict[] = ["gruen", "gelb", "rot"];
const worse = (a: Verdict, b: Verdict): Verdict => (ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b);

function asArray(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

/** Pick the TierFact for the chosen global tier; gemischt → least-favourable known tier. */
function pickTier(fact: ToolFact, tier: Tier): TierFact | undefined {
  if (tier !== "gemischt") return fact.tiers[tier];
  const known = Object.values(fact.tiers);
  if (known.length === 0) return undefined;
  return known.reduce((acc, t) => (ORDER.indexOf(t.verdict) > ORDER.indexOf(acc.verdict) ? t : acc));
}

export function buildToolMatrix(answers: Answers): ToolVerdict[] {
  const tier = (typeof answers.Q_TIER === "string" ? answers.Q_TIER : "gemischt") as Tier;
  const data = typeof answers.Q_DATA === "string" ? answers.Q_DATA : "keine";
  const sensitive = data === "personenbezogen" || data === "besondere";

  return asArray(answers.Q_TOOLS).filter((id) => id !== "keine").map((toolId) => {
    const fact = TOOLS[toolId];
    if (!fact) {
      return {
        toolId, label: toolId,
        verdict: "gelb" as Verdict,
        reason: "Für dieses Tool liegt keine geprüfte Einordnung vor — individuell prüfen (AVV, EU-Region, Training-Opt-out).",
      };
    }
    if (fact.override) {
      return { toolId, label: fact.label, verdict: fact.override.verdict, reason: fact.override.reason, caveat: fact.caveat };
    }
    const t = pickTier(fact, tier);
    if (!t) {
      return { toolId, label: fact.label, verdict: "gelb", reason: "Für die gewählte Nutzungsform liegt keine Einordnung vor — individuell prüfen.", caveat: fact.caveat };
    }
    let verdict = t.verdict;
    // Overlay 1: sensitive data on a free tier is never acceptable.
    if (sensitive && tier === "free") verdict = worse(verdict, "rot");
    // Overlay 2: DPF unstable → a US-direct green tool can't be fully green without SCCs/TIA.
    if (!DPF_STATUS.stable && fact.usDirect && tier === "business") verdict = worse(verdict, "gelb");
    return {
      toolId, label: fact.label, verdict, reason: t.reason,
      upgradePath: tier === "gemischt" ? (t.upgradePath ?? "Auf eine konforme Stufe/EU-Region wechseln.") : t.upgradePath,
      dpaUrl: t.dpaUrl, caveat: fact.caveat,
    };
  });
}
```

- [ ] **Step 4: Run tests**

Run: `npm test --prefix frontend -- dsgvo-check/recommend.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/scorecards/dsgvo-check/recommend.ts frontend/src/scorecards/dsgvo-check/recommend.test.ts
git commit -m "feat(dsgvo-check): tool matrix logic (tiers, overlays, overrides)"
```

---

### Task 9: `recommend.ts` — risk class + obligations

**Files:**
- Modify: `frontend/src/scorecards/dsgvo-check/recommend.ts`
- Modify: `frontend/src/scorecards/dsgvo-check/recommend.test.ts`

- [ ] **Step 1: Write the failing tests:**

```ts
import { classifyRisk } from "./recommend";

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
```

- [ ] **Step 2: Run to verify fail**

Run: `npm test --prefix frontend -- dsgvo-check/recommend.test.ts`
Expected: FAIL — `classifyRisk` not defined.

- [ ] **Step 3: Implement** in `recommend.ts`:

```ts
import type { RiskClass } from "./types";

const HIGH_RISK = new Set(["hr", "entscheidungen"]);
const LIMITED = new Set(["bot"]);

export function classifyRisk(answers: Answers): { riskClass: RiskClass; obligations: string[] } {
  const uses = asArray(answers.Q_USECASE);
  if (uses.some((u) => HIGH_RISK.has(u))) {
    return {
      riskClass: "hoch",
      obligations: [
        "Risikomanagement-System und technische Dokumentation aufbauen.",
        "Human Oversight sicherstellen (Mensch entscheidet, nicht die KI allein).",
        "Logging der Systemnutzung ≥ 6 Monate.",
        "Hochrisiko-Pflichten greifen ab 02.12.2027 (Annex III, via Digital Omnibus verschoben) — Vorbereitung jetzt.",
      ],
    };
  }
  if (uses.some((u) => LIMITED.has(u))) {
    return {
      riskClass: "begrenzt",
      obligations: ["Transparenzpflicht (Art. 50): Nutzer müssen erkennen, dass sie mit KI sprechen — ab 02.08.2026."],
    };
  }
  return {
    riskClass: "minimal",
    obligations: ["Keine spezifischen AI-Act-Pflichten — die DSGVO gilt trotzdem (AVV, Rechtsgrundlage, EU-Region)."],
  };
}
```

- [ ] **Step 4: Run tests** → PASS. **Step 5: Commit**

```bash
git add frontend/src/scorecards/dsgvo-check/recommend.ts frontend/src/scorecards/dsgvo-check/recommend.test.ts
git commit -m "feat(dsgvo-check): AI-Act risk classification + obligations"
```

---

### Task 10: `recommend.ts` — action plan, ampel, and the assembled `recommend()`

**Files:**
- Modify: `frontend/src/scorecards/dsgvo-check/recommend.ts`
- Modify: `frontend/src/scorecards/dsgvo-check/recommend.test.ts`

- [ ] **Step 1: Write the failing tests** (incl. invariants with fast-check):

```ts
import fc from "fast-check";
import { recommend, buildActionPlan } from "./recommend";
import { KNOWN_TOOL_IDS } from "./facts";

test("action plan = the NOT-checked compliance items, AI-Literacy first", () => {
  const plan = buildActionPlan({ Q_COMPLIANCE: ["avv"], Q_TOOLS: [], Q_SHADOW: "ja" });
  const titles = plan.map((p) => p.title.toLowerCase());
  expect(titles.some((t) => t.includes("literacy"))).toBe(true); // not checked → present
  expect(titles.some((t) => t.includes("avv"))).toBe(false);     // checked → absent
  expect(plan[0].title.toLowerCase()).toContain("literacy");      // hard duty first
});

test("shadow-AI remediation appears when no overview", () => {
  const plan = buildActionPlan({ Q_COMPLIANCE: ["avv","literacy","richtlinie","euregion","dsfa"], Q_TOOLS: [], Q_SHADOW: "nein" });
  expect(plan.some((p) => /schatten|mitarbeit/i.test(p.title + p.detail))).toBe(true);
});

test("recommend() is ScorecardResult-compatible and self-consistent", () => {
  const r = recommend({ Q_TOOLS: ["chatgpt"], Q_TIER: "free", Q_DATA: "personenbezogen", Q_USECASE: ["hr"], Q_SHADOW: "nein", Q_COMPLIANCE: ["nichts"], C1: "gf", C2: "50-250" });
  expect(r.outcome).toBe(r.ampel);            // outcome mirrors ampel (generic compatibility)
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
```

- [ ] **Step 2: Run to verify fail**

Run: `npm test --prefix frontend -- dsgvo-check/recommend.test.ts`
Expected: FAIL — `recommend`/`buildActionPlan` not defined.

- [ ] **Step 3: Implement** the remaining pieces in `recommend.ts`:

```ts
import type { Answers, ScorecardResult } from "@/lib/scorecard/types";
import { isQualified } from "@/lib/scorecard/qualification";
import { definition } from "./definition";
import { RECHTSSTAND, DPF_STATUS } from "./facts";
import type { ActionItem, Ampel, DsgvoResult } from "./types";

/** Compliance item id → action shown when the user did NOT check it. Order = priority. */
const COMPLIANCE_ACTIONS: { id: string; title: string; detail: string }[] = [
  { id: "literacy", title: "AI-Literacy-Schulung durchführen", detail: "Pflicht seit 02/2025 (Art. 4 EU AI Act) für alle, die KI nutzen — auch KMU." },
  { id: "avv", title: "AVV/DPA mit jedem Anbieter abschließen", detail: "Art. 28 DSGVO: ohne Auftragsverarbeitungsvertrag keine zulässige Verarbeitung." },
  { id: "richtlinie", title: "KI-Nutzungsrichtlinie erstellen", detail: "Welche Tools erlaubt sind, welche Daten rein dürfen, wer verantwortlich ist." },
  { id: "euregion", title: "EU-Region + Training-Opt-out aktivieren", detail: "Wo wählbar EU-Datenverarbeitung; Training vertraglich und technisch ausschalten." },
  { id: "dsfa", title: "DSFA durchführen, wo nötig", detail: "Datenschutz-Folgenabschätzung (Art. 35) für KI mit personenbezogenen Daten." },
];

// Reuse `asArray` from Task 8 (same file) — do not redefine it.

export function buildActionPlan(answers: Answers): ActionItem[] {
  const done = new Set(asArray(answers.Q_COMPLIANCE));
  const items: ActionItem[] = [];
  let p = 0;
  for (const a of COMPLIANCE_ACTIONS) {
    if (!done.has(a.id)) items.push({ priority: p++, title: a.title, detail: a.detail });
  }
  // Tool upgrades for every non-green tool.
  for (const v of buildToolMatrix(answers)) {
    if (v.verdict !== "gruen" && v.upgradePath) {
      items.push({ priority: p++, title: `${v.label}: konform machen`, detail: v.upgradePath });
    }
  }
  // SCCs/TIA when DPF is unstable and a US-direct tool is in play.
  const hasUs = buildToolMatrix(answers).some((v) => v.verdict !== "rot" && TOOLS[v.toolId]?.usDirect);
  if (!DPF_STATUS.stable && hasUs) {
    items.push({ priority: p++, title: "SCCs + Transfer Impact Assessment für US-Anbieter", detail: "Das DPF ist instabil — Standardvertragsklauseln vereinbaren und ein TIA dokumentieren." });
  }
  // Shadow-AI remediation.
  const shadow = typeof answers.Q_SHADOW === "string" ? answers.Q_SHADOW : "";
  if (shadow === "nein" || shadow === "keine-ahnung" || shadow === "teilweise") {
    items.push({ priority: p++, title: "Schatten-KI eindämmen", detail: "Erfassen, welche Tools Mitarbeitende real nutzen; freigegebene Alternativen anbieten (private Accounts haben oft Training-Opt-in)." });
  }
  return items;
}

function usTransfer(answers: Answers): boolean {
  return buildToolMatrix(answers).some((v) => v.verdict !== "rot" && TOOLS[v.toolId]?.usDirect === true);
}

/** Readiness 0..100 + ampel, from tier fit, data sensitivity, shadow overview, compliance done. */
function readiness(answers: Answers): { score: number; ampel: Ampel } {
  const matrix = buildToolMatrix(answers);
  const reds = matrix.filter((v) => v.verdict === "rot").length;
  const yellows = matrix.filter((v) => v.verdict === "gelb").length;
  const doneCount = asList(answers.Q_COMPLIANCE).filter((x) => x !== "nichts").length;
  const shadowOk = answers.Q_SHADOW === "ja";
  let score = 40 + doneCount * 10 + (shadowOk ? 15 : 0) - reds * 20 - yellows * 8;
  score = Math.max(0, Math.min(100, score));
  const ampel: Ampel = reds > 0 || score < 34 ? "rot" : score < 67 ? "gelb" : "gruen";
  return { score, ampel };
}

export function recommend(answers: Answers): DsgvoResult {
  const toolMatrix = buildToolMatrix(answers);
  const { riskClass, obligations } = classifyRisk(answers);
  const actionPlan = buildActionPlan(answers);
  const { score, ampel } = readiness(answers);
  const shadow = typeof answers.Q_SHADOW === "string" ? answers.Q_SHADOW : "";
  return {
    // ScorecardResult fields (generic compatibility — stored in result jsonb):
    rawSum: 0,
    score,
    outcome: ampel,
    qualified: isQualified(definition, answers),
    // DSGVO-specific:
    ampel,
    toolMatrix,
    riskClass,
    riskObligations: obligations,
    actionPlan,
    shadowAiFlag: shadow !== "ja",
    usTransferFlag: usTransfer(answers),
    rechtsstand: RECHTSSTAND,
  };
}
```

(Note: `classifyRisk`, `buildToolMatrix`, `TOOLS` are already imported/defined from Tasks 8–9 — keep a single import block; `definition` comes from Task 13. If executing strictly in order, Task 13 must land before this file typechecks against `./definition`; either reorder Task 13 before Task 10 or stub `definition` import. Recommended: do Task 13 before Task 10's `recommend()` assembly.)

- [ ] **Step 4: Run tests** → PASS. **Step 5: Commit**

```bash
git add frontend/src/scorecards/dsgvo-check/recommend.ts frontend/src/scorecards/dsgvo-check/recommend.test.ts
git commit -m "feat(dsgvo-check): action plan, readiness ampel, assembled recommend()"
```

---

### Task 11: `facts.ts` integrity test

**Files:**
- Create: `frontend/src/scorecards/dsgvo-check/facts.test.ts`

- [ ] **Step 1: Write the test:**

```ts
import { TOOLS, DPF_STATUS, RECHTSSTAND, AI_ACT_TIMELINE } from "./facts";

test("every tool has a label, source url+asOf, and either tiers or an override", () => {
  for (const [id, t] of Object.entries(TOOLS)) {
    expect(t.label, id).toBeTruthy();
    expect(t.source.url, id).toMatch(/^https?:\/\//);
    expect(t.source.asOf, id).toMatch(/^\d{4}-\d{2}$/);
    const hasTiers = Object.keys(t.tiers).length > 0;
    expect(hasTiers || !!t.override, id).toBe(true);
  }
});

test("every tier fact has a verdict + reason", () => {
  for (const [id, t] of Object.entries(TOOLS)) {
    for (const [tier, f] of Object.entries(t.tiers)) {
      expect(["gruen", "gelb", "rot"]).toContain(f.verdict);
      expect(f.reason, `${id}.${tier}`).toBeTruthy();
    }
  }
});

test("the required tool set is present", () => {
  ["chatgpt","claude","gemini","copilot","mistral","alephalpha","deepseek","local"]
    .forEach((id) => expect(TOOLS[id], id).toBeDefined());
});

test("Rechtsstand + DPF + timeline are set", () => {
  expect(RECHTSSTAND).toMatch(/^\d{4}-\d{2}$/);
  expect(typeof DPF_STATUS.stable).toBe("boolean");
  expect(AI_ACT_TIMELINE.length).toBeGreaterThan(3);
});
```

- [ ] **Step 2: Run** → if any tool is missing/malformed, fix `facts.ts` (this is the transcription safety net). Expected after fixes: PASS.

Run: `npm test --prefix frontend -- dsgvo-check/facts.test.ts`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/scorecards/dsgvo-check/facts.test.ts frontend/src/scorecards/dsgvo-check/facts.ts
git commit -m "test(dsgvo-check): facts data integrity"
```

---

## Milestone 3 — Definition, content, branding, views, registration

### Task 13: `definition.ts` — the 8 questions

> **Do this before Task 10's `recommend()` assembly** (recommend imports `./definition`).

**Files:**
- Create: `frontend/src/scorecards/dsgvo-check/definition.ts`
- Create: `frontend/src/scorecards/dsgvo-check/definition.test.ts`

- [ ] **Step 1: Write the test:**

```ts
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
```

- [ ] **Step 2: Run to verify fail** → FAIL (no definition).

- [ ] **Step 3: Implement `definition.ts`.** Use option ids exactly as referenced in `recommend.ts`: `Q_TOOLS` ids = `KNOWN_TOOL_IDS` + `andere` + `keine`; `Q_TIER` = free/business/cloud/gemischt; `Q_DATA` = keine/intern/personenbezogen/besondere; `Q_USECASE` = produktivitaet/analyse/bot/hr/entscheidungen; `Q_SHADOW` = ja/teilweise/nein/keine-ahnung; `Q_COMPLIANCE` = avv/literacy/richtlinie/euregion/dsfa/nichts:

```ts
import type { ScorecardDefinition } from "@/lib/scorecard/types";

export const definition: ScorecardDefinition = {
  slug: "dsgvo-check",
  // Engine scoring/outcome are unused (recommend() overrides via the resolve hook);
  // a trivial valid outcome satisfies the type.
  scoring: { maxPoints: 0, direction: "higher-better" },
  outcome: { type: "bands", bands: [{ key: "rot", min: 0, max: 33 }, { key: "gelb", min: 34, max: 66 }, { key: "gruen", min: 67, max: 100 }] },
  qualification: { requireQualifies: ["C1"] },
  attributePrefix: "dsgvo_",
  questions: [
    { id: "C1", kind: "context", attributeKey: "dsgvo_rolle", prompt: "Was beschreibt Deine Rolle am besten?", options: [
      { id: "gf", label: "Geschäftsführer / Inhaber", qualifies: true },
      { id: "it", label: "IT-Leitung", qualifies: true },
      { id: "datenschutz", label: "Datenschutz / Legal", qualifies: true },
      { id: "bereichsleitung", label: "Bereichsleitung", qualifies: true },
      { id: "team", label: "Team-Mitglied ohne Führungsverantwortung" },
      { id: "berater", label: "Berater / Sonstiges" },
    ] },
    { id: "C2", kind: "context", attributeKey: "dsgvo_groesse", prompt: "Wie viele Mitarbeitende hat euer Unternehmen?", options: [
      { id: "u10", label: "unter 10" }, { id: "10-49", label: "10–49" }, { id: "50-250", label: "50–250" },
      { id: "250-1000", label: "250–1.000" }, { id: "ue1000", label: "über 1.000" },
    ] },
    { id: "Q_TOOLS", kind: "multi", attributeKey: "dsgvo_tools", prompt: "Welche KI-Tools nutzt oder plant ihr?", options: [
      { id: "chatgpt", label: "ChatGPT" }, { id: "copilot", label: "Microsoft Copilot" }, { id: "claude", label: "Claude" },
      { id: "gemini", label: "Google Gemini" }, { id: "mistral", label: "Mistral / Le Chat" }, { id: "alephalpha", label: "Aleph Alpha / PhariaAI" },
      { id: "local", label: "Lokale Modelle (Ollama o.ä.)" }, { id: "deepseek", label: "DeepSeek" },
      { id: "andere", label: "Andere" }, { id: "keine", label: "Noch keine" },
    ] },
    { id: "Q_TIER", kind: "context", attributeKey: "dsgvo_tier", prompt: "In welcher Form nutzt ihr diese Tools überwiegend?", options: [
      { id: "free", label: "Free / privater Account" }, { id: "business", label: "Bezahlte Business-/Enterprise-Pläne" },
      { id: "cloud", label: "Über Cloud (Azure / AWS Bedrock / Google)" }, { id: "gemischt", label: "Gemischt / weiß nicht" },
    ] },
    { id: "Q_DATA", kind: "context", attributeKey: "dsgvo_daten", prompt: "Welche Daten gebt ihr in die KI ein?", options: [
      { id: "keine", label: "Keine personenbezogenen Daten" }, { id: "intern", label: "Interne Daten, aber keine personenbezogenen" },
      { id: "personenbezogen", label: "Personenbezogene Daten von Kunden/Mitarbeitenden" }, { id: "besondere", label: "Besondere Kategorien (Gesundheit u.ä., Art. 9)" },
    ] },
    { id: "Q_USECASE", kind: "multi", attributeKey: "dsgvo_usecase", prompt: "Wofür setzt ihr KI ein?", options: [
      { id: "produktivitaet", label: "Produktivität (Texte, E-Mails, Recherche)" }, { id: "analyse", label: "Dokumenten-/Datenanalyse" },
      { id: "bot", label: "Kundenservice-Chatbot" }, { id: "hr", label: "HR / Bewerberauswahl / Scoring" },
      { id: "entscheidungen", label: "Automatisierte Entscheidungen über Personen" },
    ] },
    { id: "Q_SHADOW", kind: "context", attributeKey: "dsgvo_shadow", prompt: "Habt ihr einen Überblick, welche KI-Tools eure Mitarbeitenden tatsächlich nutzen?", options: [
      { id: "ja", label: "Ja, klare Richtlinie + Überblick" }, { id: "teilweise", label: "Teilweise" },
      { id: "nein", label: "Nein, vermutlich nutzen einzelne privat KI" }, { id: "keine-ahnung", label: "Keine Ahnung" },
    ] },
    { id: "Q_COMPLIANCE", kind: "multi", attributeKey: "dsgvo_compliance", prompt: "Was habt ihr schon umgesetzt?", options: [
      { id: "avv", label: "AVV/DPA mit den Anbietern" }, { id: "literacy", label: "AI-Literacy-Schulung" }, { id: "richtlinie", label: "KI-Nutzungsrichtlinie" },
      { id: "euregion", label: "EU-Region / Training-Opt-out" }, { id: "dsfa", label: "DSFA wo nötig" }, { id: "nichts", label: "Nichts davon" },
    ] },
  ],
};
```

- [ ] **Step 4: Run tests** → PASS. **Step 5: Commit**

```bash
git add frontend/src/scorecards/dsgvo-check/definition.ts frontend/src/scorecards/dsgvo-check/definition.test.ts
git commit -m "feat(dsgvo-check): 8-question definition (multi-select + qualification)"
```

---

### Task 12: `branding.ts` + `content.ts`

**Files:**
- Create: `frontend/src/scorecards/dsgvo-check/branding.ts`
- Create: `frontend/src/scorecards/dsgvo-check/content.ts`

- [ ] **Step 1: `branding.ts`** — same brand as KFC/Engpass (copy `ki-fuehrungs-check/branding.ts` verbatim; identical palette, `brandName: "KI-Coaching mit Kante"`, `brandAuthor: "Daniel Kreuzhofer"`).

- [ ] **Step 2: `content.ts`** — satisfies `ScorecardContent` (intro/optin/video/resultHeading reused by the shell) with `byOutcome: {}` and `sources: []` (custom views own their copy), plus DSGVO-specific copy + an `outcomeLabel` for the ampel keys:

```ts
import type { ScorecardContent } from "@/lib/scorecard/content";

export const content: ScorecardContent = {
  intro: {
    eyebrow: "DSGVO-Check",
    heading: "Darfst Du Deine KI-Tools rechtssicher nutzen?",
    lead: "8 Fragen, 3 Minuten: Du bekommst für jedes Tool eine klare Ampel — und einen konkreten Plan, was Du tun musst.",
    startLabel: "Check starten",
    meta: "Kostenlos · Stand der Recherche Juni 2026 · keine Rechtsberatung",
  },
  resultHeading: "Dein DSGVO-Status",
  outcomeLabel: { rot: "Ampel: Rot", gelb: "Ampel: Gelb", gruen: "Ampel: Grün" },
  byOutcome: {},
  sources: [],
  optin: {
    heading: "Hol Dir den vollständigen Maßnahmenplan",
    body: "Mit den direkten AVV/DPA-Links, Schritt-für-Schritt-Upgrades und Vorlagen (KI-Nutzungsrichtlinie, AVV-Checkliste, AI-Literacy-Plan) als dauerhaft abrufbaren Report.",
    button: "Report anfordern",
    consent: "Mit der Anmeldung willige ich ein, Infos und Tipps rund um KI per E-Mail zu erhalten. Abmeldung jederzeit.",
    datenschutzHref: "/datenschutz",
    datenschutzHinweis: "Deine Antworten bleiben bis zur Anmeldung in Deinem Browser. Verarbeitung über Hostinger (Frankfurt) und IONOS (DE); Newsletter über CleverReach (DE).",
    successHeading: "Fast geschafft — bitte E-Mail bestätigen",
    successBody: "Wir haben Dir einen Bestätigungslink geschickt. Ein Klick, dann ist Dein Report da.",
    errorBody: "Das hat nicht geklappt. Bitte prüfe die E-Mail-Adresse und versuch es erneut.",
    emailLabel: "Deine E-Mail-Adresse",
    emailPlaceholder: "name@firma.de",
  },
  video: { intro: "Mehr dazu im Video:", title: "Sind ChatGPT, Claude & Co DSGVO-konform?", label: "Video #01", url: "https://www.youtube.com/@DanielKreuzhofer" },
};

/** DSGVO-specific copy used only by DsgvoResultView / DsgvoReportDoc. */
export const dsgvoCopy = {
  ampelLabel: { rot: "Rot", gelb: "Gelb", gruen: "Grün" } as Record<string, string>,
  ampelHeadline: {
    rot: "Akuter Handlungsbedarf",
    gelb: "Auf dem Weg — aber mit Lücken",
    gruen: "Souverän aufgestellt",
  } as Record<string, string>,
  verdictLabel: { gruen: "Konform nutzbar", gelb: "Mit Auflagen", rot: "So nicht im Unternehmen" } as Record<string, string>,
  riskLabel: { minimal: "Minimales Risiko", begrenzt: "Begrenztes Risiko", hoch: "Hochrisiko" } as Record<string, string>,
  disclaimer: "Dieser Check ersetzt keine Rechtsberatung. Er gibt eine fundierte Ersteinordnung auf Basis öffentlich zugänglicher Quellen (Stand der Recherche Juni 2026).",
  updateNote: "Die Rechtslage ändert sich laufend. Wir aktualisieren diesen Check regelmäßig und informieren über wesentliche Neuerungen in unserem Newsletter.",
  rewardHeading: "Deine Vorlagen (im Report enthalten)",
  rewardItems: [
    { title: "Muster KI-Nutzungsrichtlinie", body: "Vorlage: welche Tools erlaubt sind, welche Daten rein dürfen, wer verantwortlich ist." },
    { title: "AVV-Checkliste", body: "Was ein Auftragsverarbeitungsvertrag mit einem KI-Anbieter abdecken muss." },
    { title: "AI-Literacy-Schulungsplan", body: "Kompakter Plan, um die Schulungspflicht (Art. 4) nachweisbar zu erfüllen." },
  ],
};
```

- [ ] **Step 3: Typecheck** → `npm run lint --prefix frontend` clean.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/scorecards/dsgvo-check/branding.ts frontend/src/scorecards/dsgvo-check/content.ts
git commit -m "feat(dsgvo-check): branding + content (intro/optin/video + DSGVO copy)"
```

---

### Task 14: `DsgvoResultView.tsx` (free teaser) + CSS

**Files:**
- Create: `frontend/src/scorecards/dsgvo-check/DsgvoResultView.tsx`
- Create: `frontend/src/scorecards/dsgvo-check/dsgvo.css`
- Test: `frontend/src/scorecards/dsgvo-check/DsgvoResultView.test.tsx`

The free teaser shows: Ampel headline · tool matrix (verdict + 1-line reason + 1-line upgrade hint) · risk class · top-3 action items · shadow-AI callout · disclaimer. It does **not** show the DPA links, full step-by-step, or templates (those are the gated payoff).

- [ ] **Step 1: Write the test:**

```tsx
import { render, screen } from "@testing-library/react";
import { DsgvoResultView } from "./DsgvoResultView";
import { recommend } from "./recommend";
import { definition } from "./definition";
import { content } from "./content";
import { branding } from "./branding";
import type { ScorecardRegistration } from "@/lib/scorecard/registry";

// Minimal registration — DsgvoResultView only reads `result` + DSGVO copy. No DB.
const reg = { definition, content, branding } as unknown as ScorecardRegistration;

test("shows the ampel headline, a tool row, and the disclaimer", () => {
  const answers = { Q_TOOLS: ["chatgpt"], Q_TIER: "free", Q_DATA: "personenbezogen", Q_USECASE: ["hr"], Q_SHADOW: "nein", Q_COMPLIANCE: ["nichts"], C1: "gf" };
  render(<DsgvoResultView registration={reg} answers={answers} result={recommend(answers)} />);
  expect(screen.getByText(/Akuter Handlungsbedarf/i)).toBeInTheDocument();
  expect(screen.getByText(/ChatGPT/)).toBeInTheDocument();
  expect(screen.getByText(/keine Rechtsberatung/i)).toBeInTheDocument();
});
```

(For the minimal registration in tests, import `{ definition }`, `{ content }`, `{ branding }` and assemble a partial `ScorecardRegistration` cast — no DB needed.)

- [ ] **Step 2: Run to verify fail** → FAIL (no component).

- [ ] **Step 3: Implement** `DsgvoResultView.tsx` (typed via the registry prop type; cast `result` to `DsgvoResult`):

```tsx
"use client";
import type { ScorecardResultViewProps } from "@/lib/scorecard/registry";
import type { DsgvoResult } from "./types";
import { dsgvoCopy } from "./content";
import "./dsgvo.css";

export function DsgvoResultView({ result }: ScorecardResultViewProps) {
  const r = result as DsgvoResult;
  const top3 = r.actionPlan.slice(0, 3);
  return (
    <div className="dsg">
      <div className={`dsg-ampel dsg-ampel-${r.ampel}`}>
        <span className="dsg-ampel-dot" aria-hidden="true" />
        <div>
          <p className="dsg-ampel-eyebrow">Dein Status</p>
          <h2 className="dsg-ampel-headline">{dsgvoCopy.ampelHeadline[r.ampel]}</h2>
        </div>
      </div>

      {r.toolMatrix.length > 0 && (
        <section className="dsg-section" aria-label="Tools im Check">
          <h3 className="dsg-h3">Deine Tools im Check</h3>
          <ul className="dsg-matrix">
            {r.toolMatrix.map((v) => (
              <li key={v.toolId} className="dsg-row">
                <span className={`dsg-badge dsg-badge-${v.verdict}`}>{dsgvoCopy.verdictLabel[v.verdict]}</span>
                <span className="dsg-tool">{v.label}</span>
                <span className="dsg-reason">{v.reason}</span>
                {v.upgradePath && <span className="dsg-upgrade">→ {v.upgradePath}</span>}
                {v.caveat && <span className="dsg-caveat">⚠️ {v.caveat}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="dsg-section">
        <h3 className="dsg-h3">EU-AI-Act-Einordnung</h3>
        <p className={`dsg-risk dsg-risk-${r.riskClass}`}>{dsgvoCopy.riskLabel[r.riskClass]}</p>
        <ul className="dsg-list">{r.riskObligations.map((o, i) => <li key={i}>{o}</li>)}</ul>
      </section>

      {top3.length > 0 && (
        <section className="dsg-section">
          <h3 className="dsg-h3">Deine wichtigsten nächsten Schritte</h3>
          <ol className="dsg-plan">{top3.map((a) => <li key={a.priority}><strong>{a.title}</strong> — {a.detail}</li>)}</ol>
          <p className="dsg-teaser">Den vollständigen Plan mit AVV-Links, Upgrade-Schritten und Vorlagen bekommst Du im Report ↓</p>
        </section>
      )}

      {r.shadowAiFlag && (
        <p className="dsg-callout">⚠️ Du hast keinen vollen Überblick, welche KI Deine Mitarbeitenden nutzen — das ist in der Praxis das häufigste DSGVO-Risiko.</p>
      )}

      <p className="dsg-disclaimer">{dsgvoCopy.disclaimer}</p>
    </div>
  );
}
```

- [ ] **Step 4: Write `dsgvo.css`** — dark theme using the `--sc-*` tokens already set by the shell (`brandStyle`). Provide `.dsg-ampel-rot/gelb/gruen` dot colors, `.dsg-badge-*` pill colors (red/amber/green), `.dsg-matrix` grid, muted reason text, accent upgrade text. Keep it lean; reuse `--sc-surface`, `--sc-border`, `--sc-ink`, `--sc-ink-muted`, `--sc-accent`, `--sc-accent-2`. (Mirror the visual language of `components/scorecard/sc.css`.)

- [ ] **Step 5: Run tests** → PASS. **Step 6: Commit**

```bash
git add frontend/src/scorecards/dsgvo-check/DsgvoResultView.tsx frontend/src/scorecards/dsgvo-check/dsgvo.css frontend/src/scorecards/dsgvo-check/DsgvoResultView.test.tsx
git commit -m "feat(dsgvo-check): free result view (ampel + tool matrix teaser)"
```

---

### Task 15: `DsgvoReportDoc.tsx` (gated report) + CSS

**Files:**
- Create: `frontend/src/scorecards/dsgvo-check/DsgvoReportDoc.tsx`
- Create: `frontend/src/scorecards/dsgvo-check/dsgvo-report.css`
- Test: `frontend/src/scorecards/dsgvo-check/DsgvoReportDoc.test.tsx`

The gated report (light, print-optimized; rendered inside the report page's `.sc-doc` wrapper) shows everything the teaser shows **plus**: each tool's AVV/DPA link, the full prioritized action plan, the reward templates, the Rechtsstand badge, sources, the update-note, and the disclaimer.

- [ ] **Step 1: Write the test:**

```tsx
import { render, screen } from "@testing-library/react";
import { DsgvoReportDoc } from "./DsgvoReportDoc";
import { recommend } from "./recommend";
import { definition } from "./definition";
import { content } from "./content";
import { branding } from "./branding";
import type { ScorecardRegistration } from "@/lib/scorecard/registry";

const reg = { definition, content, branding } as unknown as ScorecardRegistration;

test("renders full plan, a DPA link, the reward templates and the Rechtsstand badge", () => {
  const answers = { Q_TOOLS: ["chatgpt"], Q_TIER: "business", Q_DATA: "intern", Q_USECASE: ["produktivitaet"], Q_SHADOW: "ja", Q_COMPLIANCE: ["nichts"], C1: "gf" };
  render(<DsgvoReportDoc registration={reg} result={recommend(answers)} answers={answers} />);
  expect(screen.getByText(/Muster KI-Nutzungsrichtlinie/i)).toBeInTheDocument();
  expect(screen.getByText(/Stand der Recherche/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /AVV|DPA/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to verify fail** → FAIL.

- [ ] **Step 3: Implement** `DsgvoReportDoc.tsx`:

```tsx
import type { ScorecardReportDocProps } from "@/lib/scorecard/registry";
import type { DsgvoResult } from "./types";
import { dsgvoCopy } from "./content";
import "./dsgvo-report.css";

export function DsgvoReportDoc({ result }: ScorecardReportDocProps) {
  const r = result as DsgvoResult;
  return (
    <article className="dsgr">
      <div className="dsgr-badge">Stand der Recherche: {r.rechtsstand}</div>

      <header className={`dsgr-ampel dsgr-ampel-${r.ampel}`}>
        <p className="dsgr-eyebrow">Dein DSGVO-Status</p>
        <h1 className="dsgr-headline">{dsgvoCopy.ampelHeadline[r.ampel]}</h1>
      </header>

      {r.toolMatrix.length > 0 && (
        <section className="dsgr-section">
          <h2 className="dsgr-h2">Deine Tools im Detail</h2>
          {r.toolMatrix.map((v) => (
            <div key={v.toolId} className="dsgr-tool">
              <p className="dsgr-tool-head">
                <span className={`dsgr-badge2 dsgr-badge2-${v.verdict}`}>{dsgvoCopy.verdictLabel[v.verdict]}</span>
                <strong>{v.label}</strong>
              </p>
              <p className="dsgr-tool-reason">{v.reason}</p>
              {v.upgradePath && <p className="dsgr-tool-upgrade">So wird's konform: {v.upgradePath}</p>}
              {v.caveat && <p className="dsgr-tool-caveat">⚠️ {v.caveat}</p>}
              {v.dpaUrl && (
                <p className="dsgr-tool-link">
                  <a href={v.dpaUrl} target="_blank" rel="noopener noreferrer">→ AVV / DPA dieses Anbieters öffnen</a>
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      <section className="dsgr-section">
        <h2 className="dsgr-h2">EU-AI-Act-Einordnung: {dsgvoCopy.riskLabel[r.riskClass]}</h2>
        <ul className="dsgr-list">{r.riskObligations.map((o, i) => <li key={i}>{o}</li>)}</ul>
      </section>

      <section className="dsgr-section">
        <h2 className="dsgr-h2">Dein Maßnahmenplan</h2>
        <ol className="dsgr-plan">
          {r.actionPlan.map((a) => <li key={a.priority}><strong>{a.title}</strong> — {a.detail}</li>)}
        </ol>
      </section>

      <section className="dsgr-section dsgr-reward">
        <h2 className="dsgr-h2">{dsgvoCopy.rewardHeading}</h2>
        <ul className="dsgr-list">
          {dsgvoCopy.rewardItems.map((t) => <li key={t.title}><strong>{t.title}:</strong> {t.body}</li>)}
        </ul>
      </section>

      <p className="dsgr-update">{dsgvoCopy.updateNote}</p>
      <p className="dsgr-disclaimer">{dsgvoCopy.disclaimer}</p>
    </article>
  );
}
```

- [ ] **Step 4: Write `dsgvo-report.css`** — light/print styles for the `.dsgr-*` classes used above (dark text on white): `.dsgr-badge` (Rechtsstand pill), `.dsgr-ampel-rot/gelb/gruen` header tint, `.dsgr-badge2-gruen/gelb/rot` verdict pills that survive print (`-webkit-print-color-adjust: exact; print-color-adjust: exact`), `.dsgr-tool` cards with page-break avoidance, `.dsgr-plan/.dsgr-list` spacing, muted `.dsgr-disclaimer/.dsgr-update`. Mirror the look of `components/scorecard/sc-report-doc.css`.

- [ ] **Step 5: Run tests** → PASS. **Step 6: Commit**

```bash
git add frontend/src/scorecards/dsgvo-check/DsgvoReportDoc.tsx frontend/src/scorecards/dsgvo-check/dsgvo-report.css frontend/src/scorecards/dsgvo-check/DsgvoReportDoc.test.tsx
git commit -m "feat(dsgvo-check): gated report doc (full plan, DPA links, templates, badge)"
```

---

### Task 16: `index.ts` registration + register in REGISTRATIONS

**Files:**
- Create: `frontend/src/scorecards/dsgvo-check/index.ts`
- Modify: `frontend/src/scorecards/index.ts`
- Test: `frontend/src/lib/scorecard/registry.test.ts` (add a lookup case)

- [ ] **Step 1: Write the failing test** — add to `registry.test.ts`:

```ts
import { getScorecard } from "./registry";

test("dsgvo-check is registered with resolve + custom views + tags", () => {
  const reg = getScorecard("dsgvo-check");
  expect(reg).toBeDefined();
  expect(typeof reg!.resolve).toBe("function");
  expect(reg!.ResultView).toBeDefined();
  expect(reg!.ReportDoc).toBeDefined();
  expect(typeof reg!.cleverreachTags).toBe("function");
});
```

- [ ] **Step 2: Run to verify fail** → FAIL (not registered).

- [ ] **Step 3: Implement `index.ts`:**

```ts
import type { ScorecardRegistration } from "@/lib/scorecard/registry";
import type { Answers, ScorecardResult } from "@/lib/scorecard/types";
import { definition } from "./definition";
import { content } from "./content";
import { branding } from "./branding";
import { recommend } from "./recommend";
import { DsgvoResultView } from "./DsgvoResultView";
import { DsgvoReportDoc } from "./DsgvoReportDoc";
import type { DsgvoResult } from "./types";

function tags(result: ScorecardResult, answers: Answers): string[] {
  const r = result as DsgvoResult;
  const out = [`ampel:${r.ampel}`, `risk:${r.riskClass}`];
  const tools = Array.isArray(answers.Q_TOOLS) ? answers.Q_TOOLS : [];
  for (const t of tools) out.push(`tool:${t}`);
  return out;
}

export const dsgvoCheck: ScorecardRegistration = {
  definition,
  content,
  branding,
  resolve: recommend,
  ResultView: DsgvoResultView,
  ReportDoc: DsgvoReportDoc,
  cleverreachTags: tags,
  meta: {
    title: "DSGVO-Check — darfst Du Deine KI-Tools rechtssicher nutzen?",
    description: "8 Fragen, 3 Minuten: pro Tool eine klare Ampel und ein konkreter Maßnahmenplan, wie Du KI DSGVO-konform einsetzt. Stand der Recherche Juni 2026.",
  },
  doiSubject: "Ein Klick noch, dann kommt Dein DSGVO-Report",
  deliverySubject: "Dein DSGVO-Report ist da",
  cleverreachSource: "dsgvo-check",
  bookingUrl: "https://calendly.com/danielkreuzhofer/30min",
};
```

> **Boundary risk + mitigation:** the registration now holds `"use client"` component references, and `registry.ts` is transitively imported by the API routes (submit/confirm). Next normally handles client-component references across the server boundary fine (the route gets a proxy, not the component/CSS code). **If** the build (Task 17 Step 3) errors with a CSS-in-server or client-boundary message originating from an API route, the fix is: move `ResultView`/`ReportDoc` out of the shared registration into a slug-keyed map in a separate module imported **only** by the two page routes (`[scorecardSlug]/page.tsx`, `.../report/page.tsx`), leaving the data-only fields (`resolve`, `cleverreachTags`, content, branding, subjects) in the registry the API routes use. Keep the components in the registration unless the build forces this split.

- [ ] **Step 4: Register** in `frontend/src/scorecards/index.ts` — add `dsgvoCheck` to `REGISTRATIONS`:

```ts
import { kiFuehrungsCheck } from "./ki-fuehrungs-check";
import { dsgvoCheck } from "./dsgvo-check";

export const REGISTRATIONS = [kiFuehrungsCheck, dsgvoCheck];
```

- [ ] **Step 5: Run tests** → PASS.

Run: `npm test --prefix frontend -- registry.test.ts`

- [ ] **Step 6: Commit**

```bash
git add frontend/src/scorecards/dsgvo-check/index.ts frontend/src/scorecards/index.ts frontend/src/lib/scorecard/registry.test.ts
git commit -m "feat(dsgvo-check): register scorecard (resolve + custom views + tags)"
```

---

## Milestone 4 — Verification

### Task 17: Full suite, lint, build, manual smoke

- [ ] **Step 1: Full test suite**

Run: `npm test --prefix frontend`
Expected: all green (engine seams + dsgvo-check + unchanged KFC/Engpass).

- [ ] **Step 2: Lint**

Run: `npm run lint --prefix frontend`
Expected: clean.

- [ ] **Step 3: Build (confirms the `/dsgvo-check` SSG route + report route compile)**

Run: `npm run build:local --prefix frontend`
Expected: success; `/dsgvo-check` appears in the route manifest (via `generateStaticParams`).

- [ ] **Step 4: Manual smoke** — `npm run dev:local --prefix frontend`, open `/dsgvo-check`, answer through (incl. a multi-select with "Weiter"), confirm the free result shows the ampel + matrix.

> **Visual-QA gotcha (this repo):** the Playwright MCP screenshot tool reproducibly crashes on the long *dark* funnel/result pages. `navigate`/DOM-snapshot work; *light* pages screenshot fine. To reach the result without clicking through, inject `sessionStorage["scorecard:dsgvo-check:state"] = {phase:"result",index:7,answers:{…}}` then reload. The gated `/report` (needs DB+token) can be previewed via a throwaway route or a seeded DB row.

- [ ] **Step 5: Final commit (if any smoke fixes)**

```bash
git add -A && git commit -m "fix(dsgvo-check): smoke-test fixes"
```

---

## Out of scope / Daniel's follow-ups (from the spec)

- Reward-template *content* (Muster-Richtlinie, AVV-Checkliste, Literacy-Plan) — the views render placeholders/headings now; final prose is content work.
- Legal sign-off: disclaimer wording, verdict phrasing, **Art. 4 fine figure** (research 15M€/3% vs old 7,5M€/1,5%).
- Go-live like KFC: CleverReach group/segment `dsgvo-check` + per-tool tags, Datenschutz section parity, real video/booking URLs, prod env + (no migration needed).
- Branded DOI/delivery email copy specific to the DSGVO-Report (M2 generic templates work until then).
```
