import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Anton } from "next/font/google";
import { getScorecard } from "@/lib/scorecard/registry";
import { REGISTRATIONS } from "@/scorecards";
import { ScorecardAppBySlug } from "@/components/scorecard/ScorecardAppBySlug";
import "@/components/scorecard/sc.css";

// Condensed display font per Video-Brand-Kit §5 (Anton — ALLCAPS), same as the
// Engpass-Check. Exposes --font-anton for sc-display / sc-outcome-name.
const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-anton" });

/** Only registered scorecards become routes (REGISTRATIONS is empty until KFC ships). */
export function generateStaticParams() {
  return REGISTRATIONS.map((r) => ({ scorecardSlug: r.definition.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ scorecardSlug: string }>;
}): Promise<Metadata> {
  const { scorecardSlug } = await params;
  const reg = getScorecard(scorecardSlug);
  return reg ? { title: reg.meta.title, description: reg.meta.description } : {};
}

export default async function ScorecardPage({
  params,
}: {
  params: Promise<{ scorecardSlug: string }>;
}) {
  const { scorecardSlug } = await params;
  const reg = getScorecard(scorecardSlug);
  if (!reg) notFound();
  return (
    <div className={anton.variable}>
      <ScorecardAppBySlug slug={scorecardSlug} />
    </div>
  );
}
