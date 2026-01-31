# Implementation Plan: Transparency Dashboard

## Overview

This implementation plan creates a Transparency Dashboard that visualizes expertise across three tiers: Core Strengths, Working Knowledge, and Explicit Gaps. The dashboard demonstrates self-awareness and intellectual honesty by proactively showing what the portfolio owner can and cannot do.

## Tasks

- [x] 1. Set up data layer and content integration
  - [x] 1.1 Create TypeScript types for transparency dashboard
    - Create `frontend/src/types/transparency-dashboard.ts` with Skill, ExplicitGap, Evidence, and SkillTier types
    - Include TierConfig interface for visual hierarchy configuration
    - _Requirements: 1.1, 9.2_

  - [x] 1.2 Create skill loader utility
    - Create `frontend/src/lib/transparency-dashboard-loader.ts`
    - Implement function to load skills from skills.mdx and map levels to tiers (expert → core_strength, proficient → working_knowledge)
    - Implement function to load explicit gaps from MDX configuration
    - Handle missing or incomplete data gracefully
    - _Requirements: 9.1, 9.2, 9.6_

  - [x] 1.3 Write property test for skill level to tier mapping
    - **Property 19: Skill Level to Tier Mapping**
    - **Validates: Requirements 9.2**

  - [x] 1.4 Write property test for graceful handling of incomplete data
    - **Property 20: Graceful Handling of Incomplete Data**
    - **Validates: Requirements 9.6**

- [x] 2. Implement core UI components
  - [x] 2.1 Create TransparencyDashboardContext
    - Create `frontend/src/context/TransparencyDashboardContext.tsx`
    - Implement state for skills, gaps, selectedSkill, isDetailPanelOpen
    - Implement actions: selectSkill, closeDetailPanel, getSkillsByTier
    - _Requirements: 3.1, 3.4_

  - [x] 2.2 Create TierSection component
    - Create `frontend/src/components/transparency-dashboard/TierSection.tsx`
    - Implement section with semantic h2 heading, description, and skill grid
    - Apply visual hierarchy styling based on tier (large for core, medium for working, small for gaps)
    - _Requirements: 1.1, 1.5, 6.4, 8.1, 8.2, 8.3, 8.4_

  - [x] 2.3 Write property test for semantic heading structure
    - **Property 17: Semantic Heading Structure**
    - **Validates: Requirements 6.4**

  - [x] 2.4 Create SkillCard component
    - Create `frontend/src/components/transparency-dashboard/SkillCard.tsx`
    - Display skill name, tier indicator (text/icon, not color-only), context description
    - Display years of experience when available
    - Show evidence indicator when evidence array is non-empty
    - Ensure 44×44px minimum touch target
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 6.6_

  - [x] 2.5 Write property test for skill card content completeness
    - **Property 3: Skill Card Content Completeness**
    - **Validates: Requirements 2.1, 6.6**

  - [x] 2.6 Write property test for years of experience display
    - **Property 4: Years of Experience Display**
    - **Validates: Requirements 2.2**

  - [x] 2.7 Write property test for evidence indicator presence
    - **Property 5: Evidence Indicator Presence**
    - **Validates: Requirements 2.3**

  - [x] 2.8 Create GapCard component
    - Create `frontend/src/components/transparency-dashboard/GapCard.tsx`
    - Display gap name and explanation
    - Use subtle styling that is visible but not attention-grabbing
    - _Requirements: 1.4, 4.1, 4.2, 4.6_

  - [x] 2.9 Write property test for gap explanations display
    - **Property 2: Gap Explanations Display**
    - **Validates: Requirements 1.4, 4.1, 4.2**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement skill detail panel
  - [x] 4.1 Create SkillDetailPanel component
    - Create `frontend/src/components/transparency-dashboard/SkillDetailPanel.tsx`
    - Use createPortal to render modal to document.body
    - Display full context description and all evidence links
    - Implement close button, Escape key, and click-outside dismissal
    - Prevent background scrolling on mobile when open
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [x] 4.2 Implement focus management for detail panel
    - Move focus to panel when opened
    - Return focus to triggering SkillCard when closed
    - Implement ARIA live region announcement
    - _Requirements: 3.6, 6.3_

  - [x] 4.3 Write property test for panel dismissal methods
    - **Property 10: Panel Dismissal Methods**
    - **Validates: Requirements 3.4**

  - [x] 4.4 Write property test for panel focus management
    - **Property 11: Panel Focus Management**
    - **Validates: Requirements 3.6**

  - [x] 4.5 Write property test for ARIA live region announcements
    - **Property 16: ARIA Live Region Announcements**
    - **Validates: Requirements 6.3**

  - [x] 4.6 Create EvidenceList component
    - Create `frontend/src/components/transparency-dashboard/EvidenceList.tsx`
    - Display evidence items as clickable links with type indicator (project, experience, certification)
    - Internal links open in same tab (no target="_blank")
    - _Requirements: 3.3, 5.2, 5.3, 5.6_

  - [x] 4.7 Write property test for evidence links clickable
    - **Property 9: Evidence Links Clickable**
    - **Validates: Requirements 3.3, 5.3**

  - [x] 4.8 Write property test for internal evidence links same tab
    - **Property 14: Internal Evidence Links Same Tab**
    - **Validates: Requirements 5.6**

- [x] 5. Implement dashboard page and layout
  - [x] 5.1 Create TransparencyDashboardPage
    - Create `frontend/src/app/transparency/page.tsx`
    - Wrap content in TransparencyDashboardProvider
    - Include DashboardIntro with title, description, and tier legend
    - Render CoreStrengthsSection first, then WorkingKnowledgeSection, then ExplicitGapsSection
    - _Requirements: 1.1, 1.2, 10.1, 10.2_

  - [x] 5.2 Write property test for three-tier section rendering
    - **Property 1: Three-Tier Section Rendering**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 5.3 Implement empty gaps state
    - Display message "Gaps are being documented" when gaps array is empty
    - Ensure gaps section is always visible (not hidden)
    - _Requirements: 4.4, 4.5_

  - [x] 5.4 Write property test for gaps section always visible
    - **Property 12: Gaps Section Always Visible**
    - **Validates: Requirements 4.4**

  - [x] 5.5 Implement core strength evidence filtering
    - Filter out core strength skills without evidence
    - Display working knowledge skills without evidence with "Learning in progress" note
    - _Requirements: 5.1, 5.4, 5.5_

  - [x] 5.6 Write property test for core strength evidence requirement
    - **Property 13: Core Strength Evidence Requirement**
    - **Validates: Requirements 5.1, 5.4**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement accessibility and keyboard navigation
  - [x] 7.1 Implement keyboard navigation
    - Ensure all interactive elements are focusable via Tab
    - Ensure activation via Enter or Space key
    - Implement Escape key to close detail panel
    - _Requirements: 6.2_

  - [x] 7.2 Write property test for keyboard navigation support
    - **Property 15: Keyboard Navigation Support**
    - **Validates: Requirements 6.2**

  - [x] 7.3 Write property test for touch target minimum size
    - **Property 7: Touch Target Minimum Size**
    - **Validates: Requirements 2.6**

  - [x] 7.4 Write accessibility test with jest-axe
    - Test WCAG 2.1 AA compliance
    - Test color contrast ratios
    - _Requirements: 6.1, 6.5_

- [x] 8. Implement mobile responsiveness
  - [x] 8.1 Implement responsive layout
    - Single-column layout at 375px viewport
    - Tier sections stack vertically with clear separation
    - Detail panel full-width on mobile
    - No horizontal scrolling
    - _Requirements: 2.5, 7.1, 7.2, 7.3, 7.4_

  - [x] 8.2 Write property test for mobile responsive layout
    - **Property 6: Mobile Responsive Layout**
    - **Validates: Requirements 2.5, 7.1, 7.2, 7.3, 7.4**

  - [x] 8.3 Implement state preservation on resize
    - Preserve selectedSkill and isDetailPanelOpen on viewport resize
    - _Requirements: 7.6_

  - [x] 8.4 Write property test for state preservation on resize
    - **Property 18: State Preservation on Resize**
    - **Validates: Requirements 7.6**

- [x] 9. Add explicit gaps content to skills.mdx
  - [x] 9.1 Update skills.mdx with gaps configuration
    - Add gaps array to frontmatter with name, explanation, and alternativeFocus
    - Include 2-3 explicit gaps (e.g., Native Mobile Development, Blockchain/Web3)
    - _Requirements: 9.4_

  - [x] 9.2 Add evidence references to existing skills
    - Add evidence arrays to expert-level skills referencing projects/experiences
    - Ensure all core strengths have at least one evidence item
    - _Requirements: 5.1, 9.5_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify dashboard loads correctly with real content
  - Test on mobile viewport (375px)

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Property tests use `{ numRuns: 3 }` per workspace guidelines
- Use createPortal for SkillDetailPanel modal per workspace guidelines
- Tests run in dev workspace, not Docker containers
