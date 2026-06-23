import type { ScorecardRegistration } from "@/lib/scorecard/registry";
import { kiFuehrungsCheck } from "./ki-fuehrungs-check";

/** Registered scorecards — each becomes a route at /<slug>. */
export const REGISTRATIONS: ScorecardRegistration[] = [kiFuehrungsCheck];
