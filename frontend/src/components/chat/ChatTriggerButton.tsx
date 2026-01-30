'use client';

import React, { useCallback } from 'react';
import type { ChatTriggerProps } from '@/types/chat';

/**
 * ChatTriggerButton component - floating button to open the AI chat panel.
 *
 * Features:
 * - Fixed position in bottom-right corner
 * - Chat icon with optional unread indicator badge
 * - Minimum 44×44px touch target for mobile accessibility
 * - Keyboard accessible: Tab to focus, Enter/Space to activate
 * - ARIA attributes: aria-label, aria-expanded
 * - Visual feedback on hover/focus
 *
 * **Validates: Requirements 1.1, 1.4, 1.5**
 * - 1.1: Chat trigger button visible and accessible on portfolio page
 * - 1.4: Accessible via keyboard navigation (Tab to focus, Enter to activate)
 * - 1.5: Minimum touch target of 44×44 pixels on mobile viewport
 *
 * @example
 * ```tsx
 * <ChatTriggerButton
 *   onClick={() => openChat()}
 *   ariaLabel="Open chat to ask about my experience"
 *   hasUnread={false}
 * />
 * ```
 */
export function ChatTriggerButton({
  onClick,
  hasUnread = false,
  ariaLabel,
}: ChatTriggerProps) {
  /**
   * Handle keyboard activation (Enter/Space)
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-expanded={false}
      aria-haspopup="dialog"
      data-testid="chat-trigger-button"
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center justify-center
        min-w-[44px] min-h-[44px] w-14 h-14
        bg-blue-600 text-white
        rounded-full shadow-lg
        hover:bg-blue-700 hover:shadow-xl hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        active:scale-95
        transition-all duration-200 ease-in-out
      `}
    >
      {/* Chat bubble icon */}
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      {/* Unread indicator badge */}
      {hasUnread && (
        <span
          className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
          aria-hidden="true"
        />
      )}

      {/* Screen reader text */}
      <span className="sr-only">Ask AI about me</span>
    </button>
  );
}

export default ChatTriggerButton;
