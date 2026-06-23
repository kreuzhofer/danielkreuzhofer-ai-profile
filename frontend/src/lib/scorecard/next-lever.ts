/**
 * Generic "next lever" — the weakest (or strongest) category, used to point the
 * lead at their most impactful next step. Ties resolve to the first category.
 */

import type { NextLeverConfig } from "./types";

export function computeNextLever(
  config: NextLeverConfig,
  categoryScores: Record<string, number>,
): string | undefined {
  const entries = Object.entries(categoryScores);
  if (entries.length === 0) return undefined;
  const winner = entries.reduce((best, cur) =>
    config.pick === "min"
      ? cur[1] < best[1]
        ? cur
        : best
      : cur[1] > best[1]
        ? cur
        : best,
  );
  return winner[0];
}
