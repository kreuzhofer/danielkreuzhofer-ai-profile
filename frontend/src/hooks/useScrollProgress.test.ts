import { renderHook, act } from '@testing-library/react';
import { useScrollProgress } from './useScrollProgress';

describe('useScrollProgress', () => {
  // Store original values
  const originalScrollY = window.scrollY;
  const originalScrollHeight = document.documentElement.scrollHeight;
  const originalClientHeight = document.documentElement.clientHeight;

  // Helper to mock scroll properties
  const mockScrollProperties = (scrollY: number, scrollHeight: number, clientHeight: number) => {
    Object.defineProperty(window, 'scrollY', {
      value: scrollY,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: scrollY,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: scrollHeight,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: clientHeight,
      writable: true,
      configurable: true,
    });
  };

  // Helper to restore original values
  const restoreScrollProperties = () => {
    Object.defineProperty(window, 'scrollY', {
      value: originalScrollY,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: originalScrollHeight,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: originalClientHeight,
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    restoreScrollProperties();
    jest.useRealTimers();
  });

  it('should return initial progress of 0 when at top of page', () => {
    mockScrollProperties(0, 2000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current.progress).toBe(0);
  });

  it('should return progress of 1 when at bottom of page', () => {
    // scrollY = 1000, scrollHeight = 2000, clientHeight = 1000
    // maxScroll = 2000 - 1000 = 1000
    // progress = 1000 / 1000 = 1
    mockScrollProperties(1000, 2000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current.progress).toBe(1);
  });

  it('should return progress of 0.5 when halfway through page', () => {
    // scrollY = 500, scrollHeight = 2000, clientHeight = 1000
    // maxScroll = 2000 - 1000 = 1000
    // progress = 500 / 1000 = 0.5
    mockScrollProperties(500, 2000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current.progress).toBe(0.5);
  });

  it('should return 0 when page is not scrollable (content fits in viewport)', () => {
    // scrollHeight equals clientHeight, no scrolling possible
    mockScrollProperties(0, 1000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current.progress).toBe(0);
  });

  it('should clamp progress to 0 when scrollY is negative', () => {
    mockScrollProperties(-100, 2000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current.progress).toBe(0);
  });

  it('should clamp progress to 1 when scrollY exceeds max scroll', () => {
    // scrollY = 1500, but maxScroll = 1000
    mockScrollProperties(1500, 2000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current.progress).toBe(1);
  });

  it('should return isScrolling as false initially', () => {
    mockScrollProperties(0, 2000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current.isScrolling).toBe(false);
  });

  it('should set isScrolling to true when scroll event fires', () => {
    mockScrollProperties(0, 2000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isScrolling).toBe(true);
  });

  it('should set isScrolling back to false after scroll stops', () => {
    mockScrollProperties(0, 2000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isScrolling).toBe(true);

    // Fast-forward past the isScrolling timeout (150ms)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isScrolling).toBe(false);
  });

  it('should update progress when scroll event fires', () => {
    mockScrollProperties(0, 2000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current.progress).toBe(0);

    // Update scroll position
    mockScrollProperties(500, 2000, 1000);

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      // Fast-forward past the debounce timeout (16ms)
      jest.advanceTimersByTime(20);
    });

    expect(result.current.progress).toBe(0.5);
  });

  it('should add scroll event listener with passive option', () => {
    mockScrollProperties(0, 2000, 1000);

    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    renderHook(() => useScrollProgress());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true }
    );

    addEventListenerSpy.mockRestore();
  });

  it('should remove scroll event listener on unmount', () => {
    mockScrollProperties(0, 2000, 1000);

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScrollProgress());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it('should debounce rapid scroll events', () => {
    mockScrollProperties(0, 2000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    // Simulate rapid scroll events
    act(() => {
      mockScrollProperties(100, 2000, 1000);
      window.dispatchEvent(new Event('scroll'));
    });

    act(() => {
      mockScrollProperties(200, 2000, 1000);
      window.dispatchEvent(new Event('scroll'));
    });

    act(() => {
      mockScrollProperties(300, 2000, 1000);
      window.dispatchEvent(new Event('scroll'));
    });

    // Progress should not have updated yet (debounced)
    // After debounce, should reflect the latest scroll position
    act(() => {
      jest.advanceTimersByTime(20);
    });

    // Should be 300/1000 = 0.3
    expect(result.current.progress).toBe(0.3);
  });

  it('should keep isScrolling true during continuous scrolling', () => {
    mockScrollProperties(0, 2000, 1000);

    const { result } = renderHook(() => useScrollProgress());

    // First scroll
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isScrolling).toBe(true);

    // Advance time but not past the timeout
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Another scroll before timeout
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    // Should still be scrolling
    expect(result.current.isScrolling).toBe(true);

    // Advance past the timeout
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isScrolling).toBe(false);
  });
});
