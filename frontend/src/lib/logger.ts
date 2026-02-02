/**
 * Logger Utility
 *
 * Provides structured logging with configurable log levels.
 * In production, only warnings and errors are logged by default.
 * Set LOG_LEVEL environment variable to control verbosity.
 *
 * Log Levels (in order of verbosity):
 * - debug: Detailed debugging information
 * - info: General operational information
 * - warn: Warning conditions
 * - error: Error conditions
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get the current log level from environment
 * Defaults to 'info' in development, 'warn' in production
 */
function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel;
  }
  
  // Default based on NODE_ENV
  return process.env.NODE_ENV === 'production' ? 'warn' : 'info';
}

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  const currentLevel = getLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

/**
 * Format a log message with timestamp and context
 */
function formatMessage(level: LogLevel, context: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
}

/**
 * Create a logger instance for a specific context (e.g., 'AnalyzeAPI', 'LLMClient')
 */
export function createLogger(context: string) {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      if (shouldLog('debug')) {
        const formatted = formatMessage('debug', context, message);
        if (data) {
          console.debug(formatted, data);
        } else {
          console.debug(formatted);
        }
      }
    },

    info(message: string, data?: Record<string, unknown>) {
      if (shouldLog('info')) {
        const formatted = formatMessage('info', context, message);
        if (data) {
          console.info(formatted, data);
        } else {
          console.info(formatted);
        }
      }
    },

    warn(message: string, data?: Record<string, unknown>) {
      if (shouldLog('warn')) {
        const formatted = formatMessage('warn', context, message);
        if (data) {
          console.warn(formatted, data);
        } else {
          console.warn(formatted);
        }
      }
    },

    error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
      if (shouldLog('error')) {
        const formatted = formatMessage('error', context, message);
        const errorInfo = error instanceof Error 
          ? { name: error.name, message: error.message }
          : error;
        
        if (data || errorInfo) {
          console.error(formatted, { error: errorInfo, ...data });
        } else {
          console.error(formatted);
        }
      }
    },

    /**
     * Log timing information for performance monitoring
     */
    time(label: string): () => void {
      const start = Date.now();
      return () => {
        const duration = Date.now() - start;
        this.info(`${label} completed`, { durationMs: duration });
      };
    },
  };
}

/**
 * Default logger for general use
 */
export const logger = createLogger('App');

export default logger;
