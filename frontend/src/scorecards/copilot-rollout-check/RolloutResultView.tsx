"use client";

/**
 * Custom free result view — the generic report card has no slot for the two
 * spec-mandated blocks that depend on per-dimension scores: the vier
 * Status-Zeilen and "Dein erster Auftrag an die IT" (weakest dimension,
 * kopierbar). Everything else (score, Typ, Diagnose, S1-Edge-Absatz) reuses the
 * generic report model; the gated report stays fully generic.
 */

import { buildScorecardReport } from "@/lib/scorecard/report-model";
import type { ScorecardResultViewProps } from "@/lib/scorecard/registry";
import { DIMENSIONEN, STATUS_BY_POINTS } from "./content";

export function RolloutResultView({ registration, answers, result }: ScorecardResultViewProps) {
  const model = buildScorecardReport(registration, result, answers);
  const scores = result.categoryScores ?? {};
  const erster = DIMENSIONEN.find((d) => d.category === result.nextLever) ?? DIMENSIONEN[0];
  const alleErledigt = (scores[erster.category] ?? 0) === 3;

  return (
    <article className="sc-report">
      <h2 className="sc-outcome-name">{model.outcomeLabel}</h2>
      {model.diagnose.split("\n\n").map((p, i) => (
        <p key={i} className="sc-report-text">
          {p}
        </p>
      ))}

      {/* S1-Edge: Auto-Enable-Fakt, unabhängig vom Gesamtscore */}
      {model.bedeutung.map((p, i) => (
        <p key={i} className="sc-report-text">
          <strong>{p}</strong>
        </p>
      ))}

      {/* Vier Status-Zeilen, je Rollout-Entscheidung */}
      <section className="sc-report-section">
        <h3 className="sc-report-h">Die vier Entscheidungen im Überblick</h3>
        {DIMENSIONEN.map((d) => {
          const status = STATUS_BY_POINTS[scores[d.category] ?? 0];
          return (
            <p key={d.category} className="sc-report-text">
              <span aria-hidden="true">{status.icon}</span> <strong>{d.label}:</strong>{" "}
              {status.word}
            </p>
          );
        })}
      </section>

      {/* Schwächste Dimension als ausformulierter, kopierbarer Auftrag */}
      <section className="sc-report-section">
        <h3 className="sc-report-h">Dein erster Auftrag an die IT</h3>
        <p className="sc-report-text">
          {alleErledigt
            ? "Bei euch ist keine der vier Entscheidungen offen. Lass sie Dir von der IT schriftlich bestätigen, fang mit dieser an:"
            : `Deine schwächste Dimension: ${erster.label}. Kopier den Auftrag und schick ihn an Deine IT:`}
        </p>
        <blockquote className="sc-report-quote">{erster.auftrag}</blockquote>
      </section>
    </article>
  );
}
