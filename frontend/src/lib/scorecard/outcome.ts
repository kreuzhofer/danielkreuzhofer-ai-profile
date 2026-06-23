/**
 * Generic outcome resolution — pluggable presets (bands | argmax).
 * Fail-fast on misconfiguration (CLAUDE.md §3): a missing band/mapping throws.
 */

import type { OutcomeConfig } from "./types";

export interface OutcomeContext {
  score: number;
  categoryScores: Record<string, number>;
}

export function resolveOutcome(config: OutcomeConfig, ctx: OutcomeContext): string {
  if (config.type === "bands") {
    const band = config.bands.find((b) => ctx.score >= b.min && ctx.score <= b.max);
    if (!band) throw new Error(`No band matches score ${ctx.score}`);
    return band.key;
  }

  // argmax
  const entries = Object.entries(ctx.categoryScores);
  if (entries.length === 0) throw new Error("argmax outcome needs category scores");
  const winner = entries.reduce((best, cur) =>
    config.pick === "max"
      ? cur[1] > best[1]
        ? cur
        : best
      : cur[1] < best[1]
        ? cur
        : best,
  );
  const key = config.outcomes[winner[0]];
  if (!key) throw new Error(`No outcome mapped for category ${winner[0]}`);
  return key;
}
