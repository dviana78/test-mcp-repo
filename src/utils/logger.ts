import winston from 'winston';
import { ILogger, ILoggerFactory } from '../interfaces';

const logLevel = process.env.LOG_LEVEL ?? 'info';

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'azure-apim-mcp-server' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logging initialized');
}

export class Logger implements ILogger {
  private readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, meta?: any): void {
    logger.info(message, { context: this.context, ...meta });
  }

  error(message: string, meta?: any): void {
    if (meta instanceof Error) {
      logger.error(message, { 
        context: this.context, 
        error: meta.message,
        stack: meta.stack
      });
    } else {
      logger.error(message, { 
        context: this.context, 
        ...meta 
      });
    }
  }

  warn(message: string, meta?: any): void {
    logger.warn(message, { context: this.context, ...meta });
  }

  debug(message: string, meta?: any): void {
    logger.debug(message, { context: this.context, ...meta });
  }

  child(context: object): ILogger {
    const childContextName = `${this.context}:${JSON.stringify(context)}`;
    return new Logger(childContextName);
  }
}

export class LoggerFactory implements ILoggerFactory {
  createLogger(context?: object): ILogger {
    const contextName = context ? JSON.stringify(context) : 'default';
    return new Logger(contextName);
  }
}

export const rootLogger = logger;
export const loggerFactory = new LoggerFactory();
export const defaultLogger = new Logger('main');

export const logInfo = (message: string, context?: Record<string, unknown>) => {
    logger.info(message, { context });
};

export const logError = (message: string, context?: Record<string, unknown>) => {
    logger.error(message, { context });
};

export const logDebug = (message: string, context?: Record<string, unknown>) => {
    logger.debug(message, { context });
};

export default Logger;