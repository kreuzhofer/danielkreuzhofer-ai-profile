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
    answers: jsonb("answers").notNull().$type<Record<string, string | string[]>>(),
    result: jsonb("result").notNull().$type<ScorecardResult>(),
    doiStatus: text("doi_status").notNull().default("pending"), // pending | confirmed | expired
    doiToken: text("doi_token").notNull().unique(),
    reportToken: text("report_token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    ipAtSubmit: text("ip_at_submit"), // DSGVO-Consent-Nachweis
    userAgent: text("user_agent"),
    tid: text("tid"), // trackmysales attribution (optional)
    cleverreachSynced: boolean("cleverreach_synced").notNull().default(false),
  },
  (t) => [
    index("scorecard_submissions_scorecard_idx").on(t.scorecard),
    index("scorecard_submissions_created_at_idx").on(t.createdAt),
  ],
);

export type ScorecardSubmission = typeof scorecardSubmissions.$inferSelect;
export type NewScorecardSubmission = typeof scorecardSubmissions.$inferInsert;

/**
 * Workshop funnel — paid workshop signups (distinct from the gratis scorecard
 * funnels). Two tables: the workshop entity (termine, capacity, price) and the
 * submissions hanging off it. Glossary: see CONTEXT.md "Workshop" section.
 *
 * Token security (ADR-0002): action tokens and the admin token are stored as
 * SHA-256 hashes, NOT plaintext — unlike the scorecard tokens above. Admin
 * actions have money/capacity consequences, so a DB leak must not expose them.
 */
export const workshops = pgTable(
  "workshops",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    /** NULL = termin open; the workshop is not bookable (form disabled). */
    termin: timestamp("termin", { withTimezone: true }),
    durationMin: integer("duration_min").notNull().default(90),
    priceNetEur: integer("price_net_eur").notNull(),
    capacity: integer("capacity").notNull(),
    minBookedToRun: integer("min_booked_to_run").notNull(),
    status: text("status").notNull().default("scheduled"), // scheduled | sold_out | cancelled | completed
    format: text("format").notNull().default("live_online"),
    locationLabel: text("location_label").notNull().default("live online"),
    /** Recording mentioned only on the landingpage (Vault rule). */
    recordingHint: boolean("recording_hint").notNull().default(true),
    /** Pro-workshop, reusable admin overview token (SHA-256 hash). */
    adminToken: text("admin_token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("workshops_slug_idx").on(t.slug)],
);

export type Workshop = typeof workshops.$inferSelect;
export type NewWorkshop = typeof workshops.$inferInsert;

export const workshopSubmissions = pgTable(
  "workshop_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workshopId: uuid("workshop_id").notNull().references(() => workshops.id),

    // Anmeldende Person (Termin-Empfänger, Pflicht)
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    company: text("company").notNull(),
    role: text("role"),

    // Zweit-Person (optional, Firmaticket bis 2 Personen)
    secondPersonName: text("second_person_name"),
    secondPersonEmail: text("second_person_email"),

    // Rechnungsempfänger (immer Pflicht, evtl. aus Anmeldender Person kopiert)
    invoiceCompany: text("invoice_company").notNull(),
    invoiceContactName: text("invoice_contact_name").notNull(),
    invoiceEmail: text("invoice_email").notNull(),
    invoiceStreet: text("invoice_street").notNull(),
    invoiceZip: text("invoice_zip").notNull(),
    invoiceCity: text("invoice_city").notNull(),
    invoiceCountry: text("invoice_country").notNull().default("Deutschland"),
    invoiceUstId: text("invoice_ust_id"),
    isSmallBusiness: boolean("is_small_business").notNull().default(false),

    // Zahlung
    paymentPreference: text("payment_preference").notNull(), // bank_transfer | payment_link

    // Newsletter
    newsletterOptIn: boolean("newsletter_opt_in").notNull().default(false),
    newsletterDoiConfirmedAt: timestamp("newsletter_doi_confirmed_at", { withTimezone: true }),

    // Status machine: reserved → booked | cancelled (terminal)
    status: text("status").notNull().default("reserved"), // reserved | booked | cancelled
    reservedAt: timestamp("reserved_at", { withTimezone: true }).notNull().defaultNow(),
    bookedAt: timestamp("booked_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

    // TrackMySales
    trackingId: text("tracking_id"),
    leadReportedAt: timestamp("lead_reported_at", { withTimezone: true }),
    revenueReportedAt: timestamp("revenue_reported_at", { withTimezone: true }),

    // Action tokens (SHA-256 hashes, single-use — ADR-0002)
    confirmPaymentToken: text("confirm_payment_token"),
    cancelToken: text("cancel_token"),

    // DOI audit trail (DSGVO-minimal)
    ipAtSubmit: text("ip_at_submit"),
    userAgent: text("user_agent"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("workshop_submissions_workshop_id_idx").on(t.workshopId),
    index("workshop_submissions_status_idx").on(t.status),
    index("workshop_submissions_email_idx").on(t.email),
    index("workshop_submissions_tracking_id_idx").on(t.trackingId),
  ],
);

export type WorkshopSubmission = typeof workshopSubmissions.$inferSelect;
export type NewWorkshopSubmission = typeof workshopSubmissions.$inferInsert;
