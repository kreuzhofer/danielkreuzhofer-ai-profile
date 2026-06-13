/**
 * Retention job — GET/POST /api/cron/purge
 *
 * Deletes unconfirmed (no Double-Opt-in = no consent) submissions older than
 * RETENTION_DAYS. Trigger it from an external scheduler (cron-job.org, a server
 * crontab, …) with the shared secret. Protected by CRON_SECRET; returns 401
 * without it. DSGVO: confirmed submissions are kept (consent given) and managed
 * via the newsletter/deletion-on-request process.
 */

import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { purgePendingOlderThan } from "@/db/submissions";

const log = createLogger("CronPurge");

const RETENTION_DAYS = 7;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // disabled until configured
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const provided = bearer ?? request.nextUrl.searchParams.get("secret") ?? "";
  return provided === secret;
}

async function handle(request: NextRequest): Promise<Response> {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const deleted = await purgePendingOlderThan(cutoff);
    log.info("Purged unconfirmed submissions", { deleted, retentionDays: RETENTION_DAYS });
    return NextResponse.json({ ok: true, deleted, retentionDays: RETENTION_DAYS });
  } catch (error) {
    log.error("Retention purge failed", error);
    return NextResponse.json({ ok: false, code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
