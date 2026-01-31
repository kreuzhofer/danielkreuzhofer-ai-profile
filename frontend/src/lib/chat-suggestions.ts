/**
 * Chat Suggestion Questions
 * 
 * A curated list of clever questions about Daniel Kreuzhofer's
 * professional background, experience, and expertise.
 */

export const STARTER_QUESTIONS = [
  // Career & Experience
  "What's your journey from banking software to cloud architecture?",
  "How did you transition from Microsoft to AWS?",
  "What made you start your own company while working at AWS?",
  
  // Technical Expertise
  "What's your approach to cloud migrations?",
  "How do you help companies get started with AI without the hype?",
  "What's your experience with GenAI implementation?",
  
  // Leadership & Strategy
  "How do you build trust with C-level executives?",
  "What's your philosophy on team leadership?",
  "How do you handle unclear or ambiguous situations?",
  
  // Industry Knowledge
  "What industries have you worked with most?",
  "What's unique about cloud solutions for media & entertainment?",
  "How does healthcare cloud architecture differ from other industries?",
  
  // Personal & Entrepreneurial
  "Tell me about your YouTube channel Crosslink",
  "What drives your passion for 3D printing and scanning?",
  "How do you balance entrepreneurship with your AWS role?",
  
  // Problem Solving
  "What's the biggest challenge in AI adoption you've seen?",
  "How do you approach stakeholder alignment?",
  "What lessons have you learned from failed projects?",
  
  // Skills & Certifications
  "What AWS certifications do you hold?",
  "How has your Microsoft background helped at AWS?",
];

/**
 * Get 3 random starter questions for the initial chat view
 */
export function getRandomStarterQuestions(count: number = 3): string[] {
  const shuffled = [...STARTER_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Categories for follow-up suggestions based on conversation context
 */
export const FOLLOW_UP_CATEGORIES = {
  career: [
    "What was your most challenging role?",
    "How has your career evolved over 20+ years?",
    "What's next in your career journey?",
  ],
  technical: [
    "Can you go deeper on the technical details?",
    "What tools and technologies do you prefer?",
    "How do you stay current with new tech?",
  ],
  leadership: [
    "How do you mentor your team members?",
    "What's your management style?",
    "How do you handle conflicts?",
  ],
  ai: [
    "What AI use cases excite you most?",
    "How do you evaluate AI readiness?",
    "What's your view on AI in enterprise?",
  ],
  personal: [
    "What motivates you professionally?",
    "How do you balance work and side projects?",
    "What advice would you give to aspiring architects?",
  ],
  aws: [
    "What AWS services do you use most?",
    "How do you approach AWS cost optimization?",
    "What's your favorite AWS project?",
  ],
  microsoft: [
    "How did your Microsoft experience shape you?",
    "What did you learn from the Azure vs AWS transition?",
    "What's different about Microsoft and AWS cultures?",
  ],
  entrepreneurship: [
    "Tell me more about Crosslink Media",
    "What's it like running a side business?",
    "How do you find time for content creation?",
  ],
};

/**
 * Keywords to detect conversation topics
 */
const TOPIC_KEYWORDS: Record<keyof typeof FOLLOW_UP_CATEGORIES, string[]> = {
  career: ['career', 'job', 'role', 'position', 'work', 'experience', 'journey', 'transition'],
  technical: ['technical', 'technology', 'code', 'programming', 'development', 'architecture', 'system'],
  leadership: ['team', 'lead', 'manage', 'leadership', 'mentor', 'guide'],
  ai: ['ai', 'artificial intelligence', 'genai', 'machine learning', 'ml', 'llm', 'chatbot'],
  personal: ['motivation', 'passion', 'advice', 'balance', 'personal', 'why'],
  aws: ['aws', 'amazon', 'cloud', 'migration', 's3', 'ec2', 'lambda'],
  microsoft: ['microsoft', 'azure', '.net', 'windows', 'evangelist'],
  entrepreneurship: ['crosslink', 'youtube', 'channel', 'business', 'founder', '3d', 'printing'],
};

/**
 * Generate follow-up suggestions based on conversation history
 */
export function generateFollowUpSuggestions(
  messages: Array<{ role: string; content: string }>,
  count: number = 3
): string[] {
  // Get the last few messages to analyze context
  const recentMessages = messages.slice(-4);
  const conversationText = recentMessages.map(m => m.content.toLowerCase()).join(' ');
  
  // Detect topics mentioned in the conversation
  const detectedTopics: (keyof typeof FOLLOW_UP_CATEGORIES)[] = [];
  
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(keyword => conversationText.includes(keyword))) {
      detectedTopics.push(topic as keyof typeof FOLLOW_UP_CATEGORIES);
    }
  }
  
  // If no specific topics detected, use a mix of general topics
  if (detectedTopics.length === 0) {
    detectedTopics.push('career', 'technical', 'personal');
  }
  
  // Collect suggestions from detected topics
  const suggestions: string[] = [];
  for (const topic of detectedTopics) {
    suggestions.push(...FOLLOW_UP_CATEGORIES[topic]);
  }
  
  // Shuffle and return requested count
  const shuffled = suggestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
