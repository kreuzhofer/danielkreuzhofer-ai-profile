# Implementation Plan: Content Architecture

## Overview

This plan implements the foundational content architecture for the portfolio website using Next.js, React, TypeScript, and Tailwind CSS. The frontend is containerized with Docker and located in the `frontend/` directory. Tasks are organized to build incrementally: project setup → content system → components → sections → integration.

## Tasks

- [x] 1. Project Setup and Configuration
  - [x] 1.1 Initialize Next.js project in frontend directory with TypeScript and Tailwind CSS
    - Create `frontend/` directory at repository root
    - Run `npx create-next-app@latest frontend` with TypeScript, Tailwind, App Router options
    - Configure `tailwind.config.ts` with custom breakpoints (375px mobile, 768px tablet, 1024px desktop)
    - Set up path aliases in `tsconfig.json`
    - _Requirements: Technology Decisions_

  - [x] 1.2 Create Docker configuration for frontend service
    - Create `frontend/Dockerfile` with Node.js base image and Next.js build
    - Create `docker-compose.yml` at repository root
    - Configure frontend service to expose port 8087
    - Add development and production build targets
    - _Requirements: Technology Decisions (Docker, Port 8087)_

  - [x] 1.3 Set up MDX support and content loading infrastructure
    - Install `@next/mdx`, `gray-matter` for frontmatter parsing
    - Create `frontend/content/` directory structure for MDX files
    - Implement content loader utility with TypeScript types
    - _Requirements: Technology Decisions_

  - [x] 1.4 Create TypeScript type definitions for all content models
    - Define interfaces: `About`, `Experience`, `Project`, `SkillCategory`, `Contact`
    - Define depth layer interfaces: `ExperienceDepth`, `ProjectDepth`
    - Define supporting types: `Decision`, `Outcome`, `Tradeoff`, `SocialLink`
    - _Requirements: 2.2, 2.3, 2.4, 3.2, 3.3_

  - [x] 1.5 Write property tests for content type validation
    - **Property 4: Summary Layer Content Completeness**
    - **Property 5: Depth Layer Content Completeness**
    - **Validates: Requirements 2.2, 2.3, 2.4, 3.2, 3.3**

- [x] 2. Core Layout and Navigation Components
  - [x] 2.1 Create base Layout component with header, main, and footer structure
    - Implement semantic HTML structure with proper landmarks
    - Add skip link for keyboard navigation
    - Set up responsive container with Tailwind
    - _Requirements: 7.4, 7.5_

  - [x] 2.2 Implement Navigation component with section links
    - Create NavLink component with active state styling
    - Implement desktop horizontal navigation
    - Add `aria-current="page"` for active section
    - _Requirements: 1.1, 1.2, 1.5_

  - [x] 2.3 Implement mobile navigation with hamburger menu
    - Create MobileMenuButton with proper ARIA attributes
    - Implement slide-out menu overlay
    - Ensure touch targets are 44x44px minimum
    - _Requirements: 1.3, 5.2_

  - [x] 2.4 Add scroll-based active section detection
    - Implement Intersection Observer to track visible sections
    - Update navigation active state based on scroll position
    - _Requirements: 1.5_

  - [x] 2.5 Write property tests for navigation
    - **Property 1: Navigation Accessibility**
    - **Property 2: Active Section Indication**
    - **Validates: Requirements 1.5, 1.6, 5.5**

- [x] 3. Expandable Content Component System
  - [x] 3.1 Create useExpandable hook for expand/collapse state management
    - Manage expanded item IDs in state
    - Provide toggle function
    - Support multiple items expanded simultaneously
    - _Requirements: 3.1, 3.6_

  - [x] 3.2 Implement Expandable component with accessibility support
    - Create ExpandButton with `aria-expanded` and `aria-controls`
    - Create ExpandContent with `role="region"` and `aria-labelledby`
    - Add keyboard support (Enter/Space to toggle)
    - _Requirements: 7.2, 7.3_

  - [x] 3.3 Add expand/collapse animations with scroll position preservation
    - Implement smooth height transition using CSS or Framer Motion
    - Calculate and maintain scroll position during expansion
    - Ensure animation completes within 200ms
    - _Requirements: 3.4, 6.2_

  - [x] 3.4 Write property tests for expandable behavior
    - **Property 6: Expand/Collapse Round Trip**
    - **Property 7: Scroll Position Preservation**
    - **Property 13: Expansion Performance**
    - **Property 14: Keyboard Expandable Controls**
    - **Property 15: ARIA State Announcements**
    - **Validates: Requirements 3.1, 3.4, 3.6, 6.2, 7.2, 7.3**

- [x] 4. Checkpoint - Core Infrastructure Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Layout renders, navigation works, expandable component functions

- [x] 5. Content Section Components
  - [x] 5.1 Implement AboutSection component
    - Render headline, bio, value proposition from MDX
    - Display social links
    - Ensure bio under 100 words displays correctly
    - _Requirements: 2.5_

  - [x] 5.2 Implement ExperienceSection with ExperienceItem components
    - Create ExperienceItem with summary layer (role, company, dates, highlights)
    - Create ExperienceDepth with context, challenges, decisions, outcomes, lessons
    - Wire up expandable behavior
    - _Requirements: 2.2, 3.2_

  - [x] 5.3 Implement ProjectsSection with ProjectCard components
    - Create ProjectCard with summary layer (title, description, technologies, links)
    - Create ProjectDepth with problem, approach, tradeoffs, outcomes, reflections
    - Wire up expandable behavior
    - _Requirements: 2.3, 3.3_

  - [x] 5.4 Implement SkillsSection with SkillCategory components
    - Create SkillCategory with category name and skill list
    - Create SkillItem with proficiency level indicator
    - Implement visual proficiency representation (bars, dots, or labels)
    - _Requirements: 2.4_

  - [x] 5.5 Implement ContactSection component
    - Render inviting headline and subtext
    - Display multiple contact options (email, LinkedIn, calendar)
    - Use soft, inviting language per design principles
    - _Requirements: 8.1, 8.2, 8.4_

  - [x] 5.6 Write unit tests for section components
    - Test each section renders with sample content
    - Test expandable interactions work correctly
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Content Hierarchy and Ordering
  - [x] 6.1 Implement content ordering by `order` field
    - Sort experiences, projects by order field in content loader
    - Ensure most recent/impactful items appear first
    - _Requirements: 4.2_

  - [x] 6.2 Implement filtering for sections with more than 5 items
    - Add category filter UI when item count exceeds 5
    - Implement filter state management
    - _Requirements: 4.5_

  - [x] 6.3 Write property tests for content hierarchy
    - **Property 8: Content Hierarchy Structure**
    - **Property 9: Content Ordering**
    - **Property 10: Large Section Filtering**
    - **Validates: Requirements 4.1, 4.2, 4.5**

- [x] 7. Responsive Design Implementation
  - [x] 7.1 Implement responsive layouts for all sections
    - Single column at mobile (375px)
    - Multi-column at desktop (1024px+)
    - Test at tablet breakpoint (768px)
    - _Requirements: 5.1, 5.3_

  - [x] 7.2 Ensure touch targets meet 44x44px minimum on mobile
    - Audit all interactive elements
    - Add padding/sizing as needed for expansion controls
    - _Requirements: 5.2_

  - [x] 7.3 Implement state persistence across viewport changes
    - Ensure expanded items stay expanded on resize
    - Test with browser dev tools responsive mode
    - _Requirements: 5.4_

  - [x] 7.4 Write property tests for responsive behavior
    - **Property 11: Touch Target Sizing**
    - **Property 12: State Persistence Across Viewport Changes**
    - **Validates: Requirements 5.2, 5.4**

- [x] 8. Checkpoint - Sections Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: All sections render, expand/collapse works, responsive layouts correct

- [x] 9. Accessibility Implementation
  - [x] 9.1 Implement proper heading hierarchy across all sections
    - Ensure h1 → h2 → h3 sequence with no skipped levels
    - Add section headings with appropriate levels
    - _Requirements: 7.4_

  - [x] 9.2 Add ARIA landmarks and labels
    - Add `role` attributes to major sections
    - Ensure all interactive elements have accessible names
    - _Requirements: 7.1_

  - [x] 9.3 Verify keyboard navigation throughout site
    - Test Tab order is logical
    - Ensure all interactive elements are focusable
    - Add visible focus indicators
    - _Requirements: 1.6, 7.2_

  - [x] 9.4 Write accessibility tests with jest-axe
    - **Property 16: Heading Hierarchy**
    - Run automated WCAG checks on rendered pages
    - **Validates: Requirements 7.1, 7.4**

- [x] 10. Persistent Contact and Final Integration
  - [x] 10.1 Add persistent contact option visible from all sections
    - Implement subtle floating contact button or persistent header link
    - Ensure non-intrusive placement
    - _Requirements: 8.3_

  - [x] 10.2 Wire up main page with all sections
    - Import and compose all section components
    - Set up anchor-based navigation targets
    - Implement smooth scroll behavior
    - _Requirements: 1.1, 1.4_

  - [x] 10.3 Write property test for persistent contact
    - **Property 17: Persistent Contact Visibility**
    - **Validates: Requirements 8.3**

- [x] 11. Sample Content Creation
  - [x] 11.1 Create sample MDX content files for all sections
    - Create `frontend/content/about.mdx` with sample data
    - Create sample experience entries in `frontend/content/experience/`
    - Create sample project entries in `frontend/content/projects/`
    - Create `frontend/content/skills.mdx` with sample categories
    - Create `frontend/content/contact.mdx` with sample options
    - _Requirements: 1.4, 2.1_

- [x] 12. Final Checkpoint - Full Integration
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Complete page renders, all interactions work, accessibility passes
  - Verify: Docker container builds and runs on port 8087

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Sample content in task 11 is placeholder data - real content will be added separately
