'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Experience, ExperienceDepth as ExperienceDepthType, Decision, Outcome } from '@/types/content';
import { Expandable } from './Expandable';
import { useExpandable } from '@/hooks/useExpandable';
import { useScrollAnimation } from '@/hooks';

/**
 * Format a date range for display.
 * 
 * @param startDate - ISO date string for start date
 * @param endDate - ISO date string for end date, or null for current position
 * @returns Formatted date range string (e.g., "Jan 2020 - Present")
 */
export function formatDateRange(startDate: string, endDate: string | null): string {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : 'Present';

  return `${start} - ${end}`;
}

/**
 * Props for the ExperienceSummary component
 */
interface ExperienceSummaryProps {
  /** The experience data to display */
  experience: Experience;
  /** Whether the item is currently expanded */
  isExpanded: boolean;
}

/**
 * ExperienceSummary component - displays the summary layer for an experience entry.
 * 
 * Features:
 * - Role title prominently displayed
 * - Company name and location
 * - Date range (start - end or "Present")
 * - 2-3 key achievement highlights
 * - Expand/collapse indicator
 * 
 * **Validates: Requirement 2.2**
 * - 2.2: THE Summary_Layer for Experience SHALL display a timeline with role titles, company names, and date ranges
 * 
 * @example
 * ```tsx
 * <ExperienceSummary experience={experience} isExpanded={false} />
 * ```
 */
export function ExperienceSummary({ experience, isExpanded }: ExperienceSummaryProps) {
  const { role, company, location, startDate, endDate, summary, highlights } = experience;
  const dateRange = formatDateRange(startDate, endDate);

  return (
    <div className="w-full py-4 px-4 hover:bg-[var(--surface-elevated)] transition-colors duration-200 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
        {/* Left side: Role and company info */}
        <div className="flex-1 min-w-0">
          {/* Role title - prominent display */}
          <h3 className="text-lg md:text-xl font-semibold text-foreground">
            {role}
          </h3>
          
          {/* Company and location */}
          <p className="text-base text-[var(--foreground)] mt-1">
            <span className="font-medium">{company}</span>
            {location && (
              <span className="text-[var(--foreground-muted)]"> · {location}</span>
            )}
          </p>
          
          {/* One-line summary */}
          {summary && (
            <p className="text-sm text-[var(--foreground-muted)] mt-2">
              {summary}
            </p>
          )}
          
          {/* Key highlights */}
          {highlights && highlights.length > 0 && (
            <ul className="mt-3 space-y-1">
              {highlights.map((highlight, index) => (
                <li
                  key={index}
                  className="text-sm text-[var(--foreground-muted)] flex items-start gap-2"
                >
                  <span className="text-[var(--foreground-subtle)] mt-1 flex-shrink-0">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right side: Date range and expand indicator */}
        <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-2">
          {/* Date range */}
          <span className="text-sm text-[var(--foreground-muted)] whitespace-nowrap">
            {dateRange}
          </span>
          
          {/* Expand/collapse indicator */}
          <span
            className={`
              inline-flex items-center justify-center
              w-6 h-6 rounded-full
              bg-[var(--surface-elevated)] text-[var(--foreground-muted)]
              transition-transform duration-200
              ${isExpanded ? 'rotate-180' : ''}
            `}
            aria-hidden="true"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}


/**
 * Props for the DecisionCard component
 */
interface DecisionCardProps {
  /** The decision data to display */
  decision: Decision;
}

/**
 * DecisionCard component - displays a decision with its context and rationale.
 */
function DecisionCard({ decision }: DecisionCardProps) {
  const { title, situation, options, chosen, rationale } = decision;

  return (
    <div className="bg-[var(--surface-elevated)] rounded-lg p-4">
      <h5 className="font-medium text-foreground mb-2">{title}</h5>
      
      {situation && (
        <p className="text-sm text-[var(--foreground-muted)] mb-3">{situation}</p>
      )}
      
      {options && options.length > 0 && (
        <div className="mb-3">
          <span className="text-xs font-medium text-[var(--foreground-subtle)] uppercase tracking-wide">
            Options Considered:
          </span>
          <ul className="mt-1 space-y-1">
            {options.map((option, index) => (
              <li
                key={index}
                className={`text-sm flex items-start gap-2 ${
                  option === chosen ? 'text-foreground font-medium' : 'text-[var(--foreground-muted)]'
                }`}
              >
                <span className={option === chosen ? 'text-[var(--success)]' : 'text-[var(--foreground-subtle)]'}>
                  {option === chosen ? '✓' : '○'}
                </span>
                <span>{option}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {rationale && (
        <div>
          <span className="text-xs font-medium text-[var(--foreground-subtle)] uppercase tracking-wide">
            Rationale:
          </span>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">{rationale}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Props for the OutcomeCard component
 */
interface OutcomeCardProps {
  /** The outcome data to display */
  outcome: Outcome;
}

/**
 * OutcomeCard component - displays a quantified outcome/result.
 */
function OutcomeCard({ outcome }: OutcomeCardProps) {
  const { metric, value, context } = outcome;

  return (
    <div className="bg-[var(--primary-950)] rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-[var(--primary-400)] mb-1">{value}</div>
      <div className="text-sm font-medium text-[var(--foreground)]">{metric}</div>
      {context && (
        <div className="text-xs text-[var(--foreground-muted)] mt-1">{context}</div>
      )}
    </div>
  );
}

/**
 * Props for the ExperienceDepth component
 */
interface ExperienceDepthProps {
  /** The depth layer data to display */
  depth: ExperienceDepthType;
}

/**
 * ExperienceDepth component - displays the depth layer for an experience entry.
 * 
 * Features:
 * - Background context explaining the situation
 * - Key challenges faced during the role
 * - Decisions made with rationale
 * - Quantified outcomes/results
 * - Lessons learned
 * 
 * **Validates: Requirement 3.2**
 * - 3.2: THE Depth_Layer for Experience entries SHALL include: background context, key challenges faced, decisions made, and lessons learned
 * 
 * @example
 * ```tsx
 * <ExperienceDepth depth={experience.depth} />
 * ```
 */
export function ExperienceDepth({ depth }: ExperienceDepthProps) {
  const { context, challenges, decisions, outcomes, lessons } = depth;

  return (
    <div className="px-4 pb-4 pt-2 space-y-6 border-t border-[var(--border)]">
      {/* Background context */}
      {context && (
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-2">
            Background
          </h4>
          <p className="text-[var(--foreground-muted)] leading-relaxed">{context}</p>
        </div>
      )}

      {/* Key challenges */}
      {challenges && challenges.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-2">
            Key Challenges
          </h4>
          <ul className="space-y-2">
            {challenges.map((challenge, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-[var(--foreground-muted)]"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--secondary-900)] text-[var(--secondary-400)] flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span>{challenge}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Decisions made */}
      {decisions && decisions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-3">
            Key Decisions
          </h4>
          <div className="space-y-3">
            {decisions.map((decision, index) => (
              <DecisionCard key={index} decision={decision} />
            ))}
          </div>
        </div>
      )}

      {/* Quantified outcomes */}
      {outcomes && outcomes.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-3">
            Results
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {outcomes.map((outcome, index) => (
              <OutcomeCard key={index} outcome={outcome} />
            ))}
          </div>
        </div>
      )}

      {/* Lessons learned */}
      {lessons && lessons.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-2">
            Lessons Learned
          </h4>
          <ul className="space-y-2">
            {lessons.map((lesson, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-[var(--foreground-muted)]"
              >
                <span className="flex-shrink-0 text-[var(--success)] mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </span>
                <span>{lesson}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


/**
 * Props for the ExperienceItem component
 */
export interface ExperienceItemProps {
  /** The experience data to display */
  experience: Experience;
  /** Whether the item is currently expanded */
  isExpanded: boolean;
  /** Callback to toggle expanded state */
  onToggle: () => void;
}

/**
 * ExperienceItem component - displays a single experience entry with expandable depth layer.
 * 
 * Features:
 * - Summary layer with role, company, dates, and highlights (always visible)
 * - Depth layer with context, challenges, decisions, outcomes, lessons (expandable)
 * - Accessible expand/collapse behavior via Expandable component
 * - Keyboard navigation support (Enter/Space to toggle)
 * - Smooth animation on expand/collapse
 * 
 * **Validates: Requirements 2.2, 3.2**
 * - 2.2: THE Summary_Layer for Experience SHALL display a timeline with role titles, company names, and date ranges
 * - 3.2: THE Depth_Layer for Experience entries SHALL include: background context, key challenges faced, decisions made, and lessons learned
 * 
 * @example
 * ```tsx
 * const { isExpanded, toggle } = useExpandable();
 * 
 * <ExperienceItem
 *   experience={experience}
 *   isExpanded={isExpanded(experience.id)}
 *   onToggle={() => toggle(experience.id)}
 * />
 * ```
 */
export function ExperienceItem({ experience, isExpanded, onToggle }: ExperienceItemProps) {
  return (
    <div id={`experience-${experience.id}`}>
      <Expandable
        id={experience.id}
        isExpanded={isExpanded}
        onToggle={onToggle}
        summaryContent={
          <ExperienceSummary experience={experience} isExpanded={isExpanded} />
        }
        depthContent={
          <ExperienceDepth depth={experience.depth} />
        }
        ariaLabel={`${experience.role} at ${experience.company}`}
        className="border border-[var(--border)] bg-[var(--surface)] rounded-lg overflow-hidden mb-4 last:mb-0 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        buttonClassName="hover:bg-[var(--surface-elevated)]"
      />
    </div>
  );
}

/**
 * Minimum number of items required to show filter controls.
 * Per Requirement 4.5: filtering shown when section contains more than 5 items.
 */
const FILTER_THRESHOLD = 5;

/**
 * Default number of experiences to show initially.
 * Users can expand to see more.
 * Shows ~14 years of experience (AWS + Microsoft roles).
 */
const DEFAULT_VISIBLE_COUNT = 8;

/**
 * Props for the ExperienceFilter component
 */
interface ExperienceFilterProps {
  /** List of unique company names to filter by */
  companies: string[];
  /** Currently selected company filter (empty string = show all) */
  selectedCompany: string;
  /** Callback when filter selection changes */
  onFilterChange: (company: string) => void;
}

/**
 * ExperienceFilter component - displays filter controls for experience entries.
 * 
 * Features:
 * - Dropdown to filter by company
 * - "All Companies" option to show all entries
 * - Only shown when there are more than 5 experience entries
 * 
 * **Validates: Requirement 4.5**
 * - 4.5: WHEN a Content_Section contains more than 5 items, THE Content_Architecture SHALL provide filtering or categorization options
 * 
 * @example
 * ```tsx
 * <ExperienceFilter
 *   companies={['Tech Corp', 'Startup Inc']}
 *   selectedCompany=""
 *   onFilterChange={(company) => setFilter(company)}
 * />
 * ```
 */
export function ExperienceFilter({ companies, selectedCompany, onFilterChange }: ExperienceFilterProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <label htmlFor="experience-filter" className="text-sm font-medium text-[var(--foreground-muted)]">
        Filter by company:
      </label>
      <select
        id="experience-filter"
        value={selectedCompany}
        onChange={(e) => onFilterChange(e.target.value)}
        className="
          px-3 py-2 text-sm
          min-h-[44px]
          border border-[var(--border)] rounded-lg
          bg-[var(--surface)] text-[var(--foreground)]
          focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]
          cursor-pointer
          min-w-[180px]
        "
        aria-label="Filter experiences by company"
      >
        <option value="">All Companies</option>
        {companies.map((company) => (
          <option key={company} value={company}>
            {company}
          </option>
        ))}
      </select>
      {selectedCompany && (
        <button
          type="button"
          onClick={() => onFilterChange('')}
          className="
            px-3 py-2 text-sm
            min-h-[44px] min-w-[44px]
            text-[var(--foreground-muted)] hover:text-[var(--foreground)]
            hover:bg-[var(--surface-elevated)] rounded-lg
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)]
          "
          aria-label="Clear filter"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}

/**
 * Props for the ExperienceSection component
 */
export interface ExperienceSectionProps {
  /** Array of experience entries to display */
  experiences: Experience[];
  /** Additional CSS classes for the section */
  className?: string;
  /** Number of experiences to show initially (default: 6) */
  initialVisibleCount?: number;
}

/**
 * ExperienceSection component - displays the Experience section with a timeline of roles.
 * 
 * Features:
 * - Displays all experience entries in chronological order (most recent first)
 * - Each entry has a summary layer (always visible) and depth layer (expandable)
 * - Manages expand/collapse state for all items
 * - Supports multiple items expanded simultaneously
 * - Proper heading hierarchy (h2 for section title)
 * - Responsive layout
 * - Filter by company when more than 5 items
 * - Show more/less button to expand/collapse the list
 * 
 * **Validates: Requirements 2.2, 3.2, 4.5**
 * - 2.2: THE Summary_Layer for Experience SHALL display a timeline with role titles, company names, and date ranges
 * - 3.2: THE Depth_Layer for Experience entries SHALL include: background context, key challenges faced, decisions made, and lessons learned
 * - 4.5: WHEN a Content_Section contains more than 5 items, THE Content_Architecture SHALL provide filtering or categorization options
 * 
 * @example
 * ```tsx
 * const experiences = await getExperiences();
 * <ExperienceSection experiences={experiences} />
 * ```
 */
export function ExperienceSection({ experiences, className = '', initialVisibleCount = DEFAULT_VISIBLE_COUNT }: ExperienceSectionProps) {
  const { isExpanded, toggle } = useExpandable();
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [showAll, setShowAll] = useState(false);
  const { ref, animationStyle } = useScrollAnimation({ triggerOnce: true });

  // Sort experiences by order field (lower order = first)
  const sortedExperiences = useMemo(
    () => [...experiences].sort((a, b) => a.order - b.order),
    [experiences]
  );

  // Extract unique company names for filter options
  const uniqueCompanies = useMemo(
    () => [...new Set(sortedExperiences.map((exp) => exp.company))].sort(),
    [sortedExperiences]
  );

  // Apply filter if selected
  const filteredExperiences = useMemo(
    () =>
      companyFilter
        ? sortedExperiences.filter((exp) => exp.company === companyFilter)
        : sortedExperiences,
    [sortedExperiences, companyFilter]
  );

  // Apply visibility limit (only when not filtering)
  const visibleExperiences = useMemo(() => {
    if (companyFilter || showAll) {
      return filteredExperiences;
    }
    return filteredExperiences.slice(0, initialVisibleCount);
  }, [filteredExperiences, companyFilter, showAll, initialVisibleCount]);

  // Show filter only when there are more than FILTER_THRESHOLD items
  const showFilter = experiences.length > FILTER_THRESHOLD;
  
  // Show expand button when there are more items than initially visible
  const hasMoreItems = !companyFilter && filteredExperiences.length > initialVisibleCount;
  const hiddenCount = filteredExperiences.length - initialVisibleCount;

  // Ref for the show more/less button to scroll to after collapsing
  const showMoreButtonRef = useRef<HTMLButtonElement>(null);

  // Handle hash-based navigation to specific experiences
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#experience-')) return;
      
      const experienceId = hash.replace('#experience-', '');
      const experienceIndex = sortedExperiences.findIndex(exp => exp.id === experienceId);
      
      if (experienceIndex === -1) return;
      
      // If the experience is in the hidden part, expand the list
      if (experienceIndex >= initialVisibleCount && !showAll) {
        setShowAll(true);
      }
      
      // Scroll to the element after a short delay to allow DOM update
      setTimeout(() => {
        const element = document.getElementById(`experience-${experienceId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    };

    // Handle initial load
    handleHashNavigation();
    
    // Handle hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    return () => window.removeEventListener('hashchange', handleHashNavigation);
  }, [sortedExperiences, initialVisibleCount, showAll]);

  // Handle show more/less toggle with scroll behavior
  const handleToggleShowAll = () => {
    if (showAll) {
      // When collapsing, scroll to the button's new position
      setShowAll(false);
      setTimeout(() => {
        showMoreButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setShowAll(true);
    }
  };

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className={`py-12 md:py-16 lg:py-20 ${className}`}
    >
      <div ref={ref} style={animationStyle} className="max-w-4xl mx-auto">
        {/* Section heading - h2 for proper hierarchy under page h1 */}
        <h2
          id="experience-heading"
          className="text-3xl md:text-4xl font-bold text-foreground mb-8"
        >
          Experience
        </h2>

        {/* Filter controls - shown only when more than 5 items */}
        {showFilter && (
          <ExperienceFilter
            companies={uniqueCompanies}
            selectedCompany={companyFilter}
            onFilterChange={setCompanyFilter}
          />
        )}

        {/* Experience timeline */}
        {visibleExperiences.length > 0 ? (
          <div className="space-y-4">
            {visibleExperiences.map((experience) => (
              <ExperienceItem
                key={experience.id}
                experience={experience}
                isExpanded={isExpanded(experience.id)}
                onToggle={() => toggle(experience.id)}
              />
            ))}
          </div>
        ) : companyFilter ? (
          <p className="text-[var(--foreground-muted)] text-center py-8">
            No experience entries found for &quot;{companyFilter}&quot;.
          </p>
        ) : (
          <p className="text-[var(--foreground-muted)] text-center py-8">
            No experience entries available.
          </p>
        )}

        {/* Show more/less button */}
        {hasMoreItems && (
          <div className="mt-6 text-center">
            <button
              ref={showMoreButtonRef}
              type="button"
              onClick={handleToggleShowAll}
              className="
                inline-flex items-center gap-2
                px-6 py-3
                min-h-[44px]
                text-sm font-medium
                text-[var(--primary-400)] hover:text-[var(--primary-300)]
                bg-[var(--surface-elevated)] hover:bg-[var(--surface)]
                border border-[var(--border)] hover:border-[var(--primary-500)]
                rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)]
              "
              aria-expanded={showAll}
              aria-controls="experience-list"
            >
              {showAll ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  Show Less
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  Show {hiddenCount} More Experience{hiddenCount !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ExperienceSection;
