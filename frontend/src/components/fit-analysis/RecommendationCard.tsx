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
        border: 'border-green-300',
        bg: 'bg-green-50',
        headerBg: 'bg-green-100',
        headerText: 'text-green-800',
      };
    case 'consider':
      return {
        border: 'border-yellow-300',
        bg: 'bg-yellow-50',
        headerBg: 'bg-yellow-100',
        headerText: 'text-yellow-800',
      };
    case 'reconsider':
      return {
        border: 'border-red-300',
        bg: 'bg-red-50',
        headerBg: 'bg-red-100',
        headerText: 'text-red-800',
      };
    default:
      return {
        border: 'border-gray-300',
        bg: 'bg-gray-50',
        headerBg: 'bg-gray-100',
        headerText: 'text-gray-800',
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
          className="text-lg font-medium text-gray-900 mb-2"
          data-testid="recommendation-summary"
        >
          {recommendation.summary}
        </p>
        <p
          className="text-gray-700"
          data-testid="recommendation-details"
        >
          {recommendation.details}
        </p>
      </div>
    </section>
  );
};

export default RecommendationCard;
