# Scorecard Engine — M3 Renderer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the generic, config-driven scorecard **frontend** on top of the M1 engine + M2 backend — a content-block + branding-driven renderer (intro → quiz → free result → opt-in) plus a token-gated report page, served from a dynamic `[scorecardSlug]` route. No real scorecard ships here; the renderer is proven against a **sample content** for the M1 `SAMPLE_DEFINITION`. Registering the actual KI-Führungs-Check (definition + content + branding) is a thin follow-up, gated on Daniel's content approval.

**Architecture:** Generalize the proven Engpass UI (`app/engpass-check/EngpassCheck.tsx` client state machine + `Report.tsx` block renderer) into config-driven components that read a **registration** (engine definition + content blocks + branding tokens). Branding is applied as CSS custom properties on the shell, so one stylesheet themes every scorecard. The dynamic route uses `generateStaticParams` from the M2 registry so only registered slugs become pages.

**Tech Stack:** Next.js 16 App Router (client component for the quiz, server component for routing/report page), React 19, Jest + Testing Library (jsdom for components), the M1 engine (`buildResult`) run client-side for the live result and server-side at submit (already in M2).

**Builds on:** M1 (`lib/scorecard/` engine) + M2 (registry, `scorecard_submissions`, submit/confirm API). **Design source:** `docs/superpowers/specs/2026-06-23-scorecard-engine-design.md`.

**Conventions:** mirror `app/engpass-check/` (the `ec-*` class system, sessionStorage-keyed restore that's StrictMode-safe, opt-in POST, createPortal not needed here). Co-located `*.test.tsx`. The result screen shows the full report free (points 1–8 equivalent); opt-in gates the toolkit; the report page (token) shows report + toolkit.

---

## Phase A — Content model + registration + branding

### Task A1: Content model types

**Files:** Create `frontend/src/lib/scorecard/content.ts`

- [ ] **Step 1: Write `content.ts`**

```ts
/**
 * Generic scorecard content model — the renderer-facing data for a scorecard.
 * Generalized from the Engpass `report-content.ts` structure: per-outcome blocks
 * plus shared blocks. All strings are in the scorecard owner's voice; `{score}`
 * is interpolated at render time.
 */

/** Per-outcome report blocks (one set per band/argmax outcome key). */
export interface OutcomeContent {
  /** Full diagnosis prose; `{score}` is replaced with the normalized score. */
  diagnose: string;
  /** Concrete next steps. */
  schritte: string[];
  /** What to avoid. */
  antiPattern: string;
}

/** Personalisation: one extra paragraph keyed by the answer to a context question. */
export interface PersonalisierungRule {
  questionId: string;
  byAnswer: Record<string, string>;
}

/** A clickable source; shown only when the outcome is in `shownFor` (or always). */
export interface SourceRef {
  id: string;
  text: string;
  url: string;
  /** Outcome keys this source applies to; omitted = always shown. */
  shownFor?: string[];
}

export interface ScorecardContent {
  intro: { heading: string; lead: string; startLabel: string; meta: string };
  resultHeading: string;
  /** Outcome key → display name (e.g. "vorbild" → "Vorbild"). */
  outcomeLabel: Record<string, string>;
  /** Optional score-intro paragraph per outcome (`{score}` interpolated). */
  scoreParagraph?: Record<string, string>;
  byOutcome: Record<string, OutcomeContent>;
  personalisierung?: PersonalisierungRule;
  /** The free "tool" block (e.g. the KI-Challenge-Frage). */
  freeTool?: { label: string; body: string };
  sources: SourceRef[];
  optin: {
    heading: string;
    body: string;
    button: string;
    consent: string;
    datenschutzHref: string;
    successHeading: string;
    successBody: string;
    errorBody: string;
    emailLabel: string;
    emailPlaceholder: string;
  };
  video?: { intro: string; title: string; label: string; url: string };
}
```

- [ ] **Step 2: Verify** `npx tsc --noEmit -p frontend/tsconfig.json 2>&1 | grep -i "scorecard/content" || echo clean` → `clean`
- [ ] **Step 3: Commit** `git add frontend/src/lib/scorecard/content.ts && git commit -m "feat(scorecard): renderer content model"`

---

### Task A2: Branding tokens + registration extension

**Files:** Create `frontend/src/lib/scorecard/branding.ts`; Modify `frontend/src/lib/scorecard/registry.ts`

- [ ] **Step 1: Write `branding.ts`**

```ts
/**
 * Brand tokens → CSS custom properties. One generic stylesheet (sc.css) reads
 * these vars, so each scorecard themes itself by supplying values only.
 */
import type { CSSProperties } from "react";

export interface BrandTokens {
  bg: string;
  surface: string;
  ink: string;
  inkMuted: string;
  accent: string;
  accentInk: string;
  brandName: string;
  brandAuthor: string;
}

/** Map tokens to the `--sc-*` custom properties for the shell's inline style. */
export function brandStyle(b: BrandTokens): CSSProperties {
  return {
    ["--sc-bg" as string]: b.bg,
    ["--sc-surface" as string]: b.surface,
    ["--sc-ink" as string]: b.ink,
    ["--sc-ink-muted" as string]: b.inkMuted,
    ["--sc-accent" as string]: b.accent,
    ["--sc-accent-ink" as string]: b.accentInk,
  };
}
```

- [ ] **Step 2: Extend `ScorecardRegistration`** — in `registry.ts` add `content`, `branding`, `meta` to the interface (keep the M2 fields):

```ts
import type { ScorecardContent } from "./content";
import type { BrandTokens } from "./branding";
// ...existing imports...

export interface ScorecardRegistration {
  definition: ScorecardDefinition;
  doiSubject: string;
  deliverySubject: string;
  cleverreachSource?: string;
  /** Page <head> metadata. */
  meta: { title: string; description: string };
  /** Renderer content + theme. */
  content: ScorecardContent;
  branding: BrandTokens;
}
```

- [ ] **Step 3: Verify** the existing registry tests still pass: `npm test --prefix frontend -- src/lib/scorecard/registry.test.ts` (the M2 test constructs a registration literal — it will now FAIL to typecheck because `content`/`branding`/`meta` are required). **Update `registry.test.ts`'s `reg` fixture** to include minimal `meta`, `content`, `branding` (import the sample from Task A3 once it exists; for this step, add inline stubs). Re-run → PASS.

> Implementation note: do Task A3 (sample content + registration) BEFORE finalizing A2's test so the registry test can import `SAMPLE_REGISTRATION`. Sequence: write A2 interface → A3 sample → point the registry test at `SAMPLE_REGISTRATION`.

- [ ] **Step 4: Verify + commit** tsc/eslint clean; `git add frontend/src/lib/scorecard/branding.ts frontend/src/lib/scorecard/registry.ts && git commit -m "feat(scorecard): brand tokens + registration carries content/branding/meta"`

---

### Task A3: Sample registration (test fixture)

**Files:** Create `frontend/src/lib/scorecard/__fixtures__/sample-registration.ts`

- [ ] **Step 1: Write the sample registration** wiring `SAMPLE_DEFINITION` to minimal-but-real content for its 4 bands (`einkaeufer`/`verwalter`/`mitmacher`/`vorbild`):

```ts
import type { ScorecardRegistration } from "../registry";
import { SAMPLE_DEFINITION } from "./sample-definition";

export const SAMPLE_REGISTRATION: ScorecardRegistration = {
  definition: SAMPLE_DEFINITION,
  doiSubject: "Bestätige Deine Anmeldung",
  deliverySubject: "Dein Ergebnis ist da",
  meta: { title: "Sample-Check", description: "Ein Beispiel-Scorecard." },
  branding: {
    bg: "#0e0e10",
    surface: "#17171b",
    ink: "#f5f5f5",
    inkMuted: "#a0a0a8",
    accent: "#ff6a3d",
    accentInk: "#0e0e10",
    brandName: "Sample",
    brandAuthor: "Daniel Kreuzhofer",
  },
  content: {
    intro: {
      heading: "Der Sample-Check",
      lead: "2 Fragen, sofort ein Ergebnis.",
      startLabel: "Check starten",
      meta: "2 Fragen · sofort · ohne Anmeldung",
    },
    resultHeading: "Dein Ergebnis",
    outcomeLabel: {
      einkaeufer: "Einkäufer",
      verwalter: "Verwalter",
      mitmacher: "Mitmacher",
      vorbild: "Vorbild",
    },
    byOutcome: {
      einkaeufer: { diagnose: "{score}/100 — Einkäufer. Beispiel-Diagnose.", schritte: ["Schritt eins.", "Schritt zwei.", "Schritt drei."], antiPattern: "Vermeide X." },
      verwalter: { diagnose: "{score}/100 — Verwalter. Beispiel-Diagnose.", schritte: ["Schritt eins.", "Schritt zwei.", "Schritt drei."], antiPattern: "Vermeide X." },
      mitmacher: { diagnose: "{score}/100 — Mitmacher. Beispiel-Diagnose.", schritte: ["Schritt eins.", "Schritt zwei.", "Schritt drei."], antiPattern: "Vermeide X." },
      vorbild: { diagnose: "{score}/100 — Vorbild. Beispiel-Diagnose.", schritte: ["Schritt eins.", "Schritt zwei.", "Schritt drei."], antiPattern: "Vermeide X." },
    },
    personalisierung: { questionId: "K1", byAnswer: { gf: "Als GF gilt für Dich besonders …" } },
    freeTool: { label: "Dein Werkzeug", body: "Die eine Frage: Beispiel." },
    sources: [{ id: "s1", text: "Beispiel-Quelle (2025)", url: "https://example.com" }],
    optin: {
      heading: "Dein Ergebnis steht. Jetzt das Werkzeug.",
      body: "Trag Deine E-Mail ein, ich schick Dir das Toolkit.",
      button: "Toolkit anfordern",
      consent: "Mit Klick willige ich ein … (Beispiel-Consent).",
      datenschutzHref: "/datenschutz",
      successHeading: "Fast geschafft — schau in Dein Postfach",
      successBody: "Ein Klick auf den Link, dann hast Du Dein Toolkit.",
      errorBody: "Da ist etwas schiefgelaufen — bitte gleich nochmal.",
      emailLabel: "E-Mail-Adresse",
      emailPlaceholder: "dein.name@firma.de",
    },
    video: { intro: "Das ganze Denkmodell steckt im Video:", title: "Beispiel-Video", label: "Video", url: "" },
  },
};
```

- [ ] **Step 2: Point `registry.test.ts` at `SAMPLE_REGISTRATION`** (replace the inline `reg` stub). Run → PASS.
- [ ] **Step 3: Verify + commit** tsc/eslint clean; `git add frontend/src/lib/scorecard/__fixtures__/sample-registration.ts frontend/src/lib/scorecard/registry.test.ts && git commit -m "test(scorecard): sample registration fixture"`

---

### Task A4: Report-model builder (selection logic)

**Files:** Create `frontend/src/lib/scorecard/report-model.ts` + `report-model.test.ts`

- [ ] **Step 1: Write the failing test** (selection: pick the outcome's blocks, the personalisation paragraph for the lead's answer, the sources for the outcome, score interpolation):

```ts
import { SAMPLE_REGISTRATION } from "./__fixtures__/sample-registration";
import { buildScorecardReport } from "./report-model";
import { buildResult } from "./result";

const reg = SAMPLE_REGISTRATION;

describe("buildScorecardReport", () => {
  it("selects the outcome's blocks, interpolates the score, and resolves the lever label", () => {
    const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" }; // score 50 → verwalter
    const result = buildResult(reg.definition, answers);
    const m = buildScorecardReport(reg, result, answers);
    expect(m.outcomeLabel).toBe("Verwalter");
    expect(m.diagnose).toContain("50/100");
    expect(m.schritte).toHaveLength(3);
    expect(m.antiPattern).toBe("Vermeide X.");
  });

  it("includes the personalisation paragraph for the lead's context answer", () => {
    const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" };
    const m = buildScorecardReport(reg, buildResult(reg.definition, answers), answers);
    expect(m.bedeutung).toEqual(["Als GF gilt für Dich besonders …"]);
  });

  it("omits the personalisation paragraph when the answer has no mapping", () => {
    const answers = { K1: "team", K2: "small", S1: "never", S2: "no" };
    const m = buildScorecardReport(reg, buildResult(reg.definition, answers), answers);
    expect(m.bedeutung).toEqual([]);
  });

  it("shows sources whose shownFor includes the outcome (or has none)", () => {
    const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" };
    const m = buildScorecardReport(reg, buildResult(reg.definition, answers), answers);
    expect(m.sources.map((s) => s.id)).toEqual(["s1"]); // s1 has no shownFor → always
  });
});
```

- [ ] **Step 2: Run** → FAIL (module missing).
- [ ] **Step 3: Write `report-model.ts`**

```ts
/**
 * Generic scorecard report model — pure selection over a registration + result.
 * Analogue of the Engpass `buildReportModel`, but driven entirely by content data.
 */

import type { ScorecardRegistration } from "./registry";
import type { SourceRef } from "./content";
import type { Answers, ScorecardResult } from "./types";

export interface ScorecardReport {
  score: number;
  outcome: string;
  outcomeLabel: string;
  scoreParagraph?: string;
  diagnose: string;
  bedeutung: string[];
  schritte: string[];
  antiPattern: string;
  freeTool?: { label: string; body: string };
  sources: SourceRef[];
}

export function buildScorecardReport(
  reg: ScorecardRegistration,
  result: ScorecardResult,
  answers: Answers,
): ScorecardReport {
  const c = reg.content;
  const outcome = result.outcome;
  const fill = (s: string) => s.replace(/\{score\}/g, String(result.score));
  const block = c.byOutcome[outcome];
  if (!block) throw new Error(`No content for outcome "${outcome}"`);

  const bedeutung: string[] = [];
  if (c.personalisierung) {
    const answer = answers[c.personalisierung.questionId];
    const para = answer ? c.personalisierung.byAnswer[answer] : undefined;
    if (para) bedeutung.push(para);
  }

  const sources = c.sources.filter((s) => !s.shownFor || s.shownFor.includes(outcome));

  return {
    score: result.score,
    outcome,
    outcomeLabel: c.outcomeLabel[outcome] ?? outcome,
    scoreParagraph: c.scoreParagraph?.[outcome] ? fill(c.scoreParagraph[outcome]) : undefined,
    diagnose: fill(block.diagnose),
    bedeutung,
    schritte: block.schritte,
    antiPattern: block.antiPattern,
    freeTool: c.freeTool,
    sources,
  };
}
```

- [ ] **Step 4: Run** → PASS (4 tests). **Step 5: Commit** `git add frontend/src/lib/scorecard/report-model.ts frontend/src/lib/scorecard/report-model.test.ts && git commit -m "feat(scorecard): report-model selection logic"`

---

## Phase B — Components

### Task B1: Result/report block renderer (`ScorecardReportView`)

**Files:** Create `frontend/src/components/scorecard/ScorecardReportView.tsx` + test

This is the generic analogue of `app/engpass-check/Report.tsx` — it renders a `ScorecardReport` (score, score-paragraph, outcome heading + diagnose, "Was das bedeutet", Schritte, Anti-Pattern, free tool, sources). Reuse the proven `Paragraphs` split-on-`\n\n` helper. Use generic `sc-*` classes.

- [ ] **Step 1: Write the failing test** (`ScorecardReportView.test.tsx`): render with a `buildScorecardReport(SAMPLE_REGISTRATION, …)` model; assert the outcome label heading, a Schritt, the anti-pattern, and a source link appear.

```tsx
import { render, screen } from "@testing-library/react";
import { ScorecardReportView } from "./ScorecardReportView";
import { SAMPLE_REGISTRATION } from "@/lib/scorecard/__fixtures__/sample-registration";
import { buildScorecardReport } from "@/lib/scorecard/report-model";
import { buildResult } from "@/lib/scorecard/result";

const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" };
const model = buildScorecardReport(
  SAMPLE_REGISTRATION,
  buildResult(SAMPLE_REGISTRATION.definition, answers),
  answers,
);

it("renders the outcome, steps, anti-pattern, and sources", () => {
  render(<ScorecardReportView model={model} labels={{ schritte: "Deine Schritte", antiPattern: "Vermeide", quellen: "Quellen", bedeutung: "Was das bedeutet" }} />);
  expect(screen.getByRole("heading", { name: /Verwalter/ })).toBeInTheDocument();
  expect(screen.getByText("Schritt eins.")).toBeInTheDocument();
  expect(screen.getByText("Vermeide X.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Beleg ansehen|ansehen/ })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement `ScorecardReportView.tsx`** — a `{ model, labels }` component mirroring `Report.tsx`'s structure (score block, optional scoreParagraph, `<h2>{model.outcomeLabel}</h2>` + diagnose, bedeutung section when non-empty, ordered Schritte, anti-pattern, free-tool block when present, sources list with external links). Provide the `Paragraphs` helper inline (copy from `Report.tsx`). Section labels come from the `labels` prop (defaulted by the caller). **Step 4: Run** → PASS. **Step 5: Commit** `feat(scorecard): generic report block renderer`.

---

### Task B2: Quiz client app (`ScorecardApp`)

**Files:** Create `frontend/src/components/scorecard/ScorecardApp.tsx` + test

Generalize `EngpassCheck.tsx`: a `"use client"` component taking `{ registration }`. Same intro→quiz→result reducer + StrictMode-safe sessionStorage restore (key = `scorecard:${slug}:state`). Quiz reads `registration.definition.questions`. Result computes `buildResult(registration.definition, answers)` client-side, builds the report via `buildScorecardReport`, renders `ScorecardReportView` + opt-in + video. Opt-in POSTs to `/api/scorecard/${slug}/submit`. Branding via `style={brandStyle(registration.branding)}` on the shell. Reuse the trackmysales `captureTrackingId` (already generic in `lib/engpass-check/tracking.ts` — import it; it is not Engpass-specific logic).

- [ ] **Step 1: Write the failing test** (`ScorecardApp.test.tsx`, jsdom): render `<ScorecardApp registration={SAMPLE_REGISTRATION} />`; click "Check starten"; answer both score+context questions by clicking the option labels; assert the result heading + an opt-in button appear; assert the toolkit/PDF content is NOT on screen (gated). Mock `fetch` for the opt-in submit and assert it posts to `/api/scorecard/sample/submit`. (Model the flow on `EngpassCheck.test.tsx`.)

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement `ScorecardApp.tsx`** — full generalization of `EngpassCheck.tsx` (paste-and-parameterize: replace `QUESTIONS`→`registration.definition.questions`, `computeResult/buildReportModel`→`buildResult/buildScorecardReport`, copy→`registration.content`, POST URL→`/api/scorecard/${slug}/submit`, storage key→slug-scoped, shell `style`→`brandStyle`). Keep the reducer, the two restore/persist effects, the Intro/Quiz/Result/OptIn/Video subcomponents. **Step 4: Run** → PASS. **Step 5: Commit** `feat(scorecard): generic config-driven quiz app`.

---

## Phase C — Routes

### Task C1: Dynamic scorecard route

**Files:** Create `frontend/src/app/[scorecardSlug]/page.tsx`

- [ ] **Step 1: Write `page.tsx`** (server component): `generateStaticParams` returns `REGISTRATIONS.map(r => ({ scorecardSlug: r.definition.slug }))` so only registered slugs become routes (M2's `REGISTRATIONS` is empty until KFC is registered — that's fine; the route resolves nothing until then). `generateMetadata` reads `getScorecard(slug)?.meta`. The page calls `getScorecard(slug)`; `notFound()` if missing; else renders `<ScorecardApp registration={reg} />`. Import the generic `sc.css`.

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getScorecard } from "@/lib/scorecard/registry";
import { REGISTRATIONS } from "@/scorecards";
import { ScorecardApp } from "@/components/scorecard/ScorecardApp";
import "@/components/scorecard/sc.css";

export function generateStaticParams() {
  return REGISTRATIONS.map((r) => ({ scorecardSlug: r.definition.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ scorecardSlug: string }> }): Promise<Metadata> {
  const { scorecardSlug } = await params;
  const reg = getScorecard(scorecardSlug);
  return reg ? { title: reg.meta.title, description: reg.meta.description } : {};
}

export default async function ScorecardPage({ params }: { params: Promise<{ scorecardSlug: string }> }) {
  const { scorecardSlug } = await params;
  const reg = getScorecard(scorecardSlug);
  if (!reg) notFound();
  return <ScorecardApp registration={reg} />;
}
```

- [ ] **Step 2: Create a minimal `sc.css`** using the `--sc-*` custom properties (generalize the `ec-*` rules from `app/engpass-check/engpass-check.css` — same layout, colors via vars). Keep the class names the components use (`sc-shell`, `sc-card`, `sc-btn`, `sc-option`, …).
- [ ] **Step 3: Verify** the route compiles + `generateStaticParams` returns `[]` safely (REGISTRATIONS empty). `npm run build:local --prefix frontend` should not error on this route. (If a full build is too heavy in CI, at least tsc + a render test.)
- [ ] **Step 4: Commit** `feat(scorecard): dynamic [scorecardSlug] route + theme stylesheet`

---

### Task C2: Token-gated report page

**Files:** Create `frontend/src/app/[scorecardSlug]/report/page.tsx` + a `ScorecardReportDocument` component (report + toolkit) + test

This is the M2 confirm-redirect target (`/<slug>/report?token=`). Server component: read `?token`, `findScorecardByReportToken(token)`, `notFound()` if missing or slug mismatch; rebuild the report from the stored `submission.result` + `submission.answers` via `buildScorecardReport`; render `ScorecardReportView` (full report) + the toolkit (M3 toolkit content is per-scorecard; for the sample, render a placeholder toolkit section). Mark `noindex`.

- [ ] **Step 1: Write a render test** for `ScorecardReportDocument` (the report + toolkit view) against the sample model, asserting report blocks render.
- [ ] **Step 2: Implement `ScorecardReportDocument.tsx`** (reuses `ScorecardReportView` + a toolkit block driven by an optional `content.toolkit` — define a minimal `ToolkitContent` type addition to `content.ts` only if needed; otherwise render the free blocks). **Step 3: Implement `report/page.tsx`** (server: token lookup via `@/db/scorecard-submissions`, `buildScorecardReport`, render; `export const metadata = { robots: { index: false } }`). **Step 4: Run tests** → PASS. **Step 5: Commit** `feat(scorecard): token-gated report page`.

> The submission's `result` is a `ScorecardResult` (no answers needed for outcome, but personalisation needs `answers` — both are stored, so pass `submission.answers`).

---

## Final verification
- [ ] `npm test --prefix frontend -- --testPathPatterns="scorecard"` → all green.
- [ ] `cd frontend && npx eslint src/lib/scorecard src/components/scorecard "src/app/[scorecardSlug]"; echo EXIT=$?; cd ..` → 0.
- [ ] `npx tsc --noEmit -p frontend/tsconfig.json 2>&1 | grep -iE "scorecard" || echo clean` → clean.
- [ ] Engpass untouched: `git diff <M3-base>..HEAD --stat | grep -E "engpass-check" || echo "engpass untouched"`.

## Follow-on (NOT in this plan): register KI-Führungs-Check
Once Daniel approves the KFC content (vault spec → questions/bands/typ-names/diagnose/schritte/anti-pattern/personalisierung/challenge/sources/opt-in), add `frontend/src/scorecards/ki-fuehrungs-check/` (`definition.ts` + `content.ts` + `branding.ts`), push a `ScorecardRegistration` into `REGISTRATIONS`, build per-scorecard email templates, add the toolkit content, and the Datenschutz section. The renderer needs no changes — KFC becomes data. **Source note (verified in the vault research note `Research - KI ohne Leadership transformiert nicht.md`, vote 3-0):** the RAND 84% is CORRECT — it means *84% (42 of 50 industry practitioners) name leadership as the main failure cause* (RAND 2024 "Why AI Projects Fail", study of 65 practitioners total). Frame it as "84% of surveyed practitioners", NOT "84% of failures" (the common secondary-source error). The KFC quiz-spec source line currently reads "n=65, 84%" — correct it to "84% = 42 of 50 industry practitioners (study 65 total)" when registering KFC. Do NOT substitute ">80% of AI projects fail" — that claim was adversarially killed in the research note as unsupported.

## Self-Review
- **Spec coverage:** content model (A1) ✓; branding + registration (A2) ✓; sample fixture (A3) ✓; selection logic (A4) ✓; block renderer (B1) ✓; quiz app (B2) ✓; dynamic route + theme (C1) ✓; token report page (C2) ✓. KFC content = follow-on (gated), stated.
- **Placeholders:** the two large UI components (B1 `ScorecardReportView`, B2 `ScorecardApp`) are specified as "generalize the named existing file with these exact substitutions" rather than re-pasting ~380 lines — the existing files (`Report.tsx`, `EngpassCheck.tsx`) are the literal templates and the substitutions are enumerated. The genuinely new code (model, branding, report-model, route, fixture) is given in full. The `sc.css` is "generalize `engpass-check.css` with `--sc-*` vars".
- **Type consistency:** `ScorecardContent`/`OutcomeContent`/`SourceRef` (A1) → `ScorecardRegistration` (A2) → `SAMPLE_REGISTRATION` (A3) → `buildScorecardReport`/`ScorecardReport` (A4) → `ScorecardReportView` (B1) + `ScorecardApp` (B2) → routes (C1/C2). `getScorecard`/`REGISTRATIONS` reused from M2.
