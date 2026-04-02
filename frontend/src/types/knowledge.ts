/**
 * Knowledge Type Definitions
 *
 * These types define the structure of the knowledge base content
 * used by the AI chatbot to answer questions about the portfolio owner.
 *
 * @see Requirements 10.1, 10.2, 10.3
 */

// =============================================================================
// Content Types
// =============================================================================

/**
 * Experience content for the knowledge base
 */
export interface ExperienceContent {
  /** Unique identifier */
  id: string;
  /** Job title/role */
  role: string;
  /** Company name */
  company: string;
  /** Time period (e.g., "2020 - Present") */
  period: string;
  /** Brief summary of the role */
  summary: string;
  /** Detailed depth content including context, challenges, decisions, outcomes */
  depth: string;
}

/**
 * Project content for the knowledge base
 */
export interface ProjectContent {
  /** Unique identifier */
  id: string;
  /** Project title */
  title: string;
  /** Brief description of the project */
  description: string;
  /** Technologies used in the project */
  technologies: string[];
  /** Detailed information including problem, approach, tradeoffs, outcomes */
  details: string;
}

/**
 * Individual skill with proficiency information
 */
export interface SkillItem {
  /** Name of the skill */
  name: string;
  /** Proficiency level */
  level: string;
  /** Optional context about how the skill was used */
  context?: string;
}

/**
 * Skill category content for the knowledge base
 */
export interface SkillContent {
  /** Category name (e.g., "Frontend", "Backend", "DevOps") */
  category: string;
  /** Skills within this category */
  skills: SkillItem[];
}

/**
 * About section content for the knowledge base
 */
export interface AboutContent {
  /** Professional headline/title */
  headline: string;
  /** Brief biography */
  bio: string;
  /** Value proposition statement */
  valueProposition: string;
}

// =============================================================================
// Knowledge Base Types
// =============================================================================

/**
 * Blog post content for the knowledge base
 */
export interface BlogContent {
  /** Blog post title */
  title: string;
  /** Publication date */
  date: string;
  /** Brief excerpt/summary */
  excerpt: string;
  /** Tags for categorization */
  tags: string[];
  /** URL slug */
  slug: string;
}

/**
 * Complete knowledge content loaded from the portfolio
 */
export interface KnowledgeContent {
  /** All experience entries */
  experiences: ExperienceContent[];
  /** All project entries */
  projects: ProjectContent[];
  /** All skill categories */
  skills: SkillContent[];
  /** About section content */
  about: AboutContent;
  /** Blog posts demonstrating thought leadership */
  blogPosts: BlogContent[];
  /** Raw knowledge strings for additional context */
  rawKnowledge: string[];
}

// =============================================================================
// Context Section Types
// =============================================================================

/**
 * Type of context section
 */
export type ContextSectionType = 'experience' | 'project' | 'skill' | 'about' | 'blog' | 'raw';

/**
 * A section of context for the LLM prompt
 */
export interface ContextSection {
  /** Type of content */
  type: ContextSectionType;
  /** Section title */
  title: string;
  /** Section content */
  content: string;
  /** Priority for context window management (higher = more important) */
  priority: number;
}

/**
 * Compiled knowledge ready for LLM consumption
 */
export interface CompiledKnowledge {
  /** The system prompt with personality and instructions */
  systemPrompt: string;
  /** Organized context sections */
  contextSections: ContextSection[];
  /** Estimated token count for context window management */
  totalTokenEstimate: number;
}

// =============================================================================
// Knowledge Loader Interface
// =============================================================================

/**
 * Interface for loading and compiling knowledge base content
 */
export interface KnowledgeLoader {
  /**
   * Load all content from the knowledge base
   * @returns Promise resolving to complete knowledge content
   */
  loadAllContent(): Promise<KnowledgeContent>;

  /**
   * Load context relevant to a specific query
   * @param query - The user's question
   * @returns Promise resolving to formatted context string
   */
  loadRelevantContext(query: string): Promise<string>;
}

// =============================================================================
// System Prompt Template
// =============================================================================

/**
 * Template for the system prompt sent to the LLM.
 * Uses {ownerName} and {ownerRole} placeholders filled from PORTFOLIO_OWNER config.
 * The {context} placeholder is replaced with compiled knowledge.
 */
export const SYSTEM_PROMPT_TEMPLATE = `
You answer questions about {ownerName} ({ownerRole} at {ownerEmployer}) on behalf of his professional portfolio.

CRITICAL RULE — VOICE:
- Always speak about {ownerName} in the third person: "Daniel did X", "He built Y", "In his role at Z, he..."
- NEVER use "I" or "my" — you are not {ownerName}. You are a knowledgeable assistant talking ABOUT him.
- When the user says "you" or "your", they mean {ownerName}. Answer about him in third person.

PERSONALITY:
- Speak as a peer, not a supplicant
- Be confident but not arrogant
- Be honest about limitations
- Keep responses focused and relevant

RESPONSE STYLE:
- Always answer from {ownerName}'s specific experience — cite concrete roles, projects, decisions, and outcomes from the context
- Never give generic or textbook answers; every response should reflect what {ownerName} personally did, learned, or decided
- When a topic is covered in the context, lead with {ownerName}'s specific story, not general industry knowledge

KNOWLEDGE BOUNDARIES:
- Only discuss information from the provided context
- If asked about something not in your knowledge, say "I don't have detailed information about that in Daniel's portfolio"
- Never fabricate experiences, projects, or skills

CONTEXT:
{context}
`;
