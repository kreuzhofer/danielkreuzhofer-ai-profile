/**
 * Fit Analysis Storage Utilities Tests
 *
 * @see Requirements 5.1, 5.2, 5.4, 5.5
 */

import {
  saveAnalysis,
  loadHistory,
  loadAnalysisById,
  clearHistory,
  getHistoryCount,
  isHistoryAvailable,
} from './fit-analysis-storage';
import { MatchAssessment, MAX_HISTORY_ITEMS } from '@/types/fit-analysis';

// Mock sessionStorage
const mockStorage: Record<string, string> = {};

beforeAll(() => {
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
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
      }),
    },
    writable: true,
  });
});

beforeEach(() => {
  // Clear mock storage before each test
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  jest.clearAllMocks();
});

const createMockAssessment = (id: string): MatchAssessment => ({
  id,
  timestamp: new Date('2024-01-15T10:30:00Z'),
  jobDescriptionPreview: `Job description for ${id}`,
  confidenceScore: 'partial_match',
  alignmentAreas: [
    {
      id: 'align-1',
      title: 'TypeScript',
      description: 'Strong TypeScript skills',
      evidence: [
        {
          type: 'project',
          title: 'Portfolio',
          reference: 'portfolio-site',
          excerpt: 'Built with TypeScript',
        },
      ],
    },
  ],
  gapAreas: [
    {
      id: 'gap-1',
      title: 'ML',
      description: 'No ML experience',
      severity: 'moderate',
    },
  ],
  recommendation: {
    type: 'consider',
    summary: 'Worth considering',
    details: 'Good fit overall',
  },
});

describe('saveAnalysis', () => {
  it('saves an assessment to storage', () => {
    const assessment = createMockAssessment('test-1');
    const result = saveAnalysis(assessment);

    expect(result).toBe(true);
    expect(sessionStorage.setItem).toHaveBeenCalled();
  });

  it('adds new items to the beginning of history', () => {
    const assessment1 = createMockAssessment('test-1');
    const assessment2 = createMockAssessment('test-2');

    saveAnalysis(assessment1);
    saveAnalysis(assessment2);

    const history = loadHistory();
    expect(history[0].id).toBe('test-2');
    expect(history[1].id).toBe('test-1');
  });

  it('caps history at MAX_HISTORY_ITEMS', () => {
    // Save more than MAX_HISTORY_ITEMS
    for (let i = 0; i < MAX_HISTORY_ITEMS + 3; i++) {
      saveAnalysis(createMockAssessment(`test-${i}`));
    }

    const history = loadHistory();
    expect(history.length).toBe(MAX_HISTORY_ITEMS);
  });
});

describe('loadHistory', () => {
  it('returns empty array when no history', () => {
    const history = loadHistory();
    expect(history).toEqual([]);
  });

  it('returns saved assessments', () => {
    saveAnalysis(createMockAssessment('test-1'));
    saveAnalysis(createMockAssessment('test-2'));

    const history = loadHistory();
    expect(history.length).toBe(2);
  });

  it('deserializes timestamps correctly', () => {
    const assessment = createMockAssessment('test-1');
    saveAnalysis(assessment);

    const history = loadHistory();
    expect(history[0].timestamp).toBeInstanceOf(Date);
    expect(history[0].timestamp.getTime()).toBe(assessment.timestamp.getTime());
  });
});

describe('loadAnalysisById', () => {
  it('returns null when not found', () => {
    const result = loadAnalysisById('non-existent');
    expect(result).toBeNull();
  });

  it('returns the correct assessment', () => {
    saveAnalysis(createMockAssessment('test-1'));
    saveAnalysis(createMockAssessment('test-2'));

    const result = loadAnalysisById('test-1');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('test-1');
  });

  it('preserves all fields', () => {
    const assessment = createMockAssessment('test-1');
    saveAnalysis(assessment);

    const result = loadAnalysisById('test-1');
    expect(result?.confidenceScore).toBe(assessment.confidenceScore);
    expect(result?.alignmentAreas).toEqual(assessment.alignmentAreas);
    expect(result?.gapAreas).toEqual(assessment.gapAreas);
    expect(result?.recommendation).toEqual(assessment.recommendation);
  });
});

describe('clearHistory', () => {
  it('clears all history', () => {
    saveAnalysis(createMockAssessment('test-1'));
    saveAnalysis(createMockAssessment('test-2'));

    const result = clearHistory();
    expect(result).toBe(true);

    const history = loadHistory();
    expect(history).toEqual([]);
  });

  it('returns true even when already empty', () => {
    const result = clearHistory();
    expect(result).toBe(true);
  });
});

describe('getHistoryCount', () => {
  it('returns 0 when empty', () => {
    expect(getHistoryCount()).toBe(0);
  });

  it('returns correct count', () => {
    saveAnalysis(createMockAssessment('test-1'));
    saveAnalysis(createMockAssessment('test-2'));
    saveAnalysis(createMockAssessment('test-3'));

    expect(getHistoryCount()).toBe(3);
  });

  it('never exceeds MAX_HISTORY_ITEMS', () => {
    for (let i = 0; i < 10; i++) {
      saveAnalysis(createMockAssessment(`test-${i}`));
    }

    expect(getHistoryCount()).toBe(MAX_HISTORY_ITEMS);
  });
});

describe('isHistoryAvailable', () => {
  it('returns true when sessionStorage is available', () => {
    expect(isHistoryAvailable()).toBe(true);
  });
});

describe('edge cases', () => {
  it('handles malformed JSON in storage gracefully', () => {
    mockStorage['portfolio-fit-analysis-session'] = 'not valid json';

    const history = loadHistory();
    expect(history).toEqual([]);
  });

  it('handles missing fields in stored data', () => {
    mockStorage['portfolio-fit-analysis-session'] = JSON.stringify({
      analysisHistory: [],
    });

    const history = loadHistory();
    expect(history).toEqual([]);
  });
});
