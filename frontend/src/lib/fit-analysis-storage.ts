/**
 * Fit Analysis Session Storage Utilities
 *
 * Handles persistence of analysis history to sessionStorage.
 * History is capped at 5 items.
 *
 * @see Requirements 5.1, 5.2, 5.4, 5.5
 */

import {
  MatchAssessment,
  SerializedAnalysisItem,
  StoredFitAnalysisSession,
  FIT_ANALYSIS_STORAGE_KEY,
  MAX_HISTORY_ITEMS,
} from '@/types/fit-analysis';

/**
 * Check if sessionStorage is available
 */
const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Serialize a MatchAssessment for storage
 */
const serializeAssessment = (assessment: MatchAssessment): SerializedAnalysisItem => ({
  id: assessment.id,
  timestamp: assessment.timestamp.toISOString(),
  jobDescriptionPreview: assessment.jobDescriptionPreview,
  jobDescriptionFull: assessment.jobDescriptionPreview, // Use preview as full for storage
  confidenceScore: assessment.confidenceScore,
  alignmentAreas: assessment.alignmentAreas,
  gapAreas: assessment.gapAreas,
  recommendation: assessment.recommendation,
});

/**
 * Deserialize a stored item back to MatchAssessment
 */
const deserializeAssessment = (item: SerializedAnalysisItem): MatchAssessment => ({
  id: item.id,
  timestamp: new Date(item.timestamp),
  jobDescriptionPreview: item.jobDescriptionPreview,
  confidenceScore: item.confidenceScore,
  alignmentAreas: item.alignmentAreas,
  gapAreas: item.gapAreas,
  recommendation: item.recommendation,
});

/**
 * Save an analysis to session storage
 * Adds to the beginning of history and caps at MAX_HISTORY_ITEMS
 *
 * @param assessment - The assessment to save
 * @returns true if saved successfully, false otherwise
 */
export const saveAnalysis = (assessment: MatchAssessment): boolean => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const existing = loadSession();
    const serialized = serializeAssessment(assessment);

    // Add new item at the beginning
    const updatedHistory = [serialized, ...existing.analysisHistory];

    // Cap at MAX_HISTORY_ITEMS
    const cappedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

    const session: StoredFitAnalysisSession = {
      analysisHistory: cappedHistory,
      lastUpdated: new Date().toISOString(),
    };

    sessionStorage.setItem(FIT_ANALYSIS_STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
};

/**
 * Load the session from storage
 */
const loadSession = (): StoredFitAnalysisSession => {
  if (!isStorageAvailable()) {
    return { analysisHistory: [], lastUpdated: new Date().toISOString() };
  }

  try {
    const stored = sessionStorage.getItem(FIT_ANALYSIS_STORAGE_KEY);
    if (!stored) {
      return { analysisHistory: [], lastUpdated: new Date().toISOString() };
    }

    const parsed = JSON.parse(stored) as StoredFitAnalysisSession;
    return parsed;
  } catch {
    return { analysisHistory: [], lastUpdated: new Date().toISOString() };
  }
};

/**
 * Load analysis history from session storage
 *
 * @returns Array of MatchAssessment items, ordered by timestamp descending
 */
export const loadHistory = (): MatchAssessment[] => {
  const session = loadSession();
  return session.analysisHistory.map(deserializeAssessment);
};

/**
 * Load a specific analysis by ID
 *
 * @param id - The ID of the analysis to load
 * @returns The MatchAssessment if found, null otherwise
 */
export const loadAnalysisById = (id: string): MatchAssessment | null => {
  const history = loadHistory();
  return history.find((item) => item.id === id) || null;
};

/**
 * Clear all analysis history from session storage
 *
 * @returns true if cleared successfully, false otherwise
 */
export const clearHistory = (): boolean => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    sessionStorage.removeItem(FIT_ANALYSIS_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get the count of items in history
 *
 * @returns Number of items in history
 */
export const getHistoryCount = (): number => {
  const session = loadSession();
  return session.analysisHistory.length;
};

/**
 * Check if storage is available
 *
 * @returns true if sessionStorage is available
 */
export const isHistoryAvailable = (): boolean => {
  return isStorageAvailable();
};
