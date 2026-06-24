import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getScorecard } from "@/lib/scorecard/registry";
import { buildScorecardReport, type ScorecardReport } from "@/lib/scorecard/report-model";
import { ScorecardReportDoc } from "@/components/scorecard/ScorecardReportDoc";
import { DEFAULT_REPORT_LABELS } from "@/components/scorecard/ScorecardReportView";
import { PrintButton } from "@/components/scorecard/PrintButton";
import { findScorecardByReportToken } from "@/db/scorecard-submissions";
import { isDatabaseConfigured } from "@/db/client";
import "@/components/scorecard/sc-report-doc.css";

/** Token-gated personal report — never indexed, always rendered per-request. */
export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ScorecardReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ scorecardSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { scorecardSlug } = await params;
  const { token } = await searchParams;
  if (!token || !isDatabaseConfigured()) notFound();

  const submission = await findScorecardByReportToken(token);
  if (!submission || submission.scorecard !== scorecardSlug) notFound();

  const reg = getScorecard(scorecardSlug);
  if (!reg) notFound();

  // A misconfigured registration (outcome without a content block) must not 500
  // on external token input — fail to a 404 instead.
  let model: ScorecardReport;
  try {
    model = buildScorecardReport(reg, submission.result, submission.answers);
  } catch {
    notFound();
  }

  return (
    <div className="sc-doc">
      <header className="scd-header">
        <div className="scd-header-inner">
          <Link href="/" className="scd-brand" aria-label={`Zur Startseite von ${reg.branding.brandAuthor}`}>
            <span className="scd-brand-name">{reg.branding.brandName}</span>
            <span className="scd-brand-sub">{reg.branding.brandAuthor} · Report</span>
          </Link>
          <PrintButton label="Als PDF speichern" />
        </div>
      </header>

      <ScorecardReportDoc
        model={model}
        labels={DEFAULT_REPORT_LABELS}
        eyebrow={reg.content.resultHeading}
        tipps={reg.content.tipps}
        weakestCategory={submission.result.nextLever}
      />
    </div>
  );
}
