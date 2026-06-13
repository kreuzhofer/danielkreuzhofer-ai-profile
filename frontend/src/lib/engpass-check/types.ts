/**
 * Engpass-Check — domain types
 *
 * Tool-agnostic scorecard for the "Engpass-Check" lead magnet.
 * Source of truth for the build: vault `funnels/engpass-check/06-quiz-spec.md`.
 *
 * The whole scoring strategy is a pure rule-strecke (no LLM at runtime) — the
 * check is itself a Weg-A example.
 */

/** Context questions (Block 1 + Block 3): qualification data, no score points. */
export type ContextQuestionId = "K1" | "K2" | "K3" | "K4" | "K5";

/** Diagnosis questions (Block 2): each worth 0–3 score points. */
export type ScoreQuestionId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6";

export type QuestionId = ContextQuestionId | ScoreQuestionId;

/**
 * The four engpass dimensions, ordered by tie-break priority (highest first).
 * Begründung (06-quiz-spec.md): ohne Messung ist kein anderer Fix beweisbar.
 */
export type Dimension =
  | "mess-blindflug"
  | "wissens-monopol"
  | "uebergabe-stau"
  | "schnittstellen-luecke";

/** Score bands derived from the normalized 0–100 engpass score. */
export type Band = "feintuning" | "spuerbar" | "akut";

/** Weg-Tendenz outcomes from the ordered rule tree. */
export type Weg = "stufe-0" | "beschreiben" | "weg-a" | "weg-b" | "weg-c-denkbar";

export interface AnswerOption {
  /**
   * Stable id — used as the stored answer value, the radio value, and the
   * CleverReach attribute value for context questions. Never reorder/rename
   * without updating any persisted leads.
   */
  id: string;
  label: string;
  /** Score points 0–3 (score questions only). */
  points?: number;
  /** Extra points added to the Mess-Blindflug dimension (S1 "weiß nicht" → +1). */
  messBlindflugBonus?: number;
  /** Marks the option as qualifying for the Setting-Stufe (context questions). */
  qualifies?: boolean;
  /** IT baut regelmäßig eigene Software → Weg C feasible (K4 only). */
  cFaehig?: boolean;
}

export interface Question {
  id: QuestionId;
  block: 1 | 2 | 3;
  kind: "context" | "score";
  /** Dimension this score question feeds (S2–S5 only). */
  dimension?: Dimension;
  /** CleverReach attribute the raw answer maps to (context questions). */
  attribute?: "ec_rolle" | "ec_groesse" | "ec_mandat" | "ec_zeit";
  /** Question text shown to the lead. */
  prompt: string;
  options: AnswerOption[];
}

/** Map of questionId → selected option id. */
export type Answers = Partial<Record<QuestionId, string>>;

export interface EngpassResult {
  /** Raw sum of S1–S6 points (0–17, S1 caps at 2). */
  scoreSum: number;
  /** Normalized engpass score round(scoreSum / 17 × 100), 0–100. */
  score: number;
  band: Band;
  /** Per-dimension values used to pick the engpass-typ. */
  dimensions: Record<Dimension, number>;
  /** Dominant dimension (tie-break: mess-blindflug > wissens-monopol > uebergabe-stau > schnittstellen-luecke). */
  typ: Dimension;
  weg: Weg;
  /** Setting-Stufe qualification (invisible to the lead). */
  qualified: boolean;
}
