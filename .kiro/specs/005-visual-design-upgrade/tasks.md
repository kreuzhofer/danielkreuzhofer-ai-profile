# Implementation Plan: Visual Design Upgrade

## Overview

This implementation plan breaks down the visual design upgrade into discrete, incremental coding tasks. Each task builds on previous work, ensuring no orphaned code. The implementation follows a bottom-up approach: design tokens first, then hooks, then components, and finally integration.

## Tasks

- [x] 1. Set up design token system and CSS variables
  - [x] 1.1 Create design tokens TypeScript file
    - Create `frontend/src/lib/design-tokens.ts` with color palettes (primary teal, secondary amber, neutral)
    - Define typography configuration with Inter font family
    - Define animation timing tokens (fast: 150ms, normal: 200ms, slow: 300ms)
    - Export typed constants for use in components
    - _Requirements: 1.1, 1.2, 1.4, 1.8, 4.4_
  
  - [x] 1.2 Write property test for animation duration bounds
    - **Property 4: Animation Duration Bounds**
    - **Validates: Requirements 4.4**
  
  - [x] 1.3 Extend globals.css with CSS variables
    - Add primary color palette CSS variables (--primary-50 through --primary-950)
    - Add secondary color palette CSS variables (--secondary-50 through --secondary-950)
    - Add semantic color variables (--success, --warning, --error)
    - Add gradient variables (--gradient-hero, --gradient-section)
    - Add shadow variables (--shadow-sm, --shadow-md, --shadow-lg, --shadow-hover)
    - Add dark mode overrides in prefers-color-scheme media query
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.8_
  
  - [x] 1.4 Write property test for color tokens as CSS variables
    - **Property 1: Color Tokens as CSS Variables**
    - **Validates: Requirements 1.4**

- [x] 2. Checkpoint - Verify design tokens
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement typography and font loading
  - [x] 3.1 Configure Inter font in layout.tsx
    - Import Inter from next/font/google
    - Configure with font-display: swap
    - Apply font variable to body element
    - Maintain existing Geist Mono for code blocks
    - _Requirements: 2.1, 2.5, 6.4_
  
  - [x] 3.2 Add typography utility classes to globals.css
    - Define type scale classes with appropriate line-heights
    - Add letter-spacing adjustments for headings (-0.02em for 4xl+)
    - Add letter-spacing for small text (0.025em for xs)
    - Ensure base font size is 16px minimum
    - _Requirements: 2.2, 2.3, 2.4, 2.6_
  
  - [x] 3.3 Write property test for typography line-height ranges
    - **Property 3: Typography Line-Height Ranges**
    - **Validates: Requirements 2.3**

- [x] 4. Implement animation hooks
  - [x] 4.1 Create useReducedMotion hook
    - Create `frontend/src/hooks/useReducedMotion.ts`
    - Use matchMedia to detect prefers-reduced-motion
    - Return boolean indicating reduced motion preference
    - Handle SSR by defaulting to false
    - Add event listener for preference changes
    - _Requirements: 3.7, 4.5, 6.7_
  
  - [x] 4.2 Create useScrollProgress hook
    - Create `frontend/src/hooks/useScrollProgress.ts`
    - Calculate scroll progress as 0-1 value based on document scroll
    - Use passive scroll event listener for performance
    - Debounce updates to prevent excessive re-renders
    - Return progress value and isScrolling state
    - _Requirements: 5.3_
  
  - [x] 4.3 Create useScrollAnimation hook
    - Create `frontend/src/hooks/useScrollAnimation.ts`
    - Use IntersectionObserver for efficient scroll detection
    - Return ref, isInView state, and animation style object
    - Support triggerOnce option for one-time animations
    - Respect reduced motion preference via useReducedMotion
    - Provide fallback for browsers without IntersectionObserver
    - _Requirements: 4.1, 4.7_
  
  - [x] 4.4 Write property test for scroll animation state-based styles
    - **Property 5: Scroll Animation State-Based Styles**
    - **Validates: Requirements 4.1**
  
  - [x] 4.5 Write property test for reduced motion compliance
    - **Property 6: Reduced Motion Compliance**
    - **Validates: Requirements 3.7, 4.5, 6.7**

- [x] 5. Checkpoint - Verify hooks
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement UI primitive components
  - [x] 6.1 Create enhanced Button component
    - Create `frontend/src/components/ui/Button.tsx`
    - Implement variants: primary (teal), secondary (amber), outline, ghost
    - Implement sizes: sm, md, lg with appropriate padding and font sizes
    - Add hover transitions with color/scale feedback
    - Support both button and anchor rendering via href prop
    - Maintain 44px minimum touch target
    - Respect reduced motion for transitions
    - _Requirements: 4.3_
  
  - [x] 6.2 Create enhanced Card component
    - Create `frontend/src/components/ui/Card.tsx`
    - Implement variants: default, outlined, elevated
    - Add hoverable prop for lift effect with shadow enhancement
    - Integrate useScrollAnimation for animateOnScroll prop
    - Apply CSS containment for performance
    - Respect reduced motion preference
    - _Requirements: 4.2, 6.8_

- [x] 7. Implement Hero Section
  - [x] 7.1 Create HeroSection component
    - Create `frontend/src/components/HeroSection.tsx`
    - Render headline with fade-in animation
    - Render tagline with staggered animation
    - Render primary CTA button linking to #about
    - Apply gradient background using CSS variables
    - Implement responsive layout (full viewport desktop, adapted mobile)
    - Respect reduced motion preference
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 3.8_
  
  - [x] 7.2 Write unit tests for HeroSection
    - Test headline renders correctly
    - Test tagline renders correctly
    - Test CTA button has correct href
    - Test gradient background class is applied
    - Test reduced motion disables animations
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7_

- [x] 8. Enhance Navigation component
  - [x] 8.1 Add scroll progress indicator to Navigation
    - Create ProgressBar sub-component
    - Integrate useScrollProgress hook
    - Render thin progress bar at top of header
    - Style with primary color, subtle appearance
    - _Requirements: 5.3, 5.7_
  
  - [x] 8.2 Enhance header styling
    - Update backdrop blur/transparency effect (already partially implemented)
    - Add brand element prop support
    - Update "Portfolio" text to accept custom brand element
    - Ensure sticky positioning is maintained
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [x] 8.3 Add animated active section indicator
    - Enhance NavLink active state with animated underline
    - Use CSS transitions for smooth indicator movement
    - Maintain existing accessibility features
    - _Requirements: 5.4, 5.8_
  
  - [x] 8.4 Write unit tests for enhanced Navigation
    - Test progress indicator renders
    - Test progress updates with scroll
    - Test brand element renders when provided
    - Test accessibility attributes preserved
    - _Requirements: 5.3, 5.5, 5.8_

- [x] 9. Checkpoint - Verify components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Integrate visual upgrades into existing sections
  - [x] 10.1 Update AboutSection with scroll animations
    - Wrap section content with useScrollAnimation
    - Apply fade-in animation on scroll into view
    - Maintain existing functionality and accessibility
    - _Requirements: 4.1_
  
  - [x] 10.2 Update ExperienceSection with enhanced cards
    - Apply Card component styling to experience items
    - Add hover lift effects to expandable cards
    - Apply scroll animations to section
    - _Requirements: 4.1, 4.2_
  
  - [x] 10.3 Update ProjectsSection with enhanced cards
    - Apply Card component styling to project items
    - Add hover lift effects
    - Apply scroll animations to section
    - _Requirements: 4.1, 4.2_
  
  - [x] 10.4 Update SkillsSection with scroll animations
    - Apply scroll animations to skill categories
    - Enhance skill item hover states
    - _Requirements: 4.1_
  
  - [x] 10.5 Update ContactSection with scroll animations
    - Apply scroll animations to contact cards
    - Enhance contact link hover states
    - _Requirements: 4.1_

- [x] 11. Integrate Hero Section into page
  - [x] 11.1 Add hero content to content system
    - Add hero content fields to about.mdx or create hero.mdx
    - Define headline, tagline, ctaText, ctaHref
    - Update content loader if needed
    - _Requirements: 3.1, 3.2_
  
  - [x] 11.2 Add HeroSection to page.tsx
    - Import and render HeroSection before AboutSection
    - Pass hero content props
    - Ensure proper section ordering
    - _Requirements: 3.1, 3.5_

- [x] 12. Final polish and accessibility verification
  - [x] 12.1 Verify color contrast compliance
    - Run contrast ratio checks on all text/background combinations
    - Adjust colors if any fail WCAG AA requirements
    - _Requirements: 1.7_
  
  - [x] 12.2 Write property test for WCAG contrast ratio compliance
    - **Property 2: WCAG Contrast Ratio Compliance**
    - **Validates: Requirements 1.7**
  
  - [x] 12.3 Verify reduced motion compliance across all components
    - Test all animations with prefers-reduced-motion: reduce
    - Ensure static visual feedback is provided
    - _Requirements: 3.7, 4.5, 6.7_
  
  - [x] 12.4 Run accessibility audit
    - Run jest-axe on all new/modified components
    - Verify keyboard navigation works
    - Verify screen reader announcements
    - _Requirements: 5.8, 6.5_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: tokens → hooks → components → integration
