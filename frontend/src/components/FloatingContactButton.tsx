'use client';

import React from 'react';

/**
 * Props for the FloatingContactButton component
 */
export interface FloatingContactButtonProps {
  /** The href to navigate to (default: #contact) */
  href?: string;
  /** Accessible label for the button */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FloatingContactButton component - a subtle, persistent contact option visible from all sections.
 * 
 * Features:
 * - Fixed position in bottom-right corner, always visible during scroll
 * - Subtle design that doesn't distract from content
 * - Touch target of 44x44px minimum (Requirement 5.2)
 * - Keyboard accessible with visible focus indicators
 * - Uses inviting language per design principles (Requirement 8.4)
 * - Non-intrusive - not a pop-up or modal (Requirement 8.5)
 * 
 * **Validates: Requirement 8.3**
 * - 8.3: WHILE viewing any Content_Section, THE Content_Architecture SHALL provide a subtle, persistent contact option
 * 
 * @example
 * ```tsx
 * <FloatingContactButton />
 * ```
 */
export function FloatingContactButton({
  href = '#contact',
  ariaLabel = "Let's connect - scroll to contact section",
  className = '',
}: FloatingContactButtonProps) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      data-testid="floating-contact-button"
      className={`
        fixed bottom-6 right-6 z-40
        flex items-center justify-center
        min-w-[44px] min-h-[44px] w-12 h-12
        bg-[var(--primary-500)] text-[var(--background)]
        rounded-full shadow-lg
        hover:bg-[var(--primary-400)] hover:shadow-xl hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)]
        transition-all duration-200 ease-in-out
        ${className}
      `}
    >
      {/* Chat/message icon - inviting and friendly */}
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
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
      
      {/* Screen reader text for additional context */}
      <span className="sr-only">Contact me</span>
    </a>
  );
}

export default FloatingContactButton;
