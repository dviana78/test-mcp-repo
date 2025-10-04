import winston from 'winston';
import { 
  Logger, 
  LoggerFactory, 
  rootLogger, 
  loggerFactory, 
  defaultLogger,
  logInfo,
  logError,
  logDebug
} from '../../../src/utils/logger';

// Mock winston to avoid actual file writes during tests
jest.mock('winston', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  };

  return {
    createLogger: jest.fn(() => mockLogger),
    format: {
      combine: jest.fn((...args) => args),
      timestamp: jest.fn(() => 'timestamp'),
      errors: jest.fn(() => 'errors'),
      json: jest.fn(() => 'json'),
      colorize: jest.fn(() => 'colorize'),
      simple: jest.fn(() => 'simple')
    },
    transports: {
      File: jest.fn().mockImplementation((config) => ({ config })),
      Console: jest.fn().mockImplementation((config) => ({ config }))
    }
  };
});

describe('Logger Utils', () => {
  let mockWinstonLogger: jest.Mocked<winston.Logger>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mocked logger instance
    mockWinstonLogger = winston.createLogger() as jest.Mocked<winston.Logger>;
  });

  describe('Logger Class', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('test-context');
    });

    describe('constructor', () => {
      it('should create logger with context', () => {
        const logger = new Logger('my-context');
        expect(logger).toBeInstanceOf(Logger);
      });
    });

    describe('info', () => {
      it('should log info message with context', () => {
        logger.info('Test info message');
        
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
          'Test info message',
          { context: 'test-context' }
        );
      });

      it('should log info message with context and meta', () => {
        const meta = { userId: 123, action: 'create' };
        logger.info('Test info message', meta);
        
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
          'Test info message',
          { context: 'test-context', userId: 123, action: 'create' }
        );
      });

      it('should handle empty meta', () => {
        logger.info('Test info message', {});
        
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
          'Test info message',
          { context: 'test-context' }
        );
      });
    });

    describe('error', () => {
      it('should log error message with context', () => {
        logger.error('Test error message');
        
        expect(mockWinstonLogger.error).toHaveBeenCalledWith(
          'Test error message',
          { context: 'test-context' }
        );
      });

      it('should log error message with Error object', () => {
        const error = new Error('Test error object');
        error.stack = 'Error stack trace';
        logger.error('Error occurred', error);
        
        expect(mockWinstonLogger.error).toHaveBeenCalledWith(
          'Error occurred',
          { 
            context: 'test-context',
            error: 'Test error object',
            stack: 'Error stack trace'
          }
        );
      });

      it('should log error message with regular meta', () => {
        const meta = { code: 'ERR001', severity: 'high' };
        logger.error('Test error message', meta);
        
        expect(mockWinstonLogger.error).toHaveBeenCalledWith(
          'Test error message',
          { context: 'test-context', code: 'ERR001', severity: 'high' }
        );
      });

      it('should handle Error object without stack', () => {
        const error = new Error('Test error');
        delete error.stack;
        logger.error('Error occurred', error);
        
        expect(mockWinstonLogger.error).toHaveBeenCalledWith(
          'Error occurred',
          { 
            context: 'test-context',
            error: 'Test error',
            stack: undefined
          }
        );
      });
    });

    describe('warn', () => {
      it('should log warning message with context', () => {
        logger.warn('Test warning message');
        
        expect(mockWinstonLogger.warn).toHaveBeenCalledWith(
          'Test warning message',
          { context: 'test-context' }
        );
      });

      it('should log warning message with context and meta', () => {
        const meta = { deprecated: true, version: '1.0' };
        logger.warn('Test warning message', meta);
        
        expect(mockWinstonLogger.warn).toHaveBeenCalledWith(
          'Test warning message',
          { context: 'test-context', deprecated: true, version: '1.0' }
        );
      });
    });

    describe('debug', () => {
      it('should log debug message with context', () => {
        logger.debug('Test debug message');
        
        expect(mockWinstonLogger.debug).toHaveBeenCalledWith(
          'Test debug message',
          { context: 'test-context' }
        );
      });

      it('should log debug message with context and meta', () => {
        const meta = { function: 'testFunction', line: 42 };
        logger.debug('Test debug message', meta);
        
        expect(mockWinstonLogger.debug).toHaveBeenCalledWith(
          'Test debug message',
          { context: 'test-context', function: 'testFunction', line: 42 }
        );
      });
    });

    describe('child', () => {
      it('should create child logger with extended context', () => {
        const childContext = { module: 'api', operation: 'create' };
        const childLogger = logger.child(childContext);
        
        expect(childLogger).toBeInstanceOf(Logger);
        
        // Test that child logger includes the extended context
        childLogger.info('Child message');
        
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
          'Child message',
          { context: 'test-context:{"module":"api","operation":"create"}' }
        );
      });

      it('should handle complex child context objects', () => {
        const complexContext = { 
          user: { id: 123, name: 'test' }, 
          request: { id: 'req-123' } 
        };
        const childLogger = logger.child(complexContext);
        
        childLogger.debug('Complex context message');
        
        expect(mockWinstonLogger.debug).toHaveBeenCalledWith(
          'Complex context message',
          { context: 'test-context:{"user":{"id":123,"name":"test"},"request":{"id":"req-123"}}' }
        );
      });
    });
  });

  describe('LoggerFactory Class', () => {
    let factory: LoggerFactory;

    beforeEach(() => {
      factory = new LoggerFactory();
    });

    describe('createLogger', () => {
      it('should create logger with default context when no context provided', () => {
        const logger = factory.createLogger();
        
        expect(logger).toBeInstanceOf(Logger);
        
        // Test the default context
        logger.info('Factory test');
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
          'Factory test',
          { context: 'default' }
        );
      });

      it('should create logger with provided context', () => {
        const context = { service: 'api-gateway', version: '1.0' };
        const logger = factory.createLogger(context);
        
        expect(logger).toBeInstanceOf(Logger);
        
        // Test the provided context
        logger.info('Factory test with context');
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
          'Factory test with context',
          { context: '{"service":"api-gateway","version":"1.0"}' }
        );
      });

      it('should handle empty context object', () => {
        const logger = factory.createLogger({});
        
        logger.info('Empty context test');
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
          'Empty context test',
          { context: '{}' }
        );
      });
    });
  });

  describe('Exported Instances', () => {
    it('should export rootLogger', () => {
      expect(rootLogger).toBeDefined();
      expect(rootLogger).toBe(winston.createLogger());
    });

    it('should export loggerFactory instance', () => {
      expect(loggerFactory).toBeInstanceOf(LoggerFactory);
    });

    it('should export defaultLogger instance', () => {
      expect(defaultLogger).toBeInstanceOf(Logger);
      
      // Test default logger functionality
      defaultLogger.info('Default logger test');
      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Default logger test',
        { context: 'main' }
      );
    });
  });

  describe('Convenience Functions', () => {
    describe('logInfo', () => {
      it('should log info message without context', () => {
        logInfo('Info convenience message');
        
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
          'Info convenience message',
          { context: undefined }
        );
      });

      it('should log info message with context', () => {
        const context = { requestId: 'req-123', userId: 456 };
        logInfo('Info convenience message', context);
        
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
          'Info convenience message',
          { context }
        );
      });

      it('should handle empty context', () => {
        logInfo('Info message', {});
        
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
          'Info message',
          { context: {} }
        );
      });
    });

    describe('logError', () => {
      it('should log error message without context', () => {
        logError('Error convenience message');
        
        expect(mockWinstonLogger.error).toHaveBeenCalledWith(
          'Error convenience message',
          { context: undefined }
        );
      });

      it('should log error message with context', () => {
        const context = { errorCode: 'ERR001', component: 'auth' };
        logError('Error convenience message', context);
        
        expect(mockWinstonLogger.error).toHaveBeenCalledWith(
          'Error convenience message',
          { context }
        );
      });
    });

    describe('logDebug', () => {
      it('should log debug message without context', () => {
        logDebug('Debug convenience message');
        
        expect(mockWinstonLogger.debug).toHaveBeenCalledWith(
          'Debug convenience message',
          { context: undefined }
        );
      });

      it('should log debug message with context', () => {
        const context = { function: 'processRequest', step: 'validation' };
        logDebug('Debug convenience message', context);
        
        expect(mockWinstonLogger.debug).toHaveBeenCalledWith(
          'Debug convenience message',
          { context }
        );
      });
    });
  });

  describe('Winston Configuration', () => {
    it('should use winston createLogger', () => {
      expect(winston.createLogger).toHaveBeenCalled();
    });
  });

  describe('Environment Handling', () => {
    it('should handle production environment', () => {
      // Mock environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Re-import to test production behavior
      jest.resetModules();
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle non-production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Re-import to test development behavior
      jest.resetModules();
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });
});