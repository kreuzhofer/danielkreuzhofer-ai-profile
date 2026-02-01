/**
 * AlignmentList Component
 *
 * Displays alignment areas where the portfolio owner's background
 * matches job requirements, with evidence links.
 *
 * @see Requirements 3.3, 3.5, 4.2
 */

import React from 'react';
import { AlignmentArea, Evidence, EvidenceType } from '@/types/fit-analysis';

export interface AlignmentListProps {
  /** List of alignment areas to display */
  items: AlignmentArea[];
}

/**
 * Get icon for evidence type
 */
const getEvidenceIcon = (type: EvidenceType): string => {
  switch (type) {
    case 'experience':
      return '💼';
    case 'project':
      return '🚀';
    case 'skill':
      return '⚡';
    default:
      return '📄';
  }
};

/**
 * Get label for evidence type
 */
const getEvidenceLabel = (type: EvidenceType): string => {
  switch (type) {
    case 'experience':
      return 'Experience';
    case 'project':
      return 'Project';
    case 'skill':
      return 'Skill';
    default:
      return 'Reference';
  }
};

interface EvidenceItemProps {
  evidence: Evidence;
}

/**
 * Individual evidence item component
 */
const EvidenceItem: React.FC<EvidenceItemProps> = ({ evidence }) => {
  return (
    <div
      className="flex items-start gap-2 p-2 bg-[var(--surface-elevated)] rounded-md text-sm"
      data-testid="evidence-item"
    >
      <span className="flex-shrink-0" aria-hidden="true">
        {getEvidenceIcon(evidence.type)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[var(--foreground)]">{evidence.title}</span>
          <span className="text-xs px-1.5 py-0.5 bg-[var(--surface)] rounded text-[var(--foreground-muted)]">
            {getEvidenceLabel(evidence.type)}
          </span>
        </div>
        <p className="text-[var(--foreground-muted)] mt-1 italic">&ldquo;{evidence.excerpt}&rdquo;</p>
      </div>
    </div>
  );
};

interface AlignmentItemProps {
  alignment: AlignmentArea;
}

/**
 * Individual alignment area component
 */
const AlignmentItem: React.FC<AlignmentItemProps> = ({ alignment }) => {
  return (
    <li
      className="border border-[var(--success)]/30 rounded-lg p-4 bg-[var(--success)]/10"
      data-testid="alignment-item"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[var(--success)]/20 rounded-full text-[var(--success)]"
          aria-hidden="true"
        >
          ✓
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[var(--foreground)]">{alignment.title}</h4>
          <p className="text-[var(--foreground-muted)] mt-1">{alignment.description}</p>

          {alignment.evidence.length > 0 && (
            <div className="mt-3 space-y-2">
              <h5 className="text-sm font-medium text-[var(--foreground-muted)]">
                Supporting Evidence ({alignment.evidence.length})
              </h5>
              <div className="space-y-2">
                {alignment.evidence.map((evidence, index) => (
                  <EvidenceItem
                    key={`${evidence.reference}-${index}`}
                    evidence={evidence}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

/**
 * AlignmentList displays areas where experience aligns with job requirements
 */
export const AlignmentList: React.FC<AlignmentListProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div
        className="text-[var(--foreground-muted)] text-center py-4"
        data-testid="alignment-list-empty"
      >
        No specific alignment areas identified.
      </div>
    );
  }

  return (
    <section aria-labelledby="alignment-heading" data-testid="alignment-list">
      <h3
        id="alignment-heading"
        className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2"
      >
        <span className="text-[var(--success)]" aria-hidden="true">
          ✓
        </span>
        Strong Alignment Areas ({items.length})
      </h3>
      <ul className="space-y-3" role="list">
        {items.map((alignment) => (
          <AlignmentItem key={alignment.id} alignment={alignment} />
        ))}
      </ul>
    </section>
  );
};

export default AlignmentList;
