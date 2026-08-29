import { Metadata } from 'next';
import { Layout } from '@/components/Layout';
import {
  ContentHero,
  VideosSection,
  MicroMagnetSection,
  BlogTeaser,
  AboutTeaser,
} from '@/components/home';
import { getBlogPosts } from '@/lib/content';
import { getLatestVideos } from '@/lib/youtube';

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
 * Home = top-of-funnel CONTENT entry point. Promotes Daniel's content (latest videos
 * fetched from the channel RSS) and routes visitors to the micro-magnet (Engpass-Check).
 * The paid offer is no longer published on the site.
 */
export default async function Home() {
  const videos = await getLatestVideos(3);
  const posts = [...getBlogPosts()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <Layout>
      <ContentHero />
      <VideosSection videos={videos} />
      <MicroMagnetSection />
      <BlogTeaser posts={posts} />
      <AboutTeaser />
    </Layout>
  );
}
