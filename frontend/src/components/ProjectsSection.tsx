'use client';

import { useState, useMemo } from 'react';
import type { Project, ProjectDepth as ProjectDepthType, ProjectLink, Tradeoff, Outcome } from '@/types/content';
import { Expandable } from './Expandable';
import { useExpandable } from '@/hooks/useExpandable';
import { useScrollAnimation } from '@/hooks';

/**
 * Get the icon for a project link type.
 * 
 * @param type - The type of project link
 * @returns SVG icon element
 */
function getLinkIcon(type: ProjectLink['type']): React.ReactNode {
  switch (type) {
    case 'live':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      );
    case 'github':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
      );
    case 'case-study':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Props for the ProjectSummary component
 */
interface ProjectSummaryProps {
  /** The project data to display */
  project: Project;
  /** Whether the item is currently expanded */
  isExpanded: boolean;
}

/**
 * ProjectSummary component - displays the summary layer for a project entry.
 * 
 * Features:
 * - Project title prominently displayed
 * - Brief description (under 50 words)
 * - Technology tags
 * - Project links (live, GitHub, case study)
 * - Expand/collapse indicator
 * 
 * **Validates: Requirement 2.3**
 * - 2.3: THE Summary_Layer for Projects SHALL display project titles, brief descriptions (under 50 words), and key technologies used
 * 
 * @example
 * ```tsx
 * <ProjectSummary project={project} isExpanded={false} />
 * ```
 */
export function ProjectSummary({ project, isExpanded }: ProjectSummaryProps) {
  const { title, description, technologies, links } = project;

  return (
    <div className="w-full py-4 px-4 hover:bg-[var(--surface-elevated)] transition-colors duration-200 rounded-lg">
      <div className="flex flex-col gap-3">
        {/* Header: Title and expand indicator */}
        <div className="flex items-start justify-between gap-4">
          {/* Project title */}
          <h3 className="text-lg md:text-xl font-semibold text-foreground">
            {title}
          </h3>
          
          {/* Expand/collapse indicator */}
          <span
            className={`
              inline-flex items-center justify-center
              w-6 h-6 rounded-full flex-shrink-0
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

        {/* Description */}
        <p className="text-sm md:text-base text-[var(--foreground-muted)] leading-relaxed">
          {description}
        </p>

        {/* Technologies */}
        {technologies && technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary-900)] text-[var(--primary-300)]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Project links */}
        {links && links.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-1">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.label} for ${title} (opens in new tab)`}
                className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--primary-400)] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {getLinkIcon(link.type)}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Props for the TradeoffCard component
 */
interface TradeoffCardProps {
  /** The tradeoff data to display */
  tradeoff: Tradeoff;
}

/**
 * TradeoffCard component - displays a trade-off with alternatives and reasoning.
 */
function TradeoffCard({ tradeoff }: TradeoffCardProps) {
  const { decision, alternatives, reasoning } = tradeoff;

  return (
    <div className="bg-[var(--surface-elevated)] rounded-lg p-4">
      <h5 className="font-medium text-foreground mb-2">{decision}</h5>
      
      {alternatives && alternatives.length > 0 && (
        <div className="mb-3">
          <span className="text-xs font-medium text-[var(--foreground-subtle)] uppercase tracking-wide">
            Alternatives Considered:
          </span>
          <ul className="mt-1 space-y-1">
            {alternatives.map((alt, index) => (
              <li
                key={index}
                className="text-sm text-[var(--foreground-muted)] flex items-start gap-2"
              >
                <span className="text-[var(--foreground-subtle)]">○</span>
                <span>{alt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {reasoning && (
        <div>
          <span className="text-xs font-medium text-[var(--foreground-subtle)] uppercase tracking-wide">
            Reasoning:
          </span>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">{reasoning}</p>
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
    <div className="bg-[var(--success)]/10 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-[var(--success)] mb-1">{value}</div>
      <div className="text-sm font-medium text-[var(--foreground)]">{metric}</div>
      {context && (
        <div className="text-xs text-[var(--foreground-muted)] mt-1">{context}</div>
      )}
    </div>
  );
}

/**
 * Props for the ProjectDepth component
 */
interface ProjectDepthProps {
  /** The depth layer data to display */
  depth: ProjectDepthType;
}

/**
 * ProjectDepth component - displays the depth layer for a project entry.
 * 
 * Features:
 * - Problem statement explaining what was being solved
 * - Approach taken to solve the problem
 * - Trade-offs considered with alternatives and reasoning
 * - Quantified outcomes/results
 * - Reflections on what would be done differently
 * 
 * **Validates: Requirement 3.3**
 * - 3.3: THE Depth_Layer for Projects SHALL include: problem statement, approach taken, trade-offs considered, quantified outcomes, and reflections
 * 
 * @example
 * ```tsx
 * <ProjectDepth depth={project.depth} />
 * ```
 */
export function ProjectDepth({ depth }: ProjectDepthProps) {
  const { problem, approach, tradeoffs, outcomes, reflections } = depth;

  return (
    <div className="px-4 pb-4 pt-2 space-y-6 border-t border-[var(--border)]">
      {/* Problem statement */}
      {problem && (
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-2">
            The Problem
          </h4>
          <p className="text-[var(--foreground-muted)] leading-relaxed">{problem}</p>
        </div>
      )}

      {/* Approach taken */}
      {approach && (
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-2">
            Approach
          </h4>
          <p className="text-[var(--foreground-muted)] leading-relaxed">{approach}</p>
        </div>
      )}

      {/* Trade-offs considered */}
      {tradeoffs && tradeoffs.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-3">
            Trade-offs Considered
          </h4>
          <div className="space-y-3">
            {tradeoffs.map((tradeoff, index) => (
              <TradeoffCard key={index} tradeoff={tradeoff} />
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

      {/* Reflections */}
      {reflections && (
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-2">
            Reflections
          </h4>
          <div className="flex items-start gap-3 text-[var(--foreground-muted)]">
            <span className="flex-shrink-0 text-[var(--primary-400)] mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </span>
            <p className="leading-relaxed">{reflections}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Props for the ProjectCard component
 */
export interface ProjectCardProps {
  /** The project data to display */
  project: Project;
  /** Whether the item is currently expanded */
  isExpanded: boolean;
  /** Callback to toggle expanded state */
  onToggle: () => void;
}

/**
 * ProjectCard component - displays a single project entry with expandable depth layer.
 * 
 * Features:
 * - Summary layer with title, description, technologies, and links (always visible)
 * - Depth layer with problem, approach, tradeoffs, outcomes, reflections (expandable)
 * - Accessible expand/collapse behavior via Expandable component
 * - Keyboard navigation support (Enter/Space to toggle)
 * - Smooth animation on expand/collapse
 * 
 * **Validates: Requirements 2.3, 3.3**
 * - 2.3: THE Summary_Layer for Projects SHALL display project titles, brief descriptions (under 50 words), and key technologies used
 * - 3.3: THE Depth_Layer for Projects SHALL include: problem statement, approach taken, trade-offs considered, quantified outcomes, and reflections
 * 
 * @example
 * ```tsx
 * const { isExpanded, toggle } = useExpandable();
 * 
 * <ProjectCard
 *   project={project}
 *   isExpanded={isExpanded(project.id)}
 *   onToggle={() => toggle(project.id)}
 * />
 * ```
 */
export function ProjectCard({ project, isExpanded, onToggle }: ProjectCardProps) {
  return (
    <Expandable
      id={project.id}
      isExpanded={isExpanded}
      onToggle={onToggle}
      summaryContent={
        <ProjectSummary project={project} isExpanded={isExpanded} />
      }
      depthContent={
        <ProjectDepth depth={project.depth} />
      }
      ariaLabel={`Project: ${project.title}`}
      className="border border-[var(--border)] bg-[var(--surface)] rounded-lg overflow-hidden mb-4 last:mb-0 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      buttonClassName="hover:bg-[var(--surface-elevated)]"
    />
  );
}

/**
 * Minimum number of items required to show filter controls.
 * Per Requirement 4.5: filtering shown when section contains more than 5 items.
 */
const FILTER_THRESHOLD = 5;

/**
 * Props for the TechnologyFilter component
 */
interface TechnologyFilterProps {
  /** List of unique technologies to filter by */
  technologies: string[];
  /** Currently selected technology filter (empty string = show all) */
  selectedTechnology: string;
  /** Callback when filter selection changes */
  onFilterChange: (technology: string) => void;
}

/**
 * TechnologyFilter component - displays filter controls for project entries.
 * 
 * Features:
 * - Dropdown to filter by technology
 * - "All Technologies" option to show all entries
 * - Only shown when there are more than 5 project entries
 * 
 * **Validates: Requirement 4.5**
 * - 4.5: WHEN a Content_Section contains more than 5 items, THE Content_Architecture SHALL provide filtering or categorization options
 * 
 * @example
 * ```tsx
 * <TechnologyFilter
 *   technologies={['React', 'TypeScript', 'Python']}
 *   selectedTechnology=""
 *   onFilterChange={(tech) => setFilter(tech)}
 * />
 * ```
 */
export function TechnologyFilter({ technologies, selectedTechnology, onFilterChange }: TechnologyFilterProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <label htmlFor="technology-filter" className="text-sm font-medium text-[var(--foreground-muted)]">
        Filter by technology:
      </label>
      <select
        id="technology-filter"
        value={selectedTechnology}
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
        aria-label="Filter projects by technology"
      >
        <option value="">All Technologies</option>
        {technologies.map((tech) => (
          <option key={tech} value={tech}>
            {tech}
          </option>
        ))}
      </select>
      {selectedTechnology && (
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
 * Props for the ProjectsSection component
 */
export interface ProjectsSectionProps {
  /** Array of project entries to display */
  projects: Project[];
  /** Additional CSS classes for the section */
  className?: string;
}

/**
 * ProjectsSection component - displays the Projects section with a grid of project cards.
 * 
 * Features:
 * - Displays all project entries ordered by the order field (most impactful first)
 * - Each entry has a summary layer (always visible) and depth layer (expandable)
 * - Manages expand/collapse state for all items
 * - Supports multiple items expanded simultaneously
 * - Proper heading hierarchy (h2 for section title)
 * - Responsive layout
 * - Filter by technology when more than 5 items
 * 
 * **Validates: Requirements 2.3, 3.3, 4.5**
 * - 2.3: THE Summary_Layer for Projects SHALL display project titles, brief descriptions (under 50 words), and key technologies used
 * - 3.3: THE Depth_Layer for Projects SHALL include: problem statement, approach taken, trade-offs considered, quantified outcomes, and reflections
 * - 4.5: WHEN a Content_Section contains more than 5 items, THE Content_Architecture SHALL provide filtering or categorization options
 * 
 * @example
 * ```tsx
 * const projects = await getProjects();
 * <ProjectsSection projects={projects} />
 * ```
 */
export function ProjectsSection({ projects, className = '' }: ProjectsSectionProps) {
  const { isExpanded, toggle } = useExpandable();
  const [technologyFilter, setTechnologyFilter] = useState<string>('');
  const { ref, animationStyle } = useScrollAnimation({ triggerOnce: true });

  // Sort projects by order field (lower order = first)
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.order - b.order),
    [projects]
  );

  // Extract unique technologies from all projects for filter options
  const uniqueTechnologies = useMemo(
    () => [...new Set(sortedProjects.flatMap((proj) => proj.technologies))].sort(),
    [sortedProjects]
  );

  // Apply filter if selected
  const filteredProjects = useMemo(
    () =>
      technologyFilter
        ? sortedProjects.filter((proj) => proj.technologies.includes(technologyFilter))
        : sortedProjects,
    [sortedProjects, technologyFilter]
  );

  // Show filter only when there are more than FILTER_THRESHOLD items
  const showFilter = projects.length > FILTER_THRESHOLD;

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className={`py-12 md:py-16 lg:py-20 ${className}`}
    >
      <div ref={ref} style={animationStyle} className="max-w-4xl mx-auto">
        {/* Section heading - h2 for proper hierarchy under page h1 */}
        <h2
          id="projects-heading"
          className="text-3xl md:text-4xl font-bold text-foreground mb-8"
        >
          Projects
        </h2>

        {/* Filter controls - shown only when more than 5 items */}
        {showFilter && (
          <TechnologyFilter
            technologies={uniqueTechnologies}
            selectedTechnology={technologyFilter}
            onFilterChange={setTechnologyFilter}
          />
        )}

        {/* Projects grid */}
        {filteredProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isExpanded={isExpanded(project.id)}
                onToggle={() => toggle(project.id)}
              />
            ))}
          </div>
        ) : technologyFilter ? (
          <p className="text-[var(--foreground-muted)] text-center py-8">
            No projects found using &quot;{technologyFilter}&quot;.
          </p>
        ) : (
          <p className="text-[var(--foreground-muted)] text-center py-8">
            No projects available.
          </p>
        )}
      </div>
    </section>
  );
}

export default ProjectsSection;
