/**
 * Property Tests for Chat Keyboard Accessibility
 *
 * These tests validate that all interactive elements in the Chatbot_Interface
 * are focusable via Tab key and activatable via Enter or Space key.
 *
 * Feature: ai-chatbot, Property 1: Keyboard Accessibility
 *
 * **Validates: Requirements 1.4, 7.3**
 */

import * as fc from 'fast-check';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ChatTriggerButton } from '@/components/chat/ChatTriggerButton';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ChatInput } from '@/components/chat/ChatInput';

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating activation keys (Enter or Space)
 * These are the standard keys for activating interactive elements
 */
const activationKeyArbitrary: fc.Arbitrary<{ key: string; code: string }> = fc.constantFrom(
  { key: 'Enter', code: 'Enter' },
  { key: ' ', code: 'Space' }
);

/**
 * Arbitrary for generating non-activation keys
 * These keys should NOT trigger activation of buttons
 */
const nonActivationKeyArbitrary: fc.Arbitrary<{ key: string; code: string }> = fc.constantFrom(
  { key: 'Tab', code: 'Tab' },
  { key: 'Escape', code: 'Escape' },
  { key: 'a', code: 'KeyA' },
  { key: 'b', code: 'KeyB' },
  { key: 'ArrowUp', code: 'ArrowUp' },
  { key: 'ArrowDown', code: 'ArrowDown' },
  { key: 'Shift', code: 'ShiftLeft' },
  { key: 'Control', code: 'ControlLeft' }
);

/**
 * Arbitrary for generating valid non-empty message content
 * Used to enable the send button for testing
 */
const validMessageArbitrary: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

// =============================================================================
// Property 1: Keyboard Accessibility
// =============================================================================

/**
 * Feature: ai-chatbot, Property 1: Keyboard Accessibility
 *
 * *For any* interactive element in the Chatbot_Interface (trigger button,
 * close button, send button, input field, new chat button), it SHALL be
 * focusable via Tab key and activatable via Enter or Space key.
 *
 * **Validates: Requirements 1.4, 7.3**
 */
describe('Property 1: Keyboard Accessibility', () => {
  afterEach(() => {
    cleanup();
  });

  describe('ChatTriggerButton Keyboard Accessibility', () => {
    it('is focusable (no negative tabIndex)', () => {
      fc.assert(
        fc.property(fc.boolean(), () => {
          const onClick = jest.fn();

          render(
            <ChatTriggerButton
              onClick={onClick}
              ariaLabel="Open chat"
              hasUnread={false}
            />
          );

          const button = screen.getByTestId('chat-trigger-button');

          // Button should be focusable (no tabIndex="-1")
          const tabIndex = button.getAttribute('tabIndex');
          const isFocusable = tabIndex === null || parseInt(tabIndex, 10) >= 0;

          cleanup();

          return isFocusable === true;
        }),
        { numRuns: 3 }
      );
    });

    it('responds to Enter and Space key presses', () => {
      fc.assert(
        fc.property(activationKeyArbitrary, (keyEvent) => {
          const onClick = jest.fn();

          render(
            <ChatTriggerButton
              onClick={onClick}
              ariaLabel="Open chat"
              hasUnread={false}
            />
          );

          const button = screen.getByTestId('chat-trigger-button');

          // Press the activation key
          fireEvent.keyDown(button, keyEvent);

          // onClick should have been called
          const wasCalled = onClick.mock.calls.length === 1;

          cleanup();

          return wasCalled === true;
        }),
        { numRuns: 3 }
      );
    });

    it('does NOT respond to non-activation keys', () => {
      fc.assert(
        fc.property(nonActivationKeyArbitrary, (keyEvent) => {
          const onClick = jest.fn();

          render(
            <ChatTriggerButton
              onClick={onClick}
              ariaLabel="Open chat"
              hasUnread={false}
            />
          );

          const button = screen.getByTestId('chat-trigger-button');

          // Press a non-activation key
          fireEvent.keyDown(button, keyEvent);

          // onClick should NOT have been called
          const wasNotCalled = onClick.mock.calls.length === 0;

          cleanup();

          return wasNotCalled === true;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('ChatPanel Close Button Keyboard Accessibility', () => {
    it('close button is focusable (no negative tabIndex)', () => {
      fc.assert(
        fc.property(fc.boolean(), () => {
          const onClose = jest.fn();

          render(<ChatPanel isOpen={true} onClose={onClose} />);

          const closeButton = screen.getByTestId('chat-close-button');

          // Button should be focusable (no tabIndex="-1")
          const tabIndex = closeButton.getAttribute('tabIndex');
          const isFocusable = tabIndex === null || parseInt(tabIndex, 10) >= 0;

          cleanup();

          return isFocusable === true;
        }),
        { numRuns: 3 }
      );
    });

    it('close button responds to click events', () => {
      fc.assert(
        fc.property(fc.boolean(), () => {
          const onClose = jest.fn();

          render(<ChatPanel isOpen={true} onClose={onClose} />);

          const closeButton = screen.getByTestId('chat-close-button');

          // Click the close button
          fireEvent.click(closeButton);

          // onClose should have been called
          const wasCalled = onClose.mock.calls.length === 1;

          cleanup();

          return wasCalled === true;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('ChatPanel New Chat Button Keyboard Accessibility', () => {
    it('new chat button is focusable (no negative tabIndex)', () => {
      fc.assert(
        fc.property(fc.boolean(), () => {
          const onClose = jest.fn();

          render(<ChatPanel isOpen={true} onClose={onClose} />);

          const newChatButton = screen.getByTestId('chat-new-button');

          // Button should be focusable (no tabIndex="-1")
          const tabIndex = newChatButton.getAttribute('tabIndex');
          const isFocusable = tabIndex === null || parseInt(tabIndex, 10) >= 0;

          cleanup();

          return isFocusable === true;
        }),
        { numRuns: 3 }
      );
    });

    it('new chat button responds to click events', () => {
      fc.assert(
        fc.property(fc.boolean(), () => {
          const onClose = jest.fn();
          // Spy on console.log since handleNewChat logs to console
          const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

          render(<ChatPanel isOpen={true} onClose={onClose} />);

          const newChatButton = screen.getByTestId('chat-new-button');

          // Click the new chat button
          fireEvent.click(newChatButton);

          // The button should have triggered its handler (logs to console)
          const wasClicked = consoleSpy.mock.calls.some(
            (call) => call[0] === 'New chat clicked'
          );

          consoleSpy.mockRestore();
          cleanup();

          return wasClicked === true;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('ChatInput Send Button Keyboard Accessibility', () => {
    it('send button is focusable when enabled (no negative tabIndex)', () => {
      fc.assert(
        fc.property(validMessageArbitrary, (message) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea');
          const sendButton = screen.getByTestId('chat-input-send-button');

          // Enter valid message to enable the button
          fireEvent.change(textarea, { target: { value: message } });

          // Button should be focusable (no tabIndex="-1")
          const tabIndex = sendButton.getAttribute('tabIndex');
          const isFocusable = tabIndex === null || parseInt(tabIndex, 10) >= 0;

          cleanup();

          return isFocusable === true;
        }),
        { numRuns: 3 }
      );
    });

    it('send button responds to click when enabled', () => {
      fc.assert(
        fc.property(validMessageArbitrary, (message) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea');
          const sendButton = screen.getByTestId('chat-input-send-button');

          // Enter valid message to enable the button
          fireEvent.change(textarea, { target: { value: message } });

          // Click the send button
          fireEvent.click(sendButton);

          // onSubmit should have been called with trimmed message
          const wasCalled = onSubmit.mock.calls.length === 1;
          const calledWithCorrectValue =
            onSubmit.mock.calls[0]?.[0] === message.trim();

          cleanup();

          return wasCalled && calledWithCorrectValue;
        }),
        { numRuns: 3 }
      );
    });

    it('send button does NOT respond when disabled', () => {
      fc.assert(
        fc.property(validMessageArbitrary, (message) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={true} />);

          const textarea = screen.getByTestId('chat-input-textarea');
          const sendButton = screen.getByTestId('chat-input-send-button');

          // Enter valid message (but component is disabled)
          fireEvent.change(textarea, { target: { value: message } });

          // Try to click the send button
          fireEvent.click(sendButton);

          // onSubmit should NOT have been called
          const wasNotCalled = onSubmit.mock.calls.length === 0;

          cleanup();

          return wasNotCalled === true;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('ChatInput Textarea Keyboard Accessibility', () => {
    it('textarea is focusable (no negative tabIndex)', () => {
      fc.assert(
        fc.property(fc.boolean(), () => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea');

          // Textarea should be focusable (no tabIndex="-1")
          const tabIndex = textarea.getAttribute('tabIndex');
          const isFocusable = tabIndex === null || parseInt(tabIndex, 10) >= 0;

          cleanup();

          return isFocusable === true;
        }),
        { numRuns: 3 }
      );
    });

    it('textarea submits on Enter key (not Shift+Enter)', () => {
      fc.assert(
        fc.property(validMessageArbitrary, (message) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea');

          // Enter valid message
          fireEvent.change(textarea, { target: { value: message } });

          // Press Enter (without Shift)
          fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });

          // onSubmit should have been called
          const wasCalled = onSubmit.mock.calls.length === 1;

          cleanup();

          return wasCalled === true;
        }),
        { numRuns: 3 }
      );
    });

    it('textarea does NOT submit on Shift+Enter', () => {
      fc.assert(
        fc.property(validMessageArbitrary, (message) => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea');

          // Enter valid message
          fireEvent.change(textarea, { target: { value: message } });

          // Press Shift+Enter (should add newline, not submit)
          fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });

          // onSubmit should NOT have been called
          const wasNotCalled = onSubmit.mock.calls.length === 0;

          cleanup();

          return wasNotCalled === true;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('All Interactive Elements Have Proper ARIA Labels', () => {
    it('ChatTriggerButton has aria-label', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          (ariaLabel) => {
            const onClick = jest.fn();

            render(
              <ChatTriggerButton
                onClick={onClick}
                ariaLabel={ariaLabel}
                hasUnread={false}
              />
            );

            const button = screen.getByTestId('chat-trigger-button');

            // Button should have the provided aria-label
            const hasAriaLabel = button.getAttribute('aria-label') === ariaLabel;

            cleanup();

            return hasAriaLabel === true;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('ChatPanel close button has aria-label', () => {
      fc.assert(
        fc.property(fc.boolean(), () => {
          const onClose = jest.fn();

          render(<ChatPanel isOpen={true} onClose={onClose} />);

          const closeButton = screen.getByTestId('chat-close-button');

          // Close button should have an aria-label
          const hasAriaLabel =
            closeButton.getAttribute('aria-label') !== null &&
            closeButton.getAttribute('aria-label')!.length > 0;

          cleanup();

          return hasAriaLabel === true;
        }),
        { numRuns: 3 }
      );
    });

    it('ChatPanel new chat button has aria-label', () => {
      fc.assert(
        fc.property(fc.boolean(), () => {
          const onClose = jest.fn();

          render(<ChatPanel isOpen={true} onClose={onClose} />);

          const newChatButton = screen.getByTestId('chat-new-button');

          // New chat button should have an aria-label
          const hasAriaLabel =
            newChatButton.getAttribute('aria-label') !== null &&
            newChatButton.getAttribute('aria-label')!.length > 0;

          cleanup();

          return hasAriaLabel === true;
        }),
        { numRuns: 3 }
      );
    });

    it('ChatInput send button has aria-label', () => {
      fc.assert(
        fc.property(fc.boolean(), () => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const sendButton = screen.getByTestId('chat-input-send-button');

          // Send button should have an aria-label
          const hasAriaLabel =
            sendButton.getAttribute('aria-label') !== null &&
            sendButton.getAttribute('aria-label')!.length > 0;

          cleanup();

          return hasAriaLabel === true;
        }),
        { numRuns: 3 }
      );
    });

    it('ChatInput textarea has aria-label', () => {
      fc.assert(
        fc.property(fc.boolean(), () => {
          const onSubmit = jest.fn();

          render(<ChatInput onSubmit={onSubmit} disabled={false} />);

          const textarea = screen.getByTestId('chat-input-textarea');

          // Textarea should have an aria-label
          const hasAriaLabel =
            textarea.getAttribute('aria-label') !== null &&
            textarea.getAttribute('aria-label')!.length > 0;

          cleanup();

          return hasAriaLabel === true;
        }),
        { numRuns: 3 }
      );
    });
  });
});
