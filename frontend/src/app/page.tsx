import { Metadata } from 'next';
import { Layout } from '@/components/Layout';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { ExperienceSection } from '@/components/ExperienceSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { SkillsSection } from '@/components/SkillsSection';
import { RecruiterCTASection } from '@/components/RecruiterCTASection';
import { ContactSection } from '@/components/ContactSection';
import { VideosSection, BlogTeaser } from '@/components/home';
import {
  getAbout,
  getHero,
  getExperiences,
  getProjects,
  getSkillCategories,
  getContact,
  getBlogPosts,
} from '@/lib/content';
import { getLatestVideos } from '@/lib/youtube';

export const metadata: Metadata = {
  title: 'Daniel Kreuzhofer — Senior Solutions Architect',
  description:
    'Daniel Kreuzhofer — Senior Solutions Architect. Experience, projects, skills, self-built AI tools, plus videos and blog posts on AI in practice.',
  openGraph: {
    title: 'Daniel Kreuzhofer — Senior Solutions Architect',
    description: 'Experience, projects, skills, self-built AI tools, videos and blog.',
    type: 'website',
  },
};

/**
 * Home = Daniel's personal profile (the coaching offer is offline; /about and
 * /coaching 301 here). Latest videos and blog posts follow the profile, the
 * contact section closes the page.
 */
export default async function Home() {
  const hero = getHero();
  const about = getAbout();
  const experiences = getExperiences();
  const projects = getProjects();
  const skillCategories = getSkillCategories();
  const contact = getContact();
  const videos = await getLatestVideos(3);
  const posts = [...getBlogPosts()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <Layout>
      <HeroSection
        headline={hero.headline}
        tagline={hero.tagline}
        ctaText={hero.ctaText}
        ctaHref={hero.ctaHref}
      />
      <AboutSection about={about} />
      <ExperienceSection experiences={experiences} />
      <ProjectsSection projects={projects} />
      <SkillsSection skillCategories={skillCategories} />
      <VideosSection videos={videos} />
      <BlogTeaser posts={posts} />
      <RecruiterCTASection />
      <ContactSection contact={contact} />
    </Layout>
  );
}
