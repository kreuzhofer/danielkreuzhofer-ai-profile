# Requirements Document

## Introduction

This document defines the requirements for the Transparency Dashboard feature for a personal portfolio website. The dashboard preempts the "what can't you do?" question with proactive honesty by visualizing expertise across three tiers: Core Strengths (deep expertise areas), Working Knowledge (competent but not expert), and Explicit Gaps (areas intentionally not pursued).

The feature embodies the principle that expertise includes knowing what you don't know. This dashboard demonstrates self-awareness and intellectual honesty—qualities that matter in senior roles. By explicitly showing gaps, it signals focus rather than limitation, building trust through transparency.

Target audiences:
1. Corporate Recruiters seeking quick signals of relevance with paths to verify depth
2. Hiring Managers needing proof of thinking and evidence of problem-solving approaches
3. Potential Collaborators & Clients wanting a sense of depth before initiating contact

Guiding principles:
- Minimalist but not sterile — Clean interfaces with moments of delight
- Mobile-first — Every interaction must work at 375px width
- Fast — Target sub-2-second loads
- Accessible — WCAG 2.1 AA compliant minimum
- Peer, not supplicant — Language of equals exploring mutual fit
- Honest about limitations — Admitting gaps builds more trust than claiming completeness
- Transparency as differentiator — Honest self-assessment is rare and memorable

## Glossary

- **Transparency_Dashboard**: The UI component that visualizes expertise across three tiers with interactive exploration capabilities
- **Core_Strength**: A skill or domain where the portfolio owner has deep expertise, typically with 5+ years of experience and demonstrable mastery
- **Working_Knowledge**: A skill or domain where the portfolio owner is competent but not expert, honest about the difference in depth
- **Explicit_Gap**: An area intentionally not pursued, signaling focus rather than limitation
- **Skill_Tier**: One of the three categories (Core_Strength, Working_Knowledge, Explicit_Gap) used to classify expertise
- **Skill_Card**: A UI element displaying a single skill with its tier, context, and optional evidence
- **Evidence_Link**: A reference to a project, experience, or certification that supports a skill claim
- **Tier_Section**: A visual grouping of skills within the same Skill_Tier
- **Skill_Detail_Panel**: An expanded view showing additional context and evidence for a selected skill
- **Mobile_Viewport**: A screen width of 375px or less, representing mobile device displays
- **Visitor**: A person viewing the portfolio website who interacts with the Transparency_Dashboard

## Requirements

### Requirement 1: Three-Tier Skill Visualization

**User Story:** As a recruiter, I want to see skills organized by expertise level, so that I can quickly understand where this candidate has deep expertise versus working knowledge.

#### Acceptance Criteria

1. THE Transparency_Dashboard SHALL display skills organized into three distinct Tier_Sections: Core_Strengths, Working_Knowledge, and Explicit_Gaps
2. WHEN a Visitor views the Transparency_Dashboard, THE Core_Strengths section SHALL be visually prominent and displayed first
3. THE Working_Knowledge section SHALL be clearly distinguished from Core_Strengths with honest labeling (e.g., "Competent, Not Expert")
4. THE Explicit_Gaps section SHALL display areas intentionally not pursued with brief explanations of why
5. WHEN displaying Tier_Sections, THE Transparency_Dashboard SHALL use visual hierarchy (size, color, position) to indicate relative expertise depth
6. THE Transparency_Dashboard SHALL display a minimum of 3 skills per tier when content is available

### Requirement 2: Skill Card Display

**User Story:** As a hiring manager, I want to see context for each skill, so that I can understand the depth and relevance of experience.

#### Acceptance Criteria

1. WHEN displaying a skill, THE Skill_Card SHALL show the skill name, tier indicator, and brief context description
2. THE Skill_Card SHALL display years of experience when available for Core_Strengths and Working_Knowledge
3. WHEN a skill has associated Evidence_Links, THE Skill_Card SHALL indicate that additional evidence is available
4. THE Skill_Card SHALL use consistent visual styling within each Tier_Section
5. WHEN rendered on Mobile_Viewport, THE Skill_Card SHALL adapt to a single-column layout without horizontal scrolling
6. THE Skill_Card SHALL have a minimum touch target of 44×44 pixels for interactive elements

### Requirement 3: Interactive Skill Exploration

**User Story:** As a potential collaborator, I want to explore skills in detail, so that I can verify depth before initiating contact.

#### Acceptance Criteria

1. WHEN a Visitor clicks or taps a Skill_Card, THE Transparency_Dashboard SHALL display a Skill_Detail_Panel with expanded information
2. THE Skill_Detail_Panel SHALL include the full context description and all associated Evidence_Links
3. WHEN Evidence_Links are present, THE Skill_Detail_Panel SHALL display them as clickable references to projects or experiences
4. THE Skill_Detail_Panel SHALL be dismissible via close button, Escape key, or clicking outside the panel
5. WHILE a Skill_Detail_Panel is open, THE Transparency_Dashboard SHALL prevent background scrolling on mobile devices
6. WHEN a Skill_Detail_Panel opens, THE focus SHALL move to the panel for keyboard and screen reader users

### Requirement 4: Explicit Gaps Presentation

**User Story:** As a recruiter, I want to see what this candidate explicitly doesn't do, so that I can quickly determine if there's a mismatch with my requirements.

#### Acceptance Criteria

1. THE Explicit_Gaps section SHALL display areas the portfolio owner has intentionally not pursued
2. WHEN displaying an Explicit_Gap, THE Transparency_Dashboard SHALL include a brief explanation of why this area was not pursued
3. THE Explicit_Gaps section SHALL use language that frames gaps as focus decisions, not limitations (e.g., "Chose to specialize in X instead")
4. THE Explicit_Gaps section SHALL NOT be hidden or minimized—transparency requires visibility
5. WHEN the Explicit_Gaps section is empty, THE Transparency_Dashboard SHALL display a message explaining that gaps are being documented
6. THE Explicit_Gaps section SHALL be visually distinct but not apologetic in tone

### Requirement 5: Evidence and Verification

**User Story:** As a hiring manager, I want to verify skill claims with evidence, so that I can trust the self-assessment is accurate.

#### Acceptance Criteria

1. WHEN a Core_Strength is displayed, THE Skill_Card SHALL include at least one Evidence_Link to a project, experience, or certification
2. THE Evidence_Links SHALL navigate to the relevant portfolio section (projects, experience) when clicked
3. WHEN displaying Evidence_Links, THE Transparency_Dashboard SHALL show the evidence type (project, experience, certification)
4. THE Transparency_Dashboard SHALL NOT display skills without supporting evidence in the Core_Strengths tier
5. WHEN a Working_Knowledge skill lacks evidence, THE Transparency_Dashboard SHALL display it with appropriate honesty (e.g., "Learning in progress")
6. THE Evidence_Links SHALL open in the same tab for internal portfolio links

### Requirement 6: Accessibility

**User Story:** As a visitor using assistive technology, I want the transparency dashboard to be fully accessible, so that I can explore skills regardless of my abilities.

#### Acceptance Criteria

1. THE Transparency_Dashboard SHALL comply with WCAG 2.1 AA accessibility standards
2. THE Transparency_Dashboard SHALL support keyboard-only navigation for all interactive elements (Tab, Enter, Escape)
3. WHEN a Skill_Detail_Panel opens, THE Transparency_Dashboard SHALL announce the change to screen readers using ARIA live regions
4. THE Tier_Sections SHALL use semantic HTML headings (h2, h3) for proper document structure
5. THE Skill_Cards SHALL have sufficient color contrast ratios (4.5:1 for normal text, 3:1 for large text)
6. THE tier indicators SHALL NOT rely solely on color to convey meaning—include text labels or icons

### Requirement 7: Mobile Responsiveness

**User Story:** As a recruiter on my phone, I want to browse the transparency dashboard on mobile, so that I can evaluate candidates between meetings.

#### Acceptance Criteria

1. WHEN rendered on Mobile_Viewport (375px width), THE Transparency_Dashboard SHALL adapt its layout without horizontal scrolling
2. THE Tier_Sections SHALL stack vertically on Mobile_Viewport with clear visual separation
3. THE Skill_Cards SHALL display in a single column on Mobile_Viewport
4. WHEN a Skill_Detail_Panel opens on Mobile_Viewport, THE panel SHALL occupy the full screen width
5. THE Transparency_Dashboard SHALL load and become interactive within 2 seconds on a 3G connection
6. WHEN viewport size changes, THE Transparency_Dashboard SHALL maintain its state (open panels, scroll position)

### Requirement 8: Visual Design and Hierarchy

**User Story:** As a visitor, I want the dashboard to be visually clear and professional, so that I can quickly scan and understand the expertise landscape.

#### Acceptance Criteria

1. THE Transparency_Dashboard SHALL use visual hierarchy to emphasize Core_Strengths over Working_Knowledge over Explicit_Gaps
2. THE Core_Strengths section SHALL use larger cards or more prominent styling than other tiers
3. THE Working_Knowledge section SHALL use neutral styling that conveys competence without overstating expertise
4. THE Explicit_Gaps section SHALL use subtle styling that is visible but not attention-grabbing
5. THE Transparency_Dashboard SHALL maintain consistent spacing and alignment across all Tier_Sections
6. THE Transparency_Dashboard SHALL use the portfolio's existing design system (Tailwind CSS classes, color palette)

### Requirement 9: Content Integration

**User Story:** As a portfolio owner, I want the dashboard to pull from my existing content, so that skills stay synchronized with my documented experience.

#### Acceptance Criteria

1. THE Transparency_Dashboard SHALL load skill data from the existing MDX content files (skills.mdx)
2. THE Transparency_Dashboard SHALL map existing skill levels (expert, proficient) to appropriate tiers
3. WHEN skill content is updated in MDX files, THE Transparency_Dashboard SHALL reflect changes without code modifications
4. THE Transparency_Dashboard SHALL support adding Explicit_Gaps through MDX content configuration
5. THE Evidence_Links SHALL reference existing project and experience content from the Knowledge_Base
6. THE Transparency_Dashboard SHALL handle missing or incomplete skill data gracefully without errors

### Requirement 10: Performance

**User Story:** As a visitor, I want the dashboard to load quickly, so that I don't lose interest waiting for content.

#### Acceptance Criteria

1. THE Transparency_Dashboard SHALL achieve a Largest Contentful Paint (LCP) under 2 seconds
2. THE Transparency_Dashboard SHALL not cause layout shifts after initial render (CLS < 0.1)
3. WHEN Skill_Detail_Panels open, THE animation SHALL complete within 200ms
4. THE Transparency_Dashboard SHALL lazy-load Evidence_Links content to minimize initial payload
5. THE Transparency_Dashboard SHALL work without JavaScript for basic content viewing (progressive enhancement)
6. THE Transparency_Dashboard SHALL cache skill data appropriately to avoid redundant fetches

