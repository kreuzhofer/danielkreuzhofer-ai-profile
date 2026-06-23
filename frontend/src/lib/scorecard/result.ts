/**
 * Generic scorecard result — orchestrates the pure engine pieces into the
 * ScorecardResult that gets denormalized into `result jsonb` (M2).
 */

import type { Answers, ScorecardDefinition, ScorecardResult } from "./types";
import { computeCategoryScores, computeRawSum, normalizeScore } from "./scoring";
import { resolveOutcome } from "./outcome";
import { computeNextLever } from "./next-lever";
import { isQualified } from "./qualification";

export function buildResult(def: ScorecardDefinition, answers: Answers): ScorecardResult {
  const rawSum = computeRawSum(def, answers);
  const score = normalizeScore(rawSum, def.scoring.maxPoints);
  const categoryScores = computeCategoryScores(def, answers);
  const hasCategories = Object.keys(categoryScores).length > 0;
  const outcome = resolveOutcome(def.outcome, { score, categoryScores });
  const nextLever =
    def.nextLever && hasCategories ? computeNextLever(def.nextLever, categoryScores) : undefined;

  return {
    rawSum,
    score,
    outcome,
    categoryScores: hasCategories ? categoryScores : undefined,
    nextLever,
    qualified: isQualified(def, answers),
  };
}
