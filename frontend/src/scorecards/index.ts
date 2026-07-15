import type { ScorecardRegistration } from "@/lib/scorecard/registry";
import { kiFuehrungsCheck } from "./ki-fuehrungs-check";
import { dsgvoCheck } from "./dsgvo-check";
import { copilotRolloutCheck } from "./copilot-rollout-check";

/** Registered scorecards — each becomes a route at /<slug>. */
export const REGISTRATIONS: ScorecardRegistration[] = [
  kiFuehrungsCheck,
  dsgvoCheck,
  copilotRolloutCheck,
];
