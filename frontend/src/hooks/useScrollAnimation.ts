import { useState, useEffect, useCallback, CSSProperties, RefCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Options for the useScrollAnimation hook
 */
export interface UseScrollAnimationOptions {
  /** Threshold for triggering animation (0-1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Whether to trigger only once */
  triggerOnce?: boolean;
  /** Whether to respect reduced motion preference */
  respectReducedMotion?: boolean;
}

/**
 * Return type for the useScrollAnimation hook
 */
export interface UseScrollAnimationReturn {
  /** Ref callback to attach to the animated element */
  ref: RefCallback<HTMLElement>;
  /** Whether the element is in view */
  isInView: boolean;
  /** Animation style object to apply */
  animationStyle: CSSProperties;
}

/**
 * Default animation styles when element is NOT in view
 */
const HIDDEN_STYLE: CSSProperties = {
  opacity: 0,
  transform: 'translateY(20px)',
  transition: 'opacity 300ms ease-out, transform 300ms ease-out',
};

/**
 * Animation styles when element IS in view
 */
const VISIBLE_STYLE: CSSProperties = {
  opacity: 1,
  transform: 'translateY(0)',
  transition: 'opacity 300ms ease-out, transform 300ms ease-out',
};

/**
 * Styles for reduced motion - no transform, instant opacity
 */
const REDUCED_MOTION_HIDDEN_STYLE: CSSProperties = {
  opacity: 0,
};

const REDUCED_MOTION_VISIBLE_STYLE: CSSProperties = {
  opacity: 1,
};

/**
 * Hook for scroll-triggered animations using IntersectionObserver.
 *
 * This hook:
 * - Uses IntersectionObserver for efficient scroll detection
 * - Returns ref callback, isInView state, and animation style object
 * - Supports triggerOnce option for one-time animations
 * - Respects reduced motion preference via useReducedMotion
 * - Provides fallback for browsers without IntersectionObserver
 *
 * @param options - Configuration options for the animation
 * @returns Object containing ref callback, isInView state, and animationStyle
 *
 * @example
 * ```tsx
 * function AnimatedSection() {
 *   const { ref, isInView, animationStyle } = useScrollAnimation({
 *     threshold: 0.1,
 *     triggerOnce: true,
 *   });
 *
 *   return (
 *     <section ref={ref} style={animationStyle}>
 *       Content that fades in on scroll
 *     </section>
 *   );
 * }
 * ```
 */
export function useScrollAnimation(
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationReturn {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false,
    respectReducedMotion = true,
  } = options;

  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Determine if we should use reduced motion styles
  const useReducedMotionStyles = respectReducedMotion && prefersReducedMotion;

  // Callback ref to capture the element
  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    // Handle SSR - window/document not available on server
    if (typeof window === 'undefined') return;

    if (!element) return;

    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      // Fallback: show content immediately without animation
      setIsInView(true);
      setHasTriggered(true);
      return;
    }

    // If triggerOnce and already triggered, don't observe
    if (triggerOnce && hasTriggered) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting;

          if (triggerOnce) {
            // Only trigger once - set to true and never go back to false
            if (inView && !hasTriggered) {
              setIsInView(true);
              setHasTriggered(true);
              // Disconnect observer since we only need to trigger once
              observer.disconnect();
            }
          } else {
            // Normal behavior - update based on visibility
            setIsInView(inView);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, threshold, rootMargin, triggerOnce, hasTriggered]);

  // Calculate animation style based on state
  const animationStyle: CSSProperties = useReducedMotionStyles
    ? isInView
      ? REDUCED_MOTION_VISIBLE_STYLE
      : REDUCED_MOTION_HIDDEN_STYLE
    : isInView
      ? VISIBLE_STYLE
      : HIDDEN_STYLE;

  return {
    ref,
    isInView,
    animationStyle,
  };
}
