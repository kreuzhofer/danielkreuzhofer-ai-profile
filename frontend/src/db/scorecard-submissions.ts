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

export async function purgeScorecardPendingOlderThan(cutoff: Date): Promise<number> {
  const rows = await getDb()
    .delete(scorecardSubmissions)
    .where(
      and(eq(scorecardSubmissions.doiStatus, "pending"), lt(scorecardSubmissions.createdAt, cutoff)),
    )
    .returning({ id: scorecardSubmissions.id });
  return rows.length;
}
