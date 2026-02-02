/**
 * Fit Analysis Type Definitions
 *
 * These types define the structure of the Automated Fit Analysis Module including
 * match assessments, alignment areas, gap areas, evidence, recommendations,
 * and error handling.
 *
 * @see Requirements 3.2, 3.3, 3.4, 3.5, 3.6
 */

// =============================================================================
// Analysis Progress Types
// =============================================================================

/**
 * Phases of the analysis process for progress tracking
 */
export type AnalysisPhase = 
  | 'preparing'
  | 'analyzing'
  | 'finding_alignments'
  | 'identifying_gaps'
  | 'generating_recommendation'
  | 'finalizing';

/**
 * Progress update sent during streaming analysis
 */
export interface AnalysisProgress {
  phase: AnalysisPhase;
  message: string;
  percent: number;
}

/**
 * Display configuration for analysis phases
 */
export const ANALYSIS_PHASE_DISPLAY: Record<AnalysisPhase, { message: string; percent: number }> = {
  preparing: { message: 'Preparing analysis...', percent: 5 },
  analyzing: { message: 'Analyzing fit...', percent: 20 },
  finding_alignments: { message: 'Finding alignments...', percent: 40 },
  identifying_gaps: { message: 'Identifying gaps...', percent: 60 },
  generating_recommendation: { message: 'Generating recommendation...', percent: 80 },
  finalizing: { message: 'Finalizing results...', percent: 95 },
};

// =============================================================================
// Confidence Level Types
// =============================================================================

/**
 * Confidence level indicating overall fit between job description and portfolio
 * - strong_match: Experience aligns well with most key requirements
 * - partial_match: Some alignment with notable gaps to consider
 * - limited_match: Significant gaps between requirements and experience
 *
 * @see Requirement 3.2
 */
export type ConfidenceLevel = 'strong_match' | 'partial_match' | 'limited_match';

// =============================================================================
// Evidence Types
// =============================================================================

/**
 * Type of evidence source from the Knowledge_Base
 */
export type EvidenceType = 'experience' | 'project' | 'skill';

/**
 * Evidence reference supporting an alignment claim
 * Links to specific projects, roles, or documented decisions
 *
 * @see Requirements 3.5, 4.1, 4.2
 */
export interface Evidence {
  /** Type of evidence source */
  type: EvidenceType;
  /** Title of the evidence (project name, role title, skill name) */
  title: string;
  /** ID or path to content in the Knowledge_Base */
  reference: string;
  /** Relevant quote or summary from the source */
  excerpt: string;
}

// =============================================================================
// Alignment and Gap Types
// =============================================================================

/**
 * An area where the portfolio owner's background matches job requirements
 *
 * @see Requirement 3.3
 */
export interface AlignmentArea {
  /** Unique identifier for this alignment area */
  id: string;
  /** Title of the skill or requirement that aligns */
  title: string;
  /** Description of why this aligns */
  description: string;
  /** Evidence references from the Knowledge_Base supporting this alignment */
  evidence: Evidence[];
}

/**
 * Severity level of a gap area
 * - minor: Small gap that likely won't impact fit significantly
 * - moderate: Notable gap that should be considered
 * - significant: Major gap that may affect suitability for the role
 */
export type GapSeverity = 'minor' | 'moderate' | 'significant';

/**
 * An area where documented experience is limited or absent
 *
 * @see Requirement 3.4
 */
export interface GapArea {
  /** Unique identifier for this gap area */
  id: string;
  /** Title of the requirement where there's a gap */
  title: string;
  /** Description of the gap (stated transparently) */
  description: string;
  /** Severity level of this gap */
  severity: GapSeverity;
}

// =============================================================================
// Recommendation Types
// =============================================================================

/**
 * Type of recommendation
 * - proceed: Strong alignment, worth pursuing
 * - consider: Mixed alignment, worth exploring if gaps aren't critical
 * - reconsider: Limited alignment, may not be the right fit
 */
export type RecommendationType = 'proceed' | 'consider' | 'reconsider';

/**
 * Honest recommendation based on the analysis
 *
 * @see Requirement 3.6
 */
export interface Recommendation {
  /** Type of recommendation */
  type: RecommendationType;
  /** One-sentence summary of the recommendation */
  summary: string;
  /** Detailed explanation of the recommendation */
  details: string;
}

// =============================================================================
// Match Assessment Types
// =============================================================================

/**
 * Complete match assessment returned from analysis
 * Contains all sections: confidence, alignments, gaps, and recommendation
 *
 * @see Requirements 3.2, 3.3, 3.4, 3.5, 3.6
 */
export interface MatchAssessment {
  /** Unique identifier for this assessment */
  id: string;
  /** When the analysis was performed */
  timestamp: Date;
  /** First 100 characters of job description for history display */
  jobDescriptionPreview: string;
  /** Overall confidence level of the match */
  confidenceScore: ConfidenceLevel;
  /** Areas where experience aligns with requirements */
  alignmentAreas: AlignmentArea[];
  /** Areas where there are gaps in experience */
  gapAreas: GapArea[];
  /** Honest recommendation based on the analysis */
  recommendation: Recommendation;
}

// =============================================================================
// Analysis History Types
// =============================================================================

/**
 * Summary item for analysis history display
 * Contains minimal data needed for history list
 *
 * @see Requirements 5.1, 5.2, 5.5
 */
export interface AnalysisHistoryItem {
  /** Unique identifier for this analysis */
  id: string;
  /** When the analysis was performed */
  timestamp: Date;
  /** First 100 characters of job description for preview */
  jobDescriptionPreview: string;
  /** Overall confidence level for quick reference */
  confidenceScore: ConfidenceLevel;
}

// =============================================================================
// Error Types
// =============================================================================

/**
 * Types of errors that can occur during fit analysis operations
 * - validation: Input validation failed
 * - network: Network connection issue
 * - timeout: Analysis took too long (30 second limit)
 * - server: Server returned an error
 * - unknown: Unexpected error occurred
 *
 * @see Requirements 6.1, 6.2, 6.3
 */
export type FitAnalysisErrorType =
  | 'validation'
  | 'network'
  | 'timeout'
  | 'server'
  | 'unknown';

/**
 * Error information for fit analysis operations
 *
 * @see Requirements 6.1, 6.2, 6.3, 6.4
 */
export interface FitAnalysisError {
  /** Category of the error */
  type: FitAnalysisErrorType;
  /** User-friendly error message */
  message: string;
  /** Whether the operation can be retried */
  retryable: boolean;
}

// =============================================================================
// Input Validation Types
// =============================================================================

/**
 * Result of validating job description input
 */
export interface InputValidation {
  /** Whether the input is valid for submission */
  isValid: boolean;
  /** Error message if validation failed */
  errorMessage: string | null;
  /** Warning message (e.g., for short input) */
  warningMessage: string | null;
}

// =============================================================================
// Context Types
// =============================================================================

/**
 * Value provided by the FitAnalysisContext to consumers
 *
 * @see Requirements 2.1, 5.1, 5.2, 5.3, 6.4
 */
export interface FitAnalysisContextValue {
  // State
  /** Current job description text */
  jobDescription: string;
  /** Whether analysis is in progress */
  isAnalyzing: boolean;
  /** Current analysis result, if any */
  currentResult: MatchAssessment | null;
  /** History of recent analyses (max 5) */
  analysisHistory: AnalysisHistoryItem[];
  /** Current error, if any */
  error: FitAnalysisError | null;
  /** Current analysis progress, if analyzing */
  analysisProgress: AnalysisProgress | null;

  // Actions
  /** Update the job description text */
  setJobDescription: (text: string) => void;
  /** Submit the current job description for analysis */
  submitAnalysis: () => Promise<void>;
  /** Clear the current result to start a new analysis */
  clearCurrentResult: () => void;
  /** Load a previous analysis from history */
  loadHistoryItem: (id: string) => void;
  /** Clear all analysis history */
  clearHistory: () => void;
  /** Retry the last failed analysis */
  retryAnalysis: () => Promise<void>;
}

// =============================================================================
// API Types
// =============================================================================

/**
 * Request body for POST /api/analyze
 */
export interface AnalyzeRequest {
  /** Job description text to analyze */
  jobDescription: string;
}

/**
 * Response from POST /api/analyze
 */
export interface AnalyzeResponse {
  /** Whether the analysis was successful */
  success: boolean;
  /** The match assessment if successful */
  assessment?: MatchAssessment;
  /** Error information if unsuccessful */
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Internal LLM response structure before transformation
 */
export interface LLMAnalysisResponse {
  confidence: 'strong' | 'partial' | 'limited';
  alignments: Array<{
    area: string;
    explanation: string;
    evidence: Array<{
      source: string;
      detail: string;
    }>;
  }>;
  gaps: Array<{
    area: string;
    explanation: string;
    severity: 'minor' | 'moderate' | 'significant';
  }>;
  recommendation: {
    verdict: 'proceed' | 'consider' | 'reconsider';
    summary: string;
    reasoning: string;
  };
}

// =============================================================================
// Session Storage Types
// =============================================================================

/**
 * Serialized analysis item for session storage
 */
export interface SerializedAnalysisItem {
  id: string;
  timestamp: string; // ISO timestamp
  jobDescriptionPreview: string;
  jobDescriptionFull: string;
  confidenceScore: ConfidenceLevel;
  alignmentAreas: AlignmentArea[];
  gapAreas: GapArea[];
  recommendation: Recommendation;
}

/**
 * Fit analysis session data stored in sessionStorage
 */
export interface StoredFitAnalysisSession {
  analysisHistory: SerializedAnalysisItem[];
  lastUpdated: string; // ISO timestamp
}

/**
 * Storage key for fit analysis session
 */
export const FIT_ANALYSIS_STORAGE_KEY = 'portfolio-fit-analysis-session';

/**
 * Maximum number of analyses to keep in history
 */
export const MAX_HISTORY_ITEMS = 5;

// =============================================================================
// Constants
// =============================================================================

/**
 * Keyboard shortcuts for fit analysis interactions
 */
export const FIT_ANALYSIS_KEYBOARD_SHORTCUTS = {
  SUBMIT: 'Ctrl+Enter',
  CLEAR: 'Escape',
  NEW_ANALYSIS: 'Ctrl+N',
} as const;

/**
 * Input constraints for job description
 */
export const JOB_DESCRIPTION_CONSTRAINTS = {
  /** Maximum allowed characters */
  MAX_LENGTH: 5000,
  /** Minimum characters for quality warning */
  MIN_LENGTH_WARNING: 50,
} as const;

/**
 * Confidence level display configuration
 * Maps confidence levels to their display properties
 *
 * @see Requirement 7.5 - Not relying solely on color
 */
export const CONFIDENCE_DISPLAY: Record<
  ConfidenceLevel,
  {
    label: string;
    description: string;
    color: string;
    icon: string;
  }
> = {
  strong_match: {
    label: 'Strong Match',
    description: 'Experience aligns well with most key requirements',
    color: 'green',
    icon: 'check-circle',
  },
  partial_match: {
    label: 'Partial Match',
    description: 'Some alignment with notable gaps to consider',
    color: 'yellow',
    icon: 'minus-circle',
  },
  limited_match: {
    label: 'Limited Match',
    description: 'Significant gaps between requirements and experience',
    color: 'red',
    icon: 'x-circle',
  },
};

/**
 * Recommendation type display configuration
 */
export const RECOMMENDATION_DISPLAY: Record<
  RecommendationType,
  {
    label: string;
    color: string;
    icon: string;
  }
> = {
  proceed: {
    label: 'Recommended to Proceed',
    color: 'green',
    icon: 'thumbs-up',
  },
  consider: {
    label: 'Worth Considering',
    color: 'yellow',
    icon: 'scale',
  },
  reconsider: {
    label: 'May Not Be the Right Fit',
    color: 'red',
    icon: 'alert-triangle',
  },
};

/**
 * Gap severity display configuration
 */
export const GAP_SEVERITY_DISPLAY: Record<
  GapSeverity,
  {
    label: string;
    color: string;
  }
> = {
  minor: {
    label: 'Minor Gap',
    color: 'gray',
  },
  moderate: {
    label: 'Moderate Gap',
    color: 'yellow',
  },
  significant: {
    label: 'Significant Gap',
    color: 'red',
  },
};
