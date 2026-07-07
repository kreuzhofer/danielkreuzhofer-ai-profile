/**
 * Shared API security helpers for the LLM-backed routes.
 *
 * Used by /api/chat, /api/analyze, /api/suggestions, /api/extract-text to
 * enforce per-IP rate limits (VULN-002) and bounded request payloads.
 *
 * The limiters are per-process in-memory (single-instance deployment); revisit
 * if we scale out. Reuses {@link createRateLimiter} from the scorecard module.
 */

import type { NextRequest } from 'next/server';
import { createRateLimiter, type RateLimiter } from '@/lib/scorecard/rate-limit';

/**
 * Extract the client IP from common proxy headers. Falls back to '' when no
 * proxy header is present (local dev). Matches the scorecard submit pattern.
 */
export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? '';
}

// ---------------------------------------------------------------------------
// Payload bounds (VULN-002: cap history / message / field sizes)
// ---------------------------------------------------------------------------

/** Max number of conversation turns accepted by chat / suggestions. */
export const MAX_MESSAGES = 20;

/** Max characters per single message content. */
export const MAX_MESSAGE_LENGTH = 8192;

/** Max characters for a job description submitted to /api/analyze. */
export const MAX_JOB_DESCRIPTION_LENGTH = 32000;

/**
 * Validate the shape and bounds of a conversation messages array.
 * Returns an error message string when invalid, or `null` when valid.
 */
export function validateMessageBounds(
  messages: Array<{ role: string; content: string }>,
): string | null {
  if (messages.length > MAX_MESSAGES) {
    return `Too many messages (max ${MAX_MESSAGES}).`;
  }
  for (const m of messages) {
    if (typeof m.content !== 'string') {
      return 'Invalid message content.';
    }
    if (m.content.length > MAX_MESSAGE_LENGTH) {
      return `Message too long (max ${MAX_MESSAGE_LENGTH} characters).`;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Rate limiters (per-IP, sliding window)
// ---------------------------------------------------------------------------

// Chat: streaming conversations; allow a generous session burst but cap abuse.
export const chatLimiter: RateLimiter = createRateLimiter({ max: 20, windowMs: 10 * 60 * 1000 });

// Analyze: each call is expensive (60s timeout, JSON mode, large prompt).
export const analyzeLimiter: RateLimiter = createRateLimiter({ max: 5, windowMs: 10 * 60 * 1000 });

// Suggestions: lightweight (256 tokens) but unguarded — tighter than chat.
export const suggestionsLimiter: RateLimiter = createRateLimiter({ max: 30, windowMs: 10 * 60 * 1000 });

// Extract-text: file parsing (pdf-parse/mammoth) is CPU/memory heavy.
export const extractTextLimiter: RateLimiter = createRateLimiter({ max: 10, windowMs: 10 * 60 * 1000 });
