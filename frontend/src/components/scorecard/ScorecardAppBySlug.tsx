"use client";

import { getScorecard } from "@/lib/scorecard/registry";
import { ScorecardApp } from "./ScorecardApp";

/**
 * Client boundary for the scorecard page. The page is a Server Component and
 * cannot pass a registration (it carries functions: `resolve`, `cleverreachTags`)
 * to the client. So the server passes only the serializable `slug` and this
 * client wrapper resolves the registration from the registry on the client side.
 */
export function ScorecardAppBySlug({ slug }: { slug: string }) {
  const registration = getScorecard(slug);
  if (!registration) return null;
  return <ScorecardApp registration={registration} />;
}
