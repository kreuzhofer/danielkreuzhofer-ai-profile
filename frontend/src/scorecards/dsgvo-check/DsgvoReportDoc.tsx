import type { ScorecardReportDocProps } from "@/lib/scorecard/registry";
import type { DsgvoResult } from "./types";
import { dsgvoCopy } from "./content";
import "./dsgvo-report.css";

export function DsgvoReportDoc({ result }: ScorecardReportDocProps) {
  const r = result as DsgvoResult;
  return (
    <article className="dsgr">
      <div className="dsgr-badge">Stand der Recherche: {r.rechtsstand}</div>

      <header className={`dsgr-ampel dsgr-ampel-${r.ampel}`}>
        <p className="dsgr-eyebrow">Dein DSGVO-Status</p>
        <h1 className="dsgr-headline">{dsgvoCopy.ampelHeadline[r.ampel]}</h1>
      </header>

      {r.toolMatrix.length > 0 && (
        <section className="dsgr-section">
          <h2 className="dsgr-h2">Deine Tools im Detail</h2>
          {r.toolMatrix.map((v) => (
            <div key={v.toolId} className="dsgr-tool">
              <p className="dsgr-tool-head">
                <span className={`dsgr-badge2 dsgr-badge2-${v.verdict}`}>{dsgvoCopy.verdictLabel[v.verdict]}</span>
                <strong>{v.label}</strong>
              </p>
              <p className="dsgr-tool-reason">{v.reason}</p>
              {v.upgradePath && <p className="dsgr-tool-upgrade">So wird&apos;s konform: {v.upgradePath}</p>}
              {v.caveat && <p className="dsgr-tool-caveat">⚠️ {v.caveat}</p>}
              {v.dpaUrl && (
                <p className="dsgr-tool-link">
                  <a href={v.dpaUrl} target="_blank" rel="noopener noreferrer">→ AVV / DPA dieses Anbieters öffnen</a>
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      <section className="dsgr-section">
        <h2 className="dsgr-h2">EU-AI-Act-Einordnung: {dsgvoCopy.riskLabel[r.riskClass]}</h2>
        <ul className="dsgr-list">{r.riskObligations.map((o, i) => <li key={i}>{o}</li>)}</ul>
      </section>

      <section className="dsgr-section">
        <h2 className="dsgr-h2">Dein Maßnahmenplan</h2>
        <ol className="dsgr-plan">
          {r.actionPlan.map((a) => <li key={a.priority}><strong>{a.title}</strong> — {a.detail}</li>)}
        </ol>
      </section>

      <section className="dsgr-section dsgr-reward">
        <h2 className="dsgr-h2">{dsgvoCopy.rewardHeading}</h2>
        <ul className="dsgr-list">
          {dsgvoCopy.rewardItems.map((t) => <li key={t.title}><strong>{t.title}:</strong> {t.body}</li>)}
        </ul>
      </section>

      <p className="dsgr-update">{dsgvoCopy.updateNote}</p>
      <p className="dsgr-disclaimer">{dsgvoCopy.disclaimer}</p>
    </article>
  );
}
