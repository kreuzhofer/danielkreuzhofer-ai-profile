'use client';

/**
 * InputSection Component
 *
 * Provides the job description input interface for the Fit Analysis Module.
 * Features:
 * - Prominent textarea for pasting job descriptions
 * - Placeholder text explaining what to paste
 * - Character count indicator
 * - Validation messages (errors and warnings)
 * - Submit button with loading state
 * - Keyboard navigation support (Tab to focus, Enter to submit)
 * - Mobile-friendly with 44×44px minimum touch target for submit button
 *
 * @see Requirements 1.1, 1.2, 1.3, 1.4, 2.2, 2.5
 */

import React, { useCallback, useRef, useId } from 'react';
import { validateJobDescription } from '@/lib/fit-analysis-validation';
import { JOB_DESCRIPTION_CONSTRAINTS } from '@/types/fit-analysis';

/**
 * Props for the InputSection component
 */
export interface InputSectionProps {
  /** Current value of the textarea */
  value: string;
  /** Callback when the value changes */
  onChange: (value: string) => void;
  /** Callback when the form is submitted */
  onSubmit: () => void;
  /** Whether the input and submit button should be disabled */
  isDisabled: boolean;
  /** Maximum allowed character length */
  maxLength: number;
  /** Minimum character length for quality warning */
  minLength: number;
  /** Placeholder text for the textarea */
  placeholder: string;
}

/**
 * InputSection component for the Fit Analysis Module.
 *
 * Displays a prominent textarea for pasting job descriptions with:
 * - Character count indicator
 * - Validation messages (errors and warnings)
 * - Submit button with loading state
 * - Keyboard accessibility (Tab to focus, Ctrl+Enter to submit)
 *
 * @example
 * ```tsx
 * <InputSection
 *   value={jobDescription}
 *   onChange={setJobDescription}
 *   onSubmit={handleSubmit}
 *   isDisabled={isAnalyzing}
 *   maxLength={5000}
 *   minLength={50}
 *   placeholder="Paste a job description..."
 * />
 * ```
 */
export function InputSection({
  value,
  onChange,
  onSubmit,
  isDisabled,
  maxLength,
  minLength,
  placeholder,
}: InputSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uniqueId = useId();
  const textareaId = `job-description-${uniqueId}`;
  const errorId = `job-description-error-${uniqueId}`;
  const warningId = `job-description-warning-${uniqueId}`;
  const charCountId = `job-description-char-count-${uniqueId}`;

  // Validate the current input
  const validation = validateJobDescription(value);
  const { isValid, errorMessage, warningMessage } = validation;

  // Character count
  const currentLength = value.length;
  const isNearLimit = currentLength > maxLength * 0.9;
  const isOverLimit = currentLength > maxLength;

  // Determine if submit should be prevented
  // Submit is prevented if: disabled, not valid, or empty/whitespace only
  const trimmedValue = value.trim();
  const canSubmit = !isDisabled && isValid && trimmedValue.length > 0;

  /**
   * Handle textarea change
   */
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();

      // Validate before submitting
      if (!canSubmit) {
        return;
      }

      onSubmit();
    },
    [canSubmit, onSubmit]
  );

  /**
   * Handle keyboard events
   * - Ctrl+Enter: Submit the form
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+Enter or Cmd+Enter to submit
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Build aria-describedby based on current state
  const ariaDescribedBy = [
    charCountId,
    errorMessage ? errorId : null,
    warningMessage ? warningId : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
      data-testid="input-section-form"
    >
      <div className="space-y-3">
        {/* Label for the textarea */}
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-[var(--foreground-muted)]"
        >
          Job Description
        </label>

        {/* Textarea container */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            id={textareaId}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={8}
            className={`
              w-full px-4 py-3
              border rounded-lg
              bg-[var(--surface-elevated)]
              resize-y
              focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent
              disabled:bg-[var(--surface)] disabled:text-[var(--foreground-subtle)] disabled:cursor-not-allowed
              transition-colors duration-150
              text-[var(--foreground)] placeholder-[var(--foreground-subtle)]
              ${
                errorMessage
                  ? 'border-[var(--error)] focus:ring-[var(--error)]'
                  : warningMessage
                    ? 'border-[var(--warning)] focus:ring-[var(--warning)]'
                    : 'border-[var(--border)]'
              }
            `}
            style={{ minHeight: '200px' }}
            aria-label="Job description input"
            aria-describedby={ariaDescribedBy || undefined}
            aria-invalid={!isValid}
            data-testid="job-description-textarea"
          />
        </div>

        {/* Character count and validation messages row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Validation messages */}
          <div className="flex-1">
            {/* Error message */}
            {errorMessage && (
              <p
                id={errorId}
                className="text-sm text-[var(--error)] flex items-center gap-1"
                role="alert"
                data-testid="validation-error"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{errorMessage}</span>
              </p>
            )}

            {/* Warning message (only show if no error) */}
            {!errorMessage && warningMessage && (
              <p
                id={warningId}
                className="text-sm text-[var(--warning)] flex items-center gap-1"
                role="status"
                data-testid="validation-warning"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{warningMessage}</span>
              </p>
            )}
          </div>

          {/* Character count */}
          <div
            id={charCountId}
            className={`
              text-sm flex-shrink-0
              ${
                isOverLimit
                  ? 'text-[var(--error)] font-medium'
                  : isNearLimit
                    ? 'text-[var(--warning)]'
                    : 'text-[var(--foreground-muted)]'
              }
            `}
            aria-live="polite"
            data-testid="character-count"
          >
            <span data-testid="current-count">{currentLength.toLocaleString()}</span>
            <span> / </span>
            <span>{maxLength.toLocaleString()}</span>
            <span className="sr-only"> characters</span>
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        <p className="text-xs text-[var(--foreground-subtle)]">
          Press <kbd className="px-1 py-0.5 bg-[var(--surface-elevated)] rounded text-[var(--foreground-muted)] font-mono">Ctrl</kbd>+<kbd className="px-1 py-0.5 bg-[var(--surface-elevated)] rounded text-[var(--foreground-muted)] font-mono">Enter</kbd> to submit
        </p>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className={`
              w-full sm:w-auto
              px-6 py-3
              min-w-[44px] min-h-[44px]
              rounded-lg
              font-medium
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2
              ${
                !canSubmit
                  ? 'bg-[var(--surface-elevated)] text-[var(--foreground-subtle)] cursor-not-allowed'
                  : 'bg-[var(--primary-500)] text-[var(--background)] hover:bg-[var(--primary-400)] active:bg-[var(--primary-600)]'
              }
            `}
            aria-label={isDisabled ? 'Analyzing...' : 'Analyze fit'}
            data-testid="submit-button"
          >
            {isDisabled ? (
              <span className="flex items-center justify-center gap-2">
                {/* Loading spinner */}
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Analyzing...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {/* Analyze icon */}
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <span>Analyze Fit</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default InputSection;
