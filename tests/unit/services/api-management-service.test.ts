import { ApiManagementService } from '../../../src/services/api-management.service';
import { AzureClient } from '../../../src/services/azure-client';
import { Logger } from '../../../src/utils/logger';

describe('ApiManagementService', () => {
    let apiManagementService: ApiManagementService;
    let azureClient: AzureClient;
    let logger: Logger;
    let mockApiManagementClient: any;

    beforeEach(() => {
        // Set environment variables for testing
        process.env.AZURE_APIM_RESOURCE_GROUP = 'test-rg';
        process.env.AZURE_APIM_SERVICE_NAME = 'test-apim';
        
        // Mock ApiManagementClient methods
        mockApiManagementClient = {
            api: {
                listByService: jest.fn(),
                get: jest.fn(),
                createOrUpdate: jest.fn(),
                beginCreateOrUpdateAndWait: jest.fn(),
            },
        };

        // Mock AzureClient for testing
        azureClient = {
            testConnection: jest.fn().mockResolvedValue(true),
            getClient: jest.fn().mockReturnValue(mockApiManagementClient),
            handleAzureError: jest.fn().mockImplementation((error) => {
                throw error;
            })
        } as any;
        
        logger = new Logger('Test');
        jest.spyOn(logger, 'info').mockImplementation();
        jest.spyOn(logger, 'error').mockImplementation();
        
        apiManagementService = new ApiManagementService(azureClient, logger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create an instance of ApiManagementService', () => {
        expect(apiManagementService).toBeInstanceOf(ApiManagementService);
    });

    it('should implement IApiManagementService interface', () => {
        expect(typeof apiManagementService.listApis).toBe('function');
        expect(typeof apiManagementService.getApi).toBe('function');
        expect(typeof apiManagementService.createApiFromYaml).toBe('function');
    });

    describe('listApis', () => {
        it('should list APIs successfully', async () => {
            const mockApis = [
                { name: 'api1', displayName: 'Test API 1', path: '/test1', protocols: ['https'] },
                { name: 'api2', displayName: 'Test API 2', path: '/test2', protocols: ['https'] }
            ];
            
            // Create async iterable mock
            const mockIterable = {
                [Symbol.asyncIterator]: async function* () {
                    for (const api of mockApis) {
                        yield api;
                    }
                }
            };
            
            mockApiManagementClient.api.listByService.mockReturnValue(mockIterable);

            const result = await apiManagementService.listApis();

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('api1');
            expect(result[1].name).toBe('api2');
            expect(mockApiManagementClient.api.listByService).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                {}
            );
        });

        it('should handle errors when listing APIs', async () => {
            const error = new Error('Azure API error');
            mockApiManagementClient.api.listByService.mockImplementation(() => {
                throw error;
            });

            await expect(apiManagementService.listApis()).rejects.toThrow('Azure API error');
            expect(logger.error).toHaveBeenCalledWith('Failed to list APIs', error);
        });

        it('should list APIs with filter', async () => {
            const mockApis = [{ name: 'api1', displayName: 'Filtered API', path: '/test', protocols: ['https'] }];
            
            // Create async iterable mock
            const mockIterable = {
                [Symbol.asyncIterator]: async function* () {
                    for (const api of mockApis) {
                        yield api;
                    }
                }
            };
            
            mockApiManagementClient.api.listByService.mockReturnValue(mockIterable);

            const result = await apiManagementService.listApis({ filter: "name eq 'test'" });

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('api1');
            expect(mockApiManagementClient.api.listByService).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                { $filter: "name eq 'test'" }
            );
        });
    });

    describe('getApi', () => {
        it('should get API successfully', async () => {
            const mockApi = { 
                name: 'test-api', 
                displayName: 'Test API', 
                path: '/test',
                protocols: ['https'],
                description: 'Test description'
            };
            mockApiManagementClient.api.get.mockResolvedValue(mockApi);

            const result = await apiManagementService.getApi('test-api');

            expect(result.name).toBe('test-api');
            expect(result.displayName).toBe('Test API');
            expect(result.path).toBe('/test');
            expect(mockApiManagementClient.api.get).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'test-api'
            );
        });

        it('should handle errors when getting API', async () => {
            const error = new Error('API not found');
            mockApiManagementClient.api.get.mockRejectedValue(error);

            await expect(apiManagementService.getApi('nonexistent'))
                .rejects.toThrow('API not found');
            expect(logger.error).toHaveBeenCalledWith('Failed to get API', error);
        });
    });

    describe('createApiFromYaml', () => {
        it('should create API from YAML successfully', async () => {
            const mockApi = { name: 'new-api', displayName: 'New API', path: '/test-api', protocols: ['https'] };
            mockApiManagementClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockApi);

            const yamlContract = 'openapi: 3.0.0\ninfo:\n  title: Test API\n  version: 1.0.0';
            const params = {
                apiId: 'new-api',
                displayName: 'New API',
                yamlContract,
                path: 'test-api',
                protocols: ['https'] as ('http' | 'https')[]
            };

            const result = await apiManagementService.createApiFromYaml(params);

            expect(result.name).toBe('new-api');
            expect(result.displayName).toBe('New API');
            expect(mockApiManagementClient.api.beginCreateOrUpdateAndWait).toHaveBeenCalled();
        });

        it('should handle errors when creating API from YAML', async () => {
            const error = new Error('Invalid YAML');
            mockApiManagementClient.api.beginCreateOrUpdateAndWait.mockRejectedValue(error);

            const params = {
                apiId: 'new-api',
                displayName: 'New API',
                yamlContract: 'invalid yaml',
                path: 'test-api',
                protocols: ['https'] as ('http' | 'https')[]
            };

            await expect(apiManagementService.createApiFromYaml(params))
                .rejects.toThrow('Invalid YAML');
            expect(logger.error).toHaveBeenCalledWith('Failed to create API from YAML with versioning', error);
        });

        it('should create API with versioning', async () => {
            const mockApi = { name: 'versioned-api', displayName: 'Versioned API', path: '/versioned-api', protocols: ['https'] };
            mockApiManagementClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockApi);

            const params = {
                apiId: 'versioned-api',
                displayName: 'Versioned API',
                yamlContract: 'openapi: 3.0.0\ninfo:\n  title: Versioned API\n  version: 1.0.0',
                path: 'versioned-api',
                protocols: ['https'] as ('http' | 'https')[],
                versioningScheme: 'Segment' as 'Segment',
                initialVersion: 'v1'
            };

            const result = await apiManagementService.createApiFromYaml(params);

            expect(result.name).toBe('versioned-api');
            expect(result.displayName).toBe('Versioned API');
            expect(result.path).toBe('/versioned-api');
            expect(mockApiManagementClient.api.beginCreateOrUpdateAndWait).toHaveBeenCalled();
        });
    });
});