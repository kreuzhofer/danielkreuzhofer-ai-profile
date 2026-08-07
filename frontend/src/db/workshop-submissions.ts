/**
 * Workshop submission DB operations.
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  workshopSubmissions,
  workshops,
  type NewWorkshopSubmission,
  type WorkshopSubmission,
} from "@/db/schema";

/** Insert a new workshop submission (status defaults to 'reserved'). */
export async function insertWorkshopSubmission(
  data: NewWorkshopSubmission,
): Promise<WorkshopSubmission> {
  const db = getDb();
  const rows = await db.insert(workshopSubmissions).values(data).returning();
  return rows[0]!;
}

/** Find a submission by its confirm-payment token hash. */
export async function findByConfirmPaymentToken(
  tokenHash: string,
): Promise<WorkshopSubmission | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(workshopSubmissions)
    .where(eq(workshopSubmissions.confirmPaymentToken, tokenHash))
    .limit(1);
  return rows[0] ?? null;
}

/** Find a submission by its cancel token hash. */
export async function findByCancelToken(tokenHash: string): Promise<WorkshopSubmission | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(workshopSubmissions)
    .where(eq(workshopSubmissions.cancelToken, tokenHash))
    .limit(1);
  return rows[0] ?? null;
}

/** Transition a submission to 'booked' (sets bookedAt, clears action tokens). */
export async function markBooked(id: string): Promise<WorkshopSubmission | null> {
  const db = getDb();
  const rows = await db
    .update(workshopSubmissions)
    .set({ status: "booked", bookedAt: new Date(), confirmPaymentToken: null, cancelToken: null, updatedAt: new Date() })
    .where(and(eq(workshopSubmissions.id, id), eq(workshopSubmissions.status, "reserved")))
    .returning();
  return rows[0] ?? null;
}

/** Transition a submission to 'cancelled' (sets cancelledAt, clears action tokens). */
export async function markCancelled(id: string): Promise<WorkshopSubmission | null> {
  const db = getDb();
  const rows = await db
    .update(workshopSubmissions)
    .set({ status: "cancelled", cancelledAt: new Date(), confirmPaymentToken: null, cancelToken: null, updatedAt: new Date() })
    .where(and(eq(workshopSubmissions.id, id), eq(workshopSubmissions.status, "reserved")))
    .returning();
  return rows[0] ?? null;
}

/** Mark lead conversion as reported. */
export async function markLeadReported(id: string): Promise<void> {
  const db = getDb();
  await db
    .update(workshopSubmissions)
    .set({ leadReportedAt: new Date() })
    .where(eq(workshopSubmissions.id, id));
}

/** Mark revenue conversion as reported. */
export async function markRevenueReported(id: string): Promise<void> {
  const db = getDb();
  await db
    .update(workshopSubmissions)
    .set({ revenueReportedAt: new Date() })
    .where(eq(workshopSubmissions.id, id));
}

/** Find a workshop by its admin token hash. */
export async function findWorkshopByAdminToken(tokenHash: string): Promise<Workshop | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(workshops)
    .where(eq(workshops.adminToken, tokenHash))
    .limit(1);
  return rows[0] ?? null;
}

/** Get all submissions for a workshop (for the admin overview). */
export async function getSubmissionsForWorkshop(workshopId: string): Promise<WorkshopSubmission[]> {
  const db = getDb();
  return db
    .select()
    .from(workshopSubmissions)
    .where(eq(workshopSubmissions.workshopId, workshopId));
}
