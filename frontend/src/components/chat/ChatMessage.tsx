'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
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
        bubble: 'bg-[var(--primary-600)] text-[var(--foreground)] rounded-2xl rounded-br-md',
        timestamp: 'text-[var(--primary-300)]',
      };
    case 'assistant':
      return {
        container: 'flex justify-start',
        bubble: 'bg-[var(--surface-elevated)] text-[var(--foreground)] rounded-2xl rounded-bl-md',
        timestamp: 'text-[var(--foreground-subtle)]',
      };
    case 'system':
      return {
        container: 'flex justify-center',
        bubble: 'bg-[var(--surface)] text-[var(--foreground-muted)] rounded-2xl border border-[var(--border)]',
        timestamp: 'text-[var(--foreground-subtle)]',
      };
    default:
      return {
        container: 'flex justify-start',
        bubble: 'bg-[var(--surface-elevated)] text-[var(--foreground)] rounded-2xl',
        timestamp: 'text-[var(--foreground-subtle)]',
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
        <div className="prose prose-sm max-w-none break-words" data-testid="message-content">
          {message.role === 'user' ? (
            // User messages: plain text, no markdown
            <p className="whitespace-pre-wrap m-0">{message.content}</p>
          ) : (
            // Assistant/system messages: render markdown
            <ReactMarkdown
              components={{
                // Style overrides for chat context
                p: ({ children }) => <p className="m-0 mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="m-0 mb-2 pl-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="m-0 mb-2 pl-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="m-0 mb-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children, className }) => {
                  // Check if it's inline code or a code block
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-[var(--surface)] text-[var(--foreground)] px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className={`${className} block bg-[var(--background)] text-[var(--foreground)] p-2 rounded text-xs font-mono overflow-x-auto`}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre className="m-0 mb-2">{children}</pre>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary-400)] hover:underline"
                  >
                    {children}
                  </a>
                ),
                h1: ({ children }) => <h1 className="text-lg font-bold m-0 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold m-0 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold m-0 mb-1">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[var(--border)] pl-3 italic m-0 mb-2">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
          {isStreaming && (
            <span
              className="inline-block w-2 h-4 ml-1 bg-current animate-pulse"
              aria-hidden="true"
              data-testid="streaming-cursor"
            />
          )}
        </div>

        {/* Timestamp */}
        <p
          className={`${styles.timestamp} text-xs mt-1`}
          data-testid="message-timestamp"
        >
          {formatTimestamp(message.timestamp)}
        </p>

        {/* Error state with retry button */}
        {isError && onRetry && (
          <div className="mt-2 pt-2 border-t border-[var(--error)]/30" data-testid="error-section">
            <p className="text-[var(--error)] text-sm mb-2">
              Failed to send message
            </p>
            <button
              type="button"
              onClick={onRetry}
              className={`
                px-3 py-1 text-sm
                bg-[var(--error)]/10 text-[var(--error)]
                rounded-md
                hover:bg-[var(--error)]/20
                focus:outline-none focus:ring-2 focus:ring-[var(--error)] focus:ring-offset-1
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
