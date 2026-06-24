"use client";
import type { ScorecardResultViewProps } from "@/lib/scorecard/registry";
import type { DsgvoResult } from "./types";
import { dsgvoCopy } from "./content";
import "./dsgvo.css";

export function DsgvoResultView({ result }: ScorecardResultViewProps) {
  const r = result as DsgvoResult;
  const top3 = r.actionPlan.slice(0, 3);
  return (
    <div className="dsg">
      <div className={`dsg-ampel dsg-ampel-${r.ampel}`}>
        <span className="dsg-ampel-dot" aria-hidden="true" />
        <div>
          <p className="dsg-ampel-eyebrow">Dein Status</p>
          <h2 className="dsg-ampel-headline">{dsgvoCopy.ampelHeadline[r.ampel]}</h2>
        </div>
      </div>

      {r.toolMatrix.length > 0 && (
        <section className="dsg-section" aria-label="Tools im Check">
          <h3 className="dsg-h3">Deine Tools im Check</h3>
          <ul className="dsg-matrix">
            {r.toolMatrix.map((v) => (
              <li key={v.toolId} className="dsg-row">
                <span className={`dsg-badge dsg-badge-${v.verdict}`}>{dsgvoCopy.verdictLabel[v.verdict]}</span>
                <span className="dsg-tool">{v.label}</span>
                <span className="dsg-reason">{v.reason}</span>
                {v.upgradePath && <span className="dsg-upgrade">→ {v.upgradePath}</span>}
                {v.caveat && <span className="dsg-caveat">⚠️ {v.caveat}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="dsg-section">
        <h3 className="dsg-h3">EU-AI-Act-Einordnung</h3>
        <p className={`dsg-risk dsg-risk-${r.riskClass}`}>{dsgvoCopy.riskLabel[r.riskClass]}</p>
        <ul className="dsg-list">{r.riskObligations.map((o, i) => <li key={i}>{o}</li>)}</ul>
      </section>

      {top3.length > 0 && (
        <section className="dsg-section">
          <h3 className="dsg-h3">Deine wichtigsten nächsten Schritte</h3>
          <ol className="dsg-plan">{top3.map((a) => <li key={a.priority}><strong>{a.title}</strong> — {a.detail}</li>)}</ol>
          <p className="dsg-teaser">Den vollständigen Plan mit AVV-Links, Upgrade-Schritten und Vorlagen bekommst Du im Report ↓</p>
        </section>
      )}

      {r.shadowAiFlag && (
        <p className="dsg-callout">⚠️ Du hast keinen vollen Überblick, welche KI Deine Mitarbeitenden nutzen — das ist in der Praxis das häufigste DSGVO-Risiko.</p>
      )}

      <p className="dsg-disclaimer">{dsgvoCopy.disclaimer}</p>
    </div>
  );
}
