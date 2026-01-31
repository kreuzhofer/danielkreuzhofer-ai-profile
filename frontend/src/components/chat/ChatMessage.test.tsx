import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

/**
 * Unit tests for ChatMessage component
 *
 * Tests cover:
 * - Display message content with role indicator
 * - Show timestamp
 * - Handle streaming state (partial content with cursor)
 * - Handle error state with retry button
 *
 * **Validates: Requirements 3.4, 6.4**
 */

describe('ChatMessage', () => {
  const createMessage = (
    overrides: Partial<ChatMessageType> = {}
  ): ChatMessageType => ({
    id: 'test-message-1',
    role: 'user',
    content: 'Hello, this is a test message',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'complete',
    ...overrides,
  });

  describe('Message Content Display', () => {
    it('renders message content correctly', () => {
      const message = createMessage({ content: 'Test content here' });
      render(<ChatMessage message={message} />);

      expect(screen.getByTestId('message-content')).toHaveTextContent(
        'Test content here'
      );
    });

    it('renders with article role for accessibility', () => {
      const message = createMessage();
      render(<ChatMessage message={message} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('includes role in aria-label', () => {
      const message = createMessage({ role: 'assistant' });
      render(<ChatMessage message={message} />);

      expect(screen.getByRole('article')).toHaveAttribute(
        'aria-label',
        'assistant message'
      );
    });

    it('renders with correct test id based on message id', () => {
      const message = createMessage({ id: 'msg-123' });
      render(<ChatMessage message={message} />);

      expect(screen.getByTestId('message-msg-123')).toBeInTheDocument();
    });
  });

  describe('Role-based Styling', () => {
    it('applies user message styling (right-aligned, blue)', () => {
      const message = createMessage({ role: 'user' });
      render(<ChatMessage message={message} />);

      const container = screen.getByTestId('message-test-message-1');
      expect(container).toHaveClass('justify-end');
    });

    it('applies assistant message styling (left-aligned, gray)', () => {
      const message = createMessage({ role: 'assistant' });
      render(<ChatMessage message={message} />);

      const container = screen.getByTestId('message-test-message-1');
      expect(container).toHaveClass('justify-start');
    });

    it('applies system message styling (centered)', () => {
      const message = createMessage({ role: 'system' });
      render(<ChatMessage message={message} />);

      const container = screen.getByTestId('message-test-message-1');
      expect(container).toHaveClass('justify-center');
    });
  });

  describe('Timestamp Display', () => {
    it('displays formatted timestamp', () => {
      const message = createMessage({
        timestamp: new Date('2024-01-15T14:30:00'),
      });
      render(<ChatMessage message={message} />);

      const timestamp = screen.getByTestId('message-timestamp');
      // The exact format depends on locale, but it should contain time
      expect(timestamp).toBeInTheDocument();
      expect(timestamp.textContent).toMatch(/\d{1,2}:\d{2}/);
    });

    it('renders timestamp with correct styling class', () => {
      const message = createMessage({ role: 'user' });
      render(<ChatMessage message={message} />);

      const timestamp = screen.getByTestId('message-timestamp');
      expect(timestamp).toHaveClass('text-xs', 'mt-1');
    });
  });

  describe('Streaming State', () => {
    it('shows streaming cursor when status is streaming', () => {
      const message = createMessage({
        status: 'streaming',
        content: 'Partial response...',
      });
      render(<ChatMessage message={message} />);

      expect(screen.getByTestId('streaming-cursor')).toBeInTheDocument();
    });

    it('streaming cursor has pulse animation', () => {
      const message = createMessage({ status: 'streaming' });
      render(<ChatMessage message={message} />);

      const cursor = screen.getByTestId('streaming-cursor');
      expect(cursor).toHaveClass('animate-pulse');
    });

    it('streaming cursor is hidden from screen readers', () => {
      const message = createMessage({ status: 'streaming' });
      render(<ChatMessage message={message} />);

      const cursor = screen.getByTestId('streaming-cursor');
      expect(cursor).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not show streaming cursor when status is complete', () => {
      const message = createMessage({ status: 'complete' });
      render(<ChatMessage message={message} />);

      expect(screen.queryByTestId('streaming-cursor')).not.toBeInTheDocument();
    });

    it('does not show streaming cursor when status is sending', () => {
      const message = createMessage({ status: 'sending' });
      render(<ChatMessage message={message} />);

      expect(screen.queryByTestId('streaming-cursor')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error section when status is error and onRetry provided', () => {
      const message = createMessage({ status: 'error' });
      const onRetry = jest.fn();
      render(<ChatMessage message={message} onRetry={onRetry} />);

      expect(screen.getByTestId('error-section')).toBeInTheDocument();
    });

    it('displays error message text', () => {
      const message = createMessage({ status: 'error' });
      const onRetry = jest.fn();
      render(<ChatMessage message={message} onRetry={onRetry} />);

      expect(screen.getByText('Failed to send message')).toBeInTheDocument();
    });

    it('shows retry button when in error state', () => {
      const message = createMessage({ status: 'error' });
      const onRetry = jest.fn();
      render(<ChatMessage message={message} onRetry={onRetry} />);

      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const message = createMessage({ status: 'error' });
      const onRetry = jest.fn();
      render(<ChatMessage message={message} onRetry={onRetry} />);

      fireEvent.click(screen.getByTestId('retry-button'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not show error section when status is error but no onRetry', () => {
      const message = createMessage({ status: 'error' });
      render(<ChatMessage message={message} />);

      expect(screen.queryByTestId('error-section')).not.toBeInTheDocument();
    });

    it('does not show error section when status is not error', () => {
      const message = createMessage({ status: 'complete' });
      const onRetry = jest.fn();
      render(<ChatMessage message={message} onRetry={onRetry} />);

      expect(screen.queryByTestId('error-section')).not.toBeInTheDocument();
    });

    it('applies error border styling when in error state', () => {
      const message = createMessage({ status: 'error' });
      const onRetry = jest.fn();
      const { container } = render(
        <ChatMessage message={message} onRetry={onRetry} />
      );

      const bubble = container.querySelector('.border-red-300');
      expect(bubble).toBeInTheDocument();
    });
  });

  describe('Content Formatting', () => {
    it('preserves whitespace in user message content', () => {
      const message = createMessage({
        role: 'user',
        content: 'Line 1\nLine 2\n  Indented',
      });
      render(<ChatMessage message={message} />);

      // User messages have whitespace-pre-wrap on the inner p element
      const content = screen.getByTestId('message-content');
      const paragraph = content.querySelector('p');
      expect(paragraph).toHaveClass('whitespace-pre-wrap');
    });

    it('handles long words with word break', () => {
      const message = createMessage({
        content: 'Superlongwordthatmightoverflow',
      });
      render(<ChatMessage message={message} />);

      const content = screen.getByTestId('message-content');
      expect(content).toHaveClass('break-words');
    });

    it('handles empty content gracefully', () => {
      const message = createMessage({ content: '' });
      render(<ChatMessage message={message} />);

      expect(screen.getByTestId('message-content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('retry button is keyboard accessible', () => {
      const message = createMessage({ status: 'error' });
      const onRetry = jest.fn();
      render(<ChatMessage message={message} onRetry={onRetry} />);

      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toHaveAttribute('type', 'button');
    });

    it('retry button has focus styles', () => {
      const message = createMessage({ status: 'error' });
      const onRetry = jest.fn();
      render(<ChatMessage message={message} onRetry={onRetry} />);

      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton.className).toContain('focus:outline-none');
      expect(retryButton.className).toContain('focus:ring-2');
    });
  });
});
