import { ApiOperationsService } from '../../../src/services/api-operations.service';
import { AzureClient } from '../../../src/services/azure-client';
import { ILogger } from '../../../src/interfaces';
import { isValidApiId } from '../../../src/utils/validation';

// Mock dependencies
jest.mock('../../../src/services/azure-client');
jest.mock('../../../src/utils/validation');

describe('ApiOperationsService', () => {
  let apiOperationsService: ApiOperationsService;
  let mockAzureClient: jest.Mocked<AzureClient>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockApiManagementClient: any;
  let mockIsValidApiId: jest.MockedFunction<typeof isValidApiId>;

  beforeEach(() => {
    // Mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      child: jest.fn()
    };

    // Mock API Management client
    mockApiManagementClient = {
      apiOperation: {
        listByApi: jest.fn()
      }
    };

    // Mock AzureClient
    mockAzureClient = {
      getClient: jest.fn().mockReturnValue(mockApiManagementClient),
      handleAzureError: jest.fn(),
      initialize: jest.fn(),
      testConnection: jest.fn()
    } as any;

    (AzureClient as jest.MockedClass<typeof AzureClient>).mockImplementation(() => mockAzureClient);

    // Mock validation function - default to valid
    mockIsValidApiId = isValidApiId as jest.MockedFunction<typeof isValidApiId>;
    mockIsValidApiId.mockReturnValue(true);

    // Set environment variables
    process.env.AZURE_APIM_RESOURCE_GROUP = 'test-rg';
    process.env.AZURE_APIM_SERVICE_NAME = 'test-apim';

    apiOperationsService = new ApiOperationsService(mockAzureClient, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.AZURE_APIM_RESOURCE_GROUP;
    delete process.env.AZURE_APIM_SERVICE_NAME;
  });

  describe('constructor', () => {
    it('should create ApiOperationsService instance', () => {
      expect(apiOperationsService).toBeInstanceOf(ApiOperationsService);
    });

    it('should store azureClient and logger', () => {
      expect(apiOperationsService['azureClient']).toBe(mockAzureClient);
      expect(apiOperationsService['logger']).toBe(mockLogger);
    });
  });

  describe('getApiOperations', () => {
    const mockOperationsData = [
      {
        name: 'operation1',
        displayName: 'Get Users',
        method: 'GET',
        urlTemplate: '/users',
        description: 'Get all users',
        policies: { inbound: [], backend: [], outbound: [] }
      },
      {
        name: 'operation2',
        displayName: 'Create User',
        method: 'POST',
        urlTemplate: '/users',
        description: 'Create a new user',
        policies: { inbound: [], backend: [], outbound: [] }
      }
    ];

    beforeEach(() => {
      // Mock async iterator for listByApi
      mockApiManagementClient.apiOperation.listByApi.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const operation of mockOperationsData) {
            yield operation;
          }
        }
      });
    });

    it('should get API operations successfully', async () => {
      const apiId = 'test-api';
      const result = await apiOperationsService.getApiOperations(apiId);

      expect(mockIsValidApiId).toHaveBeenCalledWith(apiId);
      expect(mockLogger.info).toHaveBeenCalledWith('Getting API operations', { apiId });
      expect(mockAzureClient.getClient).toHaveBeenCalled();
      expect(mockApiManagementClient.apiOperation.listByApi).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        apiId
      );

      expect(result).toEqual([
        {
          id: 'operation1',
          name: 'operation1',
          displayName: 'Get Users',
          method: 'GET',
          urlTemplate: '/users',
          description: 'Get all users',
          policies: { inbound: [], backend: [], outbound: [] }
        },
        {
          id: 'operation2',
          name: 'operation2',
          displayName: 'Create User',
          method: 'POST',
          urlTemplate: '/users',
          description: 'Create a new user',
          policies: { inbound: [], backend: [], outbound: [] }
        }
      ]);

      expect(mockLogger.info).toHaveBeenCalledWith('Found 2 API operations');
    });

    it('should handle empty operations list', async () => {
      mockApiManagementClient.apiOperation.listByApi.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          // Empty iterator
        }
      });

      const result = await apiOperationsService.getApiOperations('test-api');

      expect(result).toEqual([]);
      expect(mockLogger.info).toHaveBeenCalledWith('Found 0 API operations');
    });

    it('should handle operations with missing properties', async () => {
      const incompleteOperations = [
        {
          name: 'operation-incomplete',
          // Missing displayName, method, etc.
          urlTemplate: '/incomplete'
        },
        {
          // Missing name
          displayName: 'No Name Operation',
          method: 'PUT'
        }
      ];

      mockApiManagementClient.apiOperation.listByApi.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const operation of incompleteOperations) {
            yield operation;
          }
        }
      });

      const result = await apiOperationsService.getApiOperations('test-api');

      expect(result).toEqual([
        {
          id: 'operation-incomplete',
          name: 'operation-incomplete',
          displayName: '',
          method: '',
          urlTemplate: '/incomplete',
          description: undefined,
          policies: undefined
        },
        {
          id: '',
          name: '',
          displayName: 'No Name Operation',
          method: 'PUT',
          urlTemplate: '',
          description: undefined,
          policies: undefined
        }
      ]);
    });

    it('should handle different HTTP methods', async () => {
      const operationsWithMethods = [
        { name: 'get-op', method: 'GET', urlTemplate: '/get' },
        { name: 'post-op', method: 'POST', urlTemplate: '/post' },
        { name: 'put-op', method: 'PUT', urlTemplate: '/put' },
        { name: 'delete-op', method: 'DELETE', urlTemplate: '/delete' },
        { name: 'patch-op', method: 'PATCH', urlTemplate: '/patch' }
      ];

      mockApiManagementClient.apiOperation.listByApi.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const operation of operationsWithMethods) {
            yield operation;
          }
        }
      });

      const result = await apiOperationsService.getApiOperations('test-api');

      expect(result).toHaveLength(5);
      expect(result.map(op => op.method)).toEqual(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
    });

    it('should handle complex URL templates', async () => {
      const operationsWithComplexUrls = [
        { name: 'op1', urlTemplate: '/users/{id}' },
        { name: 'op2', urlTemplate: '/users/{id}/posts/{postId}' },
        { name: 'op3', urlTemplate: '/search?query={query}&limit={limit}' }
      ];

      mockApiManagementClient.apiOperation.listByApi.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const operation of operationsWithComplexUrls) {
            yield operation;
          }
        }
      });

      const result = await apiOperationsService.getApiOperations('test-api');

      expect(result.map(op => op.urlTemplate)).toEqual([
        '/users/{id}',
        '/users/{id}/posts/{postId}',
        '/search?query={query}&limit={limit}'
      ]);
    });

    it('should handle large number of operations efficiently', async () => {
      const manyOperations = Array.from({ length: 25 }, (_, i) => ({
        name: `operation-${i}`,
        displayName: `Operation ${i}`,
        method: i % 2 === 0 ? 'GET' : 'POST',
        urlTemplate: `/api/v1/resource${i}`
      }));

      mockApiManagementClient.apiOperation.listByApi.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const operation of manyOperations) {
            yield operation;
          }
        }
      });

      const result = await apiOperationsService.getApiOperations('test-api');

      expect(result).toHaveLength(25);
      expect(mockLogger.info).toHaveBeenCalledWith('Found 25 API operations');
    });

    it('should validate API ID before processing', async () => {
      const apiId = 'valid-api-123';
      
      await apiOperationsService.getApiOperations(apiId);
      
      expect(mockIsValidApiId).toHaveBeenCalledWith(apiId);
      expect(mockApiManagementClient.apiOperation.listByApi).toHaveBeenCalled();
    });

    it('should log correct information during successful operation', async () => {
      await apiOperationsService.getApiOperations('test-api');

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenNthCalledWith(1, 'Getting API operations', { apiId: 'test-api' });
      expect(mockLogger.info).toHaveBeenNthCalledWith(2, 'Found 2 API operations');
    });

    it('should use correct environment variables', async () => {
      await apiOperationsService.getApiOperations('test-api');

      expect(mockApiManagementClient.apiOperation.listByApi).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api'
      );
    });
  });
});