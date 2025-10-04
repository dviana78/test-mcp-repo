import { ApiVersioningService } from '../../../src/services/api-versioning.service';
import { AzureClient } from '../../../src/services/azure-client';
import { ILogger } from '../../../src/interfaces';
import { ValidationError } from '../../../src/utils/errors';
import { 
  validateCreateApiVersion, 
  validateCreateApiRevision, 
  isValidApiId,
  isValidVersionId
} from '../../../src/utils/validation';

// Mock dependencies
jest.mock('../../../src/services/azure-client');
jest.mock('../../../src/utils/validation');

describe('ApiVersioningService', () => {
  let apiVersioningService: ApiVersioningService;
  let mockAzureClient: jest.Mocked<AzureClient>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockApimClient: any;

  beforeEach(() => {
    // Reset environment variables
    process.env.AZURE_APIM_RESOURCE_GROUP = 'test-rg';
    process.env.AZURE_APIM_SERVICE_NAME = 'test-apim';

    // Create mock APIM client
    mockApimClient = {
      apiVersionSet: {
        get: jest.fn(),
        createOrUpdate: jest.fn()
      },
      api: {
        get: jest.fn(),
        beginCreateOrUpdateAndWait: jest.fn(),
        listByService: jest.fn()
      },
      apiRevision: {
        listByService: jest.fn()
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
      getClient: jest.fn().mockReturnValue(mockApimClient),
      handleAzureError: jest.fn().mockImplementation(() => {
        throw new Error('Azure error handled');
      })
    } as any;

    // Mock validation functions
    (validateCreateApiVersion as jest.Mock).mockReturnValue(true);
    (validateCreateApiRevision as jest.Mock).mockReturnValue(true);
    (isValidApiId as jest.Mock).mockReturnValue(true);
    (isValidVersionId as jest.Mock).mockReturnValue(true);

    apiVersioningService = new ApiVersioningService(mockAzureClient, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance with azure client and logger', () => {
      expect(apiVersioningService).toBeInstanceOf(ApiVersioningService);
      expect(mockAzureClient).toBeDefined();
      expect(mockLogger).toBeDefined();
    });
  });

  describe('createApiVersion', () => {
    const mockRequest = {
      apiId: 'test-api',
      versionId: 'v2',
      displayName: 'Test API v2',
      description: 'Version 2 of test API',
      versioningScheme: 'Segment' as const
    };

    const mockSourceApi = {
      path: '/test',
      protocols: ['https'],
      serviceUrl: 'https://api.test.com',
      subscriptionRequired: true
    };

    it('should create a new API version successfully with existing version set', async () => {
      mockApimClient.apiVersionSet.get.mockResolvedValue({ id: 'test-api-versions' });
      mockApimClient.api.get.mockResolvedValue(mockSourceApi);
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue({
        name: 'test-api-v2',
        displayName: 'Test API v2'
      });

      const result = await apiVersioningService.createApiVersion(mockRequest);

      expect(result).toEqual({
        id: 'test-api-versions',
        name: 'v2',
        displayName: 'Test API v2',
        description: 'Version 2 of test API',
        versioningScheme: 'Segment',
        versionQueryName: undefined,
        versionHeaderName: undefined
      });

      expect(mockApimClient.apiVersionSet.get).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api-versions'
      );
    });

    it('should create version set if it does not exist', async () => {
      const error404 = { statusCode: 404 };
      mockApimClient.apiVersionSet.get.mockRejectedValue(error404);
      mockApimClient.apiVersionSet.createOrUpdate.mockResolvedValue({});
      mockApimClient.api.get.mockResolvedValue(mockSourceApi);
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue({
        name: 'test-api-v2'
      });

      await apiVersioningService.createApiVersion(mockRequest);

      expect(mockApimClient.apiVersionSet.createOrUpdate).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api-versions',
        {
          displayName: 'Test API v2 Versions',
          versioningScheme: 'Segment',
          versionQueryName: undefined,
          versionHeaderName: undefined
        }
      );
    });

    it('should throw ValidationError for invalid API ID', async () => {
      (isValidApiId as jest.Mock).mockReturnValue(false);

      await expect(apiVersioningService.createApiVersion(mockRequest))
        .rejects
        .toThrow(ValidationError);

      expect(isValidApiId).toHaveBeenCalledWith('test-api');
    });

    it('should throw ValidationError for invalid version ID', async () => {
      (isValidVersionId as jest.Mock).mockReturnValue(false);

      await expect(apiVersioningService.createApiVersion(mockRequest))
        .rejects
        .toThrow(ValidationError);

      expect(isValidVersionId).toHaveBeenCalledWith('v2');
    });

    it('should call validation function', async () => {
      mockApimClient.apiVersionSet.get.mockResolvedValue({});
      mockApimClient.api.get.mockResolvedValue(mockSourceApi);
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue({});

      await apiVersioningService.createApiVersion(mockRequest);

      expect(validateCreateApiVersion).toHaveBeenCalledWith(mockRequest);
    });

    it('should create API with default versioningScheme when not provided', async () => {
      const requestWithoutScheme = { 
        ...mockRequest,
        versioningScheme: undefined
      };

      mockApimClient.apiVersionSet.get.mockResolvedValue({});
      mockApimClient.api.get.mockResolvedValue(mockSourceApi);
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue({});

      const result = await apiVersioningService.createApiVersion(requestWithoutScheme);

      expect(result.versioningScheme).toBe('Segment');
    });

    it.skip('should handle version set creation errors other than 404', async () => {
      const error500 = { statusCode: 500, message: 'Server Error' };
      mockApimClient.apiVersionSet.get.mockRejectedValue(error500);

      await expect(apiVersioningService.createApiVersion(mockRequest))
        .rejects
        .toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create API version', error500);
    });

    it('should handle validation errors correctly', async () => {
      (validateCreateApiVersion as jest.Mock).mockImplementation(() => {
        throw new ValidationError('Invalid request');
      });

      await expect(apiVersioningService.createApiVersion(mockRequest))
        .rejects
        .toThrow(ValidationError);
    });

    it.skip('should delegate other errors to Azure client', async () => {
      const error500 = { statusCode: 500, message: 'Server Error' };
      mockApimClient.apiVersionSet.get.mockResolvedValue({});
      mockApimClient.api.get.mockRejectedValue(error500);

      await expect(apiVersioningService.createApiVersion(mockRequest))
        .rejects
        .toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create API version', error500);
    });
  });

  describe('listApiVersions', () => {
    it('should list API versions successfully', async () => {
      const mockVersionSet = {
        versioningScheme: 'Segment',
        versionQueryName: 'version',
        versionHeaderName: 'Api-Version'
      };

      const mockApis = [
        {
          name: 'test-api-v1',
          apiVersion: 'v1',
          displayName: 'Test API v1',
          description: 'Version 1'
        },
        {
          name: 'test-api-v2',
          apiVersion: 'v2',
          displayName: 'Test API v2',
          description: 'Version 2'
        }
      ];

      // Mock async iterator
      const mockAsyncIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn()
            .mockResolvedValueOnce({ done: false, value: mockApis[0] })
            .mockResolvedValueOnce({ done: false, value: mockApis[1] })
            .mockResolvedValueOnce({ done: true })
        })
      };

      mockApimClient.apiVersionSet.get.mockResolvedValue(mockVersionSet);
      mockApimClient.api.listByService.mockReturnValue(mockAsyncIterator);

      const result = await apiVersioningService.listApiVersions('test-api');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'test-api-v1',
        name: 'v1',
        displayName: 'Test API v1',
        description: 'Version 1',
        versioningScheme: 'Segment',
        versionQueryName: 'version',
        versionHeaderName: 'Api-Version'
      });

      expect(mockApimClient.api.listByService).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        { filter: "apiVersionSetId eq 'test-api-versions'" }
      );
    });

    it('should return empty array when version set does not exist', async () => {
      const error404 = { statusCode: 404 };
      mockApimClient.apiVersionSet.get.mockRejectedValue(error404);

      const result = await apiVersioningService.listApiVersions('test-api');

      expect(result).toEqual([]);
    });

    it('should throw ValidationError for invalid API ID', async () => {
      (isValidApiId as jest.Mock).mockReturnValue(false);

      // Mock handleAzureError to check that ValidationError goes through it
      mockAzureClient.handleAzureError.mockImplementation((error) => {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new Error('Azure error handled');
      });

      await expect(apiVersioningService.listApiVersions('invalid-api'))
        .rejects
        .toThrow(ValidationError);

      expect(isValidApiId).toHaveBeenCalledWith('invalid-api');
    });

    it.skip('should handle other errors correctly', async () => {
      const error500 = { statusCode: 500 };
      mockApimClient.apiVersionSet.get.mockRejectedValue(error500);

      await expect(apiVersioningService.listApiVersions('test-api'))
        .rejects
        .toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to list API versions', error500);
    });
  });

  describe('createApiRevision', () => {
    const mockRequest = {
      apiId: 'test-api',
      description: 'New revision with fixes',
      apiRevision: 'rev-001'
    };

    const mockOriginalApi = {
      displayName: 'Test API',
      description: 'Original API',
      serviceUrl: 'https://api.test.com'
    };

    it('should create API revision successfully', async () => {
      mockApimClient.api.get.mockResolvedValue(mockOriginalApi);
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue({
        name: 'test-api;rev=rev-001',
        isOnline: true,
        serviceUrl: 'https://revision.api.test.com'
      });

      const result = await apiVersioningService.createApiRevision(mockRequest);

      expect(result).toEqual({
        id: 'test-api;rev=rev-001',
        apiId: 'test-api',
        apiRevision: 'rev-001',
        description: 'New revision with fixes',
        isCurrent: false,
        isOnline: true,
        privateUrl: 'https://revision.api.test.com',
        createdDateTime: expect.any(Date),
        updatedDateTime: expect.any(Date),
        revisionDescription: 'New revision with fixes'
      });

      expect(mockApimClient.api.beginCreateOrUpdateAndWait).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api;rev=rev-001',
        expect.objectContaining({
          displayName: 'Test API - Revision rev-001',
          description: 'New revision with fixes',
          isCurrent: false,
          apiRevision: 'rev-001',
          sourceApiId: '/apis/test-api'
        })
      );
    });

    it('should generate revision ID when not provided', async () => {
      const requestWithoutRevision = {
        apiId: 'test-api',
        description: 'Auto-generated revision'
      };

      mockApimClient.api.get.mockResolvedValue(mockOriginalApi);
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue({
        name: expect.stringMatching(/test-api;rev=rev-\d+/),
        isOnline: false
      });

      const result = await apiVersioningService.createApiRevision(requestWithoutRevision);

      expect(result.apiRevision).toMatch(/rev-\d+/);
      expect(result.id).toMatch(/test-api;rev=rev-\d+/);
    });

    it('should throw ValidationError for invalid API ID', async () => {
      (isValidApiId as jest.Mock).mockReturnValue(false);

      await expect(apiVersioningService.createApiRevision(mockRequest))
        .rejects
        .toThrow(ValidationError);
    });

    it('should call validation function', async () => {
      mockApimClient.api.get.mockResolvedValue(mockOriginalApi);
      mockApimClient.api.beginCreateOrUpdateAndWait.mockResolvedValue({});

      await apiVersioningService.createApiRevision(mockRequest);

      expect(validateCreateApiRevision).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle validation errors correctly', async () => {
      (validateCreateApiRevision as jest.Mock).mockImplementation(() => {
        throw new ValidationError('Invalid revision request');
      });

      await expect(apiVersioningService.createApiRevision(mockRequest))
        .rejects
        .toThrow(ValidationError);
    });

    it.skip('should delegate other errors to Azure client', async () => {
      const error500 = { statusCode: 500 };
      mockApimClient.api.get.mockRejectedValue(error500);

      await expect(apiVersioningService.createApiRevision(mockRequest))
        .rejects
        .toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create API revision', error500);
    });
  });

  describe('listApiRevisions', () => {
    it('should list API revisions successfully', async () => {
      const mockRevisions = [
        {
          apiId: 'test-api',
          apiRevision: '1',
          description: 'First revision',
          isCurrent: true,
          isOnline: true,
          privateUrl: 'https://api.test.com/rev1',
          createdDateTime: new Date('2023-01-01'),
          updatedDateTime: new Date('2023-01-02')
        },
        {
          apiId: 'test-api',
          apiRevision: '2',
          description: 'Second revision',
          isCurrent: false,
          isOnline: false,
          privateUrl: 'https://api.test.com/rev2',
          createdDateTime: new Date('2023-02-01'),
          updatedDateTime: new Date('2023-02-02')
        }
      ];

      // Mock async iterator
      const mockAsyncIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn()
            .mockResolvedValueOnce({ done: false, value: mockRevisions[0] })
            .mockResolvedValueOnce({ done: false, value: mockRevisions[1] })
            .mockResolvedValueOnce({ done: true })
        })
      };

      mockApimClient.apiRevision.listByService.mockReturnValue(mockAsyncIterator);

      const result = await apiVersioningService.listApiRevisions('test-api');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'test-api',
        apiId: 'test-api',
        apiRevision: '1',
        description: 'First revision',
        isCurrent: true,
        isOnline: true,
        privateUrl: 'https://api.test.com/rev1',
        createdDateTime: new Date('2023-01-01'),
        updatedDateTime: new Date('2023-01-02'),
        revisionDescription: 'First revision'
      });

      expect(mockApimClient.apiRevision.listByService).toHaveBeenCalledWith(
        'test-rg',
        'test-apim',
        'test-api'
      );
    });

    it('should handle revisions with missing optional fields', async () => {
      const mockRevision = {
        // Minimal revision data
        apiRevision: 'minimal'
      };

      const mockAsyncIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn()
            .mockResolvedValueOnce({ done: false, value: mockRevision })
            .mockResolvedValueOnce({ done: true })
        })
      };

      mockApimClient.apiRevision.listByService.mockReturnValue(mockAsyncIterator);

      const result = await apiVersioningService.listApiRevisions('test-api');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '',
        apiId: 'test-api',
        apiRevision: 'minimal',
        description: undefined,
        isCurrent: false,
        isOnline: false,
        privateUrl: undefined,
        createdDateTime: expect.any(Date),
        updatedDateTime: expect.any(Date),
        revisionDescription: undefined
      });
    });

    it('should throw ValidationError for invalid API ID', async () => {
      (isValidApiId as jest.Mock).mockReturnValue(false);

      // Mock handleAzureError to check that ValidationError goes through it
      mockAzureClient.handleAzureError.mockImplementation((error) => {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new Error('Azure error handled');
      });

      await expect(apiVersioningService.listApiRevisions('invalid-api'))
        .rejects
        .toThrow(ValidationError);

      expect(isValidApiId).toHaveBeenCalledWith('invalid-api');
    });

    it.skip('should delegate errors to Azure client', async () => {
      const error500 = { statusCode: 500 };
      mockApimClient.apiRevision.listByService.mockImplementation(() => {
        throw error500;
      });

      await expect(apiVersioningService.listApiRevisions('test-api'))
        .rejects
        .toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to list API revisions', error500);
    });
  });
});