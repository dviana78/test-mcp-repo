import { ApiManagementService } from '../../../src/services/api-management.service';
import { AzureClient } from '../../../src/services/azure-client';
import { ILogger } from '../../../src/interfaces';
import { ValidationError, NotFoundError } from '../../../src/utils/errors';
import { isValidApiId, sanitizeApiPath } from '../../../src/utils/validation';

// Mock dependencies
jest.mock('../../../src/services/azure-client');
jest.mock('../../../src/utils/validation');

describe('ApiManagementService', () => {
  let apiManagementService: ApiManagementService;
  let mockAzureClient: jest.Mocked<AzureClient>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockApimClient: any;

  const sampleYamlContract = `
openapi: 3.0.3
info:
  title: Test API
  version: 1.0.0
servers:
  - url: https://api.test.com
paths:
  /users:
    get:
      summary: Get users
      responses:
        '200':
          description: Successful response
`;

  beforeEach(() => {
    // Reset environment variables
    process.env.AZURE_APIM_RESOURCE_GROUP = 'test-rg';
    process.env.AZURE_APIM_SERVICE_NAME = 'test-apim';

    // Create mock APIM client
    mockApimClient = {
      api: {
        listByService: jest.fn(),
        get: jest.fn(),
        beginCreateOrUpdateAndWait: jest.fn()
      },
      backend: {
        createOrUpdate: jest.fn()
      },
      apiVersionSet: {
        createOrUpdate: jest.fn()
      },
      apiPolicy: {
        createOrUpdate: jest.fn()
      }
    };

    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    // Create mock Azure client
    mockAzureClient = {
      getClient: jest.fn().mockReturnValue(mockApimClient)
    } as any;

    // Mock validation functions
    (isValidApiId as jest.Mock).mockReturnValue(true);
    (sanitizeApiPath as jest.Mock).mockImplementation((path: string) => path);

    apiManagementService = new ApiManagementService(mockAzureClient, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance with azure client and logger', () => {
      expect(apiManagementService).toBeInstanceOf(ApiManagementService);
      expect(mockAzureClient).toBeDefined();
      expect(mockLogger).toBeDefined();
    });
  });

  describe('listApis', () => {
    const mockApis = [
      {
        name: 'api-1',
        displayName: 'Test API 1',
        path: '/api1',
        protocols: ['https']
      },
      {
        name: 'api-2',
        displayName: 'Test API 2',
        path: '/api2',
        protocols: ['https']
      }
    ];

    it('should list APIs successfully without options', async () => {
      // Mock async iterator
      const mockAsyncIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn()
            .mockResolvedValueOnce({ done: false, value: mockApis[0] })
            .mockResolvedValueOnce({ done: false, value: mockApis[1] })
            .mockResolvedValueOnce({ done: true })
        })
      };

      mockApimClient.api.listByService.mockReturnValue(mockAsyncIterator);

      const result = await apiManagementService.listApis();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'api-1',
        name: 'api-1',
        displayName: 'Test API 1',
        description: undefined,
        path: '/api1',
        protocols: ['https'],
        serviceUrl: undefined,
        apiVersion: undefined,
        apiVersionSetId: undefined,
        isCurrent: undefined,
        isOnline: undefined,
        type: undefined,
        subscriptionRequired: undefined,
        authenticationSettings: undefined
      });

      expect(mockApimClient.api.listByService).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        {}
      );
    });

    it('should list APIs with filter and pagination options', async () => {
      const mockAsyncIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn().mockResolvedValueOnce({ done: true })
        })
      };

      mockApimClient.api.listByService.mockReturnValue(mockAsyncIterator);

      const options = {
        filter: "startswith(name,'test')",
        top: 10,
        skip: 5
      };

      await apiManagementService.listApis(options);

      expect(mockApimClient.api.listByService).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        {
          $filter: "startswith(name,'test')",
          $top: 10,
          $skip: 5
        }
      );
    });

    it('should handle errors correctly', async () => {
      const error = new Error('List APIs failed');
      mockApimClient.api.listByService.mockImplementation(() => {
        throw error;
      });

      await expect(apiManagementService.listApis())
        .rejects
        .toThrow('List APIs failed');

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to list APIs', error);
    });
  });

  describe('getApi', () => {
    const mockApi = {
      name: 'test-api',
      displayName: 'Test API',
      description: 'Test API description',
      path: '/test',
      protocols: ['https'],
      serviceUrl: 'https://api.test.com'
    };

    it('should get API successfully', async () => {
      mockApimClient.api.get.mockResolvedValue(mockApi);

      const result = await apiManagementService.getApi('test-api');

      expect(result).toEqual({
        id: 'test-api',
        name: 'test-api',
        displayName: 'Test API',
        description: 'Test API description',
        path: '/test',
        protocols: ['https'],
        serviceUrl: 'https://api.test.com',
        apiVersion: undefined,
        apiVersionSetId: undefined,
        isCurrent: undefined,
        isOnline: undefined,
        type: undefined,
        subscriptionRequired: undefined,
        authenticationSettings: undefined
      });

      expect(mockApimClient.api.get).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api'
      );
    });

    it('should throw ValidationError for invalid API ID', async () => {
      (isValidApiId as jest.Mock).mockReturnValue(false);

      await expect(apiManagementService.getApi('invalid-api'))
        .rejects
        .toThrow(ValidationError);

      expect(isValidApiId).toHaveBeenCalledWith('invalid-api');
    });

    it('should throw NotFoundError for 404 errors', async () => {
      const error404 = { statusCode: 404 };
      mockApimClient.api.get.mockRejectedValue(error404);

      await expect(apiManagementService.getApi('nonexistent-api'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should handle other errors correctly', async () => {
      const error500 = new Error('Server error');
      mockApimClient.api.get.mockRejectedValue(error500);

      await expect(apiManagementService.getApi('test-api'))
        .rejects
        .toThrow('Server error');

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get API', error500);
    });
  });

  describe('createApiFromYaml', () => {
    const basicParams = {
      apiId: 'test-api',
      displayName: 'Test API',
      yamlContract: sampleYamlContract
    };

    const mockCreatedApi = {
      name: 'test-api',
      displayName: 'Test API',
      path: 'test-api',
      protocols: ['https']
    };

    it('should create API from YAML successfully', async () => {
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockCreatedApi);

      const result = await apiManagementService.createApiFromYaml(basicParams);

      expect(result).toEqual({
        id: 'test-api',
        name: 'test-api',
        displayName: 'Test API',
        description: undefined,
        path: 'test-api',
        protocols: ['https'],
        serviceUrl: undefined,
        apiVersion: undefined,
        apiVersionSetId: undefined,
        isCurrent: undefined,
        isOnline: undefined,
        type: undefined,
        subscriptionRequired: undefined,
        authenticationSettings: undefined
      });

      expect(mockApimClient.api.beginCreateOrUpdateAndWait).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api',
        expect.objectContaining({
          displayName: 'Test API',
          path: 'test-api',
          protocols: ['https'],
          subscriptionRequired: true,
          value: sampleYamlContract,
          format: 'openapi',
          apiType: 'http',
          import: true
        })
      );
    });

    it('should throw ValidationError for invalid API ID', async () => {
      (isValidApiId as jest.Mock).mockReturnValue(false);

      await expect(apiManagementService.createApiFromYaml(basicParams))
        .rejects
        .toThrow(ValidationError);
    });

    it('should throw ValidationError for empty YAML contract', async () => {
      const params = { ...basicParams, yamlContract: '' };

      await expect(apiManagementService.createApiFromYaml(params))
        .rejects
        .toThrow(ValidationError);
    });

    it('should create backend service when serviceUrl is provided', async () => {
      const params = {
        ...basicParams,
        serviceUrl: 'https://backend.test.com'
      };

      mockApimClient.backend.createOrUpdate.mockResolvedValue({});
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockCreatedApi);

      await apiManagementService.createApiFromYaml(params);

      // The code extracts URL from YAML first, then falls back to serviceUrl
      // Since our sample YAML has servers section, it uses that URL
      expect(mockApimClient.backend.createOrUpdate).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api-backend',
        expect.objectContaining({
          title: 'Test API Backend',
          url: 'https://api.test.com', // URL extracted from YAML
          protocol: 'http'
        })
      );
    });

    it('should extract backend URL from YAML contract', async () => {
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockCreatedApi);

      await apiManagementService.createApiFromYaml(basicParams);

      // Should extract https://api.test.com from the YAML servers section
      expect(mockApimClient.api.beginCreateOrUpdateAndWait).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api',
        expect.objectContaining({
          serviceUrl: 'https://api.test.com'
        })
      );
    });

    it('should create versioned API with version set', async () => {
      const params = {
        ...basicParams,
        initialVersion: 'v1',
        versioningScheme: 'Segment' as const
      };

      const mockVersionSet = { id: 'version-set-id' };
      mockApimClient.apiVersionSet.createOrUpdate.mockResolvedValue(mockVersionSet);
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockCreatedApi);

      await apiManagementService.createApiFromYaml(params);

      expect(mockApimClient.apiVersionSet.createOrUpdate).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api-version-set',
        expect.objectContaining({
          displayName: 'Test API Version Set',
          versioningScheme: 'Segment'
        })
      );

      expect(mockApimClient.api.beginCreateOrUpdateAndWait).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api',
        expect.objectContaining({
          apiVersion: 'v1',
          apiVersionSetId: 'version-set-id',
          path: 'test-api/v1'
        })
      );
    });

    it('should handle backend creation failure gracefully', async () => {
      const params = {
        ...basicParams,
        serviceUrl: 'https://backend.test.com'
      };

      mockApimClient.backend.createOrUpdate.mockRejectedValue(new Error('Backend creation failed'));
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockCreatedApi);

      await apiManagementService.createApiFromYaml(params);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to create backend service, using direct service URL',
        expect.any(Error)
      );
    });

    it('should handle version set creation failure gracefully', async () => {
      const params = {
        ...basicParams,
        initialVersion: 'v1'
      };

      mockApimClient.apiVersionSet.createOrUpdate.mockRejectedValue(new Error('Version set creation failed'));
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockCreatedApi);

      await apiManagementService.createApiFromYaml(params);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to create version set, creating API without versioning',
        expect.any(Error)
      );
    });

    it('should create and configure API policies when backend is created', async () => {
      const params = {
        ...basicParams,
        serviceUrl: 'https://backend.test.com'
      };

      mockApimClient.backend.createOrUpdate.mockResolvedValue({});
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockCreatedApi);
      mockApimClient.apiPolicy.createOrUpdate.mockResolvedValue({});

      await apiManagementService.createApiFromYaml(params);

      expect(mockApimClient.apiPolicy.createOrUpdate).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api',
        'policy',
        expect.objectContaining({
          format: 'xml',
          value: expect.stringContaining('<set-backend-service backend-id="test-api-backend" />')
        })
      );
    });

    it('should handle policy creation failure gracefully', async () => {
      const params = {
        ...basicParams,
        serviceUrl: 'https://backend.test.com'
      };

      mockApimClient.backend.createOrUpdate.mockResolvedValue({});
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockCreatedApi);
      mockApimClient.apiPolicy.createOrUpdate.mockRejectedValue(new Error('Policy creation failed'));

      await apiManagementService.createApiFromYaml(params);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to configure API policies for backend service',
        expect.any(Error)
      );
    });

    it('should handle 400 errors with ValidationError', async () => {
      const error400 = { statusCode: 400, message: 'Bad Request' };
      mockApimClient.api.beginCreateOrUpdateAndWait.mockRejectedValue(error400);

      await expect(apiManagementService.createApiFromYaml(basicParams))
        .rejects
        .toThrow(ValidationError);
    });

    it('should handle 409 errors with ValidationError', async () => {
      const error409 = { statusCode: 409, message: 'Conflict' };
      mockApimClient.api.beginCreateOrUpdateAndWait.mockRejectedValue(error409);

      await expect(apiManagementService.createApiFromYaml(basicParams))
        .rejects
        .toThrow(ValidationError);
    });

    it('should handle other errors correctly', async () => {
      const error500 = new Error('Server error');
      mockApimClient.api.beginCreateOrUpdateAndWait.mockRejectedValue(error500);

      await expect(apiManagementService.createApiFromYaml(basicParams))
        .rejects
        .toThrow('Server error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create API from YAML with versioning',
        error500
      );
    });

    it('should use provided serviceUrl when YAML has no servers section', async () => {
      const yamlWithoutServers = `
openapi: 3.0.3
info:
  title: Test API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get users
`;

      const params = {
        ...basicParams,
        yamlContract: yamlWithoutServers,
        serviceUrl: 'https://backend.test.com'
      };

      mockApimClient.backend.createOrUpdate.mockResolvedValue({});
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockCreatedApi);

      await apiManagementService.createApiFromYaml(params);

      expect(mockApimClient.backend.createOrUpdate).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api-backend',
        expect.objectContaining({
          title: 'Test API Backend',
          url: 'https://backend.test.com',
          protocol: 'http'
        })
      );
    });

    it('should handle YAML parsing errors gracefully', async () => {
      const yamlWithoutServers = `
openapi: 3.0.3
info:
  title: Test API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get users
`;

      const params = {
        ...basicParams,
        yamlContract: yamlWithoutServers
      };

      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockCreatedApi);

      const result = await apiManagementService.createApiFromYaml(params);

      expect(result).toBeDefined();
      // Should still work even without servers section
    });
  });

  describe('mapAzureApiToApiInfo', () => {
    it('should map Azure API object correctly', () => {
      const mapMethod = (apiManagementService as any).mapAzureApiToApiInfo.bind(apiManagementService);
      
      const azureApi = {
        name: 'test-api',
        displayName: 'Test API',
        description: 'Test Description',
        path: '/test',
        protocols: ['https'],
        serviceUrl: 'https://api.test.com',
        apiVersion: 'v1',
        subscriptionRequired: true,
        authenticationSettings: { oAuth2: { scope: 'read' } }
      };

      const result = mapMethod(azureApi);

      expect(result).toEqual({
        id: 'test-api',
        name: 'test-api',
        displayName: 'Test API',
        description: 'Test Description',
        path: '/test',
        protocols: ['https'],
        serviceUrl: 'https://api.test.com',
        apiVersion: 'v1',
        apiVersionSetId: undefined,
        isCurrent: undefined,
        isOnline: undefined,
        type: undefined,
        subscriptionRequired: true,
        authenticationSettings: { oAuth2: { scope: 'read' } }
      });
    });

    it('should handle missing properties gracefully', () => {
      const mapMethod = (apiManagementService as any).mapAzureApiToApiInfo.bind(apiManagementService);
      
      const azureApi = {};

      const result = mapMethod(azureApi);

      expect(result).toEqual({
        id: '',
        name: '',
        displayName: '',
        description: undefined,
        path: '',
        protocols: [],
        serviceUrl: undefined,
        apiVersion: undefined,
        apiVersionSetId: undefined,
        isCurrent: undefined,
        isOnline: undefined,
        type: undefined,
        subscriptionRequired: undefined,
        authenticationSettings: undefined
      });
    });
  });
});