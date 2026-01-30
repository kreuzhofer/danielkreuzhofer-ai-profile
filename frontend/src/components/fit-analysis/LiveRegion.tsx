/**
 * LiveRegion Component
 *
 * Provides ARIA live region announcements for screen readers.
 * Used to announce analysis completion and results.
 *
 * @see Requirements 7.2, 7.6
 */

import React, { useEffect, useState } from 'react';

export interface LiveRegionProps {
  /** Message to announce to screen readers */
  message: string;
  /** Politeness level for the announcement */
  politeness?: 'polite' | 'assertive';
  /** Whether to clear the message after announcement */
  clearAfter?: number;
}

/**
 * LiveRegion announces messages to screen readers via ARIA live regions.
 *
 * The component uses a visually hidden element that is still accessible
 * to screen readers. Messages are announced when they change.
 *
 * @example
 * ```tsx
 * <LiveRegion
 *   message="Analysis complete. Strong match found."
 *   politeness="polite"
 * />
 * ```
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  clearAfter,
}) => {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);

    if (clearAfter && message) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      data-testid="live-region"
    >
      {currentMessage}
    </div>
  );
};

export default LiveRegion;
