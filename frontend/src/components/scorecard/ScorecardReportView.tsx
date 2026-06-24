import type { ScorecardReport } from "@/lib/scorecard/report-model";

export interface ReportLabels {
  bedeutung: string;
  schritte: string;
  antiPattern: string;
  quellen: string;
}

/** Default German section headings (scorecard-agnostic UI chrome). */
export const DEFAULT_REPORT_LABELS: ReportLabels = {
  bedeutung: "Was das für Dich bedeutet",
  schritte: "Deine nächsten Schritte",
  antiPattern: "Was Du jetzt vermeiden solltest",
  quellen: "Quellen & Belege",
};

/** Split a `\n\n`-separated block into <p> elements. */
function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split("\n\n").map((p, i) => (
        <p key={i} className={className}>
          {p}
        </p>
      ))}
    </>
  );
}

/**
 * Generic scorecard report renderer — the free, fully-visible result (analogue
 * of the Engpass `Report.tsx`). Driven entirely by a `ScorecardReport` model;
 * section headings come from the caller's `labels` (kept content-agnostic).
 */
export function ScorecardReportView({
  model,
  labels,
}: {
  model: ScorecardReport;
  labels: ReportLabels;
}) {
  return (
    <article className="sc-report">
      {model.scoreParagraph && <Paragraphs text={model.scoreParagraph} className="sc-report-text" />}

      {/* Outcome + diagnosis — the lead block (no top border) */}
      <h2 className="sc-outcome-name">{model.outcomeLabel}</h2>
      <Paragraphs text={model.diagnose} className="sc-report-text" />

      {/* Personalisation (only when a rule matched) */}
      {model.bedeutung.length > 0 && (
        <section className="sc-report-section">
          <h3 className="sc-report-h">{labels.bedeutung}</h3>
          {model.bedeutung.map((p, i) => (
            <p key={i} className="sc-report-text">
              {p}
            </p>
          ))}
          {model.bedeutungLink && (
            <p className="sc-report-text">
              <a
                className="sc-video-link"
                href={model.bedeutungLink.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                → {model.bedeutungLink.label}
              </a>
            </p>
          )}
        </section>
      )}

      {/* Next steps */}
      <section className="sc-report-section">
        <h3 className="sc-report-h">{labels.schritte}</h3>
        <ol className="sc-report-steps">
          {model.schritte.map((s, i) => (
            <li key={i} className="sc-report-step">
              <span className="sc-report-step-num">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Anti-pattern */}
      <section className="sc-report-section">
        <h3 className="sc-report-h">{labels.antiPattern}</h3>
        <Paragraphs text={model.antiPattern} className="sc-report-text" />
      </section>

      {/* Free tool (when present) — rendered as a signature quote block */}
      {model.freeTool && (
        <section className="sc-report-section">
          <h3 className="sc-report-h">{model.freeTool.label}</h3>
          <blockquote className="sc-report-quote">{model.freeTool.body}</blockquote>
        </section>
      )}

      {/* Sources */}
      <section className="sc-report-section sc-sources">
        <h3 className="sc-report-h">{labels.quellen}</h3>
        <ul className="sc-source-list">
          {model.sources.map((s) => (
            <li key={s.id} className="sc-source">
              <span className="sc-source-text">{s.text}</span>{" "}
              <a className="sc-source-link" href={s.url} target="_blank" rel="noopener noreferrer">
                Beleg ansehen ↗
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
