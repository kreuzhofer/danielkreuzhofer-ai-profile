import { Metadata } from 'next';
import { Layout } from '@/components/Layout';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { ExperienceSection } from '@/components/ExperienceSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { SkillsSection } from '@/components/SkillsSection';
import { RecruiterCTASection } from '@/components/RecruiterCTASection';
import { ContactSection } from '@/components/ContactSection';
import {
  getAbout,
  getHero,
  getExperiences,
  getProjects,
  getSkillCategories,
  getContact,
} from '@/lib/content';

export const metadata: Metadata = {
  title: 'Über mich | Daniel Kreuzhofer',
  description:
    'Daniel Kreuzhofer — Senior AI Solutions Architect. Werdegang, Projekte, Skills und zwei selbst gebaute KI-Tools (Transparenz-Dashboard & Fit-Analyse).',
  openGraph: {
    title: 'Über mich | Daniel Kreuzhofer',
    description: 'Werdegang, Projekte, Skills und selbst gebaute KI-Tools.',
    type: 'website',
  },
};

/** /about — re-homed personal profile (was the single-page home before Stufe 2). */
export default function AboutPage() {
  const hero = getHero();
  const about = getAbout();
  const experiences = getExperiences();
  const projects = getProjects();
  const skillCategories = getSkillCategories();
  const contact = getContact();

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
      <RecruiterCTASection />
      <ContactSection contact={contact} />
    </Layout>
  );
}
