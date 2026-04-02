/**
 * Chat Suggestion Questions
 * 
 * A curated list of clever questions about Daniel Kreuzhofer's
 * professional background, experience, and expertise.
 */

export const STARTER_QUESTIONS = [
  // Career & Experience (supported by experience MDX + aws-sa-journey.md)
  "What's your journey from banking software to cloud architecture?",
  "How did you transition from Microsoft to AWS?",
  "What was it like founding your own software company for 7 years?",

  // Technical Expertise (supported by projects, skills, aws-current.md)
  "What's your approach to migrating .NET workloads to AWS?",
  "How do you evaluate whether a company is ready for AI adoption?",
  "Tell me about your Chat3D project — teaching LLMs to generate 3D models",

  // Leadership & Strategy (supported by aws-team-lead.md)
  "What did you learn from leading a team of Solutions Architects at AWS?",
  "How do you approach mentoring and developing team members?",
  "What's your honest assessment of your leadership strengths and limits?",

  // Industry Knowledge (supported by experience MDX files)
  "What industries have you worked with most?",
  "What's your experience with media & entertainment cloud infrastructure?",
  "How did you handle compliance requirements in healthcare architecture?",

  // Entrepreneurial & Projects (supported by experience + projects)
  "Tell me about your Crosslink Media YouTube channel and 3D printing work",
  "What did you learn from building the Nebius Slurm ML demo on H100 GPUs?",
  "How did you build this portfolio site with AI-assisted development?",

  // AI & GenAI (supported by aws-current.md, blog posts, projects)
  "What's your methodology for taking AI from use case to prototype?",
  "How did open-weight models compare to frontier models in your experiments?",
  "What are the biggest customer challenges you see in AI adoption?",

  // Skills & Background (supported by skills.mdx, knowledge files)
  "How has your Microsoft background helped at AWS?",
  "What's your experience with spec-driven AI-assisted development?",
];

/**
 * Get 3 random starter questions for the initial chat view
 */
export function getRandomStarterQuestions(count: number = 3): string[] {
  const shuffled = [...STARTER_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Fetch AI-generated follow-up suggestions based on conversation history.
 * Calls /api/suggestions which uses an LLM to generate contextual,
 * non-repetitive follow-up questions.
 */
export async function fetchFollowUpSuggestions(
  messages: Array<{ role: string; content: string }>
): Promise<string[]> {
  try {
    const response = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch {
    return [];
  }
}
