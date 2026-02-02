/**
 * FitAnalysisContext Unit Tests
 *
 * Tests for the FitAnalysisContext including:
 * - Initial state values
 * - State transitions and action handlers
 * - History management (capped at MAX_HISTORY_ITEMS)
 * - Session storage persistence (save/load/clear)
 * - Error handling and input preservation
 *
 * **Validates: Requirements 2.1, 5.1, 5.2, 5.3**
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  FitAnalysisProvider,
  useFitAnalysis,
  fitAnalysisReducer,
  initialFitAnalysisState,
  generateId,
  createJobDescriptionPreview,
  serializeAnalysisItem,
  deserializeAnalysisItem,
  createHistoryItem,
  saveToSessionStorage,
  loadFromSessionStorage,
  clearSessionStorage,
} from './FitAnalysisContext';
import type { FitAnalysisState, FitAnalysisAction } from './FitAnalysisContext';
import type {
  MatchAssessment,
  AnalysisHistoryItem,
  SerializedAnalysisItem,
  FitAnalysisError,
} from '@/types/fit-analysis';
import { MAX_HISTORY_ITEMS, FIT_ANALYSIS_STORAGE_KEY } from '@/types/fit-analysis';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Create a mock MatchAssessment for testing
 */
function createMockAssessment(overrides?: Partial<MatchAssessment>): MatchAssessment {
  return {
    id: 'test-assessment-id',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    jobDescriptionPreview: 'Test job description preview...',
    confidenceScore: 'partial_match',
    alignmentAreas: [
      {
        id: 'align-1',
        title: 'TypeScript Experience',
        description: 'Strong background in TypeScript development',
        evidence: [
          {
            type: 'project',
            title: 'Portfolio Website',
            reference: 'portfolio-site',
            excerpt: 'Built with Next.js and TypeScript',
          },
        ],
      },
    ],
    gapAreas: [
      {
        id: 'gap-1',
        title: 'Machine Learning',
        description: 'No documented ML experience',
        severity: 'moderate',
      },
    ],
    recommendation: {
      type: 'consider',
      summary: 'Worth exploring if ML is not a core requirement',
      details: 'Strong technical foundation but lacks specific ML experience.',
    },
    ...overrides,
  };
}

/**
 * Test component that exposes context values for testing
 */
function TestConsumer({ onContextReady }: { onContextReady: (ctx: ReturnType<typeof useFitAnalysis>) => void }) {
  const context = useFitAnalysis();
  React.useEffect(() => {
    onContextReady(context);
  }, [context, onContextReady]);
  return null;
}

/**
 * Render helper that provides access to context
 */
function renderWithProvider(ui?: React.ReactNode) {
  let contextValue: ReturnType<typeof useFitAnalysis> | null = null;
  const onContextReady = (ctx: ReturnType<typeof useFitAnalysis>) => {
    contextValue = ctx;
  };

  const result = render(
    <FitAnalysisProvider>
      <TestConsumer onContextReady={onContextReady} />
      {ui}
    </FitAnalysisProvider>
  );

  return { ...result, getContext: () => contextValue! };
}

/**
 * Helper to create a mock SSE streaming response
 */
function createSSEResponse(assessment: MatchAssessment) {
  const progressMessages = [
    { type: 'progress', phase: 'preparing', message: 'Preparing analysis...', percent: 5 },
    { type: 'progress', phase: 'analyzing', message: 'Analyzing fit...', percent: 20 },
    { type: 'complete', assessment: { ...assessment, timestamp: assessment.timestamp.toISOString() } },
  ];
  
  const sseData = progressMessages.map(msg => `data: ${JSON.stringify(msg)}\n\n`).join('');
  const encoder = new TextEncoder();
  const encoded = encoder.encode(sseData);
  
  let position = 0;
  const mockReader = {
    read: jest.fn().mockImplementation(() => {
      if (position === 0) {
        position++;
        return Promise.resolve({ done: false, value: encoded });
      }
      return Promise.resolve({ done: true, value: undefined });
    }),
  };
  
  return {
    ok: true,
    body: {
      getReader: () => mockReader,
    },
  };
}

/**
 * Helper to create a mock SSE error response
 */
function createSSEErrorResponse(code: string, message: string) {
  const errorMessage = { type: 'error', code, message };
  const sseData = `data: ${JSON.stringify(errorMessage)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(sseData);
  
  let position = 0;
  const mockReader = {
    read: jest.fn().mockImplementation(() => {
      if (position === 0) {
        position++;
        return Promise.resolve({ done: false, value: encoded });
      }
      return Promise.resolve({ done: true, value: undefined });
    }),
  };
  
  return {
    ok: true,
    body: {
      getReader: () => mockReader,
    },
  };
}

// =============================================================================
// Mock Session Storage
// =============================================================================

let mockStorage: Record<string, string> = {};

beforeEach(() => {
  mockStorage = {};
  jest.clearAllMocks();

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: jest.fn((key: string) => mockStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: jest.fn(() => {
        mockStorage = {};
      }),
    },
    writable: true,
  });
});

// =============================================================================
// Utility Function Tests
// =============================================================================

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('generates non-empty string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('createJobDescriptionPreview', () => {
    it('returns full text for short descriptions', () => {
      const shortText = 'Short job description';
      expect(createJobDescriptionPreview(shortText)).toBe(shortText);
    });

    it('truncates long descriptions to 100 characters with ellipsis', () => {
      const longText = 'A'.repeat(150);
      const preview = createJobDescriptionPreview(longText);
      expect(preview.length).toBe(103); // 100 chars + '...'
      expect(preview.endsWith('...')).toBe(true);
    });

    it('trims whitespace from input', () => {
      const textWithWhitespace = '  Job description  ';
      expect(createJobDescriptionPreview(textWithWhitespace)).toBe('Job description');
    });

    it('handles exactly 100 characters without truncation', () => {
      const exactText = 'A'.repeat(100);
      expect(createJobDescriptionPreview(exactText)).toBe(exactText);
    });
  });


  describe('serializeAnalysisItem', () => {
    it('converts Date to ISO string', () => {
      const assessment = createMockAssessment();
      const jobDescriptionFull = 'Full job description text';
      const serialized = serializeAnalysisItem(assessment, jobDescriptionFull);

      expect(typeof serialized.timestamp).toBe('string');
      expect(serialized.timestamp).toBe(assessment.timestamp.toISOString());
    });

    it('preserves all assessment fields', () => {
      const assessment = createMockAssessment();
      const jobDescriptionFull = 'Full job description text';
      const serialized = serializeAnalysisItem(assessment, jobDescriptionFull);

      expect(serialized.id).toBe(assessment.id);
      expect(serialized.jobDescriptionPreview).toBe(assessment.jobDescriptionPreview);
      expect(serialized.jobDescriptionFull).toBe(jobDescriptionFull);
      expect(serialized.confidenceScore).toBe(assessment.confidenceScore);
      expect(serialized.alignmentAreas).toEqual(assessment.alignmentAreas);
      expect(serialized.gapAreas).toEqual(assessment.gapAreas);
      expect(serialized.recommendation).toEqual(assessment.recommendation);
    });
  });

  describe('deserializeAnalysisItem', () => {
    it('converts ISO string back to Date', () => {
      const assessment = createMockAssessment();
      const jobDescriptionFull = 'Full job description text';
      const serialized = serializeAnalysisItem(assessment, jobDescriptionFull);
      const { assessment: deserialized } = deserializeAnalysisItem(serialized);

      expect(deserialized.timestamp instanceof Date).toBe(true);
      expect(deserialized.timestamp.getTime()).toBe(assessment.timestamp.getTime());
    });

    it('preserves all fields through round-trip', () => {
      const assessment = createMockAssessment();
      const jobDescriptionFull = 'Full job description text';
      const serialized = serializeAnalysisItem(assessment, jobDescriptionFull);
      const { assessment: deserialized, jobDescriptionFull: deserializedFull } =
        deserializeAnalysisItem(serialized);

      expect(deserialized.id).toBe(assessment.id);
      expect(deserialized.confidenceScore).toBe(assessment.confidenceScore);
      expect(deserialized.alignmentAreas).toEqual(assessment.alignmentAreas);
      expect(deserialized.gapAreas).toEqual(assessment.gapAreas);
      expect(deserialized.recommendation).toEqual(assessment.recommendation);
      expect(deserializedFull).toBe(jobDescriptionFull);
    });
  });

  describe('createHistoryItem', () => {
    it('creates history item with correct fields', () => {
      const assessment = createMockAssessment();
      const historyItem = createHistoryItem(assessment);

      expect(historyItem.id).toBe(assessment.id);
      expect(historyItem.timestamp).toBe(assessment.timestamp);
      expect(historyItem.jobDescriptionPreview).toBe(assessment.jobDescriptionPreview);
      expect(historyItem.confidenceScore).toBe(assessment.confidenceScore);
    });
  });
});

// =============================================================================
// Session Storage Tests
// =============================================================================

describe('Session Storage Functions', () => {
  describe('saveToSessionStorage', () => {
    it('saves history to sessionStorage', () => {
      const assessment = createMockAssessment();
      const serialized = serializeAnalysisItem(assessment, 'Full description');
      
      saveToSessionStorage([serialized]);

      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        FIT_ANALYSIS_STORAGE_KEY,
        expect.any(String)
      );
    });

    it('saves valid JSON structure', () => {
      const assessment = createMockAssessment();
      const serialized = serializeAnalysisItem(assessment, 'Full description');
      
      saveToSessionStorage([serialized]);

      const savedData = JSON.parse(mockStorage[FIT_ANALYSIS_STORAGE_KEY]);
      expect(savedData.analysisHistory).toHaveLength(1);
      expect(savedData.lastUpdated).toBeDefined();
    });
  });

  describe('loadFromSessionStorage', () => {
    it('returns null when no data exists', () => {
      const result = loadFromSessionStorage();
      expect(result).toBeNull();
    });

    it('loads saved history correctly', () => {
      const assessment = createMockAssessment();
      const serialized = serializeAnalysisItem(assessment, 'Full description');
      saveToSessionStorage([serialized]);

      const loaded = loadFromSessionStorage();

      expect(loaded).toHaveLength(1);
      expect(loaded![0].id).toBe(assessment.id);
    });

    it('returns null for invalid JSON', () => {
      mockStorage[FIT_ANALYSIS_STORAGE_KEY] = 'invalid json';
      
      const result = loadFromSessionStorage();
      expect(result).toBeNull();
    });
  });

  describe('clearSessionStorage', () => {
    it('removes fit analysis data from sessionStorage', () => {
      const assessment = createMockAssessment();
      const serialized = serializeAnalysisItem(assessment, 'Full description');
      saveToSessionStorage([serialized]);

      clearSessionStorage();

      expect(sessionStorage.removeItem).toHaveBeenCalledWith(FIT_ANALYSIS_STORAGE_KEY);
    });
  });
});


// =============================================================================
// Reducer Tests
// =============================================================================

describe('fitAnalysisReducer', () => {
  describe('Initial State', () => {
    it('has correct initial values', () => {
      expect(initialFitAnalysisState.jobDescription).toBe('');
      expect(initialFitAnalysisState.isAnalyzing).toBe(false);
      expect(initialFitAnalysisState.currentResult).toBeNull();
      expect(initialFitAnalysisState.analysisHistory).toEqual([]);
      expect(initialFitAnalysisState.error).toBeNull();
      expect(initialFitAnalysisState.serializedHistory).toEqual([]);
      expect(initialFitAnalysisState.lastFailedJobDescription).toBeNull();
    });
  });

  describe('SET_JOB_DESCRIPTION action', () => {
    it('updates job description', () => {
      const action: FitAnalysisAction = {
        type: 'SET_JOB_DESCRIPTION',
        payload: 'New job description',
      };

      const newState = fitAnalysisReducer(initialFitAnalysisState, action);

      expect(newState.jobDescription).toBe('New job description');
    });

    it('clears error when setting job description', () => {
      const stateWithError: FitAnalysisState = {
        ...initialFitAnalysisState,
        error: { type: 'validation', message: 'Error', retryable: false },
      };

      const action: FitAnalysisAction = {
        type: 'SET_JOB_DESCRIPTION',
        payload: 'New description',
      };

      const newState = fitAnalysisReducer(stateWithError, action);

      expect(newState.error).toBeNull();
    });
  });

  describe('START_ANALYSIS action', () => {
    it('sets isAnalyzing to true', () => {
      const stateWithDescription: FitAnalysisState = {
        ...initialFitAnalysisState,
        jobDescription: 'Test description',
      };

      const action: FitAnalysisAction = { type: 'START_ANALYSIS' };
      const newState = fitAnalysisReducer(stateWithDescription, action);

      expect(newState.isAnalyzing).toBe(true);
    });

    it('clears error', () => {
      const stateWithError: FitAnalysisState = {
        ...initialFitAnalysisState,
        jobDescription: 'Test',
        error: { type: 'network', message: 'Error', retryable: true },
      };

      const action: FitAnalysisAction = { type: 'START_ANALYSIS' };
      const newState = fitAnalysisReducer(stateWithError, action);

      expect(newState.error).toBeNull();
    });

    it('saves job description to lastFailedJobDescription', () => {
      const stateWithDescription: FitAnalysisState = {
        ...initialFitAnalysisState,
        jobDescription: 'Test description for retry',
      };

      const action: FitAnalysisAction = { type: 'START_ANALYSIS' };
      const newState = fitAnalysisReducer(stateWithDescription, action);

      expect(newState.lastFailedJobDescription).toBe('Test description for retry');
    });
  });

  describe('ANALYSIS_SUCCESS action', () => {
    it('sets currentResult and clears isAnalyzing', () => {
      const stateAnalyzing: FitAnalysisState = {
        ...initialFitAnalysisState,
        isAnalyzing: true,
        jobDescription: 'Test job',
      };

      const assessment = createMockAssessment();
      const action: FitAnalysisAction = {
        type: 'ANALYSIS_SUCCESS',
        payload: { assessment, jobDescriptionFull: 'Test job' },
      };

      const newState = fitAnalysisReducer(stateAnalyzing, action);

      expect(newState.isAnalyzing).toBe(false);
      expect(newState.currentResult).toEqual(assessment);
      expect(newState.error).toBeNull();
    });

    it('adds result to history', () => {
      const stateAnalyzing: FitAnalysisState = {
        ...initialFitAnalysisState,
        isAnalyzing: true,
      };

      const assessment = createMockAssessment();
      const action: FitAnalysisAction = {
        type: 'ANALYSIS_SUCCESS',
        payload: { assessment, jobDescriptionFull: 'Test job' },
      };

      const newState = fitAnalysisReducer(stateAnalyzing, action);

      expect(newState.analysisHistory).toHaveLength(1);
      expect(newState.analysisHistory[0].id).toBe(assessment.id);
    });

    it('clears lastFailedJobDescription on success', () => {
      const stateWithFailed: FitAnalysisState = {
        ...initialFitAnalysisState,
        isAnalyzing: true,
        lastFailedJobDescription: 'Previous failed description',
      };

      const assessment = createMockAssessment();
      const action: FitAnalysisAction = {
        type: 'ANALYSIS_SUCCESS',
        payload: { assessment, jobDescriptionFull: 'Test job' },
      };

      const newState = fitAnalysisReducer(stateWithFailed, action);

      expect(newState.lastFailedJobDescription).toBeNull();
    });
  });

  describe('ANALYSIS_ERROR action', () => {
    it('sets error and clears isAnalyzing', () => {
      const stateAnalyzing: FitAnalysisState = {
        ...initialFitAnalysisState,
        isAnalyzing: true,
        jobDescription: 'Test job',
      };

      const error: FitAnalysisError = {
        type: 'network',
        message: 'Network error',
        retryable: true,
      };

      const action: FitAnalysisAction = {
        type: 'ANALYSIS_ERROR',
        payload: error,
      };

      const newState = fitAnalysisReducer(stateAnalyzing, action);

      expect(newState.isAnalyzing).toBe(false);
      expect(newState.error).toEqual(error);
    });

    it('preserves job description on error', () => {
      const stateAnalyzing: FitAnalysisState = {
        ...initialFitAnalysisState,
        isAnalyzing: true,
        jobDescription: 'Important job description',
      };

      const error: FitAnalysisError = {
        type: 'server',
        message: 'Server error',
        retryable: true,
      };

      const action: FitAnalysisAction = {
        type: 'ANALYSIS_ERROR',
        payload: error,
      };

      const newState = fitAnalysisReducer(stateAnalyzing, action);

      expect(newState.jobDescription).toBe('Important job description');
    });
  });

  describe('CLEAR_CURRENT_RESULT action', () => {
    it('clears currentResult and jobDescription', () => {
      const stateWithResult: FitAnalysisState = {
        ...initialFitAnalysisState,
        currentResult: createMockAssessment(),
        jobDescription: 'Some description',
      };

      const action: FitAnalysisAction = { type: 'CLEAR_CURRENT_RESULT' };
      const newState = fitAnalysisReducer(stateWithResult, action);

      expect(newState.currentResult).toBeNull();
      expect(newState.jobDescription).toBe('');
    });

    it('clears error', () => {
      const stateWithError: FitAnalysisState = {
        ...initialFitAnalysisState,
        currentResult: createMockAssessment(),
        error: { type: 'validation', message: 'Error', retryable: false },
      };

      const action: FitAnalysisAction = { type: 'CLEAR_CURRENT_RESULT' };
      const newState = fitAnalysisReducer(stateWithError, action);

      expect(newState.error).toBeNull();
    });
  });

  describe('LOAD_HISTORY_ITEM action', () => {
    it('restores assessment and job description from history', () => {
      const assessment = createMockAssessment();
      const jobDescriptionFull = 'Full job description from history';

      const action: FitAnalysisAction = {
        type: 'LOAD_HISTORY_ITEM',
        payload: { assessment, jobDescriptionFull },
      };

      const newState = fitAnalysisReducer(initialFitAnalysisState, action);

      expect(newState.currentResult).toEqual(assessment);
      expect(newState.jobDescription).toBe(jobDescriptionFull);
      expect(newState.error).toBeNull();
    });
  });

  describe('CLEAR_HISTORY action', () => {
    it('clears analysisHistory and serializedHistory', () => {
      const assessment = createMockAssessment();
      const historyItem = createHistoryItem(assessment);
      const serialized = serializeAnalysisItem(assessment, 'Full description');

      const stateWithHistory: FitAnalysisState = {
        ...initialFitAnalysisState,
        analysisHistory: [historyItem],
        serializedHistory: [serialized],
      };

      const action: FitAnalysisAction = { type: 'CLEAR_HISTORY' };
      const newState = fitAnalysisReducer(stateWithHistory, action);

      expect(newState.analysisHistory).toEqual([]);
      expect(newState.serializedHistory).toEqual([]);
    });
  });

  describe('CLEAR_ERROR action', () => {
    it('clears error', () => {
      const stateWithError: FitAnalysisState = {
        ...initialFitAnalysisState,
        error: { type: 'timeout', message: 'Timeout', retryable: true },
      };

      const action: FitAnalysisAction = { type: 'CLEAR_ERROR' };
      const newState = fitAnalysisReducer(stateWithError, action);

      expect(newState.error).toBeNull();
    });
  });

  describe('RESTORE_SESSION action', () => {
    it('restores history from serialized data', () => {
      const assessment = createMockAssessment();
      const serialized = serializeAnalysisItem(assessment, 'Full description');

      const action: FitAnalysisAction = {
        type: 'RESTORE_SESSION',
        payload: [serialized],
      };

      const newState = fitAnalysisReducer(initialFitAnalysisState, action);

      expect(newState.serializedHistory).toHaveLength(1);
      expect(newState.analysisHistory).toHaveLength(1);
      expect(newState.analysisHistory[0].id).toBe(assessment.id);
    });

    it('converts timestamps to Date objects', () => {
      const assessment = createMockAssessment();
      const serialized = serializeAnalysisItem(assessment, 'Full description');

      const action: FitAnalysisAction = {
        type: 'RESTORE_SESSION',
        payload: [serialized],
      };

      const newState = fitAnalysisReducer(initialFitAnalysisState, action);

      expect(newState.analysisHistory[0].timestamp instanceof Date).toBe(true);
    });
  });

  describe('History capped at MAX_HISTORY_ITEMS', () => {
    it('keeps only the most recent MAX_HISTORY_ITEMS analyses', () => {
      let state = initialFitAnalysisState;

      // Add more than MAX_HISTORY_ITEMS analyses
      for (let i = 0; i < MAX_HISTORY_ITEMS + 3; i++) {
        const assessment = createMockAssessment({
          id: `assessment-${i}`,
          timestamp: new Date(Date.now() + i * 1000),
        });

        state = fitAnalysisReducer(state, { type: 'START_ANALYSIS' });
        state = fitAnalysisReducer(state, {
          type: 'ANALYSIS_SUCCESS',
          payload: { assessment, jobDescriptionFull: `Job ${i}` },
        });
      }

      expect(state.analysisHistory.length).toBe(MAX_HISTORY_ITEMS);
      expect(state.serializedHistory.length).toBe(MAX_HISTORY_ITEMS);
      
      // Most recent should be first
      expect(state.analysisHistory[0].id).toBe(`assessment-${MAX_HISTORY_ITEMS + 2}`);
    });
  });
});


// =============================================================================
// Context Provider Tests
// =============================================================================

describe('FitAnalysisProvider', () => {
  describe('useFitAnalysis hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponent = () => {
        useFitAnalysis();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useFitAnalysis must be used within a FitAnalysisProvider'
      );

      consoleSpy.mockRestore();
    });

    it('provides context value when used within provider', () => {
      const { getContext } = renderWithProvider();

      expect(getContext()).toBeDefined();
      expect(getContext().jobDescription).toBe('');
      expect(getContext().isAnalyzing).toBe(false);
      expect(getContext().currentResult).toBeNull();
      expect(getContext().analysisHistory).toEqual([]);
      expect(getContext().error).toBeNull();
    });
  });

  describe('setJobDescription action', () => {
    it('updates jobDescription state', async () => {
      const { getContext } = renderWithProvider();

      await act(async () => {
        getContext().setJobDescription('New job description');
      });

      expect(getContext().jobDescription).toBe('New job description');
    });
  });

  describe('submitAnalysis action', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('shows validation error for empty input', async () => {
      const { getContext } = renderWithProvider();

      await act(async () => {
        await getContext().submitAnalysis();
      });

      expect(getContext().error).toEqual({
        type: 'validation',
        message: 'Please enter a job description to analyze.',
        retryable: false,
      });
    });

    it('shows validation error for whitespace-only input', async () => {
      const { getContext } = renderWithProvider();

      await act(async () => {
        getContext().setJobDescription('   \n\t   ');
      });

      await act(async () => {
        await getContext().submitAnalysis();
      });

      expect(getContext().error?.type).toBe('validation');
    });

    it('calls API with job description on valid input', async () => {
      const mockAssessment = createMockAssessment();
      (global.fetch as jest.Mock).mockResolvedValueOnce(createSSEResponse(mockAssessment));

      const { getContext } = renderWithProvider();

      await act(async () => {
        getContext().setJobDescription('Valid job description for testing');
      });

      await act(async () => {
        await getContext().submitAnalysis();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: 'Valid job description for testing' }),
        signal: expect.any(AbortSignal),
      });
    });

    it('updates currentResult on successful analysis', async () => {
      const mockAssessment = createMockAssessment();
      (global.fetch as jest.Mock).mockResolvedValueOnce(createSSEResponse(mockAssessment));

      const { getContext } = renderWithProvider();

      await act(async () => {
        getContext().setJobDescription('Valid job description');
      });

      await act(async () => {
        await getContext().submitAnalysis();
      });

      expect(getContext().currentResult).toBeDefined();
      expect(getContext().currentResult?.id).toBe(mockAssessment.id);
    });

    it('adds result to history on success', async () => {
      const mockAssessment = createMockAssessment();
      (global.fetch as jest.Mock).mockResolvedValueOnce(createSSEResponse(mockAssessment));

      const { getContext } = renderWithProvider();

      await act(async () => {
        getContext().setJobDescription('Valid job description');
      });

      await act(async () => {
        await getContext().submitAnalysis();
      });

      expect(getContext().analysisHistory).toHaveLength(1);
    });

    it('sets error on server error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        body: null,
      });

      const { getContext } = renderWithProvider();

      await act(async () => {
        getContext().setJobDescription('Valid job description');
      });

      await act(async () => {
        await getContext().submitAnalysis();
      });

      expect(getContext().error?.type).toBe('server');
      expect(getContext().error?.retryable).toBe(true);
    });

    it('preserves job description on error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        body: null,
      });

      const { getContext } = renderWithProvider();

      await act(async () => {
        getContext().setJobDescription('Important job description');
      });

      await act(async () => {
        await getContext().submitAnalysis();
      });

      expect(getContext().jobDescription).toBe('Important job description');
    });

    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

      const { getContext } = renderWithProvider();

      await act(async () => {
        getContext().setJobDescription('Valid job description');
      });

      await act(async () => {
        await getContext().submitAnalysis();
      });

      expect(getContext().error?.type).toBe('network');
    });
  });

  describe('clearCurrentResult action', () => {
    it('clears result and job description', async () => {
      const mockAssessment = createMockAssessment();
      (global.fetch as jest.Mock).mockResolvedValueOnce(createSSEResponse(mockAssessment));

      const { getContext } = renderWithProvider();

      // First, submit an analysis
      await act(async () => {
        getContext().setJobDescription('Test job');
      });

      await act(async () => {
        await getContext().submitAnalysis();
      });

      expect(getContext().currentResult).toBeDefined();

      // Then clear it
      await act(async () => {
        getContext().clearCurrentResult();
      });

      expect(getContext().currentResult).toBeNull();
      expect(getContext().jobDescription).toBe('');
    });
  });

  describe('loadHistoryItem action', () => {
    it('restores previous analysis from history', async () => {
      const mockAssessment = createMockAssessment();
      (global.fetch as jest.Mock).mockResolvedValueOnce(createSSEResponse(mockAssessment));

      const { getContext } = renderWithProvider();

      // Submit an analysis
      await act(async () => {
        getContext().setJobDescription('Original job description');
      });

      await act(async () => {
        await getContext().submitAnalysis();
      });

      const historyId = getContext().analysisHistory[0].id;

      // Clear current result
      await act(async () => {
        getContext().clearCurrentResult();
      });

      expect(getContext().currentResult).toBeNull();

      // Load from history
      await act(async () => {
        getContext().loadHistoryItem(historyId);
      });

      expect(getContext().currentResult).toBeDefined();
      expect(getContext().currentResult?.id).toBe(mockAssessment.id);
      expect(getContext().jobDescription).toBe('Original job description');
    });

    it('does nothing for non-existent history ID', async () => {
      const { getContext } = renderWithProvider();

      await act(async () => {
        getContext().loadHistoryItem('non-existent-id');
      });

      expect(getContext().currentResult).toBeNull();
    });
  });

  describe('clearHistory action', () => {
    it('removes all history items', async () => {
      const mockAssessment = createMockAssessment();
      (global.fetch as jest.Mock).mockResolvedValueOnce(createSSEResponse(mockAssessment));

      const { getContext } = renderWithProvider();

      // Submit an analysis
      await act(async () => {
        getContext().setJobDescription('Test job');
      });

      await act(async () => {
        await getContext().submitAnalysis();
      });

      expect(getContext().analysisHistory.length).toBeGreaterThan(0);

      // Clear history
      await act(async () => {
        getContext().clearHistory();
      });

      expect(getContext().analysisHistory).toEqual([]);
    });

    it('clears session storage', async () => {
      const mockAssessment = createMockAssessment();
      (global.fetch as jest.Mock).mockResolvedValueOnce(createSSEResponse(mockAssessment));

      const { getContext } = renderWithProvider();

      await act(async () => {
        getContext().setJobDescription('Test job');
      });

      await act(async () => {
        await getContext().submitAnalysis();
      });

      await act(async () => {
        getContext().clearHistory();
      });

      expect(sessionStorage.removeItem).toHaveBeenCalledWith(FIT_ANALYSIS_STORAGE_KEY);
    });
  });
});
