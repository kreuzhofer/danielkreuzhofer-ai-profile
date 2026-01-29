/**
 * Property Tests for Persistent Contact Visibility
 *
 * These tests validate that contact engagement paths are always accessible
 * as specified in the design document.
 *
 * **Validates: Requirements 8.3**
 * - 8.3: WHILE viewing any Content_Section, THE Content_Architecture SHALL provide
 *        a subtle, persistent contact option
 */

import * as fc from "fast-check";
import { render, cleanup, screen } from "@testing-library/react";
import React from "react";
import { FloatingContactButton } from "@/components/FloatingContactButton";
import { Navigation, DEFAULT_SECTIONS } from "@/components/Navigation";
import { Layout } from "@/components/Layout";

// Ensure cleanup after each test
afterEach(() => {
  cleanup();
});

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating valid scroll positions (0 to large page heights)
 */
const scrollPositionArbitrary = fc.integer({ min: 0, max: 10000 });

/**
 * Arbitrary for generating valid section IDs
 */
const sectionIdArbitrary = fc.constantFrom(
  "about",
  "experience",
  "projects",
  "skills",
  "contact"
);

/**
 * Arbitrary for generating viewport widths (mobile to desktop)
 */
const viewportWidthArbitrary = fc.constantFrom(375, 768, 1024, 1440);

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Checks if the FloatingContactButton has fixed positioning
 */
function hasFixedPositioning(element: HTMLElement): boolean {
  const className = element.className;
  return className.includes("fixed");
}

/**
 * Checks if the Navigation contains a Contact link
 */
function hasContactNavLink(container: HTMLElement): boolean {
  const navLinks = container.querySelectorAll('a[href="#contact"]');
  return navLinks.length > 0;
}

/**
 * Checks if the FloatingContactButton is rendered
 */
function hasFloatingContactButton(container: HTMLElement): boolean {
  const button = container.querySelector('[data-testid="floating-contact-button"]');
  return button !== null;
}

/**
 * Checks if the element has minimum touch target size (44x44px)
 */
function hasTouchTargetSize(element: HTMLElement): boolean {
  const className = element.className;
  // Check for min-w-[44px] and min-h-[44px] or equivalent sizing
  return (
    (className.includes("min-w-[44px]") && className.includes("min-h-[44px]")) ||
    (className.includes("w-12") && className.includes("h-12")) // 48px > 44px
  );
}

// =============================================================================
// Property 17: Persistent Contact Visibility
// =============================================================================

/**
 * Feature: content-architecture, Property 17: Persistent Contact Visibility
 *
 * *For any* scroll position within the page, at least one contact engagement path
 * (header nav link, floating button, or footer) SHALL be visible or accessible
 * within one interaction.
 *
 * **Validates: Requirements 8.3**
 */
describe("Property 17: Persistent Contact Visibility", () => {
  describe("FloatingContactButton persistence", () => {
    it("FloatingContactButton is always rendered with fixed positioning for any scroll position", () => {
      fc.assert(
        fc.property(scrollPositionArbitrary, (_scrollPosition) => {
          cleanup();
          const { container } = render(<FloatingContactButton />);

          const button = container.querySelector('[data-testid="floating-contact-button"]');

          // Button must exist
          if (!button) return false;

          // Button must have fixed positioning to persist across scroll
          const hasFixed = hasFixedPositioning(button as HTMLElement);

          return hasFixed;
        }),
        { numRuns: 3 }
      );
    });

    it("FloatingContactButton has accessible touch target size", () => {
      fc.assert(
        fc.property(viewportWidthArbitrary, (_viewportWidth) => {
          cleanup();
          const { container } = render(<FloatingContactButton />);

          const button = container.querySelector('[data-testid="floating-contact-button"]');

          // Button must exist
          if (!button) return false;

          // Button must have minimum touch target size
          return hasTouchTargetSize(button as HTMLElement);
        }),
        { numRuns: 3 }
      );
    });

    it("FloatingContactButton links to contact section", () => {
      fc.assert(
        fc.property(fc.constant(true), () => {
          cleanup();
          const { container } = render(<FloatingContactButton />);

          const button = container.querySelector('[data-testid="floating-contact-button"]');

          // Button must exist and link to #contact
          if (!button) return false;

          const href = button.getAttribute("href");
          return href === "#contact";
        }),
        { numRuns: 3 }
      );
    });

    it("FloatingContactButton has accessible aria-label", () => {
      fc.assert(
        fc.property(fc.constant(true), () => {
          cleanup();
          const { container } = render(<FloatingContactButton />);

          const button = container.querySelector('[data-testid="floating-contact-button"]');

          // Button must exist and have aria-label
          if (!button) return false;

          const ariaLabel = button.getAttribute("aria-label");
          return ariaLabel !== null && ariaLabel.length > 0;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe("Navigation Contact link", () => {
    it("Navigation includes a Contact link for any active section", () => {
      fc.assert(
        fc.property(sectionIdArbitrary, (currentSection) => {
          cleanup();
          const { container } = render(
            <Navigation
              sections={DEFAULT_SECTIONS}
              currentSection={currentSection}
            />
          );

          // Navigation must contain a Contact link
          return hasContactNavLink(container);
        }),
        { numRuns: 3 }
      );
    });

    it("Contact link is present in DEFAULT_SECTIONS", () => {
      fc.assert(
        fc.property(fc.constant(true), () => {
          // Verify Contact is in the default sections
          const hasContact = DEFAULT_SECTIONS.some(
            (section) => section.href === "#contact" && section.label === "Contact"
          );
          return hasContact;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe("Layout includes all contact paths", () => {
    it("Layout renders FloatingContactButton for any section content", () => {
      fc.assert(
        fc.property(sectionIdArbitrary, (initialSection) => {
          cleanup();
          const { container } = render(
            <Layout initialSection={initialSection}>
              <div id="about">About content</div>
              <div id="experience">Experience content</div>
              <div id="projects">Projects content</div>
              <div id="skills">Skills content</div>
              <div id="contact">Contact content</div>
            </Layout>
          );

          // Layout must include FloatingContactButton
          return hasFloatingContactButton(container);
        }),
        { numRuns: 3 }
      );
    });

    it("Layout renders Navigation with Contact link for any section", () => {
      fc.assert(
        fc.property(sectionIdArbitrary, (initialSection) => {
          cleanup();
          const { container } = render(
            <Layout initialSection={initialSection}>
              <div>Content</div>
            </Layout>
          );

          // Layout must include Navigation with Contact link
          return hasContactNavLink(container);
        }),
        { numRuns: 3 }
      );
    });
  });

  describe("Contact path accessibility", () => {
    it("at least one contact path is always available regardless of scroll position", () => {
      fc.assert(
        fc.property(
          fc.record({
            scrollPosition: scrollPositionArbitrary,
            currentSection: sectionIdArbitrary,
          }),
          ({ scrollPosition: _scrollPosition, currentSection }) => {
            cleanup();
            const { container } = render(
              <Layout initialSection={currentSection}>
                <div style={{ height: "5000px" }}>
                  <div id="about">About</div>
                  <div id="experience">Experience</div>
                  <div id="projects">Projects</div>
                  <div id="skills">Skills</div>
                  <div id="contact">Contact</div>
                </div>
              </Layout>
            );

            // At least one contact path must be available:
            // 1. FloatingContactButton (always visible due to fixed positioning)
            // 2. Navigation Contact link (in header)
            const hasFloating = hasFloatingContactButton(container);
            const hasNavContact = hasContactNavLink(container);

            // At least one must be present
            return hasFloating || hasNavContact;
          }
        ),
        { numRuns: 3 }
      );
    });

    it("FloatingContactButton provides persistent contact option while viewing any section", () => {
      fc.assert(
        fc.property(sectionIdArbitrary, (currentSection) => {
          cleanup();
          const { container } = render(
            <Layout initialSection={currentSection}>
              <div id={currentSection}>Section content</div>
            </Layout>
          );

          // FloatingContactButton must be present for persistent contact
          const floatingButton = container.querySelector(
            '[data-testid="floating-contact-button"]'
          );

          if (!floatingButton) return false;

          // Must have fixed positioning for persistence
          const isFixed = hasFixedPositioning(floatingButton as HTMLElement);

          // Must link to contact section
          const href = floatingButton.getAttribute("href");
          const linksToContact = href === "#contact";

          return isFixed && linksToContact;
        }),
        { numRuns: 3 }
      );
    });
  });
});
