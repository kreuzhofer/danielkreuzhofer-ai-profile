'use client';

/**
 * SkillDetailPanel Component
 *
 * A modal panel that displays detailed information about a selected skill,
 * including full context description and all evidence links.
 *
 * Features:
 * - Uses createPortal to render modal to document.body (per workspace guidelines)
 * - Displays full context description (Requirement 3.2)
 * - Displays all evidence links (Requirement 3.2)
 * - Close button dismissal (Requirement 3.4)
 * - Escape key dismissal (Requirement 3.4)
 * - Click-outside dismissal (Requirement 3.4)
 * - Prevents background scrolling on mobile when open (Requirement 3.5)
 * - Focus management: moves focus to panel when opened, returns to trigger when closed (Requirement 3.6)
 * - ARIA live region announcement when panel opens (Requirement 6.3)
 *
 * @see Requirements 3.1, 3.2, 3.4, 3.5, 3.6, 6.3
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Skill, Evidence } from '@/types/transparency-dashboard';
import { TIER_CONFIGS, EVIDENCE_TYPE_DISPLAY } from '@/types/transparency-dashboard';
import { TierBadge, YearsIndicator } from './SkillCard';

// =============================================================================
// Props Interfaces
// =============================================================================

export interface SkillDetailPanelProps {
  /** The skill to display details for */
  skill: Skill;
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback to close the panel */
  onClose: () => void;
  /** Reference to the element that triggered the panel (for focus return) */
  triggerRef?: React.RefObject<HTMLElement> | null;
}

// =============================================================================
// LiveRegion Component
// =============================================================================

export interface LiveRegionProps {
  /** The message to announce */
  message: string;
  /** The politeness level for the announcement */
  politeness?: 'polite' | 'assertive';
}

/**
 * LiveRegion provides ARIA live region announcements for screen readers.
 * Used to announce when the skill detail panel opens.
 *
 * @see Requirement 6.3
 */
export function LiveRegion({ message, politeness = 'polite' }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      data-testid="live-region"
    >
      {message}
    </div>
  );
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

interface EvidenceItemProps {
  evidence: Evidence;
}

/**
 * EvidenceItem displays a single evidence link with type indicator.
 * Internal links (starting with '/') open in the same tab.
 *
 * @see Requirements 3.3, 5.2, 5.3, 5.6
 */
function EvidenceItem({ evidence }: EvidenceItemProps) {
  const { type, title, reference, excerpt } = evidence;
  const typeDisplay = EVIDENCE_TYPE_DISPLAY[type];
  const isInternalLink = reference.startsWith('/');

  return (
    <a
      href={reference}
      className="flex items-start gap-3 p-3 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--primary-900)] transition-colors min-h-[44px]"
      data-testid={`evidence-item-${evidence.id}`}
      // Internal links open in same tab (Requirement 5.6)
      {...(!isInternalLink && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {/* Evidence Type Icon */}
      <span
        className="flex-shrink-0 mt-0.5 text-[var(--foreground-muted)]"
        data-testid={`evidence-type-icon-${evidence.id}`}
      >
        <EvidenceIcon type={type} />
      </span>

      {/* Evidence Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium text-[var(--foreground)]"
            data-testid={`evidence-title-${evidence.id}`}
          >
            {title}
          </span>
          <span
            className="text-xs text-[var(--foreground-muted)] bg-[var(--surface)] px-1.5 py-0.5 rounded"
            data-testid={`evidence-type-${evidence.id}`}
          >
            {typeDisplay.label}
          </span>
        </div>
        {excerpt && (
          <p
            className="text-sm text-[var(--foreground-muted)] mt-1 line-clamp-2"
            data-testid={`evidence-excerpt-${evidence.id}`}
          >
            {excerpt}
          </p>
        )}
      </div>

      {/* External link indicator */}
      {!isInternalLink && (
        <span className="flex-shrink-0 text-[var(--foreground-subtle)]" aria-hidden="true">
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
// SkillDetailPanel Component
// =============================================================================

/**
 * SkillDetailPanel displays detailed information about a selected skill.
 *
 * Uses createPortal to render the modal to document.body to avoid
 * stacking context issues (per workspace modal-rendering.md guidelines).
 *
 * Focus Management (Requirement 3.6):
 * - Moves focus to the close button when panel opens
 * - Returns focus to the triggering SkillCard when panel closes
 *
 * ARIA Live Region (Requirement 6.3):
 * - Announces panel opening to screen readers
 *
 * @example
 * ```tsx
 * <SkillDetailPanel
 *   skill={selectedSkill}
 *   isOpen={isDetailPanelOpen}
 *   onClose={closeDetailPanel}
 *   triggerRef={triggerRef}
 * />
 * ```
 */
export function SkillDetailPanel({ skill, isOpen, onClose, triggerRef }: SkillDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [announcement, setAnnouncement] = useState<string>('');

  // Handle Escape key dismissal (Requirement 3.4)
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  // Handle click outside dismissal (Requirement 3.4)
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Only close if clicking the backdrop itself, not the panel content
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Prevent background scrolling on mobile when open (Requirement 3.5)
  useEffect(() => {
    if (isOpen) {
      // Store original overflow style
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Add escape key listener
      document.addEventListener('keydown', handleKeyDown);

      // Cleanup
      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  // Focus management: focus close button when panel opens (Requirement 3.6)
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // ARIA live region announcement when panel opens (Requirement 6.3)
  useEffect(() => {
    if (isOpen && skill) {
      setAnnouncement(`Skill details for ${skill.name} opened`);
    } else {
      setAnnouncement('');
    }
  }, [isOpen, skill]);

  // Focus return: return focus to trigger element when panel closes (Requirement 3.6)
  useEffect(() => {
    // Store the trigger element when panel opens
    const triggerElement = triggerRef?.current;
    
    return () => {
      // When panel closes (cleanup runs), return focus to trigger
      if (triggerElement && document.body.contains(triggerElement)) {
        // Use setTimeout to ensure focus happens after the panel is removed from DOM
        setTimeout(() => {
          triggerElement.focus();
        }, 0);
      }
    };
  }, [isOpen, triggerRef]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const { name, tier, context, yearsOfExperience, evidence } = skill;
  const tierConfig = TIER_CONFIGS[tier];
  const hasEvidence = evidence && evidence.length > 0;

  // Modal content
  const modalContent = (
    <>
      {/* ARIA Live Region for screen reader announcements (Requirement 6.3) */}
      <LiveRegion message={announcement} politeness="polite" />
      
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={handleBackdropClick}
        data-testid="skill-detail-panel-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-detail-title"
      >
      <div
        ref={panelRef}
        className="bg-[var(--surface)] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col"
        data-testid="skill-detail-panel"
        data-skill-id={skill.id}
      >
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2
              id="skill-detail-title"
              className="text-xl font-semibold text-[var(--foreground)] truncate"
              data-testid="skill-detail-name"
            >
              {name}
            </h2>
            <TierBadge tier={tier} />
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-full hover:bg-[var(--surface-elevated)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
            data-testid="skill-detail-close-button"
          >
            <svg
              className="w-5 h-5 text-[var(--foreground-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Tier Description */}
          <p
            className="text-sm text-[var(--foreground-subtle)] mb-4"
            data-testid="skill-detail-tier-description"
          >
            {tierConfig.description}
          </p>

          {/* Years of Experience */}
          {yearsOfExperience !== undefined && yearsOfExperience > 0 && (
            <div className="mb-4" data-testid="skill-detail-years">
              <YearsIndicator years={yearsOfExperience} />
            </div>
          )}

          {/* Full Context Description (Requirement 3.2) */}
          <div className="mb-6">
            <h3
              className="text-sm font-medium text-[var(--foreground-muted)] mb-2"
              data-testid="skill-detail-context-heading"
            >
              Context
            </h3>
            <p
              className="text-[var(--foreground)]"
              data-testid="skill-detail-context"
            >
              {context}
            </p>
          </div>

          {/* Evidence Links (Requirement 3.2) */}
          {hasEvidence && (
            <div data-testid="skill-detail-evidence-section">
              <h3
                className="text-sm font-medium text-[var(--foreground-muted)] mb-3"
                data-testid="skill-detail-evidence-heading"
              >
                Evidence ({evidence.length})
              </h3>
              <div
                className="space-y-2"
                data-testid="skill-detail-evidence-list"
                role="list"
                aria-label="Evidence links"
              >
                {evidence.map((item) => (
                  <div key={item.id} role="listitem">
                    <EvidenceItem evidence={item} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Evidence Message */}
          {!hasEvidence && tier !== 'explicit_gap' && (
            <div
              className="text-sm text-[var(--foreground-subtle)] italic"
              data-testid="skill-detail-no-evidence"
            >
              {tier === 'working_knowledge'
                ? 'Learning in progress — evidence being documented.'
                : 'No evidence available for this skill.'}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );

  // Use createPortal to render modal to document.body (per workspace guidelines)
  return createPortal(modalContent, document.body);
}

export default SkillDetailPanel;
