import { getLogLevel, createLoggerTransports, logger } from '../../../src/config/logging';

describe('Logging Configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('getLogLevel', () => {
        it('should return default log level when LOG_LEVEL is not set', () => {
            delete process.env.LOG_LEVEL;
            delete process.env.NODE_ENV;
            
            const logLevel = getLogLevel();
            
            expect(logLevel).toBe('info');
        });

        it('should return log level from environment variable', () => {
            process.env.LOG_LEVEL = 'debug';
            
            const logLevel = getLogLevel();
            
            expect(logLevel).toBe('debug');
        });

        it('should handle case insensitive log levels', () => {
            process.env.LOG_LEVEL = 'ERROR';
            
            const logLevel = getLogLevel();
            
            expect(logLevel).toBe('error');
        });

        it('should return debug level', () => {
            process.env.LOG_LEVEL = 'debug';
            expect(getLogLevel()).toBe('debug');
        });

        it('should return info level', () => {
            process.env.LOG_LEVEL = 'info';
            expect(getLogLevel()).toBe('info');
        });

        it('should return warn level', () => {
            process.env.LOG_LEVEL = 'warn';
            expect(getLogLevel()).toBe('warn');
        });

        it('should return error level', () => {
            process.env.LOG_LEVEL = 'error';
            expect(getLogLevel()).toBe('error');
        });

        it('should handle invalid log levels gracefully', () => {
            process.env.LOG_LEVEL = 'invalid';
            delete process.env.NODE_ENV;
            
            const logLevel = getLogLevel();
            
            // Should fall back to default
            expect(logLevel).toBe('info');
        });

        it('should handle empty string log level', () => {
            process.env.LOG_LEVEL = '';
            delete process.env.NODE_ENV;
            
            const logLevel = getLogLevel();
            
            expect(logLevel).toBe('info'); // default
        });

        it('should return production log level', () => {
            delete process.env.LOG_LEVEL;
            process.env.NODE_ENV = 'production';
            
            const logLevel = getLogLevel();
            
            expect(logLevel).toBe('info');
        });

        it('should return development log level', () => {
            delete process.env.LOG_LEVEL;
            process.env.NODE_ENV = 'development';
            
            const logLevel = getLogLevel();
            
            expect(logLevel).toBe('debug');
        });

        it('should return test log level', () => {
            delete process.env.LOG_LEVEL;
            process.env.NODE_ENV = 'test';
            
            const logLevel = getLogLevel();
            
            expect(logLevel).toBe('error');
        });

        it('should support all winston log levels', () => {
            const validLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
            
            validLevels.forEach(level => {
                process.env.LOG_LEVEL = level;
                expect(getLogLevel()).toBe(level);
            });
        });
    });

    describe('createLoggerTransports', () => {
        it('should create logger transports', () => {
            const transports = createLoggerTransports();
            
            expect(transports).toBeDefined();
            expect(Array.isArray(transports)).toBe(true);
            expect(transports.length).toBeGreaterThan(0);
        });

        it('should include console transport', () => {
            const transports = createLoggerTransports();
            
            expect(transports.length).toBeGreaterThan(0);
            // Console transport should always be included
            expect(transports[0]).toBeDefined();
        });

        it('should handle test environment', () => {
            process.env.NODE_ENV = 'test';
            
            const transports = createLoggerTransports();
            
            expect(transports).toBeDefined();
            expect(transports.length).toBe(1); // Only console transport in test
        });

        it('should handle non-test environment', () => {
            process.env.NODE_ENV = 'production';
            
            const transports = createLoggerTransports();
            
            expect(transports).toBeDefined();
            expect(transports.length).toBe(3); // Console + 2 file transports
        });

        it('should handle development environment', () => {
            process.env.NODE_ENV = 'development';
            
            const transports = createLoggerTransports();
            
            expect(transports).toBeDefined();
            expect(transports.length).toBe(3); // Console + 2 file transports
        });

        it('should create different transports for different environments', () => {
            process.env.NODE_ENV = 'test';
            const testTransports = createLoggerTransports();
            
            process.env.NODE_ENV = 'production';
            const prodTransports = createLoggerTransports();
            
            expect(testTransports.length).toBe(1);
            expect(prodTransports.length).toBe(3);
        });
    });

    describe('logger export', () => {
        it('should export a winston logger instance', () => {
            expect(logger).toBeDefined();
            expect(typeof logger.info).toBe('function');
            expect(typeof logger.error).toBe('function');
            expect(typeof logger.warn).toBe('function');
            expect(typeof logger.debug).toBe('function');
        });

        it('should have proper configuration', () => {
            expect(logger).toHaveProperty('level');
            expect(logger).toHaveProperty('format');
            expect(logger).toHaveProperty('transports');
        });

        it('should have default metadata', () => {
            expect(logger.defaultMeta).toBeDefined();
            expect(logger.defaultMeta.service).toBe('azure-apim-mcp-server');
        });

        it('should handle log calls without errors', () => {
            expect(() => {
                logger.info('Test info message');
                logger.error('Test error message');
                logger.warn('Test warn message');
                logger.debug('Test debug message');
            }).not.toThrow();
        });
    });

    describe('Environment integration', () => {
        it('should integrate getLogLevel with logger', () => {
            process.env.LOG_LEVEL = 'warn';
            
            const logLevel = getLogLevel();
            
            expect(logLevel).toBe('warn');
        });

        it('should handle environment changes', () => {
            process.env.LOG_LEVEL = 'debug';
            let debugLevel = getLogLevel();
            
            process.env.LOG_LEVEL = 'error';
            let errorLevel = getLogLevel();
            
            expect(debugLevel).toBe('debug');
            expect(errorLevel).toBe('error');
        });

        it('should work with default environment', () => {
            delete process.env.LOG_LEVEL;
            delete process.env.NODE_ENV;
            
            const level = getLogLevel();
            const transports = createLoggerTransports();
            
            expect(level).toBe('info');
            expect(transports).toBeDefined();
        });

        it('should handle missing environment variables gracefully', () => {
            delete process.env.LOG_LEVEL;
            delete process.env.NODE_ENV;
            
            expect(() => {
                getLogLevel();
                createLoggerTransports();
            }).not.toThrow();
        });
    });
});