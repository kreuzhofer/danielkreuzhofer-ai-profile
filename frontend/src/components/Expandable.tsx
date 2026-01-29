'use client';

import React, { useCallback, KeyboardEvent, useRef, useEffect, useState } from 'react';

/**
 * Props for accessibility attributes shared between ExpandButton and ExpandContent
 */
export interface ExpandableA11yProps {
  /** ID for the trigger button */
  buttonId: string;
  /** ID for the expandable content */
  contentId: string;
  /** Whether the content is currently expanded */
  isExpanded: boolean;
}

/**
 * Props for the ExpandButton component
 */
export interface ExpandButtonProps extends ExpandableA11yProps {
  /** Click handler to toggle expanded state */
  onClick: () => void;
  /** Button content (label, icon, etc.) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for the button (used if children is not descriptive) */
  ariaLabel?: string;
}

/**
 * ExpandButton component - accessible trigger for expandable content.
 * 
 * Features:
 * - `aria-expanded` attribute reflecting current state (Requirement 7.3)
 * - `aria-controls` pointing to the expandable content region
 * - Keyboard support: Enter and Space to toggle (Requirement 7.2)
 * - Visible focus indicators for accessibility
 * - Minimum touch target size via padding (Requirement 5.2)
 * 
 * **Validates: Requirements 7.2, 7.3**
 * - 7.2: THE Expansion_Controls SHALL be operable via keyboard (Enter/Space to toggle)
 * - 7.3: WHEN Depth_Layer content expands or collapses, THE Content_Architecture SHALL announce state changes to screen readers
 * 
 * @example
 * ```tsx
 * <ExpandButton
 *   buttonId="exp-btn-1"
 *   contentId="exp-content-1"
 *   isExpanded={isExpanded}
 *   onClick={() => toggle('item-1')}
 * >
 *   Show Details
 * </ExpandButton>
 * ```
 */
export function ExpandButton({
  buttonId,
  contentId,
  isExpanded,
  onClick,
  children,
  className = '',
  ariaLabel,
}: ExpandButtonProps) {
  /**
   * Handle keyboard events for accessibility.
   * Supports Enter and Space keys to toggle expanded state.
   * (Requirement 7.2)
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      // Enter and Space should trigger the toggle
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <button
      id={buttonId}
      type="button"
      aria-expanded={isExpanded}
      aria-controls={contentId}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`
        inline-flex items-center justify-between
        min-h-[44px] min-w-[44px]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground focus:rounded-md
        transition-colors duration-200
        ${className}
      `.trim()}
    >
      {children}
    </button>
  );
}

/**
 * Props for the ExpandContent component
 */
export interface ExpandContentProps extends ExpandableA11yProps {
  /** Content to display when expanded */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to animate the expand/collapse transition (default: true) */
  animate?: boolean;
  /** Animation duration in milliseconds (default: 200ms per Requirement 6.2) */
  animationDuration?: number;
  /** Callback fired when animation completes */
  onAnimationComplete?: () => void;
}

/**
 * ExpandContent component - accessible expandable content region with smooth animations.
 * 
 * Features:
 * - `role="region"` for screen reader landmark (Requirement 7.3)
 * - `aria-labelledby` pointing to the trigger button for context
 * - Smooth height transition animation completing within 200ms (Requirement 6.2)
 * - Proper accessibility: content hidden from screen readers when collapsed
 * 
 * **Validates: Requirements 6.2, 7.3**
 * - 6.2: WHEN a Visitor activates an Expansion_Control, THE Depth_Layer content SHALL appear within 200 milliseconds
 * - 7.3: WHEN Depth_Layer content expands or collapses, THE Content_Architecture SHALL announce state changes to screen readers
 * 
 * @example
 * ```tsx
 * <ExpandContent
 *   buttonId="exp-btn-1"
 *   contentId="exp-content-1"
 *   isExpanded={isExpanded}
 * >
 *   <p>Detailed content goes here...</p>
 * </ExpandContent>
 * ```
 */
export function ExpandContent({
  buttonId,
  contentId,
  isExpanded,
  children,
  className = '',
  animate = true,
  animationDuration = 200,
  onAnimationComplete,
}: ExpandContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(isExpanded ? 'auto' : 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isExpanded);
  const prevExpandedRef = useRef(isExpanded);

  useEffect(() => {
    // Skip animation on initial render
    if (prevExpandedRef.current === isExpanded) {
      return;
    }
    prevExpandedRef.current = isExpanded;

    if (!animate) {
      setShouldRender(isExpanded);
      setHeight(isExpanded ? 'auto' : 0);
      return;
    }

    const content = contentRef.current;
    if (!content) return;

    if (isExpanded) {
      // Expanding: render content first, then animate
      setShouldRender(true);
      setIsAnimating(true);
      
      // Use requestAnimationFrame to ensure content is rendered before measuring
      requestAnimationFrame(() => {
        const scrollHeight = content.scrollHeight;
        setHeight(0);
        
        // Force a reflow to ensure the initial height is applied
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        content.offsetHeight;
        
        requestAnimationFrame(() => {
          setHeight(scrollHeight);
        });
      });
    } else {
      // Collapsing: set explicit height first, then animate to 0
      setIsAnimating(true);
      const scrollHeight = content.scrollHeight;
      setHeight(scrollHeight);
      
      // Force a reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      content.offsetHeight;
      
      requestAnimationFrame(() => {
        setHeight(0);
      });
    }
  }, [isExpanded, animate]);

  // Handle animation end
  useEffect(() => {
    if (!isAnimating) return;

    const timer = setTimeout(() => {
      setIsAnimating(false);
      if (isExpanded) {
        setHeight('auto');
      } else {
        setShouldRender(false);
      }
      onAnimationComplete?.();
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [isAnimating, isExpanded, animationDuration, onAnimationComplete]);

  // For accessibility, use hidden attribute when not expanded and not animating
  const isHidden = !isExpanded && !isAnimating && !shouldRender;

  return (
    <div
      id={contentId}
      ref={contentRef}
      role="region"
      aria-labelledby={buttonId}
      hidden={isHidden}
      aria-hidden={!isExpanded && !isAnimating}
      style={{
        height: animate ? (typeof height === 'number' ? `${height}px` : height) : undefined,
        overflow: isAnimating ? 'hidden' : undefined,
        transition: animate && isAnimating ? `height ${animationDuration}ms ease-out` : undefined,
      }}
      className={className}
    >
      {shouldRender && children}
    </div>
  );
}

/**
 * Props for the combined Expandable component
 */
export interface ExpandableProps {
  /** Unique identifier for this expandable item */
  id: string;
  /** Whether the content is currently expanded */
  isExpanded: boolean;
  /** Callback to toggle expanded state */
  onToggle: () => void;
  /** Content to display in the summary (always visible) */
  summaryContent: React.ReactNode;
  /** Content to display when expanded (depth layer) */
  depthContent: React.ReactNode;
  /** Accessible label for the expand button */
  ariaLabel?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the button */
  buttonClassName?: string;
  /** Additional CSS classes for the content region */
  contentClassName?: string;
  /** Whether to animate the expand/collapse transition (default: true) */
  animate?: boolean;
  /** Animation duration in milliseconds (default: 200ms per Requirement 6.2) */
  animationDuration?: number;
  /** Whether to preserve scroll position during expansion (default: true) */
  preserveScrollPosition?: boolean;
}

/**
 * Expandable component - combines ExpandButton and ExpandContent for progressive disclosure.
 * 
 * This is a convenience component that wraps ExpandButton and ExpandContent together,
 * automatically generating the required IDs and wiring up the accessibility attributes.
 * 
 * Features:
 * - Progressive disclosure pattern (Summary Layer → Depth Layer)
 * - Full accessibility support (ARIA attributes, keyboard navigation)
 * - Smooth height transition animation completing within 200ms (Requirement 6.2)
 * - Scroll position preservation during expansion (Requirement 3.4)
 * - Customizable styling via className props
 * - Works with useExpandable hook for state management
 * 
 * **Validates: Requirements 3.1, 3.4, 3.6, 6.2, 7.2, 7.3**
 * - 3.1: WHEN a Visitor activates an Expansion_Control, THE Depth_Layer SHALL reveal additional content
 * - 3.4: WHEN Depth_Layer content is expanded, THE Content_Architecture SHALL maintain the Visitor's scroll position
 * - 3.6: WHEN a Visitor collapses expanded content, THE Content_Architecture SHALL return to the Summary_Layer view
 * - 6.2: WHEN a Visitor activates an Expansion_Control, THE Depth_Layer content SHALL appear within 200 milliseconds
 * - 7.2: THE Expansion_Controls SHALL be operable via keyboard (Enter/Space to toggle)
 * - 7.3: WHEN Depth_Layer content expands or collapses, THE Content_Architecture SHALL announce state changes to screen readers
 * 
 * @example
 * ```tsx
 * const { isExpanded, toggle } = useExpandable();
 * 
 * <Expandable
 *   id="experience-1"
 *   isExpanded={isExpanded('experience-1')}
 *   onToggle={() => toggle('experience-1')}
 *   summaryContent={<ExperienceSummary experience={experience} />}
 *   depthContent={<ExperienceDepth experience={experience} />}
 *   ariaLabel={`${experience.role} at ${experience.company}`}
 * />
 * ```
 */
export function Expandable({
  id,
  isExpanded,
  onToggle,
  summaryContent,
  depthContent,
  ariaLabel,
  className = '',
  buttonClassName = '',
  contentClassName = '',
  animate = true,
  animationDuration = 200,
  preserveScrollPosition = true,
}: ExpandableProps) {
  // Generate unique IDs for accessibility attributes
  const buttonId = `expand-btn-${id}`;
  const contentId = `expand-content-${id}`;
  
  // Ref for the container to calculate scroll position
  const containerRef = useRef<HTMLDivElement>(null);
  
  /**
   * Handle toggle with scroll position preservation.
   * 
   * When expanding, we capture the button's position relative to the viewport
   * before the expansion, then after the content expands, we adjust the scroll
   * position to keep the button in approximately the same viewport position.
   * 
   * **Validates: Requirement 3.4**
   * - 3.4: WHEN Depth_Layer content is expanded, THE Content_Architecture SHALL maintain the Visitor's scroll position
   */
  const handleToggle = useCallback(() => {
    if (!preserveScrollPosition || typeof window === 'undefined') {
      onToggle();
      return;
    }

    // Get the button element
    const button = containerRef.current?.querySelector('button');
    if (!button) {
      onToggle();
      return;
    }

    // Capture the button's position relative to the viewport before toggle
    const buttonRect = button.getBoundingClientRect();
    const buttonTopBeforeToggle = buttonRect.top;

    // Perform the toggle
    onToggle();

    // After the state update and re-render, adjust scroll position
    // Use requestAnimationFrame to ensure the DOM has updated
    requestAnimationFrame(() => {
      const newButtonRect = button.getBoundingClientRect();
      const buttonTopAfterToggle = newButtonRect.top;
      
      // Calculate the difference and adjust scroll
      const scrollDiff = buttonTopAfterToggle - buttonTopBeforeToggle;
      
      if (Math.abs(scrollDiff) > 1) {
        window.scrollBy({
          top: scrollDiff,
          behavior: 'instant',
        });
      }
    });
  }, [onToggle, preserveScrollPosition]);

  return (
    <div ref={containerRef} className={className}>
      {/* Summary layer with expand button */}
      <ExpandButton
        buttonId={buttonId}
        contentId={contentId}
        isExpanded={isExpanded}
        onClick={handleToggle}
        ariaLabel={ariaLabel}
        className={`w-full text-left ${buttonClassName}`}
      >
        {summaryContent}
      </ExpandButton>

      {/* Depth layer (expandable content) with animation */}
      <ExpandContent
        buttonId={buttonId}
        contentId={contentId}
        isExpanded={isExpanded}
        className={contentClassName}
        animate={animate}
        animationDuration={animationDuration}
      >
        {depthContent}
      </ExpandContent>
    </div>
  );
}

export default Expandable;
