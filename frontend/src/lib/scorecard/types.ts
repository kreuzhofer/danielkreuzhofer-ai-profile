/**
 * Generic scorecard engine — domain types.
 *
 * The engine is a pure rule-strecke: a ScorecardDefinition (config) + Answers
 * produce a ScorecardResult. No IO, no LLM, no randomness. Content/branding/meta
 * are renderer concerns and live with each scorecard, not in this contract.
 */

export interface AnswerOption {
  /** Stable id — the stored answer value. Never reorder/rename without a migration. */
  id: string;
  label: string;
  /** Score points (score questions only). */
  points?: number;
  /** Category/dimension this answer feeds (score questions only). */
  category?: string;
  /** Context questions: this answer counts toward qualification. */
  qualifies?: boolean;
  /** Context questions: the CRM attribute value this answer maps to (M2). */
  attributeValue?: string;
}

export interface Question {
  id: string;
  kind: "context" | "score";
  prompt: string;
  /** Score question → the category it feeds (defaults to a per-question dimension). */
  category?: string;
  /** Context question → the CRM attribute key, e.g. "kfc_rolle" (used in M2). */
  attributeKey?: string;
  options: AnswerOption[];
}

export type Answers = Record<string, string>; // questionId → optionId

export interface Band {
  key: string;
  min: number; // inclusive, on the normalized 0..100 score
  max: number; // inclusive
}

export type OutcomeConfig =
  | { type: "bands"; bands: Band[] }
  | {
      type: "argmax";
      over: "category";
      pick: "max" | "min";
      /** category key → outcome key */
      outcomes: Record<string, string>;
    };
// Future (same seam, not in v1): | { type: "rules"; rules: ... }

export interface NextLeverConfig {
  over: "category";
  pick: "min" | "max";
}

export interface QualificationConfig {
  /** Question ids whose selected option must be `qualifies: true` (AND). */
  requireQualifies: string[];
}

export interface ScorecardDefinition {
  slug: string;
  questions: Question[];
  scoring: {
    /** Max attainable raw points across score questions (for normalization). */
    maxPoints: number;
    /** Affects copy only, not math. */
    direction: "higher-better" | "higher-worse";
  };
  outcome: OutcomeConfig;
  nextLever?: NextLeverConfig;
  qualification: QualificationConfig;
  /** CRM attribute prefix, e.g. "kfc_" (used in M2). */
  attributePrefix: string;
}

export interface ScorecardResult {
  rawSum: number;
  /** Normalized 0..100. */
  score: number;
  /** Outcome key (a band key or an argmax outcome). */
  outcome: string;
  /** Per-category sums (omitted when the scorecard has no categories). */
  categoryScores?: Record<string, number>;
  /** Category key picked by nextLever (omitted when not configured). */
  nextLever?: string;
  qualified: boolean;
}
