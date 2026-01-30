'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { ChatInputProps } from '@/types/chat';

/**
 * ChatInput component - textarea with send button for submitting messages.
 *
 * Features:
 * - Auto-growing textarea that expands with content
 * - Send button with icon
 * - Validates non-empty input before submission (trims whitespace)
 * - Disables send button when disabled prop is true or input is empty
 * - Clears input after successful submission
 * - Enter key submits the message
 * - Shift+Enter adds a newline (doesn't submit)
 * - Accessible with proper ARIA labels
 *
 * **Validates: Requirements 2.1, 2.3, 2.4, 2.5**
 * - 2.1: Submit message via Enter or send button
 * - 2.3: Clear input field after submission
 * - 2.4: Prevent submission of empty messages
 * - 2.5: Disable send button during loading
 *
 * @example
 * ```tsx
 * <ChatInput
 *   onSubmit={(message) => sendMessage(message)}
 *   disabled={isLoading}
 *   placeholder="Ask me anything..."
 * />
 * ```
 */
export function ChatInput({
  onSubmit,
  disabled,
  placeholder = 'Type your message...',
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Check if the input has valid content (non-empty after trimming)
   */
  const hasValidInput = inputValue.trim().length > 0;

  /**
   * Whether the send button should be disabled
   */
  const isSendDisabled = disabled || !hasValidInput;

  /**
   * Auto-resize textarea based on content
   */
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight, with a max of 150px (about 6 lines)
      const maxHeight = 150;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  /**
   * Adjust textarea height when input value changes
   */
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(event.target.value);
    },
    []
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();

      const trimmedValue = inputValue.trim();

      // Validate non-empty input
      if (!trimmedValue || disabled) {
        return;
      }

      // Submit the message
      onSubmit(trimmedValue);

      // Clear the input after successful submission
      setInputValue('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    },
    [inputValue, disabled, onSubmit]
  );

  /**
   * Handle keyboard events
   * - Enter: Submit message
   * - Shift+Enter: Add newline
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        // Prevent default to avoid adding a newline
        event.preventDefault();
        handleSubmit();
      }
      // Shift+Enter allows default behavior (newline)
    },
    [handleSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2"
      data-testid="chat-input-form"
    >
      {/* Textarea for message input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={`
            w-full px-4 py-3
            border border-gray-300 rounded-lg
            resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors duration-150
            text-gray-900 placeholder-gray-500
          `}
          style={{ minHeight: '48px', maxHeight: '150px' }}
          aria-label="Message input"
          data-testid="chat-input-textarea"
        />
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={isSendDisabled}
        className={`
          flex-shrink-0
          p-3
          min-w-[44px] min-h-[44px]
          rounded-lg
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          ${
            isSendDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }
        `}
        aria-label="Send message"
        data-testid="chat-input-send-button"
      >
        {/* Screen reader text */}
        <span className="sr-only">Send message</span>
        {/* Send icon (paper airplane) */}
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
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </form>
  );
}

export default ChatInput;
