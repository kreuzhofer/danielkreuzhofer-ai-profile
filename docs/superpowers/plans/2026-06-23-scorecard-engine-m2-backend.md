# Scorecard Engine — M2 Funnel Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the generic scorecard funnel backend on top of the M1 engine — persistence, registry, submit/confirm API with server-side re-scoring, transactional email, CleverReach push, retention, and rate-limiting — driven entirely by a scorecard registration. No real scorecard ships here (KFC is M3); the backend is verified with the M1 `SAMPLE_DEFINITION` and mocked IO.

**Architecture:** Mirrors the proven Engpass-Check backend (`api/engpass-check/route.ts`, `lib/engpass-check/confirm.ts`, `db/submissions.ts`, `lib/email`, `lib/engpass-check/cleverreach.ts`, `api/cron/purge`) but generic and slug-driven. New generic `scorecard_submissions` table with a `result jsonb`; the Engpass-Check stays 100% untouched (its own table + code). CleverReach gets **tags only** (hybrid model — all lead data stays in our DB), exactly as Engpass does.

**Tech Stack:** Next.js route handlers, Drizzle + Postgres, nodemailer (IONOS) via `lib/email/transporter`, Jest (`@jest-environment node`, `jest.mock` for IO), fast-check where useful.

**Design source:** `docs/superpowers/specs/2026-06-23-scorecard-engine-design.md`. **Builds on:** M1 (`frontend/src/lib/scorecard/`).

**Conventions to follow (from the existing codebase):**
- Lazy DB client: `getDb()` / `isDatabaseConfigured()` from `@/db/client`.
- Repos are the only place touching their table (see `db/submissions.ts`).
- Routes: validate body → `isDatabaseConfigured()` guard (503) → recompute server-side → tokens → persist → email; map `EmailNotConfiguredError` → 503; never leak internals.
- Tests mock `@/lib/logger`, the repo, `@/db/client`, email, CleverReach (see `route.test.ts` / `confirm.test.ts`).
- The thin repo layer is **not** unit-tested directly (Engpass doesn't); it's covered via the route/confirm tests with the repo mocked. Follow that pattern.

---

## Phase A — Persistence

### Task A1: `scorecard_submissions` table

**Files:**
- Modify: `frontend/src/db/schema.ts` (append a new table; do NOT change the existing `submissions` table)

- [ ] **Step 1: Append to `schema.ts`** (after the existing `submissions` exports)

```ts
import type { ScorecardResult } from "../lib/scorecard/types";

/**
 * Generic scorecard funnel state — one row per opt-in. The scorecard-specific
 * result lives in `result jsonb` (no per-scorecard columns), so this one table
 * serves every config-driven scorecard. The Engpass-Check uses its own
 * `submissions` table and is unaffected.
 */
export const scorecardSubmissions = pgTable(
  "scorecard_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Scorecard slug, e.g. "ki-fuehrungs-check". */
    scorecard: text("scorecard").notNull(),
    email: text("email").notNull(),
    /** Selected option ids, e.g. { K1: "gf", S1: "daily" }. */
    answers: jsonb("answers").notNull().$type<Record<string, string>>(),
    /** Denormalized engine result (score, outcome, categoryScores, …). */
    result: jsonb("result").notNull().$type<ScorecardResult>(),

    doiStatus: text("doi_status").notNull().default("pending"), // pending | confirmed | expired
    doiToken: text("doi_token").notNull().unique(),
    reportToken: text("report_token").notNull().unique(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),

    ipAtSubmit: text("ip_at_submit"),
    userAgent: text("user_agent"),
    tid: text("tid"),

    cleverreachSynced: boolean("cleverreach_synced").notNull().default(false),
  },
  (t) => [
    index("scorecard_submissions_scorecard_idx").on(t.scorecard),
    index("scorecard_submissions_created_at_idx").on(t.createdAt),
  ],
);

export type ScorecardSubmission = typeof scorecardSubmissions.$inferSelect;
export type NewScorecardSubmission = typeof scorecardSubmissions.$inferInsert;
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p frontend/tsconfig.json 2>&1 | grep -iE "db/schema|scorecard" || echo "clean"`
Expected: `clean`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/db/schema.ts
git commit -m "feat(scorecard): scorecard_submissions table (generic result jsonb)"
```

---

### Task A2: Drizzle migration

**Files:**
- Create (generated): `frontend/src/db/migrations/*_*.sql` (+ drizzle journal/meta updates)

- [ ] **Step 1: Generate the migration**

Run: `cd frontend && npx drizzle-kit generate && cd ..`
Expected: a new SQL file under `frontend/src/db/migrations/` creating `scorecard_submissions` with its unique constraints + the two indexes, plus updated `meta/_journal.json`. (Generation needs no live DB; `drizzle.config.ts` falls back to a placeholder URL.)

- [ ] **Step 2: Sanity-check the generated SQL**

Run: `ls -t frontend/src/db/migrations/*.sql | head -1 | xargs grep -c "scorecard_submissions"`
Expected: a non-zero count (the new table is in the migration).

> Applying the migration to a real DB (`npm run db:migrate`) is an ops step that needs a running Postgres — out of scope for this task; we only generate + commit the SQL artifact.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/db/migrations
git commit -m "feat(scorecard): drizzle migration for scorecard_submissions"
```

---

### Task A3: Repository

**Files:**
- Create: `frontend/src/db/scorecard-submissions.ts`

- [ ] **Step 1: Write the repo** (mirrors `db/submissions.ts`)

```ts
/**
 * Scorecard submissions repository — the only place that talks to the
 * scorecard_submissions table.
 */

import { and, eq, lt } from "drizzle-orm";
import { getDb } from "./client";
import {
  scorecardSubmissions,
  type NewScorecardSubmission,
  type ScorecardSubmission,
} from "./schema";

export async function insertScorecardSubmission(
  data: NewScorecardSubmission,
): Promise<ScorecardSubmission> {
  const [row] = await getDb().insert(scorecardSubmissions).values(data).returning();
  return row;
}

export async function findScorecardByDoiToken(
  token: string,
): Promise<ScorecardSubmission | undefined> {
  const [row] = await getDb()
    .select()
    .from(scorecardSubmissions)
    .where(eq(scorecardSubmissions.doiToken, token))
    .limit(1);
  return row;
}

export async function findScorecardByReportToken(
  token: string,
): Promise<ScorecardSubmission | undefined> {
  const [row] = await getDb()
    .select()
    .from(scorecardSubmissions)
    .where(eq(scorecardSubmissions.reportToken, token))
    .limit(1);
  return row;
}

/** Mark confirmed. Returns the updated row (undefined if not found). */
export async function confirmScorecardSubmission(
  id: string,
): Promise<ScorecardSubmission | undefined> {
  const [row] = await getDb()
    .update(scorecardSubmissions)
    .set({ doiStatus: "confirmed", confirmedAt: new Date() })
    .where(eq(scorecardSubmissions.id, id))
    .returning();
  return row;
}

export async function markScorecardCleverreachSynced(id: string): Promise<void> {
  await getDb()
    .update(scorecardSubmissions)
    .set({ cleverreachSynced: true })
    .where(eq(scorecardSubmissions.id, id));
}

/** DSGVO retention: delete unconfirmed scorecard submissions older than `cutoff`. */
export async function purgeScorecardPendingOlderThan(cutoff: Date): Promise<number> {
  const rows = await getDb()
    .delete(scorecardSubmissions)
    .where(
      and(eq(scorecardSubmissions.doiStatus, "pending"), lt(scorecardSubmissions.createdAt, cutoff)),
    )
    .returning({ id: scorecardSubmissions.id });
  return rows.length;
}
```

- [ ] **Step 2: Verify compiles + lint**

Run: `npx tsc --noEmit -p frontend/tsconfig.json 2>&1 | grep -i "scorecard-submissions" || echo "clean"` → `clean`
Run: `cd frontend && npx eslint src/db/scorecard-submissions.ts; echo "EXIT=$?"; cd ..` → `EXIT=0`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/db/scorecard-submissions.ts
git commit -m "feat(scorecard): scorecard_submissions repository"
```

---

## Phase B — Building blocks

### Task B1: Registry

**Files:**
- Create: `frontend/src/lib/scorecard/registry.ts`
- Create: `frontend/src/scorecards/index.ts`
- Test: `frontend/src/lib/scorecard/registry.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { buildRegistry, type ScorecardRegistration } from "./registry";
import { SAMPLE_DEFINITION } from "./__fixtures__/sample-definition";

const reg: ScorecardRegistration = {
  definition: SAMPLE_DEFINITION,
  doiSubject: "Bestätige Deine Anmeldung",
  deliverySubject: "Dein Ergebnis ist da",
};

describe("buildRegistry", () => {
  it("looks a scorecard up by its definition slug", () => {
    const get = buildRegistry([reg]);
    expect(get("sample")).toBe(reg);
  });

  it("returns undefined for an unknown slug", () => {
    const get = buildRegistry([reg]);
    expect(get("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/lib/scorecard/registry.test.ts`
Expected: FAIL — module/exports not found.

- [ ] **Step 3: Write `registry.ts`**

```ts
/**
 * Scorecard registry — maps a slug to everything the funnel backend needs
 * beyond the engine definition (email subjects, CleverReach source). Scorecards
 * are registered as code in `src/scorecards`; new ones ship via git (no DB/admin).
 */

import { REGISTRATIONS } from "@/scorecards";
import type { ScorecardDefinition } from "./types";

export interface ScorecardRegistration {
  definition: ScorecardDefinition;
  /** Transactional email subjects (German). */
  doiSubject: string;
  deliverySubject: string;
  /** CleverReach `source` + base tag; defaults to the slug. */
  cleverreachSource?: string;
}

/** Pure: build a slug→registration lookup. Exported for testing. */
export function buildRegistry(
  regs: ScorecardRegistration[],
): (slug: string) => ScorecardRegistration | undefined {
  const bySlug = new Map(regs.map((r) => [r.definition.slug, r]));
  return (slug) => bySlug.get(slug);
}

const lookup = buildRegistry(REGISTRATIONS);

export function getScorecard(slug: string): ScorecardRegistration | undefined {
  return lookup(slug);
}
```

- [ ] **Step 4: Write `src/scorecards/index.ts`** (empty until M3 adds KFC)

```ts
import type { ScorecardRegistration } from "@/lib/scorecard/registry";

/** Registered scorecards. KFC is added in M3. */
export const REGISTRATIONS: ScorecardRegistration[] = [];
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/lib/scorecard/registry.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/scorecard/registry.ts frontend/src/scorecards/index.ts frontend/src/lib/scorecard/registry.test.ts
git commit -m "feat(scorecard): slug registry (code-first registrations)"
```

---

### Task B2: In-memory rate limiter

**Files:**
- Create: `frontend/src/lib/scorecard/rate-limit.ts`
- Test: `frontend/src/lib/scorecard/rate-limit.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to `max` hits per key within the window, then blocks", () => {
    const rl = createRateLimiter({ max: 2, windowMs: 1000 });
    expect(rl.check("ip-a", 0)).toBe(true);
    expect(rl.check("ip-a", 100)).toBe(true);
    expect(rl.check("ip-a", 200)).toBe(false); // 3rd within window
  });

  it("tracks keys independently", () => {
    const rl = createRateLimiter({ max: 1, windowMs: 1000 });
    expect(rl.check("ip-a", 0)).toBe(true);
    expect(rl.check("ip-b", 0)).toBe(true);
    expect(rl.check("ip-a", 0)).toBe(false);
  });

  it("forgets hits older than the window", () => {
    const rl = createRateLimiter({ max: 1, windowMs: 1000 });
    expect(rl.check("ip-a", 0)).toBe(true);
    expect(rl.check("ip-a", 500)).toBe(false);
    expect(rl.check("ip-a", 1001)).toBe(true); // first hit aged out
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/lib/scorecard/rate-limit.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `rate-limit.ts`**

```ts
/**
 * Minimal in-memory sliding-window rate limiter (per process). Good enough for a
 * single-instance deployment (Hostinger Docker); revisit if we scale out.
 * Time is injectable (`now`) so it is deterministically testable.
 */

export interface RateLimiter {
  /** Returns true if this hit is allowed; false if the key is over the limit. */
  check(key: string, now?: number): boolean;
}

export function createRateLimiter(opts: { max: number; windowMs: number }): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    check(key, now = Date.now()) {
      const cutoff = now - opts.windowMs;
      const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);
      if (recent.length >= opts.max) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      return true;
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/lib/scorecard/rate-limit.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/scorecard/rate-limit.ts frontend/src/lib/scorecard/rate-limit.test.ts
git commit -m "feat(scorecard): in-memory rate limiter"
```

---

### Task B3: Tokens + generic email senders

**Files:**
- Create: `frontend/src/lib/scorecard/tokens.ts`
- Create: `frontend/src/lib/scorecard/email.ts`

- [ ] **Step 1: Write `tokens.ts`** (generic; mirrors `engpass-check/tokens.ts`, no cross-namespace import)

```ts
import { randomBytes } from "crypto";

/** Unguessable URL-safe token for DOI-confirmation and report links. */
export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Absolute base URL for links in emails (no trailing slash). */
export function baseUrl(): string {
  return (process.env.BASE_URL ?? "http://localhost:8087").replace(/\/$/, "");
}
```

- [ ] **Step 2: Write `email.ts`** (generic senders; reuse the shared transporter + `EmailNotConfiguredError`)

```ts
/**
 * Generic scorecard transactional emails. Reuse the shared SMTP transporter
 * (IONOS). Subjects come from the scorecard registration; the v1 HTML is generic
 * (M3 can switch to per-scorecard templates). Throws EmailNotConfiguredError when
 * SMTP is absent so routes can map it to a 503, exactly like the Engpass funnel.
 */

import { createLogger } from "@/lib/logger";
import { getFrom, getTransporter, isEmailConfigured } from "@/lib/email/transporter";
import { EmailNotConfiguredError } from "@/lib/email/send";

const log = createLogger("ScorecardEmail");

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!isEmailConfigured()) throw new EmailNotConfiguredError();
  await getTransporter().sendMail({ from: getFrom(), to, subject, html });
  log.info("Scorecard email sent", { subject });
}

export async function sendScorecardDoi(params: {
  to: string;
  subject: string;
  confirmUrl: string;
}): Promise<void> {
  const html =
    `<p>Ein Klick noch, dann ist Deine Anmeldung bestätigt und Dein Ergebnis unterwegs:</p>` +
    `<p><a href="${params.confirmUrl}">Jetzt bestätigen</a></p>` +
    `<p>Wenn Du das nicht angefordert hast, ignorier diese E-Mail einfach.</p>`;
  await send(params.to, params.subject, html);
}

export async function sendScorecardDelivery(params: {
  to: string;
  subject: string;
  reportUrl: string;
  qualified: boolean;
  bookingUrl?: string;
}): Promise<void> {
  const cta =
    params.qualified && params.bookingUrl
      ? `<p>Wenn Du magst, hol Dir eine zweite Meinung — kein Verkaufsgespräch: ` +
        `<a href="${params.bookingUrl}">15 Minuten buchen</a>.</p>`
      : "";
  const html =
    `<p>Dein Ergebnis und Dein Umsetzungs-Toolkit liegen hier:</p>` +
    `<p><a href="${params.reportUrl}">Zu Deinem Ergebnis</a></p>${cta}`;
  await send(params.to, params.subject, html);
}
```

> Note: `getFrom`/`getTransporter`/`isEmailConfigured` are existing exports of `@/lib/email/transporter`; `EmailNotConfiguredError` is an existing export of `@/lib/email/send`. Verify these names before implementing (read those two files); if a name differs, use the actual one.

- [ ] **Step 3: Verify compiles + lint**

Run: `npx tsc --noEmit -p frontend/tsconfig.json 2>&1 | grep -iE "scorecard/(tokens|email)" || echo "clean"` → `clean`
Run: `cd frontend && npx eslint src/lib/scorecard/tokens.ts src/lib/scorecard/email.ts; echo "EXIT=$?"; cd ..` → `EXIT=0`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/scorecard/tokens.ts frontend/src/lib/scorecard/email.ts
git commit -m "feat(scorecard): tokens + generic transactional email senders"
```

---

### Task B4: Generic CleverReach client

**Files:**
- Create: `frontend/src/lib/scorecard/cleverreach.ts`

- [ ] **Step 1: Write `cleverreach.ts`**

This is the Engpass CleverReach client (`lib/engpass-check/cleverreach.ts`) generalized with a `source` parameter (the Engpass file stays untouched; consolidating the two is a documented future cleanup). Copy that file's full implementation — `CleverReachConfig`, `readConfig`, `isCleverReachConfigured`, `CleverReachNotConfiguredError`, `CleverReachError`, the token cache (`fetchToken`/`getToken`), `crFetch`, `upsertActiveReceiver` — with these two changes:
1. Remove the module-level `const SOURCE = "engpass-check";`.
2. `addConfirmedNewsletterLead` takes `source` and passes it through:

```ts
/**
 * Push an already-confirmed lead to a CleverReach newsletter group as an ACTIVE
 * receiver (consent obtained via our own DOI — no CleverReach DOI form). Generic
 * over `source`/`tags` so any scorecard can use it. Tags only — all lead data
 * stays in our DB (CleverReach is a newsletter list, not a CRM).
 */
export async function addConfirmedNewsletterLead(params: {
  email: string;
  tags: string[];
  source: string;
}): Promise<void> {
  if (!isCleverReachConfigured()) {
    throw new CleverReachNotConfiguredError();
  }
  const config = readConfig();
  const token = await getToken(config);
  await upsertActiveReceiver(config, token, params.email, params.tags, params.source);
  log.info("Confirmed scorecard lead added to CleverReach newsletter", {
    source: params.source,
    tags: params.tags,
  });
}
```

`upsertActiveReceiver` gains a `source: string` param and uses it in the payload (`source` field) instead of the removed constant. The logger context is `createLogger("ScorecardCleverReach")`.

- [ ] **Step 2: Verify compiles + lint**

Run: `npx tsc --noEmit -p frontend/tsconfig.json 2>&1 | grep -i "scorecard/cleverreach" || echo "clean"` → `clean`
Run: `cd frontend && npx eslint src/lib/scorecard/cleverreach.ts; echo "EXIT=$?"; cd ..` → `EXIT=0`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/scorecard/cleverreach.ts
git commit -m "feat(scorecard): generic CleverReach newsletter client (source param)"
```

---

## Phase C — Endpoints

### Task C1: Submit route

**Files:**
- Create: `frontend/src/app/api/scorecard/[slug]/submit/route.ts`
- Test: `frontend/src/app/api/scorecard/[slug]/submit/route.test.ts`

- [ ] **Step 1: Write the failing test** (mirrors `engpass-check/route.test.ts`)

```ts
/**
 * POST /api/scorecard/[slug]/submit — validation, slug lookup, re-score, persist, DOI.
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

import { SAMPLE_DEFINITION } from "@/lib/scorecard/__fixtures__/sample-definition";

const sampleReg = {
  definition: SAMPLE_DEFINITION,
  doiSubject: "Bestätige Deine Anmeldung",
  deliverySubject: "Dein Ergebnis ist da",
};
let known = true;
jest.mock("@/lib/scorecard/registry", () => ({
  getScorecard: (slug: string) => (slug === "sample" && known ? sampleReg : undefined),
}));

const mockInsert = jest.fn();
jest.mock("@/db/scorecard-submissions", () => ({
  insertScorecardSubmission: (...a: unknown[]) => mockInsert(...a),
}));

let dbConfigured = true;
jest.mock("@/db/client", () => ({ isDatabaseConfigured: () => dbConfigured }));

const mockSendDoi = jest.fn();
jest.mock("@/lib/scorecard/email", () => {
  return { sendScorecardDoi: (...a: unknown[]) => mockSendDoi(...a) };
});
jest.mock("@/lib/email/send", () => {
  class EmailNotConfiguredError extends Error {}
  return { EmailNotConfiguredError };
});

class MockNextRequest {
  private body: string;
  public headers: Map<string, string>;
  constructor(_url: string, init?: { headers?: Record<string, string>; body?: string }) {
    this.body = init?.body ?? "";
    this.headers = new Map(Object.entries(init?.headers ?? {}));
  }
  async json() {
    return JSON.parse(this.body);
  }
}
jest.mock("next/server", () => ({
  NextRequest: MockNextRequest,
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

import { POST } from "./route";

function post(slug: string, body: unknown): Promise<Response> {
  const req = new MockNextRequest(`http://localhost/api/scorecard/${slug}/submit`, {
    headers: { "x-forwarded-for": "9.9.9.9" },
    body: JSON.stringify(body),
  });
  return POST(req as never, { params: Promise.resolve({ slug }) } as never);
}

const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" };

beforeEach(() => {
  mockInsert.mockReset().mockResolvedValue({ id: "row-1" });
  mockSendDoi.mockReset().mockResolvedValue(undefined);
  dbConfigured = true;
  known = true;
});

describe("POST /api/scorecard/[slug]/submit", () => {
  it("404s an unknown scorecard slug", async () => {
    known = false;
    const res = await post("sample", { email: "a@b.de", answers });
    expect(res.status).toBe(404);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("400s an invalid email", async () => {
    const res = await post("sample", { email: "nope", answers });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("INVALID_EMAIL");
  });

  it("503s when the database is not configured", async () => {
    dbConfigured = false;
    const res = await post("sample", { email: "a@b.de", answers });
    expect(res.status).toBe(503);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("persists a pending submission with a server-side result + sends the DOI email", async () => {
    const res = await post("sample", { email: " lead@firma.de ", answers });
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);

    const row = mockInsert.mock.calls[0][0];
    expect(row.scorecard).toBe("sample");
    expect(row.email).toBe("lead@firma.de"); // trimmed
    expect(row.result.outcome).toBe("verwalter"); // recomputed: score 50
    expect(row.result.qualified).toBe(true);
    expect(row.doiToken).not.toBe(row.reportToken);

    const mail = mockSendDoi.mock.calls[0][0];
    expect(mail.to).toBe("lead@firma.de");
    expect(mail.subject).toBe("Bestätige Deine Anmeldung");
    expect(mail.confirmUrl).toContain(`/api/scorecard/confirm?token=${row.doiToken}`);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/app/api/scorecard/[slug]/submit/route.test.ts`
Expected: FAIL — `./route` not found.

- [ ] **Step 3: Write `route.ts`**

```ts
/**
 * POST /api/scorecard/[slug]/submit
 *
 * Generic opt-in submit. Looks up the scorecard by slug, recomputes the result
 * server-side (the client's answers are untrusted), persists a `pending` row, and
 * sends our own Double-Opt-in email. CleverReach + delivery happen after confirm.
 */

import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { getScorecard } from "@/lib/scorecard/registry";
import { buildResult } from "@/lib/scorecard/result";
import { newToken, baseUrl } from "@/lib/scorecard/tokens";
import { createRateLimiter } from "@/lib/scorecard/rate-limit";
import { sendScorecardDoi } from "@/lib/scorecard/email";
import { EmailNotConfiguredError } from "@/lib/email/send";
import { insertScorecardSubmission } from "@/db/scorecard-submissions";
import { isDatabaseConfigured } from "@/db/client";
import type { Answers } from "@/lib/scorecard/types";

const log = createLogger("ScorecardSubmitAPI");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TID_RE = /^[A-Za-z0-9_-]{1,255}$/;

// 5 submits per IP per 10 minutes (abuse + cost guard).
const limiter = createRateLimiter({ max: 5, windowMs: 10 * 60 * 1000 });

interface SubmitBody {
  email: string;
  answers: Answers;
  tid?: string;
}

function isValidBody(body: unknown): body is SubmitBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.email === "string" &&
    typeof b.answers === "object" &&
    b.answers !== null &&
    !Array.isArray(b.answers) &&
    (b.tid === undefined || typeof b.tid === "string")
  );
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "";
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await ctx.params;
  const registration = getScorecard(slug);
  if (!registration) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  const ip = clientIp(request);
  if (!limiter.check(ip || "unknown")) {
    return NextResponse.json({ ok: false, code: "RATE_LIMITED" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400 });
  }
  if (!isValidBody(body)) {
    return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400 });
  }

  const email = body.email.trim();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, code: "INVALID_EMAIL", message: "Bitte gib eine gültige E-Mail-Adresse ein." },
      { status: 400 },
    );
  }

  if (!isDatabaseConfigured()) {
    log.warn("Submit received but DATABASE_URL is not configured", { slug });
    return NextResponse.json(
      { ok: false, code: "NOT_CONFIGURED", message: "Der Versand ist noch nicht aktiviert." },
      { status: 503 },
    );
  }

  const result = buildResult(registration.definition, body.answers);
  const doiToken = newToken();
  const reportToken = newToken();
  const tid = typeof body.tid === "string" && TID_RE.test(body.tid) ? body.tid : null;

  try {
    await insertScorecardSubmission({
      scorecard: slug,
      email,
      answers: body.answers as Record<string, string>,
      result,
      doiToken,
      reportToken,
      ipAtSubmit: ip,
      userAgent: request.headers.get("user-agent") ?? "",
      tid,
    });

    await sendScorecardDoi({
      to: email,
      subject: registration.doiSubject,
      confirmUrl: `${baseUrl()}/api/scorecard/confirm?token=${doiToken}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      log.warn("Submit stored but SMTP not configured — no DOI email", { slug });
      return NextResponse.json(
        { ok: false, code: "NOT_CONFIGURED", message: "Der Versand ist noch nicht aktiviert." },
        { status: 503 },
      );
    }
    log.error("Scorecard submit failed", error);
    return NextResponse.json({ ok: false, code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/app/api/scorecard/[slug]/submit/route.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add "frontend/src/app/api/scorecard/[slug]/submit"
git commit -m "feat(scorecard): submit API (slug lookup, re-score, persist, DOI, rate-limit)"
```

---

### Task C2: Confirm logic

**Files:**
- Create: `frontend/src/lib/scorecard/confirm.ts`
- Test: `frontend/src/lib/scorecard/confirm.test.ts`

- [ ] **Step 1: Write the failing test** (mirrors `engpass-check/confirm.test.ts`)

```ts
/**
 * Scorecard DOI confirm — idempotent confirm + best-effort delivery/CleverReach.
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

import { SAMPLE_DEFINITION } from "./__fixtures__/sample-definition";

const sampleReg = {
  definition: SAMPLE_DEFINITION,
  doiSubject: "Bestätige Deine Anmeldung",
  deliverySubject: "Dein Ergebnis ist da",
};
jest.mock("./registry", () => ({ getScorecard: () => sampleReg }));

const mockFind = jest.fn();
const mockConfirm = jest.fn();
const mockMarkSynced = jest.fn();
jest.mock("@/db/scorecard-submissions", () => ({
  findScorecardByDoiToken: (...a: unknown[]) => mockFind(...a),
  confirmScorecardSubmission: (...a: unknown[]) => mockConfirm(...a),
  markScorecardCleverreachSynced: (...a: unknown[]) => mockMarkSynced(...a),
}));

const mockSendDelivery = jest.fn();
jest.mock("./email", () => ({ sendScorecardDelivery: (...a: unknown[]) => mockSendDelivery(...a) }));

const mockAddNewsletter = jest.fn();
let cleverreachConfigured = true;
jest.mock("./cleverreach", () => ({
  addConfirmedNewsletterLead: (...a: unknown[]) => mockAddNewsletter(...a),
  isCleverReachConfigured: () => cleverreachConfigured,
}));

import { confirmScorecardByToken } from "./confirm";

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: "row-1",
    scorecard: "sample",
    email: "lead@firma.de",
    answers: { K1: "gf", K2: "mid", S1: "daily", S2: "no" },
    result: { score: 50, outcome: "verwalter", qualified: true },
    doiStatus: "pending",
    reportToken: "rep_abc",
    ...overrides,
  };
}

beforeEach(() => {
  mockFind.mockReset();
  mockConfirm.mockReset().mockResolvedValue(undefined);
  mockMarkSynced.mockReset().mockResolvedValue(undefined);
  mockSendDelivery.mockReset().mockResolvedValue(undefined);
  mockAddNewsletter.mockReset().mockResolvedValue(undefined);
  cleverreachConfigured = true;
});

describe("confirmScorecardByToken", () => {
  it("notfound for an unknown token", async () => {
    mockFind.mockResolvedValueOnce(undefined);
    expect(await confirmScorecardByToken("nope")).toEqual({ status: "notfound" });
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it("confirms: marks confirmed, sends delivery, pushes newsletter with qualified tag", async () => {
    mockFind.mockResolvedValueOnce(row());
    const res = await confirmScorecardByToken("doi_abc");
    expect(res.status).toBe("confirmed");
    if (res.status === "confirmed") expect(res.reportUrl).toContain("/sample/report?token=rep_abc");
    expect(mockConfirm).toHaveBeenCalledWith("row-1");
    expect(mockSendDelivery).toHaveBeenCalledWith(expect.objectContaining({ qualified: true }));
    expect(mockAddNewsletter).toHaveBeenCalledWith({
      email: "lead@firma.de",
      tags: ["sample", "sample-qualified"],
      source: "sample",
    });
    expect(mockMarkSynced).toHaveBeenCalledWith("row-1");
  });

  it("non-qualified: only the base tag", async () => {
    mockFind.mockResolvedValueOnce(row({ result: { score: 0, outcome: "einkaeufer", qualified: false } }));
    await confirmScorecardByToken("doi_abc");
    expect(mockAddNewsletter).toHaveBeenCalledWith({
      email: "lead@firma.de",
      tags: ["sample"],
      source: "sample",
    });
  });

  it("idempotent: already-confirmed just returns the link, no side effects", async () => {
    mockFind.mockResolvedValueOnce(row({ doiStatus: "confirmed" }));
    const res = await confirmScorecardByToken("doi_abc");
    expect(res.status).toBe("already");
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockSendDelivery).not.toHaveBeenCalled();
  });

  it("still confirms when delivery email fails (non-fatal)", async () => {
    mockFind.mockResolvedValueOnce(row());
    mockSendDelivery.mockRejectedValueOnce(new Error("smtp down"));
    expect((await confirmScorecardByToken("doi_abc")).status).toBe("confirmed");
  });

  it("skips newsletter push when CleverReach is not configured", async () => {
    cleverreachConfigured = false;
    mockFind.mockResolvedValueOnce(row());
    await confirmScorecardByToken("doi_abc");
    expect(mockAddNewsletter).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/lib/scorecard/confirm.test.ts`
Expected: FAIL — `./confirm` not found.

- [ ] **Step 3: Write `confirm.ts`**

```ts
/**
 * Generic scorecard Double-Opt-in confirm — idempotent. Delivery email +
 * CleverReach push are best-effort (a provider hiccup never hides the report).
 * CleverReach gets tags only; all lead data stays in our DB.
 */

import { createLogger } from "@/lib/logger";
import { getScorecard } from "./registry";
import { baseUrl } from "./tokens";
import { sendScorecardDelivery } from "./email";
import { addConfirmedNewsletterLead, isCleverReachConfigured } from "./cleverreach";
import {
  confirmScorecardSubmission,
  findScorecardByDoiToken,
  markScorecardCleverreachSynced,
} from "@/db/scorecard-submissions";

const log = createLogger("ScorecardConfirm");

export type ConfirmResult =
  | { status: "confirmed"; reportUrl: string }
  | { status: "already"; reportUrl: string }
  | { status: "notfound" };

export async function confirmScorecardByToken(doiToken: string): Promise<ConfirmResult> {
  const submission = await findScorecardByDoiToken(doiToken);
  if (!submission) return { status: "notfound" };

  const reportUrl = `${baseUrl()}/${submission.scorecard}/report?token=${submission.reportToken}`;
  if (submission.doiStatus === "confirmed") return { status: "already", reportUrl };

  await confirmScorecardSubmission(submission.id);

  const qualified = submission.result.qualified;
  const source = getScorecard(submission.scorecard)?.cleverreachSource ?? submission.scorecard;
  const deliverySubject =
    getScorecard(submission.scorecard)?.deliverySubject ?? "Dein Ergebnis ist da";

  try {
    await sendScorecardDelivery({
      to: submission.email,
      subject: deliverySubject,
      reportUrl,
      qualified,
    });
  } catch (error) {
    log.error("Scorecard delivery email failed (non-fatal)", error);
  }

  if (isCleverReachConfigured()) {
    try {
      const tags = qualified ? [submission.scorecard, `${submission.scorecard}-qualified`] : [submission.scorecard];
      await addConfirmedNewsletterLead({ email: submission.email, tags, source });
      await markScorecardCleverreachSynced(submission.id);
    } catch (error) {
      log.error("Scorecard CleverReach push failed (non-fatal)", error);
    }
  }

  return { status: "confirmed", reportUrl };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/lib/scorecard/confirm.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/scorecard/confirm.ts frontend/src/lib/scorecard/confirm.test.ts
git commit -m "feat(scorecard): idempotent DOI confirm (delivery + CleverReach, best-effort)"
```

---

### Task C3: Confirm route

**Files:**
- Create: `frontend/src/app/api/scorecard/confirm/route.ts`
- Test: `frontend/src/app/api/scorecard/confirm/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/**
 * GET /api/scorecard/confirm?token= — confirm + redirect to the report.
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockConfirm = jest.fn();
jest.mock("@/lib/scorecard/confirm", () => ({
  confirmScorecardByToken: (...a: unknown[]) => mockConfirm(...a),
}));

jest.mock("next/server", () => ({
  NextRequest: class {
    public nextUrl: URL;
    constructor(url: string) {
      this.nextUrl = new URL(url);
    }
  },
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), { status: init?.status ?? 200 }),
    redirect: (url: string | URL, status = 307) =>
      new Response(null, { status, headers: { location: String(url) } }),
  },
}));

import { GET } from "./route";

function get(token?: string): Promise<Response> {
  const qs = token === undefined ? "" : `?token=${token}`;
  const req = new (jest.requireMock("next/server").NextRequest)(
    `http://localhost/api/scorecard/confirm${qs}`,
  );
  return GET(req as never);
}

beforeEach(() => mockConfirm.mockReset());

describe("GET /api/scorecard/confirm", () => {
  it("400s without a token", async () => {
    const res = await get();
    expect(res.status).toBe(400);
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it("redirects to the report on confirm", async () => {
    mockConfirm.mockResolvedValueOnce({ status: "confirmed", reportUrl: "http://x/sample/report?token=r" });
    const res = await get("doi_abc");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://x/sample/report?token=r");
  });

  it("also redirects when already confirmed", async () => {
    mockConfirm.mockResolvedValueOnce({ status: "already", reportUrl: "http://x/sample/report?token=r" });
    const res = await get("doi_abc");
    expect(res.status).toBe(307);
  });

  it("404s an unknown token", async () => {
    mockConfirm.mockResolvedValueOnce({ status: "notfound" });
    const res = await get("nope");
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/app/api/scorecard/confirm/route.test.ts`
Expected: FAIL — `./route` not found.

- [ ] **Step 3: Write `route.ts`**

```ts
/**
 * GET /api/scorecard/confirm?token=
 *
 * Completes the Double-Opt-in and redirects the lead straight to their report.
 * Idempotent (a second click also redirects). Unknown token → 404.
 */

import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { confirmScorecardByToken } from "@/lib/scorecard/confirm";

const log = createLogger("ScorecardConfirmAPI");

export async function GET(request: NextRequest): Promise<Response> {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400 });
  }

  try {
    const result = await confirmScorecardByToken(token);
    if (result.status === "notfound") {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.redirect(result.reportUrl);
  } catch (error) {
    log.error("Scorecard confirm failed", error);
    return NextResponse.json({ ok: false, code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/app/api/scorecard/confirm/route.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/api/scorecard/confirm
git commit -m "feat(scorecard): confirm API (DOI → redirect to report)"
```

---

## Phase D — Retention

### Task D1: Extend the purge cron to scorecard submissions

**Files:**
- Modify: `frontend/src/app/api/cron/purge/route.ts`
- Create: `frontend/src/app/api/cron/purge/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/**
 * Retention purge — covers both submissions tables.
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockPurgeEngpass = jest.fn();
jest.mock("@/db/submissions", () => ({ purgePendingOlderThan: (...a: unknown[]) => mockPurgeEngpass(...a) }));

const mockPurgeScorecard = jest.fn();
jest.mock("@/db/scorecard-submissions", () => ({
  purgeScorecardPendingOlderThan: (...a: unknown[]) => mockPurgeScorecard(...a),
}));

jest.mock("next/server", () => ({
  NextRequest: class {
    public headers: Map<string, string>;
    public nextUrl: URL;
    constructor(url: string, init?: { headers?: Record<string, string> }) {
      this.headers = new Map(Object.entries(init?.headers ?? {}));
      this.nextUrl = new URL(url);
    }
  },
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), { status: init?.status ?? 200 }),
  },
}));

const OLD = process.env.CRON_SECRET;
beforeEach(() => {
  mockPurgeEngpass.mockReset().mockResolvedValue(2);
  mockPurgeScorecard.mockReset().mockResolvedValue(3);
  process.env.CRON_SECRET = "s3cret";
});
afterAll(() => {
  process.env.CRON_SECRET = OLD;
});

import { GET } from "./route";

function get(secret?: string): Promise<Response> {
  const url = `http://localhost/api/cron/purge${secret ? `?secret=${secret}` : ""}`;
  const req = new (jest.requireMock("next/server").NextRequest)(url, {});
  return GET(req as never);
}

describe("GET /api/cron/purge", () => {
  it("401s without the secret", async () => {
    const res = await get();
    expect(res.status).toBe(401);
    expect(mockPurgeScorecard).not.toHaveBeenCalled();
  });

  it("purges both tables and reports the combined count", async () => {
    const res = await get("s3cret");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(mockPurgeEngpass).toHaveBeenCalledTimes(1);
    expect(mockPurgeScorecard).toHaveBeenCalledTimes(1);
    expect(data.deleted).toBe(5); // 2 + 3
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/app/api/cron/purge/route.test.ts`
Expected: FAIL — current route only purges the engpass table / returns `deleted: 2`.

- [ ] **Step 3: Modify `route.ts`** — add the scorecard purge

Add the import near the existing one:
```ts
import { purgeScorecardPendingOlderThan } from "@/db/scorecard-submissions";
```
Replace the body of the `try` block in `handle` with:
```ts
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const [engpass, scorecard] = await Promise.all([
      purgePendingOlderThan(cutoff),
      purgeScorecardPendingOlderThan(cutoff),
    ]);
    const deleted = engpass + scorecard;
    log.info("Purged unconfirmed submissions", {
      engpass,
      scorecard,
      deleted,
      retentionDays: RETENTION_DAYS,
    });
    return NextResponse.json({ ok: true, deleted, retentionDays: RETENTION_DAYS });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/app/api/cron/purge/route.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/api/cron/purge
git commit -m "feat(scorecard): purge cron also retains scorecard_submissions"
```

---

## Final verification

- [ ] **Run the whole scorecard + backend test surface**

Run: `npm test --prefix frontend -- --testPathPatterns="scorecard|cron/purge"`
Expected: all green.

Run: `cd frontend && npx eslint src/lib/scorecard src/db/scorecard-submissions.ts "src/app/api/scorecard" src/app/api/cron/purge; echo "EXIT=$?"; cd ..` → `EXIT=0`

Run: `npx tsc --noEmit -p frontend/tsconfig.json 2>&1 | grep -iE "scorecard|api/cron" || echo "clean"` → `clean`

- [ ] **Confirm the Engpass-Check is untouched**

Run: `git diff 7b3f69d..HEAD --stat | grep -E "engpass-check|db/submissions\.ts" || echo "engpass untouched"`
Expected: `engpass untouched` (the only allowed Engpass-adjacent change is `db/schema.ts`, which only *adds* the new table).

---

## Follow-on plan (M3, not here)

Renderer + KFC live: generic `ScorecardApp`/`ResultScreen` (config + content-block driven, branded via CSS variables); `app/[scorecardSlug]/page.tsx` + `app/[scorecardSlug]/report/page.tsx` with `generateStaticParams` from the registry; KFC `definition.ts` + `content.ts` + `branding.ts` registered in `src/scorecards/index.ts`; per-scorecard email templates/copy; Datenschutz section. Gated on Daniel's KFC content approval.

## Notes / acknowledged debt

- **CleverReach client duplication:** `lib/scorecard/cleverreach.ts` duplicates `lib/engpass-check/cleverreach.ts` (with a `source` param) to keep the Engpass funnel untouched. Consolidating both onto one shared client is a future cleanup, out of scope here.
- **Generic email HTML:** v1 senders use minimal inline HTML. M3 may switch to per-scorecard Handlebars templates.
- **Rate limiter is in-memory** (per process) — fine for the single-instance Hostinger deployment; revisit if scaled out.
- **Report links are live only from M3** (the `/[slug]/report` page ships in M3); until then the delivery email's link 404s.

## Self-Review

- **Spec coverage:** persistence + generic result jsonb (A1–A3) ✓; registry (B1) ✓; submit with server-side re-score + rate-limit (C1, B2) ✓; idempotent confirm + delivery + CleverReach tags-only (C2) + confirm route (C3) ✓; email reuse (B3) ✓; retention extension (D1) ✓. Renderer/KFC content = M3 (out of scope, stated).
- **Placeholder scan:** none — every step has complete code or an exact command. The one "copy the Engpass client with these 2 changes" step (B4) names the exact functions and both changes precisely.
- **Type/name consistency:** `ScorecardSubmission`/`NewScorecardSubmission` (A1) used by the repo (A3) and confirm row shape; `getScorecard`/`ScorecardRegistration` (B1) used by submit (C1) + confirm (C2); `buildResult` (M1) used in C1; `sendScorecardDoi`/`sendScorecardDelivery` (B3) used in C1/C2; `addConfirmedNewsletterLead({email,tags,source})` (B4) used in C2; `confirmScorecardByToken` (C2) used by C3; `purgeScorecardPendingOlderThan` (A3) used by D1. Consistent throughout.
