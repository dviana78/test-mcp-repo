import { BackendServicesService } from '../../../src/services/backend-services.service';
import { AzureClient } from '../../../src/services/azure-client';
import { ILogger } from '../../../src/interfaces';

// Mock dependencies
jest.mock('../../../src/services/azure-client');

describe('BackendServicesService', () => {
  let backendService: BackendServicesService;
  let mockAzureClient: jest.Mocked<AzureClient>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockApiManagementClient: any;

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
      backend: {
        listByService: jest.fn()
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

    // Set environment variables
    process.env.AZURE_APIM_RESOURCE_GROUP = 'test-rg';
    process.env.AZURE_APIM_SERVICE_NAME = 'test-apim';

    backendService = new BackendServicesService(mockAzureClient, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.AZURE_APIM_RESOURCE_GROUP;
    delete process.env.AZURE_APIM_SERVICE_NAME;
  });

  describe('constructor', () => {
    it('should create BackendServicesService instance', () => {
      expect(backendService).toBeInstanceOf(BackendServicesService);
    });

    it('should store azureClient and logger', () => {
      expect(backendService['azureClient']).toBe(mockAzureClient);
      expect(backendService['logger']).toBe(mockLogger);
    });
  });

  describe('listBackends', () => {
    const mockBackendData = [
      {
        name: 'backend1',
        title: 'Backend Service 1',
        description: 'First backend service',
        url: 'https://api1.example.com',
        protocol: 'http',
        resourceId: 'resource-1',
        properties: { prop1: 'value1' }
      }
    ];

    beforeEach(() => {
      // Mock async iterator for listByService
      mockApiManagementClient.backend.listByService.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const backend of mockBackendData) {
            yield backend;
          }
        }
      });
    });

    it('should list backend services successfully', async () => {
      const result = await backendService.listBackends();

      expect(mockLogger.info).toHaveBeenCalledWith('Listing backend services', undefined);
      expect(mockAzureClient.getClient).toHaveBeenCalled();
      expect(mockApiManagementClient.backend.listByService).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        {}
      );

      expect(result).toEqual([
        {
          id: 'backend1',
          title: 'Backend Service 1',
          description: 'First backend service',
          url: 'https://api1.example.com',
          protocol: 'http',
          resourceId: 'resource-1',
          properties: { prop1: 'value1' }
        }
      ]);

      expect(mockLogger.info).toHaveBeenCalledWith('Found 1 backend services');
    });

    it('should handle empty backend list', async () => {
      mockApiManagementClient.backend.listByService.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          // Empty iterator
        }
      });

      const result = await backendService.listBackends();

      expect(result).toEqual([]);
      expect(mockLogger.info).toHaveBeenCalledWith('Found 0 backend services');
    });

    it('should list backends with filter options', async () => {
      const options = {
        filter: 'name eq \'backend1\'',
        top: 10,
        skip: 5
      };

      await backendService.listBackends(options);

      expect(mockLogger.info).toHaveBeenCalledWith('Listing backend services', options);
      expect(mockApiManagementClient.backend.listByService).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        {
          $filter: 'name eq \'backend1\'',
          $top: 10,
          $skip: 5
        }
      );
    });

    it('should handle backends with missing properties', async () => {
      const incompleteBackend = {
        name: 'backend-incomplete',
        // Missing title, description, etc.
        url: 'https://incomplete.example.com'
      };

      mockApiManagementClient.backend.listByService.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield incompleteBackend;
        }
      });

      const result = await backendService.listBackends();

      expect(result).toEqual([
        {
          id: 'backend-incomplete',
          title: '',
          description: undefined,
          url: 'https://incomplete.example.com',
          protocol: '',
          resourceId: undefined,
          properties: undefined
        }
      ]);
    });
  });
});