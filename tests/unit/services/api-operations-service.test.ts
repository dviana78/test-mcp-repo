import { ApiOperationsService } from '../../../src/services/api-operations.service';
import { AzureClient } from '../../../src/services/azure-client';
import { Logger } from '../../../src/utils/logger';

describe('ApiOperationsService', () => {
    let apiOperationsService: ApiOperationsService;
    let azureClient: AzureClient;
    let logger: Logger;
    let mockApiManagementClient: any;

    beforeEach(() => {
        // Set environment variables for testing
        process.env.AZURE_APIM_RESOURCE_GROUP = 'test-rg';
        process.env.AZURE_APIM_SERVICE_NAME = 'test-apim';
        
        // Mock ApiManagementClient methods
        mockApiManagementClient = {
            apiOperation: {
                listByApi: jest.fn(),
            },
        };

        // Mock AzureClient for testing
        azureClient = {
            testConnection: jest.fn().mockResolvedValue(true),
            getClient: jest.fn().mockReturnValue(mockApiManagementClient),
            handleAzureError: jest.fn().mockImplementation((error) => { throw error; }),
        } as any;
        
        logger = new Logger('Test');
        jest.spyOn(logger, 'info').mockImplementation();
        jest.spyOn(logger, 'error').mockImplementation();
        
        apiOperationsService = new ApiOperationsService(azureClient, logger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create an instance of ApiOperationsService', () => {
        expect(apiOperationsService).toBeInstanceOf(ApiOperationsService);
    });

    it('should implement IApiOperationsService interface', () => {
        expect(typeof apiOperationsService.getApiOperations).toBe('function');
    });

    describe('getApiOperations', () => {
        it('should get API operations successfully', async () => {
            const mockOperations = [
                { name: 'GetUsers', displayName: 'Get Users', method: 'GET', urlTemplate: '/users' },
                { name: 'CreateUser', displayName: 'Create User', method: 'POST', urlTemplate: '/users' }
            ];
            
            // Create async iterable mock
            const mockIterable = {
                [Symbol.asyncIterator]: async function* () {
                    for (const operation of mockOperations) {
                        yield operation;
                    }
                }
            };
            
            mockApiManagementClient.apiOperation.listByApi.mockReturnValue(mockIterable);

            const result = await apiOperationsService.getApiOperations('test-api');

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('GetUsers');
            expect(result[1].name).toBe('CreateUser');
            expect(mockApiManagementClient.apiOperation.listByApi).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'test-api'
            );
            expect(logger.info).toHaveBeenCalledWith('Getting API operations', { apiId: 'test-api' });
        });

        it('should handle errors when getting API operations', async () => {
            const error = new Error('Get API operations failed');
            mockApiManagementClient.apiOperation.listByApi.mockImplementation(() => {
                throw error;
            });

            await expect(apiOperationsService.getApiOperations('test-api'))
                .rejects.toThrow('Get API operations failed');
            expect(logger.error).toHaveBeenCalledWith('Failed to get API operations', error);
        });

        it('should return empty array when no operations found', async () => {
            // Create empty async iterable mock
            const mockIterable = {
                [Symbol.asyncIterator]: async function* () {
                    // Empty iterator
                }
            };
            
            mockApiManagementClient.apiOperation.listByApi.mockReturnValue(mockIterable);

            const result = await apiOperationsService.getApiOperations('empty-api');

            expect(result).toEqual([]);
            expect(mockApiManagementClient.apiOperation.listByApi).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'empty-api'
            );
        });
    });
});