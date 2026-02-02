/**
 * User-friendly rejection messages for guardrail violations
 * 
 * Messages are designed to:
 * - Be polite and maintain a friendly tone
 * - Guide users toward appropriate questions
 * - NOT reveal detection methods for security violations
 */

import { GuardrailCheckType } from './types';

/**
 * User-friendly rejection messages by check type
 * Security messages (prompt_injection, jailbreak) are intentionally generic
 * to avoid revealing detection methods
 */
export const REJECTION_MESSAGES: Record<GuardrailCheckType, string> = {
  prompt_injection:
    "I can only help with questions about Daniel's professional background. Could you rephrase your question?",
  jailbreak:
    "I can only help with questions about Daniel's professional background. Could you rephrase your question?",
  off_topic:
    "I'm here to answer questions about Daniel's experience, skills, and projects. What would you like to know about his professional background?",
  content_moderation:
    "I can't respond to that type of message. Feel free to ask about Daniel's professional experience instead.",
};

/**
 * Rejection messages specific to the Fit Analysis endpoint
 */
export const FIT_ANALYSIS_REJECTION_MESSAGES: Record<GuardrailCheckType, string> = {
  prompt_injection:
    'Please provide a valid job description for analysis. I can help assess how well the candidate fits the role.',
  jailbreak:
    'Please provide a valid job description for analysis. I can help assess how well the candidate fits the role.',
  off_topic:
    'I can only analyze job descriptions and assess candidate fit. Please paste a job description to get started.',
  content_moderation:
    "I can't process that content. Please provide a professional job description for analysis.",
};

/**
 * Get appropriate rejection message for a failed check
 * 
 * @param checkType - The type of check that failed
 * @param endpoint - The endpoint where the check failed ('chat' or 'fit_analysis')
 * @returns A user-friendly rejection message
 */
export function getRejectionMessage(
  checkType: GuardrailCheckType,
  endpoint: 'chat' | 'fit_analysis' | string
): string {
  if (endpoint === 'fit_analysis') {
    return FIT_ANALYSIS_REJECTION_MESSAGES[checkType] ?? REJECTION_MESSAGES[checkType];
  }
  return REJECTION_MESSAGES[checkType];
}

/**
 * List of terms that should NOT appear in security rejection messages
 * Used for testing message opacity
 */
export const FORBIDDEN_SECURITY_TERMS = [
  'injection',
  'jailbreak',
  'detected',
  'blocked',
  'security',
  'attack',
  'malicious',
];

/**
 * Check if a message contains any forbidden security terms
 * Used for testing to ensure messages don't reveal detection methods
 */
export function containsForbiddenTerms(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return FORBIDDEN_SECURITY_TERMS.some((term) => lowerMessage.includes(term));
}
