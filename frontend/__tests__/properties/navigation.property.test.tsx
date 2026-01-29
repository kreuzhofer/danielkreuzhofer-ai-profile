/**
 * Property Tests for Navigation
 *
 * These tests validate navigation accessibility and active section indication
 * as specified in the design document.
 *
 * **Validates: Requirements 1.5, 1.6, 5.5**
 */

import * as fc from "fast-check";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import {
  Navigation,
  NavLink,
  MobileMenu,
  type NavLinkProps,
} from "@/components/Navigation";

// Ensure cleanup after each test
afterEach(() => {
  cleanup();
});

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating valid section IDs (kebab-case identifiers)
 * Uses a more constrained pattern to avoid edge cases
 */
const sectionIdArbitrary = fc
  .tuple(
    fc.constantFrom("about", "experience", "projects", "skills", "contact", "home", "work", "blog", "portfolio", "services"),
    fc.integer({ min: 0, max: 99 })
  )
  .map(([base, num]) => `${base}${num}`);

/**
 * Arbitrary for generating valid section labels (human-readable names)
 * Uses predefined words to ensure unique, readable labels
 */
const sectionLabelArbitrary = fc
  .tuple(
    fc.constantFrom("About", "Experience", "Projects", "Skills", "Contact", "Home", "Work", "Blog", "Portfolio", "Services"),
    fc.integer({ min: 0, max: 99 })
  )
  .map(([base, num]) => `${base} ${num}`);

/**
 * Arbitrary for generating a single navigation section
 */
const navSectionArbitrary: fc.Arbitrary<Omit<NavLinkProps, "isActive" | "onClick">> = fc
  .tuple(sectionIdArbitrary, sectionLabelArbitrary)
  .map(([id, label]) => ({
    href: `#${id}`,
    label,
  }));

/**
 * Arbitrary for generating an array of unique navigation sections
 * Ensures no duplicate hrefs AND no duplicate labels
 */
const navSectionsArbitrary: fc.Arbitrary<Omit<NavLinkProps, "isActive" | "onClick">[]> = fc
  .array(navSectionArbitrary, { minLength: 2, maxLength: 5 })
  .map((sections) => {
    // Deduplicate by href AND label
    const seenHrefs = new Set<string>();
    const seenLabels = new Set<string>();
    return sections.filter((section) => {
      if (seenHrefs.has(section.href) || seenLabels.has(section.label)) return false;
      seenHrefs.add(section.href);
      seenLabels.add(section.label);
      return true;
    });
  })
  .filter((sections) => sections.length >= 2);

/**
 * Arbitrary for generating a current section that exists in the sections array
 */
const currentSectionFromSectionsArbitrary = (
  sections: Omit<NavLinkProps, "isActive" | "onClick">[]
): fc.Arbitrary<string> => {
  const sectionIds = sections.map((s) => s.href.replace("#", ""));
  return fc.constantFrom(...sectionIds);
};

// =============================================================================
// Property 1: Navigation Accessibility
// =============================================================================

/**
 * Feature: content-architecture, Property 1: Navigation Accessibility
 *
 * *For any* navigation link in the Navigation_System, it SHALL be reachable
 * and activatable via keyboard (Tab to focus, Enter/Space to activate)
 * without requiring mouse or hover interactions.
 *
 * **Validates: Requirements 1.6, 5.5**
 */
describe("Property 1: Navigation Accessibility", () => {
  describe("NavLink keyboard accessibility", () => {
    it("all NavLinks are focusable via Tab key", async () => {
      await fc.assert(
        fc.asyncProperty(navSectionArbitrary, async (section) => {
          cleanup();
          const user = userEvent.setup();
          const { container } = render(
            <NavLink
              href={section.href}
              label={section.label}
              isActive={false}
            />
          );

          // Tab to focus the link
          await user.tab();

          const link = within(container).getByRole("link");
          expect(link).toHaveFocus();
          expect(link).toHaveTextContent(section.label);

          return true;
        }),
        { numRuns: 5 }
      );
    });

    it("NavLinks can be activated via Enter key", async () => {
      await fc.assert(
        fc.asyncProperty(navSectionArbitrary, async (section) => {
          cleanup();
          const user = userEvent.setup();
          const handleClick = jest.fn();

          const { container } = render(
            <NavLink
              href={section.href}
              label={section.label}
              isActive={false}
              onClick={handleClick}
            />
          );

          const link = within(container).getByRole("link");
          link.focus();

          // Activate via Enter key
          await user.keyboard("{Enter}");

          expect(handleClick).toHaveBeenCalled();

          return true;
        }),
        { numRuns: 5 }
      );
    });

    it("NavLinks have visible focus indicators", () => {
      fc.assert(
        fc.property(navSectionArbitrary, (section) => {
          cleanup();
          const { container } = render(
            <NavLink
              href={section.href}
              label={section.label}
              isActive={false}
            />
          );

          const link = within(container).getByRole("link");

          // Check for focus ring classes (Tailwind focus utilities)
          const hasFocusRing = link.className.includes("focus:ring");
          const hasFocusOutline = link.className.includes("focus:outline");

          return hasFocusRing && hasFocusOutline;
        }),
        { numRuns: 5 }
      );
    });
  });

  describe("Navigation component keyboard accessibility", () => {
    it("all navigation links are reachable via sequential Tab presses", async () => {
      await fc.assert(
        fc.asyncProperty(navSectionsArbitrary, async (sections) => {
          cleanup();
          const user = userEvent.setup();
          const firstSectionId = sections[0].href.replace("#", "");

          const { container } = render(
            <Navigation
              sections={sections}
              currentSection={firstSectionId}
            />
          );

          const nav = within(container).getByRole("navigation");
          const links = within(nav).getAllByRole("link");

          // Tab through all links and verify each becomes focused
          for (let i = 0; i < links.length; i++) {
            await user.tab();
            expect(links[i]).toHaveFocus();
          }

          return true;
        }),
        { numRuns: 3 }
      );
    });

    it("navigation does not require hover for essential functionality", () => {
      fc.assert(
        fc.property(navSectionsArbitrary, (sections) => {
          cleanup();
          const firstSectionId = sections[0].href.replace("#", "");

          const { container } = render(
            <Navigation
              sections={sections}
              currentSection={firstSectionId}
            />
          );

          const nav = within(container).getByRole("navigation");
          const links = within(nav).getAllByRole("link");

          // Each link should be in the document and have an href
          const allLinksAccessible = links.every((link) => {
            const hasHref = link.hasAttribute("href");
            const isInDocument = document.body.contains(link);
            return hasHref && isInDocument;
          });

          return allLinksAccessible && links.length === sections.length;
        }),
        { numRuns: 5 }
      );
    });
  });

  describe("MobileMenu keyboard accessibility", () => {
    it("mobile menu links are focusable via Tab key when open", async () => {
      await fc.assert(
        fc.asyncProperty(navSectionsArbitrary, async (sections) => {
          cleanup();
          const user = userEvent.setup();
          const firstSectionId = sections[0].href.replace("#", "");

          render(
            <MobileMenu
              isOpen={true}
              onClose={() => {}}
              sections={sections}
              currentSection={firstSectionId}
            />
          );

          // Get the mobile menu dialog
          const dialog = screen.getByRole("dialog");
          const links = within(dialog).getAllByRole("link");

          // First link should be auto-focused when menu opens
          // Then tab through remaining links
          for (let i = 1; i < links.length; i++) {
            await user.tab();
            expect(links[i]).toHaveFocus();
          }

          return true;
        }),
        { numRuns: 3 }
      );
    });

    it("mobile menu can be closed via Escape key", async () => {
      await fc.assert(
        fc.asyncProperty(navSectionsArbitrary, async (sections) => {
          cleanup();
          const user = userEvent.setup();
          const handleClose = jest.fn();
          const firstSectionId = sections[0].href.replace("#", "");

          render(
            <MobileMenu
              isOpen={true}
              onClose={handleClose}
              sections={sections}
              currentSection={firstSectionId}
            />
          );

          await user.keyboard("{Escape}");

          expect(handleClose).toHaveBeenCalled();

          return true;
        }),
        { numRuns: 3 }
      );
    });
  });
});

// =============================================================================
// Property 2: Active Section Indication
// =============================================================================

/**
 * Feature: content-architecture, Property 2: Active Section Indication
 *
 * *For any* Content_Section that a visitor navigates to, the Navigation_System
 * SHALL visually indicate that section as the current active section, and no
 * other section shall be marked active.
 *
 * **Validates: Requirements 1.5**
 */
describe("Property 2: Active Section Indication", () => {
  describe("NavLink active state", () => {
    it("active NavLink has aria-current='page' attribute", () => {
      fc.assert(
        fc.property(navSectionArbitrary, (section) => {
          cleanup();
          const { container } = render(
            <NavLink
              href={section.href}
              label={section.label}
              isActive={true}
            />
          );

          const link = within(container).getByRole("link");
          const hasAriaCurrent = link.getAttribute("aria-current") === "page";

          return hasAriaCurrent;
        }),
        { numRuns: 5 }
      );
    });

    it("inactive NavLink does not have aria-current attribute", () => {
      fc.assert(
        fc.property(navSectionArbitrary, (section) => {
          cleanup();
          const { container } = render(
            <NavLink
              href={section.href}
              label={section.label}
              isActive={false}
            />
          );

          const link = within(container).getByRole("link");
          const hasNoAriaCurrent = !link.hasAttribute("aria-current");

          return hasNoAriaCurrent;
        }),
        { numRuns: 5 }
      );
    });

    it("active NavLink has distinct visual styling", () => {
      fc.assert(
        fc.property(navSectionArbitrary, (section) => {
          cleanup();
          
          // Render active version
          const { container: activeContainer } = render(
            <NavLink
              href={section.href}
              label={section.label}
              isActive={true}
            />
          );
          const activeLink = within(activeContainer).getByRole("link");
          const activeClasses = activeLink.className;
          
          cleanup();

          // Render inactive version
          const { container: inactiveContainer } = render(
            <NavLink
              href={section.href}
              label={section.label}
              isActive={false}
            />
          );
          const inactiveLink = within(inactiveContainer).getByRole("link");
          const inactiveClasses = inactiveLink.className;

          // Active and inactive should have different styling
          return activeClasses !== inactiveClasses;
        }),
        { numRuns: 5 }
      );
    });
  });

  describe("Navigation component active indication", () => {
    it("exactly one section is marked active when currentSection matches", () => {
      fc.assert(
        fc.property(
          navSectionsArbitrary.chain((sections) =>
            currentSectionFromSectionsArbitrary(sections).map((currentSection) => ({
              sections,
              currentSection,
            }))
          ),
          ({ sections, currentSection }) => {
            cleanup();
            const { container } = render(
              <Navigation
                sections={sections}
                currentSection={currentSection}
              />
            );

            const nav = within(container).getByRole("navigation");
            const links = within(nav).getAllByRole("link");
            const activeLinks = links.filter(
              (link) => link.getAttribute("aria-current") === "page"
            );

            // Exactly one link should be marked as active
            return activeLinks.length === 1;
          }
        ),
        { numRuns: 5 }
      );
    });

    it("the correct section is marked active based on currentSection", () => {
      fc.assert(
        fc.property(
          navSectionsArbitrary.chain((sections) =>
            currentSectionFromSectionsArbitrary(sections).map((currentSection) => ({
              sections,
              currentSection,
            }))
          ),
          ({ sections, currentSection }) => {
            cleanup();
            const { container } = render(
              <Navigation
                sections={sections}
                currentSection={currentSection}
              />
            );

            const nav = within(container).getByRole("navigation");
            const expectedActiveSection = sections.find(
              (s) => s.href === `#${currentSection}`
            );

            if (!expectedActiveSection) {
              return false;
            }

            const links = within(nav).getAllByRole("link");
            const activeLink = links.find(
              (link) => link.getAttribute("aria-current") === "page"
            );
            
            const isCorrectlyMarked = activeLink?.textContent === expectedActiveSection.label;

            return isCorrectlyMarked;
          }
        ),
        { numRuns: 5 }
      );
    });

    it("no section is marked active when currentSection does not match any section", () => {
      fc.assert(
        fc.property(navSectionsArbitrary, (sections) => {
          cleanup();
          const nonExistentSection = "nonexistent-section-xyz-999";

          const { container } = render(
            <Navigation
              sections={sections}
              currentSection={nonExistentSection}
            />
          );

          const nav = within(container).getByRole("navigation");
          const links = within(nav).getAllByRole("link");
          const activeLinks = links.filter(
            (link) => link.getAttribute("aria-current") === "page"
          );

          // No links should be marked as active
          return activeLinks.length === 0;
        }),
        { numRuns: 5 }
      );
    });

    it("changing currentSection updates which section is marked active", () => {
      fc.assert(
        fc.property(
          navSectionsArbitrary.chain((sections) =>
            fc
              .tuple(
                currentSectionFromSectionsArbitrary(sections),
                currentSectionFromSectionsArbitrary(sections)
              )
              .filter(([a, b]) => a !== b)
              .map(([firstSection, secondSection]) => ({
                sections,
                firstSection,
                secondSection,
              }))
          ),
          ({ sections, firstSection, secondSection }) => {
            cleanup();
            
            // Render with first section active
            const { container, rerender } = render(
              <Navigation
                sections={sections}
                currentSection={firstSection}
              />
            );

            const nav = within(container).getByRole("navigation");
            let links = within(nav).getAllByRole("link");
            const firstActiveCount = links.filter(
              (link) => link.getAttribute("aria-current") === "page"
            ).length;
            const firstIsActive = firstActiveCount === 1;

            // Re-render with second section active
            rerender(
              <Navigation
                sections={sections}
                currentSection={secondSection}
              />
            );

            // Check that exactly one link is active after rerender
            links = within(nav).getAllByRole("link");
            const secondActiveCount = links.filter(
              (link) => link.getAttribute("aria-current") === "page"
            ).length;
            const secondIsActive = secondActiveCount === 1;

            // Find the link that should be active now
            const expectedActiveSection = sections.find(
              (s) => s.href === `#${secondSection}`
            );
            const activeLink = links.find(
              (link) => link.getAttribute("aria-current") === "page"
            );
            const correctSectionActive = activeLink?.textContent === expectedActiveSection?.label;

            return firstIsActive && secondIsActive && correctSectionActive;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("MobileMenu active indication", () => {
    it("exactly one section is marked active in mobile menu", () => {
      fc.assert(
        fc.property(
          navSectionsArbitrary.chain((sections) =>
            currentSectionFromSectionsArbitrary(sections).map((currentSection) => ({
              sections,
              currentSection,
            }))
          ),
          ({ sections, currentSection }) => {
            cleanup();
            render(
              <MobileMenu
                isOpen={true}
                onClose={() => {}}
                sections={sections}
                currentSection={currentSection}
              />
            );

            const dialog = screen.getByRole("dialog");
            const links = within(dialog).getAllByRole("link");
            const activeLinks = links.filter(
              (link) => link.getAttribute("aria-current") === "page"
            );

            // Exactly one link should be marked as active
            return activeLinks.length === 1;
          }
        ),
        { numRuns: 5 }
      );
    });

    it("the correct section is marked active in mobile menu", () => {
      fc.assert(
        fc.property(
          navSectionsArbitrary.chain((sections) =>
            currentSectionFromSectionsArbitrary(sections).map((currentSection) => ({
              sections,
              currentSection,
            }))
          ),
          ({ sections, currentSection }) => {
            cleanup();
            render(
              <MobileMenu
                isOpen={true}
                onClose={() => {}}
                sections={sections}
                currentSection={currentSection}
              />
            );

            const expectedActiveSection = sections.find(
              (s) => s.href === `#${currentSection}`
            );

            if (!expectedActiveSection) {
              return false;
            }

            const dialog = screen.getByRole("dialog");
            const links = within(dialog).getAllByRole("link");
            const activeLink = links.find(
              (link) => link.getAttribute("aria-current") === "page"
            );
            
            const isCorrectlyMarked = activeLink?.textContent === expectedActiveSection.label;

            return isCorrectlyMarked;
          }
        ),
        { numRuns: 5 }
      );
    });
  });
});
