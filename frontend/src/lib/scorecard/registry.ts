/**
 * Scorecard registry — maps a slug to everything the funnel backend needs
 * beyond the engine definition (email subjects, CleverReach source). Scorecards
 * are registered as code in `src/scorecards`; new ones ship via git (no DB/admin).
 */

import type { ComponentType } from "react";
import { REGISTRATIONS } from "@/scorecards";
import type { Answers, ScorecardDefinition, ScorecardResult } from "./types";
import type { ScorecardContent } from "./content";
import type { BrandTokens } from "./branding";

/** Props a custom result view receives (free result screen). */
export interface ScorecardResultViewProps {
  registration: ScorecardRegistration;
  answers: Answers;
  result: ScorecardResult;
}

/** Props a custom gated report-doc receives. Must be SERIALIZABLE — the report
 *  page is a Server Component, so no functions (i.e. no full registration) here. */
export interface ScorecardReportDocProps {
  result: ScorecardResult;
  answers: Answers;
}

export interface ScorecardRegistration {
  definition: ScorecardDefinition;
  /** Transactional email subjects (German). */
  doiSubject: string;
  deliverySubject: string;
  /** CleverReach `source` + base tag; defaults to the slug. */
  cleverreachSource?: string;
  /** Booking link for the qualified-lead CTA in the delivery email (Variante B). */
  bookingUrl?: string;
  /** trackmysales ConversionLink code for lead attribution; defaults to the slug. */
  trackmysalesCode?: string;
  /** Page <head> metadata. */
  meta: { title: string; description: string };
  /** Renderer content + theme (M3). */
  content: ScorecardContent;
  branding: BrandTokens;
  /** Custom result computation; overrides the generic engine when present. */
  resolve?: (answers: Answers) => ScorecardResult;
  /** Custom free-result view; replaces the generic report-card slot when present. */
  ResultView?: ComponentType<ScorecardResultViewProps>;
  /** Custom gated report document; replaces ScorecardReportDoc when present. */
  ReportDoc?: ComponentType<ScorecardReportDocProps>;
  /** Extra CleverReach tags derived from the stored result + answers. */
  cleverreachTags?: (result: ScorecardResult, answers: Answers) => string[];
}

/** Pure: build a slug→registration lookup. Exported for testing. */
export function buildRegistry(
  regs: ScorecardRegistration[],
): (slug: string) => ScorecardRegistration | undefined {
  const bySlug = new Map(regs.map((r) => [r.definition.slug, r]));
  return (slug) => bySlug.get(slug);
}

const lookup = buildRegistry(REGISTRATIONS);

export function getScorecard(slug: string): ScorecardRegistration | undefined {
  return lookup(slug);
}
