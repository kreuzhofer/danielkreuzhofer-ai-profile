/**
 * Seed script for the ki-souveraenitaet workshop.
 *
 * Usage:
 *   DATABASE_URL=... tsx src/db/seed-workshop.ts
 *
 * Idempotent: inserts the row if missing, updates if the slug exists.
 * Generates a fresh admin_token hash on each run (the token is printed to
 * stdout so Daniel can bookmark the admin overview URL).
 */

import { createHash, randomBytes } from "node:crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { workshops } from "./schema";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  const adminTokenPlaintext = randomBytes(32).toString("base64url");
  const adminTokenHash = hashToken(adminTokenPlaintext);

  const existing = await db.select().from(workshops).where(eq(workshops.slug, "ki-souveraenitaet")).limit(1);

  if (existing.length === 0) {
    await db.insert(workshops).values({
      slug: "ki-souveraenitaet",
      title: "KI-Souveränität im Mittelstand",
      termin: null,
      durationMin: 90,
      priceNetEur: 99,
      capacity: 5,
      minBookedToRun: 3,
      status: "scheduled",
      format: "live_online",
      locationLabel: "live online",
      recordingHint: true,
      adminToken: adminTokenHash,
    });
  } else {
    await db
      .update(workshops)
      .set({ adminToken: adminTokenHash, updatedAt: new Date() })
      .where(eq(workshops.slug, "ki-souveraenitaet"));
  }

  console.log("✓ Workshop ki-souveraenitaet seeded (termin NULL = not bookable yet)");
  console.log(`  Admin overview URL: /workshop/admin?token=${adminTokenPlaintext}`);
  console.log("  (Store this token — it is not shown again.)");

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
