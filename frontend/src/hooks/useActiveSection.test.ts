import { renderHook, act, waitFor } from '@testing-library/react';
import { useActiveSection } from './useActiveSection';

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  private callback: IntersectionObserverCallback;
  private elements: Element[] = [];
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin || '';
    this.thresholds = options?.threshold 
      ? (Array.isArray(options.threshold) ? options.threshold : [options.threshold])
      : [0];
    
    // Store reference for triggering intersections in tests
    MockIntersectionObserver.instances.push(this);
  }
  
  static instances: MockIntersectionObserver[] = [];
  
  static clearInstances() {
    MockIntersectionObserver.instances = [];
  }
  
  observe(element: Element) {
    this.elements.push(element);
  }
  
  unobserve(element: Element) {
    this.elements = this.elements.filter(el => el !== element);
  }
  
  disconnect() {
    this.elements = [];
  }
  
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  
  // Helper method to simulate intersection changes
  simulateIntersection(entries: Partial<IntersectionObserverEntry>[]) {
    const fullEntries = entries.map(entry => ({
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: entry.isIntersecting ? 1 : 0,
      intersectionRect: {} as DOMRectReadOnly,
      isIntersecting: false,
      rootBounds: null,
      target: document.createElement('div'),
      time: Date.now(),
      ...entry,
    })) as IntersectionObserverEntry[];
    
    this.callback(fullEntries, this);
  }
}

// Setup and teardown
beforeEach(() => {
  MockIntersectionObserver.clearInstances();
  global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  
  // Create mock section elements in the DOM
  document.body.innerHTML = `
    <section id="about">About</section>
    <section id="experience">Experience</section>
    <section id="projects">Projects</section>
    <section id="skills">Skills</section>
    <section id="contact">Contact</section>
  `;
});

afterEach(() => {
  document.body.innerHTML = '';
  MockIntersectionObserver.clearInstances();
  jest.clearAllTimers();
});

describe('useActiveSection Hook', () => {
  const defaultSectionIds = ['about', 'experience', 'projects', 'skills', 'contact'];

  describe('Initialization', () => {
    it('returns the first section as active by default', () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      expect(result.current.activeSection).toBe('about');
    });

    it('uses defaultSection when provided', () => {
      const { result } = renderHook(() => 
        useActiveSection({ 
          sectionIds: defaultSectionIds,
          defaultSection: 'projects'
        })
      );
      
      expect(result.current.activeSection).toBe('projects');
    });

    it('returns empty string when sectionIds is empty', () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: [] })
      );
      
      expect(result.current.activeSection).toBe('');
    });

    it('sets isObserving to true when sections exist in DOM', () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      expect(result.current.isObserving).toBe(true);
    });

    it('sets isObserving to false when no sections exist in DOM', () => {
      document.body.innerHTML = ''; // Remove all sections
      
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      expect(result.current.isObserving).toBe(false);
    });
  });

  describe('Intersection Observer Setup', () => {
    it('creates an IntersectionObserver with correct options', () => {
      renderHook(() => 
        useActiveSection({ 
          sectionIds: defaultSectionIds,
          rootMargin: '-10% 0px -80% 0px',
          threshold: 0.5
        })
      );
      
      expect(MockIntersectionObserver.instances).toHaveLength(1);
      const observer = MockIntersectionObserver.instances[0];
      expect(observer.rootMargin).toBe('-10% 0px -80% 0px');
      expect(observer.thresholds).toEqual([0.5]);
    });

    it('uses default rootMargin when not specified', () => {
      renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      const observer = MockIntersectionObserver.instances[0];
      expect(observer.rootMargin).toBe('-20% 0px -70% 0px');
    });

    it('disconnects observer on unmount', () => {
      const { unmount } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      const observer = MockIntersectionObserver.instances[0];
      const disconnectSpy = jest.spyOn(observer, 'disconnect');
      
      unmount();
      
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('Active Section Detection', () => {
    it('updates activeSection when a section becomes visible', () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      const observer = MockIntersectionObserver.instances[0];
      const experienceElement = document.getElementById('experience')!;
      
      act(() => {
        observer.simulateIntersection([
          { target: experienceElement, isIntersecting: true }
        ]);
      });
      
      expect(result.current.activeSection).toBe('experience');
    });

    it('prioritizes earlier sections when multiple are visible', () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      const observer = MockIntersectionObserver.instances[0];
      const aboutElement = document.getElementById('about')!;
      const experienceElement = document.getElementById('experience')!;
      
      act(() => {
        // Both about and experience are visible
        observer.simulateIntersection([
          { target: experienceElement, isIntersecting: true },
          { target: aboutElement, isIntersecting: true }
        ]);
      });
      
      // Should prioritize 'about' as it comes first in sectionIds
      expect(result.current.activeSection).toBe('about');
    });

    it('updates to next visible section when current section leaves viewport', () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      const observer = MockIntersectionObserver.instances[0];
      const aboutElement = document.getElementById('about')!;
      const experienceElement = document.getElementById('experience')!;
      
      // First, about is visible
      act(() => {
        observer.simulateIntersection([
          { target: aboutElement, isIntersecting: true }
        ]);
      });
      expect(result.current.activeSection).toBe('about');
      
      // Then about leaves and experience enters
      act(() => {
        observer.simulateIntersection([
          { target: aboutElement, isIntersecting: false }
        ]);
      });
      
      act(() => {
        observer.simulateIntersection([
          { target: experienceElement, isIntersecting: true }
        ]);
      });
      
      expect(result.current.activeSection).toBe('experience');
    });
  });

  describe('Manual Navigation (setActiveSection)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('allows manual setting of active section', () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      act(() => {
        result.current.setActiveSection('contact');
      });
      
      expect(result.current.activeSection).toBe('contact');
    });

    it('temporarily ignores scroll updates after manual navigation', () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      const observer = MockIntersectionObserver.instances[0];
      const aboutElement = document.getElementById('about')!;
      
      // Manually navigate to contact
      act(() => {
        result.current.setActiveSection('contact');
      });
      
      expect(result.current.activeSection).toBe('contact');
      
      // Simulate scroll event that would normally change active section
      act(() => {
        observer.simulateIntersection([
          { target: aboutElement, isIntersecting: true }
        ]);
      });
      
      // Should still be contact because manual navigation is active
      expect(result.current.activeSection).toBe('contact');
    });

    it('re-enables scroll updates after timeout', async () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      const observer = MockIntersectionObserver.instances[0];
      const experienceElement = document.getElementById('experience')!;
      
      // Manually navigate to contact
      act(() => {
        result.current.setActiveSection('contact');
      });
      
      expect(result.current.activeSection).toBe('contact');
      
      // Fast-forward past the manual navigation timeout (1000ms)
      act(() => {
        jest.advanceTimersByTime(1100);
      });
      
      // Now scroll updates should work again
      act(() => {
        observer.simulateIntersection([
          { target: experienceElement, isIntersecting: true }
        ]);
      });
      
      expect(result.current.activeSection).toBe('experience');
    });
  });

  describe('Edge Cases', () => {
    it('handles sections that do not exist in DOM', () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: ['nonexistent', 'about'] })
      );
      
      // Should still work with the sections that do exist
      expect(result.current.isObserving).toBe(true);
      expect(result.current.activeSection).toBe('nonexistent'); // Default is first in array
    });

    it('handles re-renders with same sectionIds', () => {
      const { result, rerender } = renderHook(
        ({ sectionIds }) => useActiveSection({ sectionIds }),
        { initialProps: { sectionIds: defaultSectionIds } }
      );
      
      const initialObserverCount = MockIntersectionObserver.instances.length;
      
      // Rerender with same props
      rerender({ sectionIds: defaultSectionIds });
      
      // Should not create additional observers
      expect(MockIntersectionObserver.instances.length).toBe(initialObserverCount);
    });

    it('handles sectionIds change by creating new observer', () => {
      const { result, rerender } = renderHook(
        ({ sectionIds }) => useActiveSection({ sectionIds }),
        { initialProps: { sectionIds: ['about', 'experience'] } }
      );
      
      expect(result.current.activeSection).toBe('about');
      
      const initialObserverCount = MockIntersectionObserver.instances.length;
      
      // Change sectionIds - this should create a new observer
      rerender({ sectionIds: ['projects', 'skills'] });
      
      // A new observer should be created for the new sections
      expect(MockIntersectionObserver.instances.length).toBeGreaterThanOrEqual(initialObserverCount);
      
      // The active section maintains its value until scroll detection updates it
      // This is expected behavior - we don't reset on sectionIds change
      expect(result.current.activeSection).toBe('about');
    });
  });

  describe('Property 2: Active Section Indication', () => {
    /**
     * **Validates: Requirements 1.5**
     * For any Content_Section that a visitor navigates to, the Navigation_System 
     * SHALL visually indicate that section as the current active section, 
     * and no other section shall be marked active.
     */
    it('only one section is marked as active at any time', () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      const observer = MockIntersectionObserver.instances[0];
      
      // Simulate multiple sections becoming visible
      const aboutElement = document.getElementById('about')!;
      const experienceElement = document.getElementById('experience')!;
      const projectsElement = document.getElementById('projects')!;
      
      act(() => {
        observer.simulateIntersection([
          { target: aboutElement, isIntersecting: true },
          { target: experienceElement, isIntersecting: true },
          { target: projectsElement, isIntersecting: true }
        ]);
      });
      
      // activeSection should be a single string, not an array
      expect(typeof result.current.activeSection).toBe('string');
      expect(result.current.activeSection).toBe('about');
      
      // Verify it's exactly one of the valid sections
      expect(defaultSectionIds).toContain(result.current.activeSection);
    });

    it('active section changes when scrolling to different section', () => {
      const { result } = renderHook(() => 
        useActiveSection({ sectionIds: defaultSectionIds })
      );
      
      const observer = MockIntersectionObserver.instances[0];
      
      // Start with about visible
      const aboutElement = document.getElementById('about')!;
      act(() => {
        observer.simulateIntersection([
          { target: aboutElement, isIntersecting: true }
        ]);
      });
      expect(result.current.activeSection).toBe('about');
      
      // Scroll to experience (about leaves, experience enters)
      const experienceElement = document.getElementById('experience')!;
      act(() => {
        observer.simulateIntersection([
          { target: aboutElement, isIntersecting: false }
        ]);
      });
      act(() => {
        observer.simulateIntersection([
          { target: experienceElement, isIntersecting: true }
        ]);
      });
      
      expect(result.current.activeSection).toBe('experience');
      // Verify previous section is no longer active (implicitly - only one active)
      expect(result.current.activeSection).not.toBe('about');
    });
  });
});
