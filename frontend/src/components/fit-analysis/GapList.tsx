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
        border: 'border-gray-200',
        bg: 'bg-gray-50',
        badge: 'bg-gray-200 text-gray-700',
        icon: 'text-gray-500',
      };
    case 'moderate':
      return {
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        badge: 'bg-yellow-200 text-yellow-800',
        icon: 'text-yellow-600',
      };
    case 'significant':
      return {
        border: 'border-red-200',
        bg: 'bg-red-50',
        badge: 'bg-red-200 text-red-800',
        icon: 'text-red-600',
      };
    default:
      return {
        border: 'border-gray-200',
        bg: 'bg-gray-50',
        badge: 'bg-gray-200 text-gray-700',
        icon: 'text-gray-500',
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
            <h4 className="font-semibold text-gray-900">{gap.title}</h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${classes.badge}`}
              data-testid="severity-badge"
            >
              {severityDisplay.label}
            </span>
          </div>
          <p className="text-gray-700 mt-1">{gap.description}</p>
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
        className="text-gray-500 text-center py-4"
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
        className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"
      >
        <span className="text-yellow-600" aria-hidden="true">
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
