/**
 * Fit Analysis Response Parser
 *
 * Parses and transforms LLM analysis responses into MatchAssessment objects.
 * Handles validation, mapping, and graceful error handling for malformed responses.
 *
 * @see Requirements 3.2, 3.3, 3.4, 3.5, 3.6
 */

import {
  type LLMAnalysisResponse,
  type MatchAssessment,
  type ConfidenceLevel,
  type AlignmentArea,
  type GapArea,
  type Evidence,
  type EvidenceType,
  type GapSeverity,
  type Recommendation,
  type RecommendationType,
} from '@/types/fit-analysis';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of parsing an LLM response
 */
export interface ParseResult {
  success: boolean;
  assessment?: MatchAssessment;
  error?: string;
}

/**
 * Options for parsing
 */
export interface ParseOptions {
  /** Job description text for preview generation */
  jobDescription: string;
  /** Custom ID generator (for testing) */
  generateId?: () => string;
}

// =============================================================================
// Constants
// =============================================================================

/** Valid confidence values from LLM */
const VALID_LLM_CONFIDENCE = ['strong', 'partial', 'limited'] as const;

/** Valid severity values */
const VALID_SEVERITIES = ['minor', 'moderate', 'significant'] as const;

/** Valid verdict values */
const VALID_VERDICTS = ['proceed', 'consider', 'reconsider'] as const;

/** Map LLM confidence to ConfidenceLevel */
const CONFIDENCE_MAP: Record<'strong' | 'partial' | 'limited', ConfidenceLevel> = {
  strong: 'strong_match',
  partial: 'partial_match',
  limited: 'limited_match',
};

/** Preview length for job description */
const PREVIEW_LENGTH = 100;

// =============================================================================
// ID Generation
// =============================================================================

/**
 * Generate a unique ID for assessments, alignments, and gaps
 */
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Check if a value is a non-empty string
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if a value is a valid array
 */
function isValidArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Check if a value is a valid object (not null, not array)
 */
function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validate LLM confidence value
 */
function isValidLLMConfidence(
  value: unknown
): value is 'strong' | 'partial' | 'limited' {
  return (
    typeof value === 'string' &&
    VALID_LLM_CONFIDENCE.includes(value as 'strong' | 'partial' | 'limited')
  );
}

/**
 * Validate severity value
 */
function isValidSeverity(value: unknown): value is GapSeverity {
  return (
    typeof value === 'string' &&
    VALID_SEVERITIES.includes(value as GapSeverity)
  );
}

/**
 * Validate verdict value
 */
function isValidVerdict(value: unknown): value is RecommendationType {
  return (
    typeof value === 'string' &&
    VALID_VERDICTS.includes(value as RecommendationType)
  );
}

// =============================================================================
// Evidence Parsing
// =============================================================================

/**
 * Infer evidence type from source string
 * Attempts to categorize based on common patterns
 */
function inferEvidenceType(source: string): EvidenceType {
  const lowerSource = source.toLowerCase();

  if (
    lowerSource.includes('project') ||
    lowerSource.includes('built') ||
    lowerSource.includes('developed') ||
    lowerSource.includes('created')
  ) {
    return 'project';
  }

  if (
    lowerSource.includes('role') ||
    lowerSource.includes('position') ||
    lowerSource.includes('worked') ||
    lowerSource.includes('experience') ||
    lowerSource.includes('job') ||
    lowerSource.includes('company')
  ) {
    return 'experience';
  }

  // Default to skill for other cases
  return 'skill';
}

/**
 * Generate a reference ID from source string
 */
function generateReference(source: string): string {
  return source
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

/**
 * Parse a single evidence item from LLM response
 */
function parseEvidence(
  item: unknown,
  generateId: () => string
): Evidence | null {
  if (!isValidObject(item)) {
    return null;
  }

  const source = item.source;
  const detail = item.detail;

  if (!isNonEmptyString(source) || !isNonEmptyString(detail)) {
    return null;
  }

  return {
    type: inferEvidenceType(source),
    title: source,
    reference: generateReference(source),
    excerpt: detail,
  };
}

/**
 * Parse evidence array from LLM response
 * Returns at least one evidence item or throws if none valid
 */
function parseEvidenceArray(
  evidence: unknown,
  generateId: () => string
): Evidence[] {
  if (!isValidArray(evidence)) {
    throw new Error('Evidence must be an array');
  }

  const parsedEvidence: Evidence[] = [];

  for (const item of evidence) {
    const parsed = parseEvidence(item, generateId);
    if (parsed) {
      parsedEvidence.push(parsed);
    }
  }

  if (parsedEvidence.length === 0) {
    throw new Error('Alignment must have at least one valid evidence item');
  }

  return parsedEvidence;
}

// =============================================================================
// Alignment Parsing
// =============================================================================

/**
 * Parse a single alignment item from LLM response
 */
function parseAlignment(
  item: unknown,
  generateId: () => string
): AlignmentArea | null {
  if (!isValidObject(item)) {
    return null;
  }

  const area = item.area;
  const explanation = item.explanation;
  const evidence = item.evidence;

  if (!isNonEmptyString(area) || !isNonEmptyString(explanation)) {
    return null;
  }

  try {
    const parsedEvidence = parseEvidenceArray(evidence, generateId);

    return {
      id: generateId(),
      title: area,
      description: explanation,
      evidence: parsedEvidence,
    };
  } catch {
    // If evidence parsing fails, skip this alignment
    return null;
  }
}

/**
 * Parse alignments array from LLM response
 */
function parseAlignments(
  alignments: unknown,
  generateId: () => string
): AlignmentArea[] {
  if (!isValidArray(alignments)) {
    return [];
  }

  const parsedAlignments: AlignmentArea[] = [];

  for (const item of alignments) {
    const parsed = parseAlignment(item, generateId);
    if (parsed) {
      parsedAlignments.push(parsed);
    }
  }

  return parsedAlignments;
}

// =============================================================================
// Gap Parsing
// =============================================================================

/**
 * Parse a single gap item from LLM response
 */
function parseGap(item: unknown, generateId: () => string): GapArea | null {
  if (!isValidObject(item)) {
    return null;
  }

  const area = item.area;
  const explanation = item.explanation;
  const severity = item.severity;

  if (!isNonEmptyString(area) || !isNonEmptyString(explanation)) {
    return null;
  }

  if (!isValidSeverity(severity)) {
    return null;
  }

  return {
    id: generateId(),
    title: area,
    description: explanation,
    severity,
  };
}

/**
 * Parse gaps array from LLM response
 */
function parseGaps(gaps: unknown, generateId: () => string): GapArea[] {
  if (!isValidArray(gaps)) {
    return [];
  }

  const parsedGaps: GapArea[] = [];

  for (const item of gaps) {
    const parsed = parseGap(item, generateId);
    if (parsed) {
      parsedGaps.push(parsed);
    }
  }

  return parsedGaps;
}

// =============================================================================
// Recommendation Parsing
// =============================================================================

/**
 * Parse recommendation from LLM response
 */
function parseRecommendation(recommendation: unknown): Recommendation {
  if (!isValidObject(recommendation)) {
    throw new Error('Recommendation must be an object');
  }

  const verdict = recommendation.verdict;
  const summary = recommendation.summary;
  const reasoning = recommendation.reasoning;

  if (!isValidVerdict(verdict)) {
    throw new Error(
      `Invalid recommendation verdict: ${verdict}. Must be one of: proceed, consider, reconsider`
    );
  }

  if (!isNonEmptyString(summary)) {
    throw new Error('Recommendation summary must be a non-empty string');
  }

  if (!isNonEmptyString(reasoning)) {
    throw new Error('Recommendation reasoning must be a non-empty string');
  }

  return {
    type: verdict,
    summary,
    details: reasoning,
  };
}

// =============================================================================
// Main Parser
// =============================================================================

/**
 * Validate the basic structure of an LLM response
 */
function validateLLMResponseStructure(data: unknown): void {
  if (!isValidObject(data)) {
    throw new Error('Response must be a JSON object');
  }

  if (!isValidLLMConfidence(data.confidence)) {
    throw new Error(
      `Invalid confidence value: ${data.confidence}. Must be one of: strong, partial, limited`
    );
  }

  if (!isValidArray(data.alignments)) {
    throw new Error('Alignments must be an array');
  }

  if (!isValidArray(data.gaps)) {
    throw new Error('Gaps must be an array');
  }

  if (!isValidObject(data.recommendation)) {
    throw new Error('Recommendation must be an object');
  }
}

/**
 * Generate a preview of the job description
 */
function generatePreview(jobDescription: string): string {
  const trimmed = jobDescription.trim();
  if (trimmed.length <= PREVIEW_LENGTH) {
    return trimmed;
  }
  return trimmed.substring(0, PREVIEW_LENGTH - 3) + '...';
}

/**
 * Parse an LLM analysis response string into a MatchAssessment
 *
 * @param responseText - The raw JSON string from the LLM
 * @param options - Parsing options including job description
 * @returns ParseResult with success status and assessment or error
 *
 * @example
 * ```typescript
 * const result = parseAnalysisResponse(llmOutput, {
 *   jobDescription: 'Senior Software Engineer...'
 * });
 *
 * if (result.success) {
 *   console.log(result.assessment);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function parseAnalysisResponse(
  responseText: string,
  options: ParseOptions
): ParseResult {
  const generateId = options.generateId ?? generateUniqueId;

  // Step 1: Parse JSON
  let data: unknown;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    return {
      success: false,
      error: `Failed to parse JSON: ${e instanceof Error ? e.message : 'Invalid JSON'}`,
    };
  }

  // Step 2: Validate basic structure
  try {
    validateLLMResponseStructure(data);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Invalid response structure',
    };
  }

  // At this point, we know data is a valid object with the expected structure
  const llmResponse = data as Record<string, unknown>;

  // Step 3: Parse and transform components
  try {
    const confidence = llmResponse.confidence as 'strong' | 'partial' | 'limited';
    const alignments = parseAlignments(llmResponse.alignments, generateId);
    const gaps = parseGaps(llmResponse.gaps, generateId);
    const recommendation = parseRecommendation(llmResponse.recommendation);

    // Step 4: Build MatchAssessment
    const assessment: MatchAssessment = {
      id: generateId(),
      timestamp: new Date(),
      jobDescriptionPreview: generatePreview(options.jobDescription),
      confidenceScore: CONFIDENCE_MAP[confidence],
      alignmentAreas: alignments,
      gapAreas: gaps,
      recommendation,
    };

    return {
      success: true,
      assessment,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to parse response components',
    };
  }
}

/**
 * Parse an LLM analysis response, throwing on error
 *
 * @param responseText - The raw JSON string from the LLM
 * @param options - Parsing options including job description
 * @returns MatchAssessment
 * @throws Error if parsing fails
 *
 * @example
 * ```typescript
 * try {
 *   const assessment = parseAnalysisResponseOrThrow(llmOutput, {
 *     jobDescription: 'Senior Software Engineer...'
 *   });
 *   console.log(assessment);
 * } catch (error) {
 *   console.error('Parsing failed:', error.message);
 * }
 * ```
 */
export function parseAnalysisResponseOrThrow(
  responseText: string,
  options: ParseOptions
): MatchAssessment {
  const result = parseAnalysisResponse(responseText, options);

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to parse analysis response');
  }

  return result.assessment!;
}

/**
 * Validate that a MatchAssessment has the required structure
 * Useful for validating assessments loaded from storage
 *
 * @param assessment - The assessment to validate
 * @returns true if valid, false otherwise
 */
export function isValidMatchAssessment(assessment: unknown): assessment is MatchAssessment {
  if (!isValidObject(assessment)) {
    return false;
  }

  // Check required string fields
  if (!isNonEmptyString(assessment.id)) return false;
  if (!isNonEmptyString(assessment.jobDescriptionPreview)) return false;

  // Check timestamp
  if (!(assessment.timestamp instanceof Date) && typeof assessment.timestamp !== 'string') {
    return false;
  }

  // Check confidence score
  const validConfidenceScores = ['strong_match', 'partial_match', 'limited_match'];
  if (!validConfidenceScores.includes(assessment.confidenceScore as string)) {
    return false;
  }

  // Check arrays
  if (!isValidArray(assessment.alignmentAreas)) return false;
  if (!isValidArray(assessment.gapAreas)) return false;

  // Check recommendation
  if (!isValidObject(assessment.recommendation)) return false;
  const rec = assessment.recommendation as Record<string, unknown>;
  if (!isValidVerdict(rec.type)) return false;
  if (!isNonEmptyString(rec.summary)) return false;
  if (!isNonEmptyString(rec.details)) return false;

  // Validate each alignment has evidence
  for (const alignment of assessment.alignmentAreas as unknown[]) {
    if (!isValidObject(alignment)) return false;
    const a = alignment as Record<string, unknown>;
    if (!isNonEmptyString(a.id)) return false;
    if (!isNonEmptyString(a.title)) return false;
    if (!isNonEmptyString(a.description)) return false;
    if (!isValidArray(a.evidence) || (a.evidence as unknown[]).length === 0) return false;

    // Validate each evidence item
    for (const evidence of a.evidence as unknown[]) {
      if (!isValidObject(evidence)) return false;
      const e = evidence as Record<string, unknown>;
      if (!['experience', 'project', 'skill'].includes(e.type as string)) return false;
      if (!isNonEmptyString(e.title)) return false;
      if (!isNonEmptyString(e.reference)) return false;
      if (!isNonEmptyString(e.excerpt)) return false;
    }
  }

  // Validate each gap has severity
  for (const gap of assessment.gapAreas as unknown[]) {
    if (!isValidObject(gap)) return false;
    const g = gap as Record<string, unknown>;
    if (!isNonEmptyString(g.id)) return false;
    if (!isNonEmptyString(g.title)) return false;
    if (!isNonEmptyString(g.description)) return false;
    if (!isValidSeverity(g.severity)) return false;
  }

  return true;
}
