/**
 * Suggestions API Route
 *
 * Generates AI-powered follow-up questions based on conversation context.
 * Uses a lightweight LLM call to produce contextual, non-repetitive suggestions.
 */

import { NextRequest } from 'next/server';
import { getChatCompletion } from '@/lib/llm-client';
import type { ConversationMessage } from '@/types/chat';
import { PORTFOLIO_OWNER } from '@/lib/portfolio-owner';
import { createLogger } from '@/lib/logger';

const log = createLogger('SuggestionsAPI');

const SUGGESTIONS_PROMPT = `You generate follow-up questions for a portfolio chatbot about ${PORTFOLIO_OWNER.name} (${PORTFOLIO_OWNER.role} at ${PORTFOLIO_OWNER.employer}).

Based on the conversation so far, suggest exactly 3 short follow-up questions that:
- Are naturally related to what was just discussed
- Dig deeper into ${PORTFOLIO_OWNER.name}'s specific experience, decisions, or projects
- Are NOT repetitions of questions already asked in the conversation
- Are concise (under 60 characters each)
- Would lead to interesting, specific answers about ${PORTFOLIO_OWNER.name}

You MUST respond with a JSON object like: {"suggestions": ["question 1", "question 2", "question 3"]}`;

/**
 * POST /api/suggestions
 *
 * Accepts conversation messages and returns 3 AI-generated follow-up questions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawMessages: Array<{ role: string; content: string }> = body.messages;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Filter to only user/assistant messages
    const messages: ConversationMessage[] = rawMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    log.info('Generating follow-up suggestions', { messageCount: messages.length });

    const response = await getChatCompletion(
      SUGGESTIONS_PROMPT,
      messages,
      {
        model: 'gpt-4o-mini',
        temperature: 0.9,
        maxTokens: 256,
        responseFormat: 'json_object',
      }
    );

    log.info('Suggestions response received', { responseLength: response.length });

    let suggestions: string[] = [];
    try {
      const parsed = JSON.parse(response);
      suggestions = Array.isArray(parsed) ? parsed : (parsed.suggestions || parsed.questions || []);
      suggestions = suggestions.slice(0, 3).filter((s: unknown) => typeof s === 'string');
    } catch (parseError) {
      log.error('Failed to parse suggestions response', parseError, { response: response.substring(0, 200) });
      suggestions = [];
    }

    log.info('Returning suggestions', { count: suggestions.length });

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    log.error('Suggestions API error', error);
    return new Response(
      JSON.stringify({ suggestions: [] }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
