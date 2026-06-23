import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getScorecard } from "@/lib/scorecard/registry";
import { REGISTRATIONS } from "@/scorecards";
import { ScorecardApp } from "@/components/scorecard/ScorecardApp";
import "@/components/scorecard/sc.css";

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
  return <ScorecardApp registration={reg} />;
}
