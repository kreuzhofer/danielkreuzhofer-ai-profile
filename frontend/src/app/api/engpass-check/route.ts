/**
 * POST /api/engpass-check
 *
 * Opt-in submit for the Engpass-Check. Receives the lead's email + answers,
 * recomputes the result server-side, persists a `pending` submission in Postgres,
 * and sends our own Double-Opt-in confirmation email. The CleverReach newsletter
 * push + report-delivery mail happen later, after the lead confirms.
 *
 * DSGVO: this stores personal data (email + answers) under consent; the consent
 * is completed by the Double-Opt-in. Internal errors are never exposed.
 */

import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { computeResult } from "@/lib/engpass-check/scoring";
import { newToken, baseUrl } from "@/lib/engpass-check/tokens";
import { insertSubmission } from "@/db/submissions";
import { isDatabaseConfigured } from "@/db/client";
import { EmailNotConfiguredError, sendDoiConfirmation } from "@/lib/email/send";
import type { Answers } from "@/lib/engpass-check/types";

const log = createLogger("EngpassCheckAPI");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubmitBody {
  email: string;
  answers: Answers;
}

function isValidBody(body: unknown): body is SubmitBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.email === "string" &&
    typeof b.answers === "object" &&
    b.answers !== null &&
    !Array.isArray(b.answers)
  );
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "";
}

export async function POST(request: NextRequest): Promise<Response> {
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
    log.warn("Submit received but DATABASE_URL is not configured");
    return NextResponse.json(
      { ok: false, code: "NOT_CONFIGURED", message: "Der Versand ist noch nicht aktiviert." },
      { status: 503 },
    );
  }

  // Recompute server-side so the stored result is authoritative.
  const result = computeResult(body.answers);
  const doiToken = newToken();
  const reportToken = newToken();

  try {
    await insertSubmission({
      scorecard: "engpass-check",
      email,
      answers: body.answers as Record<string, string>,
      score: result.score,
      band: result.band,
      typ: result.typ,
      weg: result.weg,
      qualified: result.qualified,
      doiToken,
      reportToken,
      ipAtSubmit: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? "",
    });

    await sendDoiConfirmation({
      to: email,
      confirmUrl: `${baseUrl()}/engpass-check/bestaetigen?token=${doiToken}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      log.warn("Submit stored but SMTP is not configured — no DOI email sent");
      return NextResponse.json(
        { ok: false, code: "NOT_CONFIGURED", message: "Der Versand ist noch nicht aktiviert." },
        { status: 503 },
      );
    }
    log.error("Engpass-Check submit failed", error);
    return NextResponse.json({ ok: false, code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
