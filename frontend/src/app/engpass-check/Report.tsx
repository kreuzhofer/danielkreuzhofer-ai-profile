import { REPORT_LABELS } from "@/lib/engpass-check/report-content";
import type { ReportModel } from "@/lib/engpass-check/report";

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
 * Der ausführliche Engpass-Report — Render-Reihenfolge Punkt 1–8 aus
 * 06-quiz-spec.md. Inhalte kommen verbatim aus dem Content-Baukasten; pro
 * Ergebnis werden nur die zutreffenden Bausteine ins Modell gewählt.
 * Punkte 9 (Opt-in) und 10 (Video) rendert der umschließende Result-Screen.
 */
export function Report({ model }: { model: ReportModel }) {
  // Punkt 1: Score-Block — der „{score} von 100 — Band."-Aufmacher steht schon
  // groß als Zahl + Chip, daher rendern wir nur den Prosa-Rumpf des Absatzes.
  const [, ...scoreBody] = model.scoreParagraph.split("\n\n");

  return (
    <article className="ec-report">
      {/* 1 — Score-Block */}
      <div className={`ec-score ec-band-${model.band}`}>
        <div className="ec-score-number">
          <span className="ec-score-value">{model.score}</span>
          <span className="ec-score-max">/ 100</span>
        </div>
        <p className="ec-score-band">{model.bandName}</p>
      </div>
      <div className="ec-meter" aria-hidden="true">
        <span className="ec-meter-fill" style={{ width: `${model.score}%` }} />
      </div>
      <Paragraphs text={scoreBody.join("\n\n")} className="ec-report-text" />
      <p className="ec-kontext">{model.kontextZeile}</p>

      {/* 2 — Engpass-Typ + Voll-Diagnose */}
      <section className="ec-report-section">
        <h2 className="ec-typ-name">
          {model.noDominantTyp
            ? REPORT_LABELS.noTyp
            : `${REPORT_LABELS.typPrefix} ${model.typName}`}
        </h2>
        <Paragraphs text={model.typDiagnose} className="ec-report-text" />
      </section>

      {/* 2b — Zur Einordnung (Disclaimer, immer sichtbar wenn zutreffend) */}
      {model.einordnung.length > 0 && (
        <section className="ec-report-section">
          <h3 className="ec-report-h">{REPORT_LABELS.einordnung}</h3>
          {model.einordnung.map((p, i) => (
            <p key={i} className="ec-report-text">
              {p}
            </p>
          ))}
        </section>
      )}

      {/* 3 — Was das konkret für Dich bedeutet (nur wenn eine Regel greift) */}
      {model.bedeutung.length > 0 && (
        <section className="ec-report-section">
          <h3 className="ec-report-h">{REPORT_LABELS.bedeutung}</h3>
          {model.bedeutung.map((p, i) => (
            <p key={i} className="ec-report-text">
              {p}
            </p>
          ))}
        </section>
      )}

      {/* 4 — Deine drei nächsten Schritte */}
      <section className="ec-report-section">
        <h3 className="ec-report-h">{REPORT_LABELS.schritte}</h3>
        <ol className="ec-report-steps">
          {model.schritte.map((schritt, i) => (
            <li key={i} className="ec-report-step">
              <span className="ec-report-step-num">{i + 1}</span>
              <span>{schritt}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 5 — Dein wahrscheinlicher Weg */}
      <section className="ec-report-section">
        <h3 className="ec-report-h">{REPORT_LABELS.weg}</h3>
        <Paragraphs text={model.wegVolltext} className="ec-report-text" />
      </section>

      {/* 6 — Der Satz für Deine Geschäftsführung */}
      <section className="ec-report-section">
        <h3 className="ec-report-h">{REPORT_LABELS.gf}</h3>
        <blockquote className="ec-report-quote">{model.gfSatz}</blockquote>
      </section>

      {/* 7 — Was Du jetzt vermeiden solltest */}
      <section className="ec-report-section">
        <h3 className="ec-report-h">{REPORT_LABELS.antiPattern}</h3>
        <Paragraphs text={model.antiPattern} className="ec-report-text" />
      </section>

      {/* 8 — Quellen & Belege (nur die im Ergebnis vorgekommenen) */}
      <section className="ec-report-section ec-sources">
        <h3 className="ec-report-h">{REPORT_LABELS.quellen}</h3>
        <ul className="ec-source-list">
          {model.sources.map((source) => (
            <li key={source.id} className="ec-source">
              <span className="ec-source-text">{source.text}</span>{" "}
              <a className="ec-source-link" href={source.url} target="_blank" rel="noopener noreferrer">
                Beleg ansehen ↗
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
