/**
 * Scorecard registry — maps a slug to everything the funnel backend needs
 * beyond the engine definition (email subjects, CleverReach source). Scorecards
 * are registered as code in `src/scorecards`; new ones ship via git (no DB/admin).
 */

import { REGISTRATIONS } from "@/scorecards";
import type { ScorecardDefinition } from "./types";
import type { ScorecardContent } from "./content";
import type { BrandTokens } from "./branding";

export interface ScorecardRegistration {
  definition: ScorecardDefinition;
  /** Transactional email subjects (German). */
  doiSubject: string;
  deliverySubject: string;
  /** CleverReach `source` + base tag; defaults to the slug. */
  cleverreachSource?: string;
  /** Booking link for the qualified-lead CTA in the delivery email (Variante B). */
  bookingUrl?: string;
  /** Page <head> metadata. */
  meta: { title: string; description: string };
  /** Renderer content + theme (M3). */
  content: ScorecardContent;
  branding: BrandTokens;
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
