export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  duration?: number;
  metadata?: Record<string, any>;
  error?: Error;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: string;
  userId?: string;
  path?: string;
  method?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 100;
  private readonly flushInterval = 30000; // 30 seconds

  private constructor() {
    // Set up periodic flushing
    setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLogEntry(entry: LogEntry): string {
    const baseInfo = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
    const contextInfo = [
      entry.userId && `User: ${entry.userId}`,
      entry.sessionId && `Session: ${entry.sessionId}`,
      entry.requestId && `Request: ${entry.requestId}`,
      entry.path && `Path: ${entry.method} ${entry.path}`,
      entry.duration && `Duration: ${entry.duration}ms`
    ].filter(Boolean).join(' | ');

    return contextInfo ? `${baseInfo} | ${contextInfo}` : baseInfo;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      ...metadata
    };

    // Add to buffer
    this.logBuffer.push(entry);

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const formattedLog = this.formatLogEntry(entry);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedLog);
          break;
        case LogLevel.INFO:
          console.info(formattedLog);
          break;
        case LogLevel.WARN:
          console.warn(formattedLog);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formattedLog);
          break;
      }
    }

    // Flush buffer if it's getting full
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushBuffer();
    }
  }

  private async flushBuffer() {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // In production, you might want to send logs to a service like:
      // - Supabase (for database logging)
      // - External logging service (LogRocket, Sentry, etc.)
      // - File system
      
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to Supabase logs table
        // await this.sendToSupabase(logsToFlush);
        
        // Example: Send to external service
        // await this.sendToExternalService(logsToFlush);
      }
    } catch (error) {
      console.error('Failed to flush logs:', error);
    }
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }

  fatal(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.FATAL, message, {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }

  // Performance logging
  async logPerformance(metrics: PerformanceMetrics) {
    this.info(`Performance: ${metrics.operation}`, {
      duration: metrics.duration,
      operation: metrics.operation,
      userId: metrics.userId,
      path: metrics.path,
      method: metrics.method,
      metadata: metrics.metadata
    });
  }

  // API request logging
  logApiRequest(method: string, path: string, userId?: string, sessionId?: string, requestId?: string) {
    this.info(`API Request: ${method} ${path}`, {
      method,
      path,
      userId,
      sessionId,
      requestId
    });
  }

  logApiResponse(method: string, path: string, statusCode: number, duration: number, userId?: string, sessionId?: string, requestId?: string) {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API Response: ${method} ${path} - ${statusCode}`, {
      method,
      path,
      statusCode,
      duration,
      userId,
      sessionId,
      requestId
    });
  }

  // Database operation logging
  logDatabaseOperation(operation: string, table: string, duration: number, userId?: string, metadata?: Record<string, any>) {
    this.info(`Database: ${operation} on ${table}`, {
      operation,
      table,
      duration,
      userId,
      metadata
    });
  }

  // User action logging
  logUserAction(action: string, userId: string, metadata?: Record<string, any>) {
    this.info(`User Action: ${action}`, {
      action,
      userId,
      metadata
    });
  }

  // Security event logging
  logSecurityEvent(event: string, userId?: string, metadata?: Record<string, any>) {
    this.warn(`Security Event: ${event}`, {
      event,
      userId,
      metadata
    });
  }

  // Business event logging
  logBusinessEvent(event: string, userId?: string, metadata?: Record<string, any>) {
    this.info(`Business Event: ${event}`, {
      event,
      userId,
      metadata
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const logDebug = (message: string, metadata?: Record<string, any>) => logger.debug(message, metadata);
export const logInfo = (message: string, metadata?: Record<string, any>) => logger.info(message, metadata);
export const logWarn = (message: string, metadata?: Record<string, any>) => logger.warn(message, metadata);
export const logError = (message: string, error?: Error, metadata?: Record<string, any>) => logger.error(message, error, metadata);
export const logFatal = (message: string, error?: Error, metadata?: Record<string, any>) => logger.fatal(message, error, metadata); 