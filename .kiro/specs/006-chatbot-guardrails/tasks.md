# Implementation Plan: Chatbot Guardrails

## Overview

This implementation plan breaks down the guardrails feature into discrete coding tasks. The approach is:
1. Set up the guardrails service infrastructure and types
2. Implement core detection logic with OpenAI guardrails-js
3. Add security logging
4. Integrate with existing Chat API
5. Integrate with existing Fit Analysis API

## Tasks

- [x] 1. Set up guardrails module structure and dependencies
  - [x] 1.1 Install @openai/guardrails package
    - Run `npm install @openai/guardrails` in frontend directory
    - _Requirements: 1.2_
  
  - [x] 1.2 Create guardrails module directory structure
    - Create `frontend/src/lib/guardrails/` directory
    - Create index.ts for module exports
    - _Requirements: 1.1_
  
  - [x] 1.3 Define TypeScript types and interfaces
    - Create `types.ts` with GuardrailCheckType, GuardrailCheckResult, GuardrailValidationResult, TopicScope, GuardrailConfig
    - _Requirements: 1.1, 1.3, 1.4_

- [x] 2. Implement GuardrailsService core functionality
  - [x] 2.1 Create GuardrailsService class skeleton
    - Create `guardrails-service.ts` with constructor and method signatures
    - Initialize OpenAI guardrails client with API key
    - _Requirements: 1.1, 1.2_
  
  - [x] 2.2 Implement prompt injection detection
    - Add runPromptInjectionCheck method using guardrails-js
    - Return structured result with confidence score
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 2.3 Implement jailbreak detection
    - Add runJailbreakCheck method using guardrails-js
    - Configure detection for role-playing, DAN prompts, hypothetical framing
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 2.4 Implement content moderation check
    - Add runContentModerationCheck method using guardrails-js
    - Check for hate speech, harassment, explicit content, violence
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [x] 2.5 Implement off-topic detection
    - Add runOffTopicCheck method using custom LLM prompt
    - Accept configurable topic scope
    - Allow greetings and conversation starters
    - _Requirements: 4.1, 4.4, 4.5_
  
  - [x] 2.6 Implement validateInput orchestration method
    - Run enabled checks based on config
    - Apply threshold-based blocking logic
    - Return consolidated GuardrailValidationResult
    - _Requirements: 1.3, 1.5, 2.2, 3.3_
  
  - [x] 2.7 Implement validateOutput method
    - Run content moderation on AI-generated output
    - Return validation result for output blocking
    - _Requirements: 5.3, 5.4_
  
  - [x] 2.8 Write property test for validation result structure (Property 1)
    - **Property 1: Validation Result Structure Invariant**
    - **Validates: Requirements 1.4, 6.5**
  
  - [x] 2.9 Write property test for threshold-based blocking (Property 3)
    - **Property 3: Threshold-Based Blocking Behavior**
    - **Validates: Requirements 1.5**
  
  - [x] 2.10 Write property test for config-based check selection (Property 9)
    - **Property 9: Configuration-Based Check Selection**
    - **Validates: Requirements 1.3**

- [x] 3. Implement user-friendly rejection messages
  - [x] 3.1 Create messages module
    - Create `messages.ts` with REJECTION_MESSAGES constant
    - Implement getRejectionMessage function
    - _Requirements: 6.1, 6.3_
  
  - [x] 3.2 Ensure security messages are generic
    - Verify prompt_injection and jailbreak messages don't reveal detection methods
    - _Requirements: 6.4_
  
  - [x] 3.3 Write property test for security message opacity (Property 4)
    - **Property 4: Security Message Opacity**
    - **Validates: Requirements 6.4**

- [x] 4. Checkpoint - Core guardrails service complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement SecurityLogger
  - [x] 5.1 Create security-logger module
    - Create `security-logger.ts` with SecurityEvent interface
    - Implement logSecurityEvent function with structured JSON output
    - _Requirements: 7.1, 7.3, 7.4_
  
  - [x] 5.2 Implement log sanitization
    - Sanitize logged data to prevent log injection attacks
    - Remove/escape newlines, carriage returns, null bytes
    - _Requirements: 7.5_
  
  - [x] 5.3 Implement PII filtering
    - Ensure no message content, emails, or plain IP addresses are logged
    - Create anonymized request ID from request metadata
    - _Requirements: 7.2_
  
  - [x] 5.4 Integrate logger with GuardrailsService
    - Call logSecurityEvent when checks fail
    - Include confidence scores in log entries
    - _Requirements: 2.4, 3.4, 4.6, 7.6_
  
  - [x] 5.5 Write property test for log entry structure (Property 5)
    - **Property 5: Log Entry Structure Completeness**
    - **Validates: Requirements 2.4, 3.4, 4.6, 7.1, 7.3, 7.6**
  
  - [x] 5.6 Write property test for no PII in logs (Property 6)
    - **Property 6: No PII in Security Logs**
    - **Validates: Requirements 7.2**
  
  - [x] 5.7 Write property test for JSON log format (Property 7)
    - **Property 7: Structured JSON Log Format**
    - **Validates: Requirements 7.4**
  
  - [x] 5.8 Write property test for log injection prevention (Property 8)
    - **Property 8: Log Injection Prevention**
    - **Validates: Requirements 7.5**

- [x] 6. Checkpoint - Guardrails service and logging complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integrate guardrails with Chat API
  - [x] 7.1 Create Chat API guardrail configuration
    - Define CHAT_GUARDRAIL_CONFIG with appropriate topic scope
    - Enable all check types for chat
    - _Requirements: 4.2, 8.1_
  
  - [x] 7.2 Add guardrails validation to Chat API route
    - Import and instantiate GuardrailsService
    - Call validateInput before processing messages
    - _Requirements: 8.1_
  
  - [x] 7.3 Handle guardrail rejections in Chat API
    - Return rejection message via SSE without calling LLM
    - Use appropriate error type for frontend handling
    - _Requirements: 8.2_
  
  - [x] 7.4 Add optional output validation to Chat API
    - Validate streamed response chunks or final output
    - Return fallback message if output is blocked
    - _Requirements: 8.3_
  
  - [x] 7.5 Write unit tests for Chat API guardrails integration
    - Test blocked input returns rejection
    - Test clean input proceeds to LLM
    - _Requirements: 8.1, 8.2_

- [x] 8. Integrate guardrails with Fit Analysis API
  - [x] 8.1 Create Fit Analysis API guardrail configuration
    - Define FIT_ANALYSIS_GUARDRAIL_CONFIG with job-related topic scope
    - Enable prompt_injection, jailbreak, content_moderation checks
    - _Requirements: 4.3, 9.1, 9.3_
  
  - [x] 8.2 Add guardrails validation to Fit Analysis API route
    - Import and instantiate GuardrailsService
    - Call validateInput on job description before processing
    - _Requirements: 9.1_
  
  - [x] 8.3 Handle guardrail rejections in Fit Analysis API
    - Return rejection message via SSE without calling LLM
    - Use appropriate error type for frontend handling
    - _Requirements: 9.2_
  
  - [x] 8.4 Write unit tests for Fit Analysis API guardrails integration
    - Test blocked input returns rejection
    - Test clean job description proceeds to analysis
    - _Requirements: 9.1, 9.2_

- [x] 9. Final checkpoint - All integrations complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Write property test for blocking produces user message (Property 2)
  - [x] 10.1 Write property test for blocking behavior
    - **Property 2: Blocking Produces User-Friendly Message**
    - **Validates: Requirements 2.2, 3.3, 5.2, 5.4, 6.1**

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The guardrails service uses fail-open strategy for availability
