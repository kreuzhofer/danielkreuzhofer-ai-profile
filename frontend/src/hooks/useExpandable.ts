'use client';

import { useState, useCallback } from 'react';

/**
 * Options for the useExpandable hook
 */
export interface UseExpandableOptions {
  /** Initial set of expanded item IDs (default: empty set) */
  initialExpandedIds?: string[];
  /** Whether to allow multiple items expanded simultaneously (default: true) */
  allowMultiple?: boolean;
}

/**
 * Return type for the useExpandable hook
 */
export interface UseExpandableReturn {
  /** Set of currently expanded item IDs */
  expandedIds: Set<string>;
  /** Check if a specific item is expanded */
  isExpanded: (id: string) => boolean;
  /** Toggle the expanded state of an item */
  toggle: (id: string) => void;
  /** Expand a specific item */
  expand: (id: string) => void;
  /** Collapse a specific item */
  collapse: (id: string) => void;
  /** Collapse all expanded items */
  collapseAll: () => void;
  /** Expand multiple items at once */
  expandAll: (ids: string[]) => void;
}

/**
 * Custom hook for managing expand/collapse state of multiple items.
 * 
 * This hook provides state management for expandable content items,
 * supporting both single and multiple items expanded simultaneously.
 * It's designed for progressive disclosure patterns where users can
 * expand items to see more detail.
 * 
 * Features:
 * - Manages a set of expanded item IDs
 * - Supports multiple items expanded at once (configurable)
 * - Provides toggle, expand, collapse, and bulk operations
 * - Maintains state across re-renders
 * - Returns stable function references (memoized)
 * 
 * **Validates: Requirements 3.1, 3.6**
 * - 3.1: WHEN a Visitor activates an Expansion_Control, THE Depth_Layer SHALL reveal additional content
 * - 3.6: WHEN a Visitor collapses expanded content, THE Content_Architecture SHALL return to the Summary_Layer view
 * 
 * @example
 * ```tsx
 * const { isExpanded, toggle } = useExpandable();
 * 
 * // In a list of items
 * {items.map(item => (
 *   <ExpandableItem
 *     key={item.id}
 *     isExpanded={isExpanded(item.id)}
 *     onToggle={() => toggle(item.id)}
 *   />
 * ))}
 * ```
 * 
 * @example
 * ```tsx
 * // Single item mode (accordion behavior)
 * const { isExpanded, toggle } = useExpandable({ allowMultiple: false });
 * ```
 */
export function useExpandable({
  initialExpandedIds = [],
  allowMultiple = true,
}: UseExpandableOptions = {}): UseExpandableReturn {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(initialExpandedIds)
  );

  /**
   * Check if a specific item is expanded
   */
  const isExpanded = useCallback(
    (id: string): boolean => {
      return expandedIds.has(id);
    },
    [expandedIds]
  );

  /**
   * Toggle the expanded state of an item.
   * If allowMultiple is false, expanding an item will collapse all others.
   */
  const toggle = useCallback(
    (id: string): void => {
      setExpandedIds((prev) => {
        const newSet = new Set(prev);
        
        if (newSet.has(id)) {
          // Collapse the item
          newSet.delete(id);
        } else {
          // Expand the item
          if (!allowMultiple) {
            // In single mode, clear all others first
            newSet.clear();
          }
          newSet.add(id);
        }
        
        return newSet;
      });
    },
    [allowMultiple]
  );

  /**
   * Expand a specific item (no-op if already expanded)
   */
  const expand = useCallback(
    (id: string): void => {
      setExpandedIds((prev) => {
        if (prev.has(id)) {
          return prev; // Already expanded, no change needed
        }
        
        const newSet = allowMultiple ? new Set(prev) : new Set<string>();
        newSet.add(id);
        return newSet;
      });
    },
    [allowMultiple]
  );

  /**
   * Collapse a specific item (no-op if already collapsed)
   */
  const collapse = useCallback((id: string): void => {
    setExpandedIds((prev) => {
      if (!prev.has(id)) {
        return prev; // Already collapsed, no change needed
      }
      
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  /**
   * Collapse all expanded items
   */
  const collapseAll = useCallback((): void => {
    setExpandedIds((prev) => {
      if (prev.size === 0) {
        return prev; // Already all collapsed
      }
      return new Set<string>();
    });
  }, []);

  /**
   * Expand multiple items at once
   */
  const expandAll = useCallback(
    (ids: string[]): void => {
      setExpandedIds((prev) => {
        if (allowMultiple) {
          const newSet = new Set(prev);
          ids.forEach((id) => newSet.add(id));
          return newSet;
        } else {
          // In single mode, only expand the last item
          return new Set(ids.length > 0 ? [ids[ids.length - 1]] : []);
        }
      });
    },
    [allowMultiple]
  );

  return {
    expandedIds,
    isExpanded,
    toggle,
    expand,
    collapse,
    collapseAll,
    expandAll,
  };
}

export default useExpandable;
