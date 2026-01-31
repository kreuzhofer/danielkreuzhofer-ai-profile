'use client';

/**
 * ChatWrapper component - wraps the chat functionality for the app layout.
 *
 * This component provides:
 * - ChatProvider context for state management
 * - ChatTriggerButton for opening the chat
 * - ChatPanel with full chat interface
 * - Suggestion chips for conversation starters and follow-ups
 *
 * **Validates: Requirements 1.1**
 * - 1.1: Chat trigger button visible and accessible on portfolio page
 */

import React from 'react';
import { useChat } from '@/context/ChatContext';
import { ChatTriggerButton } from './ChatTriggerButton';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { generateFollowUpSuggestions } from '@/lib/chat-suggestions';

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

  // Track if panel should be rendered (stays true during exit animation)
  const [shouldRender, setShouldRender] = React.useState(false);
  // Track animation state for smooth transitions
  const [isVisible, setIsVisible] = React.useState(false);

  // Handle open/close with animation
  React.useEffect(() => {
    if (isOpen && !shouldRender) {
      // Opening: mount first, then animate in
      setShouldRender(true);
    } else if (!isOpen && shouldRender && isVisible) {
      // Closing: animate out first, then unmount
      setIsVisible(false);
    }
  }, [isOpen, shouldRender, isVisible]);

  // Trigger enter animation after mount
  React.useEffect(() => {
    if (shouldRender && !isVisible && isOpen) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 20);
      return () => clearTimeout(timeoutId);
    }
  }, [shouldRender, isVisible, isOpen]);

  // Unmount after exit animation completes
  React.useEffect(() => {
    if (shouldRender && !isVisible && !isOpen) {
      const timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, 350); // Match animation duration + buffer
      return () => clearTimeout(timeoutId);
    }
  }, [shouldRender, isVisible, isOpen]);

  return (
    <>
      {/* Chat trigger button - always visible */}
      <ChatTriggerButton
        onClick={openChat}
        ariaLabel="Open chat to ask about my experience"
      />

      {/* Chat panel - rendered during open state and exit animation */}
      {shouldRender && (
        <ChatPanelWithContent
          isOpen={isOpen}
          isVisible={isVisible}
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
  isVisible: boolean;
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
 * 
 * Responsive behavior:
 * - Mobile: Fullscreen with backdrop overlay, blocks page interaction
 * - Desktop (sm+): Slide-in panel without overlay, page remains interactive
 * 
 * Animation:
 * - Slides in from right with easing animation
 * - Backdrop fades in/out on mobile
 * - Respects reduced motion preferences
 */
function ChatPanelWithContent({
  isOpen,
  isVisible,
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
  const [isMobile, setIsMobile] = React.useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = React.useState<string[]>([]);

  // Detect mobile viewport
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate follow-up suggestions when messages change
  React.useEffect(() => {
    // Only generate suggestions after an assistant message completes
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage?.status === 'complete') {
      const suggestions = generateFollowUpSuggestions(
        messages.map(m => ({ role: m.role, content: m.content })),
        3
      );
      setFollowUpSuggestions(suggestions);
    } else if (isLoading) {
      // Clear suggestions while loading
      setFollowUpSuggestions([]);
    }
  }, [messages, isLoading]);

  /**
   * Handle suggestion selection - send as a message
   */
  const handleSuggestionSelect = React.useCallback(
    (suggestion: string) => {
      onSendMessage(suggestion);
    },
    [onSendMessage]
  );

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
   * Handle backdrop click to close panel (mobile only)
   */
  const handleBackdropClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Store the previously focused element and set up focus management
   */
  React.useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);

      const timeoutId = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

      // Block scrolling on mobile only
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        clearTimeout(timeoutId);
      };
    } else {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isOpen, handleKeyDown, isMobile]);

  // Use createPortal for proper stacking context
  const { createPortal } = require('react-dom');

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-end ${isMobile ? '' : 'pointer-events-none'}`}
      role="dialog"
      aria-modal={isMobile ? 'true' : 'false'}
      aria-labelledby="chat-panel-title"
      data-testid="chat-panel"
    >
      {/* Semi-transparent backdrop - mobile only */}
      {isMobile && (
        <div
          className={`
            absolute inset-0 bg-black transition-opacity duration-300 ease-out
            ${isVisible ? 'opacity-50' : 'opacity-0'}
          `}
          onClick={handleBackdropClick}
          aria-hidden="true"
          data-testid="chat-panel-backdrop"
        />
      )}

      {/* Panel container - slides in from right on desktop, from bottom on mobile */}
      <div
        ref={panelRef}
        className={`
          ${isMobile ? '' : 'pointer-events-auto'}
          relative w-full h-full
          sm:max-w-md
          bg-white shadow-2xl
          flex flex-col
          transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          motion-reduce:transition-none
          ${isMobile 
            ? (isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0')
            : (isVisible ? 'translate-x-0' : 'translate-x-full')
          }
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
          onSuggestionSelect={handleSuggestionSelect}
          followUpSuggestions={followUpSuggestions}
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
 * ChatWrapper - provides chat UI components to the app
 * Note: ChatProvider must be wrapped at a higher level (e.g., layout.tsx)
 */
export function ChatWrapper() {
  return <ChatUI />;
}

export default ChatWrapper;
