import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import {
  WorkshopHero,
  WorkshopAtAGlance,
  WorkshopOutcome,
  WorkshopAgenda,
  WorkshopDemarcation,
  WorkshopAuthority,
  WorkshopFramework,
  WorkshopLegal,
  WorkshopFormPlaceholder,
} from "@/components/workshop/WorkshopSections";
import { WorkshopForm } from "@/components/workshop/WorkshopForm";
import { workshopContent, KI_SOUVERAENITAET_SLUG } from "@/components/workshop/content";
import { getWorkshopBySlug } from "@/lib/workshop/queries";

/** Only the ki-souveraenitaet slug is a real route today. */
export function generateStaticParams() {
  return [{ slug: KI_SOUVERAENITAET_SLUG }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== KI_SOUVERAENITAET_SLUG) return {};
  return {
    title: `${workshopContent.hero.headline} | Daniel Kreuzhofer`,
    description: workshopContent.hero.intro.split("\n")[0],
  };
}

/**
 * /workshop/[slug] — the workshop landingpage.
 *
 * Section order follows the buyer's questions, not the workshop's structure:
 * hook → facts at a glance → what do I get → how does it run → why trust you
 * → fine print → signup. The form is active only when the workshop has a
 * termin set (termin NULL = not bookable).
 */
export default async function WorkshopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== KI_SOUVERAENITAET_SLUG) notFound();

  const workshop = await getWorkshopBySlug(slug);
  const bookable = Boolean(workshop?.termin);

  return (
    <Layout>
      <WorkshopHero />
      <WorkshopAtAGlance workshop={workshop} />
      <WorkshopOutcome />
      <WorkshopAgenda />
      <WorkshopDemarcation />
      <WorkshopAuthority />
      <WorkshopFramework />
      {bookable ? <WorkshopForm slug={slug} /> : <WorkshopFormPlaceholder />}
      <WorkshopLegal />
    </Layout>
  );
}
