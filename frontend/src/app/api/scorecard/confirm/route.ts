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
