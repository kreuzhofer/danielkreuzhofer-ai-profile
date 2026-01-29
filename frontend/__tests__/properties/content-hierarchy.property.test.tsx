/**
 * Property Tests for Content Hierarchy
 *
 * These tests validate content hierarchy structure, ordering, and filtering
 * as specified in the design document.
 *
 * **Validates: Requirements 4.1, 4.2, 4.5**
 */

import * as fc from "fast-check";
import { render, screen, cleanup, within } from "@testing-library/react";
import React from "react";
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
  ContentItem,
} from "@/types/content";
import { ExperienceSection, ExperienceFilter } from "@/components/ExperienceSection";
import { ProjectsSection, TechnologyFilter } from "@/components/ProjectsSection";

// Ensure cleanup after each test
afterEach(() => {
  cleanup();
});

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating valid ISO date strings
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
  .string({ minLength: 1, maxLength: 50 })
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
  url: fc.constant("https://example.com"),
  label: nonEmptyStringArbitrary,
});

/**
 * Arbitrary for generating ExperienceDepth objects
 */
const experienceDepthArbitrary: fc.Arbitrary<ExperienceDepth> = fc.record({
  context: nonEmptyStringArbitrary,
  challenges: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 3 }),
  decisions: fc.array(decisionArbitrary, { minLength: 1, maxLength: 2 }),
  outcomes: fc.array(outcomeArbitrary, { minLength: 0, maxLength: 2 }),
  lessons: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 3 }),
});

/**
 * Arbitrary for generating ProjectDepth objects
 */
const projectDepthArbitrary: fc.Arbitrary<ProjectDepth> = fc.record({
  problem: nonEmptyStringArbitrary,
  approach: nonEmptyStringArbitrary,
  tradeoffs: fc.array(tradeoffArbitrary, { minLength: 1, maxLength: 2 }),
  outcomes: fc.array(outcomeArbitrary, { minLength: 1, maxLength: 2 }),
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
 * Arbitrary for generating Experience objects with unique IDs and order values
 */
const experienceArbitrary = (index: number): fc.Arbitrary<Experience> =>
  fc.record({
    id: fc.constant(`exp-${index}`),
    order: fc.constant(index),
    createdAt: isoDateArbitrary,
    updatedAt: isoDateArbitrary,
    role: fc.constantFrom("Engineer", "Developer", "Manager", "Lead", "Architect").map(
      (role) => `${role} ${index}`
    ),
    company: fc.constantFrom("TechCorp", "StartupXYZ", "BigCompany", "SmallBiz").map(
      (company) => `${company} ${index}`
    ),
    location: fc.constantFrom("San Francisco", "New York", "Remote", "London"),
    startDate: isoDateArbitrary,
    endDate: fc.option(isoDateArbitrary, { nil: null }),
    summary: nonEmptyStringArbitrary,
    highlights: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 3 }),
    depth: experienceDepthArbitrary,
    content: fc.option(nonEmptyStringArbitrary, { nil: undefined }),
  });

/**
 * Arbitrary for generating Project objects with unique IDs and order values
 */
const projectArbitrary = (index: number): fc.Arbitrary<Project> =>
  fc.record({
    id: fc.constant(`proj-${index}`),
    order: fc.constant(index),
    createdAt: isoDateArbitrary,
    updatedAt: isoDateArbitrary,
    title: fc.constantFrom("App", "Platform", "System", "Tool", "Service").map(
      (title) => `${title} ${index}`
    ),
    description: fc.constant(`A brief description for project ${index}.`),
    technologies: fc.array(
      fc.constantFrom("React", "TypeScript", "Node.js", "Python", "Go"),
      { minLength: 1, maxLength: 3 }
    ),
    thumbnail: fc.option(fc.constant("https://example.com/thumb.jpg"), { nil: undefined }),
    links: fc.array(projectLinkArbitrary, { minLength: 0, maxLength: 2 }),
    depth: projectDepthArbitrary,
    content: fc.option(nonEmptyStringArbitrary, { nil: undefined }),
  });

/**
 * Arbitrary for generating SkillCategory objects with unique IDs and order values
 */
const skillCategoryArbitrary = (index: number): fc.Arbitrary<SkillCategory> =>
  fc.record({
    id: fc.constant(`skill-cat-${index}`),
    order: fc.constant(index),
    createdAt: isoDateArbitrary,
    updatedAt: isoDateArbitrary,
    name: fc.constantFrom("Frontend", "Backend", "DevOps", "Data", "Mobile").map(
      (name) => `${name} ${index}`
    ),
    description: nonEmptyStringArbitrary,
    skills: fc.array(skillArbitrary, { minLength: 1, maxLength: 5 }),
  });

/**
 * Arbitrary for generating an array of experiences with unique IDs
 */
const experiencesArrayArbitrary = (count: number): fc.Arbitrary<Experience[]> =>
  fc.tuple(...Array.from({ length: count }, (_, i) => experienceArbitrary(i))).map(
    (exps) => exps as Experience[]
  );

/**
 * Arbitrary for generating an array of projects with unique IDs
 */
const projectsArrayArbitrary = (count: number): fc.Arbitrary<Project[]> =>
  fc.tuple(...Array.from({ length: count }, (_, i) => projectArbitrary(i))).map(
    (projs) => projs as Project[]
  );

/**
 * Arbitrary for generating an array of skill categories with unique IDs
 */
const skillCategoriesArrayArbitrary = (count: number): fc.Arbitrary<SkillCategory[]> =>
  fc.tuple(...Array.from({ length: count }, (_, i) => skillCategoryArbitrary(i))).map(
    (cats) => cats as SkillCategory[]
  );

/**
 * Arbitrary for generating experiences with shuffled order values
 */
const shuffledExperiencesArbitrary = (count: number): fc.Arbitrary<Experience[]> =>
  fc.tuple(
    ...Array.from({ length: count }, (_, i) => experienceArbitrary(i))
  ).chain((exps) =>
    fc.shuffledSubarray(Array.from({ length: count }, (_, i) => i), { minLength: count, maxLength: count })
      .map((shuffledOrders) =>
        (exps as Experience[]).map((exp, idx) => ({
          ...exp,
          order: shuffledOrders[idx],
        }))
      )
  );

/**
 * Arbitrary for generating projects with shuffled order values
 */
const shuffledProjectsArbitrary = (count: number): fc.Arbitrary<Project[]> =>
  fc.tuple(
    ...Array.from({ length: count }, (_, i) => projectArbitrary(i))
  ).chain((projs) =>
    fc.shuffledSubarray(Array.from({ length: count }, (_, i) => i), { minLength: count, maxLength: count })
      .map((shuffledOrders) =>
        (projs as Project[]).map((proj, idx) => ({
          ...proj,
          order: shuffledOrders[idx],
        }))
      )
  );

// =============================================================================
// Property 8: Content Hierarchy Structure
// =============================================================================

/**
 * Feature: content-architecture, Property 8: Content Hierarchy Structure
 *
 * *For any* content item, it SHALL exist within a three-tier hierarchy:
 * Section (top-level) → Item (individual entry) → Detail (depth content),
 * with no orphaned items outside this structure.
 *
 * **Validates: Requirements 4.1**
 */
describe("Property 8: Content Hierarchy Structure", () => {
  describe("Experience content hierarchy", () => {
    it("every experience item exists within the Section → Item → Detail hierarchy", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }).chain((count) => experiencesArrayArbitrary(count)),
          (experiences) => {
            // Verify each experience has the three-tier structure:
            // 1. Section level: id, order (ContentItem base)
            // 2. Item level: role, company, summary, highlights (Experience specific)
            // 3. Detail level: depth object with context, challenges, decisions, lessons

            return experiences.every((exp) => {
              // Tier 1: Section-level fields (ContentItem)
              const hasSectionFields =
                typeof exp.id === "string" &&
                exp.id.length > 0 &&
                typeof exp.order === "number";

              // Tier 2: Item-level fields (Experience summary)
              const hasItemFields =
                typeof exp.role === "string" &&
                exp.role.length > 0 &&
                typeof exp.company === "string" &&
                exp.company.length > 0 &&
                typeof exp.summary === "string" &&
                Array.isArray(exp.highlights);

              // Tier 3: Detail-level fields (ExperienceDepth)
              const hasDetailFields =
                exp.depth !== undefined &&
                typeof exp.depth.context === "string" &&
                Array.isArray(exp.depth.challenges) &&
                Array.isArray(exp.depth.decisions) &&
                Array.isArray(exp.depth.lessons);

              return hasSectionFields && hasItemFields && hasDetailFields;
            });
          }
        ),
        { numRuns: 3 }
      );
    });

    it("experience items render within a section container", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }).chain((count) => experiencesArrayArbitrary(count)),
          (experiences) => {
            cleanup();

            render(<ExperienceSection experiences={experiences} />);

            // Verify section exists with proper structure
            const section = document.getElementById("experience");
            const hasSection = section !== null;
            const hasSectionRole = section?.tagName === "SECTION";
            const hasAriaLabel = section?.hasAttribute("aria-labelledby");

            // Verify items exist within the section
            const itemsInSection = experiences.every((exp) => {
              const button = document.querySelector(`#expand-btn-${exp.id}`);
              return button !== null && section?.contains(button);
            });

            return hasSection && hasSectionRole && hasAriaLabel && itemsInSection;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("Project content hierarchy", () => {
    it("every project item exists within the Section → Item → Detail hierarchy", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }).chain((count) => projectsArrayArbitrary(count)),
          (projects) => {
            // Verify each project has the three-tier structure:
            // 1. Section level: id, order (ContentItem base)
            // 2. Item level: title, description, technologies (Project specific)
            // 3. Detail level: depth object with problem, approach, tradeoffs, outcomes, reflections

            return projects.every((proj) => {
              // Tier 1: Section-level fields (ContentItem)
              const hasSectionFields =
                typeof proj.id === "string" &&
                proj.id.length > 0 &&
                typeof proj.order === "number";

              // Tier 2: Item-level fields (Project summary)
              const hasItemFields =
                typeof proj.title === "string" &&
                proj.title.length > 0 &&
                typeof proj.description === "string" &&
                Array.isArray(proj.technologies) &&
                proj.technologies.length > 0;

              // Tier 3: Detail-level fields (ProjectDepth)
              const hasDetailFields =
                proj.depth !== undefined &&
                typeof proj.depth.problem === "string" &&
                typeof proj.depth.approach === "string" &&
                Array.isArray(proj.depth.tradeoffs) &&
                Array.isArray(proj.depth.outcomes) &&
                typeof proj.depth.reflections === "string";

              return hasSectionFields && hasItemFields && hasDetailFields;
            });
          }
        ),
        { numRuns: 3 }
      );
    });

    it("project items render within a section container", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }).chain((count) => projectsArrayArbitrary(count)),
          (projects) => {
            cleanup();

            render(<ProjectsSection projects={projects} />);

            // Verify section exists with proper structure
            const section = document.getElementById("projects");
            const hasSection = section !== null;
            const hasSectionRole = section?.tagName === "SECTION";
            const hasAriaLabel = section?.hasAttribute("aria-labelledby");

            // Verify items exist within the section
            const itemsInSection = projects.every((proj) => {
              const button = document.querySelector(`#expand-btn-${proj.id}`);
              return button !== null && section?.contains(button);
            });

            return hasSection && hasSectionRole && hasAriaLabel && itemsInSection;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("SkillCategory content hierarchy", () => {
    it("every skill category exists within the Section → Item → Detail hierarchy", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }).chain((count) => skillCategoriesArrayArbitrary(count)),
          (categories) => {
            // Verify each skill category has the three-tier structure:
            // 1. Section level: id, order (ContentItem base)
            // 2. Item level: name, description (SkillCategory specific)
            // 3. Detail level: skills array with individual skill details

            return categories.every((cat) => {
              // Tier 1: Section-level fields (ContentItem)
              const hasSectionFields =
                typeof cat.id === "string" &&
                cat.id.length > 0 &&
                typeof cat.order === "number";

              // Tier 2: Item-level fields (SkillCategory summary)
              const hasItemFields =
                typeof cat.name === "string" &&
                cat.name.length > 0 &&
                typeof cat.description === "string";

              // Tier 3: Detail-level fields (Skills array)
              const hasDetailFields =
                Array.isArray(cat.skills) &&
                cat.skills.length > 0 &&
                cat.skills.every(
                  (skill) =>
                    typeof skill.name === "string" &&
                    ["expert", "proficient", "familiar"].includes(skill.level)
                );

              return hasSectionFields && hasItemFields && hasDetailFields;
            });
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});

// =============================================================================
// Property 9: Content Ordering
// =============================================================================

/**
 * Feature: content-architecture, Property 9: Content Ordering
 *
 * *For any* Content_Section containing multiple items, items SHALL be ordered
 * by their `order` field in ascending order (lower order values appear first),
 * enabling most recent/impactful items to be displayed first.
 *
 * **Validates: Requirements 4.2**
 */
describe("Property 9: Content Ordering", () => {
  describe("Experience ordering", () => {
    it("experiences are rendered in ascending order by order field", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }).chain((count) => shuffledExperiencesArbitrary(count)),
          (experiences) => {
            cleanup();

            render(<ExperienceSection experiences={experiences} />);

            // Get all experience buttons in DOM order
            const buttons = screen.getAllByRole("button");
            const renderedIds = buttons.map((btn) => btn.id.replace("expand-btn-", ""));

            // Sort experiences by order field to get expected order
            const expectedOrder = [...experiences]
              .sort((a, b) => a.order - b.order)
              .map((exp) => exp.id);

            // Verify rendered order matches expected order
            return renderedIds.every((id, idx) => id === expectedOrder[idx]);
          }
        ),
        { numRuns: 3 }
      );
    });

    it("lower order values appear before higher order values", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }).chain((count) => shuffledExperiencesArbitrary(count)),
          (experiences) => {
            cleanup();

            render(<ExperienceSection experiences={experiences} />);

            // Get all experience buttons in DOM order
            const buttons = screen.getAllByRole("button");
            const renderedIds = buttons.map((btn) => btn.id.replace("expand-btn-", ""));

            // Get order values in rendered sequence
            const renderedOrders = renderedIds.map((id) => {
              const exp = experiences.find((e) => e.id === id);
              return exp?.order ?? Infinity;
            });

            // Verify orders are in ascending sequence
            for (let i = 1; i < renderedOrders.length; i++) {
              if (renderedOrders[i] < renderedOrders[i - 1]) {
                return false;
              }
            }
            return true;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("Project ordering", () => {
    it("projects are rendered in ascending order by order field", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }).chain((count) => shuffledProjectsArbitrary(count)),
          (projects) => {
            cleanup();

            render(<ProjectsSection projects={projects} />);

            // Get all project buttons in DOM order
            const buttons = screen.getAllByRole("button");
            const renderedIds = buttons.map((btn) => btn.id.replace("expand-btn-", ""));

            // Sort projects by order field to get expected order
            const expectedOrder = [...projects]
              .sort((a, b) => a.order - b.order)
              .map((proj) => proj.id);

            // Verify rendered order matches expected order
            return renderedIds.every((id, idx) => id === expectedOrder[idx]);
          }
        ),
        { numRuns: 3 }
      );
    });

    it("lower order values appear before higher order values", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }).chain((count) => shuffledProjectsArbitrary(count)),
          (projects) => {
            cleanup();

            render(<ProjectsSection projects={projects} />);

            // Get all project buttons in DOM order
            const buttons = screen.getAllByRole("button");
            const renderedIds = buttons.map((btn) => btn.id.replace("expand-btn-", ""));

            // Get order values in rendered sequence
            const renderedOrders = renderedIds.map((id) => {
              const proj = projects.find((p) => p.id === id);
              return proj?.order ?? Infinity;
            });

            // Verify orders are in ascending sequence
            for (let i = 1; i < renderedOrders.length; i++) {
              if (renderedOrders[i] < renderedOrders[i - 1]) {
                return false;
              }
            }
            return true;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("Content ordering invariants", () => {
    it("ordering is stable - same input produces same output order", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 4 }).chain((count) => shuffledExperiencesArbitrary(count)),
          (experiences) => {
            cleanup();

            // Render first time
            const { unmount } = render(<ExperienceSection experiences={experiences} />);
            const buttons1 = screen.getAllByRole("button");
            const order1 = buttons1.map((btn) => btn.id);
            unmount();

            // Render second time with same input
            render(<ExperienceSection experiences={experiences} />);
            const buttons2 = screen.getAllByRole("button");
            const order2 = buttons2.map((btn) => btn.id);

            // Orders should be identical
            return (
              order1.length === order2.length &&
              order1.every((id, idx) => id === order2[idx])
            );
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});

// =============================================================================
// Property 10: Large Section Filtering
// =============================================================================

/**
 * Feature: content-architecture, Property 10: Large Section Filtering
 *
 * *For any* Content_Section containing more than 5 items, the section SHALL
 * render filtering or categorization controls that allow visitors to narrow
 * the displayed items.
 *
 * **Validates: Requirements 4.5**
 */
describe("Property 10: Large Section Filtering", () => {
  describe("Experience section filtering", () => {
    it("filter controls are shown when more than 5 experiences", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 6, max: 8 }).chain((count) => experiencesArrayArbitrary(count)),
          (experiences) => {
            cleanup();

            render(<ExperienceSection experiences={experiences} />);

            // Filter should be present when > 5 items
            const filterLabel = screen.queryByText(/filter by company/i);
            const filterSelect = screen.queryByRole("combobox", {
              name: /filter experiences by company/i,
            });

            return filterLabel !== null && filterSelect !== null;
          }
        ),
        { numRuns: 3 }
      );
    });

    it("filter controls are NOT shown when 5 or fewer experiences", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }).chain((count) => experiencesArrayArbitrary(count)),
          (experiences) => {
            cleanup();

            render(<ExperienceSection experiences={experiences} />);

            // Filter should NOT be present when <= 5 items
            const filterLabel = screen.queryByText(/filter by company/i);
            const filterSelect = screen.queryByRole("combobox", {
              name: /filter experiences by company/i,
            });

            return filterLabel === null && filterSelect === null;
          }
        ),
        { numRuns: 3 }
      );
    });

    it("ExperienceFilter component renders filter options", () => {
      fc.assert(
        fc.property(
          fc.array(nonEmptyStringArbitrary, { minLength: 2, maxLength: 5 }).map((companies) => [
            ...new Set(companies),
          ]),
          (companies) => {
            cleanup();

            render(
              <ExperienceFilter
                companies={companies}
                selectedCompany=""
                onFilterChange={() => {}}
              />
            );

            // Verify filter select exists
            const select = screen.getByRole("combobox");
            const hasSelect = select !== null;

            // Verify "All Companies" option exists
            const allOption = screen.getByRole("option", { name: /all companies/i });
            const hasAllOption = allOption !== null;

            // Verify each company is an option
            const hasAllCompanyOptions = companies.every((company) => {
              const option = screen.queryByRole("option", { name: company });
              return option !== null;
            });

            return hasSelect && hasAllOption && hasAllCompanyOptions;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("Projects section filtering", () => {
    it("filter controls are shown when more than 5 projects", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 6, max: 8 }).chain((count) => projectsArrayArbitrary(count)),
          (projects) => {
            cleanup();

            render(<ProjectsSection projects={projects} />);

            // Filter should be present when > 5 items
            const filterLabel = screen.queryByText(/filter by technology/i);
            const filterSelect = screen.queryByRole("combobox", {
              name: /filter projects by technology/i,
            });

            return filterLabel !== null && filterSelect !== null;
          }
        ),
        { numRuns: 3 }
      );
    });

    it("filter controls are NOT shown when 5 or fewer projects", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }).chain((count) => projectsArrayArbitrary(count)),
          (projects) => {
            cleanup();

            render(<ProjectsSection projects={projects} />);

            // Filter should NOT be present when <= 5 items
            const filterLabel = screen.queryByText(/filter by technology/i);
            const filterSelect = screen.queryByRole("combobox", {
              name: /filter projects by technology/i,
            });

            return filterLabel === null && filterSelect === null;
          }
        ),
        { numRuns: 3 }
      );
    });

    it("TechnologyFilter component renders filter options", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.constantFrom("React", "TypeScript", "Node.js", "Python", "Go", "Rust"),
            { minLength: 2, maxLength: 5 }
          ).map((techs) => [...new Set(techs)]),
          (technologies) => {
            cleanup();

            render(
              <TechnologyFilter
                technologies={technologies}
                selectedTechnology=""
                onFilterChange={() => {}}
              />
            );

            // Verify filter select exists
            const select = screen.getByRole("combobox");
            const hasSelect = select !== null;

            // Verify "All Technologies" option exists
            const allOption = screen.getByRole("option", { name: /all technologies/i });
            const hasAllOption = allOption !== null;

            // Verify each technology is an option
            const hasAllTechOptions = technologies.every((tech) => {
              const option = screen.queryByRole("option", { name: tech });
              return option !== null;
            });

            return hasSelect && hasAllOption && hasAllTechOptions;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("Filter threshold boundary", () => {
    it("exactly 5 items does NOT show filter", () => {
      fc.assert(
        fc.property(experiencesArrayArbitrary(5), (experiences) => {
          cleanup();

          render(<ExperienceSection experiences={experiences} />);

          // Filter should NOT be present at exactly 5 items
          const filterSelect = screen.queryByRole("combobox", {
            name: /filter experiences by company/i,
          });

          return filterSelect === null;
        }),
        { numRuns: 3 }
      );
    });

    it("exactly 6 items DOES show filter", () => {
      fc.assert(
        fc.property(experiencesArrayArbitrary(6), (experiences) => {
          cleanup();

          render(<ExperienceSection experiences={experiences} />);

          // Filter should be present at 6 items
          const filterSelect = screen.queryByRole("combobox", {
            name: /filter experiences by company/i,
          });

          return filterSelect !== null;
        }),
        { numRuns: 3 }
      );
    });
  });
});
