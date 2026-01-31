/**
 * Transparency Dashboard Loader Tests
 *
 * Unit tests for the transparency dashboard loader utility.
 * Tests skill loading, tier mapping, and graceful error handling.
 *
 * @see Requirements 9.1, 9.2, 9.6
 */

import {
  mapLevelToTier,
  validateSkill,
  validateGap,
  loadSkills,
} from "./transparency-dashboard-loader";
import type { Skill, ExplicitGap } from "@/types/transparency-dashboard";

// =============================================================================
// mapLevelToTier Tests
// =============================================================================

describe("mapLevelToTier", () => {
  it("maps 'expert' to 'core_strength'", () => {
    expect(mapLevelToTier("expert")).toBe("core_strength");
  });

  it("maps 'proficient' to 'working_knowledge'", () => {
    expect(mapLevelToTier("proficient")).toBe("working_knowledge");
  });

  it("maps 'learning' to 'working_knowledge'", () => {
    expect(mapLevelToTier("learning")).toBe("working_knowledge");
  });

  it("maps 'familiar' to 'working_knowledge'", () => {
    expect(mapLevelToTier("familiar")).toBe("working_knowledge");
  });

  it("maps 'gap' to 'explicit_gap'", () => {
    expect(mapLevelToTier("gap")).toBe("explicit_gap");
  });

  it("handles case-insensitive input", () => {
    expect(mapLevelToTier("EXPERT")).toBe("core_strength");
    expect(mapLevelToTier("Proficient")).toBe("working_knowledge");
  });

  it("defaults unknown levels to 'working_knowledge'", () => {
    expect(mapLevelToTier("unknown")).toBe("working_knowledge");
    expect(mapLevelToTier("")).toBe("working_knowledge");
  });
});

// =============================================================================
// validateSkill Tests
// =============================================================================

describe("validateSkill", () => {
  const validCoreStrength: Skill = {
    id: "test-skill",
    name: "Test Skill",
    tier: "core_strength",
    context: "Test context",
    category: "test",
    evidence: [
      {
        id: "evidence-1",
        type: "project",
        title: "Test Project",
        reference: "/projects/test",
      },
    ],
  };

  const validWorkingKnowledge: Skill = {
    id: "test-skill-2",
    name: "Test Skill 2",
    tier: "working_knowledge",
    context: "Test context",
    category: "test",
    evidence: [],
  };

  it("validates a valid core_strength skill with evidence", () => {
    expect(validateSkill(validCoreStrength)).toBe(true);
  });

  it("validates a valid working_knowledge skill without evidence", () => {
    expect(validateSkill(validWorkingKnowledge)).toBe(true);
  });

  it("rejects core_strength skill without evidence", () => {
    const invalidSkill = {
      ...validCoreStrength,
      evidence: [],
    };
    expect(validateSkill(invalidSkill)).toBe(false);
  });

  it("rejects skill with empty name", () => {
    const invalidSkill = {
      ...validWorkingKnowledge,
      name: "",
    };
    expect(validateSkill(invalidSkill)).toBe(false);
  });

  it("rejects skill with whitespace-only name", () => {
    const invalidSkill = {
      ...validWorkingKnowledge,
      name: "   ",
    };
    expect(validateSkill(invalidSkill)).toBe(false);
  });

  it("rejects skill with invalid tier", () => {
    const invalidSkill = {
      ...validWorkingKnowledge,
      tier: "invalid_tier",
    };
    expect(validateSkill(invalidSkill)).toBe(false);
  });

  it("rejects null input", () => {
    expect(validateSkill(null)).toBe(false);
  });

  it("rejects undefined input", () => {
    expect(validateSkill(undefined)).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(validateSkill("string")).toBe(false);
    expect(validateSkill(123)).toBe(false);
  });
});

// =============================================================================
// validateGap Tests
// =============================================================================

describe("validateGap", () => {
  const validGap: ExplicitGap = {
    id: "test-gap",
    name: "Test Gap",
    explanation: "Chose to focus on other areas",
  };

  it("validates a valid gap", () => {
    expect(validateGap(validGap)).toBe(true);
  });

  it("validates a gap with alternativeFocus", () => {
    const gapWithAlternative = {
      ...validGap,
      alternativeFocus: "Alternative focus area",
    };
    expect(validateGap(gapWithAlternative)).toBe(true);
  });

  it("rejects gap with empty name", () => {
    const invalidGap = {
      ...validGap,
      name: "",
    };
    expect(validateGap(invalidGap)).toBe(false);
  });

  it("rejects gap with whitespace-only name", () => {
    const invalidGap = {
      ...validGap,
      name: "   ",
    };
    expect(validateGap(invalidGap)).toBe(false);
  });

  it("rejects gap with empty explanation", () => {
    const invalidGap = {
      ...validGap,
      explanation: "",
    };
    expect(validateGap(invalidGap)).toBe(false);
  });

  it("rejects gap with whitespace-only explanation", () => {
    const invalidGap = {
      ...validGap,
      explanation: "   ",
    };
    expect(validateGap(invalidGap)).toBe(false);
  });

  it("rejects null input", () => {
    expect(validateGap(null)).toBe(false);
  });

  it("rejects undefined input", () => {
    expect(validateGap(undefined)).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(validateGap("string")).toBe(false);
    expect(validateGap(123)).toBe(false);
  });
});

// =============================================================================
// loadSkills Integration Tests
// =============================================================================

describe("loadSkills", () => {
  it("loads skills from skills.mdx file", () => {
    const result = loadSkills();

    // Should not have an error when file exists
    expect(result.error).toBeUndefined();

    // Should have loaded some skills
    expect(result.skills.length).toBeGreaterThan(0);
  });

  it("maps expert skills to core_strength tier", () => {
    const result = loadSkills();
    const coreStrengths = result.skills.filter(
      (s) => s.tier === "core_strength"
    );

    // Should have some core strengths (expert level skills)
    expect(coreStrengths.length).toBeGreaterThan(0);
  });

  it("maps proficient skills to working_knowledge tier", () => {
    const result = loadSkills();
    const workingKnowledge = result.skills.filter(
      (s) => s.tier === "working_knowledge"
    );

    // Should have some working knowledge (proficient level skills)
    expect(workingKnowledge.length).toBeGreaterThan(0);
  });

  it("includes category information for each skill", () => {
    const result = loadSkills();

    for (const skill of result.skills) {
      expect(skill.category).toBeDefined();
      expect(typeof skill.category).toBe("string");
      expect(skill.category.length).toBeGreaterThan(0);
    }
  });

  it("includes context for each skill", () => {
    const result = loadSkills();

    for (const skill of result.skills) {
      expect(skill.context).toBeDefined();
      expect(typeof skill.context).toBe("string");
    }
  });

  it("generates unique IDs for each skill", () => {
    const result = loadSkills();
    const ids = result.skills.map((s) => s.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it("includes years of experience when available", () => {
    const result = loadSkills();
    const skillsWithYears = result.skills.filter(
      (s) => s.yearsOfExperience !== undefined
    );

    // Should have some skills with years of experience
    expect(skillsWithYears.length).toBeGreaterThan(0);

    for (const skill of skillsWithYears) {
      expect(typeof skill.yearsOfExperience).toBe("number");
      expect(skill.yearsOfExperience).toBeGreaterThan(0);
    }
  });

  it("returns empty gaps array when no gaps configured", () => {
    const result = loadSkills();

    // Gaps array should exist (may be empty if not configured)
    expect(Array.isArray(result.gaps)).toBe(true);
  });
});
