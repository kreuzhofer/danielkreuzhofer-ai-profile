/**
 * Generic scorecard report model — pure selection over a registration + result.
 * Analogue of the Engpass `buildReportModel`, but driven entirely by content data.
 */

import type { ScorecardRegistration } from "./registry";
import type { SourceRef } from "./content";
import type { Answers, ScorecardResult } from "./types";

export interface ScorecardReport {
  score: number;
  outcome: string;
  outcomeLabel: string;
  scoreParagraph?: string;
  diagnose: string;
  bedeutung: string[];
  /** Optional clickable resource tied to the personalisation answer. */
  bedeutungLink?: { label: string; url: string };
  schritte: string[];
  antiPattern: string;
  freeTool?: { label: string; body: string };
  sources: SourceRef[];
}

export function buildScorecardReport(
  reg: ScorecardRegistration,
  result: ScorecardResult,
  answers: Answers,
): ScorecardReport {
  const c = reg.content;
  const outcome = result.outcome;
  const fill = (s: string) => s.replace(/\{score\}/g, String(result.score));

  const block = c.byOutcome[outcome];
  if (!block) throw new Error(`No content for outcome "${outcome}"`);

  const bedeutung: string[] = [];
  let bedeutungLink: { label: string; url: string } | undefined;
  if (c.personalisierung) {
    const answer = answers[c.personalisierung.questionId];
    const para = answer ? c.personalisierung.byAnswer[answer] : undefined;
    if (para) bedeutung.push(para);
    if (answer) bedeutungLink = c.personalisierung.linkByAnswer?.[answer];
  }

  const sources = c.sources.filter((s) => !s.shownFor || s.shownFor.includes(outcome));

  return {
    score: result.score,
    outcome,
    outcomeLabel: c.outcomeLabel[outcome] ?? outcome,
    scoreParagraph: c.scoreParagraph?.[outcome] ? fill(c.scoreParagraph[outcome]) : undefined,
    diagnose: fill(block.diagnose),
    bedeutung,
    bedeutungLink,
    schritte: block.schritte,
    antiPattern: block.antiPattern,
    freeTool: c.freeTool,
    sources,
  };
}
