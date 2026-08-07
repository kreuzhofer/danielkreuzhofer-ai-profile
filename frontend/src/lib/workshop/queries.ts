/**
 * Workshop queries — server-side DB access for the workshop funnel.
 *
 * All functions return `null` (not throw) when the workshop is not found,
 * so the route handler can call `notFound()` cleanly.
 */

import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { workshops, type Workshop } from "@/db/schema";

/** Fetch a workshop by its slug. Returns null if not found or DB not configured. */
export async function getWorkshopBySlug(slug: string): Promise<Workshop | null> {
  if (!process.env.DATABASE_URL) return null;
  const db = getDb();
  const rows = await db.select().from(workshops).where(eq(workshops.slug, slug)).limit(1);
  return rows[0] ?? null;
}
