/**
 * POST /api/workshop/[slug]/submit
 *
 * Validates the workshop signup form (Zod), enforces rate-limit + single-open-
 * reservation-per-email, checks slot availability, inserts a 'reserved' row,
 * and fires the TrackMySales lead conversion. Mails + DOI are ticket #8.
 *
 * Response codes: { ok: true } or { ok: false, code: ... }
 *   200 — reserved
 *   400 — INVALID_REQUEST (Zod validation failed)
 *   404 — NOT_FOUND (slug unknown)
 *   409 — SOLD_OUT | DUPLICATE_RESERVATION
 *   429 — RATE_LIMITED
 *   503 — NOT_CONFIGURED (DB or email not configured)
 *   500 — INTERNAL_ERROR
 */

import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { getWorkshopBySlug } from "@/lib/workshop/queries";
import { validateWorkshopSignup } from "@/lib/workshop/validation";
import { getFreeSlots, countOpenReservationsByEmail } from "@/lib/workshop/slots";
import { insertWorkshopSubmission, markLeadReported } from "@/db/workshop-submissions";
import { isDatabaseConfigured } from "@/db/client";
import { newWorkshopToken, hashToken } from "@/lib/workshop/tokens";
import { createRateLimiter } from "@/lib/scorecard/rate-limit";
import { reportLeadConversion, isTrackmysalesConfigured } from "@/lib/scorecard/trackmysales";

const log = createLogger("WorkshopSubmitAPI");

// 3 submits per IP per 10 minutes (stricter than scorecards — more fields,
// slot-blocking consequences).
const limiter = createRateLimiter({ max: 3, windowMs: 10 * 60 * 1000 });

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

  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  // termin NULL → not bookable
  if (!workshop.termin) {
    return NextResponse.json({ ok: false, code: "NOT_BOOKABLE" }, { status: 400 });
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

  const validation = validateWorkshopSignup(body);
  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, code: "INVALID_REQUEST", errors: validation.errors },
      { status: 400 },
    );
  }

  if (!isDatabaseConfigured()) {
    log.warn("Submit received but DATABASE_URL is not configured", { slug });
    return NextResponse.json({ ok: false, code: "NOT_CONFIGURED" }, { status: 503 });
  }

  // Slot check
  const freeSlots = await getFreeSlots(workshop);
  if (freeSlots <= 0) {
    return NextResponse.json({ ok: false, code: "SOLD_OUT" }, { status: 409 });
  }

  // Single open reservation per email
  const openReservations = await countOpenReservationsByEmail(
    workshop.id,
    validation.data.email.toLowerCase(),
  );
  if (openReservations > 0) {
    return NextResponse.json({ ok: false, code: "DUPLICATE_RESERVATION" }, { status: 409 });
  }

  // Generate action tokens (hashes for DB, plaintext for mail links — mail is ticket #8)
  const confirmPaymentTokenPlain = newWorkshopToken();
  const cancelTokenPlain = newWorkshopToken();

  try {
    const submission = await insertWorkshopSubmission({
      workshopId: workshop.id,
      firstName: validation.data.firstName,
      lastName: validation.data.lastName,
      email: validation.data.email.toLowerCase(),
      company: validation.data.company,
      role: validation.data.role ?? null,
      secondPersonName: validation.data.secondPersonName ?? null,
      secondPersonEmail: validation.data.secondPersonEmail ?? null,
      invoiceCompany: validation.data.invoiceCompany,
      invoiceContactName: validation.data.invoiceContactName,
      invoiceEmail: validation.data.invoiceEmail.toLowerCase(),
      invoiceStreet: validation.data.invoiceStreet,
      invoiceZip: validation.data.invoiceZip,
      invoiceCity: validation.data.invoiceCity,
      invoiceCountry: validation.data.invoiceCountry,
      invoiceUstId: validation.data.invoiceUstId ?? null,
      isSmallBusiness: validation.data.isSmallBusiness,
      paymentPreference: validation.data.paymentPreference,
      newsletterOptIn: validation.data.newsletterOptIn,
      status: "reserved",
      trackingId: validation.data.tid ?? null,
      confirmPaymentToken: hashToken(confirmPaymentTokenPlain),
      cancelToken: hashToken(cancelTokenPlain),
      ipAtSubmit: ip,
      userAgent: request.headers.get("user-agent") ?? "",
    });

    // TrackMySales lead conversion (best-effort, non-fatal)
    if (validation.data.tid && isTrackmysalesConfigured()) {
      try {
        await reportLeadConversion(validation.data.tid, slug);
        await markLeadReported(submission.id);
      } catch (err) {
        log.warn("TrackMySales lead conversion failed (non-fatal)", { slug, error: String(err) });
      }
    }

    // Mails (ticket #8) — TODO: send reservation + DOI + admin-notification here.
    // For now the tokens are available for the next ticket to wire into mail links.

    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error("Workshop submit failed", error);
    return NextResponse.json({ ok: false, code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
