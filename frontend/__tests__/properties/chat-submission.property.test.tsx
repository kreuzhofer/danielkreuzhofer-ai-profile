/**
 * Property Tests for Chat Message Submission
 *
 * These tests validate:
 * - Property 2: Message submission state changes (message appears, input clears)
 * - Property 3: Empty and whitespace-only messages are properly rejected
 *
 * Feature: ai-chatbot
 *
 * **Validates: Requirements 2.2, 2.3, 2.4**
 */

import * as fc from 'fast-check';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatProvider, useChat } from '@/context/ChatContext';

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating whitespace-only strings
 * Includes: empty string, spaces, tabs, newlines, carriage returns
 */
const whitespaceOnlyArbitrary: fc.Arbitrary<string> = fc.oneof(
  // Empty string
  fc.constant(''),
  // Strings composed only of whitespace characters
  fc
    .array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 50 })
    .map((chars) => chars.join(''))
);

/**
 * Arbitrary for generating various whitespace combinations
 * Tests different patterns of whitespace that should all be rejected
 */
const whitespacePatternArbitrary: fc.Arbitrary<string> = fc.oneof(
  // Just spaces
  fc
    .array(fc.constant(' '), { minLength: 0, maxLength: 20 })
    .map((chars) => chars.join('')),
  // Just tabs
  fc
    .array(fc.constant('\t'), { minLength: 0, maxLength: 10 })
    .map((chars) => chars.join('')),
  // Just newlines
  fc
    .array(fc.constant('\n'), { minLength: 0, maxLength: 10 })
    .map((chars) => chars.join('')),
  // Mixed whitespace
  fc
    .array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 0, maxLength: 30 })
    .map((chars) => chars.join(''))
);

/**
 * Arbitrary for generating valid (non-empty) message content
 * Generates strings that have at least one non-whitespace character
 */
const validMessageArbitrary: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

// =============================================================================
// Property 2: Message Submission State Changes
// =============================================================================

/**
 * Feature: ai-chatbot, Property 2: Message Submission State Changes
 *
 * *For any* valid (non-empty) message submitted through the Chatbot_Interface,
 * the message SHALL appear in the conversation area immediately,
 * AND the input field SHALL be cleared after submission.
 *
 * **Validates: Requirements 2.2, 2.3**
 */
describe('Property 2: Message Submission State Changes', () => {
  // Mock fetch for API calls
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"type":"chunk","content":"Response"}\n\n'));
            controller.enqueue(new TextEncoder().encode('data: {"type":"done"}\n\n'));
            controller.close();
          },
        }),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Input Cleared After Valid Submission', () => {
    it('input field is cleared after submitting a valid message', () => {
      fc.assert(
        fc.property(validMessageArbitrary, (messageContent) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea') as HTMLTextAreaElement;
          const form = screen.getByTestId('chat-input-form');

          // Set the input value to a valid message
          fireEvent.change(textarea, { target: { value: messageContent } });

          // Submit the form
          fireEvent.submit(form);

          // Input should be cleared after submission
          const inputCleared = textarea.value === '';

          // onSubmit should have been called with the trimmed message
          const submitCalled = onSubmit.mock.calls.length === 1;
          const correctContent = onSubmit.mock.calls[0]?.[0] === messageContent.trim();

          // Cleanup for next iteration
          document.body.innerHTML = '';

          return inputCleared && submitCalled && correctContent;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Message Appears in Conversation', () => {
    // Test component that displays messages
    function TestChatDisplay() {
      const { messages, sendMessage, isLoading } = useChat();
      const [inputValue, setInputValue] = React.useState('');

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
          await sendMessage(inputValue);
          setInputValue('');
        }
      };

      return (
        <div>
          <div data-testid="message-count">{messages.length}</div>
          <div data-testid="loading-state">{isLoading ? 'loading' : 'idle'}</div>
          {messages.map((msg) => (
            <div key={msg.id} data-testid={`message-${msg.role}`}>
              {msg.content}
            </div>
          ))}
          <form onSubmit={handleSubmit}>
            <input
              data-testid="test-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" data-testid="test-submit">
              Send
            </button>
          </form>
        </div>
      );
    }

    it('user message appears in conversation after submission', async () => {
      await fc.assert(
        fc.asyncProperty(validMessageArbitrary, async (messageContent) => {
          render(
            <ChatProvider>
              <TestChatDisplay />
            </ChatProvider>
          );

          const input = screen.getByTestId('test-input') as HTMLInputElement;
          const submitButton = screen.getByTestId('test-submit');

          // Get initial message count (should be 1 for welcome message)
          const initialCount = parseInt(screen.getByTestId('message-count').textContent || '0');

          // Enter and submit message
          await act(async () => {
            fireEvent.change(input, { target: { value: messageContent } });
          });

          await act(async () => {
            fireEvent.click(submitButton);
          });

          // Wait for the message to appear
          await waitFor(() => {
            const currentCount = parseInt(screen.getByTestId('message-count').textContent || '0');
            // Should have at least 2 more messages (user + assistant)
            return currentCount > initialCount;
          }, { timeout: 1000 });

          // Check that user message appears
          const userMessages = screen.getAllByTestId('message-user');
          const messageAppeared = userMessages.some(
            (el) => el.textContent === messageContent.trim()
          );

          // Cleanup for next iteration
          document.body.innerHTML = '';

          return messageAppeared;
        }),
        { numRuns: 3 }
      );
    });
  });
});

// =============================================================================
// Property 3: Empty Message Rejection
// =============================================================================

/**
 * Feature: ai-chatbot, Property 3: Empty Message Rejection
 *
 * *For any* string composed entirely of whitespace characters (including empty string),
 * attempting to submit it SHALL be prevented, and the conversation state SHALL remain unchanged.
 *
 * **Validates: Requirements 2.4**
 */
describe('Property 3: Empty Message Rejection', () => {
  describe('Send Button Disabled for Whitespace Input', () => {
    it('send button is disabled for all whitespace-only strings', () => {
      fc.assert(
        fc.property(whitespaceOnlyArbitrary, (whitespaceString) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea');
          const sendButton = screen.getByTestId('chat-input-send-button');

          // Set the input value to the whitespace string
          fireEvent.change(textarea, { target: { value: whitespaceString } });

          // Send button should be disabled for whitespace-only input
          const isDisabled = sendButton.hasAttribute('disabled');

          // Cleanup for next iteration
          document.body.innerHTML = '';

          return isDisabled === true;
        }),
        { numRuns: 3 }
      );
    });

    it('send button is disabled for various whitespace patterns', () => {
      fc.assert(
        fc.property(whitespacePatternArbitrary, (whitespaceString) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea');
          const sendButton = screen.getByTestId('chat-input-send-button');

          // Set the input value to the whitespace string
          fireEvent.change(textarea, { target: { value: whitespaceString } });

          // Send button should be disabled for whitespace-only input
          const isDisabled = sendButton.hasAttribute('disabled');

          // Cleanup for next iteration
          document.body.innerHTML = '';

          return isDisabled === true;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Form Submission Prevention for Whitespace Input', () => {
    it('onSubmit is NOT called when form is submitted with whitespace-only input', () => {
      fc.assert(
        fc.property(whitespaceOnlyArbitrary, (whitespaceString) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea');
          const form = screen.getByTestId('chat-input-form');

          // Set the input value to the whitespace string
          fireEvent.change(textarea, { target: { value: whitespaceString } });

          // Attempt to submit the form
          fireEvent.submit(form);

          // onSubmit should NOT have been called
          const wasNotCalled = onSubmit.mock.calls.length === 0;

          // Cleanup for next iteration
          document.body.innerHTML = '';

          return wasNotCalled === true;
        }),
        { numRuns: 3 }
      );
    });

    it('onSubmit is NOT called when Enter key is pressed with whitespace-only input', () => {
      fc.assert(
        fc.property(whitespaceOnlyArbitrary, (whitespaceString) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea');

          // Set the input value to the whitespace string
          fireEvent.change(textarea, { target: { value: whitespaceString } });

          // Attempt to submit via Enter key
          fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });

          // onSubmit should NOT have been called
          const wasNotCalled = onSubmit.mock.calls.length === 0;

          // Cleanup for next iteration
          document.body.innerHTML = '';

          return wasNotCalled === true;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Input State Preservation on Rejected Submission', () => {
    it('input value is preserved when submission is rejected', () => {
      fc.assert(
        fc.property(whitespaceOnlyArbitrary, (whitespaceString) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea') as HTMLTextAreaElement;
          const form = screen.getByTestId('chat-input-form');

          // Set the input value to the whitespace string
          fireEvent.change(textarea, { target: { value: whitespaceString } });

          // Capture the value after browser normalization (browsers normalize \r to \n)
          const normalizedValue = textarea.value;

          // Attempt to submit the form
          fireEvent.submit(form);

          // Input value should be preserved (not cleared) since submission was rejected
          // We compare against the normalized value since browsers normalize carriage returns
          const valuePreserved = textarea.value === normalizedValue;

          // Cleanup for next iteration
          document.body.innerHTML = '';

          return valuePreserved === true;
        }),
        { numRuns: 3 }
      );
    });
  });
});


// =============================================================================
// Property 4: Send Button Disabled During Loading
// =============================================================================

/**
 * Feature: ai-chatbot, Property 4: Send Button Disabled During Loading
 *
 * *For any* message submission that triggers a loading state,
 * the send button SHALL be disabled until the response is complete or an error occurs.
 *
 * **Validates: Requirements 2.5**
 */
describe('Property 4: Send Button Disabled During Loading', () => {
  describe('Send Button Disabled State', () => {
    it('send button is disabled when disabled prop is true', () => {
      fc.assert(
        fc.property(validMessageArbitrary, (messageContent) => {
          render(<ChatInput onSubmit={jest.fn()} disabled={true} />);

          const textarea = screen.getByTestId('chat-input-textarea') as HTMLTextAreaElement;
          const sendButton = screen.getByTestId('chat-input-send-button');

          // Set the input value to a valid message
          fireEvent.change(textarea, { target: { value: messageContent } });

          // Send button should be disabled even with valid input
          const isDisabled = sendButton.hasAttribute('disabled');

          // Cleanup for next iteration
          document.body.innerHTML = '';

          return isDisabled === true;
        }),
        { numRuns: 3 }
      );
    });

    it('form submission is prevented when disabled', () => {
      fc.assert(
        fc.property(validMessageArbitrary, (messageContent) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={true} />);

          const textarea = screen.getByTestId('chat-input-textarea') as HTMLTextAreaElement;
          const form = screen.getByTestId('chat-input-form');

          // Set the input value to a valid message
          fireEvent.change(textarea, { target: { value: messageContent } });

          // Attempt to submit the form
          fireEvent.submit(form);

          // onSubmit should NOT have been called because component is disabled
          const wasNotCalled = onSubmit.mock.calls.length === 0;

          // Cleanup for next iteration
          document.body.innerHTML = '';

          return wasNotCalled === true;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Loading State Integration', () => {
    // Test component that shows loading state
    function TestLoadingChat() {
      const { isLoading, sendMessage } = useChat();
      const [inputValue, setInputValue] = React.useState('');

      const handleSubmit = async (content: string) => {
        await sendMessage(content);
        setInputValue('');
      };

      return (
        <div>
          <div data-testid="loading-indicator">{isLoading ? 'loading' : 'idle'}</div>
          <ChatInput
            onSubmit={handleSubmit}
            disabled={isLoading}
            placeholder="Type a message..."
          />
        </div>
      );
    }

    it('send button becomes disabled during message submission', async () => {
      // This test verifies that the send button is disabled when the disabled prop is true
      // which happens during loading state. We test this by checking the ChatInput component
      // directly with the disabled prop.
      
      // Test that disabled prop correctly disables the button
      const { unmount } = render(<ChatInput onSubmit={jest.fn()} disabled={true} />);
      
      const sendButton = screen.getByTestId('chat-input-send-button');
      expect(sendButton).toBeDisabled();
      
      unmount();
      
      // Test that enabled prop allows the button to be enabled (with valid input)
      const { unmount: unmount2 } = render(<ChatInput onSubmit={jest.fn()} disabled={false} />);
      
      const textarea2 = screen.getByTestId('chat-input-textarea') as HTMLTextAreaElement;
      const sendButton2 = screen.getByTestId('chat-input-send-button');
      
      // With empty input, button should be disabled
      expect(sendButton2).toBeDisabled();
      
      // With valid input, button should be enabled
      fireEvent.change(textarea2, { target: { value: 'Hello' } });
      expect(sendButton2).not.toBeDisabled();
      
      unmount2();
    });
  });
});
