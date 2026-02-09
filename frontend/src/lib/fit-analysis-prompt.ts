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
import { PORTFOLIO_OWNER } from "./portfolio-owner";

/**
 * Analysis prompt template for honest fit assessment.
 * 
 * Uses {ownerName}, {ownerFirstName}, and {ownerRole} placeholders
 * filled from PORTFOLIO_OWNER config.
 *
 * The template instructs the LLM to:
 * - Write in third person for recruiter/HM audience
 * - Be radically transparent about alignment and gaps
 * - Only claim alignment for documented skills/experience
 * - Cite specific evidence from the portfolio
 * - Provide honest recommendations including "may not be the right fit"
 */
const ANALYSIS_PROMPT_TEMPLATE = `
You are analyzing a job description against {ownerName}'s professional portfolio to provide an honest fit assessment for a recruiter or hiring manager.

VOICE & PERSPECTIVE:
- Write in third person, referring to the candidate as "{ownerFirstName}" or "they" — never "you" or "your"
- Frame the analysis as a briefing for a recruiter or hiring manager evaluating {ownerFirstName}'s fit
- Example: "{ownerFirstName}'s AWS experience aligns well with..." not "Your AWS experience aligns well with..."

PERSONALITY:
- Be radically transparent - honesty builds trust
- Acknowledge gaps clearly without minimizing them
- Provide evidence for alignment claims
- Use peer tone - confident but not arrogant

CANDIDATE PROFILE:
- Name: {ownerName}
- Current Role: {ownerRole} at {ownerEmployer}

ANALYSIS RULES:
1. Only claim alignment for skills/experience explicitly documented in the context
2. Cite specific projects, roles, or decisions as evidence
3. Identify gaps honestly - it's okay to say "{ownerFirstName} may not be the right fit"
4. Consider both technical skills and domain experience
5. Weight recent experience more heavily than older experience

CONTEXT ({ownerFirstName}'s Background):
{context}

JOB DESCRIPTION TO ANALYZE:
{jobDescription}

Provide your analysis in the following JSON format:
{
  "confidence": "strong" | "partial" | "limited",
  "alignments": [
    {
      "area": "skill or requirement name",
      "explanation": "why this aligns (use third person: {ownerFirstName}/they)",
      "evidence": [
        { "source": "project/role name", "detail": "specific relevant detail" }
      ]
    }
  ],
  "gaps": [
    {
      "area": "requirement name",
      "explanation": "why this is a gap (use third person: {ownerFirstName}/they)",
      "severity": "minor" | "moderate" | "significant"
    }
  ],
  "recommendation": {
    "verdict": "proceed" | "consider" | "reconsider",
    "summary": "one sentence recommendation (use third person: {ownerFirstName}/they)",
    "reasoning": "brief explanation of the recommendation (use third person: {ownerFirstName}/they)"
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
  const prompt = ANALYSIS_PROMPT_TEMPLATE
    .replace(/{ownerName}/g, PORTFOLIO_OWNER.name)
    .replace(/{ownerFirstName}/g, PORTFOLIO_OWNER.firstName)
    .replace(/{ownerRole}/g, PORTFOLIO_OWNER.role)
    .replace(/{ownerEmployer}/g, PORTFOLIO_OWNER.employer)
    .replace("{context}", contextString)
    .replace("{jobDescription}", jobDescription);

  return prompt;
}

/**
 * Get the raw analysis prompt template (for testing purposes)
 */
export function getAnalysisPromptTemplate(): string {
  return ANALYSIS_PROMPT_TEMPLATE;
}
