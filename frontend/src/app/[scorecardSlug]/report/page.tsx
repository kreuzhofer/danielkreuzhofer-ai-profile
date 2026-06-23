import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getScorecard } from "@/lib/scorecard/registry";
import { buildScorecardReport, type ScorecardReport } from "@/lib/scorecard/report-model";
import { brandStyle } from "@/lib/scorecard/branding";
import { ScorecardReportView, DEFAULT_REPORT_LABELS } from "@/components/scorecard/ScorecardReportView";
import { findScorecardByReportToken } from "@/db/scorecard-submissions";
import { isDatabaseConfigured } from "@/db/client";
import "@/components/scorecard/sc.css";

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
    <div className="sc-shell" style={brandStyle(reg.branding)}>
      <main className="sc-main">
        <section className="sc-card sc-report-card">
          <p className="sc-eyebrow">{reg.content.resultHeading}</p>
          <ScorecardReportView model={model} labels={DEFAULT_REPORT_LABELS} />
        </section>
      </main>
    </div>
  );
}
