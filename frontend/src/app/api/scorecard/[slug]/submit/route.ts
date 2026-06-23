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

// Bound the stored jsonb: no real scorecard has anywhere near this many questions.
const MAX_ANSWERS = 100;

function isValidBody(body: unknown): body is SubmitBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.email !== "string") return false;
  if (b.tid !== undefined && typeof b.tid !== "string") return false;
  const answers = b.answers;
  if (typeof answers !== "object" || answers === null || Array.isArray(answers)) return false;
  // The schema (and CleverReach/analytics) assume string→string answers; enforce it
  // at the boundary so malformed/oversized payloads never reach the DB (§3/§8).
  const entries = Object.entries(answers as Record<string, unknown>);
  if (entries.length > MAX_ANSWERS) return false;
  return entries.every(([, v]) => typeof v === "string");
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
