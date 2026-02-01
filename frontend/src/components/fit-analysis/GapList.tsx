/**
 * GapList Component
 *
 * Displays gap areas where documented experience is limited or absent,
 * with severity indicators.
 *
 * @see Requirements 3.4, 4.3
 */

import React from 'react';
import { GapArea, GapSeverity, GAP_SEVERITY_DISPLAY } from '@/types/fit-analysis';

export interface GapListProps {
  /** List of gap areas to display */
  items: GapArea[];
}

/**
 * Get icon for gap severity
 */
const getSeverityIcon = (severity: GapSeverity): string => {
  switch (severity) {
    case 'minor':
      return '○';
    case 'moderate':
      return '◐';
    case 'significant':
      return '●';
    default:
      return '○';
  }
};

/**
 * Get CSS classes for severity styling
 */
const getSeverityClasses = (severity: GapSeverity): {
  border: string;
  bg: string;
  badge: string;
  icon: string;
} => {
  switch (severity) {
    case 'minor':
      return {
        border: 'border-[var(--border)]',
        bg: 'bg-[var(--surface)]',
        badge: 'bg-[var(--surface-elevated)] text-[var(--foreground-muted)]',
        icon: 'text-[var(--foreground-muted)]',
      };
    case 'moderate':
      return {
        border: 'border-[var(--warning)]/30',
        bg: 'bg-[var(--warning)]/10',
        badge: 'bg-[var(--warning)]/20 text-[var(--warning)]',
        icon: 'text-[var(--warning)]',
      };
    case 'significant':
      return {
        border: 'border-[var(--error)]/30',
        bg: 'bg-[var(--error)]/10',
        badge: 'bg-[var(--error)]/20 text-[var(--error)]',
        icon: 'text-[var(--error)]',
      };
    default:
      return {
        border: 'border-[var(--border)]',
        bg: 'bg-[var(--surface)]',
        badge: 'bg-[var(--surface-elevated)] text-[var(--foreground-muted)]',
        icon: 'text-[var(--foreground-muted)]',
      };
  }
};

interface GapItemProps {
  gap: GapArea;
}

/**
 * Individual gap area component
 */
const GapItem: React.FC<GapItemProps> = ({ gap }) => {
  const classes = getSeverityClasses(gap.severity);
  const severityDisplay = GAP_SEVERITY_DISPLAY[gap.severity];

  return (
    <li
      className={`border ${classes.border} rounded-lg p-4 ${classes.bg}`}
      data-testid="gap-item"
      data-severity={gap.severity}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex-shrink-0 w-6 h-6 flex items-center justify-center ${classes.icon} text-lg`}
          aria-hidden="true"
        >
          {getSeverityIcon(gap.severity)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-[var(--foreground)]">{gap.title}</h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${classes.badge}`}
              data-testid="severity-badge"
            >
              {severityDisplay.label}
            </span>
          </div>
          <p className="text-[var(--foreground-muted)] mt-1">{gap.description}</p>
        </div>
      </div>
    </li>
  );
};

/**
 * GapList displays areas where there are gaps in experience
 */
export const GapList: React.FC<GapListProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div
        className="text-[var(--foreground-muted)] text-center py-4"
        data-testid="gap-list-empty"
      >
        No significant gaps identified.
      </div>
    );
  }

  // Sort by severity: significant first, then moderate, then minor
  const sortedItems = [...items].sort((a, b) => {
    const severityOrder: Record<GapSeverity, number> = {
      significant: 0,
      moderate: 1,
      minor: 2,
    };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <section aria-labelledby="gaps-heading" data-testid="gap-list">
      <h3
        id="gaps-heading"
        className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2"
      >
        <span className="text-[var(--warning)]" aria-hidden="true">
          ⚠
        </span>
        Areas to Consider ({items.length})
      </h3>
      <ul className="space-y-3" role="list">
        {sortedItems.map((gap) => (
          <GapItem key={gap.id} gap={gap} />
        ))}
      </ul>
    </section>
  );
};

export default GapList;
