/**
 * HistoryPanel Component
 *
 * Displays list of recent analyses with preview and confidence.
 * Allows loading previous results.
 *
 * @see Requirements 5.2, 5.3, 5.5
 */

import React, { useState } from 'react';
import {
  AnalysisHistoryItem,
  CONFIDENCE_DISPLAY,
  MAX_HISTORY_ITEMS,
} from '@/types/fit-analysis';

export interface HistoryPanelProps {
  /** List of history items to display */
  items: AnalysisHistoryItem[];
  /** Callback when a history item is selected */
  onSelectItem: (id: string) => void;
  /** Callback when history is cleared */
  onClearHistory: () => void;
  /** Whether the panel is initially expanded */
  defaultExpanded?: boolean;
}

interface HistoryItemProps {
  item: AnalysisHistoryItem;
  onSelect: (id: string) => void;
}

/**
 * Individual history item component
 */
const HistoryItem: React.FC<HistoryItemProps> = ({ item, onSelect }) => {
  const confidenceDisplay = CONFIDENCE_DISPLAY[item.confidenceScore];

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <button
      onClick={() => onSelect(item.id)}
      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      data-testid="history-item"
      aria-label={`Load analysis from ${formatDate(item.timestamp)}: ${item.jobDescriptionPreview.substring(0, 50)}...`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate">
            {item.jobDescriptionPreview}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(item.timestamp)}
          </p>
        </div>
        <div className="flex-shrink-0">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              item.confidenceScore === 'strong_match'
                ? 'bg-green-100 text-green-800'
                : item.confidenceScore === 'partial_match'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
            data-testid="history-item-confidence"
          >
            <span aria-hidden="true">
              {item.confidenceScore === 'strong_match'
                ? '✓'
                : item.confidenceScore === 'partial_match'
                ? '◐'
                : '✗'}
            </span>
            {confidenceDisplay.label}
          </span>
        </div>
      </div>
    </button>
  );
};

/**
 * HistoryPanel displays recent analyses and allows loading them
 */
export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  items,
  onSelectItem,
  onClearHistory,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="border border-gray-200 rounded-lg overflow-hidden"
      data-testid="history-panel"
    >
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-expanded={isExpanded}
        aria-controls="history-content"
        data-testid="history-toggle"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-600" aria-hidden="true">
            📋
          </span>
          <span className="font-medium text-gray-900">
            Recent Analyses ({items.length}/{MAX_HISTORY_ITEMS})
          </span>
        </div>
        <span
          className={`text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div
          id="history-content"
          className="p-4"
          data-testid="history-content"
        >
          {items.length === 0 ? (
            <p
              className="text-gray-500 text-center py-4"
              data-testid="history-empty"
            >
              No previous analyses yet. Your analysis history will appear here.
            </p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onSelect={onSelectItem}
                  />
                ))}
              </div>
              <button
                onClick={onClearHistory}
                className="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                data-testid="clear-history-button"
              >
                Clear History
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
