/**
 * Drizzle schema — Engpass-Check submissions.
 *
 * One table holds the whole funnel state: the lead's answers, the computed
 * result (denormalized for analytics), the Double-Opt-in status, and the two
 * unguessable tokens (DOI confirmation link + personalized report link).
 */

import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { ScorecardResult } from "../lib/scorecard/types";

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Which scorecard produced this row — lets the table serve future scorecards. */
    scorecard: text("scorecard").notNull().default("engpass-check"),
    email: text("email").notNull(),
    /** The 11 selected option-ids, e.g. { K1: "gf", S2: "alle", ... } */
    answers: jsonb("answers").notNull().$type<Record<string, string>>(),

    // Computed result, denormalized so analytics doesn't have to recompute.
    score: integer("score").notNull(),
    band: text("band").notNull(),
    typ: text("typ").notNull(),
    weg: text("weg").notNull(),
    qualified: boolean("qualified").notNull(),

    // Double-Opt-in
    doiStatus: text("doi_status").notNull().default("pending"), // pending | confirmed | expired
    doiToken: text("doi_token").notNull().unique(),
    reportToken: text("report_token").notNull().unique(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),

    // DOI audit trail (DSGVO-minimal — proof of consent)
    ipAtSubmit: text("ip_at_submit"),
    userAgent: text("user_agent"),

    /** trackmysales visitor id captured from ?tid on landing (null if untracked). */
    tid: text("tid"),

    cleverreachSynced: boolean("cleverreach_synced").notNull().default(false),
  },
  (t) => [
    index("submissions_scorecard_idx").on(t.scorecard),
    index("submissions_created_at_idx").on(t.createdAt),
    index("submissions_typ_idx").on(t.typ),
    index("submissions_weg_idx").on(t.weg),
  ],
);

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

/**
 * Generic scorecard funnel state — one row per opt-in. The scorecard-specific
 * result lives in `result jsonb` (no per-scorecard columns), so this one table
 * serves every config-driven scorecard. The Engpass-Check uses its own
 * `submissions` table and is unaffected.
 */
export const scorecardSubmissions = pgTable(
  "scorecard_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scorecard: text("scorecard").notNull(),
    email: text("email").notNull(),
    answers: jsonb("answers").notNull().$type<Record<string, string>>(),
    result: jsonb("result").notNull().$type<ScorecardResult>(),
    doiStatus: text("doi_status").notNull().default("pending"),
    doiToken: text("doi_token").notNull().unique(),
    reportToken: text("report_token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    ipAtSubmit: text("ip_at_submit"),
    userAgent: text("user_agent"),
    tid: text("tid"),
    cleverreachSynced: boolean("cleverreach_synced").notNull().default(false),
  },
  (t) => [
    index("scorecard_submissions_scorecard_idx").on(t.scorecard),
    index("scorecard_submissions_created_at_idx").on(t.createdAt),
  ],
);

export type ScorecardSubmission = typeof scorecardSubmissions.$inferSelect;
export type NewScorecardSubmission = typeof scorecardSubmissions.$inferInsert;
