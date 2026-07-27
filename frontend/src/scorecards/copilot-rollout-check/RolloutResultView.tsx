"use client";

/**
 * Custom free result view — the generic report card has no slot for the two
 * spec-mandated blocks that depend on per-dimension scores: die acht
 * Status-Zeilen (gruppiert nach Einführung/Nutzung) and "Dein erster Auftrag"
 * (weakest dimension, kopierbar; adressiert IT oder Entscheider je nach Block).
 * Everything else (Typ, Diagnose, S1-Edge-Absatz) reuses the generic report
 * model; the gated report stays fully generic.
 */

import { buildScorecardReport } from "@/lib/scorecard/report-model";
import type { ScorecardResultViewProps } from "@/lib/scorecard/registry";
import { DIMENSIONEN, STATUS_BY_POINTS, type RolloutDimension } from "./content";

const BLOCK_TITLE: Record<RolloutDimension["block"], string> = {
  einfuehrung: "Einführung",
  nutzung: "Nutzung",
};

function StatusRows({
  dimensionen,
  scores,
}: {
  dimensionen: RolloutDimension[];
  scores: Record<string, number>;
}) {
  return (
    <>
      {dimensionen.map((d) => {
        const status = STATUS_BY_POINTS[scores[d.category] ?? 0];
        return (
          <p key={d.category} className="sc-report-text">
            <span aria-hidden="true">{status.icon}</span> <strong>{d.label}:</strong>{" "}
            {status.word}
          </p>
        );
      })}
    </>
  );
}

export function RolloutResultView({ registration, answers, result }: ScorecardResultViewProps) {
  const model = buildScorecardReport(registration, result, answers);
  const scores = result.categoryScores ?? {};
  const erster = DIMENSIONEN.find((d) => d.category === result.nextLever) ?? DIMENSIONEN[0];
  const alleErledigt = (scores[erster.category] ?? 0) === 3;
  const anDieIt = erster.block === "einfuehrung";

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

      {/* Acht Status-Zeilen, gruppiert nach Einführung / Nutzung */}
      <section className="sc-report-section">
        <h3 className="sc-report-h">Die acht Entscheidungen im Überblick</h3>
        {(["einfuehrung", "nutzung"] as const).map((block) => (
          <div key={block}>
            <p className="sc-report-text">
              <strong>{BLOCK_TITLE[block]}</strong>
            </p>
            <StatusRows
              dimensionen={DIMENSIONEN.filter((d) => d.block === block)}
              scores={scores}
            />
          </div>
        ))}
      </section>

      {/* Schwächste Dimension als ausformulierter, kopierbarer Auftrag */}
      <section className="sc-report-section">
        <h3 className="sc-report-h">
          {anDieIt ? "Dein erster Auftrag an die IT" : "Dein erster Auftrag, und der ist Chefsache"}
        </h3>
        <p className="sc-report-text">
          {alleErledigt
            ? "Bei euch ist keine der acht Entscheidungen offen. Lass sie Dir schriftlich bestätigen, fang mit dieser an:"
            : anDieIt
              ? `Deine schwächste Dimension: ${erster.label}. Kopier den Auftrag und schick ihn an Deine IT:`
              : `Deine schwächste Dimension: ${erster.label}. Diesen Auftrag kannst Du nicht delegieren:`}
        </p>
        <blockquote className="sc-report-quote">{erster.auftrag}</blockquote>
      </section>
    </article>
  );
}
