# Implementation Plan: AI Chatbot ("Ask AI About Me")

## Overview

This implementation plan breaks down the AI chatbot feature into discrete coding tasks. The approach prioritizes:
1. Core infrastructure (context, types, knowledge loader)
2. UI components (trigger, panel, messages, input)
3. API integration with streaming
4. Accessibility and error handling
5. Testing throughout

## Tasks

- [x] 1. Set up project structure and core types
  - [x] 1.1 Create TypeScript interfaces for chat state, messages, and API
    - Create `src/types/chat.ts` with ChatMessage, ChatState, ChatError, ChatContextValue interfaces
    - Create `src/types/knowledge.ts` with KnowledgeContent, ExperienceContent, ProjectContent interfaces
    - _Requirements: 2.1, 3.1, 5.1_

  - [x] 1.2 Create ChatContext with state management
    - Create `src/context/ChatContext.tsx` with ChatProvider and useChat hook
    - Implement state for messages, isOpen, isLoading, error
    - Implement actions: openChat, closeChat, sendMessage, clearConversation, retryLastMessage
    - Add session storage persistence for conversation
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 1.3 Write property test for conversation persistence round-trip
    - **Property 5: Conversation Context Round-Trip**
    - **Validates: Requirements 5.1, 5.2**

- [x] 2. Implement Knowledge Loader
  - [x] 2.1 Create knowledge loader utility
    - Create `src/lib/knowledge-loader.ts`
    - Implement loadAllContent() to read MDX files and knowledge base
    - Implement compileKnowledgeContext() to format content for LLM prompt
    - Parse experience, projects, skills from existing content structure
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 2.2 Write unit tests for knowledge loader
    - Test that all experience entries are loaded
    - Test that all project details are loaded
    - Test that skills and certifications are loaded
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 3. Implement Chat UI Components
  - [x] 3.1 Create ChatTriggerButton component
    - Create `src/components/chat/ChatTriggerButton.tsx`
    - Implement floating button with chat icon
    - Add 44×44px minimum touch target for mobile
    - Add keyboard accessibility (Enter/Space to activate)
    - Add aria-label and aria-expanded attributes
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 3.2 Create ChatPanel component with portal rendering
    - Create `src/components/chat/ChatPanel.tsx`
    - Use createPortal to render to document.body
    - Implement header with title, new chat button, close button
    - Implement focus trap when panel is open
    - Add keyboard handler for Escape to close
    - _Requirements: 1.2, 7.5_

  - [x] 3.3 Create MessageList component
    - Create `src/components/chat/MessageList.tsx`
    - Render welcome message and conversation messages
    - Implement auto-scroll to latest message
    - Add ARIA live region for screen reader announcements
    - Style user vs assistant messages differently
    - _Requirements: 1.3, 5.4, 7.2_

  - [x] 3.4 Create ChatMessage component
    - Create `src/components/chat/ChatMessage.tsx`
    - Display message content with role indicator
    - Show timestamp
    - Handle streaming state (partial content)
    - Handle error state with retry button
    - _Requirements: 3.4, 6.4_

  - [x] 3.5 Create ChatInput component
    - Create `src/components/chat/ChatInput.tsx`
    - Implement textarea with send button
    - Validate non-empty input before submission
    - Disable send button during loading
    - Clear input after successful submission
    - Handle Enter to submit, Shift+Enter for newline
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

  - [x] 3.6 Write property test for empty message rejection
    - **Property 3: Empty Message Rejection**
    - **Validates: Requirements 2.4**

  - [x] 3.7 Write property test for keyboard accessibility
    - **Property 1: Keyboard Accessibility**
    - **Validates: Requirements 1.4, 7.3**

- [x] 4. Checkpoint - Ensure UI components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement API Route with Streaming
  - [x] 5.1 Create chat API route
    - Create `src/app/api/chat/route.ts`
    - Implement POST handler that accepts messages array
    - Load knowledge context using knowledge loader
    - Build system prompt with knowledge context
    - _Requirements: 3.1, 10.4_

  - [x] 5.2 Implement LLM client with streaming
    - Add LLM provider integration (e.g., OpenAI, Anthropic, or AWS Bedrock)
    - Implement SSE streaming response
    - Handle conversation context in prompt
    - Configure system prompt for peer tone and knowledge boundaries
    - _Requirements: 3.2, 3.3, 3.5, 4.1, 4.3_

  - [x] 5.3 Implement error handling in API route
    - Handle timeout (30 second limit)
    - Handle LLM provider errors
    - Return user-friendly error messages
    - Never expose technical details or API keys
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 5.4 Write unit tests for API route
    - Test successful response streaming
    - Test timeout handling
    - Test error response format
    - _Requirements: 6.1, 6.3_

- [x] 6. Integrate Frontend with API
  - [x] 6.1 Implement stream handler in ChatContext
    - Create `src/lib/stream-handler.ts`
    - Parse SSE events from API response
    - Update message content incrementally during streaming
    - Handle stream completion and errors
    - _Requirements: 3.2, 3.4_

  - [x] 6.2 Connect ChatInput submission to API
    - Wire sendMessage action to POST /api/chat
    - Pass conversation history for context
    - Handle loading state during request
    - Handle error state and retry
    - _Requirements: 2.1, 2.2, 6.4_

  - [x] 6.3 Write property test for message submission state changes
    - **Property 2: Message Submission State Changes**
    - **Validates: Requirements 2.2, 2.3**

  - [x] 6.4 Write property test for send button disabled during loading
    - **Property 4: Send Button Disabled During Loading**
    - **Validates: Requirements 2.5**

- [x] 7. Checkpoint - Ensure end-to-end chat flow works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Accessibility Features
  - [x] 8.1 Add ARIA live region for message announcements
    - Implement visually hidden live region
    - Announce new assistant messages
    - Use aria-live="polite" for non-urgent updates
    - _Requirements: 7.2_

  - [x] 8.2 Implement focus management
    - Move focus to input when panel opens
    - Return focus to trigger button when panel closes
    - Implement focus trap within open panel
    - _Requirements: 7.5_

  - [x] 8.3 Write property test for focus management
    - **Property 10: Focus Management on Open/Close**
    - **Validates: Requirements 7.5**

  - [x] 8.4 Write accessibility tests with jest-axe
    - Test ChatTriggerButton for WCAG compliance
    - Test ChatPanel for WCAG compliance
    - Test color contrast ratios
    - _Requirements: 7.1, 7.4_

- [x] 9. Implement Error Handling UI
  - [x] 9.1 Create error message display component
    - Show user-friendly error messages
    - Display retry button for retryable errors
    - Preserve failed message for retry
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 9.2 Write property test for error handling with retry
    - **Property 8: Error Handling with Retry**
    - **Validates: Requirements 6.3, 6.4**

- [x] 10. Implement Responsive Design
  - [x] 10.1 Add mobile-responsive styles to ChatPanel
    - Full-width panel on mobile viewport
    - Proper spacing for touch targets
    - Handle viewport resize gracefully
    - _Requirements: 9.1, 9.4_

  - [x] 10.2 Write property test for state persistence across viewport changes
    - **Property 11: State Persistence Across Viewport Changes**
    - **Validates: Requirements 9.4**

- [x] 11. Wire Chat Components to Page
  - [x] 11.1 Add ChatProvider to app layout
    - Wrap app in ChatProvider in `src/app/layout.tsx`
    - Add ChatTriggerButton to layout
    - Ensure chat is available on all pages
    - _Requirements: 1.1_

  - [x] 11.2 Write integration test for chat flow
    - Test opening chat, sending message, receiving response
    - Test closing and reopening preserves conversation
    - Test clearing conversation
    - _Requirements: 1.2, 5.1, 5.2, 5.3_

- [x] 12. Final Checkpoint - Full feature verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify chat works on mobile viewport (375px)
  - Verify keyboard navigation works end-to-end
  - Verify screen reader announcements work

## Notes

- All tasks are required (comprehensive testing from start)
- Each task references specific requirements for traceability
- Property tests use `{ numRuns: 3 }` per workspace guidelines
- LLM provider choice (OpenAI, Anthropic, Bedrock) to be determined during implementation
- Environment variables needed: LLM API key, model configuration
