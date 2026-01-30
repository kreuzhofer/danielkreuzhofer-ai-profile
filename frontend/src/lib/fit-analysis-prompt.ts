/**
 * Fit Analysis Prompt Builder
 *
 * This module builds the analysis prompt for the fit analysis feature.
 * It loads the portfolio context using the existing knowledge loader
 * and constructs a prompt for honest fit assessment.
 *
 * @see Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { loadAllContent, compileKnowledgeContext } from "./knowledge-loader";

/**
 * Analysis prompt template for honest fit assessment.
 * 
 * The template instructs the LLM to:
 * - Be radically transparent about alignment and gaps
 * - Only claim alignment for documented skills/experience
 * - Cite specific evidence from the portfolio
 * - Provide honest recommendations including "may not be the right fit"
 */
const ANALYSIS_PROMPT_TEMPLATE = `
You are analyzing a job description against a professional portfolio to provide an honest fit assessment.

PERSONALITY:
- Be radically transparent - honesty builds trust
- Acknowledge gaps clearly without minimizing them
- Provide evidence for alignment claims
- Use peer tone - confident but not arrogant

ANALYSIS RULES:
1. Only claim alignment for skills/experience explicitly documented in the context
2. Cite specific projects, roles, or decisions as evidence
3. Identify gaps honestly - it's okay to say "this may not be the right fit"
4. Consider both technical skills and domain experience
5. Weight recent experience more heavily than older experience

CONTEXT (Portfolio Owner's Background):
{context}

JOB DESCRIPTION TO ANALYZE:
{jobDescription}

Provide your analysis in the following JSON format:
{
  "confidence": "strong" | "partial" | "limited",
  "alignments": [
    {
      "area": "skill or requirement name",
      "explanation": "why this aligns",
      "evidence": [
        { "source": "project/role name", "detail": "specific relevant detail" }
      ]
    }
  ],
  "gaps": [
    {
      "area": "requirement name",
      "explanation": "why this is a gap",
      "severity": "minor" | "moderate" | "significant"
    }
  ],
  "recommendation": {
    "verdict": "proceed" | "consider" | "reconsider",
    "summary": "one sentence recommendation",
    "reasoning": "brief explanation of the recommendation"
  }
}
`;

/**
 * Build the analysis prompt by loading portfolio context and inserting the job description.
 *
 * @param jobDescription - The job description text to analyze
 * @returns The complete prompt string ready for LLM consumption
 *
 * @see Requirement 9.1 - Access to all experience entries
 * @see Requirement 9.2 - Access to all project details
 * @see Requirement 9.3 - Access to skills and certifications
 * @see Requirement 9.4 - Cite specific content as evidence
 * @see Requirement 9.5 - Use same Knowledge_Base as AI chatbot
 */
export async function buildAnalysisPrompt(
  jobDescription: string
): Promise<string> {
  // Load all knowledge content using the existing knowledge loader
  const knowledge = await loadAllContent();

  // Compile the knowledge into context sections
  const compiled = compileKnowledgeContext(knowledge);

  // Extract the context string from the compiled knowledge
  // The compiled knowledge contains contextSections which we format for the prompt
  const contextString = compiled.contextSections
    .map((section) => section.content)
    .join("\n\n---\n\n");

  // Build the prompt by replacing placeholders
  const prompt = ANALYSIS_PROMPT_TEMPLATE.replace(
    "{context}",
    contextString
  ).replace("{jobDescription}", jobDescription);

  return prompt;
}

/**
 * Get the raw analysis prompt template (for testing purposes)
 */
export function getAnalysisPromptTemplate(): string {
  return ANALYSIS_PROMPT_TEMPLATE;
}
