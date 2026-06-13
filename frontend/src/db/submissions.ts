/**
 * Submissions repository — the only place that talks to the submissions table.
 */

import { and, eq, lt } from "drizzle-orm";
import { getDb } from "./client";
import { submissions, type NewSubmission, type Submission } from "./schema";

export async function insertSubmission(data: NewSubmission): Promise<Submission> {
  const [row] = await getDb().insert(submissions).values(data).returning();
  return row;
}

export async function findByDoiToken(token: string): Promise<Submission | undefined> {
  const [row] = await getDb()
    .select()
    .from(submissions)
    .where(eq(submissions.doiToken, token))
    .limit(1);
  return row;
}

export async function findByReportToken(token: string): Promise<Submission | undefined> {
  const [row] = await getDb()
    .select()
    .from(submissions)
    .where(eq(submissions.reportToken, token))
    .limit(1);
  return row;
}

/** Mark a submission confirmed. Returns the updated row (undefined if not found). */
export async function confirmSubmission(id: string): Promise<Submission | undefined> {
  const [row] = await getDb()
    .update(submissions)
    .set({ doiStatus: "confirmed", confirmedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function markCleverreachSynced(id: string): Promise<void> {
  await getDb().update(submissions).set({ cleverreachSynced: true }).where(eq(submissions.id, id));
}

/** DSGVO retention: delete unconfirmed (no consent) submissions older than `cutoff`. */
export async function purgePendingOlderThan(cutoff: Date): Promise<number> {
  const rows = await getDb()
    .delete(submissions)
    .where(and(eq(submissions.doiStatus, "pending"), lt(submissions.createdAt, cutoff)))
    .returning({ id: submissions.id });
  return rows.length;
}
