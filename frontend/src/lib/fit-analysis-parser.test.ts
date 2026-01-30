/**
 * Unit tests for Fit Analysis Response Parser
 *
 * Tests parsing, validation, and transformation of LLM responses
 * into MatchAssessment objects.
 *
 * @see Requirements 3.2, 3.3, 3.4, 3.5, 3.6
 */

import {
  parseAnalysisResponse,
  parseAnalysisResponseOrThrow,
  isValidMatchAssessment,
  generateUniqueId,
  type ParseOptions,
} from './fit-analysis-parser';
import type { MatchAssessment } from '@/types/fit-analysis';

// =============================================================================
// Test Fixtures
// =============================================================================

const createValidLLMResponse = () => ({
  confidence: 'strong',
  alignments: [
    {
      area: 'TypeScript Development',
      explanation: 'Strong background in TypeScript with multiple production projects',
      evidence: [
        {
          source: 'Portfolio Website Project',
          detail: 'Built with Next.js and TypeScript, demonstrating modern frontend skills',
        },
      ],
    },
  ],
  gaps: [
    {
      area: 'Machine Learning',
      explanation: 'No documented experience with ML frameworks',
      severity: 'moderate',
    },
  ],
  recommendation: {
    verdict: 'consider',
    summary: 'Worth exploring if ML is not a core requirement',
    reasoning: 'Strong technical foundation but lacks specific ML experience mentioned in the role.',
  },
});

const createParseOptions = (overrides?: Partial<ParseOptions>): ParseOptions => ({
  jobDescription: 'Senior Software Engineer with TypeScript experience...',
  generateId: () => 'test-id-123',
  ...overrides,
});

// =============================================================================
// JSON Parsing Tests
// =============================================================================

describe('parseAnalysisResponse - JSON Parsing', () => {
  it('should parse valid JSON successfully', () => {
    const response = JSON.stringify(createValidLLMResponse());
    const result = parseAnalysisResponse(response, createParseOptions());

    expect(result.success).toBe(true);
    expect(result.assessment).toBeDefined();
  });

  it('should return error for invalid JSON', () => {
    const result = parseAnalysisResponse('not valid json', createParseOptions());

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to parse JSON');
  });

  it('should return error for empty string', () => {
    const result = parseAnalysisResponse('', createParseOptions());

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to parse JSON');
  });

  it('should return error for null JSON', () => {
    const result = parseAnalysisResponse('null', createParseOptions());

    expect(result.success).toBe(false);
    expect(result.error).toContain('Response must be a JSON object');
  });

  it('should return error for array JSON', () => {
    const result = parseAnalysisResponse('[]', createParseOptions());

    expect(result.success).toBe(false);
    expect(result.error).toContain('Response must be a JSON object');
  });
});

// =============================================================================
// Confidence Mapping Tests
// =============================================================================

describe('parseAnalysisResponse - Confidence Mapping', () => {
  it('should map "strong" to "strong_match"', () => {
    const llmResponse = { ...createValidLLMResponse(), confidence: 'strong' };
    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.confidenceScore).toBe('strong_match');
  });

  it('should map "partial" to "partial_match"', () => {
    const llmResponse = { ...createValidLLMResponse(), confidence: 'partial' };
    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.confidenceScore).toBe('partial_match');
  });

  it('should map "limited" to "limited_match"', () => {
    const llmResponse = { ...createValidLLMResponse(), confidence: 'limited' };
    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.confidenceScore).toBe('limited_match');
  });

  it('should return error for invalid confidence value', () => {
    const llmResponse = { ...createValidLLMResponse(), confidence: 'invalid' };
    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid confidence value');
  });

  it('should return error for missing confidence', () => {
    const llmResponse = createValidLLMResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (llmResponse as any).confidence;
    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid confidence value');
  });
});

// =============================================================================
// Alignment Parsing Tests
// =============================================================================

describe('parseAnalysisResponse - Alignments', () => {
  it('should parse alignments with evidence', () => {
    const result = parseAnalysisResponse(
      JSON.stringify(createValidLLMResponse()),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas).toHaveLength(1);
    expect(result.assessment?.alignmentAreas[0]).toMatchObject({
      id: 'test-id-123',
      title: 'TypeScript Development',
      description: 'Strong background in TypeScript with multiple production projects',
    });
  });

  it('should parse evidence with inferred type', () => {
    const result = parseAnalysisResponse(
      JSON.stringify(createValidLLMResponse()),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    const evidence = result.assessment?.alignmentAreas[0].evidence[0];
    expect(evidence).toMatchObject({
      type: 'project',
      title: 'Portfolio Website Project',
      excerpt: 'Built with Next.js and TypeScript, demonstrating modern frontend skills',
    });
    expect(evidence?.reference).toBe('portfolio-website-project');
  });

  it('should infer "experience" type for role-related sources', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.alignments[0].evidence[0].source = 'Senior Developer Role at TechCorp';

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas[0].evidence[0].type).toBe('experience');
  });

  it('should infer "skill" type for generic sources', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.alignments[0].evidence[0].source = 'TypeScript Certification';

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas[0].evidence[0].type).toBe('skill');
  });

  it('should skip alignments without evidence', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.alignments.push({
      area: 'No Evidence Area',
      explanation: 'This has no evidence',
      evidence: [],
    });

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas).toHaveLength(1);
  });

  it('should skip alignments with invalid evidence', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.alignments.push({
      area: 'Invalid Evidence Area',
      explanation: 'This has invalid evidence',
      evidence: [{ source: '', detail: '' }],
    });

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas).toHaveLength(1);
  });

  it('should handle empty alignments array', () => {
    const llmResponse = { ...createValidLLMResponse(), alignments: [] };
    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas).toHaveLength(0);
  });

  it('should return error when alignments is not an array', () => {
    const llmResponse = { ...createValidLLMResponse(), alignments: 'not an array' };
    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Alignments must be an array');
  });

  it('should parse multiple alignments with multiple evidence items', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.alignments = [
      {
        area: 'Frontend Development',
        explanation: 'Extensive React experience',
        evidence: [
          { source: 'E-commerce Project', detail: 'Built React frontend' },
          { source: 'Dashboard Project', detail: 'Created admin dashboard' },
        ],
      },
      {
        area: 'Backend Development',
        explanation: 'Node.js expertise',
        evidence: [
          { source: 'API Development Role', detail: 'Built REST APIs' },
        ],
      },
    ];

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas).toHaveLength(2);
    expect(result.assessment?.alignmentAreas[0].evidence).toHaveLength(2);
    expect(result.assessment?.alignmentAreas[1].evidence).toHaveLength(1);
  });
});

// =============================================================================
// Gap Parsing Tests
// =============================================================================

describe('parseAnalysisResponse - Gaps', () => {
  it('should parse gaps with severity', () => {
    const result = parseAnalysisResponse(
      JSON.stringify(createValidLLMResponse()),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.gapAreas).toHaveLength(1);
    expect(result.assessment?.gapAreas[0]).toMatchObject({
      id: 'test-id-123',
      title: 'Machine Learning',
      description: 'No documented experience with ML frameworks',
      severity: 'moderate',
    });
  });

  it('should parse all severity levels', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.gaps = [
      { area: 'Minor Gap', explanation: 'Small issue', severity: 'minor' },
      { area: 'Moderate Gap', explanation: 'Medium issue', severity: 'moderate' },
      { area: 'Significant Gap', explanation: 'Big issue', severity: 'significant' },
    ];

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.gapAreas).toHaveLength(3);
    expect(result.assessment?.gapAreas[0].severity).toBe('minor');
    expect(result.assessment?.gapAreas[1].severity).toBe('moderate');
    expect(result.assessment?.gapAreas[2].severity).toBe('significant');
  });

  it('should skip gaps with invalid severity', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.gaps.push({
      area: 'Invalid Severity',
      explanation: 'Has invalid severity',
      severity: 'invalid' as 'minor',
    });

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.gapAreas).toHaveLength(1);
  });

  it('should skip gaps with missing fields', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.gaps.push({
      area: '',
      explanation: 'Missing area',
      severity: 'minor',
    });

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.gapAreas).toHaveLength(1);
  });

  it('should handle empty gaps array', () => {
    const llmResponse = { ...createValidLLMResponse(), gaps: [] };
    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.gapAreas).toHaveLength(0);
  });

  it('should return error when gaps is not an array', () => {
    const llmResponse = { ...createValidLLMResponse(), gaps: 'not an array' };
    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Gaps must be an array');
  });
});

// =============================================================================
// Recommendation Parsing Tests
// =============================================================================

describe('parseAnalysisResponse - Recommendation', () => {
  it('should parse recommendation with verdict mapping', () => {
    const result = parseAnalysisResponse(
      JSON.stringify(createValidLLMResponse()),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.recommendation).toMatchObject({
      type: 'consider',
      summary: 'Worth exploring if ML is not a core requirement',
      details: 'Strong technical foundation but lacks specific ML experience mentioned in the role.',
    });
  });

  it('should map "proceed" verdict to "proceed" type', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.recommendation.verdict = 'proceed';

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.recommendation.type).toBe('proceed');
  });

  it('should map "reconsider" verdict to "reconsider" type', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.recommendation.verdict = 'reconsider';

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.recommendation.type).toBe('reconsider');
  });

  it('should return error for invalid verdict', () => {
    const llmResponse = createValidLLMResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (llmResponse.recommendation as any).verdict = 'invalid';

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid recommendation verdict');
  });

  it('should return error for missing summary', () => {
    const llmResponse = createValidLLMResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (llmResponse.recommendation as any).summary = '';

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Recommendation summary must be a non-empty string');
  });

  it('should return error for missing reasoning', () => {
    const llmResponse = createValidLLMResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (llmResponse.recommendation as any).reasoning = '';

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Recommendation reasoning must be a non-empty string');
  });

  it('should return error when recommendation is not an object', () => {
    const llmResponse = { ...createValidLLMResponse(), recommendation: 'not an object' };
    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Recommendation must be an object');
  });
});

// =============================================================================
// Job Description Preview Tests
// =============================================================================

describe('parseAnalysisResponse - Job Description Preview', () => {
  it('should generate preview from short job description', () => {
    const options = createParseOptions({
      jobDescription: 'Short description',
    });

    const result = parseAnalysisResponse(
      JSON.stringify(createValidLLMResponse()),
      options
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.jobDescriptionPreview).toBe('Short description');
  });

  it('should truncate long job descriptions to 100 characters', () => {
    const longDescription = 'A'.repeat(150);
    const options = createParseOptions({
      jobDescription: longDescription,
    });

    const result = parseAnalysisResponse(
      JSON.stringify(createValidLLMResponse()),
      options
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.jobDescriptionPreview).toHaveLength(100);
    expect(result.assessment?.jobDescriptionPreview?.endsWith('...')).toBe(true);
  });

  it('should trim whitespace from job description', () => {
    const options = createParseOptions({
      jobDescription: '  Trimmed description  ',
    });

    const result = parseAnalysisResponse(
      JSON.stringify(createValidLLMResponse()),
      options
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.jobDescriptionPreview).toBe('Trimmed description');
  });
});

// =============================================================================
// ID Generation Tests
// =============================================================================

describe('parseAnalysisResponse - ID Generation', () => {
  it('should use custom ID generator when provided', () => {
    let idCounter = 0;
    const options = createParseOptions({
      generateId: () => `custom-id-${++idCounter}`,
    });

    const result = parseAnalysisResponse(
      JSON.stringify(createValidLLMResponse()),
      options
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas[0].id).toBe('custom-id-1');
    expect(result.assessment?.gapAreas[0].id).toBe('custom-id-2');
    expect(result.assessment?.id).toBe('custom-id-3');
  });

  it('should generate unique IDs by default', () => {
    const options = createParseOptions();
    delete options.generateId;

    const result = parseAnalysisResponse(
      JSON.stringify(createValidLLMResponse()),
      options
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.id).toBeTruthy();
    expect(result.assessment?.alignmentAreas[0].id).toBeTruthy();
    expect(result.assessment?.gapAreas[0].id).toBeTruthy();
  });
});

describe('generateUniqueId', () => {
  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateUniqueId());
    }
    expect(ids.size).toBe(100);
  });

  it('should generate IDs with expected format', () => {
    const id = generateUniqueId();
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

// =============================================================================
// Timestamp Tests
// =============================================================================

describe('parseAnalysisResponse - Timestamp', () => {
  it('should set timestamp to current date', () => {
    const before = new Date();
    const result = parseAnalysisResponse(
      JSON.stringify(createValidLLMResponse()),
      createParseOptions()
    );
    const after = new Date();

    expect(result.success).toBe(true);
    expect(result.assessment?.timestamp).toBeInstanceOf(Date);
    expect(result.assessment?.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(result.assessment?.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

// =============================================================================
// parseAnalysisResponseOrThrow Tests
// =============================================================================

describe('parseAnalysisResponseOrThrow', () => {
  it('should return assessment for valid response', () => {
    const assessment = parseAnalysisResponseOrThrow(
      JSON.stringify(createValidLLMResponse()),
      createParseOptions()
    );

    expect(assessment).toBeDefined();
    expect(assessment.confidenceScore).toBe('strong_match');
  });

  it('should throw for invalid JSON', () => {
    expect(() => {
      parseAnalysisResponseOrThrow('invalid json', createParseOptions());
    }).toThrow('Failed to parse JSON');
  });

  it('should throw for invalid structure', () => {
    expect(() => {
      parseAnalysisResponseOrThrow('{}', createParseOptions());
    }).toThrow('Invalid confidence value');
  });
});

// =============================================================================
// isValidMatchAssessment Tests
// =============================================================================

describe('isValidMatchAssessment', () => {
  it('should return true for valid assessment', () => {
    const assessment: MatchAssessment = {
      id: 'test-id',
      timestamp: new Date(),
      jobDescriptionPreview: 'Test preview',
      confidenceScore: 'strong_match',
      alignmentAreas: [
        {
          id: 'align-1',
          title: 'Test Alignment',
          description: 'Test description',
          evidence: [
            {
              type: 'project',
              title: 'Test Project',
              reference: 'test-project',
              excerpt: 'Test excerpt',
            },
          ],
        },
      ],
      gapAreas: [
        {
          id: 'gap-1',
          title: 'Test Gap',
          description: 'Test gap description',
          severity: 'minor',
        },
      ],
      recommendation: {
        type: 'proceed',
        summary: 'Test summary',
        details: 'Test details',
      },
    };

    expect(isValidMatchAssessment(assessment)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidMatchAssessment(null)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidMatchAssessment('string')).toBe(false);
    expect(isValidMatchAssessment(123)).toBe(false);
    expect(isValidMatchAssessment([])).toBe(false);
  });

  it('should return false for missing id', () => {
    const assessment = {
      timestamp: new Date(),
      jobDescriptionPreview: 'Test',
      confidenceScore: 'strong_match',
      alignmentAreas: [],
      gapAreas: [],
      recommendation: { type: 'proceed', summary: 'Test', details: 'Test' },
    };
    expect(isValidMatchAssessment(assessment)).toBe(false);
  });

  it('should return false for invalid confidence score', () => {
    const assessment = {
      id: 'test',
      timestamp: new Date(),
      jobDescriptionPreview: 'Test',
      confidenceScore: 'invalid',
      alignmentAreas: [],
      gapAreas: [],
      recommendation: { type: 'proceed', summary: 'Test', details: 'Test' },
    };
    expect(isValidMatchAssessment(assessment)).toBe(false);
  });

  it('should return false for alignment without evidence', () => {
    const assessment = {
      id: 'test',
      timestamp: new Date(),
      jobDescriptionPreview: 'Test',
      confidenceScore: 'strong_match',
      alignmentAreas: [
        {
          id: 'align-1',
          title: 'Test',
          description: 'Test',
          evidence: [],
        },
      ],
      gapAreas: [],
      recommendation: { type: 'proceed', summary: 'Test', details: 'Test' },
    };
    expect(isValidMatchAssessment(assessment)).toBe(false);
  });

  it('should return false for gap with invalid severity', () => {
    const assessment = {
      id: 'test',
      timestamp: new Date(),
      jobDescriptionPreview: 'Test',
      confidenceScore: 'strong_match',
      alignmentAreas: [],
      gapAreas: [
        {
          id: 'gap-1',
          title: 'Test',
          description: 'Test',
          severity: 'invalid',
        },
      ],
      recommendation: { type: 'proceed', summary: 'Test', details: 'Test' },
    };
    expect(isValidMatchAssessment(assessment)).toBe(false);
  });

  it('should return false for invalid recommendation type', () => {
    const assessment = {
      id: 'test',
      timestamp: new Date(),
      jobDescriptionPreview: 'Test',
      confidenceScore: 'strong_match',
      alignmentAreas: [],
      gapAreas: [],
      recommendation: { type: 'invalid', summary: 'Test', details: 'Test' },
    };
    expect(isValidMatchAssessment(assessment)).toBe(false);
  });

  it('should accept string timestamp (for deserialized data)', () => {
    const assessment = {
      id: 'test',
      timestamp: '2024-01-01T00:00:00.000Z',
      jobDescriptionPreview: 'Test',
      confidenceScore: 'strong_match',
      alignmentAreas: [],
      gapAreas: [],
      recommendation: { type: 'proceed', summary: 'Test', details: 'Test' },
    };
    expect(isValidMatchAssessment(assessment)).toBe(true);
  });

  it('should return false for evidence with invalid type', () => {
    const assessment = {
      id: 'test',
      timestamp: new Date(),
      jobDescriptionPreview: 'Test',
      confidenceScore: 'strong_match',
      alignmentAreas: [
        {
          id: 'align-1',
          title: 'Test',
          description: 'Test',
          evidence: [
            {
              type: 'invalid',
              title: 'Test',
              reference: 'test',
              excerpt: 'Test',
            },
          ],
        },
      ],
      gapAreas: [],
      recommendation: { type: 'proceed', summary: 'Test', details: 'Test' },
    };
    expect(isValidMatchAssessment(assessment)).toBe(false);
  });
});

// =============================================================================
// Edge Cases and Malformed Response Tests
// =============================================================================

describe('parseAnalysisResponse - Edge Cases', () => {
  it('should handle response with extra fields gracefully', () => {
    const llmResponse = {
      ...createValidLLMResponse(),
      extraField: 'should be ignored',
      anotherExtra: { nested: 'data' },
    };

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
  });

  it('should handle whitespace-only strings in fields', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.alignments[0].area = '   ';

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas).toHaveLength(0);
  });

  it('should handle special characters in text fields', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.alignments[0].area = 'TypeScript & React <Development>';
    llmResponse.alignments[0].explanation = 'Uses "quotes" and \'apostrophes\'';

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas[0].title).toBe('TypeScript & React <Development>');
  });

  it('should handle unicode characters', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.alignments[0].area = '日本語 Development 🚀';

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas[0].title).toBe('日本語 Development 🚀');
  });

  it('should generate clean reference from source with special characters', () => {
    const llmResponse = createValidLLMResponse();
    llmResponse.alignments[0].evidence[0].source = 'Project: E-Commerce (2023)';

    const result = parseAnalysisResponse(
      JSON.stringify(llmResponse),
      createParseOptions()
    );

    expect(result.success).toBe(true);
    expect(result.assessment?.alignmentAreas[0].evidence[0].reference).toBe('project-e-commerce-2023');
  });
});
