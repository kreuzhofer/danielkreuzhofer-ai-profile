/**
 * Transparency Dashboard Loader Utility
 *
 * This module provides utilities for loading skill data from MDX content files
 * and transforming it into the Transparency Dashboard format with three tiers:
 * Core Strengths, Working Knowledge, and Explicit Gaps.
 *
 * @see Requirements 9.1, 9.2, 9.6
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  Skill,
  SkillTier,
  ExplicitGap,
  Evidence,
} from "@/types/transparency-dashboard";
import { SKILL_LEVEL_TO_TIER } from "@/types/transparency-dashboard";

// Content directory path
const CONTENT_DIR = path.join(process.cwd(), "content");

// =============================================================================
// MDX Frontmatter Types
// =============================================================================

/**
 * Evidence configuration in MDX frontmatter
 */
interface EvidenceConfig {
  type: "project" | "experience" | "certification";
  title: string;
  reference: string;
  excerpt?: string;
}

/**
 * Skill configuration in MDX frontmatter
 */
interface SkillConfig {
  name: string;
  level: "expert" | "proficient" | "learning" | "familiar";
  yearsOfExperience?: number;
  context?: string;
  evidence?: EvidenceConfig[];
}

/**
 * Skill category in MDX frontmatter
 */
interface SkillCategoryConfig {
  id: string;
  name: string;
  description: string;
  order: number;
  skills: SkillConfig[];
}

/**
 * Explicit gap configuration in MDX frontmatter
 */
interface ExplicitGapConfig {
  name: string;
  explanation: string;
  alternativeFocus?: string;
}

/**
 * Skills MDX frontmatter structure
 */
interface SkillsMDXFrontmatter {
  categories?: SkillCategoryConfig[];
  gaps?: ExplicitGapConfig[];
}

// =============================================================================
// Result Types
// =============================================================================

/**
 * Result of loading skills from MDX
 */
export interface LoadSkillsResult {
  skills: Skill[];
  gaps: ExplicitGap[];
  error?: string;
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validates that a skill object has all required fields
 * Core strengths must have at least one evidence item
 *
 * @param skill - The skill object to validate
 * @returns True if the skill is valid
 */
export const validateSkill = (skill: unknown): skill is Skill => {
  if (!skill || typeof skill !== "object") return false;
  const s = skill as Record<string, unknown>;

  // Required fields
  if (typeof s.name !== "string" || s.name.trim() === "") return false;
  if (typeof s.context !== "string") return false;

  // Tier validation
  const validTiers: SkillTier[] = [
    "core_strength",
    "working_knowledge",
    "explicit_gap",
  ];
  if (!validTiers.includes(s.tier as SkillTier)) return false;

  // Core strengths must have evidence
  if (s.tier === "core_strength") {
    if (!Array.isArray(s.evidence) || s.evidence.length === 0) return false;
  }

  return true;
};

/**
 * Validates that a gap object has all required fields
 *
 * @param gap - The gap object to validate
 * @returns True if the gap is valid
 */
export const validateGap = (gap: unknown): gap is ExplicitGap => {
  if (!gap || typeof gap !== "object") return false;
  const g = gap as Record<string, unknown>;

  if (typeof g.name !== "string" || g.name.trim() === "") return false;
  if (typeof g.explanation !== "string" || g.explanation.trim() === "")
    return false;

  return true;
};

// =============================================================================
// Mapping Functions
// =============================================================================

/**
 * Maps a skill level string to a SkillTier
 * - expert → core_strength
 * - proficient → working_knowledge
 * - learning → working_knowledge
 * - familiar → working_knowledge
 * - gap → explicit_gap
 *
 * @param level - The skill level from MDX
 * @returns The corresponding SkillTier
 */
export const mapLevelToTier = (level: string): SkillTier => {
  const tier = SKILL_LEVEL_TO_TIER[level.toLowerCase()];
  return tier || "working_knowledge"; // Default to working_knowledge for unknown levels
};

/**
 * Generates a unique ID for a skill based on category and name
 *
 * @param categoryId - The category ID
 * @param skillName - The skill name
 * @returns A unique skill ID
 */
const generateSkillId = (categoryId: string, skillName: string): string => {
  const normalizedName = skillName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${categoryId}-${normalizedName}`;
};

/**
 * Generates a unique ID for an evidence item
 *
 * @param skillId - The parent skill ID
 * @param index - The evidence index
 * @returns A unique evidence ID
 */
const generateEvidenceId = (skillId: string, index: number): string => {
  return `${skillId}-evidence-${index}`;
};

/**
 * Generates a unique ID for a gap
 *
 * @param gapName - The gap name
 * @returns A unique gap ID
 */
const generateGapId = (gapName: string): string => {
  const normalizedName = gapName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `gap-${normalizedName}`;
};

// =============================================================================
// Transformation Functions
// =============================================================================

/**
 * Transforms evidence configuration to Evidence type
 *
 * @param config - The evidence configuration from MDX
 * @param skillId - The parent skill ID
 * @param index - The evidence index
 * @returns The transformed Evidence object
 */
const transformEvidence = (
  config: EvidenceConfig,
  skillId: string,
  index: number
): Evidence => {
  return {
    id: generateEvidenceId(skillId, index),
    type: config.type,
    title: config.title || "",
    reference: config.reference || "",
    excerpt: config.excerpt,
  };
};

/**
 * Transforms a skill configuration to a Skill type
 *
 * @param config - The skill configuration from MDX
 * @param categoryId - The category ID
 * @param categoryName - The category name
 * @returns The transformed Skill object or null if invalid
 */
const transformSkill = (
  config: SkillConfig,
  categoryId: string,
  categoryName: string
): Skill | null => {
  // Skip skills without a name
  if (!config.name || typeof config.name !== "string") {
    return null;
  }

  const skillId = generateSkillId(categoryId, config.name);
  const tier = mapLevelToTier(config.level || "proficient");

  // Transform evidence if present
  const evidence: Evidence[] = Array.isArray(config.evidence)
    ? config.evidence
        .map((e, index) => transformEvidence(e, skillId, index))
        .filter((e) => e.title && e.reference) // Filter out invalid evidence
    : [];

  const skill: Skill = {
    id: skillId,
    name: config.name.trim(),
    tier,
    context: config.context || "",
    category: categoryName,
    evidence,
  };

  // Add years of experience if present
  if (
    typeof config.yearsOfExperience === "number" &&
    config.yearsOfExperience > 0
  ) {
    skill.yearsOfExperience = config.yearsOfExperience;
  }

  return skill;
};

/**
 * Transforms a gap configuration to an ExplicitGap type
 *
 * @param config - The gap configuration from MDX
 * @returns The transformed ExplicitGap object or null if invalid
 */
const transformGap = (config: ExplicitGapConfig): ExplicitGap | null => {
  // Skip gaps without required fields
  if (
    !config.name ||
    typeof config.name !== "string" ||
    !config.explanation ||
    typeof config.explanation !== "string"
  ) {
    return null;
  }

  const gap: ExplicitGap = {
    id: generateGapId(config.name),
    name: config.name.trim(),
    explanation: config.explanation.trim(),
  };

  // Add alternative focus if present
  if (config.alternativeFocus && typeof config.alternativeFocus === "string") {
    gap.alternativeFocus = config.alternativeFocus.trim();
  }

  return gap;
};

// =============================================================================
// Main Loading Functions
// =============================================================================

/**
 * Loads and parses the skills.mdx file
 *
 * @returns The parsed frontmatter or null if file doesn't exist or is invalid
 */
const loadSkillsMDX = (): SkillsMDXFrontmatter | null => {
  const filePath = path.join(CONTENT_DIR, "skills.mdx");

  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);
    return data as SkillsMDXFrontmatter;
  } catch {
    return null;
  }
};

/**
 * Loads skills from skills.mdx and transforms them to the Transparency Dashboard format
 *
 * Maps skill levels to tiers:
 * - expert → core_strength
 * - proficient → working_knowledge
 * - learning → working_knowledge
 * - familiar → working_knowledge
 *
 * @returns LoadSkillsResult with skills array, gaps array, and optional error
 * @see Requirements 9.1, 9.2, 9.6
 */
export const loadSkills = (): LoadSkillsResult => {
  const frontmatter = loadSkillsMDX();

  // Handle missing file gracefully
  if (!frontmatter) {
    return {
      skills: [],
      gaps: [],
      error: "Skills content file not found or could not be parsed",
    };
  }

  const skills: Skill[] = [];
  const gaps: ExplicitGap[] = [];

  // Process categories and skills
  if (Array.isArray(frontmatter.categories)) {
    for (const category of frontmatter.categories) {
      // Skip invalid categories
      if (!category || !category.id || !Array.isArray(category.skills)) {
        continue;
      }

      const categoryId = category.id;
      const categoryName = category.name || categoryId;

      for (const skillConfig of category.skills) {
        const skill = transformSkill(skillConfig, categoryId, categoryName);
        if (skill) {
          skills.push(skill);
        }
      }
    }
  }

  // Process explicit gaps
  if (Array.isArray(frontmatter.gaps)) {
    for (const gapConfig of frontmatter.gaps) {
      const gap = transformGap(gapConfig);
      if (gap) {
        gaps.push(gap);
      }
    }
  }

  return {
    skills,
    gaps,
  };
};

/**
 * Loads explicit gaps from skills.mdx
 *
 * @returns Array of ExplicitGap objects
 * @see Requirement 9.4
 */
export const loadExplicitGaps = (): ExplicitGap[] => {
  const result = loadSkills();
  return result.gaps;
};

/**
 * Loads skills filtered by tier
 *
 * @param tier - The tier to filter by
 * @returns Array of Skill objects matching the tier
 */
export const loadSkillsByTier = (tier: SkillTier): Skill[] => {
  const result = loadSkills();
  return result.skills.filter((skill) => skill.tier === tier);
};

/**
 * Async wrapper for loadSkills for use in async contexts
 *
 * @returns Promise resolving to LoadSkillsResult
 */
export const loadSkillsAsync = async (): Promise<LoadSkillsResult> => {
  return loadSkills();
};

// =============================================================================
// Transparency Dashboard Loader Interface
// =============================================================================

/**
 * Transparency dashboard loader implementation
 */
export const transparencyDashboardLoader = {
  loadSkills,
  loadSkillsAsync,
  loadExplicitGaps,
  loadSkillsByTier,
  mapLevelToTier,
  validateSkill,
  validateGap,
};

export default transparencyDashboardLoader;
