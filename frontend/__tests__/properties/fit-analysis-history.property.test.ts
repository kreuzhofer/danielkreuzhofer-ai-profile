/**
 * Property Tests for Fit Analysis History
 *
 * Tests Properties 11 and 12 from the design document:
 * - Property 11: History Persistence Round-Trip
 * - Property 12: History Capped at Maximum
 *
 * @see Requirements 5.1, 5.2, 5.3, 5.5
 */

import * as fc from 'fast-check';
import {
  saveAnalysis,
  loadHistory,
  clearHistory,
  loadAnalysisById,
  getHistoryCount,
} from '@/lib/fit-analysis-storage';
import {
  MatchAssessment,
  ConfidenceLevel,
  RecommendationType,
  GapSeverity,
  EvidenceType,
  MAX_HISTORY_ITEMS,
} from '@/types/fit-analysis';

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

// Arbitraries for generating test data
const confidenceLevelArb = fc.constantFrom<ConfidenceLevel>(
  'strong_match',
  'partial_match',
  'limited_match'
);

const recommendationTypeArb = fc.constantFrom<RecommendationType>(
  'proceed',
  'consider',
  'reconsider'
);

const gapSeverityArb = fc.constantFrom<GapSeverity>('minor', 'moderate', 'significant');

const evidenceTypeArb = fc.constantFrom<EvidenceType>('experience', 'project', 'skill');

const evidenceArb = fc.record({
  type: evidenceTypeArb,
  title: fc.string({ minLength: 1, maxLength: 50 }),
  reference: fc.string({ minLength: 1, maxLength: 50 }),
  excerpt: fc.string({ minLength: 1, maxLength: 200 }),
});

const alignmentAreaArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  evidence: fc.array(evidenceArb, { minLength: 1, maxLength: 3 }),
});

const gapAreaArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  severity: gapSeverityArb,
});

const recommendationArb = fc.record({
  type: recommendationTypeArb,
  summary: fc.string({ minLength: 1, maxLength: 200 }),
  details: fc.string({ minLength: 1, maxLength: 500 }),
});

const matchAssessmentArb: fc.Arbitrary<MatchAssessment> = fc.record({
  id: fc.uuid(),
  timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  jobDescriptionPreview: fc.string({ minLength: 1, maxLength: 100 }),
  confidenceScore: confidenceLevelArb,
  alignmentAreas: fc.array(alignmentAreaArb, { minLength: 0, maxLength: 3 }),
  gapAreas: fc.array(gapAreaArb, { minLength: 0, maxLength: 3 }),
  recommendation: recommendationArb,
});

/**
 * Feature: fit-analysis-module, Property 11: History Persistence Round-Trip
 *
 * For any completed analysis, saving it to session storage and then retrieving it
 * SHALL produce an equivalent MatchAssessment with all fields preserved
 * (id, timestamp, confidenceScore, alignmentAreas, gapAreas, recommendation).
 *
 * **Validates: Requirements 5.1, 5.2, 5.3**
 */
describe('Property 11: History Persistence Round-Trip', () => {
  it('preserves all fields when saving and loading an assessment', () => {
    fc.assert(
      fc.property(matchAssessmentArb, (assessment) => {
        // Clear storage first
        clearHistory();

        // Save the assessment
        const saved = saveAnalysis(assessment);
        expect(saved).toBe(true);

        // Load it back
        const loaded = loadAnalysisById(assessment.id);
        expect(loaded).not.toBeNull();

        if (loaded) {
          // Verify all fields are preserved
          expect(loaded.id).toBe(assessment.id);
          expect(loaded.timestamp.getTime()).toBe(assessment.timestamp.getTime());
          expect(loaded.jobDescriptionPreview).toBe(assessment.jobDescriptionPreview);
          expect(loaded.confidenceScore).toBe(assessment.confidenceScore);
          expect(loaded.alignmentAreas).toEqual(assessment.alignmentAreas);
          expect(loaded.gapAreas).toEqual(assessment.gapAreas);
          expect(loaded.recommendation).toEqual(assessment.recommendation);
        }

        return true;
      }),
      { numRuns: 3 }
    );
  });

  it('preserves order when loading history', () => {
    fc.assert(
      fc.property(
        fc.array(matchAssessmentArb, { minLength: 2, maxLength: 4 }),
        (assessments) => {
          // Clear storage first
          clearHistory();

          // Save all assessments
          assessments.forEach((assessment) => {
            saveAnalysis(assessment);
          });

          // Load history
          const history = loadHistory();

          // History should be in reverse order (most recent first)
          // Since we save in order, the last saved should be first in history
          expect(history.length).toBe(assessments.length);

          // The first item in history should be the last saved
          expect(history[0].id).toBe(assessments[assessments.length - 1].id);

          return true;
        }
      ),
      { numRuns: 3 }
    );
  });
});

/**
 * Feature: fit-analysis-module, Property 12: History Capped at Maximum
 *
 * For any number of completed analyses greater than 5, the history list
 * SHALL display only the 5 most recent analyses, ordered by timestamp descending.
 *
 * **Validates: Requirements 5.5**
 */
describe('Property 12: History Capped at Maximum', () => {
  it('caps history at MAX_HISTORY_ITEMS', () => {
    fc.assert(
      fc.property(
        fc.array(matchAssessmentArb, { minLength: MAX_HISTORY_ITEMS + 1, maxLength: 10 }),
        (assessments) => {
          // Clear storage first
          clearHistory();

          // Save all assessments
          assessments.forEach((assessment) => {
            saveAnalysis(assessment);
          });

          // Load history
          const history = loadHistory();

          // History should be capped at MAX_HISTORY_ITEMS
          expect(history.length).toBe(MAX_HISTORY_ITEMS);

          // The most recent item (last saved) should be first in history
          const lastSaved = assessments[assessments.length - 1];
          expect(history[0].id).toBe(lastSaved.id);

          return true;
        }
      ),
      { numRuns: 3 }
    );
  });

  it('getHistoryCount never exceeds MAX_HISTORY_ITEMS', () => {
    fc.assert(
      fc.property(
        fc.array(matchAssessmentArb, { minLength: 1, maxLength: 15 }),
        (assessments) => {
          // Clear storage first
          clearHistory();

          // Save all assessments
          assessments.forEach((assessment) => {
            saveAnalysis(assessment);
          });

          // Count should never exceed MAX_HISTORY_ITEMS
          const count = getHistoryCount();
          expect(count).toBeLessThanOrEqual(MAX_HISTORY_ITEMS);

          return true;
        }
      ),
      { numRuns: 3 }
    );
  });
});
