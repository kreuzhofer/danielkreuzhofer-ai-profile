import type { Metadata } from "next";
import Link from "next/link";
import { findByReportToken } from "@/db/submissions";
import { computeResult } from "@/lib/engpass-check/scoring";
import { buildReportModel } from "@/lib/engpass-check/report";
import { TOOLKIT_LABELS } from "@/lib/engpass-check/toolkit-content";
import { PrintButton } from "./PrintButton";
import { ReportDocument } from "./ReportDocument";
import type { Answers } from "@/lib/engpass-check/types";
import "./report.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dein Engpass-Report | Daniel Kreuzhofer",
  robots: { index: false, follow: false },
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const submission = token ? await findByReportToken(token).catch(() => undefined) : undefined;
  const model = submission
    ? buildReportModel(submission.answers as Answers, computeResult(submission.answers as Answers))
    : null;

  return (
    <div className="engpass-report">
      <header className="er-header">
        <div className="er-header-inner">
          <Link href="/" className="er-brand" aria-label="Zur Startseite von Daniel Kreuzhofer">
            <span className="er-brand-name">KI-Coaching mit Kante</span>
            <span className="er-brand-sub">Daniel Kreuzhofer · Engpass-Report</span>
          </Link>
          {model && <PrintButton label={TOOLKIT_LABELS.print} />}
        </div>
      </header>

      {model ? (
        <ReportDocument model={model} />
      ) : (
        <div className="er-container">
          <p className="er-eyebrow">Report</p>
          <h2 className="er-h2">Dieser Report-Link ist ungültig oder abgelaufen.</h2>
          <p className="er-text">
            Mach den Engpass-Check einfach noch einmal — dann bekommst Du einen frischen Link.
          </p>
          <p>
            <Link className="er-bizcase-link" href="/engpass-check">
              → Zum Engpass-Check
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
