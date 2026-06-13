/**
 * Engpass-Check — pure scoring engine.
 *
 * No LLM, no I/O, no randomness — a deterministic rule-strecke that runs
 * client-side. See `06-quiz-spec.md` §Scoring / §Engpass-Typ / §Weg-Tendenz /
 * §Qualifikations-Logik. Every function here is referentially transparent so it
 * can be property-tested and reused by the API route.
 */

import { QUESTIONS_BY_ID } from "./questions";
import { BAND_COPY, TYP_COPY, WEG_COPY } from "./copy";
import type { Answers, AnswerOption, Band, Dimension, EngpassResult, QuestionId, Weg } from "./types";

const SCORE_QUESTIONS: QuestionId[] = ["S1", "S2", "S3", "S4", "S5", "S6"];

/** Tie-break priority, highest first (06-quiz-spec.md §Engpass-Typ). */
const DIMENSION_PRIORITY: Dimension[] = [
  "mess-blindflug",
  "wissens-monopol",
  "uebergabe-stau",
  "schnittstellen-luecke",
];

// S1 caps at 2 (Kalibrierung 2026-06-13), so the max sum of S1–S6 is 17, not 18.
const MAX_SCORE_SUM = 17;

/** Resolve the selected option for a question, or undefined if unanswered. */
function selectedOption(questionId: QuestionId, answers: Answers): AnswerOption | undefined {
  const optionId = answers[questionId];
  if (!optionId) return undefined;
  return QUESTIONS_BY_ID[questionId]?.options.find((o) => o.id === optionId);
}

/** Score points for a single score question (0 if unanswered). */
function points(questionId: QuestionId, answers: Answers): number {
  return selectedOption(questionId, answers)?.points ?? 0;
}

/** Sum of S1–S6 points (0–17, S1 caps at 2). Context answers never contribute. */
export function computeScoreSum(answers: Answers): number {
  return SCORE_QUESTIONS.reduce((sum, id) => sum + points(id, answers), 0);
}

/** Normalized engpass score: round(scoreSum / 17 × 100), clamped to 0–100. */
export function normalizeScore(scoreSum: number): number {
  return Math.round((scoreSum / MAX_SCORE_SUM) * 100);
}

export function computeBand(score: number): Band {
  if (score <= 30) return "feintuning";
  if (score <= 60) return "spuerbar";
  return "akut";
}

/**
 * Per-dimension values from S2–S5, plus the S1 "weiß nicht" bonus on
 * Mess-Blindflug (06-quiz-spec.md S1). Used only to pick the engpass-typ —
 * deliberately separate from the raw score sum.
 */
export function computeDimensions(answers: Answers): Record<Dimension, number> {
  const s1Bonus = selectedOption("S1", answers)?.messBlindflugBonus ?? 0;
  return {
    "uebergabe-stau": points("S2", answers),
    "schnittstellen-luecke": points("S3", answers),
    "wissens-monopol": points("S4", answers),
    "mess-blindflug": points("S5", answers) + s1Bonus,
  };
}

/**
 * Dominant dimension. Walks the priority order and only replaces on a strictly
 * greater value, so ties resolve to the higher-priority dimension. With all
 * dimensions at zero, defaults to mess-blindflug (the highest priority).
 */
export function computeTyp(dimensions: Record<Dimension, number>): Dimension {
  let best = DIMENSION_PRIORITY[0];
  for (const dim of DIMENSION_PRIORITY) {
    if (dimensions[dim] > dimensions[best]) best = dim;
  }
  return best;
}

/**
 * Weg-Tendenz via the ordered rule tree (06-quiz-spec.md §Weg-Tendenz).
 *
 * Rules 1–2 are fully determinable from the answers. Rules 3–5 — which the
 * spec says the check can only express as a *Tendenz* — are mapped to the
 * signals we actually have: a handoff/interface-dominant typ → Weg A; otherwise
 * IT-feasibility (K4 "baut regelmäßig") flags Weg C as denkbar, else Weg B as
 * the "gelöstes Standard-Problem" default.
 */
export function computeWeg(answers: Answers, typ: Dimension): Weg {
  if (points("S5", answers) >= 2) return "stufe-0";
  if (points("S4", answers) >= 2) return "beschreiben";
  if (typ === "uebergabe-stau" || typ === "schnittstellen-luecke") return "weg-a";
  if (selectedOption("K4", answers)?.cFaehig) return "weg-c-denkbar";
  return "weg-b";
}

/**
 * Setting-Stufe qualification (06-quiz-spec.md §Qualifikations-Logik).
 * Invisible to the lead; drives delivery-email Variante B + the qualified segment.
 */
export function isQualified(answers: Answers): boolean {
  return (
    (selectedOption("K1", answers)?.qualifies ?? false) &&
    (selectedOption("K2", answers)?.qualifies ?? false) &&
    (selectedOption("K3", answers)?.qualifies ?? false) &&
    (selectedOption("K5", answers)?.qualifies ?? false)
  );
}

/** Aggregate the full result from a complete set of answers. */
export function computeResult(answers: Answers): EngpassResult {
  const scoreSum = computeScoreSum(answers);
  const score = normalizeScore(scoreSum);
  const dimensions = computeDimensions(answers);
  const typ = computeTyp(dimensions);
  return {
    scoreSum,
    score,
    band: computeBand(score),
    dimensions,
    typ,
    weg: computeWeg(answers, typ),
    qualified: isQualified(answers),
  };
}

/** Human-readable label of the selected context answer (for CRM attributes). */
function answerLabel(questionId: QuestionId, answers: Answers): string {
  return selectedOption(questionId, answers)?.label ?? "";
}

/**
 * CleverReach attribute payload (06-quiz-spec.md §Qualifikations-Logik).
 * Values are human-readable so the delivery mail and CRM stay legible.
 */
export function buildCleverReachAttributes(
  answers: Answers,
  result: EngpassResult,
): Record<string, string> {
  return {
    ec_rolle: answerLabel("K1", answers),
    ec_groesse: answerLabel("K2", answers),
    ec_mandat: answerLabel("K3", answers),
    ec_zeit: answerLabel("K5", answers),
    ec_score: String(result.score),
    ec_typ: TYP_COPY[result.typ].name,
    ec_weg: WEG_COPY[result.weg].label,
    ec_qualified: String(result.qualified),
    // also expose the band for segmentation, harmless if unused in CleverReach
    ec_band: BAND_COPY[result.band].name,
  };
}
