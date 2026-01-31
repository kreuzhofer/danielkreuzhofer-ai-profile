/**
 * Content Type Definitions
 *
 * These types define the structure of all content used in the portfolio.
 * They are used for type-safe content loading and component props.
 */

// =============================================================================
// Base Types
// =============================================================================

/**
 * Base content item with common fields
 */
export interface ContentItem {
  id: string;
  order: number; // For sorting
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

// =============================================================================
// Supporting Types
// =============================================================================

/**
 * Social media link
 */
export interface SocialLink {
  platform: "linkedin" | "github" | "twitter" | "email" | "youtube" | "website";
  url: string;
  label: string;
}

/**
 * Decision made during a project or role
 */
export interface Decision {
  title: string;
  situation: string;
  options: string[];
  chosen: string;
  rationale: string;
}

/**
 * Quantified outcome/result
 */
export interface Outcome {
  metric: string;
  value: string;
  context: string;
}

/**
 * Trade-off considered during a project
 */
export interface Tradeoff {
  decision: string;
  alternatives: string[];
  reasoning: string;
}

/**
 * Project link (live site, GitHub, case study)
 */
export interface ProjectLink {
  type: "live" | "github" | "case-study";
  url: string;
  label: string;
}

/**
 * Contact option (email, LinkedIn, calendar, form, phone, website)
 */
export interface ContactOption {
  type: "email" | "linkedin" | "calendar" | "form" | "phone" | "website";
  label: string;
  url: string;
  description: string;
}

// =============================================================================
// Hero Section
// =============================================================================

/**
 * Hero section content
 */
export interface Hero {
  headline: string;
  tagline: string;
  ctaText: string;
  ctaHref: string;
}

// =============================================================================
// About Section
// =============================================================================

/**
 * About section content
 */
export interface About {
  headline: string; // Professional title/headline
  bio: string; // Brief bio (under 100 words)
  valueProposition: string;
  profileImage?: string;
  socialLinks: SocialLink[];
}

// =============================================================================
// Experience Section
// =============================================================================

/**
 * Depth layer content for experience entries
 */
export interface ExperienceDepth {
  context: string; // Background and situation
  challenges: string[]; // Key challenges faced
  decisions: Decision[]; // Decisions made with rationale
  outcomes: Outcome[]; // Quantified results
  lessons: string[]; // Lessons learned
}

/**
 * Experience entry (job/role)
 */
export interface Experience extends ContentItem {
  role: string;
  company: string;
  location: string;
  startDate: string; // ISO date
  endDate: string | null; // null = current

  // Summary layer (6-second view)
  summary: string; // One-line description
  highlights: string[]; // 2-3 key achievements

  // Depth layer (expandable)
  depth: ExperienceDepth;

  // MDX content (optional additional content)
  content?: string;
}

/**
 * Experience MDX frontmatter schema
 */
export interface ExperienceFrontmatter {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  order: number;
  summary: string;
  highlights: string[];
  createdAt?: string;
  updatedAt?: string;
  depth?: ExperienceDepth;
}

// =============================================================================
// Projects Section
// =============================================================================

/**
 * Depth layer content for project entries
 */
export interface ProjectDepth {
  problem: string; // Problem statement
  approach: string; // How it was approached
  tradeoffs: Tradeoff[]; // Trade-offs considered
  outcomes: Outcome[]; // Results achieved
  reflections: string; // What would be done differently
}

/**
 * Project entry
 */
export interface Project extends ContentItem {
  title: string;

  // Summary layer
  description: string; // Under 50 words
  technologies: string[];
  thumbnail?: string;
  links: ProjectLink[];

  // Depth layer
  depth: ProjectDepth;

  // MDX content (optional additional content)
  content?: string;
}

/**
 * Project MDX frontmatter schema
 */
export interface ProjectFrontmatter {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  order: number;
  links: ProjectLink[];
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
  depth?: ProjectDepth;
}

// =============================================================================
// Skills Section
// =============================================================================

/**
 * Individual skill
 */
export interface Skill {
  name: string;
  level: "expert" | "proficient" | "familiar";
  yearsOfExperience?: number;
  context?: string; // Brief context for this skill
}

/**
 * Skill category
 */
export interface SkillCategory extends ContentItem {
  name: string;
  description: string;
  skills: Skill[];
}

// =============================================================================
// Contact Section
// =============================================================================

/**
 * Contact section content
 */
export interface Contact {
  headline: string; // Inviting message
  subtext: string; // Supporting text
  options: ContactOption[];
}

// =============================================================================
// Content Loader Interface
// =============================================================================

/**
 * Content loader interface for fetching all content types
 */
export interface ContentLoader {
  getAbout(): Promise<About>;
  getExperiences(): Promise<Experience[]>;
  getProjects(): Promise<Project[]>;
  getSkillCategories(): Promise<SkillCategory[]>;
  getContact(): Promise<Contact>;
}
