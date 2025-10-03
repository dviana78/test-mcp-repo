// Test setup file
import { jest } from '@jest/globals';

// Mock console methods in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock process.env
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Set test environment variables
process.env.AZURE_TENANT_ID = 'test-tenant-id';
process.env.AZURE_CLIENT_ID = 'test-client-id';
process.env.AZURE_CLIENT_SECRET = 'test-client-secret';
process.env.AZURE_SUBSCRIPTION_ID = 'test-subscription-id';
process.env.AZURE_APIM_RESOURCE_GROUP = 'test-resource-group';
process.env.AZURE_APIM_SERVICE_NAME = 'test-service-name';