import {
  ApimMcpError,
  AzureApiError,
  ValidationError,
  ConfigurationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  isApimMcpError,
  createErrorResponse,
  AppError,
  UnauthorizedError,
  InternalServerError
} from '../../../src/utils/errors';

describe('Error Utils', () => {
  describe('ApimMcpError', () => {
    it('should create error with all parameters', () => {
      const details = { field: 'test' };
      const error = new ApimMcpError('Test error', 'TEST_CODE', 422, details);
      
      expect(error).toBeInstanceOf(ApimMcpError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ApimMcpError');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(422);
      expect(error.details).toBe(details);
    });

    it('should create error with minimal parameters', () => {
      const error = new ApimMcpError('Test error', 'TEST_CODE');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should have correct prototype chain', () => {
      const error = new ApimMcpError('Test', 'CODE');
      expect(Object.getPrototypeOf(error)).toBe(ApimMcpError.prototype);
    });
  });

  describe('AzureApiError', () => {
    it('should create error with all parameters', () => {
      const details = { requestId: '123' };
      const error = new AzureApiError('Azure failed', 500, details);
      
      expect(error).toBeInstanceOf(AzureApiError);
      expect(error).toBeInstanceOf(ApimMcpError);
      expect(error.message).toBe('Azure failed');
      expect(error.name).toBe('AzureApiError');
      expect(error.code).toBe('AZURE_API_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.details).toBe(details);
    });

    it('should create error without details', () => {
      const error = new AzureApiError('Azure failed', 404);
      
      expect(error.statusCode).toBe(404);
      expect(error.details).toBeUndefined();
    });

    it('should have correct prototype chain', () => {
      const error = new AzureApiError('Test', 500);
      expect(Object.getPrototypeOf(error)).toBe(AzureApiError.prototype);
    });
  });

  describe('ValidationError', () => {
    it('should create error with message and details', () => {
      const details = { field: 'username', value: '' };
      const error = new ValidationError('Validation failed', details);
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(ApimMcpError);
      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.details).toBe(details);
    });

    it('should create error without details', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error.details).toBeUndefined();
    });

    it('should have correct prototype chain', () => {
      const error = new ValidationError('Test');
      expect(Object.getPrototypeOf(error)).toBe(ValidationError.prototype);
    });
  });

  describe('ConfigurationError', () => {
    it('should create error with details', () => {
      const details = { setting: 'AZURE_SUBSCRIPTION_ID' };
      const error = new ConfigurationError('Missing configuration', details);
      
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error).toBeInstanceOf(ApimMcpError);
      expect(error.message).toBe('Missing configuration');
      expect(error.name).toBe('ConfigurationError');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.details).toBe(details);
    });

    it('should have correct prototype chain', () => {
      const error = new ConfigurationError('Test');
      expect(Object.getPrototypeOf(error)).toBe(ConfigurationError.prototype);
    });
  });

  describe('AuthenticationError', () => {
    it('should create error with details', () => {
      const details = { provider: 'Azure' };
      const error = new AuthenticationError('Auth failed', details);
      
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error).toBeInstanceOf(ApimMcpError);
      expect(error.message).toBe('Auth failed');
      expect(error.name).toBe('AuthenticationError');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.details).toBe(details);
    });

    it('should have correct prototype chain', () => {
      const error = new AuthenticationError('Test');
      expect(Object.getPrototypeOf(error)).toBe(AuthenticationError.prototype);
    });
  });

  describe('AuthorizationError', () => {
    it('should create error with details', () => {
      const details = { resource: 'API Management' };
      const error = new AuthorizationError('Access denied', details);
      
      expect(error).toBeInstanceOf(AuthorizationError);
      expect(error).toBeInstanceOf(ApimMcpError);
      expect(error.message).toBe('Access denied');
      expect(error.name).toBe('AuthorizationError');
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.statusCode).toBe(403);
      expect(error.details).toBe(details);
    });

    it('should have correct prototype chain', () => {
      const error = new AuthorizationError('Test');
      expect(Object.getPrototypeOf(error)).toBe(AuthorizationError.prototype);
    });
  });

  describe('NotFoundError', () => {
    it('should create error with details', () => {
      const details = { resourceType: 'API', resourceId: 'my-api' };
      const error = new NotFoundError('Resource not found', details);
      
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error).toBeInstanceOf(ApimMcpError);
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('NotFoundError');
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.statusCode).toBe(404);
      expect(error.details).toBe(details);
    });

    it('should have correct prototype chain', () => {
      const error = new NotFoundError('Test');
      expect(Object.getPrototypeOf(error)).toBe(NotFoundError.prototype);
    });
  });

  describe('RateLimitError', () => {
    it('should create error with details', () => {
      const details = { retryAfter: 60 };
      const error = new RateLimitError('Rate limit exceeded', details);
      
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error).toBeInstanceOf(ApimMcpError);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.name).toBe('RateLimitError');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.statusCode).toBe(429);
      expect(error.details).toBe(details);
    });

    it('should have correct prototype chain', () => {
      const error = new RateLimitError('Test');
      expect(Object.getPrototypeOf(error)).toBe(RateLimitError.prototype);
    });
  });

  describe('isApimMcpError', () => {
    it('should return true for ApimMcpError instances', () => {
      const error = new ApimMcpError('Test', 'CODE');
      expect(isApimMcpError(error)).toBe(true);
    });

    it('should return true for derived error classes', () => {
      expect(isApimMcpError(new AzureApiError('Test', 500))).toBe(true);
      expect(isApimMcpError(new ValidationError('Test'))).toBe(true);
      expect(isApimMcpError(new ConfigurationError('Test'))).toBe(true);
      expect(isApimMcpError(new AuthenticationError('Test'))).toBe(true);
      expect(isApimMcpError(new AuthorizationError('Test'))).toBe(true);
      expect(isApimMcpError(new NotFoundError('Test'))).toBe(true);
      expect(isApimMcpError(new RateLimitError('Test'))).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');
      expect(isApimMcpError(error)).toBe(false);
    });

    it('should return false for non-error objects', () => {
      expect(isApimMcpError('string')).toBe(false);
      expect(isApimMcpError(123)).toBe(false);
      expect(isApimMcpError(null)).toBe(false);
      expect(isApimMcpError(undefined)).toBe(false);
      expect(isApimMcpError({})).toBe(false);
    });

    it('should return false for legacy error classes', () => {
      expect(isApimMcpError(new AppError('Test', 500))).toBe(false);
      expect(isApimMcpError(new UnauthorizedError())).toBe(false);
      expect(isApimMcpError(new InternalServerError())).toBe(false);
    });
  });

  describe('createErrorResponse', () => {
    it('should create response from ApimMcpError with all properties', () => {
      const details = { field: 'apiId' };
      const error = new ApimMcpError('Custom error', 'CUSTOM_ERROR', 422, details);
      const response = createErrorResponse(error);

      expect(response).toEqual({
        code: 'CUSTOM_ERROR',
        message: 'Custom error',
        statusCode: 422,
        details
      });
    });

    it('should create response from ApimMcpError without statusCode', () => {
      const error = new ApimMcpError('Error', 'CODE');
      const response = createErrorResponse(error);

      expect(response).toEqual({
        code: 'CODE',
        message: 'Error',
        statusCode: 500,
        details: undefined
      });
    });

    it('should create response from ValidationError', () => {
      const error = new ValidationError('Validation failed');
      const response = createErrorResponse(error);

      expect(response).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        statusCode: 400,
        details: undefined
      });
    });

    it('should create response from AzureApiError', () => {
      const details = { requestId: '123' };
      const error = new AzureApiError('Azure failed', 500, details);
      const response = createErrorResponse(error);

      expect(response).toEqual({
        code: 'AZURE_API_ERROR',
        message: 'Azure failed',
        statusCode: 500,
        details
      });
    });

    it('should create response from generic Error', () => {
      const error = new Error('Generic error message');
      const response = createErrorResponse(error);

      expect(response).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Generic error message',
        statusCode: 500
      });
    });

    it('should create response from string', () => {
      const response = createErrorResponse('String error message');

      expect(response).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        statusCode: 500,
        details: 'String error message'
      });
    });

    it('should create response from object', () => {
      const customObject = { custom: 'object' };
      const response = createErrorResponse(customObject);

      expect(response).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        statusCode: 500,
        details: customObject
      });
    });

    it('should handle null/undefined errors', () => {
      const nullResponse = createErrorResponse(null);
      const undefinedResponse = createErrorResponse(undefined);

      expect(nullResponse).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        statusCode: 500,
        details: null
      });

      expect(undefinedResponse).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        statusCode: 500,
        details: undefined
      });
    });
  });

  describe('Legacy Error Classes', () => {
    describe('AppError', () => {
      it('should create error with all parameters', () => {
        const error = new AppError('App error', 422, false);
        
        expect(error).toBeInstanceOf(AppError);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('App error');
        expect(error.statusCode).toBe(422);
        expect(error.isOperational).toBe(false);
      });

      it('should create error with default isOperational', () => {
        const error = new AppError('App error', 500);
        
        expect(error.isOperational).toBe(true);
      });

      it('should capture stack trace', () => {
        const error = new AppError('Test', 500);
        expect(error.stack).toBeDefined();
      });
    });

    describe('UnauthorizedError', () => {
      it('should create error with default message', () => {
        const error = new UnauthorizedError();
        
        expect(error).toBeInstanceOf(UnauthorizedError);
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('Unauthorized access');
        expect(error.statusCode).toBe(401);
        expect(error.isOperational).toBe(true);
      });

      it('should create error with custom message', () => {
        const error = new UnauthorizedError('Custom unauthorized message');
        
        expect(error.message).toBe('Custom unauthorized message');
        expect(error.statusCode).toBe(401);
      });
    });

    describe('InternalServerError', () => {
      it('should create error with default message', () => {
        const error = new InternalServerError();
        
        expect(error).toBeInstanceOf(InternalServerError);
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('Internal server error');
        expect(error.statusCode).toBe(500);
        expect(error.isOperational).toBe(true);
      });

      it('should create error with custom message', () => {
        const error = new InternalServerError('Custom server error');
        
        expect(error.message).toBe('Custom server error');
        expect(error.statusCode).toBe(500);
      });
    });
  });
});