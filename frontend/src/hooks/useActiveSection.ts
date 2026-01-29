'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Options for the useActiveSection hook
 */
export interface UseActiveSectionOptions {
  /** Section IDs to observe (without # prefix) */
  sectionIds: string[];
  /** Root margin for Intersection Observer (default: '-20% 0px -70% 0px') */
  rootMargin?: string;
  /** Threshold for intersection (default: 0) */
  threshold?: number | number[];
  /** Default section to show when no section is visible (default: first section) */
  defaultSection?: string;
}

/**
 * Return type for the useActiveSection hook
 */
export interface UseActiveSectionReturn {
  /** Currently active section ID (without #) */
  activeSection: string;
  /** Manually set the active section (e.g., when user clicks navigation) */
  setActiveSection: (sectionId: string) => void;
  /** Whether the hook is currently observing sections */
  isObserving: boolean;
}

/**
 * Custom hook for scroll-based active section detection using Intersection Observer.
 * 
 * This hook tracks which section is currently visible in the viewport and updates
 * the active section state accordingly. It's designed for single-page navigation
 * where sections are identified by their IDs.
 * 
 * Features:
 * - Uses Intersection Observer for efficient scroll tracking
 * - Handles multiple sections with priority to the topmost visible section
 * - Supports manual override when user clicks navigation
 * - Gracefully handles missing sections
 * - SSR-safe (no-op on server)
 * 
 * **Validates: Requirements 1.5** - Navigation_System SHALL indicate the current active section
 * 
 * @example
 * ```tsx
 * const { activeSection, setActiveSection } = useActiveSection({
 *   sectionIds: ['about', 'experience', 'projects', 'skills', 'contact'],
 * });
 * 
 * // Use activeSection for navigation highlighting
 * // Use setActiveSection when user clicks a nav link
 * ```
 */
export function useActiveSection({
  sectionIds,
  rootMargin = '-20% 0px -70% 0px',
  threshold = 0,
  defaultSection,
}: UseActiveSectionOptions): UseActiveSectionReturn {
  // Default to first section if not specified
  const initialSection = defaultSection || sectionIds[0] || '';
  
  const [activeSection, setActiveSectionState] = useState<string>(initialSection);
  const [isObserving, setIsObserving] = useState(false);
  
  // Track which sections are currently intersecting
  const visibleSectionsRef = useRef<Map<string, IntersectionObserverEntry>>(new Map());
  
  // Track if user manually navigated (to temporarily disable scroll updates)
  const manualNavigationRef = useRef(false);
  const manualNavigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Determine which section should be active based on visible sections.
   * Priority is given to the section that appears first in the sectionIds array
   * (typically the topmost section in the page).
   */
  const determineActiveSection = useCallback(() => {
    const visibleSections = visibleSectionsRef.current;
    
    if (visibleSections.size === 0) {
      return;
    }

    // Find the first section (by order in sectionIds) that is currently visible
    for (const sectionId of sectionIds) {
      const entry = visibleSections.get(sectionId);
      if (entry && entry.isIntersecting) {
        setActiveSectionState(sectionId);
        return;
      }
    }
  }, [sectionIds]);

  /**
   * Manually set the active section (e.g., when user clicks navigation).
   * This temporarily disables scroll-based updates to prevent flickering.
   */
  const setActiveSection = useCallback((sectionId: string) => {
    // Clear any existing timeout
    if (manualNavigationTimeoutRef.current) {
      clearTimeout(manualNavigationTimeoutRef.current);
    }
    
    // Set manual navigation flag
    manualNavigationRef.current = true;
    
    // Update the active section immediately
    setActiveSectionState(sectionId);
    
    // Re-enable scroll-based updates after a delay (to allow scroll animation to complete)
    manualNavigationTimeoutRef.current = setTimeout(() => {
      manualNavigationRef.current = false;
    }, 1000);
  }, []);

  /**
   * Intersection Observer callback
   */
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    // Skip updates during manual navigation
    if (manualNavigationRef.current) {
      return;
    }

    // Update the visible sections map
    entries.forEach((entry) => {
      const sectionId = entry.target.id;
      
      if (entry.isIntersecting) {
        visibleSectionsRef.current.set(sectionId, entry);
      } else {
        visibleSectionsRef.current.delete(sectionId);
      }
    });

    // Determine which section should be active
    determineActiveSection();
  }, [determineActiveSection]);

  /**
   * Set up Intersection Observer
   */
  useEffect(() => {
    // Skip on server
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    // Create the observer
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    });

    // Observe all sections
    const observedElements: Element[] = [];
    
    sectionIds.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
        observedElements.push(element);
      }
    });

    setIsObserving(observedElements.length > 0);

    // Cleanup
    return () => {
      observer.disconnect();
      visibleSectionsRef.current.clear();
      setIsObserving(false);
      
      if (manualNavigationTimeoutRef.current) {
        clearTimeout(manualNavigationTimeoutRef.current);
      }
    };
  }, [sectionIds, rootMargin, threshold, handleIntersection]);

  return {
    activeSection,
    setActiveSection,
    isObserving,
  };
}

export default useActiveSection;
