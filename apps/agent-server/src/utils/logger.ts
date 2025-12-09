/**
 * Winston-based logging configuration
 * Provides structured logging with file rotation and multiple transports
 */
import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Custom format for log messages
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Determine log directory
const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

// Create transports
const transports = [
  // Console transport for all environments
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),

  // File transport for errors (always enabled)
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true,
  }),

  // Combined file transport for all logs
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    maxsize: 10485760, // 10MB
    maxFiles: 10,
    tailable: true,
  }),
];

// Create the logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Add request logging helper
export const logRequest = (method: string, url: string, statusCode: number, duration: number) => {
  logger.http(`${method} ${url} ${statusCode} ${duration}ms`);
};

// Add error logging helper with context
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
};

// Add info logging helper
export const logInfo = (message: string, metadata?: Record<string, any>) => {
  logger.info(message, metadata);
};

// Add warning logging helper
export const logWarning = (message: string, metadata?: Record<string, any>) => {
  logger.warn(message, metadata);
};

// Add debug logging helper
export const logDebug = (message: string, metadata?: Record<string, any>) => {
  logger.debug(message, metadata);
};

// Stream for Morgan HTTP logging integration
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
