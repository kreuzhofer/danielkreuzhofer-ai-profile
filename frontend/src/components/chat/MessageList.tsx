'use client';

import { useEffect, useRef, useState } from 'react';
import type { MessageListProps, ChatMessage as ChatMessageType } from '@/types/chat';
import { WELCOME_MESSAGE } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { SuggestionChips } from './SuggestionChips';
import { getRandomStarterQuestions } from '@/lib/chat-suggestions';

/**
 * MessageList component - displays the conversation messages in the chat panel.
 *
 * Features:
 * - Displays welcome message (system role) at the top
 * - Shows starter suggestion chips for new conversations
 * - Renders user messages aligned right with blue background
 * - Renders assistant messages aligned left with gray background
 * - Auto-scrolls to the latest message when new messages arrive
 * - ARIA live region to announce new assistant messages to screen readers
 * - Shows loading indicator when isLoading is true
 * - Displays follow-up suggestions after assistant responses
 * - Handles error state with retry button
 *
 * **Validates: Requirements 1.3, 5.4, 7.2**
 * - 1.3: Display welcome message that invites questions
 * - 5.4: Automatically scroll to show the latest message
 * - 7.2: Announce new messages to screen readers using ARIA live regions
 *
 * @example
 * ```tsx
 * <MessageList
 *   messages={messages}
 *   isLoading={isLoading}
 *   onRetry={() => retryLastMessage()}
 *   onSuggestionSelect={(q) => sendMessage(q)}
 *   followUpSuggestions={['Follow up 1', 'Follow up 2']}
 * />
 * ```
 */
export function MessageList({
  messages,
  isLoading,
  onRetry,
  onSuggestionSelect,
  followUpSuggestions = [],
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAnnouncedMessageRef = useRef<string | null>(null);
  
  // Generate starter questions once on mount
  const [starterQuestions] = useState(() => getRandomStarterQuestions(3));

  // Create the welcome message with current timestamp
  const welcomeMessage: ChatMessageType = {
    ...WELCOME_MESSAGE,
    timestamp: new Date(),
  };

  // Combine welcome message with conversation messages
  const allMessages = [welcomeMessage, ...messages];
  
  // Check if this is a fresh conversation (no user messages yet)
  const isNewConversation = messages.filter(m => m.role === 'user').length === 0;
  
  // Get the last assistant message for screen reader announcement
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((msg) => msg.role === 'assistant' && msg.status === 'complete');
  
  // Determine if we should show follow-up suggestions
  const showFollowUpSuggestions = 
    !isLoading && 
    !isNewConversation && 
    lastAssistantMessage?.status === 'complete' &&
    followUpSuggestions.length > 0;

  /**
   * Auto-scroll to the latest message when messages change
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  /**
   * Render loading indicator
   */
  const renderLoadingIndicator = () => (
    <div
      className="flex justify-start mb-4"
      role="status"
      aria-label="AI is thinking"
      data-testid="loading-indicator"
    >
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
        <span className="sr-only">AI is thinking...</span>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4"
      role="log"
      aria-label="Chat messages"
      aria-live="off"
      data-testid="message-list"
    >
      {/* ARIA live region for screen reader announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="aria-live-region"
      >
        {lastAssistantMessage &&
          lastAssistantMessage.id !== lastAnnouncedMessageRef.current && (
            <span>
              New message from assistant: {lastAssistantMessage.content}
            </span>
          )}
      </div>

      {/* Messages - using ChatMessage component */}
      {allMessages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onRetry={message.status === 'error' ? onRetry : undefined}
        />
      ))}
      
      {/* Starter suggestions for new conversations */}
      {isNewConversation && !isLoading && onSuggestionSelect && (
        <div className="mb-4">
          <SuggestionChips
            suggestions={starterQuestions}
            onSelect={onSuggestionSelect}
            label="Suggested questions to get started"
          />
        </div>
      )}
      
      {/* Follow-up suggestions after assistant responses */}
      {showFollowUpSuggestions && onSuggestionSelect && (
        <div className="mb-4">
          <SuggestionChips
            suggestions={followUpSuggestions}
            onSelect={onSuggestionSelect}
            label="Follow-up questions"
          />
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && renderLoadingIndicator()}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}

export default MessageList;
