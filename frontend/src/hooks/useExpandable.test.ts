import { renderHook, act } from '@testing-library/react';
import { useExpandable } from './useExpandable';

describe('useExpandable Hook', () => {
  describe('Initialization', () => {
    it('returns empty expandedIds by default', () => {
      const { result } = renderHook(() => useExpandable());
      
      expect(result.current.expandedIds.size).toBe(0);
    });

    it('initializes with provided expandedIds', () => {
      const { result } = renderHook(() => 
        useExpandable({ initialExpandedIds: ['item-1', 'item-2'] })
      );
      
      expect(result.current.expandedIds.size).toBe(2);
      expect(result.current.isExpanded('item-1')).toBe(true);
      expect(result.current.isExpanded('item-2')).toBe(true);
    });

    it('defaults to allowMultiple=true', () => {
      const { result } = renderHook(() => useExpandable());
      
      // Expand multiple items
      act(() => {
        result.current.expand('item-1');
        result.current.expand('item-2');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(true);
      expect(result.current.isExpanded('item-2')).toBe(true);
    });
  });

  describe('isExpanded', () => {
    it('returns true for expanded items', () => {
      const { result } = renderHook(() => 
        useExpandable({ initialExpandedIds: ['item-1'] })
      );
      
      expect(result.current.isExpanded('item-1')).toBe(true);
    });

    it('returns false for collapsed items', () => {
      const { result } = renderHook(() => useExpandable());
      
      expect(result.current.isExpanded('item-1')).toBe(false);
    });

    it('returns false for items that were never added', () => {
      const { result } = renderHook(() => 
        useExpandable({ initialExpandedIds: ['item-1'] })
      );
      
      expect(result.current.isExpanded('nonexistent')).toBe(false);
    });
  });

  describe('toggle', () => {
    it('expands a collapsed item', () => {
      const { result } = renderHook(() => useExpandable());
      
      expect(result.current.isExpanded('item-1')).toBe(false);
      
      act(() => {
        result.current.toggle('item-1');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(true);
    });

    it('collapses an expanded item', () => {
      const { result } = renderHook(() => 
        useExpandable({ initialExpandedIds: ['item-1'] })
      );
      
      expect(result.current.isExpanded('item-1')).toBe(true);
      
      act(() => {
        result.current.toggle('item-1');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(false);
    });

    it('allows multiple items expanded when allowMultiple=true', () => {
      const { result } = renderHook(() => 
        useExpandable({ allowMultiple: true })
      );
      
      act(() => {
        result.current.toggle('item-1');
      });
      
      act(() => {
        result.current.toggle('item-2');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(true);
      expect(result.current.isExpanded('item-2')).toBe(true);
    });

    it('collapses other items when allowMultiple=false (accordion mode)', () => {
      const { result } = renderHook(() => 
        useExpandable({ allowMultiple: false })
      );
      
      act(() => {
        result.current.toggle('item-1');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(true);
      
      act(() => {
        result.current.toggle('item-2');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(false);
      expect(result.current.isExpanded('item-2')).toBe(true);
    });

    it('can collapse in single mode without expanding another', () => {
      const { result } = renderHook(() => 
        useExpandable({ allowMultiple: false, initialExpandedIds: ['item-1'] })
      );
      
      expect(result.current.isExpanded('item-1')).toBe(true);
      
      act(() => {
        result.current.toggle('item-1');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(false);
      expect(result.current.expandedIds.size).toBe(0);
    });
  });

  describe('expand', () => {
    it('expands a collapsed item', () => {
      const { result } = renderHook(() => useExpandable());
      
      act(() => {
        result.current.expand('item-1');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(true);
    });

    it('is a no-op for already expanded items', () => {
      const { result } = renderHook(() => 
        useExpandable({ initialExpandedIds: ['item-1'] })
      );
      
      const initialSet = result.current.expandedIds;
      
      act(() => {
        result.current.expand('item-1');
      });
      
      // Should return the same Set reference (no state change)
      expect(result.current.expandedIds).toBe(initialSet);
    });

    it('collapses others when allowMultiple=false', () => {
      const { result } = renderHook(() => 
        useExpandable({ allowMultiple: false, initialExpandedIds: ['item-1'] })
      );
      
      act(() => {
        result.current.expand('item-2');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(false);
      expect(result.current.isExpanded('item-2')).toBe(true);
    });
  });

  describe('collapse', () => {
    it('collapses an expanded item', () => {
      const { result } = renderHook(() => 
        useExpandable({ initialExpandedIds: ['item-1'] })
      );
      
      act(() => {
        result.current.collapse('item-1');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(false);
    });

    it('is a no-op for already collapsed items', () => {
      const { result } = renderHook(() => useExpandable());
      
      const initialSet = result.current.expandedIds;
      
      act(() => {
        result.current.collapse('item-1');
      });
      
      // Should return the same Set reference (no state change)
      expect(result.current.expandedIds).toBe(initialSet);
    });

    it('does not affect other expanded items', () => {
      const { result } = renderHook(() => 
        useExpandable({ initialExpandedIds: ['item-1', 'item-2', 'item-3'] })
      );
      
      act(() => {
        result.current.collapse('item-2');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(true);
      expect(result.current.isExpanded('item-2')).toBe(false);
      expect(result.current.isExpanded('item-3')).toBe(true);
    });
  });

  describe('collapseAll', () => {
    it('collapses all expanded items', () => {
      const { result } = renderHook(() => 
        useExpandable({ initialExpandedIds: ['item-1', 'item-2', 'item-3'] })
      );
      
      expect(result.current.expandedIds.size).toBe(3);
      
      act(() => {
        result.current.collapseAll();
      });
      
      expect(result.current.expandedIds.size).toBe(0);
      expect(result.current.isExpanded('item-1')).toBe(false);
      expect(result.current.isExpanded('item-2')).toBe(false);
      expect(result.current.isExpanded('item-3')).toBe(false);
    });

    it('is a no-op when nothing is expanded', () => {
      const { result } = renderHook(() => useExpandable());
      
      const initialSet = result.current.expandedIds;
      
      act(() => {
        result.current.collapseAll();
      });
      
      // Should return the same Set reference (no state change)
      expect(result.current.expandedIds).toBe(initialSet);
    });
  });

  describe('expandAll', () => {
    it('expands multiple items at once', () => {
      const { result } = renderHook(() => useExpandable());
      
      act(() => {
        result.current.expandAll(['item-1', 'item-2', 'item-3']);
      });
      
      expect(result.current.isExpanded('item-1')).toBe(true);
      expect(result.current.isExpanded('item-2')).toBe(true);
      expect(result.current.isExpanded('item-3')).toBe(true);
    });

    it('preserves existing expanded items when allowMultiple=true', () => {
      const { result } = renderHook(() => 
        useExpandable({ initialExpandedIds: ['existing'] })
      );
      
      act(() => {
        result.current.expandAll(['item-1', 'item-2']);
      });
      
      expect(result.current.isExpanded('existing')).toBe(true);
      expect(result.current.isExpanded('item-1')).toBe(true);
      expect(result.current.isExpanded('item-2')).toBe(true);
    });

    it('only expands last item when allowMultiple=false', () => {
      const { result } = renderHook(() => 
        useExpandable({ allowMultiple: false })
      );
      
      act(() => {
        result.current.expandAll(['item-1', 'item-2', 'item-3']);
      });
      
      expect(result.current.isExpanded('item-1')).toBe(false);
      expect(result.current.isExpanded('item-2')).toBe(false);
      expect(result.current.isExpanded('item-3')).toBe(true);
      expect(result.current.expandedIds.size).toBe(1);
    });

    it('handles empty array', () => {
      const { result } = renderHook(() => 
        useExpandable({ initialExpandedIds: ['existing'] })
      );
      
      act(() => {
        result.current.expandAll([]);
      });
      
      // Should preserve existing state
      expect(result.current.isExpanded('existing')).toBe(true);
    });

    it('handles empty array in single mode', () => {
      const { result } = renderHook(() => 
        useExpandable({ allowMultiple: false, initialExpandedIds: ['existing'] })
      );
      
      act(() => {
        result.current.expandAll([]);
      });
      
      // In single mode with empty array, should result in empty set
      expect(result.current.expandedIds.size).toBe(0);
    });
  });

  describe('Property 6: Expand/Collapse Round Trip', () => {
    /**
     * **Validates: Requirements 3.1, 3.6**
     * For any expandable content item, expanding then collapsing SHALL return 
     * the view to its original Summary_Layer state, with the Depth_Layer hidden 
     * and only summary content visible.
     */
    it('expanding then collapsing returns to original state', () => {
      const { result } = renderHook(() => useExpandable());
      
      // Initial state - nothing expanded
      expect(result.current.isExpanded('item-1')).toBe(false);
      
      // Expand
      act(() => {
        result.current.toggle('item-1');
      });
      expect(result.current.isExpanded('item-1')).toBe(true);
      
      // Collapse
      act(() => {
        result.current.toggle('item-1');
      });
      
      // Should be back to original collapsed state
      expect(result.current.isExpanded('item-1')).toBe(false);
    });

    it('multiple expand/collapse cycles maintain consistency', () => {
      const { result } = renderHook(() => useExpandable());
      
      // Multiple cycles
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.toggle('item-1');
        });
        expect(result.current.isExpanded('item-1')).toBe(true);
        
        act(() => {
          result.current.toggle('item-1');
        });
        expect(result.current.isExpanded('item-1')).toBe(false);
      }
    });

    it('expand then collapse via explicit methods returns to original state', () => {
      const { result } = renderHook(() => useExpandable());
      
      expect(result.current.isExpanded('item-1')).toBe(false);
      
      act(() => {
        result.current.expand('item-1');
      });
      expect(result.current.isExpanded('item-1')).toBe(true);
      
      act(() => {
        result.current.collapse('item-1');
      });
      expect(result.current.isExpanded('item-1')).toBe(false);
    });

    it('collapseAll returns all items to collapsed state', () => {
      const { result } = renderHook(() => useExpandable());
      
      // Expand multiple items
      act(() => {
        result.current.expandAll(['item-1', 'item-2', 'item-3']);
      });
      
      expect(result.current.expandedIds.size).toBe(3);
      
      // Collapse all
      act(() => {
        result.current.collapseAll();
      });
      
      // All should be collapsed
      expect(result.current.expandedIds.size).toBe(0);
      expect(result.current.isExpanded('item-1')).toBe(false);
      expect(result.current.isExpanded('item-2')).toBe(false);
      expect(result.current.isExpanded('item-3')).toBe(false);
    });
  });

  describe('State Persistence', () => {
    it('maintains state across re-renders', () => {
      const { result, rerender } = renderHook(() => useExpandable());
      
      act(() => {
        result.current.expand('item-1');
      });
      
      expect(result.current.isExpanded('item-1')).toBe(true);
      
      // Re-render
      rerender();
      
      // State should persist
      expect(result.current.isExpanded('item-1')).toBe(true);
    });

    it('function references are stable across re-renders', () => {
      const { result, rerender } = renderHook(() => useExpandable());
      
      const initialToggle = result.current.toggle;
      const initialExpand = result.current.expand;
      const initialCollapse = result.current.collapse;
      const initialCollapseAll = result.current.collapseAll;
      const initialExpandAll = result.current.expandAll;
      
      rerender();
      
      // Functions should be memoized and stable
      expect(result.current.toggle).toBe(initialToggle);
      expect(result.current.expand).toBe(initialExpand);
      expect(result.current.collapse).toBe(initialCollapse);
      expect(result.current.collapseAll).toBe(initialCollapseAll);
      expect(result.current.expandAll).toBe(initialExpandAll);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string IDs', () => {
      const { result } = renderHook(() => useExpandable());
      
      act(() => {
        result.current.expand('');
      });
      
      expect(result.current.isExpanded('')).toBe(true);
      
      act(() => {
        result.current.collapse('');
      });
      
      expect(result.current.isExpanded('')).toBe(false);
    });

    it('handles special characters in IDs', () => {
      const { result } = renderHook(() => useExpandable());
      
      const specialId = 'item-with-special-chars-!@#$%^&*()';
      
      act(() => {
        result.current.expand(specialId);
      });
      
      expect(result.current.isExpanded(specialId)).toBe(true);
    });

    it('handles duplicate IDs in initialExpandedIds', () => {
      const { result } = renderHook(() => 
        useExpandable({ initialExpandedIds: ['item-1', 'item-1', 'item-1'] })
      );
      
      // Set should deduplicate
      expect(result.current.expandedIds.size).toBe(1);
      expect(result.current.isExpanded('item-1')).toBe(true);
    });

    it('handles duplicate IDs in expandAll', () => {
      const { result } = renderHook(() => useExpandable());
      
      act(() => {
        result.current.expandAll(['item-1', 'item-1', 'item-2', 'item-2']);
      });
      
      // Set should deduplicate
      expect(result.current.expandedIds.size).toBe(2);
    });
  });
});
