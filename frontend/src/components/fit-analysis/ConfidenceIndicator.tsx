'use client';

/**
 * ConfidenceIndicator Component
 *
 * Displays the confidence level of a match assessment with:
 * - An icon (check-circle, minus-circle, x-circle)
 * - A text label (Strong Match, Partial Match, Limited Match)
 * - Appropriate colors (green, yellow, red)
 * - A description of what the confidence level means
 *
 * IMPORTANT: This component does NOT rely solely on color to convey meaning.
 * It includes both an icon and a text label for accessibility.
 *
 * @see Requirements 3.2, 7.5
 */

import React from 'react';
import { ConfidenceLevel, CONFIDENCE_DISPLAY } from '@/types/fit-analysis';

/**
 * Props for the ConfidenceIndicator component
 */
export interface ConfidenceIndicatorProps {
  /** The confidence level to display */
  level: ConfidenceLevel;
  /** Accessible label for screen readers */
  ariaLabel: string;
}

/**
 * Check Circle Icon for strong_match
 */
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Minus Circle Icon for partial_match
 */
function MinusCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * X Circle Icon for limited_match
 */
function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Get the appropriate icon component for a confidence level
 */
function getIconComponent(level: ConfidenceLevel) {
  switch (level) {
    case 'strong_match':
      return CheckCircleIcon;
    case 'partial_match':
      return MinusCircleIcon;
    case 'limited_match':
      return XCircleIcon;
    default:
      return CheckCircleIcon;
  }
}

/**
 * Get the color classes for a confidence level
 * Returns both text and background color classes
 */
function getColorClasses(level: ConfidenceLevel): {
  text: string;
  bg: string;
  border: string;
} {
  switch (level) {
    case 'strong_match':
      return {
        text: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
      };
    case 'partial_match':
      return {
        text: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
      };
    case 'limited_match':
      return {
        text: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
      };
    default:
      return {
        text: 'text-gray-700',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
      };
  }
}

/**
 * ConfidenceIndicator component displays the overall confidence level
 * of a match assessment.
 *
 * The component is designed to be accessible and does NOT rely solely
 * on color to convey meaning. It includes:
 * - An icon that visually represents the confidence level
 * - A text label that clearly states the confidence level
 * - A description explaining what the confidence level means
 *
 * @example
 * ```tsx
 * <ConfidenceIndicator
 *   level="strong_match"
 *   ariaLabel="Overall fit assessment: Strong Match"
 * />
 * ```
 */
export function ConfidenceIndicator({
  level,
  ariaLabel,
}: ConfidenceIndicatorProps) {
  const display = CONFIDENCE_DISPLAY[level];
  const IconComponent = getIconComponent(level);
  const colors = getColorClasses(level);

  return (
    <div
      className={`
        rounded-lg border p-4
        ${colors.bg} ${colors.border}
      `}
      role="status"
      aria-label={ariaLabel}
      data-testid="confidence-indicator"
    >
      <div className="flex items-center gap-3">
        {/* Icon - provides visual indicator beyond color */}
        <div
          className={`flex-shrink-0 ${colors.text}`}
          data-testid="confidence-icon"
        >
          <IconComponent className="w-8 h-8" />
        </div>

        {/* Text content - label and description */}
        <div className="flex-1 min-w-0">
          {/* Label - clearly states the confidence level */}
          <h3
            className={`text-lg font-semibold ${colors.text}`}
            data-testid="confidence-label"
          >
            {display.label}
          </h3>

          {/* Description - explains what the confidence level means */}
          <p
            className="text-sm text-gray-600 mt-0.5"
            data-testid="confidence-description"
          >
            {display.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConfidenceIndicator;
