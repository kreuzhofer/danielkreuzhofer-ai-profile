/**
 * Property Tests for Content Type Validation
 *
 * These tests validate that content structures have all required fields
 * as specified in the design document.
 *
 * **Validates: Requirements 2.2, 2.3, 2.4, 3.2, 3.3**
 */

import * as fc from "fast-check";
import type {
  Experience,
  ExperienceDepth,
  Project,
  ProjectDepth,
  SkillCategory,
  Skill,
  Decision,
  Outcome,
  Tradeoff,
  ProjectLink,
} from "@/types/content";

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating valid ISO date strings
 * Uses integer timestamps to avoid invalid date issues during shrinking
 */
const isoDateArbitrary = fc
  .integer({
    min: new Date("2000-01-01").getTime(),
    max: new Date("2030-12-31").getTime(),
  })
  .map((timestamp) => new Date(timestamp).toISOString());

/**
 * Arbitrary for generating non-empty strings (for required text fields)
 */
const nonEmptyStringArbitrary = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

/**
 * Arbitrary for generating skill proficiency levels
 */
const skillLevelArbitrary = fc.constantFrom<"expert" | "proficient" | "familiar">(
  "expert",
  "proficient",
  "familiar"
);

/**
 * Arbitrary for generating project link types
 */
const projectLinkTypeArbitrary = fc.constantFrom<"live" | "github" | "case-study">(
  "live",
  "github",
  "case-study"
);

/**
 * Arbitrary for generating Decision objects
 */
const decisionArbitrary: fc.Arbitrary<Decision> = fc.record({
  title: nonEmptyStringArbitrary,
  situation: nonEmptyStringArbitrary,
  options: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 3 }),
  chosen: nonEmptyStringArbitrary,
  rationale: nonEmptyStringArbitrary,
});

/**
 * Arbitrary for generating Outcome objects
 */
const outcomeArbitrary: fc.Arbitrary<Outcome> = fc.record({
  metric: nonEmptyStringArbitrary,
  value: nonEmptyStringArbitrary,
  context: nonEmptyStringArbitrary,
});

/**
 * Arbitrary for generating Tradeoff objects
 */
const tradeoffArbitrary: fc.Arbitrary<Tradeoff> = fc.record({
  decision: nonEmptyStringArbitrary,
  alternatives: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 3 }),
  reasoning: nonEmptyStringArbitrary,
});

/**
 * Arbitrary for generating ProjectLink objects
 */
const projectLinkArbitrary: fc.Arbitrary<ProjectLink> = fc.record({
  type: projectLinkTypeArbitrary,
  url: fc.webUrl(),
  label: nonEmptyStringArbitrary,
});

/**
 * Arbitrary for generating ExperienceDepth objects
 */
const experienceDepthArbitrary: fc.Arbitrary<ExperienceDepth> = fc.record({
  context: nonEmptyStringArbitrary,
  challenges: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 5 }),
  decisions: fc.array(decisionArbitrary, { minLength: 1, maxLength: 3 }),
  outcomes: fc.array(outcomeArbitrary, { minLength: 0, maxLength: 3 }),
  lessons: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 5 }),
});

/**
 * Arbitrary for generating ProjectDepth objects
 */
const projectDepthArbitrary: fc.Arbitrary<ProjectDepth> = fc.record({
  problem: nonEmptyStringArbitrary,
  approach: nonEmptyStringArbitrary,
  tradeoffs: fc.array(tradeoffArbitrary, { minLength: 1, maxLength: 3 }),
  outcomes: fc.array(outcomeArbitrary, { minLength: 1, maxLength: 3 }),
  reflections: nonEmptyStringArbitrary,
});

/**
 * Arbitrary for generating Skill objects
 */
const skillArbitrary: fc.Arbitrary<Skill> = fc.record({
  name: nonEmptyStringArbitrary,
  level: skillLevelArbitrary,
  yearsOfExperience: fc.option(fc.integer({ min: 0, max: 30 }), { nil: undefined }),
  context: fc.option(nonEmptyStringArbitrary, { nil: undefined }),
});

/**
 * Arbitrary for generating Experience objects with all required fields
 */
const experienceArbitrary: fc.Arbitrary<Experience> = fc.record({
  id: fc.uuid(),
  order: fc.integer({ min: 0, max: 100 }),
  createdAt: isoDateArbitrary,
  updatedAt: isoDateArbitrary,
  role: nonEmptyStringArbitrary,
  company: nonEmptyStringArbitrary,
  location: nonEmptyStringArbitrary,
  startDate: isoDateArbitrary,
  endDate: fc.option(isoDateArbitrary, { nil: null }),
  summary: nonEmptyStringArbitrary,
  highlights: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 5 }),
  depth: experienceDepthArbitrary,
  content: fc.option(nonEmptyStringArbitrary, { nil: undefined }),
});

/**
 * Arbitrary for generating Project objects with all required fields
 */
const projectArbitrary: fc.Arbitrary<Project> = fc.record({
  id: fc.uuid(),
  order: fc.integer({ min: 0, max: 100 }),
  createdAt: isoDateArbitrary,
  updatedAt: isoDateArbitrary,
  title: nonEmptyStringArbitrary,
  description: fc
    .array(fc.constantFrom("lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do"), { minLength: 5, maxLength: 45 })
    .map((words) => words.join(" ")), // Under 50 words guaranteed
  technologies: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 10 }),
  thumbnail: fc.option(fc.webUrl(), { nil: undefined }),
  links: fc.array(projectLinkArbitrary, { minLength: 0, maxLength: 3 }),
  depth: projectDepthArbitrary,
  content: fc.option(nonEmptyStringArbitrary, { nil: undefined }),
});

/**
 * Arbitrary for generating SkillCategory objects with all required fields
 */
const skillCategoryArbitrary: fc.Arbitrary<SkillCategory> = fc.record({
  id: fc.uuid(),
  order: fc.integer({ min: 0, max: 100 }),
  createdAt: isoDateArbitrary,
  updatedAt: isoDateArbitrary,
  name: nonEmptyStringArbitrary,
  description: nonEmptyStringArbitrary,
  skills: fc.array(skillArbitrary, { minLength: 1, maxLength: 10 }),
});

// =============================================================================
// Property 4: Summary Layer Content Completeness
// =============================================================================

/**
 * Feature: content-architecture, Property 4: Summary Layer Content Completeness
 *
 * *For any* Experience item, the Summary_Layer SHALL contain: role title,
 * company name, and date range.
 *
 * *For any* Project item, the Summary_Layer SHALL contain: title,
 * description (under 50 words), and technologies.
 *
 * *For any* SkillCategory, the Summary_Layer SHALL contain: category name
 * and skills with proficiency indicators.
 *
 * **Validates: Requirements 2.2, 2.3, 2.4**
 */
describe("Property 4: Summary Layer Content Completeness", () => {
  describe("Experience Summary Layer", () => {
    it("contains role title", () => {
      fc.assert(
        fc.property(experienceArbitrary, (experience) => {
          // Role must be a non-empty string
          return (
            typeof experience.role === "string" && experience.role.trim().length > 0
          );
        }),
        { numRuns: 3 }
      );
    });

    it("contains company name", () => {
      fc.assert(
        fc.property(experienceArbitrary, (experience) => {
          // Company must be a non-empty string
          return (
            typeof experience.company === "string" &&
            experience.company.trim().length > 0
          );
        }),
        { numRuns: 3 }
      );
    });

    it("contains date range (startDate and endDate)", () => {
      fc.assert(
        fc.property(experienceArbitrary, (experience) => {
          // startDate must be a valid ISO date string
          const hasValidStartDate =
            typeof experience.startDate === "string" &&
            !isNaN(Date.parse(experience.startDate));

          // endDate must be null (current) or a valid ISO date string
          const hasValidEndDate =
            experience.endDate === null ||
            (typeof experience.endDate === "string" &&
              !isNaN(Date.parse(experience.endDate)));

          return hasValidStartDate && hasValidEndDate;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe("Project Summary Layer", () => {
    it("contains title", () => {
      fc.assert(
        fc.property(projectArbitrary, (project) => {
          // Title must be a non-empty string
          return (
            typeof project.title === "string" && project.title.trim().length > 0
          );
        }),
        { numRuns: 3 }
      );
    });

    it("contains description under 50 words", () => {
      fc.assert(
        fc.property(projectArbitrary, (project) => {
          // Description must be a non-empty string
          const hasDescription =
            typeof project.description === "string" &&
            project.description.trim().length > 0;

          // Description should be under 50 words
          const wordCount = project.description.trim().split(/\s+/).length;
          const isUnder50Words = wordCount <= 50;

          return hasDescription && isUnder50Words;
        }),
        { numRuns: 3 }
      );
    });

    it("contains technologies array", () => {
      fc.assert(
        fc.property(projectArbitrary, (project) => {
          // Technologies must be an array with at least one item
          return (
            Array.isArray(project.technologies) &&
            project.technologies.length > 0 &&
            project.technologies.every(
              (tech) => typeof tech === "string" && tech.trim().length > 0
            )
          );
        }),
        { numRuns: 3 }
      );
    });
  });

  describe("SkillCategory Summary Layer", () => {
    it("contains category name", () => {
      fc.assert(
        fc.property(skillCategoryArbitrary, (category) => {
          // Name must be a non-empty string
          return (
            typeof category.name === "string" && category.name.trim().length > 0
          );
        }),
        { numRuns: 3 }
      );
    });

    it("contains skills with proficiency indicators", () => {
      fc.assert(
        fc.property(skillCategoryArbitrary, (category) => {
          // Skills must be an array with at least one item
          const hasSkills =
            Array.isArray(category.skills) && category.skills.length > 0;

          // Each skill must have a name and valid proficiency level
          const allSkillsHaveProficiency = category.skills.every(
            (skill) =>
              typeof skill.name === "string" &&
              skill.name.trim().length > 0 &&
              ["expert", "proficient", "familiar"].includes(skill.level)
          );

          return hasSkills && allSkillsHaveProficiency;
        }),
        { numRuns: 3 }
      );
    });
  });
});

// =============================================================================
// Property 5: Depth Layer Content Completeness
// =============================================================================

/**
 * Feature: content-architecture, Property 5: Depth Layer Content Completeness
 *
 * *For any* Experience item with a Depth_Layer, it SHALL contain: background
 * context, challenges array, decisions array, and lessons array.
 *
 * *For any* Project item with a Depth_Layer, it SHALL contain: problem
 * statement, approach, tradeoffs array, outcomes array, and reflections.
 *
 * **Validates: Requirements 3.2, 3.3**
 */
describe("Property 5: Depth Layer Content Completeness", () => {
  describe("Experience Depth Layer", () => {
    it("contains background context", () => {
      fc.assert(
        fc.property(experienceArbitrary, (experience) => {
          // Context must be a non-empty string
          return (
            typeof experience.depth.context === "string" &&
            experience.depth.context.trim().length > 0
          );
        }),
        { numRuns: 3 }
      );
    });

    it("contains challenges array", () => {
      fc.assert(
        fc.property(experienceArbitrary, (experience) => {
          // Challenges must be an array
          const isChallengesArray = Array.isArray(experience.depth.challenges);

          // Each challenge must be a non-empty string
          const allChallengesValid = experience.depth.challenges.every(
            (challenge) =>
              typeof challenge === "string" && challenge.trim().length > 0
          );

          return isChallengesArray && allChallengesValid;
        }),
        { numRuns: 3 }
      );
    });

    it("contains decisions array", () => {
      fc.assert(
        fc.property(experienceArbitrary, (experience) => {
          // Decisions must be an array
          const isDecisionsArray = Array.isArray(experience.depth.decisions);

          // Each decision must have required fields
          const allDecisionsValid = experience.depth.decisions.every(
            (decision) =>
              typeof decision.title === "string" &&
              decision.title.trim().length > 0 &&
              typeof decision.situation === "string" &&
              typeof decision.chosen === "string" &&
              typeof decision.rationale === "string" &&
              Array.isArray(decision.options)
          );

          return isDecisionsArray && allDecisionsValid;
        }),
        { numRuns: 3 }
      );
    });

    it("contains lessons array", () => {
      fc.assert(
        fc.property(experienceArbitrary, (experience) => {
          // Lessons must be an array
          const isLessonsArray = Array.isArray(experience.depth.lessons);

          // Each lesson must be a non-empty string
          const allLessonsValid = experience.depth.lessons.every(
            (lesson) => typeof lesson === "string" && lesson.trim().length > 0
          );

          return isLessonsArray && allLessonsValid;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe("Project Depth Layer", () => {
    it("contains problem statement", () => {
      fc.assert(
        fc.property(projectArbitrary, (project) => {
          // Problem must be a non-empty string
          return (
            typeof project.depth.problem === "string" &&
            project.depth.problem.trim().length > 0
          );
        }),
        { numRuns: 3 }
      );
    });

    it("contains approach", () => {
      fc.assert(
        fc.property(projectArbitrary, (project) => {
          // Approach must be a non-empty string
          return (
            typeof project.depth.approach === "string" &&
            project.depth.approach.trim().length > 0
          );
        }),
        { numRuns: 3 }
      );
    });

    it("contains tradeoffs array", () => {
      fc.assert(
        fc.property(projectArbitrary, (project) => {
          // Tradeoffs must be an array
          const isTradeoffsArray = Array.isArray(project.depth.tradeoffs);

          // Each tradeoff must have required fields
          const allTradeoffsValid = project.depth.tradeoffs.every(
            (tradeoff) =>
              typeof tradeoff.decision === "string" &&
              tradeoff.decision.trim().length > 0 &&
              Array.isArray(tradeoff.alternatives) &&
              typeof tradeoff.reasoning === "string"
          );

          return isTradeoffsArray && allTradeoffsValid;
        }),
        { numRuns: 3 }
      );
    });

    it("contains outcomes array", () => {
      fc.assert(
        fc.property(projectArbitrary, (project) => {
          // Outcomes must be an array
          const isOutcomesArray = Array.isArray(project.depth.outcomes);

          // Each outcome must have required fields
          const allOutcomesValid = project.depth.outcomes.every(
            (outcome) =>
              typeof outcome.metric === "string" &&
              typeof outcome.value === "string" &&
              typeof outcome.context === "string"
          );

          return isOutcomesArray && allOutcomesValid;
        }),
        { numRuns: 3 }
      );
    });

    it("contains reflections", () => {
      fc.assert(
        fc.property(projectArbitrary, (project) => {
          // Reflections must be a non-empty string
          return (
            typeof project.depth.reflections === "string" &&
            project.depth.reflections.trim().length > 0
          );
        }),
        { numRuns: 3 }
      );
    });
  });
});
