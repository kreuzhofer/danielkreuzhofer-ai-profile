/**
 * Transparency Dashboard Type Definitions
 *
 * These types define the structure of the Transparency Dashboard feature
 * which visualizes expertise across three tiers: Core Strengths, Working Knowledge,
 * and Explicit Gaps.
 *
 * Requirements: 1.1, 9.2
 */

// =============================================================================
// Skill Tier Types
// =============================================================================

/**
 * Skill tier classification for the transparency dashboard
 * - core_strength: Deep expertise with proven track record
 * - working_knowledge: Competent but not expert
 * - explicit_gap: Areas intentionally not pursued
 */
export type SkillTier = 'core_strength' | 'working_knowledge' | 'explicit_gap';

// =============================================================================
// Evidence Types
// =============================================================================

/**
 * Evidence supporting a skill claim
 * Links to projects, experiences, or certifications that validate expertise
 */
export interface Evidence {
  id: string;
  type: 'project' | 'experience' | 'certification';
  title: string;
  reference: string; // Path or ID to content (e.g., '/projects/portfolio-site')
  excerpt?: string; // Relevant quote or summary
}

// =============================================================================
// Skill Types
// =============================================================================

/**
 * Skill data model for the transparency dashboard
 * Represents a single skill with its tier classification and supporting evidence
 */
export interface Skill {
  id: string;
  name: string;
  tier: SkillTier;
  context: string; // Brief description of experience
  yearsOfExperience?: number;
  category: string;
  evidence: Evidence[];
}

// =============================================================================
// Explicit Gap Types
// =============================================================================

/**
 * Explicit gap representing an area intentionally not pursued
 * Signals focus rather than limitation
 */
export interface ExplicitGap {
  id: string;
  name: string;
  explanation: string; // Why this area was not pursued
  alternativeFocus?: string; // What was chosen instead
}

// =============================================================================
// Tier Configuration Types
// =============================================================================

/**
 * Visual styling configuration for a tier
 */
export interface TierStyling {
  cardSize: 'large' | 'medium' | 'small';
  emphasis: 'high' | 'medium' | 'low';
  colorScheme: string;
}

/**
 * Configuration for a skill tier's display properties
 * Controls visual hierarchy and presentation
 */
export interface TierConfig {
  id: SkillTier;
  title: string;
  description: string;
  styling: TierStyling;
}

/**
 * Tier configurations for visual hierarchy
 * Core strengths are most prominent, explicit gaps are subtle
 */
export const TIER_CONFIGS: Record<SkillTier, TierConfig> = {
  core_strength: {
    id: 'core_strength',
    title: 'Core Strengths',
    description: 'Deep expertise with proven track record',
    styling: {
      cardSize: 'large',
      emphasis: 'high',
      colorScheme: 'emerald', // Green tones for strength
    },
  },
  working_knowledge: {
    id: 'working_knowledge',
    title: 'Working Knowledge',
    description: 'Competent but not expert—honest about the difference',
    styling: {
      cardSize: 'medium',
      emphasis: 'medium',
      colorScheme: 'blue', // Neutral blue tones
    },
  },
  explicit_gap: {
    id: 'explicit_gap',
    title: 'Explicit Gaps',
    description: 'Areas intentionally not pursued—signals focus, not limitation',
    styling: {
      cardSize: 'small',
      emphasis: 'low',
      colorScheme: 'slate', // Subtle gray tones
    },
  },
};

// =============================================================================
// Skill Level Mapping
// =============================================================================

/**
 * Maps existing skill levels to transparency dashboard tiers
 * - expert → core_strength
 * - proficient → working_knowledge
 * - learning → working_knowledge
 * - gap → explicit_gap
 */
export const SKILL_LEVEL_TO_TIER: Record<string, SkillTier> = {
  expert: 'core_strength',
  proficient: 'working_knowledge',
  learning: 'working_knowledge',
  familiar: 'working_knowledge', // Map 'familiar' from existing Skill type
  gap: 'explicit_gap',
};

// =============================================================================
// Error Types
// =============================================================================

/**
 * Error types for dashboard operations
 */
export interface DashboardError {
  type: 'load_error' | 'content_error';
  message: string;
}

// =============================================================================
// Evidence Type Display Configuration
// =============================================================================

/**
 * Display configuration for evidence types
 */
export interface EvidenceTypeDisplay {
  label: string;
  icon: string;
}

/**
 * Evidence type display mapping for UI rendering
 */
export const EVIDENCE_TYPE_DISPLAY: Record<Evidence['type'], EvidenceTypeDisplay> = {
  project: { label: 'Project', icon: 'folder' },
  experience: { label: 'Experience', icon: 'briefcase' },
  certification: { label: 'Certification', icon: 'award' },
};
