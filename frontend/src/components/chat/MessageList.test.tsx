/**
 * MessageList Component Tests
 *
 * Tests for the MessageList component including:
 * - Welcome message display
 * - User and assistant message styling
 * - Auto-scroll to latest message
 * - ARIA live region for screen reader announcements
 * - Loading indicator
 * - Error state with retry button
 *
 * **Validates: Requirements 1.3, 5.4, 7.2**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageList } from './MessageList';
import type { ChatMessage } from '@/types/chat';

// Mock scrollIntoView
const mockScrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

describe('MessageList', () => {
  const createMessage = (
    overrides: Partial<ChatMessage> = {}
  ): ChatMessage => ({
    id: `msg-${Math.random().toString(36).substr(2, 9)}`,
    role: 'user',
    content: 'Test message',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'complete',
    ...overrides,
  });

  const defaultProps = {
    messages: [],
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the message list container', () => {
      render(<MessageList {...defaultProps} />);

      expect(screen.getByTestId('message-list')).toBeInTheDocument();
    });

    it('renders with role="log" for accessibility', () => {
      render(<MessageList {...defaultProps} />);

      const container = screen.getByTestId('message-list');
      expect(container).toHaveAttribute('role', 'log');
    });

    it('renders with aria-label for accessibility', () => {
      render(<MessageList {...defaultProps} />);

      const container = screen.getByTestId('message-list');
      expect(container).toHaveAttribute('aria-label', 'Chat messages');
    });
  });

  describe('Welcome Message (Requirement 1.3)', () => {
    it('displays welcome message when no messages exist', () => {
      render(<MessageList {...defaultProps} />);

      expect(
        screen.getByText(/I'm here to answer questions about Daniel's professional experience/)
      ).toBeInTheDocument();
    });

    it('displays welcome message at the top when messages exist', () => {
      const messages = [
        createMessage({ id: 'user-1', role: 'user', content: 'Hello' }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const allMessages = screen.getAllByRole('article');
      // Welcome message should be first
      expect(allMessages[0]).toHaveTextContent(/I'm here to answer questions/);
      // User message should be second
      expect(allMessages[1]).toHaveTextContent('Hello');
    });

    it('welcome message is styled as system message (centered)', () => {
      render(<MessageList {...defaultProps} />);

      const welcomeMessage = screen.getByTestId('message-welcome');
      expect(welcomeMessage.className).toContain('justify-center');
    });
  });

  describe('User Messages', () => {
    it('renders user messages aligned to the right', () => {
      const messages = [
        createMessage({ id: 'user-1', role: 'user', content: 'Hello AI' }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const userMessage = screen.getByTestId('message-user-1');
      expect(userMessage.className).toContain('justify-end');
    });

    it('renders user messages with blue background', () => {
      const messages = [
        createMessage({ id: 'user-1', role: 'user', content: 'Hello AI' }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const userMessage = screen.getByTestId('message-user-1');
      const bubble = userMessage.querySelector('[class*="bg-blue-600"]');
      expect(bubble).toBeInTheDocument();
    });

    it('renders user message content correctly', () => {
      const messages = [
        createMessage({
          id: 'user-1',
          role: 'user',
          content: 'Tell me about your experience',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      expect(
        screen.getByText('Tell me about your experience')
      ).toBeInTheDocument();
    });
  });

  describe('Assistant Messages', () => {
    it('renders assistant messages aligned to the left', () => {
      const messages = [
        createMessage({
          id: 'assistant-1',
          role: 'assistant',
          content: 'Hello! How can I help?',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const assistantMessage = screen.getByTestId('message-assistant-1');
      expect(assistantMessage.className).toContain('justify-start');
    });

    it('renders assistant messages with gray background', () => {
      const messages = [
        createMessage({
          id: 'assistant-1',
          role: 'assistant',
          content: 'Hello! How can I help?',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const assistantMessage = screen.getByTestId('message-assistant-1');
      const bubble = assistantMessage.querySelector('[class*="bg-gray-100"]');
      expect(bubble).toBeInTheDocument();
    });

    it('renders assistant message content correctly', () => {
      const messages = [
        createMessage({
          id: 'assistant-1',
          role: 'assistant',
          content: 'I have 10 years of experience in software development.',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      expect(
        screen.getByText('I have 10 years of experience in software development.')
      ).toBeInTheDocument();
    });
  });

  describe('Message Timestamps', () => {
    it('displays timestamp for each message', () => {
      const messages = [
        createMessage({
          id: 'user-1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date('2024-01-15T10:30:00'),
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      // Check that timestamp is rendered (format may vary by locale)
      const timestamps = screen.getAllByTestId('message-timestamp');
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  describe('Auto-Scroll (Requirement 5.4)', () => {
    it('scrolls to latest message when messages change', () => {
      const messages = [
        createMessage({ id: 'user-1', role: 'user', content: 'Hello' }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      expect(mockScrollIntoView).toHaveBeenCalled();
    });

    it('scrolls to latest message when new message is added', () => {
      const { rerender } = render(
        <MessageList messages={[]} isLoading={false} />
      );

      mockScrollIntoView.mockClear();

      const messages = [
        createMessage({ id: 'user-1', role: 'user', content: 'Hello' }),
      ];

      rerender(<MessageList messages={messages} isLoading={false} />);

      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('scrolls when loading state changes', () => {
      const { rerender } = render(
        <MessageList messages={[]} isLoading={false} />
      );

      mockScrollIntoView.mockClear();

      rerender(<MessageList messages={[]} isLoading={true} />);

      expect(mockScrollIntoView).toHaveBeenCalled();
    });
  });

  describe('ARIA Live Region (Requirement 7.2)', () => {
    it('renders ARIA live region for screen reader announcements', () => {
      render(<MessageList {...defaultProps} />);

      const liveRegion = screen.getByTestId('aria-live-region');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('role', 'status');
    });

    it('ARIA live region is visually hidden', () => {
      render(<MessageList {...defaultProps} />);

      const liveRegion = screen.getByTestId('aria-live-region');
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('announces new assistant messages', () => {
      const messages = [
        createMessage({
          id: 'assistant-1',
          role: 'assistant',
          content: 'This is my response',
          status: 'complete',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const liveRegion = screen.getByTestId('aria-live-region');
      expect(liveRegion).toHaveTextContent('New message from assistant');
      expect(liveRegion).toHaveTextContent('This is my response');
    });

    it('does not announce user messages', () => {
      const messages = [
        createMessage({
          id: 'user-1',
          role: 'user',
          content: 'User message',
          status: 'complete',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const liveRegion = screen.getByTestId('aria-live-region');
      expect(liveRegion).not.toHaveTextContent('User message');
    });

    it('does not announce streaming messages', () => {
      const messages = [
        createMessage({
          id: 'assistant-1',
          role: 'assistant',
          content: 'Partial response...',
          status: 'streaming',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const liveRegion = screen.getByTestId('aria-live-region');
      expect(liveRegion).not.toHaveTextContent('Partial response');
    });
  });

  describe('Loading Indicator', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(<MessageList messages={[]} isLoading={true} />);

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('does not show loading indicator when isLoading is false', () => {
      render(<MessageList messages={[]} isLoading={false} />);

      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    it('loading indicator has accessible label', () => {
      render(<MessageList messages={[]} isLoading={true} />);

      const loadingIndicator = screen.getByTestId('loading-indicator');
      expect(loadingIndicator).toHaveAttribute('aria-label', 'AI is thinking');
    });

    it('loading indicator has role="status"', () => {
      render(<MessageList messages={[]} isLoading={true} />);

      const loadingIndicator = screen.getByTestId('loading-indicator');
      expect(loadingIndicator).toHaveAttribute('role', 'status');
    });

    it('loading indicator has screen reader text', () => {
      render(<MessageList messages={[]} isLoading={true} />);

      expect(screen.getByText('AI is thinking...')).toBeInTheDocument();
    });
  });

  describe('Streaming State', () => {
    it('shows cursor animation for streaming messages', () => {
      const messages = [
        createMessage({
          id: 'assistant-1',
          role: 'assistant',
          content: 'Typing...',
          status: 'streaming',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const messageContent = screen.getByTestId('message-assistant-1');
      const cursor = messageContent.querySelector('.animate-pulse');
      expect(cursor).toBeInTheDocument();
    });

    it('does not show cursor for complete messages', () => {
      const messages = [
        createMessage({
          id: 'assistant-1',
          role: 'assistant',
          content: 'Complete message',
          status: 'complete',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const messageContent = screen.getByTestId('message-assistant-1');
      const cursor = messageContent.querySelector('.animate-pulse');
      expect(cursor).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error styling for error messages', () => {
      const messages = [
        createMessage({
          id: 'user-1',
          role: 'user',
          content: 'Failed message',
          status: 'error',
        }),
      ];

      render(
        <MessageList messages={messages} isLoading={false} onRetry={jest.fn()} />
      );

      const errorMessage = screen.getByTestId('message-user-1');
      const bubble = errorMessage.querySelector('[class*="border-red"]');
      expect(bubble).toBeInTheDocument();
    });

    it('shows retry button for error messages when onRetry is provided', () => {
      const messages = [
        createMessage({
          id: 'user-1',
          role: 'user',
          content: 'Failed message',
          status: 'error',
        }),
      ];

      render(
        <MessageList messages={messages} isLoading={false} onRetry={jest.fn()} />
      );

      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('does not show retry button when onRetry is not provided', () => {
      const messages = [
        createMessage({
          id: 'user-1',
          role: 'user',
          content: 'Failed message',
          status: 'error',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', async () => {
      const onRetry = jest.fn();
      const messages = [
        createMessage({
          id: 'user-1',
          role: 'user',
          content: 'Failed message',
          status: 'error',
        }),
      ];

      render(
        <MessageList messages={messages} isLoading={false} onRetry={onRetry} />
      );

      const retryButton = screen.getByTestId('retry-button');
      await userEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('shows error message text', () => {
      const messages = [
        createMessage({
          id: 'user-1',
          role: 'user',
          content: 'Failed message',
          status: 'error',
        }),
      ];

      render(
        <MessageList messages={messages} isLoading={false} onRetry={jest.fn()} />
      );

      expect(screen.getByText('Failed to send message')).toBeInTheDocument();
    });
  });

  describe('Multiple Messages', () => {
    it('renders multiple messages in order', () => {
      const messages = [
        createMessage({ id: 'user-1', role: 'user', content: 'First message' }),
        createMessage({
          id: 'assistant-1',
          role: 'assistant',
          content: 'First response',
        }),
        createMessage({
          id: 'user-2',
          role: 'user',
          content: 'Second message',
        }),
        createMessage({
          id: 'assistant-2',
          role: 'assistant',
          content: 'Second response',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const allMessages = screen.getAllByRole('article');
      // Welcome message + 4 conversation messages = 5 total
      expect(allMessages).toHaveLength(5);

      // Check order (welcome first, then conversation)
      expect(allMessages[0]).toHaveTextContent(/I'm here to answer questions/);
      expect(allMessages[1]).toHaveTextContent('First message');
      expect(allMessages[2]).toHaveTextContent('First response');
      expect(allMessages[3]).toHaveTextContent('Second message');
      expect(allMessages[4]).toHaveTextContent('Second response');
    });
  });

  describe('Message Content Formatting', () => {
    it('preserves whitespace in message content', () => {
      const messages = [
        createMessage({
          id: 'assistant-1',
          role: 'assistant',
          content: 'Line 1\nLine 2\nLine 3',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      // Get the message content element directly by test id to avoid ARIA live region match
      const messageContainer = screen.getByTestId('message-assistant-1');
      const content = messageContainer.querySelector('[data-testid="message-content"]');
      expect(content).toHaveClass('whitespace-pre-wrap');
    });

    it('handles long words with word break', () => {
      const messages = [
        createMessage({
          id: 'assistant-1',
          role: 'assistant',
          content: 'Supercalifragilisticexpialidocious',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const content = screen.getByText('Supercalifragilisticexpialidocious');
      expect(content).toHaveClass('break-words');
    });
  });

  describe('Accessibility', () => {
    it('each message has role="article"', () => {
      const messages = [
        createMessage({ id: 'user-1', role: 'user', content: 'Hello' }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      const articles = screen.getAllByRole('article');
      expect(articles.length).toBeGreaterThan(0);
    });

    it('each message has aria-label indicating the role', () => {
      const messages = [
        createMessage({ id: 'user-1', role: 'user', content: 'Hello' }),
        createMessage({
          id: 'assistant-1',
          role: 'assistant',
          content: 'Hi there',
        }),
      ];

      render(<MessageList messages={messages} isLoading={false} />);

      expect(
        screen.getByLabelText('user message', { selector: '[data-testid="message-user-1"]' })
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('assistant message', { selector: '[data-testid="message-assistant-1"]' })
      ).toBeInTheDocument();
    });
  });
});
