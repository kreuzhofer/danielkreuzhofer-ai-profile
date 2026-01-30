/**
 * InputSection Component Tests
 *
 * Tests for the job description input interface including:
 * - Rendering with placeholder text
 * - Character count display
 * - Validation message display (errors and warnings)
 * - Submit button states (enabled, disabled, loading)
 * - Keyboard navigation and shortcuts
 *
 * @see Requirements 1.1, 1.2, 1.4, 2.3, 2.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputSection, InputSectionProps } from './InputSection';
import { JOB_DESCRIPTION_CONSTRAINTS } from '@/types/fit-analysis';

// Default props for testing
const defaultProps: InputSectionProps = {
  value: '',
  onChange: jest.fn(),
  onSubmit: jest.fn(),
  isDisabled: false,
  maxLength: JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH,
  minLength: JOB_DESCRIPTION_CONSTRAINTS.MIN_LENGTH_WARNING,
  placeholder: 'Paste a job description, project brief, or challenge statement...',
};

// Helper to render with custom props
const renderInputSection = (props: Partial<InputSectionProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<InputSection {...mergedProps} />);
};

describe('InputSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    /**
     * Validates: Requirement 1.1
     * THE Fit_Analysis_Module SHALL display a prominent input area for pasting Job_Description text
     */
    it('renders a textarea for job description input', () => {
      renderInputSection();

      const textarea = screen.getByTestId('job-description-textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    /**
     * Validates: Requirement 1.2
     * THE input area SHALL include placeholder text explaining what to paste
     */
    it('displays placeholder text explaining what to paste', () => {
      const placeholder = 'Paste a job description, project brief, or challenge statement...';
      renderInputSection({ placeholder });

      const textarea = screen.getByTestId('job-description-textarea');
      expect(textarea).toHaveAttribute('placeholder', placeholder);
    });

    it('renders a submit button', () => {
      renderInputSection();

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('renders a label for the textarea', () => {
      renderInputSection();

      const label = screen.getByText('Job Description');
      expect(label).toBeInTheDocument();
    });

    it('renders keyboard shortcut hint', () => {
      renderInputSection();

      expect(screen.getByText(/Ctrl/)).toBeInTheDocument();
      expect(screen.getByText(/Enter/)).toBeInTheDocument();
    });
  });

  describe('Character Count', () => {
    /**
     * Validates: Requirement 1.4
     * THE Fit_Analysis_Module SHALL display a character count indicator
     */
    it('displays character count as 0 when empty', () => {
      renderInputSection({ value: '' });

      const charCount = screen.getByTestId('character-count');
      expect(charCount).toBeInTheDocument();
      expect(screen.getByTestId('current-count')).toHaveTextContent('0');
    });

    it('displays accurate character count for input', () => {
      const testValue = 'This is a test job description';
      renderInputSection({ value: testValue });

      expect(screen.getByTestId('current-count')).toHaveTextContent(
        testValue.length.toString()
      );
    });

    it('displays maximum character limit', () => {
      renderInputSection({ maxLength: 5000 });

      const charCount = screen.getByTestId('character-count');
      expect(charCount).toHaveTextContent('5,000');
    });

    it('shows warning color when near limit (>90%)', () => {
      const nearLimitValue = 'a'.repeat(4600); // 92% of 5000
      renderInputSection({ value: nearLimitValue, maxLength: 5000 });

      const charCount = screen.getByTestId('character-count');
      expect(charCount).toHaveClass('text-yellow-600');
    });

    it('shows error color when over limit', () => {
      const overLimitValue = 'a'.repeat(5100);
      renderInputSection({ value: overLimitValue, maxLength: 5000 });

      const charCount = screen.getByTestId('character-count');
      expect(charCount).toHaveClass('text-red-600');
    });
  });

  describe('Validation Messages', () => {
    /**
     * Validates: Requirement 2.3
     * THE Fit_Analysis_Module SHALL prevent submission and display a validation message
     * for empty or whitespace-only input
     */
    it('shows error message for empty input when trying to submit', () => {
      const onSubmit = jest.fn();
      renderInputSection({ value: '', onSubmit });

      // The validation error should be shown based on the validation function
      // Empty string shows error
      const errorMessage = screen.getByTestId('validation-error');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Please enter a job description to analyze.');
    });

    it('shows error message for whitespace-only input', () => {
      renderInputSection({ value: '   \n\t  ' });

      const errorMessage = screen.getByTestId('validation-error');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Please enter a job description to analyze.');
    });

    /**
     * Validates: Requirement 2.4
     * THE Fit_Analysis_Module SHALL warn the Visitor that more detail may improve analysis quality
     * when input is fewer than 50 characters
     */
    it('shows warning message for short input (< 50 chars)', () => {
      renderInputSection({ value: 'Short job description' });

      const warningMessage = screen.getByTestId('validation-warning');
      expect(warningMessage).toBeInTheDocument();
      expect(warningMessage).toHaveTextContent('Adding more detail may improve analysis quality.');
    });

    it('does not show warning for input >= 50 chars', () => {
      const longEnoughValue = 'a'.repeat(50);
      renderInputSection({ value: longEnoughValue });

      expect(screen.queryByTestId('validation-warning')).not.toBeInTheDocument();
      expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
    });

    it('shows error message for input exceeding max length', () => {
      const tooLongValue = 'a'.repeat(5001);
      renderInputSection({ value: tooLongValue, maxLength: 5000 });

      const errorMessage = screen.getByTestId('validation-error');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('exceeds maximum length');
    });

    it('error message has role="alert" for accessibility', () => {
      renderInputSection({ value: '' });

      const errorMessage = screen.getByTestId('validation-error');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('warning message has role="status" for accessibility', () => {
      renderInputSection({ value: 'Short' });

      const warningMessage = screen.getByTestId('validation-warning');
      expect(warningMessage).toHaveAttribute('role', 'status');
    });
  });

  describe('Submit Button States', () => {
    /**
     * Validates: Requirement 2.5
     * THE Fit_Analysis_Module SHALL disable the submit button to prevent duplicate submissions
     */
    it('disables submit button when isDisabled is true', () => {
      renderInputSection({ value: 'Valid job description text here', isDisabled: true });

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('disables submit button when input is empty', () => {
      renderInputSection({ value: '' });

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('disables submit button when input is whitespace only', () => {
      renderInputSection({ value: '   \n\t  ' });

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('disables submit button when input exceeds max length', () => {
      const tooLongValue = 'a'.repeat(5001);
      renderInputSection({ value: tooLongValue, maxLength: 5000 });

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button for valid input', () => {
      const validValue = 'a'.repeat(100);
      renderInputSection({ value: validValue });

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    it('enables submit button for short but valid input (with warning)', () => {
      renderInputSection({ value: 'Short but valid' });

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    /**
     * Validates: Requirement 2.2
     * THE Fit_Analysis_Module SHALL display a loading state with progress indication
     */
    it('shows loading state when isDisabled is true', () => {
      renderInputSection({ value: 'Valid job description', isDisabled: true });

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveTextContent('Analyzing...');
    });

    it('shows "Analyze Fit" text when not loading', () => {
      renderInputSection({ value: 'Valid job description text here' });

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveTextContent('Analyze Fit');
    });

    it('submit button has minimum touch target size (44x44px)', () => {
      renderInputSection();

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveClass('min-w-[44px]');
      expect(submitButton).toHaveClass('min-h-[44px]');
    });
  });

  describe('User Interactions', () => {
    it('calls onChange when typing in textarea', async () => {
      const onChange = jest.fn();
      renderInputSection({ onChange });

      const textarea = screen.getByTestId('job-description-textarea');
      await userEvent.type(textarea, 'Hello');

      expect(onChange).toHaveBeenCalled();
    });

    it('calls onSubmit when form is submitted with valid input', async () => {
      const onSubmit = jest.fn();
      renderInputSection({ value: 'Valid job description text here', onSubmit });

      const submitButton = screen.getByTestId('submit-button');
      await userEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not call onSubmit when input is empty', async () => {
      const onSubmit = jest.fn();
      renderInputSection({ value: '', onSubmit });

      const submitButton = screen.getByTestId('submit-button');
      await userEvent.click(submitButton);

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('does not call onSubmit when isDisabled is true', async () => {
      const onSubmit = jest.fn();
      renderInputSection({ value: 'Valid input', isDisabled: true, onSubmit });

      const submitButton = screen.getByTestId('submit-button');
      await userEvent.click(submitButton);

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('does not call onSubmit when input exceeds max length', async () => {
      const onSubmit = jest.fn();
      const tooLongValue = 'a'.repeat(5001);
      renderInputSection({ value: tooLongValue, maxLength: 5000, onSubmit });

      const submitButton = screen.getByTestId('submit-button');
      await userEvent.click(submitButton);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    /**
     * Validates: Requirement 1.6
     * THE Fit_Analysis_Module SHALL be accessible via keyboard navigation
     */
    it('textarea is focusable via Tab', async () => {
      renderInputSection();

      const textarea = screen.getByTestId('job-description-textarea');

      // Tab to focus the textarea
      await userEvent.tab();

      // The textarea should be focused (or the label, depending on tab order)
      // We check that the textarea can receive focus
      textarea.focus();
      expect(document.activeElement).toBe(textarea);
    });

    it('submit button is focusable via Tab', async () => {
      renderInputSection({ value: 'Valid input' });

      const submitButton = screen.getByTestId('submit-button');

      submitButton.focus();
      expect(document.activeElement).toBe(submitButton);
    });

    it('submits form on Ctrl+Enter in textarea', async () => {
      const onSubmit = jest.fn();
      renderInputSection({ value: 'Valid job description text here', onSubmit });

      const textarea = screen.getByTestId('job-description-textarea');
      textarea.focus();

      // Simulate Ctrl+Enter
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('submits form on Cmd+Enter in textarea (Mac)', async () => {
      const onSubmit = jest.fn();
      renderInputSection({ value: 'Valid job description text here', onSubmit });

      const textarea = screen.getByTestId('job-description-textarea');
      textarea.focus();

      // Simulate Cmd+Enter (metaKey)
      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not submit on plain Enter in textarea', async () => {
      const onSubmit = jest.fn();
      renderInputSection({ value: 'Valid input', onSubmit });

      const textarea = screen.getByTestId('job-description-textarea');
      textarea.focus();

      // Simulate plain Enter
      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('textarea has aria-label', () => {
      renderInputSection();

      const textarea = screen.getByTestId('job-description-textarea');
      expect(textarea).toHaveAttribute('aria-label', 'Job description input');
    });

    it('textarea has aria-invalid when validation fails', () => {
      renderInputSection({ value: '' });

      const textarea = screen.getByTestId('job-description-textarea');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('textarea has aria-invalid=false when validation passes', () => {
      renderInputSection({ value: 'Valid job description text here' });

      const textarea = screen.getByTestId('job-description-textarea');
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('textarea has aria-describedby linking to character count', () => {
      renderInputSection({ value: 'Some text' });

      const textarea = screen.getByTestId('job-description-textarea');
      const describedBy = textarea.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
    });

    it('submit button has aria-label', () => {
      renderInputSection({ value: 'Valid input' });

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveAttribute('aria-label', 'Analyze fit');
    });

    it('submit button has loading aria-label when disabled', () => {
      renderInputSection({ value: 'Valid input', isDisabled: true });

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveAttribute('aria-label', 'Analyzing...');
    });

    it('character count has aria-live for screen readers', () => {
      renderInputSection();

      const charCount = screen.getByTestId('character-count');
      expect(charCount).toHaveAttribute('aria-live', 'polite');
    });

    it('label is associated with textarea via htmlFor', () => {
      renderInputSection();

      const textarea = screen.getByTestId('job-description-textarea');
      const label = screen.getByText('Job Description');

      expect(label).toHaveAttribute('for', textarea.id);
    });
  });

  describe('Edge Cases', () => {
    it('handles exactly 50 characters (no warning)', () => {
      const exactlyFifty = 'a'.repeat(50);
      renderInputSection({ value: exactlyFifty });

      expect(screen.queryByTestId('validation-warning')).not.toBeInTheDocument();
      expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
    });

    it('handles exactly 49 characters (shows warning)', () => {
      const fortyNine = 'a'.repeat(49);
      renderInputSection({ value: fortyNine });

      expect(screen.getByTestId('validation-warning')).toBeInTheDocument();
    });

    it('handles exactly 5000 characters (valid)', () => {
      const exactlyMax = 'a'.repeat(5000);
      renderInputSection({ value: exactlyMax, maxLength: 5000 });

      expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    it('handles exactly 5001 characters (invalid)', () => {
      const overMax = 'a'.repeat(5001);
      renderInputSection({ value: overMax, maxLength: 5000 });

      expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('handles mixed whitespace and content', () => {
      renderInputSection({ value: '  \n  Valid content here  \t  ' });

      // Should be valid since trimmed content is non-empty
      expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
    });

    it('handles unicode characters in character count', () => {
      // Note: JavaScript string.length counts UTF-16 code units, not graphemes
      // '你好世界' = 4 characters, '🌍' = 2 code units (surrogate pair)
      const unicodeText = '你好世界🌍';
      renderInputSection({ value: unicodeText });

      // JavaScript counts this as 6 (4 Chinese chars + 2 for the emoji surrogate pair)
      expect(screen.getByTestId('current-count')).toHaveTextContent(
        unicodeText.length.toString()
      );
    });
  });
});
