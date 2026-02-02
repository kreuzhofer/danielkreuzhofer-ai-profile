# Requirements Document

## Introduction

This document specifies the requirements for implementing guardrails for the portfolio website's AI features. The guardrails will protect both the chatbot (which answers questions about Daniel Kreuzhofer) and the fit analysis feature against misuse including prompt injection, jailbreaks, off-topic queries, and inappropriate content. The guardrails will be implemented as a reusable service that can be applied to any AI endpoint.

## Glossary

- **Guardrails_Service**: The module responsible for validating user inputs and AI outputs against safety policies
- **Chat_API**: The existing `/api/chat` endpoint that handles chatbot requests
- **Fit_Analysis_API**: The `/api/analyze` endpoint that handles job fit analysis requests
- **Security_Logger**: The component that logs blocked or suspicious requests for monitoring
- **Prompt_Injection**: An attack where malicious instructions are embedded in user input to manipulate AI behavior
- **Jailbreak_Attempt**: An attempt to bypass AI safety measures through social engineering or role-playing
- **Off_Topic_Query**: A question unrelated to the intended purpose of the AI feature
- **Content_Moderation**: The process of checking content for inappropriate, harmful, or policy-violating material

## Requirements

### Requirement 1: Guardrails Service Architecture

**User Story:** As a developer, I want a reusable guardrails service, so that I can apply consistent safety checks across all AI endpoints.

#### Acceptance Criteria

1. THE Guardrails_Service SHALL be implemented as a standalone module that can be imported by any API route
2. THE Guardrails_Service SHALL use OpenAI's guardrails-js library (@openai/guardrails) for detection capabilities
3. THE Guardrails_Service SHALL support configurable check types per endpoint (prompt injection, jailbreak, off-topic, content moderation)
4. THE Guardrails_Service SHALL return structured results indicating pass/fail status and violation details
5. THE Guardrails_Service SHALL be configurable with different sensitivity thresholds per check type

### Requirement 2: Prompt Injection Detection

**User Story:** As a site owner, I want the AI features to detect and block prompt injection attempts, so that malicious users cannot manipulate the AI's behavior.

#### Acceptance Criteria

1. WHEN a user submits input to any AI endpoint, THE Guardrails_Service SHALL analyze the input for prompt injection patterns
2. WHEN a prompt injection attempt is detected, THE Guardrails_Service SHALL return a blocked status with a user-friendly rejection message
3. THE Guardrails_Service SHALL detect common injection patterns including: instruction override attempts, system prompt extraction, and delimiter attacks
4. WHEN a prompt injection is blocked, THE Security_Logger SHALL log the attempt with timestamp, endpoint, and detection confidence score

### Requirement 3: Jailbreak Attempt Detection

**User Story:** As a site owner, I want the AI features to detect and block jailbreak attempts, so that users cannot bypass safety measures through social engineering.

#### Acceptance Criteria

1. WHEN a user submits input to any AI endpoint, THE Guardrails_Service SHALL analyze the input for jailbreak patterns
2. THE Guardrails_Service SHALL detect jailbreak patterns including: role-playing requests, "DAN" style prompts, and hypothetical scenario framing
3. WHEN a jailbreak attempt is detected with high confidence, THE Guardrails_Service SHALL return a blocked status with a polite rejection message
4. WHEN a jailbreak attempt is blocked, THE Security_Logger SHALL log the attempt with detection details
5. THE Guardrails_Service SHALL configure jailbreak detection thresholds to minimize false positives on legitimate questions

### Requirement 4: Off-Topic Query Detection

**User Story:** As a site owner, I want the AI features to detect and redirect off-topic questions, so that each feature stays focused on its intended purpose.

#### Acceptance Criteria

1. THE Guardrails_Service SHALL accept a configurable topic scope definition per endpoint
2. FOR the Chat_API, THE topic scope SHALL include: Daniel's professional experience, skills, projects, and general greetings
3. FOR the Fit_Analysis_API, THE topic scope SHALL include: job descriptions, role requirements, and candidate fit assessment
4. WHEN an off-topic query is detected, THE Guardrails_Service SHALL return a redirect status with a message guiding the user back to the intended topic
5. THE Guardrails_Service SHALL allow general greetings and conversation starters without blocking
6. WHEN an off-topic query is detected, THE Security_Logger SHALL log the query category for analytics

### Requirement 5: Content Moderation

**User Story:** As a site owner, I want the AI features to moderate both input and output content, so that inappropriate content is not processed or generated.

#### Acceptance Criteria

1. WHEN a user submits input to any AI endpoint, THE Guardrails_Service SHALL check the input for inappropriate or harmful content
2. WHEN inappropriate input content is detected, THE Guardrails_Service SHALL return a blocked status with a user-friendly message
3. THE Guardrails_Service SHALL provide an output validation function to check AI-generated responses before delivery
4. IF the AI generates inappropriate content, THEN THE Guardrails_Service SHALL return a blocked status and the API SHALL return a fallback message
5. THE content moderation SHALL check for: hate speech, harassment, explicit content, and violence

### Requirement 6: Graceful Rejection Handling

**User Story:** As a user, I want to receive helpful messages when my input is blocked, so that I understand what happened and can rephrase my question.

#### Acceptance Criteria

1. WHEN any guardrail check fails, THE Guardrails_Service SHALL return a user-friendly message appropriate to the violation type
2. THE rejection messages SHALL be polite and maintain the chatbot's friendly tone
3. FOR off-topic rejections, THE message SHALL guide the user toward appropriate questions
4. FOR security rejections (prompt injection, jailbreak), THE message SHALL be generic to avoid revealing detection methods
5. THE Guardrails_Service SHALL return a specific error type that the frontend can handle appropriately

### Requirement 7: Security Event Logging

**User Story:** As a site owner, I want to log blocked and suspicious requests, so that I can monitor for abuse patterns and adjust guardrails as needed.

#### Acceptance Criteria

1. THE Security_Logger SHALL log all blocked requests with: timestamp, event type, endpoint, and detection details
2. THE Security_Logger SHALL NOT log any personally identifiable information or full message content
3. THE Security_Logger SHALL categorize events by type: prompt_injection, jailbreak, off_topic, content_moderation
4. THE Security_Logger SHALL use structured logging format for easy parsing and analysis
5. WHILE logging security events, THE Security_Logger SHALL sanitize any logged data to prevent log injection attacks
6. THE Security_Logger SHALL log detection confidence scores to help tune thresholds over time

### Requirement 8: Chat API Integration

**User Story:** As a developer, I want to integrate guardrails into the existing chat API, so that the chatbot is protected against misuse.

#### Acceptance Criteria

1. THE Chat_API SHALL call the Guardrails_Service to validate user messages before processing
2. WHEN a guardrail check fails, THE Chat_API SHALL return the rejection message without calling the LLM
3. THE Chat_API SHALL optionally validate AI responses before streaming to the client
4. THE Chat_API integration SHALL not significantly impact response latency for legitimate requests

### Requirement 9: Fit Analysis API Integration

**User Story:** As a developer, I want to integrate guardrails into the fit analysis API, so that the analysis feature is protected against misuse.

#### Acceptance Criteria

1. THE Fit_Analysis_API SHALL call the Guardrails_Service to validate job description input before processing
2. WHEN a guardrail check fails, THE Fit_Analysis_API SHALL return the rejection message without calling the LLM
3. THE Fit_Analysis_API SHALL use a topic scope appropriate for job analysis (job descriptions, requirements, qualifications)
4. THE Fit_Analysis_API integration SHALL not significantly impact response latency for legitimate requests

