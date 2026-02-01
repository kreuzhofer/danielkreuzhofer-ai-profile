/**
 * RecommendationCard Component
 *
 * Displays the honest recommendation based on the analysis,
 * with type indicator and details.
 *
 * @see Requirement 3.6
 */

import React from 'react';
import { Recommendation, RecommendationType, RECOMMENDATION_DISPLAY } from '@/types/fit-analysis';

export interface RecommendationCardProps {
  /** The recommendation to display */
  recommendation: Recommendation;
}

/**
 * Get icon for recommendation type
 */
const getRecommendationIcon = (type: RecommendationType): string => {
  switch (type) {
    case 'proceed':
      return '👍';
    case 'consider':
      return '⚖️';
    case 'reconsider':
      return '⚠️';
    default:
      return '💡';
  }
};

/**
 * Get CSS classes for recommendation type styling
 */
const getRecommendationClasses = (type: RecommendationType): {
  border: string;
  bg: string;
  headerBg: string;
  headerText: string;
} => {
  switch (type) {
    case 'proceed':
      return {
        border: 'border-[var(--success)]/30',
        bg: 'bg-[var(--success)]/10',
        headerBg: 'bg-[var(--success)]/20',
        headerText: 'text-[var(--success)]',
      };
    case 'consider':
      return {
        border: 'border-[var(--warning)]/30',
        bg: 'bg-[var(--warning)]/10',
        headerBg: 'bg-[var(--warning)]/20',
        headerText: 'text-[var(--warning)]',
      };
    case 'reconsider':
      return {
        border: 'border-[var(--error)]/30',
        bg: 'bg-[var(--error)]/10',
        headerBg: 'bg-[var(--error)]/20',
        headerText: 'text-[var(--error)]',
      };
    default:
      return {
        border: 'border-[var(--border)]',
        bg: 'bg-[var(--surface)]',
        headerBg: 'bg-[var(--surface-elevated)]',
        headerText: 'text-[var(--foreground)]',
      };
  }
};

/**
 * RecommendationCard displays the honest recommendation based on analysis
 */
export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
}) => {
  const classes = getRecommendationClasses(recommendation.type);
  const display = RECOMMENDATION_DISPLAY[recommendation.type];

  return (
    <section
      aria-labelledby="recommendation-heading"
      className={`border-2 ${classes.border} rounded-lg overflow-hidden`}
      data-testid="recommendation-card"
      data-type={recommendation.type}
    >
      {/* Header */}
      <div
        className={`${classes.headerBg} px-4 py-3 flex items-center gap-3`}
      >
        <span className="text-2xl" aria-hidden="true">
          {getRecommendationIcon(recommendation.type)}
        </span>
        <div>
          <h3
            id="recommendation-heading"
            className={`font-semibold ${classes.headerText}`}
          >
            {display.label}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className={`${classes.bg} px-4 py-4`}>
        <p
          className="text-lg font-medium text-[var(--foreground)] mb-2"
          data-testid="recommendation-summary"
        >
          {recommendation.summary}
        </p>
        <p
          className="text-[var(--foreground-muted)]"
          data-testid="recommendation-details"
        >
          {recommendation.details}
        </p>
      </div>
    </section>
  );
};

export default RecommendationCard;
