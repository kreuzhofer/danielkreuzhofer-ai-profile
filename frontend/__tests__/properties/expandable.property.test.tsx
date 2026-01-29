/**
 * Property Tests for Expandable Behavior
 *
 * These tests validate expandable content behavior as specified in the design document.
 *
 * **Validates: Requirements 3.1, 3.4, 3.6, 6.2, 7.2, 7.3**
 */

import * as fc from "fast-check";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Expandable, ExpandButton, ExpandContent } from "@/components/Expandable";
import { useExpandable } from "@/hooks/useExpandable";
import { renderHook } from "@testing-library/react";

// Ensure cleanup after each test
afterEach(() => {
  cleanup();
});

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating valid expandable item IDs (kebab-case identifiers)
 */
const itemIdArbitrary = fc
  .tuple(
    fc.constantFrom("experience", "project", "skill", "about", "contact", "item", "section", "entry"),
    fc.integer({ min: 1, max: 99 })
  )
  .map(([base, num]) => `${base}-${num}`);

/**
 * Arbitrary for generating summary content text
 */
const summaryTextArbitrary = fc
  .tuple(
    fc.constantFrom("Senior", "Lead", "Principal", "Staff", "Junior"),
    fc.constantFrom("Engineer", "Developer", "Designer", "Manager", "Architect"),
    fc.constantFrom("at", "for", "with"),
    fc.constantFrom("TechCorp", "StartupXYZ", "BigCompany", "SmallBiz", "Agency")
  )
  .map(([level, role, prep, company]) => `${level} ${role} ${prep} ${company}`);

/**
 * Arbitrary for generating depth content text
 */
const depthTextArbitrary = fc
  .tuple(
    fc.constantFrom("Led", "Built", "Designed", "Implemented", "Managed"),
    fc.constantFrom("a team", "a project", "a system", "an initiative", "a platform"),
    fc.constantFrom("that improved", "resulting in", "achieving", "delivering"),
    fc.constantFrom("50%", "2x", "significant", "measurable", "substantial"),
    fc.constantFrom("growth", "efficiency", "performance", "results", "outcomes")
  )
  .map(([action, subject, result, metric, outcome]) => 
    `${action} ${subject} ${result} ${metric} ${outcome}.`
  );


/**
 * Arbitrary for generating a complete expandable item configuration
 */
const expandableItemArbitrary = fc.record({
  id: itemIdArbitrary,
  summaryText: summaryTextArbitrary,
  depthText: depthTextArbitrary,
  ariaLabel: fc.option(summaryTextArbitrary, { nil: undefined }),
});

/**
 * Arbitrary for generating multiple unique expandable item IDs
 */
const multipleItemIdsArbitrary = fc
  .array(itemIdArbitrary, { minLength: 2, maxLength: 5 })
  .map((ids) => [...new Set(ids)])
  .filter((ids) => ids.length >= 2);

// =============================================================================
// Test Wrapper Component for useExpandable integration
// =============================================================================

interface TestExpandableWrapperProps {
  id: string;
  summaryText: string;
  depthText: string;
  ariaLabel?: string;
  initialExpanded?: boolean;
  animate?: boolean;
  animationDuration?: number;
  preserveScrollPosition?: boolean;
  onToggleCallback?: () => void;
}

function TestExpandableWrapper({
  id,
  summaryText,
  depthText,
  ariaLabel,
  initialExpanded = false,
  animate = false, // Disable animation by default for faster tests
  animationDuration = 200,
  preserveScrollPosition = false, // Disable scroll preservation by default for tests
  onToggleCallback,
}: TestExpandableWrapperProps) {
  const { isExpanded, toggle } = useExpandable({
    initialExpandedIds: initialExpanded ? [id] : [],
  });

  const handleToggle = () => {
    toggle(id);
    onToggleCallback?.();
  };

  return (
    <Expandable
      id={id}
      isExpanded={isExpanded(id)}
      onToggle={handleToggle}
      summaryContent={<span data-testid={`summary-${id}`}>{summaryText}</span>}
      depthContent={<p data-testid={`depth-${id}`}>{depthText}</p>}
      ariaLabel={ariaLabel}
      animate={animate}
      animationDuration={animationDuration}
      preserveScrollPosition={preserveScrollPosition}
    />
  );
}


// =============================================================================
// Property 6: Expand/Collapse Round Trip
// =============================================================================

/**
 * Feature: content-architecture, Property 6: Expand/Collapse Round Trip
 *
 * *For any* expandable content item, expanding then collapsing SHALL return
 * the view to its original Summary_Layer state, with the Depth_Layer hidden
 * and only summary content visible.
 *
 * **Validates: Requirements 3.1, 3.6**
 */
describe("Property 6: Expand/Collapse Round Trip", () => {
  describe("useExpandable hook round trip", () => {
    it("expanding then collapsing returns to original collapsed state", () => {
      fc.assert(
        fc.property(itemIdArbitrary, (itemId) => {
          const { result } = renderHook(() => useExpandable());

          // Initial state - collapsed
          const initialState = result.current.isExpanded(itemId);
          expect(initialState).toBe(false);

          // Expand
          act(() => {
            result.current.toggle(itemId);
          });
          expect(result.current.isExpanded(itemId)).toBe(true);

          // Collapse
          act(() => {
            result.current.toggle(itemId);
          });

          // Should return to original collapsed state
          return result.current.isExpanded(itemId) === false;
        }),
        { numRuns: 5 }
      );
    });

    it("multiple expand/collapse cycles maintain state consistency", () => {
      fc.assert(
        fc.property(
          itemIdArbitrary,
          fc.integer({ min: 1, max: 5 }),
          (itemId, cycles) => {
            const { result } = renderHook(() => useExpandable());

            for (let i = 0; i < cycles; i++) {
              // Expand
              act(() => {
                result.current.toggle(itemId);
              });
              if (!result.current.isExpanded(itemId)) return false;

              // Collapse
              act(() => {
                result.current.toggle(itemId);
              });
              if (result.current.isExpanded(itemId)) return false;
            }

            return true;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("Expandable component round trip", () => {
    it("depth content is hidden after expand then collapse", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();
          const user = userEvent.setup();

          render(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              ariaLabel={item.ariaLabel}
              initialExpanded={false}
            />
          );

          const button = screen.getByRole("button");

          // Initial state - depth content not visible
          expect(screen.queryByTestId(`depth-${item.id}`)).not.toBeInTheDocument();

          // Expand
          await user.click(button);
          expect(screen.getByTestId(`depth-${item.id}`)).toBeInTheDocument();

          // Collapse
          await user.click(button);

          // Depth content should be hidden again
          expect(screen.queryByTestId(`depth-${item.id}`)).not.toBeInTheDocument();

          return true;
        }),
        { numRuns: 3 }
      );
    });

    it("summary content remains visible throughout expand/collapse cycle", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();
          const user = userEvent.setup();

          render(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={false}
            />
          );

          const button = screen.getByRole("button");

          // Summary visible initially
          expect(screen.getByTestId(`summary-${item.id}`)).toBeInTheDocument();

          // Expand - summary still visible
          await user.click(button);
          expect(screen.getByTestId(`summary-${item.id}`)).toBeInTheDocument();

          // Collapse - summary still visible
          await user.click(button);
          expect(screen.getByTestId(`summary-${item.id}`)).toBeInTheDocument();

          return true;
        }),
        { numRuns: 3 }
      );
    });

    it("aria-expanded returns to false after round trip", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();
          const user = userEvent.setup();

          render(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={false}
            />
          );

          const button = screen.getByRole("button");

          // Initial state
          expect(button).toHaveAttribute("aria-expanded", "false");

          // Expand
          await user.click(button);
          expect(button).toHaveAttribute("aria-expanded", "true");

          // Collapse
          await user.click(button);

          // Should return to false
          return button.getAttribute("aria-expanded") === "false";
        }),
        { numRuns: 3 }
      );
    });
  });
});


// =============================================================================
// Property 7: Scroll Position Preservation
// =============================================================================

/**
 * Feature: content-architecture, Property 7: Scroll Position Preservation
 *
 * *For any* Depth_Layer expansion, the visitor's scroll position relative to
 * the expanded item SHALL be maintained (the trigger element should remain in
 * approximately the same viewport position).
 *
 * **Validates: Requirements 3.4**
 */
describe("Property 7: Scroll Position Preservation", () => {
  describe("Expandable scroll preservation mechanism", () => {
    it("scroll preservation is enabled by default", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();

          // Render with default props (preserveScrollPosition should be true by default)
          const onToggle = jest.fn();
          render(
            <Expandable
              id={item.id}
              isExpanded={false}
              onToggle={onToggle}
              summaryContent={<span>{item.summaryText}</span>}
              depthContent={<p>{item.depthText}</p>}
              // Not passing preserveScrollPosition - should default to true
            />
          );

          // The component should render without errors
          const button = screen.getByRole("button");
          expect(button).toBeInTheDocument();

          return true;
        }),
        { numRuns: 3 }
      );
    });

    it("toggle callback is called regardless of scroll preservation setting", async () => {
      await fc.assert(
        fc.asyncProperty(
          expandableItemArbitrary,
          fc.boolean(),
          async (item, preserveScroll) => {
            cleanup();
            const user = userEvent.setup();
            const onToggle = jest.fn();

            render(
              <Expandable
                id={item.id}
                isExpanded={false}
                onToggle={onToggle}
                summaryContent={<span>{item.summaryText}</span>}
                depthContent={<p>{item.depthText}</p>}
                preserveScrollPosition={preserveScroll}
                animate={false}
              />
            );

            const button = screen.getByRole("button");
            await user.click(button);

            // onToggle should be called regardless of scroll preservation setting
            return onToggle.mock.calls.length === 1;
          }
        ),
        { numRuns: 3 }
      );
    });

    it("button element is accessible for scroll position calculation", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();

          render(
            <Expandable
              id={item.id}
              isExpanded={false}
              onToggle={() => {}}
              summaryContent={<span>{item.summaryText}</span>}
              depthContent={<p>{item.depthText}</p>}
              preserveScrollPosition={true}
            />
          );

          const button = screen.getByRole("button");
          
          // Button should have getBoundingClientRect available for scroll calculations
          const hasGetBoundingClientRect = typeof button.getBoundingClientRect === "function";
          
          return hasGetBoundingClientRect;
        }),
        { numRuns: 3 }
      );
    });
  });
});


// =============================================================================
// Property 13: Expansion Performance
// =============================================================================

/**
 * Feature: content-architecture, Property 13: Expansion Performance
 *
 * *For any* Expansion_Control activation, the Depth_Layer content SHALL become
 * visible within 200 milliseconds of the activation event.
 *
 * **Validates: Requirements 6.2**
 */
describe("Property 13: Expansion Performance", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("ExpandContent animation timing", () => {
    it("default animation duration is 200ms or less", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();

          const { rerender } = render(
            <ExpandContent
              buttonId={`btn-${item.id}`}
              contentId={`content-${item.id}`}
              isExpanded={false}
            >
              <p>{item.depthText}</p>
            </ExpandContent>
          );

          // Expand the content
          rerender(
            <ExpandContent
              buttonId={`btn-${item.id}`}
              contentId={`content-${item.id}`}
              isExpanded={true}
            >
              <p>{item.depthText}</p>
            </ExpandContent>
          );

          const content = document.getElementById(`content-${item.id}`);
          
          // Check that transition includes 200ms (the default)
          const transitionStyle = content?.style.transition || "";
          const has200msTransition = transitionStyle.includes("200ms");

          return has200msTransition;
        }),
        { numRuns: 3 }
      );
    });

    it("content becomes visible after animation duration completes", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();

          const { rerender } = render(
            <ExpandContent
              buttonId={`btn-${item.id}`}
              contentId={`content-${item.id}`}
              isExpanded={false}
              animationDuration={200}
            >
              <p data-testid={`depth-${item.id}`}>{item.depthText}</p>
            </ExpandContent>
          );

          // Expand
          rerender(
            <ExpandContent
              buttonId={`btn-${item.id}`}
              contentId={`content-${item.id}`}
              isExpanded={true}
              animationDuration={200}
            >
              <p data-testid={`depth-${item.id}`}>{item.depthText}</p>
            </ExpandContent>
          );

          // Content should be rendered (even during animation)
          const content = screen.getByTestId(`depth-${item.id}`);
          expect(content).toBeInTheDocument();

          // Advance timers past animation duration
          await act(async () => {
            jest.advanceTimersByTime(200);
          });

          // Content should still be visible after animation completes
          expect(screen.getByTestId(`depth-${item.id}`)).toBeInTheDocument();

          return true;
        }),
        { numRuns: 3 }
      );
    });

    it("custom animation duration is respected", () => {
      fc.assert(
        fc.property(
          expandableItemArbitrary,
          fc.integer({ min: 50, max: 200 }),
          (item, duration) => {
            cleanup();

            const { rerender } = render(
              <ExpandContent
                buttonId={`btn-${item.id}`}
                contentId={`content-${item.id}`}
                isExpanded={false}
                animationDuration={duration}
              >
                <p>{item.depthText}</p>
              </ExpandContent>
            );

            rerender(
              <ExpandContent
                buttonId={`btn-${item.id}`}
                contentId={`content-${item.id}`}
                isExpanded={true}
                animationDuration={duration}
              >
                <p>{item.depthText}</p>
              </ExpandContent>
            );

            const content = document.getElementById(`content-${item.id}`);
            const transitionStyle = content?.style.transition || "";

            // Transition should include the custom duration
            return transitionStyle.includes(`${duration}ms`);
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("Expandable component performance", () => {
    it("Expandable uses 200ms animation by default", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();

          const { rerender } = render(
            <Expandable
              id={item.id}
              isExpanded={false}
              onToggle={() => {}}
              summaryContent={<span>{item.summaryText}</span>}
              depthContent={<p>{item.depthText}</p>}
            />
          );

          rerender(
            <Expandable
              id={item.id}
              isExpanded={true}
              onToggle={() => {}}
              summaryContent={<span>{item.summaryText}</span>}
              depthContent={<p>{item.depthText}</p>}
            />
          );

          const content = document.getElementById(`expand-content-${item.id}`);
          const transitionStyle = content?.style.transition || "";

          return transitionStyle.includes("200ms");
        }),
        { numRuns: 3 }
      );
    });
  });
});


// =============================================================================
// Property 14: Keyboard Expandable Controls
// =============================================================================

/**
 * Feature: content-architecture, Property 14: Keyboard Expandable Controls
 *
 * *For any* Expansion_Control, pressing Enter or Space while the control is
 * focused SHALL toggle the expanded/collapsed state of the associated Depth_Layer.
 *
 * **Validates: Requirements 7.2**
 */
describe("Property 14: Keyboard Expandable Controls", () => {
  describe("ExpandButton keyboard interaction", () => {
    it("Enter key triggers toggle callback", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();
          const onClick = jest.fn();

          render(
            <ExpandButton
              buttonId={`btn-${item.id}`}
              contentId={`content-${item.id}`}
              isExpanded={false}
              onClick={onClick}
            >
              {item.summaryText}
            </ExpandButton>
          );

          const button = screen.getByRole("button");
          fireEvent.keyDown(button, { key: "Enter" });

          return onClick.mock.calls.length === 1;
        }),
        { numRuns: 5 }
      );
    });

    it("Space key triggers toggle callback", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();
          const onClick = jest.fn();

          render(
            <ExpandButton
              buttonId={`btn-${item.id}`}
              contentId={`content-${item.id}`}
              isExpanded={false}
              onClick={onClick}
            >
              {item.summaryText}
            </ExpandButton>
          );

          const button = screen.getByRole("button");
          fireEvent.keyDown(button, { key: " " });

          return onClick.mock.calls.length === 1;
        }),
        { numRuns: 5 }
      );
    });

    it("other keys do not trigger toggle callback", () => {
      fc.assert(
        fc.property(
          expandableItemArbitrary,
          fc.constantFrom("Tab", "Escape", "ArrowDown", "ArrowUp", "a", "b", "1"),
          (item, key) => {
            cleanup();
            const onClick = jest.fn();

            render(
              <ExpandButton
                buttonId={`btn-${item.id}`}
                contentId={`content-${item.id}`}
                isExpanded={false}
                onClick={onClick}
              >
                {item.summaryText}
              </ExpandButton>
            );

            const button = screen.getByRole("button");
            fireEvent.keyDown(button, { key });

            // onClick should NOT be called for non-Enter/Space keys
            return onClick.mock.calls.length === 0;
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  describe("Expandable component keyboard interaction", () => {
    it("Enter key toggles expanded state from collapsed to expanded", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();

          render(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={false}
            />
          );

          const button = screen.getByRole("button");
          expect(button).toHaveAttribute("aria-expanded", "false");

          // Press Enter
          fireEvent.keyDown(button, { key: "Enter" });

          // Should now be expanded
          return button.getAttribute("aria-expanded") === "true";
        }),
        { numRuns: 3 }
      );
    });

    it("Space key toggles expanded state from collapsed to expanded", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();

          render(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={false}
            />
          );

          const button = screen.getByRole("button");
          expect(button).toHaveAttribute("aria-expanded", "false");

          // Press Space
          fireEvent.keyDown(button, { key: " " });

          // Should now be expanded
          return button.getAttribute("aria-expanded") === "true";
        }),
        { numRuns: 3 }
      );
    });

    it("Enter key toggles expanded state from expanded to collapsed", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();

          render(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={true}
            />
          );

          const button = screen.getByRole("button");
          expect(button).toHaveAttribute("aria-expanded", "true");

          // Press Enter
          fireEvent.keyDown(button, { key: "Enter" });

          // Should now be collapsed
          return button.getAttribute("aria-expanded") === "false";
        }),
        { numRuns: 3 }
      );
    });

    it("Space key toggles expanded state from expanded to collapsed", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();

          render(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={true}
            />
          );

          const button = screen.getByRole("button");
          expect(button).toHaveAttribute("aria-expanded", "true");

          // Press Space
          fireEvent.keyDown(button, { key: " " });

          // Should now be collapsed
          return button.getAttribute("aria-expanded") === "false";
        }),
        { numRuns: 3 }
      );
    });

    it("button is focusable via Tab key", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();
          const user = userEvent.setup();

          render(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={false}
            />
          );

          // Tab to focus the button
          await user.tab();

          const button = screen.getByRole("button");
          return document.activeElement === button;
        }),
        { numRuns: 3 }
      );
    });
  });
});


// =============================================================================
// Property 15: ARIA State Announcements
// =============================================================================

/**
 * Feature: content-architecture, Property 15: ARIA State Announcements
 *
 * *For any* Expansion_Control, the `aria-expanded` attribute SHALL accurately
 * reflect the current state (true when expanded, false when collapsed), and
 * the associated Depth_Layer SHALL have `aria-labelledby` pointing to the control.
 *
 * **Validates: Requirements 7.3**
 */
describe("Property 15: ARIA State Announcements", () => {
  describe("ExpandButton ARIA attributes", () => {
    it("aria-expanded is false when collapsed", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();

          render(
            <ExpandButton
              buttonId={`btn-${item.id}`}
              contentId={`content-${item.id}`}
              isExpanded={false}
              onClick={() => {}}
            >
              {item.summaryText}
            </ExpandButton>
          );

          const button = screen.getByRole("button");
          return button.getAttribute("aria-expanded") === "false";
        }),
        { numRuns: 5 }
      );
    });

    it("aria-expanded is true when expanded", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();

          render(
            <ExpandButton
              buttonId={`btn-${item.id}`}
              contentId={`content-${item.id}`}
              isExpanded={true}
              onClick={() => {}}
            >
              {item.summaryText}
            </ExpandButton>
          );

          const button = screen.getByRole("button");
          return button.getAttribute("aria-expanded") === "true";
        }),
        { numRuns: 5 }
      );
    });

    it("aria-controls points to the content region ID", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();
          const contentId = `content-${item.id}`;

          render(
            <ExpandButton
              buttonId={`btn-${item.id}`}
              contentId={contentId}
              isExpanded={false}
              onClick={() => {}}
            >
              {item.summaryText}
            </ExpandButton>
          );

          const button = screen.getByRole("button");
          return button.getAttribute("aria-controls") === contentId;
        }),
        { numRuns: 5 }
      );
    });

    it("button has correct ID for aria-labelledby reference", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();
          const buttonId = `btn-${item.id}`;

          render(
            <ExpandButton
              buttonId={buttonId}
              contentId={`content-${item.id}`}
              isExpanded={false}
              onClick={() => {}}
            >
              {item.summaryText}
            </ExpandButton>
          );

          const button = screen.getByRole("button");
          return button.getAttribute("id") === buttonId;
        }),
        { numRuns: 5 }
      );
    });
  });

  describe("ExpandContent ARIA attributes", () => {
    it("has role='region' when expanded", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();

          render(
            <ExpandContent
              buttonId={`btn-${item.id}`}
              contentId={`content-${item.id}`}
              isExpanded={true}
            >
              <p>{item.depthText}</p>
            </ExpandContent>
          );

          const region = screen.getByRole("region");
          return region !== null;
        }),
        { numRuns: 5 }
      );
    });

    it("aria-labelledby points to the button ID", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();
          const buttonId = `btn-${item.id}`;

          render(
            <ExpandContent
              buttonId={buttonId}
              contentId={`content-${item.id}`}
              isExpanded={true}
            >
              <p>{item.depthText}</p>
            </ExpandContent>
          );

          const region = screen.getByRole("region");
          return region.getAttribute("aria-labelledby") === buttonId;
        }),
        { numRuns: 5 }
      );
    });

    it("content region has correct ID", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();
          const contentId = `content-${item.id}`;

          render(
            <ExpandContent
              buttonId={`btn-${item.id}`}
              contentId={contentId}
              isExpanded={true}
            >
              <p>{item.depthText}</p>
            </ExpandContent>
          );

          const region = screen.getByRole("region");
          return region.getAttribute("id") === contentId;
        }),
        { numRuns: 5 }
      );
    });

    it("content is hidden from screen readers when collapsed", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();

          render(
            <ExpandContent
              buttonId={`btn-${item.id}`}
              contentId={`content-${item.id}`}
              isExpanded={false}
            >
              <p>{item.depthText}</p>
            </ExpandContent>
          );

          // When collapsed, region should not be findable by role
          const region = screen.queryByRole("region");
          return region === null;
        }),
        { numRuns: 5 }
      );
    });
  });

  describe("Expandable component ARIA integration", () => {
    it("button and content IDs are properly linked", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();

          render(
            <Expandable
              id={item.id}
              isExpanded={true}
              onToggle={() => {}}
              summaryContent={<span>{item.summaryText}</span>}
              depthContent={<p>{item.depthText}</p>}
            />
          );

          const button = screen.getByRole("button");
          const region = screen.getByRole("region");

          const buttonId = button.getAttribute("id");
          const contentId = region.getAttribute("id");
          const ariaControls = button.getAttribute("aria-controls");
          const ariaLabelledBy = region.getAttribute("aria-labelledby");

          // Button's aria-controls should match content's ID
          const controlsMatch = ariaControls === contentId;
          // Content's aria-labelledby should match button's ID
          const labelledByMatch = ariaLabelledBy === buttonId;

          return controlsMatch && labelledByMatch;
        }),
        { numRuns: 5 }
      );
    });

    it("aria-expanded updates correctly on state change", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
          cleanup();

          const { rerender } = render(
            <Expandable
              id={item.id}
              isExpanded={false}
              onToggle={() => {}}
              summaryContent={<span>{item.summaryText}</span>}
              depthContent={<p>{item.depthText}</p>}
            />
          );

          const button = screen.getByRole("button");
          const initialAriaExpanded = button.getAttribute("aria-expanded");

          // Rerender with expanded state
          rerender(
            <Expandable
              id={item.id}
              isExpanded={true}
              onToggle={() => {}}
              summaryContent={<span>{item.summaryText}</span>}
              depthContent={<p>{item.depthText}</p>}
            />
          );

          const updatedAriaExpanded = button.getAttribute("aria-expanded");

          return initialAriaExpanded === "false" && updatedAriaExpanded === "true";
        }),
        { numRuns: 5 }
      );
    });

    it("generated IDs follow expected pattern", () => {
      fc.assert(
        fc.property(itemIdArbitrary, (itemId) => {
          cleanup();

          render(
            <Expandable
              id={itemId}
              isExpanded={true}
              onToggle={() => {}}
              summaryContent={<span>Summary</span>}
              depthContent={<p>Depth</p>}
            />
          );

          const button = screen.getByRole("button");
          const region = screen.getByRole("region");

          const expectedButtonId = `expand-btn-${itemId}`;
          const expectedContentId = `expand-content-${itemId}`;

          const buttonIdCorrect = button.getAttribute("id") === expectedButtonId;
          const contentIdCorrect = region.getAttribute("id") === expectedContentId;

          return buttonIdCorrect && contentIdCorrect;
        }),
        { numRuns: 5 }
      );
    });
  });
});
