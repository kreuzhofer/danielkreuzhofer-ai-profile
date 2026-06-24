import type { ScorecardReport } from "@/lib/scorecard/report-model";
import type { ReportLabels } from "./ScorecardReportView";
import type { TippHebel } from "@/lib/scorecard/content";

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

const EVIDENCE_MARK = { data: "📊", practice: "✅" } as const;

/** Weakest lever first (highlighted); the rest keep their original order. */
function orderHebel(hebel: TippHebel[], weakest?: string): { items: TippHebel[]; highlightFirst: boolean } {
  if (!weakest) return { items: hebel, highlightFirst: false };
  const idx = hebel.findIndex((h) => h.category === weakest);
  if (idx < 0) return { items: hebel, highlightFirst: false };
  return { items: [hebel[idx], ...hebel.filter((_, i) => i !== idx)], highlightFirst: true };
}

function TippsSection({ hebel, weakestCategory }: { hebel: TippHebel[]; weakestCategory?: string }) {
  const { items, highlightFirst } = orderHebel(hebel, weakestCategory);
  return (
    <section className="scd-section scd-tipps">
      <h2 className="scd-h2">Deine Tipps</h2>
      {items.map((h, hi) => {
        const isHighlight = highlightFirst && hi === 0;
        return (
          <div key={h.title} className={`scd-hebel${isHighlight ? " scd-hebel-highlight" : ""}`}>
            {isHighlight && <p className="scd-hebel-flag">Fang hier an: Dein schwächster Hebel</p>}
            <h3 className="scd-hebel-title">{h.title}</h3>
            {h.subtitle && <p className="scd-hebel-sub">{h.subtitle}</p>}
            <ul className="scd-tip-list">
              {h.tipps.map((t, i) => (
                <li key={i} className="scd-tip">
                  <span
                    className="scd-tip-mark"
                    title={t.evidence === "data" ? "datenbelegte Empfehlung" : "Best-Practice-Empfehlung"}
                  >
                    {EVIDENCE_MARK[t.evidence]}
                  </span>
                  <span className="scd-tip-text">
                    <strong>{t.lead}</strong> {t.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

/**
 * The personal report as a light, print-optimized document — the scorecard
 * analogue of the Engpass `ReportDocument`. Same `ScorecardReport` model as the
 * dark inline view; only the theme (sc-report-doc.css) differs. The rich tips
 * block is rendered ONLY here (gated report = opt-in reward), never in the free
 * inline view; the user's weakest lever (`weakestCategory`) is surfaced first.
 */
export function ScorecardReportDoc({
  model,
  labels,
  eyebrow,
  tipps,
  weakestCategory,
}: {
  model: ScorecardReport;
  labels: ReportLabels;
  eyebrow: string;
  tipps?: TippHebel[];
  weakestCategory?: string;
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
          {model.bedeutungLink && (
            <p className="scd-text">
              <a
                className="scd-link"
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

      {tipps && tipps.length > 0 && <TippsSection hebel={tipps} weakestCategory={weakestCategory} />}

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
