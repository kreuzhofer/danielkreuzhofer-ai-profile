import { Metadata } from 'next';
import { Layout } from '@/components/Layout';
import {
  ContentHero,
  VideosSection,
  MicroMagnetSection,
  BlogTeaser,
  AboutTeaser,
  CoachingPointer,
} from '@/components/home';
import { getBlogPosts } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Daniel Kreuzhofer — KI-Coaching mit Kante',
  description:
    'Klartext zu KI für Führungskräfte im Mittelstand: Videos, Tools und der 3-Minuten-Engpass-Check. Selbst getestet, ohne Hype.',
  openGraph: {
    title: 'Daniel Kreuzhofer — KI-Coaching mit Kante',
    description:
      'Klartext zu KI für Führungskräfte im Mittelstand: Videos, Tools und der 3-Minuten-Engpass-Check.',
    type: 'website',
  },
};

/**
 * Home = top-of-funnel CONTENT entry point. Promotes Daniel's content (videos/POV)
 * and routes visitors to the micro-magnet (Engpass-Check). The offer + Erstgespräch
 * live on /coaching for warm leads only.
 */
export default function Home() {
  const posts = [...getBlogPosts()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <Layout>
      <ContentHero />
      <VideosSection />
      <MicroMagnetSection />
      <BlogTeaser posts={posts} />
      <AboutTeaser />
      <CoachingPointer />
    </Layout>
  );
}
