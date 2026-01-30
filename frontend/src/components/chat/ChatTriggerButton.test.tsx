import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatTriggerButton } from './ChatTriggerButton';

describe('ChatTriggerButton', () => {
  const defaultProps = {
    onClick: jest.fn(),
    ariaLabel: 'Open chat to ask about my experience',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders a button element', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('renders with the correct aria-label', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      expect(button).toHaveAttribute('aria-label', defaultProps.ariaLabel);
    });

    it('renders with aria-expanded set to false', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('renders with aria-haspopup set to dialog', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('renders the chat icon SVG', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Touch Target Size (Requirement 1.5)', () => {
    it('has minimum 44×44px touch target', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      // Check that the button has the min-w-[44px] and min-h-[44px] classes
      expect(button.className).toContain('min-w-[44px]');
      expect(button.className).toContain('min-h-[44px]');
    });
  });

  describe('Click Handling', () => {
    it('calls onClick when clicked', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      fireEvent.click(button);
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Accessibility (Requirement 1.4)', () => {
    it('calls onClick when Enter key is pressed', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Space key is pressed', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      fireEvent.keyDown(button, { key: ' ' });
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick for other keys', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      fireEvent.keyDown(button, { key: 'Tab' });
      fireEvent.keyDown(button, { key: 'Escape' });
      fireEvent.keyDown(button, { key: 'a' });
      expect(defaultProps.onClick).not.toHaveBeenCalled();
    });

    it('is focusable via tab (has no tabIndex that would prevent it)', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      // Buttons are focusable by default, ensure no negative tabIndex
      expect(button).not.toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Unread Indicator', () => {
    it('does not show unread indicator by default', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      // The unread indicator has specific classes
      const badge = button.querySelector('.bg-red-500');
      expect(badge).not.toBeInTheDocument();
    });

    it('does not show unread indicator when hasUnread is false', () => {
      render(<ChatTriggerButton {...defaultProps} hasUnread={false} />);
      const button = screen.getByTestId('chat-trigger-button');
      const badge = button.querySelector('.bg-red-500');
      expect(badge).not.toBeInTheDocument();
    });

    it('shows unread indicator when hasUnread is true', () => {
      render(<ChatTriggerButton {...defaultProps} hasUnread={true} />);
      const button = screen.getByTestId('chat-trigger-button');
      const badge = button.querySelector('.bg-red-500');
      expect(badge).toBeInTheDocument();
    });

    it('unread indicator is hidden from screen readers', () => {
      render(<ChatTriggerButton {...defaultProps} hasUnread={true} />);
      const button = screen.getByTestId('chat-trigger-button');
      const badge = button.querySelector('.bg-red-500');
      expect(badge).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Visual Feedback', () => {
    it('has hover styles', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      expect(button.className).toContain('hover:');
    });

    it('has focus styles', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      expect(button.className).toContain('focus:');
    });

    it('has active styles', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      expect(button.className).toContain('active:');
    });

    it('has transition for smooth animations', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      expect(button.className).toContain('transition-');
    });
  });

  describe('Positioning', () => {
    it('is positioned fixed in bottom-right corner', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      expect(button.className).toContain('fixed');
      expect(button.className).toContain('bottom-6');
      expect(button.className).toContain('right-6');
    });

    it('has appropriate z-index for floating above content', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const button = screen.getByTestId('chat-trigger-button');
      expect(button.className).toContain('z-50');
    });
  });

  describe('Screen Reader Support', () => {
    it('has screen reader only text', () => {
      render(<ChatTriggerButton {...defaultProps} />);
      const srText = screen.getByText('Ask AI about me');
      expect(srText).toHaveClass('sr-only');
    });
  });
});
