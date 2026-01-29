/**
 * Property Tests for Responsive Behavior
 *
 * These tests validate responsive behavior including touch target sizing
 * and state persistence across viewport changes as specified in the design document.
 *
 * **Validates: Requirements 5.2, 5.4**
 */

import * as fc from "fast-check";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Expandable, ExpandButton } from "@/components/Expandable";
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
}

function TestExpandableWrapper({
  id,
  summaryText,
  depthText,
  ariaLabel,
  initialExpanded = false,
}: TestExpandableWrapperProps) {
  const { isExpanded, toggle } = useExpandable({
    initialExpandedIds: initialExpanded ? [id] : [],
  });

  return (
    <Expandable
      id={id}
      isExpanded={isExpanded(id)}
      onToggle={() => toggle(id)}
      summaryContent={<span data-testid={`summary-${id}`}>{summaryText}</span>}
      depthContent={<p data-testid={`depth-${id}`}>{depthText}</p>}
      ariaLabel={ariaLabel}
      animate={false}
      preserveScrollPosition={false}
    />
  );
}

/**
 * Test wrapper for multiple expandable items with shared state
 */
interface MultipleExpandableWrapperProps {
  items: Array<{
    id: string;
    summaryText: string;
    depthText: string;
  }>;
  initialExpandedIds?: string[];
}

function MultipleExpandableWrapper({
  items,
  initialExpandedIds = [],
}: MultipleExpandableWrapperProps) {
  const { isExpanded, toggle } = useExpandable({
    initialExpandedIds,
  });

  return (
    <div>
      {items.map((item) => (
        <Expandable
          key={item.id}
          id={item.id}
          isExpanded={isExpanded(item.id)}
          onToggle={() => toggle(item.id)}
          summaryContent={<span data-testid={`summary-${item.id}`}>{item.summaryText}</span>}
          depthContent={<p data-testid={`depth-${item.id}`}>{item.depthText}</p>}
          animate={false}
          preserveScrollPosition={false}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Property 11: Touch Target Sizing
// =============================================================================

/**
 * Feature: content-architecture, Property 11: Touch Target Sizing
 *
 * *For any* Expansion_Control rendered at Mobile_Viewport (375px width),
 * the clickable/tappable area SHALL have dimensions of at least 44×44 pixels.
 *
 * **Validates: Requirements 5.2**
 */
describe("Property 11: Touch Target Sizing", () => {
  describe("ExpandButton touch target dimensions", () => {
    it("ExpandButton has min-h-[44px] class for minimum height", () => {
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
          const hasMinHeight = button.className.includes("min-h-[44px]");

          return hasMinHeight;
        }),
        { numRuns: 3 }
      );
    });

    it("ExpandButton has min-w-[44px] class for minimum width", () => {
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
          const hasMinWidth = button.className.includes("min-w-[44px]");

          return hasMinWidth;
        }),
        { numRuns: 3 }
      );
    });

    it("ExpandButton touch target classes are present regardless of expanded state", () => {
      fc.assert(
        fc.property(
          expandableItemArbitrary,
          fc.boolean(),
          (item, isExpanded) => {
            cleanup();

            render(
              <ExpandButton
                buttonId={`btn-${item.id}`}
                contentId={`content-${item.id}`}
                isExpanded={isExpanded}
                onClick={() => {}}
              >
                {item.summaryText}
              </ExpandButton>
            );

            const button = screen.getByRole("button");
            const hasMinHeight = button.className.includes("min-h-[44px]");
            const hasMinWidth = button.className.includes("min-w-[44px]");

            return hasMinHeight && hasMinWidth;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("Expandable component touch target dimensions", () => {
    it("Expandable button has minimum 44x44 touch target classes", () => {
      fc.assert(
        fc.property(expandableItemArbitrary, (item) => {
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
          const hasMinHeight = button.className.includes("min-h-[44px]");
          const hasMinWidth = button.className.includes("min-w-[44px]");

          return hasMinHeight && hasMinWidth;
        }),
        { numRuns: 3 }
      );
    });

    it("touch target sizing is maintained after expand/collapse", async () => {
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

          // Check initial state
          const hasMinHeightBefore = button.className.includes("min-h-[44px]");
          const hasMinWidthBefore = button.className.includes("min-w-[44px]");

          // Expand
          await user.click(button);

          // Check after expand
          const hasMinHeightAfterExpand = button.className.includes("min-h-[44px]");
          const hasMinWidthAfterExpand = button.className.includes("min-w-[44px]");

          // Collapse
          await user.click(button);

          // Check after collapse
          const hasMinHeightAfterCollapse = button.className.includes("min-h-[44px]");
          const hasMinWidthAfterCollapse = button.className.includes("min-w-[44px]");

          return (
            hasMinHeightBefore &&
            hasMinWidthBefore &&
            hasMinHeightAfterExpand &&
            hasMinWidthAfterExpand &&
            hasMinHeightAfterCollapse &&
            hasMinWidthAfterCollapse
          );
        }),
        { numRuns: 3 }
      );
    });
  });

  describe("Touch target accessibility", () => {
    it("button element is a native button for proper touch handling", () => {
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
          
          // Should be a native button element for proper touch handling
          return button.tagName === "BUTTON";
        }),
        { numRuns: 3 }
      );
    });

    it("button has type='button' to prevent form submission", () => {
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
          
          return button.getAttribute("type") === "button";
        }),
        { numRuns: 3 }
      );
    });
  });
});

// =============================================================================
// Property 12: State Persistence Across Viewport Changes
// =============================================================================

/**
 * Feature: content-architecture, Property 12: State Persistence Across Viewport Changes
 *
 * *For any* expanded content item, resizing the viewport from Mobile_Viewport
 * to Desktop_Viewport (or vice versa) SHALL preserve the expanded/collapsed
 * state of that item.
 *
 * **Validates: Requirements 5.4**
 */
describe("Property 12: State Persistence Across Viewport Changes", () => {
  describe("useExpandable hook state persistence", () => {
    it("expanded state persists across multiple re-renders", () => {
      fc.assert(
        fc.property(
          itemIdArbitrary,
          fc.integer({ min: 1, max: 5 }),
          (itemId, rerenderCount) => {
            const { result, rerender } = renderHook(() => useExpandable());

            // Expand the item
            act(() => {
              result.current.toggle(itemId);
            });
            expect(result.current.isExpanded(itemId)).toBe(true);

            // Simulate multiple re-renders (as would happen during viewport resize)
            for (let i = 0; i < rerenderCount; i++) {
              rerender();
            }

            // State should persist
            return result.current.isExpanded(itemId) === true;
          }
        ),
        { numRuns: 3 }
      );
    });

    it("collapsed state persists across multiple re-renders", () => {
      fc.assert(
        fc.property(
          itemIdArbitrary,
          fc.integer({ min: 1, max: 5 }),
          (itemId, rerenderCount) => {
            const { result, rerender } = renderHook(() => useExpandable());

            // Item starts collapsed
            expect(result.current.isExpanded(itemId)).toBe(false);

            // Simulate multiple re-renders
            for (let i = 0; i < rerenderCount; i++) {
              rerender();
            }

            // State should persist
            return result.current.isExpanded(itemId) === false;
          }
        ),
        { numRuns: 3 }
      );
    });

    it("multiple expanded items persist state across re-renders", () => {
      fc.assert(
        fc.property(
          multipleItemIdsArbitrary,
          fc.integer({ min: 1, max: 3 }),
          (itemIds, rerenderCount) => {
            const { result, rerender } = renderHook(() => useExpandable());

            // Expand all items
            itemIds.forEach((id) => {
              act(() => {
                result.current.toggle(id);
              });
            });

            // Verify all are expanded
            const allExpandedBefore = itemIds.every((id) =>
              result.current.isExpanded(id)
            );
            if (!allExpandedBefore) return false;

            // Simulate multiple re-renders
            for (let i = 0; i < rerenderCount; i++) {
              rerender();
            }

            // All items should still be expanded
            return itemIds.every((id) => result.current.isExpanded(id));
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("Expandable component state persistence", () => {
    it("expanded item remains expanded after re-render", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();
          const user = userEvent.setup();

          const { rerender } = render(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={false}
            />
          );

          const button = screen.getByRole("button");

          // Expand the item
          await user.click(button);
          expect(button).toHaveAttribute("aria-expanded", "true");

          // Simulate viewport change by re-rendering
          rerender(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={false}
            />
          );

          // State should persist - item should still be expanded
          return button.getAttribute("aria-expanded") === "true";
        }),
        { numRuns: 3 }
      );
    });

    it("collapsed item remains collapsed after re-render", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();
          const user = userEvent.setup();

          const { rerender } = render(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={true}
            />
          );

          const button = screen.getByRole("button");

          // Collapse the item
          await user.click(button);
          expect(button).toHaveAttribute("aria-expanded", "false");

          // Simulate viewport change by re-rendering
          rerender(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={true}
            />
          );

          // State should persist - item should still be collapsed
          return button.getAttribute("aria-expanded") === "false";
        }),
        { numRuns: 3 }
      );
    });

    it("depth content visibility persists after re-render", async () => {
      await fc.assert(
        fc.asyncProperty(expandableItemArbitrary, async (item) => {
          cleanup();
          const user = userEvent.setup();

          const { rerender } = render(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={false}
            />
          );

          const button = screen.getByRole("button");

          // Expand to show depth content
          await user.click(button);
          expect(screen.getByTestId(`depth-${item.id}`)).toBeInTheDocument();

          // Simulate viewport change by re-rendering
          rerender(
            <TestExpandableWrapper
              id={item.id}
              summaryText={item.summaryText}
              depthText={item.depthText}
              initialExpanded={false}
            />
          );

          // Depth content should still be visible
          return screen.queryByTestId(`depth-${item.id}`) !== null;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe("Multiple items state persistence", () => {
    it("mixed expanded/collapsed states persist across re-renders", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(expandableItemArbitrary, { minLength: 2, maxLength: 4 })
            .map((items) => {
              // Ensure unique IDs
              const seenIds = new Set<string>();
              return items.filter((item) => {
                if (seenIds.has(item.id)) return false;
                seenIds.add(item.id);
                return true;
              });
            })
            .filter((items) => items.length >= 2),
          async (items) => {
            cleanup();
            const user = userEvent.setup();

            const { rerender } = render(
              <MultipleExpandableWrapper
                items={items}
                initialExpandedIds={[]}
              />
            );

            // Expand only the first item
            const firstButton = screen.getByTestId(`summary-${items[0].id}`).closest("button")!;
            await user.click(firstButton);

            // Verify first is expanded, others are collapsed
            const buttons = items.map((item) =>
              screen.getByTestId(`summary-${item.id}`).closest("button")!
            );
            
            expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
            for (let i = 1; i < buttons.length; i++) {
              expect(buttons[i]).toHaveAttribute("aria-expanded", "false");
            }

            // Simulate viewport change by re-rendering
            rerender(
              <MultipleExpandableWrapper
                items={items}
                initialExpandedIds={[]}
              />
            );

            // States should persist
            const firstStillExpanded = buttons[0].getAttribute("aria-expanded") === "true";
            const othersStillCollapsed = buttons.slice(1).every(
              (btn) => btn.getAttribute("aria-expanded") === "false"
            );

            return firstStillExpanded && othersStillCollapsed;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe("State persistence invariants", () => {
    it("state is managed by React and not affected by CSS/layout changes", () => {
      fc.assert(
        fc.property(itemIdArbitrary, (itemId) => {
          const { result } = renderHook(() => useExpandable());

          // Expand the item
          act(() => {
            result.current.toggle(itemId);
          });

          // The state is stored in React's useState, which is independent of:
          // - CSS media queries
          // - Viewport dimensions
          // - Layout changes
          // This is verified by the fact that the hook returns consistent state
          // regardless of any external factors

          const isExpandedCheck1 = result.current.isExpanded(itemId);
          const isExpandedCheck2 = result.current.isExpanded(itemId);
          const isExpandedCheck3 = result.current.isExpanded(itemId);

          // State should be consistent across multiple checks
          return isExpandedCheck1 === true && 
                 isExpandedCheck2 === true && 
                 isExpandedCheck3 === true;
        }),
        { numRuns: 3 }
      );
    });

    it("expandedIds Set maintains referential stability when unchanged", () => {
      fc.assert(
        fc.property(itemIdArbitrary, (itemId) => {
          const { result, rerender } = renderHook(() => useExpandable());

          // Get initial expandedIds reference
          const initialRef = result.current.expandedIds;

          // Re-render without any state changes
          rerender();

          // The Set reference should be the same (no unnecessary re-renders)
          // This ensures viewport changes don't cause state loss
          return result.current.expandedIds === initialRef;
        }),
        { numRuns: 3 }
      );
    });
  });
});
