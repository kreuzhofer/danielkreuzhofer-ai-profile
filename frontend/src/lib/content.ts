/**
 * Content Loader Utility
 *
 * This module provides utilities for loading and parsing MDX content files
 * with frontmatter support. It uses gray-matter for frontmatter parsing.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  About,
  BlogPost,
  BlogPostFrontmatter,
  Contact,
  Experience,
  ExperienceFrontmatter,
  Hero,
  Project,
  ProjectFrontmatter,
  SkillCategory,
} from "@/types/content";

// Content directory path
const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * Generic function to read and parse an MDX file with frontmatter
 */
export function parseMarkdownFile<T>(filePath: string): {
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

/**
 * Get the About section content
 */
export function getAbout(): About {
  const filePath = path.join(CONTENT_DIR, "about.mdx");
  const { frontmatter } = parseMarkdownFile<About>(filePath);
  return {
    headline: frontmatter.headline || "",
    bio: frontmatter.bio || "",
    valueProposition: frontmatter.valueProposition || "",
    profileImage: frontmatter.profileImage,
    socialLinks: frontmatter.socialLinks || [],
  };
}

/**
 * Get the Hero section content from about.mdx
 */
export function getHero(): Hero {
  const filePath = path.join(CONTENT_DIR, "about.mdx");
  const { frontmatter } = parseMarkdownFile<{ hero?: Hero }>(filePath);
  return {
    headline: frontmatter.hero?.headline || "Welcome",
    tagline: frontmatter.hero?.tagline || "",
    ctaText: frontmatter.hero?.ctaText || "Learn More",
    ctaHref: frontmatter.hero?.ctaHref || "#about",
  };
}

/**
 * Get all experience entries, sorted by order field
 */
export function getExperiences(): Experience[] {
  const experienceDir = path.join(CONTENT_DIR, "experience");

  if (!fs.existsSync(experienceDir)) {
    return [];
  }

  const files = fs
    .readdirSync(experienceDir)
    .filter((file) => file.endsWith(".mdx"));

  const experiences = files.map((file) => {
    const filePath = path.join(experienceDir, file);
    const { frontmatter, content } = parseMarkdownFile<ExperienceFrontmatter>(filePath);

    return {
      id: frontmatter.id || file.replace(".mdx", ""),
      order: frontmatter.order || 0,
      createdAt: frontmatter.createdAt || new Date().toISOString(),
      updatedAt: frontmatter.updatedAt || new Date().toISOString(),
      role: frontmatter.role || "",
      company: frontmatter.company || "",
      location: frontmatter.location || "",
      startDate: frontmatter.startDate || "",
      endDate: frontmatter.endDate || null,
      summary: frontmatter.summary || "",
      highlights: frontmatter.highlights || [],
      depth: frontmatter.depth || {
        context: "",
        challenges: [],
        decisions: [],
        outcomes: [],
        lessons: [],
      },
      content,
    } as Experience;
  });

  // Sort by order field (ascending - lower order values first)
  return experiences.sort((a, b) => a.order - b.order);
}

/**
 * Get all project entries, sorted by order field
 */
export function getProjects(): Project[] {
  const projectsDir = path.join(CONTENT_DIR, "projects");

  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  const files = fs
    .readdirSync(projectsDir)
    .filter((file) => file.endsWith(".mdx"));

  const projects = files.map((file) => {
    const filePath = path.join(projectsDir, file);
    const { frontmatter, content } = parseMarkdownFile<ProjectFrontmatter>(filePath);

    return {
      id: frontmatter.id || file.replace(".mdx", ""),
      order: frontmatter.order || 0,
      createdAt: frontmatter.createdAt || new Date().toISOString(),
      updatedAt: frontmatter.updatedAt || new Date().toISOString(),
      title: frontmatter.title || "",
      description: frontmatter.description || "",
      technologies: frontmatter.technologies || [],
      thumbnail: frontmatter.thumbnail,
      links: frontmatter.links || [],
      depth: frontmatter.depth || {
        problem: "",
        approach: "",
        tradeoffs: [],
        outcomes: [],
        reflections: "",
      },
      content,
    } as Project;
  });

  // Sort by order field (ascending - lower order values first)
  return projects.sort((a, b) => a.order - b.order);
}

/**
 * Get skill categories from skills.mdx
 */
export function getSkillCategories(): SkillCategory[] {
  const filePath = path.join(CONTENT_DIR, "skills.mdx");

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const { frontmatter } = parseMarkdownFile<{ categories: SkillCategory[] }>(
    filePath
  );
  return frontmatter.categories || [];
}

/**
 * Get contact information
 */
export function getContact(): Contact {
  const filePath = path.join(CONTENT_DIR, "contact.mdx");
  const { frontmatter } = parseMarkdownFile<Contact>(filePath);
  return {
    headline: frontmatter.headline || "",
    subtext: frontmatter.subtext || "",
    options: frontmatter.options || [],
  };
}

/**
 * Get all blog posts, sorted by date descending (newest first).
 * Skips files with missing required frontmatter fields.
 * Returns empty array if the blog content directory doesn't exist.
 */
export function getBlogPosts(): BlogPost[] {
  const blogDir = path.join(CONTENT_DIR, "blog");

  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith(".mdx"));

  const posts: BlogPost[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(blogDir, file);
      const { frontmatter, content } =
        parseMarkdownFile<BlogPostFrontmatter>(filePath);

      // Validate all required frontmatter fields are present
      if (
        !frontmatter.title ||
        !frontmatter.date ||
        !frontmatter.excerpt ||
        !Array.isArray(frontmatter.tags) ||
        !frontmatter.slug
      ) {
        continue;
      }

      posts.push({
        title: frontmatter.title,
        date: frontmatter.date,
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags,
        slug: frontmatter.slug,
        content,
      });
    } catch {
      // Skip files with malformed YAML or other parse errors
      continue;
    }
  }

  // Sort by date descending (newest first)
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get a single blog post by slug.
 * Returns undefined if no post matches the given slug.
 */
export function getBlogPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find((post) => post.slug === slug);
}

/**
 * Content loader interface implementation
 * Provides async wrappers for all content loading functions
 */
export const contentLoader = {
  getAbout: async (): Promise<About> => getAbout(),
  getHero: async (): Promise<Hero> => getHero(),
  getExperiences: async (): Promise<Experience[]> => getExperiences(),
  getProjects: async (): Promise<Project[]> => getProjects(),
  getSkillCategories: async (): Promise<SkillCategory[]> => getSkillCategories(),
  getContact: async (): Promise<Contact> => getContact(),
};

export default contentLoader;
