/**
 * Generic scorecard content model — the renderer-facing data for a scorecard.
 * Generalized from the Engpass `report-content.ts` structure: per-outcome blocks
 * plus shared blocks. All strings are in the scorecard owner's voice; `{score}`
 * is interpolated at render time.
 */

/** Per-outcome report blocks (one set per band/argmax outcome key). */
export interface OutcomeContent {
  /** Full diagnosis prose; `{score}` is replaced with the normalized score. */
  diagnose: string;
  /** Concrete next steps. */
  schritte: string[];
  /** What to avoid. */
  antiPattern: string;
}

/** Personalisation: one extra paragraph keyed by the answer to a context question. */
export interface PersonalisierungRule {
  questionId: string;
  byAnswer: Record<string, string>;
}

/** A clickable source; shown only when the outcome is in `shownFor` (or always). */
export interface SourceRef {
  id: string;
  text: string;
  url: string;
  /** Outcome keys this source applies to; omitted = always shown. */
  shownFor?: string[];
}

export interface ScorecardContent {
  intro: { heading: string; lead: string; startLabel: string; meta: string };
  resultHeading: string;
  /** Outcome key → display name (e.g. "vorbild" → "Vorbild"). */
  outcomeLabel: Record<string, string>;
  /** Optional score-intro paragraph per outcome (`{score}` interpolated). */
  scoreParagraph?: Record<string, string>;
  byOutcome: Record<string, OutcomeContent>;
  personalisierung?: PersonalisierungRule;
  /** The free "tool" block (e.g. the KI-Challenge-Frage). */
  freeTool?: { label: string; body: string };
  sources: SourceRef[];
  optin: {
    heading: string;
    body: string;
    button: string;
    consent: string;
    datenschutzHref: string;
    successHeading: string;
    successBody: string;
    errorBody: string;
    emailLabel: string;
    emailPlaceholder: string;
  };
  video?: { intro: string; title: string; label: string; url: string };
}
