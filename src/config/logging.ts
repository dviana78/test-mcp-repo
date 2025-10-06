import winston from 'winston';

const logLevel = process.env.LOG_LEVEL ?? 'info';

export const logger = winston.createLogger({
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

export function createLoggerTransports(): winston.transport[] {
  const transports: winston.transport[] = [];

  // Console transport
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, service, context, ...meta }) => {
          let output = `${timestamp} [${service?.toString() ?? 'azure-apim-mcp'}] ${level}: ${message}`;
          if (context) {
            output += ` [${JSON.stringify(context)}]`;
          }
          if (Object.keys(meta).length > 0) {
            output += ` ${JSON.stringify(meta)}`;
          }
          return output;
        })
      )
    })
  );

  // File transports only in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    );
  }

  return transports;
}

export function getLogLevel(): string {
  const level = process.env.LOG_LEVEL?.toLowerCase();
  const validLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
  
  if (level && validLevels.includes(level)) {
    return level;
  }

  // Default levels based on environment
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'info';
    case 'development':
      return 'debug';
    case 'test':
      return 'error';
    default:
      return 'info';
  }
}

// Legacy export
export default logger;







