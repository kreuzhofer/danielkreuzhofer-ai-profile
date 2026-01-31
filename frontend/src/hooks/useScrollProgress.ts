import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Return type for the useScrollProgress hook
 */
export interface UseScrollProgressReturn {
  /** Current scroll progress (0-1) */
  progress: number;
  /** Whether user is currently scrolling */
  isScrolling: boolean;
}

/**
 * Hook to track scroll progress through the document.
 *
 * This hook:
 * - Calculates scroll progress as a 0-1 value based on document scroll
 * - Uses passive scroll event listener for performance
 * - Debounces updates to prevent excessive re-renders
 * - Tracks whether the user is currently scrolling
 *
 * @returns Object containing progress (0-1) and isScrolling state
 *
 * @example
 * ```tsx
 * function ProgressBar() {
 *   const { progress, isScrolling } = useScrollProgress();
 *
 *   return (
 *     <div
 *       style={{
 *         width: `${progress * 100}%`,
 *         opacity: isScrolling ? 1 : 0.5
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function useScrollProgress(): UseScrollProgressReturn {
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Refs for debouncing
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate scroll progress
  const calculateProgress = useCallback(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return 0;
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Calculate the maximum scrollable distance
    const maxScroll = scrollHeight - clientHeight;

    // Avoid division by zero
    if (maxScroll <= 0) {
      return 0;
    }

    // Calculate progress as 0-1 value, clamped to valid range
    const calculatedProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

    return calculatedProgress;
  }, []);

  useEffect(() => {
    // Handle SSR - window is not available on server
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      // Set scrolling state immediately
      setIsScrolling(true);

      // Clear existing debounce timeout for progress update
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Clear existing timeout for isScrolling reset
      if (isScrollingTimeoutRef.current) {
        clearTimeout(isScrollingTimeoutRef.current);
      }

      // Debounce progress update (16ms ~ 60fps)
      scrollTimeoutRef.current = setTimeout(() => {
        setProgress(calculateProgress());
      }, 16);

      // Reset isScrolling after scroll stops (150ms delay)
      isScrollingTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    // Set initial progress
    setProgress(calculateProgress());

    // Add passive scroll listener for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      if (isScrollingTimeoutRef.current) {
        clearTimeout(isScrollingTimeoutRef.current);
      }
    };
  }, [calculateProgress]);

  return { progress, isScrolling };
}
