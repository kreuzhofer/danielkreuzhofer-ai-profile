import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders a form element', () => {
      render(<ChatInput {...defaultProps} />);
      const form = screen.getByTestId('chat-input-form');
      expect(form).toBeInTheDocument();
      expect(form.tagName).toBe('FORM');
    });

    it('renders a textarea for message input', () => {
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('renders a send button', () => {
      render(<ChatInput {...defaultProps} />);
      const button = screen.getByTestId('chat-input-send-button');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders with default placeholder', () => {
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Type your message...');
    });

    it('renders with custom placeholder', () => {
      render(<ChatInput {...defaultProps} placeholder="Ask me anything..." />);
      const textarea = screen.getByTestId('chat-input-textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Ask me anything...');
    });
  });

  describe('Accessibility', () => {
    it('textarea has aria-label', () => {
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      expect(textarea).toHaveAttribute('aria-label', 'Message input');
    });

    it('send button has aria-label', () => {
      render(<ChatInput {...defaultProps} />);
      const button = screen.getByTestId('chat-input-send-button');
      expect(button).toHaveAttribute('aria-label', 'Send message');
    });

    it('send button has screen reader text', () => {
      render(<ChatInput {...defaultProps} />);
      const srText = screen.getByText('Send message');
      expect(srText).toHaveClass('sr-only');
    });

    it('send icon is hidden from screen readers', () => {
      render(<ChatInput {...defaultProps} />);
      const button = screen.getByTestId('chat-input-send-button');
      const svg = button.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Input Handling', () => {
    it('updates input value when typing', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');

      await user.type(textarea, 'Hello world');
      expect(textarea).toHaveValue('Hello world');
    });

    it('allows multiline input', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');

      await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');
      expect(textarea).toHaveValue('Line 1\nLine 2');
    });
  });

  describe('Send Button State (Requirement 2.4, 2.5)', () => {
    it('send button is disabled when input is empty', () => {
      render(<ChatInput {...defaultProps} />);
      const button = screen.getByTestId('chat-input-send-button');
      expect(button).toBeDisabled();
    });

    it('send button is disabled when input contains only whitespace', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      const button = screen.getByTestId('chat-input-send-button');

      await user.type(textarea, '   ');
      expect(button).toBeDisabled();
    });

    it('send button is enabled when input has valid content', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      const button = screen.getByTestId('chat-input-send-button');

      await user.type(textarea, 'Hello');
      expect(button).not.toBeDisabled();
    });

    it('send button is disabled when disabled prop is true', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} disabled={true} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      const button = screen.getByTestId('chat-input-send-button');

      // Even with valid input, button should be disabled
      await user.type(textarea, 'Hello');
      expect(button).toBeDisabled();
    });

    it('textarea is disabled when disabled prop is true', () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      expect(textarea).toBeDisabled();
    });
  });

  describe('Message Submission (Requirement 2.1, 2.3)', () => {
    it('calls onSubmit with trimmed message when send button is clicked', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      const button = screen.getByTestId('chat-input-send-button');

      await user.type(textarea, '  Hello world  ');
      await user.click(button);

      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSubmit).toHaveBeenCalledWith('Hello world');
    });

    it('clears input after successful submission', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      const button = screen.getByTestId('chat-input-send-button');

      await user.type(textarea, 'Hello world');
      await user.click(button);

      expect(textarea).toHaveValue('');
    });

    it('does not call onSubmit when input is empty', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const form = screen.getByTestId('chat-input-form');

      fireEvent.submit(form);

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('does not call onSubmit when input contains only whitespace', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      const form = screen.getByTestId('chat-input-form');

      await user.type(textarea, '   \n\t  ');
      fireEvent.submit(form);

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('does not call onSubmit when disabled', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} disabled={true} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      const form = screen.getByTestId('chat-input-form');

      await user.type(textarea, 'Hello');
      fireEvent.submit(form);

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Handling (Requirement 2.1)', () => {
    it('submits message when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');

      await user.type(textarea, 'Hello world');
      await user.keyboard('{Enter}');

      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSubmit).toHaveBeenCalledWith('Hello world');
    });

    it('clears input after Enter submission', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');

      await user.type(textarea, 'Hello world');
      await user.keyboard('{Enter}');

      expect(textarea).toHaveValue('');
    });

    it('adds newline when Shift+Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');

      await user.type(textarea, 'Line 1');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      await user.type(textarea, 'Line 2');

      expect(textarea).toHaveValue('Line 1\nLine 2');
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('does not submit when Enter is pressed with empty input', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');

      textarea.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('does not submit when Enter is pressed while disabled', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} disabled={true} />);
      const textarea = screen.getByTestId('chat-input-textarea');

      await user.type(textarea, 'Hello');
      await user.keyboard('{Enter}');

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Visual Styling', () => {
    it('send button has minimum touch target size', () => {
      render(<ChatInput {...defaultProps} />);
      const button = screen.getByTestId('chat-input-send-button');
      expect(button.className).toContain('min-w-[44px]');
      expect(button.className).toContain('min-h-[44px]');
    });

    it('send button has focus styles', () => {
      render(<ChatInput {...defaultProps} />);
      const button = screen.getByTestId('chat-input-send-button');
      expect(button.className).toContain('focus:');
    });

    it('textarea has focus styles', () => {
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      expect(textarea.className).toContain('focus:');
    });

    it('send button has disabled styles when disabled', () => {
      render(<ChatInput {...defaultProps} />);
      const button = screen.getByTestId('chat-input-send-button');
      // Button is disabled when input is empty
      expect(button.className).toContain('cursor-not-allowed');
    });

    it('send button has enabled styles when valid input', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      const button = screen.getByTestId('chat-input-send-button');

      await user.type(textarea, 'Hello');
      expect(button.className).toContain('bg-blue-600');
      expect(button.className).toContain('hover:bg-blue-700');
    });
  });

  describe('Auto-resize Textarea', () => {
    it('textarea starts with single row', () => {
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      expect(textarea).toHaveAttribute('rows', '1');
    });

    it('textarea has resize-none class to prevent manual resize', () => {
      render(<ChatInput {...defaultProps} />);
      const textarea = screen.getByTestId('chat-input-textarea');
      expect(textarea.className).toContain('resize-none');
    });
  });
});
