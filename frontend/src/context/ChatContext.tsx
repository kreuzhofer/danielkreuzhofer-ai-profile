'use client';

/**
 * Chat Context Provider
 *
 * Provides state management for the AI chatbot feature including:
 * - Conversation state (messages, loading, errors)
 * - UI state (open/closed panel)
 * - Actions (send message, clear conversation, retry)
 * - Session storage persistence
 *
 * @see Requirements 5.1, 5.2, 5.3
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type {
  ChatContextValue,
  ChatState,
  ChatMessage,
  ChatError,
  ChatErrorType,
  StoredChatSession,
  SerializedMessage,
} from '@/types/chat';
import { CHAT_STORAGE_KEY, WELCOME_MESSAGE } from '@/types/chat';
import { sendChatMessage, type StreamHandlerCallbacks } from '@/lib/stream-handler';

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate a unique ID for messages and conversations
 */
function generateId(): string {
  // Use crypto.randomUUID if available (modern browsers and Node.js 19+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create the welcome message with current timestamp
 */
function createWelcomeMessage(): ChatMessage {
  return {
    ...WELCOME_MESSAGE,
    timestamp: new Date(),
  };
}

/**
 * Serialize a message for storage
 */
function serializeMessage(message: ChatMessage): SerializedMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp.toISOString(),
    status: message.status,
  };
}

/**
 * Deserialize a message from storage
 */
function deserializeMessage(serialized: SerializedMessage): ChatMessage {
  return {
    id: serialized.id,
    role: serialized.role,
    content: serialized.content,
    timestamp: new Date(serialized.timestamp),
    status: serialized.status,
  };
}

/**
 * Save chat session to session storage
 */
function saveToSessionStorage(state: ChatState): void {
  if (typeof window === 'undefined') return;

  try {
    const session: StoredChatSession = {
      conversationId: state.conversationId,
      messages: state.messages.map(serializeMessage),
      lastUpdated: new Date().toISOString(),
    };
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    // Session storage may be unavailable or full - fail silently
    console.warn('Failed to save chat session to storage:', error);
  }
}

/**
 * Load chat session from session storage
 */
function loadFromSessionStorage(): Partial<ChatState> | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return null;

    const session: StoredChatSession = JSON.parse(stored);
    return {
      conversationId: session.conversationId,
      messages: session.messages.map(deserializeMessage),
    };
  } catch (error) {
    // Invalid data in storage - fail silently
    console.warn('Failed to load chat session from storage:', error);
    return null;
  }
}

// =============================================================================
// Initial State
// =============================================================================

const initialChatState: ChatState = {
  isOpen: false,
  isPanelMounted: false,
  messages: [createWelcomeMessage()],
  conversationId: generateId(),
  isLoading: false,
  streamingMessageId: null,
  error: null,
  lastFailedMessage: null,
};

// =============================================================================
// Action Types
// =============================================================================

type ChatAction =
  | { type: 'OPEN_CHAT' }
  | { type: 'CLOSE_CHAT' }
  | { type: 'SET_PANEL_MOUNTED'; payload: boolean }
  | { type: 'SEND_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'ADD_ASSISTANT_MESSAGE'; payload: { id: string } }
  | { type: 'UPDATE_STREAMING_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'COMPLETE_MESSAGE'; payload: { id: string } }
  | { type: 'SET_ERROR'; payload: { error: ChatError; failedMessage?: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_CONVERSATION' }
  | { type: 'RESTORE_SESSION'; payload: Partial<ChatState> }
  | { type: 'SET_LOADING'; payload: boolean };

// =============================================================================
// Reducer
// =============================================================================

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'OPEN_CHAT':
      return { ...state, isOpen: true };

    case 'CLOSE_CHAT':
      return { ...state, isOpen: false };

    case 'SET_PANEL_MOUNTED':
      return { ...state, isPanelMounted: action.payload };

    case 'SEND_MESSAGE': {
      const userMessage: ChatMessage = {
        id: action.payload.id,
        role: 'user',
        content: action.payload.content,
        timestamp: new Date(),
        status: 'sending',
      };
      return {
        ...state,
        messages: [...state.messages, userMessage],
        isLoading: true,
        error: null,
        lastFailedMessage: null,
      };
    }

    case 'ADD_ASSISTANT_MESSAGE': {
      const assistantMessage: ChatMessage = {
        id: action.payload.id,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        status: 'streaming',
      };
      return {
        ...state,
        messages: [...state.messages, assistantMessage],
        streamingMessageId: action.payload.id,
      };
    }

    case 'UPDATE_STREAMING_MESSAGE': {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, content: action.payload.content }
            : msg
        ),
      };
    }

    case 'COMPLETE_MESSAGE': {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, status: 'complete' } : msg
        ),
        isLoading: false,
        streamingMessageId: null,
      };
    }

    case 'SET_ERROR': {
      // Mark the last user message as error if it exists
      const updatedMessages = state.messages.map((msg, index) => {
        if (index === state.messages.length - 1 && msg.role === 'user') {
          return { ...msg, status: 'error' as const };
        }
        return msg;
      });

      return {
        ...state,
        messages: updatedMessages,
        error: action.payload.error,
        lastFailedMessage: action.payload.failedMessage ?? state.lastFailedMessage,
        isLoading: false,
        streamingMessageId: null,
      };
    }

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'CLEAR_CONVERSATION':
      return {
        ...state,
        messages: [createWelcomeMessage()],
        conversationId: generateId(),
        error: null,
        lastFailedMessage: null,
        isLoading: false,
        streamingMessageId: null,
      };

    case 'RESTORE_SESSION':
      return {
        ...state,
        ...action.payload,
        // Ensure we always have at least the welcome message
        messages:
          action.payload.messages && action.payload.messages.length > 0
            ? action.payload.messages
            : [createWelcomeMessage()],
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

const ChatContext = createContext<ChatContextValue | null>(null);

// =============================================================================
// Provider Component
// =============================================================================

interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);

  // Restore session from storage on mount
  useEffect(() => {
    const savedSession = loadFromSessionStorage();
    if (savedSession) {
      dispatch({ type: 'RESTORE_SESSION', payload: savedSession });
    }
  }, []);

  // Save to session storage when messages change
  useEffect(() => {
    // Only save if we have more than just the welcome message
    // or if we have a conversation in progress
    if (state.messages.length > 0) {
      saveToSessionStorage(state);
    }
  }, [state.messages, state.conversationId]);

  // Action: Open chat panel
  const openChat = useCallback(() => {
    dispatch({ type: 'OPEN_CHAT' });
  }, []);

  // Action: Close chat panel
  const closeChat = useCallback(() => {
    dispatch({ type: 'CLOSE_CHAT' });
  }, []);

  // Action: Send a message
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    // Validate non-empty content
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    const messageId = generateId();
    const assistantId = generateId();

    // Add user message to state
    dispatch({
      type: 'SEND_MESSAGE',
      payload: { id: messageId, content: trimmedContent },
    });

    // Add placeholder assistant message for streaming
    dispatch({ type: 'ADD_ASSISTANT_MESSAGE', payload: { id: assistantId } });

    // Build conversation history for API (exclude system messages and current user message)
    const conversationHistory = state.messages
      .filter((msg) => msg.role !== 'system' && msg.status === 'complete')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    // Add the current user message
    conversationHistory.push({
      role: 'user' as const,
      content: trimmedContent,
    });

    // Create stream handler callbacks
    const callbacks: StreamHandlerCallbacks = {
      onChunk: (accumulatedContent: string) => {
        dispatch({
          type: 'UPDATE_STREAMING_MESSAGE',
          payload: { id: assistantId, content: accumulatedContent },
        });
      },
      onComplete: () => {
        dispatch({ type: 'COMPLETE_MESSAGE', payload: { id: assistantId } });
        dispatch({ type: 'COMPLETE_MESSAGE', payload: { id: messageId } });
      },
      onError: (errorMessage: string) => {
        // Determine error type based on message
        let errorType: ChatErrorType = 'unknown';
        if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
          errorType = 'network';
        } else if (errorMessage.toLowerCase().includes('timeout') || errorMessage.toLowerCase().includes('too long')) {
          errorType = 'timeout';
        } else if (errorMessage.toLowerCase().includes('server') || errorMessage.toLowerCase().includes('500')) {
          errorType = 'server';
        }

        const chatError: ChatError = {
          type: errorType,
          message: errorMessage,
          retryable: true,
        };
        dispatch({
          type: 'SET_ERROR',
          payload: { error: chatError, failedMessage: trimmedContent },
        });
      },
    };

    // Send the message via the API
    await sendChatMessage(conversationHistory, callbacks);
  }, [state.messages]);

  // Action: Clear conversation and start fresh
  const clearConversation = useCallback(() => {
    dispatch({ type: 'CLEAR_CONVERSATION' });
    // Clear session storage as well
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(CHAT_STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to clear chat session from storage:', error);
      }
    }
  }, []);

  // Action: Retry the last failed message
  const retryLastMessage = useCallback(async (): Promise<void> => {
    if (!state.lastFailedMessage) {
      return;
    }

    // Clear the error state
    dispatch({ type: 'CLEAR_ERROR' });

    // Remove the last failed user message from the conversation
    // so we can resend it
    const messagesWithoutFailed = state.messages.filter(
      (msg) => !(msg.role === 'user' && msg.status === 'error')
    );

    // Restore messages without the failed one
    dispatch({
      type: 'RESTORE_SESSION',
      payload: { messages: messagesWithoutFailed },
    });

    // Resend the message
    await sendMessage(state.lastFailedMessage);
  }, [state.lastFailedMessage, state.messages, sendMessage]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<ChatContextValue>(
    () => ({
      isOpen: state.isOpen,
      messages: state.messages,
      isLoading: state.isLoading,
      error: state.error,
      openChat,
      closeChat,
      sendMessage,
      clearConversation,
      retryLastMessage,
    }),
    [
      state.isOpen,
      state.messages,
      state.isLoading,
      state.error,
      openChat,
      closeChat,
      sendMessage,
      clearConversation,
      retryLastMessage,
    ]
  );

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access the chat context
 * @throws Error if used outside of ChatProvider
 */
export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

// =============================================================================
// Exports for Testing
// =============================================================================

export {
  generateId,
  serializeMessage,
  deserializeMessage,
  saveToSessionStorage,
  loadFromSessionStorage,
  createWelcomeMessage,
  initialChatState,
  chatReducer,
};
export type { ChatAction };
