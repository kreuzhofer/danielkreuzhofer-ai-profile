# Implementation Plan: Fit Analysis Module

## Overview

This implementation plan breaks down the Automated Fit Analysis Module into discrete coding tasks. The module enables visitors to paste job descriptions and receive honest assessments of alignment with the portfolio owner's documented experience. The implementation leverages existing infrastructure (Knowledge_Base, LLM client) from the AI chatbot feature.

## Tasks

- [x] 1. Set up project structure and core types
  - [x] 1.1 Create TypeScript interfaces for Fit Analysis types
    - Create `frontend/src/types/fit-analysis.ts` with MatchAssessment, AlignmentArea, GapArea, Evidence, Recommendation, ConfidenceLevel, and FitAnalysisError types
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_
  - [x] 1.2 Create FitAnalysisContext with state management
    - Create `frontend/src/context/FitAnalysisContext.tsx` with state for jobDescription, isAnalyzing, currentResult, analysisHistory, and error
    - Implement actions: setJobDescription, submitAnalysis, clearCurrentResult, loadHistoryItem, clearHistory, retryAnalysis
    - _Requirements: 2.1, 5.1, 5.2, 5.3, 6.4_
  - [x] 1.3 Write unit tests for FitAnalysisContext
    - Test state transitions and action handlers
    - _Requirements: 2.1, 5.1, 5.2, 5.3_

- [x] 2. Implement input validation and submission logic
  - [x] 2.1 Create input validation utility
    - Create `frontend/src/lib/fit-analysis-validation.ts` with validateJobDescription function
    - Implement empty/whitespace rejection, minimum length warning, maximum length validation
    - _Requirements: 2.3, 2.4, 1.3_
  - [x] 2.2 Write property test for empty/whitespace rejection
    - **Property 4: Empty/Whitespace Rejection**
    - **Validates: Requirements 2.3**
  - [x] 2.3 Write property test for short input warning
    - **Property 5: Short Input Warning**
    - **Validates: Requirements 2.4**
  - [x] 2.4 Write unit tests for validation utility
    - Test edge cases: exactly 50 chars, exactly 5000 chars, mixed whitespace
    - _Requirements: 2.3, 2.4, 1.3_

- [x] 3. Implement API route for analysis
  - [x] 3.1 Create analysis prompt builder
    - Create `frontend/src/lib/fit-analysis-prompt.ts` with buildAnalysisPrompt function
    - Use existing knowledgeLoader to compile context
    - Build prompt template for honest fit assessment
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [x] 3.2 Create response parser for LLM output
    - Create `frontend/src/lib/fit-analysis-parser.ts` with parseAnalysisResponse function
    - Validate JSON structure, map to MatchAssessment type
    - Handle malformed responses gracefully
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_
  - [x] 3.3 Write property test for assessment structure validity
    - **Property 8: Assessment Structure Validity**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.6**
  - [x] 3.4 Write property test for evidence in alignments
    - **Property 9: Evidence in Alignments**
    - **Validates: Requirements 3.5, 4.1**
  - [x] 3.5 Create /api/analyze route handler
    - Create `frontend/src/app/api/analyze/route.ts`
    - Use existing LLM client for generation
    - Implement timeout handling (30 seconds)
    - Return structured MatchAssessment JSON
    - _Requirements: 2.1, 2.6, 6.1, 6.3_
  - [x] 3.6 Write unit tests for API route
    - Test successful analysis, timeout, error responses
    - _Requirements: 2.1, 6.1, 6.3_

- [x] 4. Checkpoint - Ensure API layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement input UI components
  - [x] 5.1 Create InputSection component
    - Create `frontend/src/components/fit-analysis/InputSection.tsx`
    - Implement textarea with placeholder, character count, validation messages
    - Add submit button with loading state
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 2.5_
  - [x] 5.2 Write property test for character count accuracy
    - **Property 2: Character Count Accuracy**
    - **Validates: Requirements 1.4**
  - [x] 5.3 Write property test for submit button disabled during loading
    - **Property 6: Submit Button Disabled During Loading**
    - **Validates: Requirements 2.5**
  - [x] 5.4 Write unit tests for InputSection
    - Test rendering, validation display, character count, button states
    - _Requirements: 1.1, 1.2, 1.4, 2.3, 2.5_

- [x] 6. Implement results UI components
  - [x] 6.1 Create ConfidenceIndicator component
    - Create `frontend/src/components/fit-analysis/ConfidenceIndicator.tsx`
    - Display confidence level with icon, label, and color (not color-only)
    - _Requirements: 3.2, 7.5_
  - [x] 6.2 Write property test for confidence indicators not color-only
    - **Property 15: Confidence Indicators Not Color-Only**
    - **Validates: Requirements 7.5**
  - [x] 6.3 Create AlignmentList component
    - Create `frontend/src/components/fit-analysis/AlignmentList.tsx`
    - Display alignment areas with evidence links
    - _Requirements: 3.3, 3.5, 4.2_
  - [x] 6.4 Create GapList component
    - Create `frontend/src/components/fit-analysis/GapList.tsx`
    - Display gap areas with severity indicators
    - _Requirements: 3.4, 4.3_
  - [x] 6.5 Create RecommendationCard component
    - Create `frontend/src/components/fit-analysis/RecommendationCard.tsx`
    - Display recommendation with type indicator and details
    - _Requirements: 3.6_
  - [x] 6.6 Create ResultsSection component
    - Create `frontend/src/components/fit-analysis/ResultsSection.tsx`
    - Compose ConfidenceIndicator, AlignmentList, GapList, RecommendationCard
    - Add disclaimer about AI-generated content
    - _Requirements: 3.1, 10.4, 10.5_
  - [x] 6.7 Write unit tests for results components
    - Test rendering of all result sections with mock data
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 7. Implement history functionality
  - [x] 7.1 Create session storage utilities
    - Create `frontend/src/lib/fit-analysis-storage.ts`
    - Implement saveAnalysis, loadHistory, clearHistory functions
    - Cap history at 5 items
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
  - [x] 7.2 Write property test for history persistence round-trip
    - **Property 11: History Persistence Round-Trip**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  - [x] 7.3 Write property test for history capped at maximum
    - **Property 12: History Capped at Maximum**
    - **Validates: Requirements 5.5**
  - [x] 7.4 Create HistoryPanel component
    - Create `frontend/src/components/fit-analysis/HistoryPanel.tsx`
    - Display list of recent analyses with preview and confidence
    - Allow loading previous results
    - _Requirements: 5.2, 5.3, 5.5_
  - [x] 7.5 Write unit tests for history components
    - Test history display, item selection, clearing
    - _Requirements: 5.2, 5.3, 5.5_

- [x] 8. Checkpoint - Ensure component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement accessibility features
  - [x] 9.1 Add keyboard navigation support
    - Implement Tab navigation for all interactive elements
    - Add Enter/Space activation for buttons
    - Add Ctrl+Enter shortcut for submit
    - _Requirements: 1.6, 7.3_
  - [x] 9.2 Write property test for keyboard accessibility
    - **Property 3: Keyboard Accessibility**
    - **Validates: Requirements 1.6, 7.3**
  - [x] 9.3 Add ARIA live regions for results
    - Announce analysis completion to screen readers
    - Manage focus when results appear
    - _Requirements: 7.2, 7.6_
  - [x] 9.4 Write property test for ARIA live region announcements
    - **Property 14: ARIA Live Region Announcements**
    - **Validates: Requirements 7.2, 7.6**
  - [x] 9.5 Write accessibility tests with jest-axe
    - Test WCAG 2.1 AA compliance for all components
    - _Requirements: 7.1, 7.4_

- [x] 10. Implement error handling
  - [x] 10.1 Create error display component
    - Create `frontend/src/components/fit-analysis/ErrorDisplay.tsx`
    - Display user-friendly error messages with retry button
    - Suggest alternatives when LLM unavailable
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 10.2 Write property test for error handling with input preservation
    - **Property 13: Error Handling with Input Preservation**
    - **Validates: Requirements 6.2, 6.3, 6.4**
  - [x] 10.3 Write unit tests for error handling
    - Test timeout, network error, server error scenarios
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 11. Implement main module and page integration
  - [x] 11.1 Create FitAnalysisModule component
    - Create `frontend/src/components/fit-analysis/FitAnalysisModule.tsx`
    - Compose IntroSection, InputSection, LoadingState, ResultsSection, HistoryPanel
    - Add responsive layout for mobile/desktop
    - _Requirements: 1.1, 8.1, 10.1_
  - [x] 11.2 Create IntroSection component
    - Create `frontend/src/components/fit-analysis/IntroSection.tsx`
    - Display title, description, example prompts
    - Use inviting language
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 11.3 Create LoadingState component
    - Create `frontend/src/components/fit-analysis/LoadingState.tsx`
    - Display progress indicator and status message
    - _Requirements: 2.2_
  - [x] 11.4 Create fit analysis page
    - Create `frontend/src/app/fit-analysis/page.tsx`
    - Wrap with FitAnalysisProvider
    - Add page metadata for SEO
    - _Requirements: 1.1_
  - [x] 11.5 Write integration tests for full analysis flow
    - Test complete flow from input to results display
    - _Requirements: 2.1, 3.1_

- [x] 12. Implement mobile responsiveness
  - [x] 12.1 Add responsive styles to all components
    - Ensure 375px viewport works without horizontal scroll
    - Ensure touch targets are 44×44 pixels minimum
    - _Requirements: 1.5, 8.1, 8.3_
  - [x] 12.2 Write property test for state persistence across viewport changes
    - **Property 16: State Persistence Across Viewport Changes**
    - **Validates: Requirements 8.4**
  - [x] 12.3 Write unit tests for mobile layout
    - Test component rendering at 375px viewport
    - _Requirements: 8.1_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive testing from the start
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with `{ numRuns: 3 }`
- Unit tests validate specific examples and edge cases
- The implementation leverages existing Knowledge_Base and LLM infrastructure from the AI chatbot
