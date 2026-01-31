import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

describe('useReducedMotion', () => {
  // Store original matchMedia
  const originalMatchMedia = window.matchMedia;

  // Mock matchMedia helper
  const createMockMatchMedia = (matches: boolean) => {
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];

    const mockMediaQueryList = {
      matches,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          listeners.push(callback);
        }
      }),
      removeEventListener: jest.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          const index = listeners.indexOf(callback);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      }),
      dispatchEvent: jest.fn(),
      // Helper to trigger change events in tests
      _triggerChange: (newMatches: boolean) => {
        listeners.forEach((listener) => {
          listener({ matches: newMatches } as MediaQueryListEvent);
        });
      },
    };

    return {
      mockFn: jest.fn().mockReturnValue(mockMediaQueryList),
      mockMediaQueryList,
    };
  };

  afterEach(() => {
    // Restore original matchMedia after each test
    window.matchMedia = originalMatchMedia;
  });

  it('should return false by default (SSR-safe default)', () => {
    const { mockFn } = createMockMatchMedia(false);
    window.matchMedia = mockFn;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it('should return true when user prefers reduced motion', () => {
    const { mockFn } = createMockMatchMedia(true);
    window.matchMedia = mockFn;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it('should query the correct media feature', () => {
    const { mockFn } = createMockMatchMedia(false);
    window.matchMedia = mockFn;

    renderHook(() => useReducedMotion());

    expect(mockFn).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('should add event listener for preference changes', () => {
    const { mockFn, mockMediaQueryList } = createMockMatchMedia(false);
    window.matchMedia = mockFn;

    renderHook(() => useReducedMotion());

    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('should remove event listener on unmount', () => {
    const { mockFn, mockMediaQueryList } = createMockMatchMedia(false);
    window.matchMedia = mockFn;

    const { unmount } = renderHook(() => useReducedMotion());
    unmount();

    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('should update when preference changes from false to true', () => {
    const { mockFn, mockMediaQueryList } = createMockMatchMedia(false);
    window.matchMedia = mockFn;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    // Simulate preference change
    act(() => {
      mockMediaQueryList._triggerChange(true);
    });

    expect(result.current).toBe(true);
  });

  it('should update when preference changes from true to false', () => {
    const { mockFn, mockMediaQueryList } = createMockMatchMedia(true);
    window.matchMedia = mockFn;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);

    // Simulate preference change
    act(() => {
      mockMediaQueryList._triggerChange(false);
    });

    expect(result.current).toBe(false);
  });
});
