/**
 * Component exports for the portfolio application
 */

export { Layout } from './Layout';
export { Navigation, NavLink, DEFAULT_SECTIONS } from './Navigation';
export type { NavigationProps, NavLinkProps } from './Navigation';

// Expandable components for progressive disclosure
export { Expandable, ExpandButton, ExpandContent } from './Expandable';
export type {
  ExpandableProps,
  ExpandButtonProps,
  ExpandContentProps,
  ExpandableA11yProps,
} from './Expandable';

// Section components
export { AboutSection, SocialLinks } from './AboutSection';
export type { AboutSectionProps } from './AboutSection';

export {
  ExperienceSection,
  ExperienceItem,
  ExperienceSummary,
  ExperienceDepth,
  formatDateRange,
} from './ExperienceSection';
export type { ExperienceSectionProps, ExperienceItemProps } from './ExperienceSection';

export {
  ProjectsSection,
  ProjectCard,
  ProjectSummary,
  ProjectDepth,
} from './ProjectsSection';
export type { ProjectsSectionProps, ProjectCardProps } from './ProjectsSection';

export {
  SkillsSection,
  SkillCategoryCard,
  SkillItem,
  ProficiencyIndicator,
} from './SkillsSection';
export type { SkillsSectionProps, SkillCategoryCardProps, SkillItemProps } from './SkillsSection';

export { ContactSection, ContactOptionCard } from './ContactSection';
export type { ContactSectionProps, ContactOptionCardProps } from './ContactSection';
