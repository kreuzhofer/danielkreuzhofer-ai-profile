import { REPORT_LABELS } from "@/lib/engpass-check/report-content";
import {
  BUSINESS_CASE,
  CASES,
  ENGPASS_RASTER,
  PLAN_90,
  TOOLKIT_LABELS,
  WEGE_BAUM,
  highlightedWeg,
} from "@/lib/engpass-check/toolkit-content";
import type { ReportModel } from "@/lib/engpass-check/report";

function Paras({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((p, i) => (
        <p key={i} className="er-text">
          {p}
        </p>
      ))}
    </>
  );
}

const PFAD_OF: Record<ReturnType<typeof highlightedWeg>, "A" | "B" | "C"> = {
  "Stufe 0": "A",
  "Weg A": "A",
  "Weg B": "B",
  "Weg C": "C",
};

/** Full printable document: report points 1–8 + the implementation toolkit. */
export function ReportDocument({ model }: { model: ReportModel }) {
  const [, ...scoreBody] = model.scoreParagraph.split("\n\n");
  const mineWeg = highlightedWeg(model.weg);
  const myPfad = PFAD_OF[mineWeg];
  const orderedCases = [...CASES].sort(
    (a, b) => (a.pfad === myPfad ? 0 : 1) - (b.pfad === myPfad ? 0 : 1),
  );

  return (
    <div className="er-container">
      {/* 1 — Score */}
      <p className="er-eyebrow">Dein Ergebnis</p>
      <div className={`er-score er-band-${model.band}`}>
        <span className="er-score-value">{model.score}</span>
        <span className="er-score-max">/ 100</span>
        <span className="er-score-band">{model.bandName}</span>
      </div>
      <Paras text={scoreBody.join("\n\n")} />
      <p className="er-kontext">{model.kontextZeile}</p>

      {/* 2 — Engpass-Typ */}
      <section className="er-section">
        <h2 className="er-h2">
          {REPORT_LABELS.typPrefix} {model.typName}
        </h2>
        <Paras text={model.typDiagnose} />
      </section>

      {/* 3 — Was das bedeutet */}
      {model.bedeutung.length > 0 && (
        <section className="er-section">
          <h3 className="er-h3">{REPORT_LABELS.bedeutung}</h3>
          {model.bedeutung.map((p, i) => (
            <p key={i} className="er-text">
              {p}
            </p>
          ))}
        </section>
      )}

      {/* 4 — Schritte */}
      <section className="er-section">
        <h3 className="er-h3">{REPORT_LABELS.schritte}</h3>
        <ol className="er-steps">
          {model.schritte.map((s, i) => (
            <li key={i} className="er-step">
              <span className="er-step-num">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 5 — Weg */}
      <section className="er-section">
        <h3 className="er-h3">{REPORT_LABELS.weg}</h3>
        <Paras text={model.wegVolltext} />
      </section>

      {/* 6 — GF-Satz */}
      <section className="er-section">
        <h3 className="er-h3">{REPORT_LABELS.gf}</h3>
        <blockquote className="er-quote">{model.gfSatz}</blockquote>
      </section>

      {/* 7 — Anti-Pattern */}
      <section className="er-section">
        <h3 className="er-h3">{REPORT_LABELS.antiPattern}</h3>
        <Paras text={model.antiPattern} />
      </section>

      {/* 8 — Quellen */}
      <section className="er-section">
        <h3 className="er-h3">{REPORT_LABELS.quellen}</h3>
        <ul className="er-source-list">
          {model.sources.map((s) => (
            <li key={s.id} className="er-source">
              {s.text} —{" "}
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                Beleg ansehen ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── TOOLKIT ───────── */}
      <div className="er-toolkit-badge">
        <p className="er-eyebrow">{TOOLKIT_LABELS.badge}</p>
      </div>

      {/* Engpass-Raster */}
      <section className="er-section">
        <h2 className="er-h2">{TOOLKIT_LABELS.raster}</h2>
        <p className="er-text">{ENGPASS_RASTER.intro}</p>
        {ENGPASS_RASTER.steps.map((step, i) => (
          <div key={i} className="er-raster-step">
            <h3 className="er-h3">{step.title}</h3>
            <p className="er-text">{step.intro}</p>
            <ul className="er-raster-fields">
              {step.fields.map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Wege-Entscheidungsbaum */}
      <section className="er-section">
        <h2 className="er-h2">{TOOLKIT_LABELS.baum}</h2>
        <p className="er-text">{WEGE_BAUM.intro}</p>
        {WEGE_BAUM.nodes.map((node) => {
          const isMine = node.pfad === mineWeg;
          return (
            <div key={node.key} className={`er-weg-node${isMine ? " is-mine" : ""}`}>
              <span className="er-weg-pfad">{node.pfad}</span>
              {isMine && <span className="er-weg-tag">← Deine Tendenz</span>}
              <p className="er-weg-title">{node.title}</p>
              <p className="er-weg-wenn">Wenn: {node.wenn}</p>
              <p className="er-text">{node.text}</p>
            </div>
          );
        })}
        <p className="er-it-check">{WEGE_BAUM.itCheck}</p>
      </section>

      {/* 6 Cases */}
      <section className="er-section">
        <h2 className="er-h2">{TOOLKIT_LABELS.cases}</h2>
        {orderedCases.map((c) => (
          <div key={c.company} className="er-case">
            <div className="er-case-head">
              <span className="er-case-pfad">Pfad {c.pfad}</span>
              <span className="er-case-company">{c.company}</span>
            </div>
            <p className="er-case-context">{c.context}</p>
            <dl>
              <dt>Engpass</dt>
              <dd>{c.engpass}</dd>
              <dt>Lösung</dt>
              <dd>{c.loesung}</dd>
              <dt>Ergebnis</dt>
              <dd className="er-case-outcome">{c.outcome}</dd>
            </dl>
            {c.quote && <p className="er-case-quote">{c.quote}</p>}
            <p className="er-case-source">
              Quelle: {c.quelleName} —{" "}
              <a href={c.url} target="_blank" rel="noopener noreferrer">
                ansehen ↗
              </a>
            </p>
          </div>
        ))}
      </section>

      {/* 90-Tage-Plan */}
      <section className="er-section">
        <h2 className="er-h2">{TOOLKIT_LABELS.plan}</h2>
        <p className="er-text">{PLAN_90.intro}</p>
        {PLAN_90.phasen.map((p, i) => (
          <div key={i} className="er-phase">
            <span className="er-phase-when">
              {p.titel}
              <br />
              {p.wochen}
            </span>
            <span className="er-text">{p.text}</span>
          </div>
        ))}
        <p className="er-bruecke">{PLAN_90.bruecke}</p>
      </section>

      {/* Business-Case */}
      <section className="er-section">
        <h2 className="er-h2">{TOOLKIT_LABELS.businessCase}</h2>
        <p className="er-text">{BUSINESS_CASE.text}</p>
        <a className="er-bizcase-link" href={BUSINESS_CASE.href}>
          → {BUSINESS_CASE.label}
        </a>
      </section>
    </div>
  );
}
