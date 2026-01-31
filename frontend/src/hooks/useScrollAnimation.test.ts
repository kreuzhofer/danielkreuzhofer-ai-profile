import { renderHook, act } from '@testing-library/react';
import { useScrollAnimation } from './useScrollAnimation';

// Mock useReducedMotion hook
jest.mock('./useReducedMotion', () => ({
  useReducedMotion: jest.fn(() => false),
}));

import { useReducedMotion } from './useReducedMotion';

const mockUseReducedMotion = useReducedMotion as jest.MockedFunction<typeof useReducedMotion>;

describe('useScrollAnimation', () => {
  // Store original IntersectionObserver
  const originalIntersectionObserver = window.IntersectionObserver;

  // Mock IntersectionObserver
  let mockObserve: jest.Mock;
  let mockDisconnect: jest.Mock;
  let intersectionCallback: IntersectionObserverCallback | null = null;
  let MockIntersectionObserver: jest.Mock;

  const setupMockIntersectionObserver = () => {
    mockObserve = jest.fn();
    mockDisconnect = jest.fn();

    MockIntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: jest.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
        takeRecords: jest.fn(),
      };
    });

    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    return MockIntersectionObserver;
  };

  // Helper to trigger intersection
  const triggerIntersection = (isIntersecting: boolean, target?: Element) => {
    if (!intersectionCallback) {
      throw new Error('IntersectionObserver callback not set');
    }

    const entry = {
      isIntersecting,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      target: target || document.createElement('div'),
      time: Date.now(),
    };

    act(() => {
      intersectionCallback!([entry], {} as IntersectionObserver);
    });
  };

  // Helper to attach element to hook's ref
  const attachElement = (refCallback: (node: HTMLElement | null) => void) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    act(() => {
      refCallback(element);
    });
    
    return element;
  };

  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
    intersectionCallback = null;
    setupMockIntersectionObserver();
  });

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('basic functionality', () => {
    it('should return ref, isInView, and animationStyle', () => {
      const { result } = renderHook(() => useScrollAnimation());

      expect(result.current).toHaveProperty('ref');
      expect(result.current).toHaveProperty('isInView');
      expect(result.current).toHaveProperty('animationStyle');
    });

    it('should return isInView as false initially', () => {
      const { result } = renderHook(() => useScrollAnimation());

      expect(result.current.isInView).toBe(false);
    });

    it('should return hidden animation style when not in view', () => {
      const { result } = renderHook(() => useScrollAnimation());

      expect(result.current.animationStyle).toEqual({
        opacity: 0,
        transform: 'translateY(20px)',
        transition: 'opacity 300ms ease-out, transform 300ms ease-out',
      });
    });
  });

  describe('IntersectionObserver integration', () => {
    it('should create IntersectionObserver with default options when element is attached', () => {
      const { result } = renderHook(() => useScrollAnimation());
      
      attachElement(result.current.ref);

      expect(MockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { threshold: 0.1, rootMargin: '0px' }
      );
    });

    it('should set isInView to true when element intersects', () => {
      const { result } = renderHook(() => useScrollAnimation());
      
      const element = attachElement(result.current.ref);

      triggerIntersection(true, element);

      expect(result.current.isInView).toBe(true);
    });

    it('should return visible animation style when in view', () => {
      const { result } = renderHook(() => useScrollAnimation());
      
      const element = attachElement(result.current.ref);

      triggerIntersection(true, element);

      expect(result.current.animationStyle).toEqual({
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'opacity 300ms ease-out, transform 300ms ease-out',
      });
    });
  });

  describe('triggerOnce option', () => {
    it('should keep isInView true after triggering when triggerOnce is true', () => {
      const { result } = renderHook(() =>
        useScrollAnimation({ triggerOnce: true })
      );
      
      const element = attachElement(result.current.ref);

      triggerIntersection(true, element);
      expect(result.current.isInView).toBe(true);
    });

    it('should disconnect observer after first intersection when triggerOnce is true', () => {
      const { result } = renderHook(() =>
        useScrollAnimation({ triggerOnce: true })
      );
      
      const element = attachElement(result.current.ref);

      triggerIntersection(true, element);

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('reduced motion preference', () => {
    it('should use reduced motion styles when user prefers reduced motion', () => {
      mockUseReducedMotion.mockReturnValue(true);

      const { result } = renderHook(() => useScrollAnimation());

      expect(result.current.animationStyle).toEqual({
        opacity: 0,
      });
    });

    it('should use reduced motion visible styles when in view and reduced motion preferred', () => {
      mockUseReducedMotion.mockReturnValue(true);

      const { result } = renderHook(() => useScrollAnimation());
      
      const element = attachElement(result.current.ref);

      triggerIntersection(true, element);

      expect(result.current.animationStyle).toEqual({
        opacity: 1,
      });
    });
  });

  describe('IntersectionObserver fallback', () => {
    it('should show content immediately when IntersectionObserver is not supported', () => {
      // @ts-expect-error - intentionally removing for test
      delete window.IntersectionObserver;

      const { result } = renderHook(() => useScrollAnimation());
      
      attachElement(result.current.ref);

      expect(result.current.isInView).toBe(true);
    });
  });
});
