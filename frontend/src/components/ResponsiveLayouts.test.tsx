import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AboutSection } from './AboutSection';
import { ExperienceSection } from './ExperienceSection';
import { ProjectsSection } from './ProjectsSection';
import { SkillsSection } from './SkillsSection';
import { ContactSection } from './ContactSection';
import type { About, Experience, Project, SkillCategory, Contact } from '@/types/content';

/**
 * Unit tests for responsive layouts across all section components
 * 
 * **Validates: Requirements 5.1, 5.3**
 * - 5.1: THE Content_Architecture SHALL render all content readable at 375px viewport width
 * - 5.3: THE Content_Architecture SHALL adapt layout from single-column on Mobile_Viewport to multi-column on Desktop_Viewport
 * 
 * These tests verify that:
 * - Components use single-column layout by default (mobile-first)
 * - Components switch to multi-column layouts at desktop breakpoints (lg: 1024px+)
 * - Tablet breakpoint (md: 768px) is handled appropriately
 */

// Sample data for testing
const sampleAbout: About = {
  headline: 'Full Stack Developer',
  bio: 'Building great software.',
  valueProposition: 'I help teams ship faster.',
  socialLinks: [
    { platform: 'github', url: 'https://github.com/test', label: 'GitHub' },
  ],
};

const sampleExperience: Experience = {
  id: 'exp-1',
  role: 'Senior Developer',
  company: 'Tech Corp',
  location: 'Remote',
  startDate: '2020-01-01',
  endDate: null,
  summary: 'Building great products',
  highlights: ['Led team of 5'],
  depth: {
    context: 'Joined to scale the platform',
    challenges: ['Legacy code'],
    decisions: [],
    outcomes: [],
    lessons: ['Always document'],
  },
  order: 1,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const sampleProject: Project = {
  id: 'proj-1',
  title: 'Portfolio Site',
  description: 'A personal portfolio website.',
  technologies: ['React', 'TypeScript'],
  links: [],
  depth: {
    problem: 'Needed a portfolio',
    approach: 'Built with Next.js',
    tradeoffs: [],
    outcomes: [],
    reflections: 'Would use more testing',
  },
  order: 1,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const sampleSkillCategory: SkillCategory = {
  id: 'frontend',
  name: 'Frontend',
  description: 'UI development',
  skills: [
    { name: 'React', level: 'expert' },
    { name: 'TypeScript', level: 'proficient' },
  ],
  order: 1,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const sampleContact: Contact = {
  headline: "Let's Connect",
  subtext: 'I would love to hear from you.',
  options: [
    { type: 'email', label: 'Email', url: 'mailto:test@example.com', description: 'Send me an email' },
    { type: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/test', description: 'Connect on LinkedIn' },
    { type: 'calendar', label: 'Schedule', url: 'https://calendly.com/test', description: 'Book a call' },
  ],
};

describe('Responsive Layouts - Requirements 5.1, 5.3', () => {
  describe('AboutSection responsive layout', () => {
    it('uses flex-col by default (mobile single column)', () => {
      const { container } = render(<AboutSection about={sampleAbout} />);
      
      // Find the flex container that holds profile image and content
      const flexContainer = container.querySelector('.flex.flex-col');
      expect(flexContainer).toBeInTheDocument();
    });

    it('switches to flex-row at md breakpoint (tablet/desktop)', () => {
      const { container } = render(<AboutSection about={sampleAbout} />);
      
      // The container should have md:flex-row for horizontal layout on larger screens
      const flexContainer = container.querySelector('.flex.flex-col.md\\:flex-row');
      expect(flexContainer).toBeInTheDocument();
    });

    it('has responsive padding for different viewport sizes', () => {
      render(<AboutSection about={sampleAbout} />);
      
      const section = document.getElementById('about');
      expect(section).toHaveClass('py-12'); // Mobile
      expect(section).toHaveClass('md:py-16'); // Tablet
      expect(section).toHaveClass('lg:py-20'); // Desktop
    });

    it('has responsive text sizes for headings', () => {
      render(<AboutSection about={sampleAbout} />);
      
      const heading = screen.getByRole('heading', { name: /about/i, level: 2 });
      expect(heading).toHaveClass('text-3xl'); // Mobile
      expect(heading).toHaveClass('md:text-4xl'); // Desktop
    });
  });

  describe('ExperienceSection responsive layout', () => {
    it('uses single column layout (appropriate for timeline)', () => {
      const { container } = render(<ExperienceSection experiences={[sampleExperience]} />);
      
      // Experience items are in a space-y container (vertical stack)
      const itemsContainer = container.querySelector('.space-y-4');
      expect(itemsContainer).toBeInTheDocument();
    });

    it('has responsive padding for different viewport sizes', () => {
      render(<ExperienceSection experiences={[sampleExperience]} />);
      
      const section = document.getElementById('experience');
      expect(section).toHaveClass('py-12'); // Mobile
      expect(section).toHaveClass('md:py-16'); // Tablet
      expect(section).toHaveClass('lg:py-20'); // Desktop
    });

    it('experience summary adapts layout at md breakpoint', () => {
      const { container } = render(<ExperienceSection experiences={[sampleExperience]} />);
      
      // ExperienceSummary uses flex-col md:flex-row
      const summaryContainer = container.querySelector('.flex.flex-col.md\\:flex-row');
      expect(summaryContainer).toBeInTheDocument();
    });
  });

  describe('ProjectsSection responsive layout', () => {
    it('uses single column layout for expandable cards', () => {
      const { container } = render(<ProjectsSection projects={[sampleProject]} />);
      
      // Projects are in a space-y container (vertical stack)
      const itemsContainer = container.querySelector('.space-y-4');
      expect(itemsContainer).toBeInTheDocument();
    });

    it('has responsive padding for different viewport sizes', () => {
      render(<ProjectsSection projects={[sampleProject]} />);
      
      const section = document.getElementById('projects');
      expect(section).toHaveClass('py-12'); // Mobile
      expect(section).toHaveClass('md:py-16'); // Tablet
      expect(section).toHaveClass('lg:py-20'); // Desktop
    });

    it('has responsive text sizes for headings', () => {
      render(<ProjectsSection projects={[sampleProject]} />);
      
      const heading = screen.getByRole('heading', { name: /projects/i, level: 2 });
      expect(heading).toHaveClass('text-3xl'); // Mobile
      expect(heading).toHaveClass('md:text-4xl'); // Desktop
    });
  });

  describe('SkillsSection responsive layout', () => {
    it('uses single column grid by default (mobile)', () => {
      const { container } = render(<SkillsSection skillCategories={[sampleSkillCategory]} />);
      
      // Categories grid uses grid-cols-1 by default
      const grid = container.querySelector('.grid.grid-cols-1');
      expect(grid).toBeInTheDocument();
    });

    it('switches to 2-column grid at lg breakpoint (desktop)', () => {
      const { container } = render(
        <SkillsSection skillCategories={[sampleSkillCategory, { ...sampleSkillCategory, id: 'backend', name: 'Backend' }]} />
      );
      
      // Categories grid uses lg:grid-cols-2 for desktop
      const grid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('skill items within category use responsive grid', () => {
      const { container } = render(<SkillsSection skillCategories={[sampleSkillCategory]} />);
      
      // Skills within category use grid-cols-1 sm:grid-cols-2
      const skillsGrid = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');
      expect(skillsGrid).toBeInTheDocument();
    });

    it('has responsive padding for different viewport sizes', () => {
      render(<SkillsSection skillCategories={[sampleSkillCategory]} />);
      
      const section = document.getElementById('skills');
      expect(section).toHaveClass('py-12'); // Mobile
      expect(section).toHaveClass('md:py-16'); // Tablet
      expect(section).toHaveClass('lg:py-20'); // Desktop
    });
  });

  describe('ContactSection responsive layout', () => {
    it('uses single column grid by default (mobile)', () => {
      const { container } = render(<ContactSection contact={sampleContact} />);
      
      // Contact options grid uses grid-cols-1 by default
      const grid = container.querySelector('.grid.grid-cols-1');
      expect(grid).toBeInTheDocument();
    });

    it('switches to 2-column grid at md breakpoint (tablet)', () => {
      const { container } = render(<ContactSection contact={sampleContact} />);
      
      // Contact options grid uses md:grid-cols-2 for tablet
      const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('switches to 3-column grid at lg breakpoint (desktop)', () => {
      const { container } = render(<ContactSection contact={sampleContact} />);
      
      // Contact options grid uses lg:grid-cols-3 for desktop
      const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('has responsive padding for different viewport sizes', () => {
      render(<ContactSection contact={sampleContact} />);
      
      const section = document.getElementById('contact');
      expect(section).toHaveClass('py-12'); // Mobile
      expect(section).toHaveClass('md:py-16'); // Tablet
      expect(section).toHaveClass('lg:py-20'); // Desktop
    });

    it('has responsive text sizes for headings', () => {
      render(<ContactSection contact={sampleContact} />);
      
      const heading = screen.getByRole('heading', { name: /let's connect/i, level: 2 });
      expect(heading).toHaveClass('text-3xl'); // Mobile
      expect(heading).toHaveClass('md:text-4xl'); // Desktop
    });
  });

  describe('State persistence across viewport changes - Requirement 5.4', () => {
    /**
     * **Validates: Requirement 5.4**
     * - 5.4: WHEN transitioning between viewport sizes, THE Content_Architecture SHALL maintain content state (expanded/collapsed)
     * 
     * These tests verify that:
     * - Expanded items remain expanded when viewport is resized
     * - React state persists because the same component instance is used at all breakpoints
     * - No conditional rendering causes component remounting on resize
     */

    it('ExperienceSection maintains expanded state across simulated viewport changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ExperienceSection experiences={[sampleExperience]} />);
      
      // Find and click the expand button to expand the experience item
      const expandButton = screen.getByRole('button', { name: /senior developer at tech corp/i });
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
      
      // Expand the item
      await user.click(expandButton);
      
      // Verify it's expanded
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
      
      // Simulate viewport change by re-rendering (this mimics what happens on resize)
      // The key point is that the component doesn't unmount - it just re-renders
      rerender(<ExperienceSection experiences={[sampleExperience]} />);
      
      // State should be preserved - item should still be expanded
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('ProjectsSection maintains expanded state across simulated viewport changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ProjectsSection projects={[sampleProject]} />);
      
      // Find and click the expand button to expand the project card
      const expandButton = screen.getByRole('button', { name: /project: portfolio site/i });
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
      
      // Expand the item
      await user.click(expandButton);
      
      // Verify it's expanded
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
      
      // Simulate viewport change by re-rendering
      rerender(<ProjectsSection projects={[sampleProject]} />);
      
      // State should be preserved - item should still be expanded
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('multiple expanded items maintain state across re-renders', async () => {
      const user = userEvent.setup();
      const experiences = [
        sampleExperience,
        { ...sampleExperience, id: 'exp-2', role: 'Junior Developer', company: 'Startup Inc' },
      ];
      
      const { rerender } = render(<ExperienceSection experiences={experiences} />);
      
      // Find both expand buttons
      const expandButton1 = screen.getByRole('button', { name: /senior developer at tech corp/i });
      const expandButton2 = screen.getByRole('button', { name: /junior developer at startup inc/i });
      
      // Expand both items
      await user.click(expandButton1);
      await user.click(expandButton2);
      
      // Verify both are expanded
      expect(expandButton1).toHaveAttribute('aria-expanded', 'true');
      expect(expandButton2).toHaveAttribute('aria-expanded', 'true');
      
      // Simulate viewport change by re-rendering
      rerender(<ExperienceSection experiences={experiences} />);
      
      // Both items should still be expanded
      expect(expandButton1).toHaveAttribute('aria-expanded', 'true');
      expect(expandButton2).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapsed items remain collapsed across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ExperienceSection experiences={[sampleExperience]} />);
      
      const expandButton = screen.getByRole('button', { name: /senior developer at tech corp/i });
      
      // Expand then collapse
      await user.click(expandButton); // expand
      await user.click(expandButton); // collapse
      
      // Verify it's collapsed
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
      
      // Simulate viewport change by re-rendering
      rerender(<ExperienceSection experiences={[sampleExperience]} />);
      
      // State should be preserved - item should still be collapsed
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('uses same component instance at all breakpoints (no conditional rendering)', () => {
      // This test verifies that the component structure doesn't change based on viewport
      // by checking that responsive classes are applied to the same elements
      const { container } = render(<ExperienceSection experiences={[sampleExperience]} />);
      
      // The experience summary should have both mobile and desktop classes on the same element
      // This proves the same component is used at all breakpoints
      const summaryContainer = container.querySelector('.flex.flex-col.md\\:flex-row');
      expect(summaryContainer).toBeInTheDocument();
      
      // The section should have responsive padding classes on the same element
      const section = document.getElementById('experience');
      expect(section).toHaveClass('py-12', 'md:py-16', 'lg:py-20');
    });
  });

  describe('Mobile viewport readability (375px)', () => {
    it('all sections use max-w-4xl container for content width control', () => {
      const { container: aboutContainer } = render(<AboutSection about={sampleAbout} />);
      const { container: expContainer } = render(<ExperienceSection experiences={[sampleExperience]} />);
      const { container: projContainer } = render(<ProjectsSection projects={[sampleProject]} />);
      const { container: skillsContainer } = render(<SkillsSection skillCategories={[sampleSkillCategory]} />);
      const { container: contactContainer } = render(<ContactSection contact={sampleContact} />);

      // All sections should have max-w-4xl for content width control
      expect(aboutContainer.querySelector('.max-w-4xl')).toBeInTheDocument();
      expect(expContainer.querySelector('.max-w-4xl')).toBeInTheDocument();
      expect(projContainer.querySelector('.max-w-4xl')).toBeInTheDocument();
      expect(skillsContainer.querySelector('.max-w-4xl')).toBeInTheDocument();
      expect(contactContainer.querySelector('.max-w-4xl')).toBeInTheDocument();
    });

    it('all sections use mx-auto for horizontal centering', () => {
      const { container: aboutContainer } = render(<AboutSection about={sampleAbout} />);
      const { container: expContainer } = render(<ExperienceSection experiences={[sampleExperience]} />);
      const { container: projContainer } = render(<ProjectsSection projects={[sampleProject]} />);
      const { container: skillsContainer } = render(<SkillsSection skillCategories={[sampleSkillCategory]} />);
      const { container: contactContainer } = render(<ContactSection contact={sampleContact} />);

      // All sections should have mx-auto for centering
      expect(aboutContainer.querySelector('.mx-auto')).toBeInTheDocument();
      expect(expContainer.querySelector('.mx-auto')).toBeInTheDocument();
      expect(projContainer.querySelector('.mx-auto')).toBeInTheDocument();
      expect(skillsContainer.querySelector('.mx-auto')).toBeInTheDocument();
      expect(contactContainer.querySelector('.mx-auto')).toBeInTheDocument();
    });
  });
});
