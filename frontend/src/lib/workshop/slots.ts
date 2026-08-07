/**
 * Workshop slot logic — free-slot calculation and single-open-reservation check.
 *
 * freeSlots = capacity - count(submissions where status in (reserved, booked))
 * A cancelled submission does NOT block a slot.
 */

import { and, count, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { workshopSubmissions, type Workshop } from "@/db/schema";

/** Active statuses — a submission in these states blocks a slot. */
export const ACTIVE_STATUSES = ["reserved", "booked"] as const;

/** Count non-cancelled submissions for a workshop. */
export async function countActiveSubmissions(workshopId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ n: count() })
    .from(workshopSubmissions)
    .where(
      and(
        eq(workshopSubmissions.workshopId, workshopId),
        inArray(workshopSubmissions.status, [...ACTIVE_STATUSES]),
      ),
    );
  return Number(rows[0]?.n ?? 0);
}

/** Free slots = capacity minus active submissions. Never negative. */
export async function getFreeSlots(workshop: Workshop): Promise<number> {
  const active = await countActiveSubmissions(workshop.id);
  return Math.max(0, workshop.capacity - active);
}

/** Count open (reserved, not cancelled) reservations for an email. */
export async function countOpenReservationsByEmail(
  workshopId: string,
  email: string,
): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ n: count() })
    .from(workshopSubmissions)
    .where(
      and(
        eq(workshopSubmissions.workshopId, workshopId),
        eq(workshopSubmissions.email, email.toLowerCase()),
        eq(workshopSubmissions.status, "reserved"),
      ),
    );
  return Number(rows[0]?.n ?? 0);
}

/** Pure slot calculation for property-based testing. */
export function calculateFreeSlots(capacity: number, activeCount: number): number {
  return Math.max(0, capacity - activeCount);
}
