'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ChatPanelProps } from '@/types/chat';

/**
 * ChatPanel component - slide-in panel for the AI chat interface.
 *
 * Features:
 * - Portal rendering to document.body for proper stacking context
 * - Header with title, new chat button, and close button
 * - Focus trap when panel is open (focus stays within panel)
 * - Escape key closes the panel
 * - Slide-in animation from right side
 * - Semi-transparent backdrop
 *
 * **Validates: Requirements 1.2, 7.5**
 * - 1.2: Chat panel opens with message input field and conversation area
 * - 7.5: Focus trap when open, return focus when closed
 *
 * @example
 * ```tsx
 * <ChatPanel
 *   isOpen={isOpen}
 *   onClose={() => closeChat()}
 *   initialMessage="Tell me about your experience"
 * />
 * ```
 */
export function ChatPanel({ isOpen, onClose, initialMessage }: ChatPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  /**
   * Handle Escape key to close the panel
   */
  const handleKeyDown = useCallback(
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
  const handleFocusTrap = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !panelRef.current) return;

    const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Shift+Tab on first element -> go to last
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
    // Tab on last element -> go to first
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }, []);

  /**
   * Store the previously focused element and set up focus management
   */
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element to return focus later
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Add keyboard event listeners
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleFocusTrap);

      // Focus the close button when panel opens (first focusable element in header)
      // Use setTimeout to ensure the panel is rendered
      const timeoutId = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keydown', handleFocusTrap);
        document.body.style.overflow = '';
        clearTimeout(timeoutId);
      };
    } else {
      // Return focus to the previously focused element when panel closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isOpen, handleKeyDown, handleFocusTrap]);

  /**
   * Handle backdrop click to close panel
   */
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Only close if clicking the backdrop itself, not the panel
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Handle new chat button click
   * This will be connected to clearConversation from ChatContext
   */
  const handleNewChat = useCallback(() => {
    // Placeholder - will be connected to context in integration
    console.log('New chat clicked');
  }, []);

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  // Render using portal to document.body
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

      {/* Panel container with slide-in animation */}
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
              onClick={handleNewChat}
              className={`
                p-2 rounded-md
                text-gray-500 hover:text-gray-700 hover:bg-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                transition-colors duration-150
              `}
              aria-label="Start new conversation"
              data-testid="chat-new-button"
            >
              {/* Plus icon */}
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
              {/* X icon */}
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

        {/* Message List placeholder */}
        <div
          className="flex-1 overflow-y-auto p-4"
          data-testid="chat-message-list-placeholder"
        >
          <div className="text-center text-gray-500 py-8">
            <p>Message list will be implemented in task 3.3</p>
            {initialMessage && (
              <p className="mt-2 text-sm text-gray-400">
                Initial message: {initialMessage}
              </p>
            )}
          </div>
        </div>

        {/* Chat Input placeholder */}
        <div
          className="border-t border-gray-200 p-4 flex-shrink-0"
          data-testid="chat-input-placeholder"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message... (placeholder)"
              disabled
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400"
            />
            <button
              type="button"
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Chat input will be implemented in task 3.5
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ChatPanel;
