import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import {
  WorkshopHero,
  WorkshopAgenda,
  WorkshopOutcome,
  WorkshopFramework,
  WorkshopDemarcation,
  WorkshopLegal,
  WorkshopForm,
} from "@/components/workshop/WorkshopSections";
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
    description: workshopContent.hero.intro.split('\n')[0],
  };
}

/**
 * /workshop/[slug] — the workshop landingpage. The form is active only when
 * the workshop has a termin set (termin NULL = not bookable). Dynamic values
 * (termin, price, slots) come from the DB workshop entity; static copy from
 * the TS content module.
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
      <WorkshopHero workshop={workshop} />
      <WorkshopAgenda />
      <WorkshopOutcome />
      <WorkshopFramework workshop={workshop} />
      <WorkshopDemarcation />
      <WorkshopForm bookable={bookable} />
      <WorkshopLegal />
    </Layout>
  );
}
