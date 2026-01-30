'use client';

/**
 * Fit Analysis Context Provider
 *
 * Provides state management for the Automated Fit Analysis Module including:
 * - Analysis state (job description, loading, results, errors)
 * - History state (recent analyses, session persistence)
 * - Actions (submit analysis, load history, retry, clear)
 *
 * @see Requirements 2.1, 5.1, 5.2, 5.3, 6.4
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type {
  FitAnalysisContextValue,
  FitAnalysisError,
  FitAnalysisErrorType,
  MatchAssessment,
  AnalysisHistoryItem,
  StoredFitAnalysisSession,
  SerializedAnalysisItem,
  AnalyzeResponse,
} from '@/types/fit-analysis';
import {
  FIT_ANALYSIS_STORAGE_KEY,
  MAX_HISTORY_ITEMS,
} from '@/types/fit-analysis';

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate a unique ID for analyses
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create a preview of the job description (first 100 characters)
 */
function createJobDescriptionPreview(jobDescription: string): string {
  const trimmed = jobDescription.trim();
  if (trimmed.length <= 100) {
    return trimmed;
  }
  return trimmed.substring(0, 100) + '...';
}

/**
 * Serialize an analysis item for storage
 */
function serializeAnalysisItem(
  assessment: MatchAssessment,
  jobDescriptionFull: string
): SerializedAnalysisItem {
  return {
    id: assessment.id,
    timestamp: assessment.timestamp.toISOString(),
    jobDescriptionPreview: assessment.jobDescriptionPreview,
    jobDescriptionFull,
    confidenceScore: assessment.confidenceScore,
    alignmentAreas: assessment.alignmentAreas,
    gapAreas: assessment.gapAreas,
    recommendation: assessment.recommendation,
  };
}

/**
 * Deserialize an analysis item from storage
 */
function deserializeAnalysisItem(serialized: SerializedAnalysisItem): {
  assessment: MatchAssessment;
  jobDescriptionFull: string;
} {
  return {
    assessment: {
      id: serialized.id,
      timestamp: new Date(serialized.timestamp),
      jobDescriptionPreview: serialized.jobDescriptionPreview,
      confidenceScore: serialized.confidenceScore,
      alignmentAreas: serialized.alignmentAreas,
      gapAreas: serialized.gapAreas,
      recommendation: serialized.recommendation,
    },
    jobDescriptionFull: serialized.jobDescriptionFull,
  };
}

/**
 * Create a history item from an assessment
 */
function createHistoryItem(assessment: MatchAssessment): AnalysisHistoryItem {
  return {
    id: assessment.id,
    timestamp: assessment.timestamp,
    jobDescriptionPreview: assessment.jobDescriptionPreview,
    confidenceScore: assessment.confidenceScore,
  };
}

/**
 * Save fit analysis session to session storage
 */
function saveToSessionStorage(
  history: SerializedAnalysisItem[]
): void {
  if (typeof window === 'undefined') return;

  try {
    const session: StoredFitAnalysisSession = {
      analysisHistory: history,
      lastUpdated: new Date().toISOString(),
    };
    sessionStorage.setItem(FIT_ANALYSIS_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.warn('Failed to save fit analysis session to storage:', error);
  }
}

/**
 * Load fit analysis session from session storage
 */
function loadFromSessionStorage(): SerializedAnalysisItem[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(FIT_ANALYSIS_STORAGE_KEY);
    if (!stored) return null;

    const session: StoredFitAnalysisSession = JSON.parse(stored);
    return session.analysisHistory;
  } catch (error) {
    console.warn('Failed to load fit analysis session from storage:', error);
    return null;
  }
}

/**
 * Clear fit analysis session from session storage
 */
function clearSessionStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(FIT_ANALYSIS_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear fit analysis session from storage:', error);
  }
}

// =============================================================================
// State Types
// =============================================================================

interface FitAnalysisState {
  jobDescription: string;
  isAnalyzing: boolean;
  currentResult: MatchAssessment | null;
  analysisHistory: AnalysisHistoryItem[];
  error: FitAnalysisError | null;
  // Internal state for history management
  serializedHistory: SerializedAnalysisItem[];
  lastFailedJobDescription: string | null;
}

// =============================================================================
// Initial State
// =============================================================================

const initialFitAnalysisState: FitAnalysisState = {
  jobDescription: '',
  isAnalyzing: false,
  currentResult: null,
  analysisHistory: [],
  error: null,
  serializedHistory: [],
  lastFailedJobDescription: null,
};

// =============================================================================
// Action Types
// =============================================================================

type FitAnalysisAction =
  | { type: 'SET_JOB_DESCRIPTION'; payload: string }
  | { type: 'START_ANALYSIS' }
  | { type: 'ANALYSIS_SUCCESS'; payload: { assessment: MatchAssessment; jobDescriptionFull: string } }
  | { type: 'ANALYSIS_ERROR'; payload: FitAnalysisError }
  | { type: 'CLEAR_CURRENT_RESULT' }
  | { type: 'LOAD_HISTORY_ITEM'; payload: { assessment: MatchAssessment; jobDescriptionFull: string } }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_SESSION'; payload: SerializedAnalysisItem[] };

// =============================================================================
// Reducer
// =============================================================================

function fitAnalysisReducer(
  state: FitAnalysisState,
  action: FitAnalysisAction
): FitAnalysisState {
  switch (action.type) {
    case 'SET_JOB_DESCRIPTION':
      return {
        ...state,
        jobDescription: action.payload,
        // Clear error when user starts typing again
        error: null,
      };

    case 'START_ANALYSIS':
      return {
        ...state,
        isAnalyzing: true,
        error: null,
        lastFailedJobDescription: state.jobDescription,
      };

    case 'ANALYSIS_SUCCESS': {
      const { assessment, jobDescriptionFull } = action.payload;
      const historyItem = createHistoryItem(assessment);
      const serializedItem = serializeAnalysisItem(assessment, jobDescriptionFull);

      // Add to history, keeping only the most recent MAX_HISTORY_ITEMS
      const newSerializedHistory = [
        serializedItem,
        ...state.serializedHistory,
      ].slice(0, MAX_HISTORY_ITEMS);

      const newAnalysisHistory = [
        historyItem,
        ...state.analysisHistory,
      ].slice(0, MAX_HISTORY_ITEMS);

      return {
        ...state,
        isAnalyzing: false,
        currentResult: assessment,
        analysisHistory: newAnalysisHistory,
        serializedHistory: newSerializedHistory,
        error: null,
        lastFailedJobDescription: null,
      };
    }

    case 'ANALYSIS_ERROR':
      return {
        ...state,
        isAnalyzing: false,
        error: action.payload,
        // Keep the job description for retry (preserved via lastFailedJobDescription)
      };

    case 'CLEAR_CURRENT_RESULT':
      return {
        ...state,
        currentResult: null,
        jobDescription: '',
        error: null,
      };

    case 'LOAD_HISTORY_ITEM': {
      const { assessment, jobDescriptionFull } = action.payload;
      return {
        ...state,
        currentResult: assessment,
        jobDescription: jobDescriptionFull,
        error: null,
      };
    }

    case 'CLEAR_HISTORY':
      return {
        ...state,
        analysisHistory: [],
        serializedHistory: [],
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'RESTORE_SESSION': {
      const serializedHistory = action.payload;
      const analysisHistory = serializedHistory.map((item) => ({
        id: item.id,
        timestamp: new Date(item.timestamp),
        jobDescriptionPreview: item.jobDescriptionPreview,
        confidenceScore: item.confidenceScore,
      }));

      return {
        ...state,
        serializedHistory,
        analysisHistory,
      };
    }

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

const FitAnalysisContext = createContext<FitAnalysisContextValue | null>(null);

// =============================================================================
// Provider Component
// =============================================================================

interface FitAnalysisProviderProps {
  children: React.ReactNode;
}

export function FitAnalysisProvider({ children }: FitAnalysisProviderProps) {
  const [state, dispatch] = useReducer(fitAnalysisReducer, initialFitAnalysisState);

  // Restore session from storage on mount
  useEffect(() => {
    const savedHistory = loadFromSessionStorage();
    if (savedHistory && savedHistory.length > 0) {
      dispatch({ type: 'RESTORE_SESSION', payload: savedHistory });
    }
  }, []);

  // Save to session storage when history changes
  useEffect(() => {
    if (state.serializedHistory.length > 0) {
      saveToSessionStorage(state.serializedHistory);
    }
  }, [state.serializedHistory]);

  // Action: Set job description
  const setJobDescription = useCallback((text: string) => {
    dispatch({ type: 'SET_JOB_DESCRIPTION', payload: text });
  }, []);

  // Action: Submit analysis
  const submitAnalysis = useCallback(async (): Promise<void> => {
    const trimmedDescription = state.jobDescription.trim();
    
    // Validate non-empty content
    if (!trimmedDescription) {
      const validationError: FitAnalysisError = {
        type: 'validation',
        message: 'Please enter a job description to analyze.',
        retryable: false,
      };
      dispatch({ type: 'ANALYSIS_ERROR', payload: validationError });
      return;
    }

    dispatch({ type: 'START_ANALYSIS' });

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription: trimmedDescription }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorType: FitAnalysisErrorType = 'server';
        let errorMessage = 'Something went wrong. Please try again.';

        if (response.status === 429) {
          errorType = 'server';
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (response.status >= 500) {
          errorType = 'server';
          errorMessage = 'Something went wrong. Please try again.';
        }

        const error: FitAnalysisError = {
          type: errorType,
          message: errorMessage,
          retryable: true,
        };
        dispatch({ type: 'ANALYSIS_ERROR', payload: error });
        return;
      }

      const data: AnalyzeResponse = await response.json();

      if (!data.success || !data.assessment) {
        const error: FitAnalysisError = {
          type: 'server',
          message: data.error?.message || 'Received an unexpected response. Please try again.',
          retryable: true,
        };
        dispatch({ type: 'ANALYSIS_ERROR', payload: error });
        return;
      }

      // Transform the assessment to ensure proper Date object
      const assessment: MatchAssessment = {
        ...data.assessment,
        timestamp: new Date(data.assessment.timestamp),
      };

      dispatch({
        type: 'ANALYSIS_SUCCESS',
        payload: { assessment, jobDescriptionFull: trimmedDescription },
      });
    } catch (error) {
      let errorType: FitAnalysisErrorType = 'unknown';
      let errorMessage = 'Something went wrong. Please try again.';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorType = 'timeout';
          errorMessage = 'The analysis is taking too long. Please try again.';
        } else if (
          error.message.toLowerCase().includes('network') ||
          error.message.toLowerCase().includes('fetch') ||
          error.message.toLowerCase().includes('failed to fetch')
        ) {
          errorType = 'network';
          errorMessage = 'Unable to connect. Please check your connection and try again.';
        }
      }

      const fitError: FitAnalysisError = {
        type: errorType,
        message: errorMessage,
        retryable: true,
      };
      dispatch({ type: 'ANALYSIS_ERROR', payload: fitError });
    }
  }, [state.jobDescription]);

  // Action: Clear current result
  const clearCurrentResult = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_RESULT' });
  }, []);

  // Action: Load history item
  const loadHistoryItem = useCallback((id: string) => {
    const serializedItem = state.serializedHistory.find((item) => item.id === id);
    if (!serializedItem) {
      return;
    }

    const { assessment, jobDescriptionFull } = deserializeAnalysisItem(serializedItem);
    dispatch({
      type: 'LOAD_HISTORY_ITEM',
      payload: { assessment, jobDescriptionFull },
    });
  }, [state.serializedHistory]);

  // Action: Clear history
  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
    clearSessionStorage();
  }, []);

  // Action: Retry analysis
  const retryAnalysis = useCallback(async (): Promise<void> => {
    // If there's a last failed job description, use it
    if (state.lastFailedJobDescription) {
      dispatch({ type: 'SET_JOB_DESCRIPTION', payload: state.lastFailedJobDescription });
    }
    
    // Clear the error and retry
    dispatch({ type: 'CLEAR_ERROR' });
    
    // Wait for state update then submit
    // We need to call submitAnalysis after the state is updated
    // Since we're using the current jobDescription, we can call it directly
    await submitAnalysis();
  }, [state.lastFailedJobDescription, submitAnalysis]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<FitAnalysisContextValue>(
    () => ({
      // State
      jobDescription: state.jobDescription,
      isAnalyzing: state.isAnalyzing,
      currentResult: state.currentResult,
      analysisHistory: state.analysisHistory,
      error: state.error,
      // Actions
      setJobDescription,
      submitAnalysis,
      clearCurrentResult,
      loadHistoryItem,
      clearHistory,
      retryAnalysis,
    }),
    [
      state.jobDescription,
      state.isAnalyzing,
      state.currentResult,
      state.analysisHistory,
      state.error,
      setJobDescription,
      submitAnalysis,
      clearCurrentResult,
      loadHistoryItem,
      clearHistory,
      retryAnalysis,
    ]
  );

  return (
    <FitAnalysisContext.Provider value={contextValue}>
      {children}
    </FitAnalysisContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access the fit analysis context
 * @throws Error if used outside of FitAnalysisProvider
 */
export function useFitAnalysis(): FitAnalysisContextValue {
  const context = useContext(FitAnalysisContext);
  if (!context) {
    throw new Error('useFitAnalysis must be used within a FitAnalysisProvider');
  }
  return context;
}

// =============================================================================
// Exports for Testing
// =============================================================================

export {
  generateId,
  createJobDescriptionPreview,
  serializeAnalysisItem,
  deserializeAnalysisItem,
  createHistoryItem,
  saveToSessionStorage,
  loadFromSessionStorage,
  clearSessionStorage,
  initialFitAnalysisState,
  fitAnalysisReducer,
};
export type { FitAnalysisState, FitAnalysisAction };
