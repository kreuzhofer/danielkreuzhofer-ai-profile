/**
 * Scorecard registry — maps a slug to everything the funnel backend needs
 * beyond the engine definition (email subjects, CleverReach source). Scorecards
 * are registered as code in `src/scorecards`; new ones ship via git (no DB/admin).
 */

import { REGISTRATIONS } from "@/scorecards";
import type { ScorecardDefinition } from "./types";

export interface ScorecardRegistration {
  definition: ScorecardDefinition;
  /** Transactional email subjects (German). */
  doiSubject: string;
  deliverySubject: string;
  /** CleverReach `source` + base tag; defaults to the slug. */
  cleverreachSource?: string;
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
