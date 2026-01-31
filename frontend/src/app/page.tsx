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

/**
 * Home page component - main entry point for the portfolio website.
 * 
 * This page composes all content sections within the Layout component,
 * implementing the single-page architecture with anchor-based navigation.
 * 
 * Features:
 * - Loads all content data at build time (static generation)
 * - Renders sections in order: About, Experience, Projects, Skills, Contact
 * - Each section has an id attribute for anchor navigation
 * - Smooth scroll behavior enabled via CSS
 * 
 * **Validates: Requirements 1.1, 1.4**
 * - 1.1: THE Navigation_System SHALL provide access to all primary Content_Sections from any page within 2 clicks
 * - 1.4: THE Content_Architecture SHALL organize content into distinct sections: About, Experience, Projects, Skills, and Contact
 */
export default function Home() {
  // Load all content data at build time
  const hero = getHero();
  const about = getAbout();
  const experiences = getExperiences();
  const projects = getProjects();
  const skillCategories = getSkillCategories();
  const contact = getContact();

  return (
    <Layout>
      {/* Hero Section - full viewport intro */}
      <HeroSection
        headline={hero.headline}
        tagline={hero.tagline}
        ctaText={hero.ctaText}
        ctaHref={hero.ctaHref}
      />

      {/* About Section - id="about" for anchor navigation */}
      <AboutSection about={about} />

      {/* Experience Section - id="experience" for anchor navigation */}
      <ExperienceSection experiences={experiences} />

      {/* Projects Section - id="projects" for anchor navigation */}
      <ProjectsSection projects={projects} />

      {/* Skills Section - id="skills" for anchor navigation */}
      <SkillsSection skillCategories={skillCategories} />

      {/* Recruiter CTA Section - Skills Transparency & Fit Analysis */}
      <RecruiterCTASection />

      {/* Contact Section - id="contact" for anchor navigation */}
      <ContactSection contact={contact} />
    </Layout>
  );
}
