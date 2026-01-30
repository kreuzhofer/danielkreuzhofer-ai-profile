/**
 * Property Tests for Chat Conversation Persistence
 *
 * These tests validate that conversation context is properly preserved
 * when closing and reopening the chat panel.
 *
 * Feature: ai-chatbot, Property 5: Conversation Context Round-Trip
 *
 * **Validates: Requirements 5.1, 5.2**
 */

import * as fc from 'fast-check';
import type { ChatMessage, MessageRole, MessageStatus, SerializedMessage } from '@/types/chat';
import {
  serializeMessage,
  deserializeMessage,
  saveToSessionStorage,
  loadFromSessionStorage,
  initialChatState,
} from '@/context/ChatContext';
import { CHAT_STORAGE_KEY } from '@/types/chat';

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating valid message roles
 */
const messageRoleArbitrary: fc.Arbitrary<MessageRole> = fc.constantFrom<MessageRole>(
  'user',
  'assistant',
  'system'
);

/**
 * Arbitrary for generating valid message statuses
 */
const messageStatusArbitrary: fc.Arbitrary<MessageStatus> = fc.constantFrom<MessageStatus>(
  'sending',
  'streaming',
  'complete',
  'error'
);

/**
 * Arbitrary for generating valid timestamps
 * Uses integer timestamps to avoid invalid date issues during shrinking
 */
const timestampArbitrary: fc.Arbitrary<Date> = fc
  .integer({
    min: new Date('2020-01-01').getTime(),
    max: new Date('2030-12-31').getTime(),
  })
  .map((timestamp) => new Date(timestamp));

/**
 * Arbitrary for generating non-empty message content
 * Includes various characters that might appear in chat messages
 */
const messageContentArbitrary: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 500 })
  .filter((s) => s.trim().length > 0);

/**
 * Arbitrary for generating valid message IDs
 */
const messageIdArbitrary: fc.Arbitrary<string> = fc.uuid();

/**
 * Arbitrary for generating a valid ChatMessage
 */
const chatMessageArbitrary: fc.Arbitrary<ChatMessage> = fc.record({
  id: messageIdArbitrary,
  role: messageRoleArbitrary,
  content: messageContentArbitrary,
  timestamp: timestampArbitrary,
  status: messageStatusArbitrary,
});

/**
 * Arbitrary for generating an array of chat messages (conversation)
 */
const conversationArbitrary: fc.Arbitrary<ChatMessage[]> = fc.array(chatMessageArbitrary, {
  minLength: 1,
  maxLength: 10,
});

// =============================================================================
// Property 5: Conversation Context Round-Trip
// =============================================================================

/**
 * Feature: ai-chatbot, Property 5: Conversation Context Round-Trip
 *
 * *For any* conversation with one or more messages, closing the chat panel
 * and reopening it SHALL preserve all messages in their original order
 * with their original content.
 *
 * **Validates: Requirements 5.1, 5.2**
 */
describe('Property 5: Conversation Context Round-Trip', () => {
  // Mock sessionStorage for testing
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => mockStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockStorage[key];
        }),
        clear: jest.fn(() => {
          mockStorage = {};
        }),
      },
      writable: true,
    });
  });

  describe('Message Serialization Round-Trip', () => {
    it('preserves message content through serialize/deserialize cycle', () => {
      fc.assert(
        fc.property(chatMessageArbitrary, (message) => {
          // Serialize the message
          const serialized = serializeMessage(message);

          // Deserialize it back
          const deserialized = deserializeMessage(serialized);

          // Content should be exactly preserved
          return deserialized.content === message.content;
        }),
        { numRuns: 3 }
      );
    });

    it('preserves message role through serialize/deserialize cycle', () => {
      fc.assert(
        fc.property(chatMessageArbitrary, (message) => {
          const serialized = serializeMessage(message);
          const deserialized = deserializeMessage(serialized);

          return deserialized.role === message.role;
        }),
        { numRuns: 3 }
      );
    });

    it('preserves message id through serialize/deserialize cycle', () => {
      fc.assert(
        fc.property(chatMessageArbitrary, (message) => {
          const serialized = serializeMessage(message);
          const deserialized = deserializeMessage(serialized);

          return deserialized.id === message.id;
        }),
        { numRuns: 3 }
      );
    });

    it('preserves message status through serialize/deserialize cycle', () => {
      fc.assert(
        fc.property(chatMessageArbitrary, (message) => {
          const serialized = serializeMessage(message);
          const deserialized = deserializeMessage(serialized);

          return deserialized.status === message.status;
        }),
        { numRuns: 3 }
      );
    });

    it('preserves message timestamp through serialize/deserialize cycle', () => {
      fc.assert(
        fc.property(chatMessageArbitrary, (message) => {
          const serialized = serializeMessage(message);
          const deserialized = deserializeMessage(serialized);

          // Timestamps should be equal (comparing time values)
          return deserialized.timestamp.getTime() === message.timestamp.getTime();
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Conversation Persistence Round-Trip', () => {
    it('preserves all messages in original order after save/load cycle', () => {
      fc.assert(
        fc.property(conversationArbitrary, (messages) => {
          // Create a state with the messages
          const state = {
            ...initialChatState,
            messages,
            conversationId: 'test-conversation-id',
          };

          // Save to session storage
          saveToSessionStorage(state);

          // Load from session storage
          const loaded = loadFromSessionStorage();

          // Verify messages are preserved
          if (!loaded || !loaded.messages) {
            return false;
          }

          // Check same number of messages
          if (loaded.messages.length !== messages.length) {
            return false;
          }

          // Check each message is preserved in order
          return messages.every((originalMessage, index) => {
            const loadedMessage = loaded.messages![index];
            return (
              loadedMessage.id === originalMessage.id &&
              loadedMessage.role === originalMessage.role &&
              loadedMessage.content === originalMessage.content &&
              loadedMessage.status === originalMessage.status &&
              loadedMessage.timestamp.getTime() === originalMessage.timestamp.getTime()
            );
          });
        }),
        { numRuns: 3 }
      );
    });

    it('preserves conversation ID after save/load cycle', () => {
      fc.assert(
        fc.property(
          conversationArbitrary,
          fc.uuid(),
          (messages, conversationId) => {
            const state = {
              ...initialChatState,
              messages,
              conversationId,
            };

            saveToSessionStorage(state);
            const loaded = loadFromSessionStorage();

            return loaded?.conversationId === conversationId;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('preserves message content with special characters', () => {
      // Test with content that includes special characters using array and join
      const specialChars = [
        'a', 'b', 'c', ' ', '\n', '\t', '!', '@', '#', '$', '%',
        '&', '*', '(', ')', '-', '+', '=', '[', ']', '{', '}',
        ':', ';', '"', "'", '<', '>', ',', '.', '?', '/', '\\',
        '`', '~', '|', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
      ];

      const specialContentArbitrary = fc
        .array(fc.constantFrom(...specialChars), { minLength: 1, maxLength: 200 })
        .map((chars) => chars.join(''))
        .filter((s) => s.trim().length > 0);

      fc.assert(
        fc.property(
          fc.record({
            id: messageIdArbitrary,
            role: messageRoleArbitrary,
            content: specialContentArbitrary,
            timestamp: timestampArbitrary,
            status: messageStatusArbitrary,
          }),
          (message) => {
            const state = {
              ...initialChatState,
              messages: [message],
              conversationId: 'test-id',
            };

            saveToSessionStorage(state);
            const loaded = loadFromSessionStorage();

            return loaded?.messages?.[0]?.content === message.content;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Serialization Format Correctness', () => {
    it('serializes timestamp to ISO string format', () => {
      fc.assert(
        fc.property(chatMessageArbitrary, (message) => {
          const serialized = serializeMessage(message);

          // Timestamp should be a valid ISO string
          const isValidISOString =
            typeof serialized.timestamp === 'string' &&
            !isNaN(Date.parse(serialized.timestamp));

          return isValidISOString;
        }),
        { numRuns: 3 }
      );
    });

    it('deserializes timestamp back to Date object', () => {
      fc.assert(
        fc.property(chatMessageArbitrary, (message) => {
          const serialized = serializeMessage(message);
          const deserialized = deserializeMessage(serialized);

          // Timestamp should be a Date object
          return deserialized.timestamp instanceof Date;
        }),
        { numRuns: 3 }
      );
    });
  });
});
