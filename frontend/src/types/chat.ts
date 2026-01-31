/**
 * Chat Type Definitions
 *
 * These types define the structure of the AI chatbot feature including
 * messages, state management, errors, and context values.
 *
 * @see Requirements 2.1, 3.1, 5.1
 */

// =============================================================================
// Message Types
// =============================================================================

/**
 * Status of a chat message
 */
export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error';

/**
 * Role of a message sender
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * A single message in the chat conversation
 */
export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** Who sent the message */
  role: MessageRole;
  /** The message content (may be partial during streaming) */
  content: string;
  /** When the message was created */
  timestamp: Date;
  /** Current status of the message */
  status: MessageStatus;
}

// =============================================================================
// Error Types
// =============================================================================

/**
 * Types of errors that can occur during chat operations
 */
export type ChatErrorType = 'network' | 'timeout' | 'server' | 'unknown';

/**
 * Error information for chat operations
 */
export interface ChatError {
  /** Category of the error */
  type: ChatErrorType;
  /** User-friendly error message */
  message: string;
  /** Whether the operation can be retried */
  retryable: boolean;
}

// =============================================================================
// State Types
// =============================================================================

/**
 * Complete state of the chat feature
 */
export interface ChatState {
  // UI State
  /** Whether the chat panel is open */
  isOpen: boolean;
  /** Whether the chat panel component is mounted */
  isPanelMounted: boolean;

  // Conversation State
  /** All messages in the current conversation */
  messages: ChatMessage[];
  /** Unique identifier for the current conversation */
  conversationId: string;

  // Loading State
  /** Whether a message is being sent/received */
  isLoading: boolean;
  /** ID of the message currently being streamed, if any */
  streamingMessageId: string | null;

  // Error State
  /** Current error, if any */
  error: ChatError | null;
  /** The last message that failed to send, for retry */
  lastFailedMessage: string | null;
}

// =============================================================================
// Context Types
// =============================================================================

/**
 * Value provided by the ChatContext to consumers
 */
export interface ChatContextValue {
  /** Whether the chat panel is open */
  isOpen: boolean;
  /** All messages in the current conversation */
  messages: ChatMessage[];
  /** Whether a message is being sent/received */
  isLoading: boolean;
  /** Current error, if any */
  error: ChatError | null;
  /** Open the chat panel */
  openChat: () => void;
  /** Close the chat panel */
  closeChat: () => void;
  /** Send a message to the AI */
  sendMessage: (content: string) => Promise<void>;
  /** Clear the conversation and start fresh */
  clearConversation: () => void;
  /** Retry the last failed message */
  retryLastMessage: () => Promise<void>;
}

// =============================================================================
// API Types
// =============================================================================

/**
 * Message format for API requests
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Request body for POST /api/chat
 */
export interface ChatAPIRequest {
  messages: ConversationMessage[];
}

/**
 * Server-Sent Event types for streaming responses
 */
export type ChatSSEEvent =
  | { type: 'chunk'; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the ChatPanel component
 */
export interface ChatPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when the panel should close */
  onClose: () => void;
  /** Optional initial message to display */
  initialMessage?: string;
}

/**
 * Props for the MessageList component
 */
export interface MessageListProps {
  /** Messages to display */
  messages: ChatMessage[];
  /** Whether a response is being loaded */
  isLoading: boolean;
  /** Callback to retry the last failed message */
  onRetry?: () => void;
  /** Callback when a suggestion is selected */
  onSuggestionSelect?: (suggestion: string) => void;
  /** Follow-up suggestions to display after the last assistant message */
  followUpSuggestions?: string[];
}

/**
 * Props for the ChatInput component
 */
export interface ChatInputProps {
  /** Callback when a message is submitted */
  onSubmit: (message: string) => void;
  /** Whether the input is disabled */
  disabled: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
}

/**
 * Props for the ChatTrigger component
 */
export interface ChatTriggerProps {
  /** Callback when the trigger is clicked */
  onClick: () => void;
  /** Whether there are unread messages */
  hasUnread?: boolean;
  /** Accessible label for the button */
  ariaLabel: string;
}

// =============================================================================
// Session Storage Types
// =============================================================================

/**
 * Serialized message for session storage
 */
export interface SerializedMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO timestamp
  status: MessageStatus;
}

/**
 * Chat session data stored in sessionStorage
 */
export interface StoredChatSession {
  conversationId: string;
  messages: SerializedMessage[];
  lastUpdated: string; // ISO timestamp
}

/**
 * Storage key for chat session
 */
export const CHAT_STORAGE_KEY = 'portfolio-chat-session';

// =============================================================================
// Constants
// =============================================================================

/**
 * Keyboard shortcuts for chat interactions
 */
export const CHAT_KEYBOARD_SHORTCUTS = {
  CLOSE: 'Escape',
  SUBMIT: 'Enter',
  SUBMIT_NEWLINE: 'Shift+Enter',
} as const;

/**
 * Welcome message displayed when chat opens
 */
export const WELCOME_MESSAGE: Omit<ChatMessage, 'timestamp'> = {
  id: 'welcome',
  role: 'system',
  content:
    "Hi! I'm here to answer questions about Daniel's professional experience, projects, and technical decisions. What would you like to know?",
  status: 'complete',
};
