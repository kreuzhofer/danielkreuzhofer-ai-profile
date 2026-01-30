'use client';

import React from 'react';
import type { ChatMessage as ChatMessageType, MessageRole } from '@/types/chat';

/**
 * Props for the ChatMessage component
 */
export interface ChatMessageProps {
  /** The message to display */
  message: ChatMessageType;
  /** Callback to retry sending a failed message */
  onRetry?: () => void;
}

/**
 * Styling configuration for different message roles
 */
interface MessageStyles {
  container: string;
  bubble: string;
  timestamp: string;
}

/**
 * Get message styling based on role
 */
const getMessageStyles = (role: MessageRole): MessageStyles => {
  switch (role) {
    case 'user':
      return {
        container: 'flex justify-end',
        bubble: 'bg-blue-600 text-white rounded-2xl rounded-br-md',
        timestamp: 'text-blue-200',
      };
    case 'assistant':
      return {
        container: 'flex justify-start',
        bubble: 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md',
        timestamp: 'text-gray-500',
      };
    case 'system':
      return {
        container: 'flex justify-center',
        bubble: 'bg-gray-50 text-gray-700 rounded-2xl border border-gray-200',
        timestamp: 'text-gray-400',
      };
    default:
      return {
        container: 'flex justify-start',
        bubble: 'bg-gray-100 text-gray-900 rounded-2xl',
        timestamp: 'text-gray-500',
      };
  }
};

/**
 * Format timestamp for display
 */
const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * ChatMessage component - displays a single message in the chat conversation.
 *
 * Features:
 * - Displays message content with role-based styling (user/assistant/system)
 * - Shows timestamp for each message
 * - Handles streaming state with cursor animation for partial content
 * - Handles error state with retry button
 *
 * **Validates: Requirements 3.4, 6.4**
 * - 3.4: Display AI response with streaming support
 * - 6.4: Allow retry of failed messages
 *
 * @example
 * ```tsx
 * <ChatMessage
 *   message={{
 *     id: '1',
 *     role: 'user',
 *     content: 'Hello!',
 *     timestamp: new Date(),
 *     status: 'complete'
 *   }}
 *   onRetry={() => retryMessage()}
 * />
 * ```
 */
export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const styles = getMessageStyles(message.role);
  const isError = message.status === 'error';
  const isStreaming = message.status === 'streaming';

  return (
    <div
      className={`${styles.container} mb-4`}
      role="article"
      aria-label={`${message.role} message`}
      data-testid={`message-${message.id}`}
    >
      <div
        className={`
          ${styles.bubble}
          max-w-[85%] px-4 py-3
          ${isError ? 'border-2 border-red-300' : ''}
        `}
      >
        {/* Message content */}
        <p className="whitespace-pre-wrap break-words" data-testid="message-content">
          {message.content}
          {isStreaming && (
            <span
              className="inline-block w-2 h-4 ml-1 bg-current animate-pulse"
              aria-hidden="true"
              data-testid="streaming-cursor"
            />
          )}
        </p>

        {/* Timestamp */}
        <p
          className={`${styles.timestamp} text-xs mt-1`}
          data-testid="message-timestamp"
        >
          {formatTimestamp(message.timestamp)}
        </p>

        {/* Error state with retry button */}
        {isError && onRetry && (
          <div className="mt-2 pt-2 border-t border-red-200" data-testid="error-section">
            <p className="text-red-600 text-sm mb-2">
              Failed to send message
            </p>
            <button
              type="button"
              onClick={onRetry}
              className={`
                px-3 py-1 text-sm
                bg-red-100 text-red-700
                rounded-md
                hover:bg-red-200
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
                transition-colors duration-150
              `}
              data-testid="retry-button"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
