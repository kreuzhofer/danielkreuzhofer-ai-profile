import type { ScorecardReport } from "@/lib/scorecard/report-model";
import type { ReportLabels } from "./ScorecardReportView";

/** Split a `\n\n`-separated block into <p> elements. */
function Paras({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((p, i) => (
        <p key={i} className="scd-text">
          {p}
        </p>
      ))}
    </>
  );
}

/**
 * The personal report as a light, print-optimized document — the scorecard
 * analogue of the Engpass `ReportDocument`. Same `ScorecardReport` model as the
 * dark inline view; only the theme (sc-report-doc.css) differs. Renders the core
 * report (no numeric score — that display was dropped product-wide).
 */
export function ScorecardReportDoc({
  model,
  labels,
  eyebrow,
}: {
  model: ScorecardReport;
  labels: ReportLabels;
  eyebrow: string;
}) {
  return (
    <div className="scd-container">
      <p className="scd-eyebrow">{eyebrow}</p>
      <div className="scd-outcome">
        <h1 className="scd-outcome-name">{model.outcomeLabel}</h1>
      </div>
      <Paras text={model.diagnose} />

      {model.bedeutung.length > 0 && (
        <section className="scd-section">
          <h3 className="scd-h3">{labels.bedeutung}</h3>
          {model.bedeutung.map((p, i) => (
            <p key={i} className="scd-text">
              {p}
            </p>
          ))}
        </section>
      )}

      <section className="scd-section">
        <h3 className="scd-h3">{labels.schritte}</h3>
        <ol className="scd-steps">
          {model.schritte.map((s, i) => (
            <li key={i} className="scd-step">
              <span className="scd-step-num">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="scd-section">
        <h3 className="scd-h3">{labels.antiPattern}</h3>
        <Paras text={model.antiPattern} />
      </section>

      {model.freeTool && (
        <section className="scd-section">
          <h3 className="scd-h3">{model.freeTool.label}</h3>
          <blockquote className="scd-quote">{model.freeTool.body}</blockquote>
        </section>
      )}

      <section className="scd-section">
        <h3 className="scd-h3">{labels.quellen}</h3>
        <ul className="scd-source-list">
          {model.sources.map((s) => (
            <li key={s.id} className="scd-source">
              {s.text}{" "}
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                Beleg ansehen ↗
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
