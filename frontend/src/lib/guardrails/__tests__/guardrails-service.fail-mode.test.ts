/**
 * Guardrails fail-open/fail-closed behavior tests (VULN-005).
 *
 * @jest-environment node
 */

// Mock the @openai/guardrails library so we can simulate provider errors.
const mockJailbreak = jest.fn();
const mockModerationCheck = jest.fn();
const mockTopicalAlignment = jest.fn();
jest.mock('@openai/guardrails', () => ({
  jailbreak: (...args: unknown[]) => mockJailbreak(...args),
  moderationCheck: (...args: unknown[]) => mockModerationCheck(...args),
  topicalAlignment: (...args: unknown[]) => mockTopicalAlignment(...args),
  Category: {
    HATE: 'hate',
    HATE_THREATENING: 'hate/threatening',
    HARASSMENT: 'harassment',
    HARASSMENT_THREATENING: 'harassment/threatening',
    SEXUAL: 'sexual',
    VIOLENCE: 'violence',
    VIOLENCE_GRAPHIC: 'violence/graphic',
  },
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    time: () => jest.fn(),
  }),
}));

// Mock the security logger (no-op)
jest.mock('../security-logger', () => ({
  logSecurityEvent: jest.fn(),
}));

// Mock portfolio-owner (imported by the service for the chat config)
jest.mock('@/lib/portfolio-owner', () => ({
  PORTFOLIO_OWNER: { name: 'Daniel', role: 'Architect', employer: 'AWS' },
}));

import { GuardrailsService, CHAT_GUARDRAIL_CONFIG } from '../guardrails-service';
import type { GuardrailConfig } from '../types';

const SAFETY_CRITICAL: GuardrailConfig = {
  enabledChecks: ['prompt_injection', 'jailbreak', 'content_moderation'],
  blockThreshold: 0.8,
};

const OFF_TOPIC_ONLY: GuardrailConfig = {
  enabledChecks: ['off_topic'],
  topicScope: { allowedTopics: ['professional experience'], description: 'test' },
  blockThreshold: 0.8,
};

describe('GuardrailsService fail-open/fail-closed (VULN-005)', () => {
  let service: GuardrailsService;

  beforeEach(() => {
    mockJailbreak.mockReset();
    mockModerationCheck.mockReset();
    mockTopicalAlignment.mockReset();
    service = new GuardrailsService('test-key', 'chat');
  });

  describe('safety-critical checks fail CLOSED on provider error', () => {
    it('prompt_injection: rejects the request when jailbreak() throws', async () => {
      mockJailbreak.mockRejectedValue(new Error('provider down'));
      const result = await service.validateInput('hello', SAFETY_CRITICAL, 'req-1');
      expect(result.passed).toBe(false);
      expect(result.failedCheck).toBe('prompt_injection');
    });

    it('jailbreak: rejects the request when jailbreak() throws', async () => {
      // Only jailbreak enabled
      const config: GuardrailConfig = { enabledChecks: ['jailbreak'], blockThreshold: 0.8 };
      mockJailbreak.mockRejectedValue(new Error('provider down'));
      const result = await service.validateInput('hello', config, 'req-1');
      expect(result.passed).toBe(false);
      expect(result.failedCheck).toBe('jailbreak');
    });

    it('content_moderation: rejects the request when moderationCheck() throws', async () => {
      const config: GuardrailConfig = { enabledChecks: ['content_moderation'], blockThreshold: 0.8 };
      mockModerationCheck.mockRejectedValue(new Error('provider down'));
      const result = await service.validateInput('hello', config, 'req-1');
      expect(result.passed).toBe(false);
      expect(result.failedCheck).toBe('content_moderation');
    });

    it('validateOutput: rejects when moderationCheck() throws', async () => {
      mockModerationCheck.mockRejectedValue(new Error('provider down'));
      const result = await service.validateOutput('some output', SAFETY_CRITICAL, 'req-1');
      expect(result.passed).toBe(false);
      expect(result.failedCheck).toBe('content_moderation');
    });
  });

  describe('off_topic check fails OPEN on provider error', () => {
    it('allows the request when topicalAlignment() throws', async () => {
      mockTopicalAlignment.mockRejectedValue(new Error('provider down'));
      const result = await service.validateInput('hello', OFF_TOPIC_ONLY, 'req-1');
      expect(result.passed).toBe(true);
    });
  });

  describe('mixed config: safety-critical failure dominates', () => {
    it('rejects when content_moderation throws but off_topic is configured and would pass', async () => {
      const mixed: GuardrailConfig = {
        enabledChecks: ['content_moderation', 'off_topic'],
        topicScope: { allowedTopics: ['x'], description: 'y' },
        blockThreshold: 0.8,
      };
      mockModerationCheck.mockRejectedValue(new Error('down'));
      mockTopicalAlignment.mockResolvedValue({ tripwireTriggered: false });
      const result = await service.validateInput('hello', mixed, 'req-1');
      expect(result.passed).toBe(false);
      expect(result.failedCheck).toBe('content_moderation');
    });
  });

  describe('full CHAT_GUARDRAIL_CONFIG: rejects on provider outage', () => {
    it('all safety-critical checks throwing → passed=false', async () => {
      mockJailbreak.mockRejectedValue(new Error('down'));
      mockModerationCheck.mockRejectedValue(new Error('down'));
      mockTopicalAlignment.mockRejectedValue(new Error('down'));
      const result = await service.validateInput('hello', CHAT_GUARDRAIL_CONFIG, 'req-1');
      expect(result.passed).toBe(false);
      // First failing safety-critical check in enabledChecks order wins.
      expect(result.failedCheck).toBeDefined();
      expect(['prompt_injection', 'jailbreak', 'content_moderation']).toContain(result.failedCheck);
    });
  });
});
