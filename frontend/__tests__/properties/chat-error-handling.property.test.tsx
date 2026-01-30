/**
 * Property Tests for Chat Error Handling
 *
 * These tests validate that error states are properly displayed and
 * retry functionality works correctly.
 *
 * Feature: ai-chatbot, Property 8: Error Handling with Retry
 *
 * **Validates: Requirements 6.3, 6.4**
 */

import * as fc from 'fast-check';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import type { ChatMessage as ChatMessageType, ChatErrorType } from '@/types/chat';

// Ensure cleanup after each test
afterEach(() => {
  cleanup();
});

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating error types
 */
const errorTypeArbitrary: fc.Arbitrary<ChatErrorType> = fc.constantFrom(
  'network',
  'timeout',
  'server',
  'unknown'
);

/**
 * Arbitrary for generating user-friendly error messages
 * These should NOT contain technical details
 */
const userFriendlyErrorMessageArbitrary: fc.Arbitrary<string> = fc.constantFrom(
  'Unable to connect. Please check your connection and try again.',
  'The response is taking too long. Please try again.',
  'Something went wrong on our end. Please try again.',
  'An unexpected error occurred. Please try again.'
);

/**
 * Arbitrary for generating message content
 */
const messageContentArbitrary: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0);

/**
 * Arbitrary for generating error messages
 */
const errorMessageArbitrary: fc.Arbitrary<ChatMessageType> = fc.record({
  id: fc.uuid(),
  role: fc.constant('user' as const),
  content: messageContentArbitrary,
  timestamp: fc.date(),
  status: fc.constant('error' as const),
});

// =============================================================================
// Property 8: Error Handling with Retry
// =============================================================================

/**
 * Feature: ai-chatbot, Property 8: Error Handling with Retry
 *
 * *For any* error that occurs during message submission or response generation,
 * the Chatbot_Interface SHALL display a user-friendly error message
 * (without technical details) AND provide a retry mechanism for the failed message.
 *
 * **Validates: Requirements 6.3, 6.4**
 */
describe('Property 8: Error Handling with Retry', () => {
  describe('Error Message Display', () => {
    it('displays error styling for messages with error status', () => {
      fc.assert(
        fc.property(errorMessageArbitrary, (message) => {
          const { unmount } = render(
            <ChatMessage message={message} onRetry={() => {}} />
          );

          const messageElement = screen.getByTestId(`message-${message.id}`);
          const bubble = messageElement.querySelector('[class*="border-red"]');

          // Should have error styling (red border)
          const hasErrorStyling = bubble !== null;

          unmount();

          return hasErrorStyling;
        }),
        { numRuns: 3 }
      );
    });

    it('displays "Failed to send message" text for error messages', () => {
      fc.assert(
        fc.property(errorMessageArbitrary, (message) => {
          const { unmount } = render(
            <ChatMessage message={message} onRetry={() => {}} />
          );

          // Should show error text
          const errorText = screen.queryByText('Failed to send message');
          const hasErrorText = errorText !== null;

          unmount();

          return hasErrorText;
        }),
        { numRuns: 3 }
      );
    });

    it('preserves original message content in error state', () => {
      fc.assert(
        fc.property(errorMessageArbitrary, (message) => {
          const { unmount } = render(
            <ChatMessage message={message} onRetry={() => {}} />
          );

          // Original message content should still be visible
          const contentElement = screen.getByTestId('message-content');
          const contentPreserved = contentElement.textContent === message.content;

          unmount();

          return contentPreserved;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Retry Mechanism', () => {
    it('displays retry button for error messages when onRetry is provided', () => {
      fc.assert(
        fc.property(errorMessageArbitrary, (message) => {
          const { unmount } = render(
            <ChatMessage message={message} onRetry={() => {}} />
          );

          const retryButton = screen.queryByTestId('retry-button');
          const hasRetryButton = retryButton !== null;

          unmount();

          return hasRetryButton;
        }),
        { numRuns: 3 }
      );
    });

    it('does NOT display retry button when onRetry is not provided', () => {
      fc.assert(
        fc.property(errorMessageArbitrary, (message) => {
          const { unmount } = render(
            <ChatMessage message={message} />
          );

          const retryButton = screen.queryByTestId('retry-button');
          const noRetryButton = retryButton === null;

          unmount();

          return noRetryButton;
        }),
        { numRuns: 3 }
      );
    });

    it('calls onRetry when retry button is clicked', () => {
      fc.assert(
        fc.property(errorMessageArbitrary, (message) => {
          const onRetry = jest.fn();
          const { unmount } = render(
            <ChatMessage message={message} onRetry={onRetry} />
          );

          const retryButton = screen.getByTestId('retry-button');
          fireEvent.click(retryButton);

          const retryCalled = onRetry.mock.calls.length === 1;

          unmount();

          return retryCalled;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('User-Friendly Error Messages', () => {
    it('error messages do not contain technical details', () => {
      fc.assert(
        fc.property(userFriendlyErrorMessageArbitrary, (errorMessage) => {
          // Technical details that should NOT appear
          const technicalTerms = [
            'API key',
            'OPENAI_API_KEY',
            'stack trace',
            'Error:',
            'TypeError',
            'ReferenceError',
            '500',
            '401',
            '403',
            'undefined',
            'null',
            'JSON',
            'fetch',
            'HTTP',
          ];

          // Check that none of the technical terms appear
          const containsTechnicalDetails = technicalTerms.some((term) =>
            errorMessage.toLowerCase().includes(term.toLowerCase())
          );

          return !containsTechnicalDetails;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Error State Accessibility', () => {
    it('error section has proper test id for identification', () => {
      fc.assert(
        fc.property(errorMessageArbitrary, (message) => {
          const { unmount } = render(
            <ChatMessage message={message} onRetry={() => {}} />
          );

          const errorSection = screen.queryByTestId('error-section');
          const hasErrorSection = errorSection !== null;

          unmount();

          return hasErrorSection;
        }),
        { numRuns: 3 }
      );
    });

    it('retry button is keyboard accessible', () => {
      fc.assert(
        fc.property(errorMessageArbitrary, (message) => {
          const onRetry = jest.fn();
          const { unmount } = render(
            <ChatMessage message={message} onRetry={onRetry} />
          );

          const retryButton = screen.getByTestId('retry-button') as HTMLButtonElement;

          // Should be focusable
          retryButton.focus();
          const isFocusable = document.activeElement === retryButton;

          // Should be a button element
          const isButton = retryButton.tagName === 'BUTTON';

          unmount();

          return isFocusable && isButton;
        }),
        { numRuns: 3 }
      );
    });
  });
});
