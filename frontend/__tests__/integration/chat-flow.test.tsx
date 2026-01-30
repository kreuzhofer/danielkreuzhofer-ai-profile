/**
 * Integration Tests for Chat Flow
 *
 * These tests validate the end-to-end chat functionality including:
 * - Opening and closing the chat panel
 * - Sending messages and receiving responses
 * - Conversation persistence
 * - Clearing conversations
 *
 * **Validates: Requirements 1.2, 5.1, 5.2, 5.3**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { ChatTriggerButton } from '@/components/chat/ChatTriggerButton';
import { ChatInput } from '@/components/chat/ChatInput';
import { MessageList } from '@/components/chat/MessageList';

// Mock fetch for API calls
beforeEach(() => {
  // Mock scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = jest.fn();

  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode('data: {"type":"chunk","content":"Hello! "}\n\n')
          );
          controller.enqueue(
            new TextEncoder().encode('data: {"type":"chunk","content":"I can help you."}\n\n')
          );
          controller.enqueue(new TextEncoder().encode('data: {"type":"done"}\n\n'));
          controller.close();
        },
      }),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
  // Clear session storage
  if (typeof window !== 'undefined') {
    sessionStorage.clear();
  }
});

/**
 * Test component that integrates all chat components
 */
function TestChatApp() {
  const {
    isOpen,
    messages,
    isLoading,
    error,
    openChat,
    closeChat,
    sendMessage,
    clearConversation,
    retryLastMessage,
  } = useChat();

  return (
    <div>
      <main data-testid="main-content">
        <h1>Portfolio</h1>
        <p>Welcome to my portfolio</p>
      </main>

      {/* Chat trigger button */}
      <ChatTriggerButton
        onClick={openChat}
        ariaLabel="Open chat"
      />

      {/* Chat panel */}
      {isOpen && (
        <div
          data-testid="chat-panel"
          role="dialog"
          aria-modal="true"
        >
          <header>
            <h2>Ask AI About Me</h2>
            <button
              data-testid="new-chat-button"
              onClick={clearConversation}
            >
              New Chat
            </button>
            <button
              data-testid="close-button"
              onClick={closeChat}
            >
              Close
            </button>
          </header>

          <MessageList
            messages={messages.filter((m) => m.role !== 'system')}
            isLoading={isLoading}
            onRetry={retryLastMessage}
          />

          {error && (
            <div data-testid="error-message" className="text-red-600">
              {error.message}
            </div>
          )}

          <ChatInput
            onSubmit={sendMessage}
            disabled={isLoading}
            placeholder="Ask me anything..."
          />
        </div>
      )}
    </div>
  );
}

describe('Chat Flow Integration', () => {
  describe('Opening and Closing Chat (Requirement 1.2)', () => {
    it('opens chat panel when trigger button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChatProvider>
          <TestChatApp />
        </ChatProvider>
      );

      // Chat panel should not be visible initially
      expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();

      // Click the trigger button
      const triggerButton = screen.getByTestId('chat-trigger-button');
      await user.click(triggerButton);

      // Chat panel should now be visible
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });

    it('closes chat panel when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChatProvider>
          <TestChatApp />
        </ChatProvider>
      );

      // Open the chat
      await user.click(screen.getByTestId('chat-trigger-button'));
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();

      // Close the chat
      await user.click(screen.getByTestId('close-button'));
      expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
    });
  });

  describe('Sending Messages and Receiving Responses', () => {
    it('sends a message and receives a streaming response', async () => {
      const user = userEvent.setup();

      render(
        <ChatProvider>
          <TestChatApp />
        </ChatProvider>
      );

      // Open the chat
      await user.click(screen.getByTestId('chat-trigger-button'));

      // Type a message
      const input = screen.getByTestId('chat-input-textarea');
      await user.type(input, 'Tell me about your experience');

      // Submit the message
      const form = screen.getByTestId('chat-input-form');
      await act(async () => {
        fireEvent.submit(form);
      });

      // Wait for the response
      await waitFor(
        () => {
          const messages = screen.getAllByRole('article');
          // Should have welcome message + user message + assistant response
          expect(messages.length).toBeGreaterThanOrEqual(2);
        },
        { timeout: 2000 }
      );

      // User message should be visible
      expect(screen.getByText('Tell me about your experience')).toBeInTheDocument();
    });

    it('clears input after sending message', async () => {
      const user = userEvent.setup();

      render(
        <ChatProvider>
          <TestChatApp />
        </ChatProvider>
      );

      // Open the chat
      await user.click(screen.getByTestId('chat-trigger-button'));

      // Type and send a message
      const input = screen.getByTestId('chat-input-textarea') as HTMLTextAreaElement;
      await user.type(input, 'Hello');

      const form = screen.getByTestId('chat-input-form');
      await act(async () => {
        fireEvent.submit(form);
      });

      // Input should be cleared
      expect(input.value).toBe('');
    });
  });

  describe('Conversation Persistence (Requirements 5.1, 5.2)', () => {
    it('preserves conversation when closing and reopening chat', async () => {
      const user = userEvent.setup();

      render(
        <ChatProvider>
          <TestChatApp />
        </ChatProvider>
      );

      // Open the chat
      await user.click(screen.getByTestId('chat-trigger-button'));

      // Send a message
      const input = screen.getByTestId('chat-input-textarea');
      await user.type(input, 'Test message');

      const form = screen.getByTestId('chat-input-form');
      await act(async () => {
        fireEvent.submit(form);
      });

      // Wait for message to appear
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      // Close the chat
      await user.click(screen.getByTestId('close-button'));

      // Reopen the chat
      await user.click(screen.getByTestId('chat-trigger-button'));

      // Message should still be there
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  describe('Clearing Conversation (Requirement 5.3)', () => {
    it('clears conversation when new chat button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChatProvider>
          <TestChatApp />
        </ChatProvider>
      );

      // Open the chat
      await user.click(screen.getByTestId('chat-trigger-button'));

      // Send a message
      const input = screen.getByTestId('chat-input-textarea');
      await user.type(input, 'Message to be cleared');

      const form = screen.getByTestId('chat-input-form');
      await act(async () => {
        fireEvent.submit(form);
      });

      // Wait for message to appear
      await waitFor(() => {
        expect(screen.getByText('Message to be cleared')).toBeInTheDocument();
      });

      // Click new chat button
      await user.click(screen.getByTestId('new-chat-button'));

      // Message should be gone
      expect(screen.queryByText('Message to be cleared')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('trigger button is keyboard accessible', async () => {
      render(
        <ChatProvider>
          <TestChatApp />
        </ChatProvider>
      );

      const triggerButton = screen.getByTestId('chat-trigger-button');

      // Focus the button
      triggerButton.focus();
      expect(document.activeElement).toBe(triggerButton);

      // Activate with Enter
      fireEvent.keyDown(triggerButton, { key: 'Enter' });
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });

    it('chat input supports Enter to submit', async () => {
      const user = userEvent.setup();

      render(
        <ChatProvider>
          <TestChatApp />
        </ChatProvider>
      );

      // Open the chat
      await user.click(screen.getByTestId('chat-trigger-button'));

      // Type a message
      const input = screen.getByTestId('chat-input-textarea');
      await user.type(input, 'Enter key test');

      // Press Enter to submit
      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
      });

      // Message should be sent
      await waitFor(() => {
        expect(screen.getByText('Enter key test')).toBeInTheDocument();
      });
    });
  });
});
