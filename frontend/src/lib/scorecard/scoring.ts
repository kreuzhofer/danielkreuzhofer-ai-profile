/**
 * Generic scorecard scoring — pure functions.
 */

import type { AnswerOption, Answers, Question, ScorecardDefinition } from "./types";

function selectedOption(q: Question, answers: Answers): AnswerOption | undefined {
  const optionId = answers[q.id];
  return optionId ? q.options.find((o) => o.id === optionId) : undefined;
}

/** Sum of `points` across score questions (0 for unanswered). Context never counts. */
export function computeRawSum(def: ScorecardDefinition, answers: Answers): number {
  return def.questions
    .filter((q) => q.kind === "score")
    .reduce((sum, q) => sum + (selectedOption(q, answers)?.points ?? 0), 0);
}

/**
 * round(rawSum / maxPoints * 100); 0 when maxPoints <= 0. Not clamped above 100 —
 * `maxPoints` must be the true attainable maximum for the definition.
 */
export function normalizeScore(rawSum: number, maxPoints: number): number {
  if (maxPoints <= 0) return 0;
  return Math.round((rawSum / maxPoints) * 100);
}

/** Sum of `points` per category across score questions that declare one. */
export function computeCategoryScores(
  def: ScorecardDefinition,
  answers: Answers,
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const q of def.questions) {
    if (q.kind !== "score" || !q.category) continue;
    scores[q.category] = (scores[q.category] ?? 0) + (selectedOption(q, answers)?.points ?? 0);
  }
  return scores;
}
