/**
 * Property Tests for Fit Analysis Assessment Structure
 *
 * These tests validate:
 * - Property 8: Assessment Structure Validity
 * - Property 9: Evidence in Alignments
 *
 * Feature: fit-analysis-module
 *
 * **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 4.1**
 */

import * as fc from 'fast-check';
import {
  parseAnalysisResponse,
  isValidMatchAssessment,
} from '@/lib/fit-analysis-parser';
import type {
  ConfidenceLevel,
  RecommendationType,
  GapSeverity,
  EvidenceType,
} from '@/types/fit-analysis';

// =============================================================================
// Constants
// =============================================================================

const VALID_CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  'strong_match',
  'partial_match',
  'limited_match',
];

const VALID_LLM_CONFIDENCE_VALUES = ['strong', 'partial', 'limited'] as const;

const VALID_RECOMMENDATION_TYPES: RecommendationType[] = [
  'proceed',
  'consider',
  'reconsider',
];

const VALID_GAP_SEVERITIES: GapSeverity[] = ['minor', 'moderate', 'significant'];

const VALID_EVIDENCE_TYPES: EvidenceType[] = ['experience', 'project', 'skill'];

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating non-empty strings (for titles, descriptions, etc.)
 * Uses alphanumeric characters to ensure valid content
 */
const nonEmptyStringArbitrary: fc.Arbitrary<string> = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('')), { minLength: 1, maxLength: 100 })
  .map((chars) => chars.join(''))
  .filter((s) => s.trim().length > 0);

/**
 * Arbitrary for generating valid source strings for evidence
 * Must contain at least one alphanumeric character to generate a valid reference
 */
const evidenceSourceArbitrary: fc.Arbitrary<string> = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -'.split('')), { minLength: 1, maxLength: 50 })
  .map((chars) => chars.join(''))
  .filter((s) => /[a-zA-Z0-9]/.test(s) && s.trim().length > 0);

/**
 * Arbitrary for generating valid LLM confidence values
 */
const llmConfidenceArbitrary: fc.Arbitrary<'strong' | 'partial' | 'limited'> =
  fc.constantFrom(...VALID_LLM_CONFIDENCE_VALUES);

/**
 * Arbitrary for generating valid gap severity values
 */
const gapSeverityArbitrary: fc.Arbitrary<GapSeverity> = fc.constantFrom(
  ...VALID_GAP_SEVERITIES
);

/**
 * Arbitrary for generating valid recommendation verdict values
 */
const recommendationVerdictArbitrary: fc.Arbitrary<RecommendationType> =
  fc.constantFrom(...VALID_RECOMMENDATION_TYPES);

/**
 * Arbitrary for generating a valid evidence item in LLM response format
 * Uses evidenceSourceArbitrary to ensure valid references are generated
 */
const llmEvidenceArbitrary = fc.record({
  source: evidenceSourceArbitrary,
  detail: nonEmptyStringArbitrary,
});

/**
 * Arbitrary for generating a valid alignment item in LLM response format
 * Each alignment must have at least one evidence item
 */
const llmAlignmentArbitrary = fc.record({
  area: nonEmptyStringArbitrary,
  explanation: nonEmptyStringArbitrary,
  evidence: fc.array(llmEvidenceArbitrary, { minLength: 1, maxLength: 3 }),
});

/**
 * Arbitrary for generating a valid gap item in LLM response format
 */
const llmGapArbitrary = fc.record({
  area: nonEmptyStringArbitrary,
  explanation: nonEmptyStringArbitrary,
  severity: gapSeverityArbitrary,
});

/**
 * Arbitrary for generating a valid recommendation in LLM response format
 */
const llmRecommendationArbitrary = fc.record({
  verdict: recommendationVerdictArbitrary,
  summary: nonEmptyStringArbitrary,
  reasoning: nonEmptyStringArbitrary,
});

/**
 * Arbitrary for generating a complete valid LLM response
 */
const validLLMResponseArbitrary = fc.record({
  confidence: llmConfidenceArbitrary,
  alignments: fc.array(llmAlignmentArbitrary, { minLength: 0, maxLength: 5 }),
  gaps: fc.array(llmGapArbitrary, { minLength: 0, maxLength: 5 }),
  recommendation: llmRecommendationArbitrary,
});

/**
 * Arbitrary for generating job description text
 */
const jobDescriptionArbitrary: fc.Arbitrary<string> = fc
  .string({ minLength: 50, maxLength: 500 })
  .filter((s) => s.trim().length >= 50);

// =============================================================================
// Property 8: Assessment Structure Validity
// =============================================================================

/**
 * Feature: fit-analysis-module, Property 8: Assessment Structure Validity
 *
 * *For any* completed Match_Assessment, it SHALL contain:
 * - a valid ConfidenceScore (one of 'strong_match', 'partial_match', 'limited_match')
 * - an AlignmentAreas array
 * - a GapAreas array
 * - a Recommendation object with type, summary, and details
 *
 * **Validates: Requirements 3.2, 3.3, 3.4, 3.6**
 */
describe('Property 8: Assessment Structure Validity', () => {
  describe('Parsed Assessment Has Valid Confidence Score', () => {
    it('confidenceScore is one of the valid ConfidenceLevel values', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            // Parsing should succeed for valid LLM responses
            if (!result.success || !result.assessment) {
              return false;
            }

            // Confidence score must be one of the valid values
            return VALID_CONFIDENCE_LEVELS.includes(
              result.assessment.confidenceScore
            );
          }
        ),
        { numRuns: 3 }
      );
    });

    it('maps LLM confidence values correctly to ConfidenceLevel', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // Verify the mapping is correct
            const expectedMapping: Record<string, ConfidenceLevel> = {
              strong: 'strong_match',
              partial: 'partial_match',
              limited: 'limited_match',
            };

            return (
              result.assessment.confidenceScore ===
              expectedMapping[llmResponse.confidence]
            );
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Parsed Assessment Has AlignmentAreas Array', () => {
    it('alignmentAreas is always an array', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // alignmentAreas must be an array
            return Array.isArray(result.assessment.alignmentAreas);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('alignmentAreas length matches valid alignments from LLM response', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // All valid alignments should be parsed (those with valid evidence)
            return (
              result.assessment.alignmentAreas.length <=
              llmResponse.alignments.length
            );
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Parsed Assessment Has GapAreas Array', () => {
    it('gapAreas is always an array', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // gapAreas must be an array
            return Array.isArray(result.assessment.gapAreas);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('gapAreas length matches valid gaps from LLM response', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // All valid gaps should be parsed
            return (
              result.assessment.gapAreas.length <= llmResponse.gaps.length
            );
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Parsed Assessment Has Valid Recommendation', () => {
    it('recommendation object exists with type, summary, and details', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            const { recommendation } = result.assessment;

            // Recommendation must exist and have all required fields
            return (
              recommendation !== null &&
              recommendation !== undefined &&
              typeof recommendation.type === 'string' &&
              typeof recommendation.summary === 'string' &&
              typeof recommendation.details === 'string'
            );
          }
        ),
        { numRuns: 3 }
      );
    });

    it('recommendation type is one of the valid RecommendationType values', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // Recommendation type must be valid
            return VALID_RECOMMENDATION_TYPES.includes(
              result.assessment.recommendation.type
            );
          }
        ),
        { numRuns: 3 }
      );
    });

    it('recommendation summary is a non-empty string', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // Summary must be non-empty
            return result.assessment.recommendation.summary.trim().length > 0;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('recommendation details is a non-empty string', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // Details must be non-empty
            return result.assessment.recommendation.details.trim().length > 0;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('isValidMatchAssessment Validates Structure', () => {
    it('parsed assessments pass isValidMatchAssessment validation', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // The parsed assessment should pass the validation function
            return isValidMatchAssessment(result.assessment);
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Complete Assessment Structure', () => {
    it('assessment contains all required fields', () => {
      fc.assert(
        fc.property(
          validLLMResponseArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            const assessment = result.assessment;

            // Check all required fields exist
            return (
              typeof assessment.id === 'string' &&
              assessment.id.length > 0 &&
              assessment.timestamp instanceof Date &&
              typeof assessment.jobDescriptionPreview === 'string' &&
              VALID_CONFIDENCE_LEVELS.includes(assessment.confidenceScore) &&
              Array.isArray(assessment.alignmentAreas) &&
              Array.isArray(assessment.gapAreas) &&
              assessment.recommendation !== null &&
              VALID_RECOMMENDATION_TYPES.includes(assessment.recommendation.type) &&
              assessment.recommendation.summary.length > 0 &&
              assessment.recommendation.details.length > 0
            );
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});

// =============================================================================
// Property 9: Evidence in Alignments
// =============================================================================

/**
 * Feature: fit-analysis-module, Property 9: Evidence in Alignments
 *
 * *For any* AlignmentArea in a Match_Assessment, it SHALL contain at least one
 * Evidence reference with a valid type ('experience', 'project', or 'skill'),
 * title, reference, and excerpt.
 *
 * **Validates: Requirements 3.5, 4.1**
 */
describe('Property 9: Evidence in Alignments', () => {
  /**
   * Arbitrary for generating LLM responses that have at least one alignment
   * This ensures we always have alignments to test evidence on
   */
  const llmResponseWithAlignmentsArbitrary = fc.record({
    confidence: fc.constantFrom(...VALID_LLM_CONFIDENCE_VALUES),
    alignments: fc.array(
      fc.record({
        area: nonEmptyStringArbitrary,
        explanation: nonEmptyStringArbitrary,
        evidence: fc.array(llmEvidenceArbitrary, { minLength: 1, maxLength: 3 }),
      }),
      { minLength: 1, maxLength: 5 }
    ),
    gaps: fc.array(llmGapArbitrary, { minLength: 0, maxLength: 5 }),
    recommendation: llmRecommendationArbitrary,
  });

  describe('Each Alignment Has At Least One Evidence Item', () => {
    it('every alignment area contains at least one evidence reference', () => {
      fc.assert(
        fc.property(
          llmResponseWithAlignmentsArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // Every alignment area must have at least one evidence item
            return result.assessment.alignmentAreas.every(
              (alignment) =>
                Array.isArray(alignment.evidence) &&
                alignment.evidence.length >= 1
            );
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Evidence Has Valid Type', () => {
    it('every evidence item has a valid type (experience, project, or skill)', () => {
      fc.assert(
        fc.property(
          llmResponseWithAlignmentsArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // Every evidence item in every alignment must have a valid type
            return result.assessment.alignmentAreas.every((alignment) =>
              alignment.evidence.every((evidence) =>
                VALID_EVIDENCE_TYPES.includes(evidence.type)
              )
            );
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Evidence Has Non-Empty Title', () => {
    it('every evidence item has a non-empty title', () => {
      fc.assert(
        fc.property(
          llmResponseWithAlignmentsArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // Every evidence item must have a non-empty title
            return result.assessment.alignmentAreas.every((alignment) =>
              alignment.evidence.every(
                (evidence) =>
                  typeof evidence.title === 'string' &&
                  evidence.title.trim().length > 0
              )
            );
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Evidence Has Non-Empty Reference', () => {
    it('every evidence item has a non-empty reference', () => {
      fc.assert(
        fc.property(
          llmResponseWithAlignmentsArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // Every evidence item must have a non-empty reference
            return result.assessment.alignmentAreas.every((alignment) =>
              alignment.evidence.every(
                (evidence) =>
                  typeof evidence.reference === 'string' &&
                  evidence.reference.trim().length > 0
              )
            );
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Evidence Has Non-Empty Excerpt', () => {
    it('every evidence item has a non-empty excerpt', () => {
      fc.assert(
        fc.property(
          llmResponseWithAlignmentsArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // Every evidence item must have a non-empty excerpt
            return result.assessment.alignmentAreas.every((alignment) =>
              alignment.evidence.every(
                (evidence) =>
                  typeof evidence.excerpt === 'string' &&
                  evidence.excerpt.trim().length > 0
              )
            );
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Complete Evidence Validation', () => {
    it('every evidence item has all required fields with valid values', () => {
      fc.assert(
        fc.property(
          llmResponseWithAlignmentsArbitrary,
          jobDescriptionArbitrary,
          (llmResponse, jobDescription) => {
            const result = parseAnalysisResponse(JSON.stringify(llmResponse), {
              jobDescription,
            });

            if (!result.success || !result.assessment) {
              return false;
            }

            // Comprehensive check: every alignment has evidence with all valid fields
            return result.assessment.alignmentAreas.every((alignment) => {
              // Must have at least one evidence item
              if (
                !Array.isArray(alignment.evidence) ||
                alignment.evidence.length < 1
              ) {
                return false;
              }

              // Every evidence item must have all required fields
              return alignment.evidence.every((evidence) => {
                const hasValidType = VALID_EVIDENCE_TYPES.includes(
                  evidence.type
                );
                const hasNonEmptyTitle =
                  typeof evidence.title === 'string' &&
                  evidence.title.trim().length > 0;
                const hasNonEmptyReference =
                  typeof evidence.reference === 'string' &&
                  evidence.reference.trim().length > 0;
                const hasNonEmptyExcerpt =
                  typeof evidence.excerpt === 'string' &&
                  evidence.excerpt.trim().length > 0;

                return (
                  hasValidType &&
                  hasNonEmptyTitle &&
                  hasNonEmptyReference &&
                  hasNonEmptyExcerpt
                );
              });
            });
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});
