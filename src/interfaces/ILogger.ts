/**
 * Interface for logging service
 * Defines the contract for context-aware logging functionality
 */
export interface ILogger {
  /**
   * Log an informational message
   * @param message - The message to log
   * @param meta - Additional metadata to include
   */
  info(message: string, meta?: any): void;

  /**
   * Log an error message
   * @param message - The error message to log
   * @param meta - Additional metadata to include (error objects, stack traces, etc.)
   */
  error(message: string, meta?: any): void;

  /**
   * Log a warning message
   * @param message - The warning message to log
   * @param meta - Additional metadata to include
   */
  warn(message: string, meta?: any): void;

  /**
   * Log a debug message
   * @param message - The debug message to log
   * @param meta - Additional metadata to include
   */
  debug(message: string, meta?: any): void;

  /**
   * Create a child logger with additional context
   * @param context - Additional context to include in all logs from this child logger
   * @returns A new logger instance with the added context
   */
  child?(context: object): ILogger;
}

/**
 * Factory interface for creating logger instances
 */
export interface ILoggerFactory {
  /**
   * Create a new logger instance with the specified context
   * @param context - Initial context for the logger
   * @returns A new logger instance
   */
  createLogger(context?: object): ILogger;
}







