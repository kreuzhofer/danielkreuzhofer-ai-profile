# trackmysales-Attribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Attribuiere bestätigte Engpass-Check-Leads zurück auf das Quell-Video, indem wir die trackmysales-`tid` beim Landen abfangen, an der Submission speichern und bei DOI-Bestätigung server-to-server an einen neuen trackmysales-Endpoint melden.

**Architecture:** Zwei Repos. **track-my-sales** bekommt einen neuen, secret-geschützten `POST /api/webhook/conversion/lead`, der die vorhandene Final-Touch-Attribution (jetzt in eine geteilte Service-Funktion extrahiert) server-to-server nutzt. **danielkreuzhofer-ai-profile** fängt `?tid` ab → `submissions.tid` → `confirm.ts` ruft den neuen Endpoint best-effort. Cookie-frei, third-party-cookie-resistent, geräteübergreifend.

**Tech Stack:** track-my-sales: Node/Express/TypeScript/Prisma/Postgres, Jest+supertest. Funnel: Next.js 16/React 19/TypeScript, Drizzle, Jest+@testing-library.

**Spec:** `docs/superpowers/specs/2026-06-13-trackmysales-attribution-design.md`

**Repos & cwd:**
- Phase 1 → `/Users/daniel/src/github/kreuzhofer/track-my-sales` (eigenes git-Repo, eigener Branch)
- Phase 2 → `/Users/daniel/src/github/kreuzhofer/danielkreuzhofer-ai-profile`, Branch `feature/trackmysales-attribution` (existiert bereits)

---

## Phase 0: Branch-Setup (track-my-sales)

### Task 0: Feature-Branch in track-my-sales

- [ ] **Step 1: Branch anlegen**

```bash
cd /Users/daniel/src/github/kreuzhofer/track-my-sales
git checkout -b feature/lead-conversion-webhook
git status --short   # erwartet: sauber
```

---

## Phase 1: track-my-sales — Lead-Conversion-Endpoint

### Task 1: Attribution-Kernlogik in einen geteilten Service extrahieren (Refactor, verhaltenswahrend)

Die Final-Touch-Logik steckt aktuell inline in `recordConversion` (`src/controllers/conversionRedirect.ts:48-130`). Wir ziehen sie in `src/services/conversionAttribution.ts`, damit Beacon **und** neuer Webhook dieselbe Wahrheit nutzen. Die bestehende Suite `src/__tests__/controllers/conversionTracking.test.ts` ist das Sicherheitsnetz: sie muss unverändert grün bleiben.

**Files:**
- Create: `src/services/conversionAttribution.ts`
- Modify: `src/controllers/conversionRedirect.ts` (recordConversion ruft den Service)
- Safety net: `src/__tests__/controllers/conversionTracking.test.ts` (unverändert)

- [ ] **Step 1: Service-Datei mit der extrahierten Logik anlegen**

Create `src/services/conversionAttribution.ts`:

```ts
import prisma from '../db/client';
import { Prisma } from '@prisma/client';

export type AttributionFailureReason =
  | 'unknown_code'
  | 'inactive_code'
  | 'unknown_visitor'
  | 'no_inaccount_click'
  | 'duplicate';

export type AttributionResult =
  | { attributed: true; conversionId: string; shortUrlId: string; conversionType: string }
  | { attributed: false; reason: AttributionFailureReason };

/**
 * Final-touch attribution for a conversion link. Shared by the browser beacon
 * (/c/:code → POST /api/tracking/conversion) and the server-to-server lead
 * webhook (POST /api/webhook/conversion/lead). Pure attribution — no HTTP, no
 * cookies, no res. Mirrors the original recordConversion logic 1:1.
 */
export async function attributeConversion(params: {
  code: string;
  trackingId: string;
  revenue?: number;
}): Promise<AttributionResult> {
  const { code, trackingId, revenue } = params;

  const link = await prisma.conversionLink.findUnique({ where: { code } });
  if (!link) return { attributed: false, reason: 'unknown_code' };
  if (!link.isActive) return { attributed: false, reason: 'inactive_code' };

  const user = await prisma.user.findUnique({ where: { trackingId } });
  if (!user) return { attributed: false, reason: 'unknown_visitor' };

  // Tenant-scoped final-touch: most recent click on the owning account's links.
  const mostRecentClick = await prisma.clickEvent.findFirst({
    where: { userId: user.id, shortUrl: { accountId: link.accountId } },
    orderBy: { clickedAt: 'desc' },
  });
  if (!mostRecentClick) return { attributed: false, reason: 'no_inaccount_click' };

  // Dedup: one email_list conversion per visitor per conversion link.
  if (link.conversionType === 'email_list') {
    const existing = await prisma.conversionEvent.findFirst({
      where: { userId: user.id, conversionLinkId: link.id, conversionType: 'email_list' },
    });
    if (existing) return { attributed: false, reason: 'duplicate' };
  }

  // Revenue: sale -> param ?? link default ?? null; email_list -> null.
  const effectiveRevenue =
    link.conversionType === 'sale'
      ? revenue ?? (link.defaultRevenue !== null ? Number(link.defaultRevenue) : null)
      : null;

  const firstClick = await prisma.clickEvent.findFirst({
    where: { userId: user.id, shortUrl: { accountId: link.accountId } },
    orderBy: { clickedAt: 'asc' },
  });
  const conversionTimeDays = firstClick
    ? Math.floor((Date.now() - firstClick.clickedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  try {
    const conversionEvent = await prisma.conversionEvent.create({
      data: {
        userId: user.id,
        shortUrlId: mostRecentClick.shortUrlId,
        conversionType: link.conversionType,
        conversionLinkId: link.id,
        revenue: effectiveRevenue,
        conversionTimeDays,
      },
    });
    return {
      attributed: true,
      conversionId: conversionEvent.id,
      shortUrlId: mostRecentClick.shortUrlId,
      conversionType: link.conversionType,
    };
  } catch (createError) {
    // Concurrent duplicate (partial unique index on email_list rows) — treat as dedup.
    if (createError instanceof Prisma.PrismaClientKnownRequestError && createError.code === 'P2002') {
      return { attributed: false, reason: 'duplicate' };
    }
    throw createError;
  }
}
```

- [ ] **Step 2: `recordConversion` auf den Service umstellen (Verhalten unverändert: immer 204)**

In `src/controllers/conversionRedirect.ts`: Import ergänzen und den Block ab `const link = await prisma.conversionLink.findUnique(...)` bis inkl. der `create`/`catch`-Logik durch den Service-Aufruf ersetzen. Validierung (`conversionBeaconSchema`) und Origin-Check (`validateRequestDomain`) bleiben unverändert davor stehen. Das `prisma`/`Prisma`-Import bleibt, falls anderweitig genutzt — sonst entfernen, wenn der Linter meckert.

Ersetze den Logikteil so, dass nach Validierung + Origin-Check steht:

```ts
    const { code, trackingId, revenue } = validationResult.data;

    // (Origin-Domain-Check unverändert direkt darüber.)

    const result = await attributeConversion({ code, trackingId, revenue });
    if (result.attributed) {
      logger.info('Conversion link event recorded', {
        conversionId: result.conversionId,
        conversionType: result.conversionType,
        trackingId,
        code,
      });
    } else {
      logger.debug('Conversion beacon not attributed', { code, trackingId, reason: result.reason });
    }
    res.status(204).send();
```

Import oben in der Datei ergänzen:

```ts
import { attributeConversion } from '../services/conversionAttribution';
```

- [ ] **Step 3: Bestehende Suite laufen lassen — muss komplett grün bleiben**

Run: `cd /Users/daniel/src/github/kreuzhofer/track-my-sales && npx jest src/__tests__/controllers/conversionTracking.test.ts`
Expected: PASS (alle ~12 Tests). Falls rot: Refactor weicht vom Original-Verhalten ab — angleichen, bis grün.

- [ ] **Step 4: Commit**

```bash
cd /Users/daniel/src/github/kreuzhofer/track-my-sales
git add src/services/conversionAttribution.ts src/controllers/conversionRedirect.ts
git commit -m "refactor: extract attributeConversion service from recordConversion"
```

---

### Task 2: Validator, Config + example.env für den Lead-Endpoint

**Files:**
- Modify: `src/validators/conversionLink.ts` (neues `leadConversionSchema`)
- Modify: `src/config/index.ts` (neuer `leadConversionSecret`-Getter)
- Modify: `example.env`

- [ ] **Step 1: `leadConversionSchema` ergänzen**

In `src/validators/conversionLink.ts` ans Ende der Schemas (vor den `export type`-Zeilen) einfügen:

```ts
// Server-to-server lead conversion: only code + trackingId (no caller-supplied
// revenue — a lead is never a sale).
export const leadConversionSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50, 'Code must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid code format'),
  trackingId: z
    .string()
    .min(1, 'Tracking ID is required')
    .max(255, 'Tracking ID must not exceed 255 characters'),
});

export type LeadConversionInput = z.infer<typeof leadConversionSchema>;
```

- [ ] **Step 2: Config-Getter ergänzen**

In `src/config/index.ts` im `config`-Objekt neben `apiKey` einfügen:

```ts
  get leadConversionSecret() { return process.env.LEAD_CONVERSION_SECRET || ''; },
```

- [ ] **Step 3: example.env dokumentieren**

In `example.env` einen Abschnitt ergänzen:

```
# Shared secret for the server-to-server lead conversion webhook
# (POST /api/webhook/conversion/lead). Must match TRACKMYSALES_CONVERSION_SECRET
# in the calling app. Leave empty to disable the endpoint (returns 503).
LEAD_CONVERSION_SECRET=
```

- [ ] **Step 4: Commit**

```bash
cd /Users/daniel/src/github/kreuzhofer/track-my-sales
git add src/validators/conversionLink.ts src/config/index.ts example.env
git commit -m "feat: leadConversionSchema + LEAD_CONVERSION_SECRET config"
```

---

### Task 3: Lead-Conversion-Controller + Route (TDD)

**Files:**
- Create: `src/controllers/leadConversion.ts`
- Modify: `src/routes/webhook.ts`
- Test: `src/__tests__/controllers/leadConversion.test.ts`

- [ ] **Step 1: Failing integration test schreiben**

Create `src/__tests__/controllers/leadConversion.test.ts`:

```ts
import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import {
  getTestDb,
  cleanupTestDb,
  disconnectTestDb,
  createTestAccount,
  createTestShortUrl,
  createTestUser,
  createTestClickEvent,
} from '../helpers';

const app = createTestApp();
const db = getTestDb();
const SECRET = 'test-lead-secret';

describe('POST /api/webhook/conversion/lead', () => {
  let accountId: string;

  beforeEach(async () => {
    await cleanupTestDb();
    process.env.LEAD_CONVERSION_SECRET = SECRET;
    const { account } = await createTestAccount(db);
    accountId = account.id;
  });

  afterEach(() => {
    delete process.env.LEAD_CONVERSION_SECRET;
  });

  afterAll(async () => {
    await cleanupTestDb();
    await disconnectTestDb();
  });

  async function createLink(overrides: Record<string, unknown> = {}) {
    return db.conversionLink.create({
      data: {
        accountId,
        code: 'engpass-check',
        name: 'Engpass-Check',
        conversionType: 'email_list',
        targetUrl: 'https://example.com/report',
        ...overrides,
      },
    });
  }

  function post(body: unknown, secret: string | null = SECRET) {
    const req = request(app).post('/api/webhook/conversion/lead');
    if (secret !== null) req.set('X-Conversion-Secret', secret);
    return req.send(body as object);
  }

  it('attributes an email_list lead to the most recent in-account click', async () => {
    const link = await createLink();
    const user = await createTestUser(db, { trackingId: 'tid-lead' });
    const shortUrl = await createTestShortUrl(db, accountId, {
      shortCode: 'vid01',
      sourceUrl: 'https://youtube.com/watch?v=abc',
    });
    await createTestClickEvent(db, shortUrl.id, user.id);

    const res = await post({ code: 'engpass-check', trackingId: 'tid-lead' });

    expect(res.status).toBe(200);
    expect(res.body.attributed).toBe(true);
    expect(typeof res.body.conversionId).toBe('string');
    const events = await db.conversionEvent.findMany({ where: { userId: user.id } });
    expect(events).toHaveLength(1);
    expect(events[0].conversionType).toBe('email_list');
    expect(events[0].shortUrlId).toBe(shortUrl.id);
    expect(events[0].conversionLinkId).toBe(link.id);
    expect(events[0].revenue).toBeNull();
  });

  it('dedupes a repeated lead for the same visitor', async () => {
    await createLink();
    const user = await createTestUser(db, { trackingId: 'tid-dupe' });
    const shortUrl = await createTestShortUrl(db, accountId);
    await createTestClickEvent(db, shortUrl.id, user.id);

    await post({ code: 'engpass-check', trackingId: 'tid-dupe' });
    const second = await post({ code: 'engpass-check', trackingId: 'tid-dupe' });

    expect(second.status).toBe(200);
    expect(second.body).toEqual({ attributed: false, reason: 'duplicate' });
    expect(await db.conversionEvent.count({ where: { userId: user.id } })).toBe(1);
  });

  it('returns attributed:false (200, never 404) for an unknown visitor', async () => {
    await createLink();
    const res = await post({ code: 'engpass-check', trackingId: 'tid-ghost' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ attributed: false, reason: 'unknown_visitor' });
  });

  it('rejects a wrong secret with 401', async () => {
    const res = await post({ code: 'engpass-check', trackingId: 'tid-x' }, 'wrong-secret');
    expect(res.status).toBe(401);
  });

  it('rejects a missing secret with 401', async () => {
    const res = await post({ code: 'engpass-check', trackingId: 'tid-x' }, null);
    expect(res.status).toBe(401);
  });

  it('returns 503 when the endpoint is not configured', async () => {
    delete process.env.LEAD_CONVERSION_SECRET;
    const res = await post({ code: 'engpass-check', trackingId: 'tid-x' }, 'anything');
    expect(res.status).toBe(503);
  });

  it('returns 400 for an invalid payload', async () => {
    const res = await post({ code: 'engpass-check' });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag verifizieren**

Run: `cd /Users/daniel/src/github/kreuzhofer/track-my-sales && npx jest src/__tests__/controllers/leadConversion.test.ts`
Expected: FAIL — Route existiert nicht (404 statt 200/401/503).

- [ ] **Step 3: Controller implementieren**

Create `src/controllers/leadConversion.ts`:

```ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config';
import { leadConversionSchema } from '../validators/conversionLink';
import { attributeConversion } from '../services/conversionAttribution';
import logger from '../utils/logger';

/** Constant-time comparison of the provided secret against the configured one. */
function secretOk(provided: string | undefined): boolean {
  const expected = config.leadConversionSecret;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Server-to-server lead conversion webhook.
 * POST /api/webhook/conversion/lead   Header: X-Conversion-Secret
 * Body: { code, trackingId } → records an email_list conversion (final-touch).
 */
export async function handleLeadConversionWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!config.leadConversionSecret) {
      res.status(503).json({ error: 'Lead conversion endpoint not configured' });
      return;
    }
    if (!secretOk(req.header('x-conversion-secret') ?? undefined)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const parsed = leadConversionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }

    const result = await attributeConversion({
      code: parsed.data.code,
      trackingId: parsed.data.trackingId,
    });
    logger.info('Lead conversion webhook processed', { code: parsed.data.code, attributed: result.attributed });

    res.status(200).json(
      result.attributed
        ? { attributed: true, conversionId: result.conversionId }
        : { attributed: false, reason: result.reason }
    );
  } catch (error) {
    logger.error('Error processing lead conversion webhook', { error });
    next(error);
  }
}
```

- [ ] **Step 4: Route registrieren**

In `src/routes/webhook.ts`:

```ts
import { handleLeadConversionWebhook } from '../controllers/leadConversion';
```

und nach der `/conversion/shopify`-Zeile:

```ts
// POST /api/webhook/conversion/lead - Server-to-server lead conversion (secret-protected)
router.post('/conversion/lead', handleLeadConversionWebhook);
```

- [ ] **Step 5: Test laufen lassen, grün verifizieren**

Run: `cd /Users/daniel/src/github/kreuzhofer/track-my-sales && npx jest src/__tests__/controllers/leadConversion.test.ts`
Expected: PASS (alle 7 Tests).

- [ ] **Step 6: Volle Suite (Regressionscheck) + Commit**

Run: `cd /Users/daniel/src/github/kreuzhofer/track-my-sales && npx jest src/__tests__/controllers/conversionTracking.test.ts src/__tests__/controllers/leadConversion.test.ts`
Expected: PASS (beide Dateien).

```bash
git add src/controllers/leadConversion.ts src/routes/webhook.ts src/__tests__/controllers/leadConversion.test.ts
git commit -m "feat: POST /api/webhook/conversion/lead server-to-server lead webhook"
```

- [ ] **Step 7: Branch pushen**

```bash
git push -u origin feature/lead-conversion-webhook
```

---

## Phase 2: danielkreuzhofer-ai-profile — Funnel-Integration

Alle folgenden Tasks: `cd /Users/daniel/src/github/kreuzhofer/danielkreuzhofer-ai-profile`, Branch `feature/trackmysales-attribution`. Tests: `npm test --prefix frontend -- <pfad>`.

### Task 4: `submissions.tid`-Spalte + Migration

**Files:**
- Modify: `frontend/src/db/schema.ts`
- Generate: `frontend/src/db/migrations/0001_*.sql`

- [ ] **Step 1: Spalte ergänzen**

In `frontend/src/db/schema.ts` im `submissions`-Objekt nach `userAgent: text("user_agent"),` einfügen:

```ts
    /** trackmysales visitor id captured from ?tid on landing (null if untracked). */
    tid: text("tid"),
```

- [ ] **Step 2: Migration generieren**

Run: `cd frontend && npm run db:generate`
Expected: neue Datei `src/db/migrations/0001_*.sql` mit `ALTER TABLE "submissions" ADD COLUMN "tid" text;`

- [ ] **Step 3: Migration-SQL kurz prüfen**

Run: `cat frontend/src/db/migrations/0001_*.sql`
Expected: enthält genau das `ADD COLUMN "tid"` (kein Drop, keine anderen Tabellen).

- [ ] **Step 4: Commit**

```bash
cd /Users/daniel/src/github/kreuzhofer/danielkreuzhofer-ai-profile
git add frontend/src/db/schema.ts frontend/src/db/migrations/
git commit -m "feat(db): submissions.tid column for trackmysales attribution"
```

---

### Task 5: Submit-Route nimmt `tid` an (TDD)

**Files:**
- Modify: `frontend/src/app/api/engpass-check/route.ts`
- Test: `frontend/src/app/api/engpass-check/route.test.ts`

- [ ] **Step 1: Failing test ergänzen**

In `frontend/src/app/api/engpass-check/route.test.ts` zwei Tests ergänzen. Die Datei hat bereits den Helper `post(body)`, die Konstante `validAnswers` und den `insertSubmission`-Mock `mockInsert` (`mockInsert.mock.calls[0][0]` = das eingefügte Row-Objekt):

```ts
it("persists a valid tid from the body", async () => {
  const res = await post({ email: "lead@firma.de", answers: validAnswers, tid: "vid_abc-123" });
  expect(res.status).toBe(200);
  expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ tid: "vid_abc-123" }));
});

it("stores tid as null when malformed", async () => {
  await post({ email: "lead@firma.de", answers: validAnswers, tid: "bad tid!" });
  expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ tid: null }));
});
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag verifizieren**

Run: `npm test --prefix frontend -- src/app/api/engpass-check/route.test.ts`
Expected: FAIL — `tid` wird (noch) nicht an `insertSubmission` übergeben (undefined statt Wert/null).

- [ ] **Step 3: Route implementieren**

In `frontend/src/app/api/engpass-check/route.ts`:

`SubmitBody` erweitern:

```ts
interface SubmitBody {
  email: string;
  answers: Answers;
  tid?: string;
}
```

Konstante neben `EMAIL_RE` ergänzen:

```ts
const TID_RE = /^[A-Za-z0-9_-]{1,255}$/;
```

`isValidBody` um die optionale tid-Prüfung erweitern (Rückgabe-Ausdruck):

```ts
  return (
    typeof b.email === "string" &&
    typeof b.answers === "object" &&
    b.answers !== null &&
    !Array.isArray(b.answers) &&
    (b.tid === undefined || typeof b.tid === "string")
  );
```

Vor dem `insertSubmission`-Aufruf das tid normalisieren:

```ts
  const tid = typeof body.tid === "string" && TID_RE.test(body.tid) ? body.tid : null;
```

und im `insertSubmission({ ... })`-Objekt ergänzen (nach `userAgent: ...`):

```ts
      tid,
```

- [ ] **Step 4: Test laufen lassen, grün verifizieren**

Run: `npm test --prefix frontend -- src/app/api/engpass-check/route.test.ts`
Expected: PASS (inkl. der zwei neuen Tests; bestehende Tests unverändert grün).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/api/engpass-check/route.ts frontend/src/app/api/engpass-check/route.test.ts
git commit -m "feat(api): accept + persist tid on engpass-check submit"
```

---

### Task 6: trackmysales-Client (TDD)

**Files:**
- Create: `frontend/src/lib/engpass-check/trackmysales.ts`
- Test: `frontend/src/lib/engpass-check/trackmysales.test.ts`

- [ ] **Step 1: Failing test schreiben**

Create `frontend/src/lib/engpass-check/trackmysales.test.ts`:

```ts
import { isTrackmysalesConfigured, reportLeadConversion } from "./trackmysales";

const ENV = process.env;

beforeEach(() => {
  process.env = {
    ...ENV,
    TRACKMYSALES_BASE_URL: "https://tms.test",
    TRACKMYSALES_CONVERSION_CODE: "engpass-check",
    TRACKMYSALES_CONVERSION_SECRET: "s3cr3t",
  };
});

afterEach(() => {
  process.env = ENV;
  jest.restoreAllMocks();
});

describe("isTrackmysalesConfigured", () => {
  it("is true when all three vars are set", () => {
    expect(isTrackmysalesConfigured()).toBe(true);
  });
  it("is false when a var is missing", () => {
    delete process.env.TRACKMYSALES_CONVERSION_SECRET;
    expect(isTrackmysalesConfigured()).toBe(false);
  });
});

describe("reportLeadConversion", () => {
  it("POSTs code+trackingId with the secret header and returns attributed", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ attributed: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await reportLeadConversion("tid-123");

    expect(res.attributed).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://tms.test/api/webhook/conversion/lead",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-Conversion-Secret": "s3cr3t" }),
        body: JSON.stringify({ code: "engpass-check", trackingId: "tid-123" }),
      })
    );
  });

  it("throws on a non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    await expect(reportLeadConversion("tid-123")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag verifizieren**

Run: `npm test --prefix frontend -- src/lib/engpass-check/trackmysales.test.ts`
Expected: FAIL — Modul existiert nicht.

- [ ] **Step 3: Client implementieren**

Create `frontend/src/lib/engpass-check/trackmysales.ts`:

```ts
/**
 * trackmysales conversion client — reports a confirmed lead so trackmysales
 * attributes it (final-touch) to the originating click/video. Server-to-server;
 * the caller treats failures as non-fatal.
 */

import { createLogger } from "@/lib/logger";

const log = createLogger("Trackmysales");

function readConfig() {
  return {
    baseUrl: process.env.TRACKMYSALES_BASE_URL,
    code: process.env.TRACKMYSALES_CONVERSION_CODE,
    secret: process.env.TRACKMYSALES_CONVERSION_SECRET,
  };
}

/** True when base URL, conversion code and secret are all present. */
export function isTrackmysalesConfigured(): boolean {
  const c = readConfig();
  return Boolean(c.baseUrl && c.code && c.secret);
}

/** Report a confirmed lead to trackmysales. Throws on misconfig or HTTP error. */
export async function reportLeadConversion(tid: string): Promise<{ attributed: boolean }> {
  const c = readConfig();
  if (!c.baseUrl || !c.code || !c.secret) {
    throw new Error("trackmysales is not configured");
  }
  const response = await fetch(`${c.baseUrl}/api/webhook/conversion/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Conversion-Secret": c.secret },
    body: JSON.stringify({ code: c.code, trackingId: tid }),
  });
  if (!response.ok) {
    throw new Error(`trackmysales lead webhook failed (HTTP ${response.status})`);
  }
  const data = (await response.json().catch(() => null)) as { attributed?: boolean } | null;
  log.info("trackmysales lead conversion reported", { attributed: data?.attributed ?? false });
  return { attributed: Boolean(data?.attributed) };
}
```

- [ ] **Step 4: Test laufen lassen, grün verifizieren**

Run: `npm test --prefix frontend -- src/lib/engpass-check/trackmysales.test.ts`
Expected: PASS (4 Tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/engpass-check/trackmysales.ts frontend/src/lib/engpass-check/trackmysales.test.ts
git commit -m "feat: trackmysales lead conversion client"
```

---

### Task 7: `confirm.ts` meldet die Conversion (TDD)

**Files:**
- Modify: `frontend/src/lib/engpass-check/confirm.ts`
- Test: `frontend/src/lib/engpass-check/confirm.test.ts`

- [ ] **Step 1: Failing tests ergänzen**

In `frontend/src/lib/engpass-check/confirm.test.ts` oben bei den anderen `jest.mock`-Blöcken einen Mock für den trackmysales-Client ergänzen:

```ts
let trackmysalesConfigured = true;
const mockReportLead = jest.fn();
jest.mock("@/lib/engpass-check/trackmysales", () => ({
  isTrackmysalesConfigured: () => trackmysalesConfigured,
  reportLeadConversion: (...a: unknown[]) => mockReportLead(...a),
}));
```

Im `beforeEach` (bei den anderen `mock*.mockReset()`):

```ts
  trackmysalesConfigured = true;
  mockReportLead.mockReset().mockResolvedValue({ attributed: true });
```

Zwei Tests ergänzen:

```ts
it("reports the trackmysales conversion when the submission has a tid", async () => {
  mockFindByDoiToken.mockResolvedValueOnce(submission({ tid: "tid-xyz" }));
  await confirmByToken("doi_abc");
  expect(mockReportLead).toHaveBeenCalledWith("tid-xyz");
});

it("skips trackmysales when the submission has no tid", async () => {
  mockFindByDoiToken.mockResolvedValueOnce(submission()); // factory has no tid
  await confirmByToken("doi_abc");
  expect(mockReportLead).not.toHaveBeenCalled();
});

it("still confirms when the trackmysales report fails (non-fatal)", async () => {
  mockReportLead.mockRejectedValueOnce(new Error("tms down"));
  mockFindByDoiToken.mockResolvedValueOnce(submission({ tid: "tid-xyz" }));
  const result = await confirmByToken("doi_abc");
  expect(result.status).toBe("confirmed");
});
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag verifizieren**

Run: `npm test --prefix frontend -- src/lib/engpass-check/confirm.test.ts`
Expected: FAIL — `mockReportLead` wird nie aufgerufen (Funktion noch nicht in confirm.ts verdrahtet).

- [ ] **Step 3: confirm.ts implementieren**

In `frontend/src/lib/engpass-check/confirm.ts` Import ergänzen:

```ts
import { isTrackmysalesConfigured, reportLeadConversion } from "@/lib/engpass-check/trackmysales";
```

Nach dem CleverReach-`if (isCleverReachConfigured()) { ... }`-Block und vor `return { status: "confirmed", reportUrl };` einfügen:

```ts
  // trackmysales attribution — best-effort, server-to-server. Closes the
  // video→lead loop now that we no longer redirect through a /c/:code link.
  if (submission.tid && isTrackmysalesConfigured()) {
    try {
      await reportLeadConversion(submission.tid);
    } catch (error) {
      log.error("trackmysales lead conversion failed (non-fatal)", error);
    }
  }
```

- [ ] **Step 4: Test laufen lassen, grün verifizieren**

Run: `npm test --prefix frontend -- src/lib/engpass-check/confirm.test.ts`
Expected: PASS (bestehende + 3 neue Tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/engpass-check/confirm.ts frontend/src/lib/engpass-check/confirm.test.ts
git commit -m "feat: report trackmysales lead conversion on DOI confirm"
```

---

### Task 8: tid-Capture im Quiz (TDD)

**Files:**
- Create: `frontend/src/lib/engpass-check/tracking.ts`
- Test: `frontend/src/lib/engpass-check/tracking.test.ts`
- Modify: `frontend/src/app/engpass-check/EngpassCheck.tsx`
- Modify: `frontend/src/app/engpass-check/EngpassCheck.test.tsx`

- [ ] **Step 1: Failing test für den Capture-Helper schreiben**

Create `frontend/src/lib/engpass-check/tracking.test.ts`:

```ts
import { captureTrackingId } from "./tracking";

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, "", "/engpass-check");
});

describe("captureTrackingId", () => {
  it("captures ?tid from the URL and persists it", () => {
    window.history.replaceState({}, "", "/engpass-check?tid=vid_abc-123");
    expect(captureTrackingId()).toBe("vid_abc-123");
    expect(sessionStorage.getItem("engpass-check-tid")).toBe("vid_abc-123");
  });

  it("falls back to the persisted tid when the URL has none", () => {
    sessionStorage.setItem("engpass-check-tid", "saved_tid");
    expect(captureTrackingId()).toBe("saved_tid");
  });

  it("returns null for a missing tid", () => {
    expect(captureTrackingId()).toBeNull();
  });

  it("returns null for a malformed tid", () => {
    window.history.replaceState({}, "", "/engpass-check?tid=bad%20tid");
    expect(captureTrackingId()).toBeNull();
  });
});
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag verifizieren**

Run: `npm test --prefix frontend -- src/lib/engpass-check/tracking.test.ts`
Expected: FAIL — Modul existiert nicht.

- [ ] **Step 3: Helper implementieren**

Create `frontend/src/lib/engpass-check/tracking.ts`:

```ts
/**
 * trackmysales visitor-id capture. Prefers ?tid= from the URL (first arrival
 * from a tracked short link), else the value persisted earlier this session.
 * Returns null when there is no valid tid. Browser-only.
 */

const TID_KEY = "engpass-check-tid";
const TID_RE = /^[A-Za-z0-9_-]{1,255}$/;

export function captureTrackingId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("tid");
    if (fromUrl && TID_RE.test(fromUrl)) {
      sessionStorage.setItem(TID_KEY, fromUrl);
      return fromUrl;
    }
    const saved = sessionStorage.getItem(TID_KEY);
    return saved && TID_RE.test(saved) ? saved : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Helper-Test grün verifizieren**

Run: `npm test --prefix frontend -- src/lib/engpass-check/tracking.test.ts`
Expected: PASS (4 Tests).

- [ ] **Step 5: tid in EngpassCheck.tsx verdrahten**

In `frontend/src/app/engpass-check/EngpassCheck.tsx`:

Import ergänzen:

```ts
import { captureTrackingId } from "@/lib/engpass-check/tracking";
```

In der `EngpassCheck`-Komponente (nach dem `useReducer`) tid-State + Capture-Effekt ergänzen:

```ts
  const [tid, setTid] = useState<string | null>(null);
  useEffect(() => {
    setTid(captureTrackingId());
  }, []);
```

(`useState`/`useEffect` sind oben bereits importiert.)

`Result` das tid übergeben:

```tsx
        {state.phase === "result" && (
          <Result
            answers={state.answers}
            tid={tid}
            onBack={() => dispatch({ type: "back" })}
            onRestart={() => {
              try {
                sessionStorage.removeItem(STORAGE_KEY);
              } catch {
                /* non-fatal */
              }
              dispatch({ type: "restart" });
            }}
          />
        )}
```

`Result`-Signatur + `OptIn`-Aufruf erweitern:

```tsx
function Result({
  answers,
  tid,
  onBack,
  onRestart,
}: {
  answers: Answers;
  tid: string | null;
  onBack: () => void;
  onRestart: () => void;
}) {
```

und im Result-JSX `<OptIn answers={answers} />` ersetzen durch:

```tsx
      <OptIn answers={answers} tid={tid} />
```

`OptIn`-Signatur + Submit-Body erweitern:

```tsx
function OptIn({ answers, tid }: { answers: Answers; tid: string | null }) {
```

und im `fetch`-Body:

```ts
        body: JSON.stringify({ email: email.trim(), answers, ...(tid ? { tid } : {}) }),
```

- [ ] **Step 6: Failing component test ergänzen**

In `frontend/src/app/engpass-check/EngpassCheck.test.tsx` einen Test ergänzen (Muster wie der bestehende „submits the opt-in"-Test):

```ts
it("includes the captured tid in the opt-in submit", async () => {
  window.history.replaceState({}, "", "/engpass-check?tid=vid01");
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  global.fetch = fetchMock as unknown as typeof fetch;

  render(<EngpassCheck />);
  completeQuiz();
  fireEvent.change(screen.getByLabelText("E-Mail-Adresse"), { target: { value: "lead@firma.de" } });
  fireEvent.click(screen.getByRole("button", { name: "Toolkit anfordern" }));

  expect(await screen.findByText(/schau in Dein Postfach/i)).toBeInTheDocument();
  const body = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(body.tid).toBe("vid01");
});
```

Im bestehenden `beforeEach` der Datei das URL-Reset ergänzen, damit andere Tests kein tid mitschleppen:

```ts
beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, "", "/engpass-check");
});
```

- [ ] **Step 7: EngpassCheck-Tests grün verifizieren**

Run: `npm test --prefix frontend -- src/app/engpass-check/EngpassCheck.test.tsx`
Expected: PASS (bestehende + neuer Test).

- [ ] **Step 8: Commit**

```bash
git add frontend/src/lib/engpass-check/tracking.ts frontend/src/lib/engpass-check/tracking.test.ts frontend/src/app/engpass-check/EngpassCheck.tsx frontend/src/app/engpass-check/EngpassCheck.test.tsx
git commit -m "feat: capture ?tid on landing and submit it with the opt-in"
```

---

### Task 9: Env-Dokumentation + docker-compose + Full-Verify

**Files:**
- Modify: `.env.example`
- Modify: `docker-compose.yml`

- [ ] **Step 1: `.env.example` ergänzen**

In `.env.example` nach dem CleverReach-Abschnitt einen Block ergänzen:

```
# -----------------------------------------------------------------------------
# Engpass-Check Attribution (trackmysales)
# -----------------------------------------------------------------------------
#
# After OUR own Double-Opt-in confirms a lead, the app reports the conversion to
# trackmysales (server-to-server) so it is attributed (final-touch) to the
# originating click/video. The visitor id (tid) is captured from ?tid on landing
# and stored with the submission. Without these three the report step simply
# skips the call (best-effort; the lead still gets the report).
#
# TRACKMYSALES_BASE_URL: base URL of the trackmysales API (no trailing slash)
# TRACKMYSALES_CONVERSION_CODE: the email_list ConversionLink code (e.g. engpass-check)
# TRACKMYSALES_CONVERSION_SECRET: shared secret = LEAD_CONVERSION_SECRET on trackmysales
# TRACKMYSALES_BASE_URL=
# TRACKMYSALES_CONVERSION_CODE=
# TRACKMYSALES_CONVERSION_SECRET=
```

- [ ] **Step 2: docker-compose durchreichen**

In `docker-compose.yml` bei **beiden** Services (`frontend` und `frontend-prod`) unter `environment:` nach den `CLEVERREACH_*`-Zeilen ergänzen:

```yaml
      - TRACKMYSALES_BASE_URL=${TRACKMYSALES_BASE_URL:-}
      - TRACKMYSALES_CONVERSION_CODE=${TRACKMYSALES_CONVERSION_CODE:-}
      - TRACKMYSALES_CONVERSION_SECRET=${TRACKMYSALES_CONVERSION_SECRET:-}
```

- [ ] **Step 3: Volle Engpass-Suite + Lint + Production-Build**

```bash
cd /Users/daniel/src/github/kreuzhofer/danielkreuzhofer-ai-profile/frontend
npm test -- --testPathPattern="engpass|trackmysales|tracking"
npx eslint src/lib/engpass-check/trackmysales.ts src/lib/engpass-check/tracking.ts src/app/api/engpass-check/route.ts src/lib/engpass-check/confirm.ts src/app/engpass-check/EngpassCheck.tsx
rm -rf .next && NODE_ENV=production npx next build
```
Expected: alle Tests grün; Lint ohne Fehler; Build „✓ Compiled successfully" + alle static pages.

- [ ] **Step 4: Commit**

```bash
cd /Users/daniel/src/github/kreuzhofer/danielkreuzhofer-ai-profile
git add .env.example docker-compose.yml
git commit -m "chore: document + wire trackmysales attribution env vars"
```

---

## Ops / manuelle Verifikation (Daniel, nach Deploy)

1. In trackmysales eine **email_list-ConversionLink** anlegen (Code z.B. `engpass-check`).
2. Shared Secret auf beiden Seiten setzen: `LEAD_CONVERSION_SECRET` (trackmysales) = `TRACKMYSALES_CONVERSION_SECRET` (Funnel). Funnel-`.env`: `TRACKMYSALES_BASE_URL`, `TRACKMYSALES_CONVERSION_CODE=engpass-check`, `TRACKMYSALES_CONVERSION_SECRET=…`.
3. Echten Shortlink aus einem Video klicken → prüfen, dass die Landing-URL `…/engpass-check?tid=…` enthält.
4. Quiz ausfüllen → E-Mail → DOI-Mail bestätigen.
5. In trackmysales prüfen: ein neuer `email_list`-ConversionEvent, attribuiert auf den Klick/das Quell-Video. Zweite Bestätigung mit gleicher tid → kein zweiter Event (Dedup).

## Build-Reihenfolge / Abhängigkeiten

- Phase 1 vor Phase 2 deployen (der Funnel ruft den Endpoint; ohne ihn ist die Meldung non-fatal, aber Attribution fehlt).
- Migration (Task 4) muss in der Ziel-DB laufen (`npm run db:migrate`) bevor `tid`-Submits persistiert werden.

## Out of Scope

- Revenue/Sale-Attribution (Lead = `revenue:null`).
- Klick-Tracking selbst (unverändert).
- Rückwirkende Attribution bestehender Leads.
