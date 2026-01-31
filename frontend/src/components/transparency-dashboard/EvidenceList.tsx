'use client';

/**
 * EvidenceList Component
 *
 * Displays a list of evidence items as clickable links with type indicators.
 * Used within the SkillDetailPanel to show supporting evidence for skills.
 *
 * Features:
 * - Displays evidence items as clickable links (Requirement 3.3)
 * - Shows evidence type indicator (project, experience, certification) (Requirement 5.2)
 * - Internal links open in same tab (no target="_blank") (Requirement 5.6)
 * - Minimum 44×44px touch targets (Requirement 2.6)
 *
 * @see Requirements 3.3, 5.2, 5.3, 5.6
 */

import React from 'react';
import type { Evidence } from '@/types/transparency-dashboard';
import { EVIDENCE_TYPE_DISPLAY } from '@/types/transparency-dashboard';

// =============================================================================
// Props Interfaces
// =============================================================================

export interface EvidenceListProps {
  /** Array of evidence items to display */
  evidence: Evidence[];
  /** Optional CSS class name */
  className?: string;
}

export interface EvidenceItemProps {
  /** The evidence item to display */
  evidence: Evidence;
}

// =============================================================================
// Evidence Icon Component
// =============================================================================

/**
 * Get the appropriate icon for an evidence type
 */
function EvidenceIcon({ type }: { type: Evidence['type'] }) {
  switch (type) {
    case 'project':
      // Folder icon
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      );
    case 'experience':
      // Briefcase icon
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    case 'certification':
      // Award icon
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      );
    default:
      return null;
  }
}

// =============================================================================
// Evidence Item Component
// =============================================================================

/**
 * EvidenceItem displays a single evidence link with type indicator.
 * Internal links (starting with '/') open in the same tab.
 *
 * @see Requirements 3.3, 5.2, 5.3, 5.6
 */
export function EvidenceItem({ evidence }: EvidenceItemProps) {
  const { type, title, reference, excerpt } = evidence;
  const typeDisplay = EVIDENCE_TYPE_DISPLAY[type];
  const isInternalLink = reference.startsWith('/');

  return (
    <a
      href={reference}
      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors min-h-[44px]"
      data-testid={`evidence-item-${evidence.id}`}
      // Internal links open in same tab (Requirement 5.6)
      {...(!isInternalLink && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {/* Evidence Type Icon */}
      <span
        className="flex-shrink-0 mt-0.5 text-gray-500"
        data-testid={`evidence-type-icon-${evidence.id}`}
      >
        <EvidenceIcon type={type} />
      </span>

      {/* Evidence Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium text-gray-900"
            data-testid={`evidence-title-${evidence.id}`}
          >
            {title}
          </span>
          <span
            className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded"
            data-testid={`evidence-type-${evidence.id}`}
          >
            {typeDisplay.label}
          </span>
        </div>
        {excerpt && (
          <p
            className="text-sm text-gray-600 mt-1 line-clamp-2"
            data-testid={`evidence-excerpt-${evidence.id}`}
          >
            {excerpt}
          </p>
        )}
      </div>

      {/* External link indicator */}
      {!isInternalLink && (
        <span className="flex-shrink-0 text-gray-400" aria-hidden="true">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </span>
      )}
    </a>
  );
}

// =============================================================================
// Evidence List Component
// =============================================================================

/**
 * EvidenceList displays a list of evidence items for a skill.
 *
 * @example
 * ```tsx
 * <EvidenceList evidence={skill.evidence} />
 * ```
 */
export function EvidenceList({ evidence, className = '' }: EvidenceListProps) {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <div
      className={`space-y-2 ${className}`}
      data-testid="evidence-list"
      role="list"
      aria-label="Evidence links"
    >
      {evidence.map((item) => (
        <div key={item.id} role="listitem">
          <EvidenceItem evidence={item} />
        </div>
      ))}
    </div>
  );
}

export default EvidenceList;
