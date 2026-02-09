/**
 * Knowledge Loader Utility
 *
 * This module provides utilities for loading and compiling knowledge base content
 * for the AI chatbot. It reads MDX content files and raw knowledge files,
 * then formats them for LLM consumption.
 *
 * @see Requirements 10.1, 10.2, 10.3
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  KnowledgeContent,
  ExperienceContent,
  ProjectContent,
  SkillContent,
  AboutContent,
  CompiledKnowledge,
  ContextSection,
} from "@/types/knowledge";
import { SYSTEM_PROMPT_TEMPLATE } from "@/types/knowledge";
import { PORTFOLIO_OWNER } from "./portfolio-owner";
import type {
  ExperienceFrontmatter,
  ProjectFrontmatter,
  SkillCategory,
  About,
} from "@/types/content";

// Directory paths
const CONTENT_DIR = path.join(process.cwd(), "content");
const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const KNOWLEDGE_EXAMPLES_DIR = path.join(process.cwd(), "..", "knowledge-examples");

// =============================================================================
// MDX Parsing Utilities
// =============================================================================

/**
 * Parse an MDX file and extract frontmatter
 */
function parseMarkdownFile<T>(filePath: string): {
  frontmatter: T;
  content: string;
} {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  return {
    frontmatter: data as T,
    content,
  };
}

// =============================================================================
// Experience Loading
// =============================================================================

/**
 * Load all experience entries and convert to knowledge format
 * @see Requirement 10.1
 */
function loadExperiences(): ExperienceContent[] {
  const experienceDir = path.join(CONTENT_DIR, "experience");

  if (!fs.existsSync(experienceDir)) {
    return [];
  }

  const files = fs
    .readdirSync(experienceDir)
    .filter((file) => file.endsWith(".mdx"));

  const experiences = files.map((file) => {
    const filePath = path.join(experienceDir, file);
    const { frontmatter } = parseMarkdownFile<ExperienceFrontmatter>(filePath);

    // Build depth content from structured data
    const depthParts: string[] = [];

    if (frontmatter.depth?.context) {
      depthParts.push(`Context: ${frontmatter.depth.context}`);
    }

    if (frontmatter.depth?.challenges?.length) {
      depthParts.push(`Challenges: ${frontmatter.depth.challenges.join("; ")}`);
    }

    if (frontmatter.depth?.decisions?.length) {
      const decisions = frontmatter.depth.decisions
        .map(
          (d) =>
            `${d.title}: ${d.situation} - Chose "${d.chosen}" because ${d.rationale}`
        )
        .join("; ");
      depthParts.push(`Key Decisions: ${decisions}`);
    }

    if (frontmatter.depth?.outcomes?.length) {
      const outcomes = frontmatter.depth.outcomes
        .map((o) => `${o.metric}: ${o.value} (${o.context})`)
        .join("; ");
      depthParts.push(`Outcomes: ${outcomes}`);
    }

    if (frontmatter.depth?.lessons?.length) {
      depthParts.push(`Lessons Learned: ${frontmatter.depth.lessons.join("; ")}`);
    }

    // Format period
    const startYear = frontmatter.startDate
      ? new Date(frontmatter.startDate).getFullYear()
      : "";
    const endYear = frontmatter.endDate
      ? new Date(frontmatter.endDate).getFullYear()
      : "Present";
    const period = `${startYear} - ${endYear}`;

    return {
      id: frontmatter.id || file.replace(".mdx", ""),
      role: frontmatter.role || "",
      company: frontmatter.company || "",
      period,
      summary: frontmatter.summary || "",
      depth: depthParts.join("\n"),
    } as ExperienceContent;
  });

  return experiences;
}

// =============================================================================
// Project Loading
// =============================================================================

/**
 * Load all project entries and convert to knowledge format
 * @see Requirement 10.2
 */
function loadProjects(): ProjectContent[] {
  const projectsDir = path.join(CONTENT_DIR, "projects");

  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  const files = fs
    .readdirSync(projectsDir)
    .filter((file) => file.endsWith(".mdx"));

  const projects = files.map((file) => {
    const filePath = path.join(projectsDir, file);
    const { frontmatter } = parseMarkdownFile<ProjectFrontmatter>(filePath);

    // Build details content from structured data
    const detailParts: string[] = [];

    if (frontmatter.depth?.problem) {
      detailParts.push(`Problem: ${frontmatter.depth.problem}`);
    }

    if (frontmatter.depth?.approach) {
      detailParts.push(`Approach: ${frontmatter.depth.approach}`);
    }

    if (frontmatter.depth?.tradeoffs?.length) {
      const tradeoffs = frontmatter.depth.tradeoffs
        .map(
          (t) =>
            `${t.decision}: Considered ${t.alternatives.join(", ")} - ${t.reasoning}`
        )
        .join("; ");
      detailParts.push(`Trade-offs: ${tradeoffs}`);
    }

    if (frontmatter.depth?.outcomes?.length) {
      const outcomes = frontmatter.depth.outcomes
        .map((o) => `${o.metric}: ${o.value} (${o.context})`)
        .join("; ");
      detailParts.push(`Outcomes: ${outcomes}`);
    }

    if (frontmatter.depth?.reflections) {
      detailParts.push(`Reflections: ${frontmatter.depth.reflections}`);
    }

    return {
      id: frontmatter.id || file.replace(".mdx", ""),
      title: frontmatter.title || "",
      description: frontmatter.description || "",
      technologies: frontmatter.technologies || [],
      details: detailParts.join("\n"),
    } as ProjectContent;
  });

  return projects;
}

// =============================================================================
// Skills Loading
// =============================================================================

/**
 * Load skill categories and convert to knowledge format
 * @see Requirement 10.3
 */
function loadSkills(): SkillContent[] {
  const filePath = path.join(CONTENT_DIR, "skills.mdx");

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const { frontmatter } = parseMarkdownFile<{ categories: SkillCategory[] }>(
    filePath
  );

  if (!frontmatter.categories) {
    return [];
  }

  return frontmatter.categories.map((category) => ({
    category: category.name,
    skills: category.skills.map((skill) => ({
      name: skill.name,
      level: skill.level,
      context: skill.context,
    })),
  }));
}

// =============================================================================
// About Loading
// =============================================================================

/**
 * Load about section content
 */
function loadAbout(): AboutContent {
  const filePath = path.join(CONTENT_DIR, "about.mdx");

  if (!fs.existsSync(filePath)) {
    return {
      headline: "",
      bio: "",
      valueProposition: "",
    };
  }

  const { frontmatter } = parseMarkdownFile<About>(filePath);

  return {
    headline: frontmatter.headline || "",
    bio: frontmatter.bio || "",
    valueProposition: frontmatter.valueProposition || "",
  };
}

// =============================================================================
// Raw Knowledge Loading
// =============================================================================

/**
 * Load raw knowledge files from the knowledge/ directory
 * Falls back to knowledge-examples/ if knowledge/ is empty or missing
 */
function loadRawKnowledge(): string[] {
  // Try primary knowledge directory first
  let knowledgeDir = KNOWLEDGE_DIR;
  let files: string[] = [];

  if (fs.existsSync(KNOWLEDGE_DIR)) {
    files = fs
      .readdirSync(KNOWLEDGE_DIR)
      .filter((file) => file.endsWith(".md"));
  }

  // Fall back to knowledge-examples if knowledge/ is empty or missing
  if (files.length === 0 && fs.existsSync(KNOWLEDGE_EXAMPLES_DIR)) {
    knowledgeDir = KNOWLEDGE_EXAMPLES_DIR;
    files = fs
      .readdirSync(KNOWLEDGE_EXAMPLES_DIR)
      .filter((file) => file.endsWith(".md") && file !== "README.md");
  }

  if (files.length === 0) {
    return [];
  }

  return files.map((file) => {
    const filePath = path.join(knowledgeDir, file);
    const content = fs.readFileSync(filePath, "utf8");
    // Remove YAML frontmatter if present
    const { content: bodyContent } = matter(content);
    return bodyContent.trim();
  });
}

// =============================================================================
// Main Loading Functions
// =============================================================================

/**
 * Load all content from the knowledge base
 * @returns Complete knowledge content from MDX files and raw knowledge
 */
export async function loadAllContent(): Promise<KnowledgeContent> {
  return {
    experiences: loadExperiences(),
    projects: loadProjects(),
    skills: loadSkills(),
    about: loadAbout(),
    rawKnowledge: loadRawKnowledge(),
  };
}

// =============================================================================
// Context Compilation
// =============================================================================

/**
 * Estimate token count for a string (rough approximation: ~4 chars per token)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Format experience content for LLM context
 */
function formatExperienceSection(experience: ExperienceContent): string {
  const lines = [
    `## ${experience.role} at ${experience.company}`,
    `Period: ${experience.period}`,
    `Summary: ${experience.summary}`,
  ];

  if (experience.depth) {
    lines.push("", "### Details", experience.depth);
  }

  return lines.join("\n");
}

/**
 * Format project content for LLM context
 */
function formatProjectSection(project: ProjectContent): string {
  const lines = [
    `## ${project.title}`,
    `Description: ${project.description}`,
    `Technologies: ${project.technologies.join(", ")}`,
  ];

  if (project.details) {
    lines.push("", "### Details", project.details);
  }

  return lines.join("\n");
}

/**
 * Format skills content for LLM context
 */
function formatSkillsSection(skills: SkillContent[]): string {
  return skills
    .map((category) => {
      const skillLines = category.skills
        .map((skill) => {
          const parts = [`- ${skill.name} (${skill.level})`];
          if (skill.context) {
            parts.push(`: ${skill.context}`);
          }
          return parts.join("");
        })
        .join("\n");

      return `## ${category.category}\n${skillLines}`;
    })
    .join("\n\n");
}

/**
 * Format about content for LLM context
 */
function formatAboutSection(about: AboutContent): string {
  return [
    `## About ${PORTFOLIO_OWNER.name}`,
    `Headline: ${about.headline}`,
    `Bio: ${about.bio}`,
    `Value Proposition: ${about.valueProposition}`,
  ].join("\n");
}

/**
 * Compile all knowledge content into a format suitable for LLM prompt
 * @param knowledge - The loaded knowledge content
 * @returns Compiled knowledge with system prompt and context sections
 */
export function compileKnowledgeContext(
  knowledge: KnowledgeContent
): CompiledKnowledge {
  const contextSections: ContextSection[] = [];

  // Add about section (highest priority)
  if (knowledge.about.headline || knowledge.about.bio) {
    contextSections.push({
      type: "about",
      title: "About",
      content: formatAboutSection(knowledge.about),
      priority: 10,
    });
  }

  // Add experience sections (high priority)
  knowledge.experiences.forEach((exp, index) => {
    contextSections.push({
      type: "experience",
      title: `Experience: ${exp.role} at ${exp.company}`,
      content: formatExperienceSection(exp),
      priority: 9 - index * 0.1, // Slightly decrease priority for older experiences
    });
  });

  // Add project sections (medium-high priority)
  knowledge.projects.forEach((proj, index) => {
    contextSections.push({
      type: "project",
      title: `Project: ${proj.title}`,
      content: formatProjectSection(proj),
      priority: 7 - index * 0.1,
    });
  });

  // Add skills section (medium priority)
  if (knowledge.skills.length > 0) {
    contextSections.push({
      type: "skill",
      title: "Skills & Expertise",
      content: formatSkillsSection(knowledge.skills),
      priority: 6,
    });
  }

  // Add raw knowledge sections (lower priority but still valuable)
  knowledge.rawKnowledge.forEach((content, index) => {
    contextSections.push({
      type: "raw",
      title: `Additional Knowledge ${index + 1}`,
      content,
      priority: 5 - index * 0.1,
    });
  });

  // Sort by priority (highest first)
  contextSections.sort((a, b) => b.priority - a.priority);

  // Build the full context string
  const contextString = contextSections
    .map((section) => section.content)
    .join("\n\n---\n\n");

  // Build system prompt using the template
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace(/{ownerName}/g, PORTFOLIO_OWNER.name)
    .replace(/{ownerRole}/g, PORTFOLIO_OWNER.role)
    .replace(/{ownerEmployer}/g, PORTFOLIO_OWNER.employer)
    .replace("{context}", contextString);

  // Estimate total tokens
  const totalTokenEstimate = estimateTokens(systemPrompt);

  return {
    systemPrompt,
    contextSections,
    totalTokenEstimate,
  };
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Load and compile all knowledge in one step
 * This is the main entry point for the API route
 */
export async function loadAndCompileKnowledge(): Promise<CompiledKnowledge> {
  const knowledge = await loadAllContent();
  return compileKnowledgeContext(knowledge);
}

/**
 * Load context relevant to a specific query
 * For now, this returns all context. Future enhancement could implement
 * semantic search to return only relevant sections.
 * @param query - The user's question (currently unused)
 * @returns Formatted context string
 */
export async function loadRelevantContext(query: string): Promise<string> {
  const compiled = await loadAndCompileKnowledge();
  return compiled.systemPrompt;
}

// =============================================================================
// Knowledge Loader Interface Implementation
// =============================================================================

/**
 * Knowledge loader implementation matching the KnowledgeLoader interface
 */
export const knowledgeLoader = {
  loadAllContent,
  loadRelevantContext,
};

export default knowledgeLoader;
