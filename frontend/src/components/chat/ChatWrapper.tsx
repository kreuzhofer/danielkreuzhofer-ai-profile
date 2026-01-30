'use client';

/**
 * ChatWrapper component - wraps the chat functionality for the app layout.
 *
 * This component provides:
 * - ChatProvider context for state management
 * - ChatTriggerButton for opening the chat
 * - ChatPanel with full chat interface
 *
 * **Validates: Requirements 1.1**
 * - 1.1: Chat trigger button visible and accessible on portfolio page
 */

import React from 'react';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { ChatTriggerButton } from './ChatTriggerButton';
import { ChatPanel } from './ChatPanel';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

/**
 * Inner component that uses the chat context
 */
function ChatUI() {
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
    <>
      {/* Chat trigger button - always visible */}
      <ChatTriggerButton
        onClick={openChat}
        ariaLabel="Open chat to ask about my experience"
      />

      {/* Chat panel - shown when open */}
      {isOpen && (
        <ChatPanelWithContent
          isOpen={isOpen}
          onClose={closeChat}
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSendMessage={sendMessage}
          onClearConversation={clearConversation}
          onRetry={retryLastMessage}
        />
      )}
    </>
  );
}

/**
 * Props for ChatPanelWithContent
 */
interface ChatPanelWithContentProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    status: 'sending' | 'streaming' | 'complete' | 'error';
  }>;
  isLoading: boolean;
  error: { type: string; message: string; retryable: boolean } | null;
  onSendMessage: (content: string) => Promise<void>;
  onClearConversation: () => void;
  onRetry: () => Promise<void>;
}

/**
 * ChatPanel with integrated content (MessageList and ChatInput)
 */
function ChatPanelWithContent({
  isOpen,
  onClose,
  messages,
  isLoading,
  error,
  onSendMessage,
  onClearConversation,
  onRetry,
}: ChatPanelWithContentProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  /**
   * Handle Escape key to close the panel
   */
  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Focus trap - keep focus within the panel when open
   */
  const handleFocusTrap = React.useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !panelRef.current) return;

    const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }, []);

  /**
   * Store the previously focused element and set up focus management
   */
  React.useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleFocusTrap);

      const timeoutId = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keydown', handleFocusTrap);
        document.body.style.overflow = '';
        clearTimeout(timeoutId);
      };
    } else {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isOpen, handleKeyDown, handleFocusTrap]);

  /**
   * Handle backdrop click to close panel
   */
  const handleBackdropClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) {
    return null;
  }

  // Use createPortal for proper stacking context
  const { createPortal } = require('react-dom');

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-panel-title"
      data-testid="chat-panel"
    >
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={handleBackdropClick}
        aria-hidden="true"
        data-testid="chat-panel-backdrop"
      />

      {/* Panel container */}
      <div
        ref={panelRef}
        className={`
          relative w-full h-full
          sm:max-w-md
          bg-white shadow-xl
          flex flex-col
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        data-testid="chat-panel-container"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <h2
            id="chat-panel-title"
            className="text-lg font-semibold text-gray-900"
          >
            Ask AI About Me
          </h2>

          <div className="flex items-center gap-2">
            {/* New Chat Button */}
            <button
              type="button"
              onClick={onClearConversation}
              className={`
                p-2 rounded-md
                text-gray-500 hover:text-gray-700 hover:bg-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                transition-colors duration-150
              `}
              aria-label="Start new conversation"
              data-testid="chat-new-button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            {/* Close Button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className={`
                p-2 rounded-md
                text-gray-500 hover:text-gray-700 hover:bg-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                transition-colors duration-150
              `}
              aria-label="Close chat panel"
              data-testid="chat-close-button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Message List */}
        <MessageList
          messages={messages.filter(m => m.role !== 'system')}
          isLoading={isLoading}
          onRetry={onRetry}
        />

        {/* Error display */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        {/* Chat Input */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <ChatInput
            onSubmit={onSendMessage}
            disabled={isLoading}
            placeholder="Ask me anything about my experience..."
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * ChatWrapper - provides chat functionality to the app
 */
export function ChatWrapper() {
  return (
    <ChatProvider>
      <ChatUI />
    </ChatProvider>
  );
}

export default ChatWrapper;
