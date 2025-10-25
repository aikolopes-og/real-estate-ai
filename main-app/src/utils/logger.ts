/**
 * Professional Frontend Logger
 * Provides structured logging with different levels and environment-aware output
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogData {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: LogData;
  userAgent?: string;
  url?: string;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatLog(level: LogLevel, message: string, data?: LogData): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      data,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };
  }

  private output(logEntry: LogEntry): void {
    if (this.isDevelopment) {
      // Development: Use console with colors
      const style = this.getConsoleStyle(logEntry.level);
      console.log(
        `%c[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}`,
        style,
        logEntry.data ? logEntry.data : ''
      );
    } else {
      // Production: Send to monitoring service (implement as needed)
      this.sendToMonitoring(logEntry);
    }
  }

  private getConsoleStyle(level: string): string {
    switch (level) {
      case 'ERROR': return 'color: #ef4444; font-weight: bold;';
      case 'WARN': return 'color: #f59e0b; font-weight: bold;';
      case 'INFO': return 'color: #3b82f6;';
      case 'DEBUG': return 'color: #6b7280;';
      default: return '';
    }
  }

  private sendToMonitoring(logEntry: LogEntry): void {
    // In production, send to your logging service
    // For now, we'll use a minimal console output
    if (logEntry.level === 'ERROR' || logEntry.level === 'WARN') {
      console.warn(`[${logEntry.level}] ${logEntry.message}`, logEntry.data);
    }
  }

  error(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.formatLog(LogLevel.ERROR, message, data));
    }
  }

  warn(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.formatLog(LogLevel.WARN, message, data));
    }
  }

  info(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.formatLog(LogLevel.INFO, message, data));
    }
  }

  debug(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.formatLog(LogLevel.DEBUG, message, data));
    }
  }

  // API-specific logging methods
  apiRequest(method: string, url: string, data?: LogData): void {
    this.debug(`API ${method} ${url}`, data);
  }

  apiResponse(status: number, url: string, data?: LogData): void {
    if (status >= 400) {
      this.error(`API Error ${status} ${url}`, data);
    } else {
      this.debug(`API Success ${status} ${url}`, data);
    }
  }

  apiError(error: Error, url: string, context?: LogData): void {
    this.error(`API Fetch Error ${url}: ${error.message}`, { error: error.message, context });
  }
}

export const logger = new Logger();
export default logger;