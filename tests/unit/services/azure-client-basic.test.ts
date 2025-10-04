import { AzureClient } from '../../../src/services/azure-client';
import { ApiManagementClient } from '@azure/arm-apimanagement';
import { ClientSecretCredential } from '@azure/identity';
import { AzureConfig } from '../../../src/types';
import { AzureApiError, AuthenticationError } from '../../../src/utils/errors';

// Mock the Azure dependencies
jest.mock('@azure/arm-apimanagement');
jest.mock('@azure/identity');
jest.mock('../../../src/utils/logger');

const MockedApiManagementClient = ApiManagementClient as jest.MockedClass<typeof ApiManagementClient>;
const MockedClientSecretCredential = ClientSecretCredential as jest.MockedClass<typeof ClientSecretCredential>;

describe('AzureClient', () => {
    let azureClient: AzureClient;
    let mockApiManagementClient: jest.Mocked<ApiManagementClient>;
    let mockCredential: jest.Mocked<ClientSecretCredential>;
    let validConfig: AzureConfig;

    beforeEach(() => {
        validConfig = {
            tenantId: 'test-tenant-id',
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
            subscriptionId: 'test-subscription-id',
            resourceGroupName: 'test-rg',
            serviceName: 'test-apim'
        };

        // Create credential mock
        mockCredential = {
            getToken: jest.fn()
        } as any;
        MockedClientSecretCredential.mockImplementation(() => mockCredential);

        // Create API Management client mock
        mockApiManagementClient = {
            apiManagementService: {
                get: jest.fn()
            }
        } as any;
        MockedApiManagementClient.mockImplementation(() => mockApiManagementClient);

        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize Azure client successfully', () => {
            azureClient = new AzureClient(validConfig);

            expect(MockedClientSecretCredential).toHaveBeenCalledWith(
                'test-tenant-id',
                'test-client-id',
                'test-client-secret'
            );
            expect(MockedApiManagementClient).toHaveBeenCalledWith(
                mockCredential,
                'test-subscription-id'
            );
        });

        it('should throw AuthenticationError when credential creation fails', () => {
            MockedClientSecretCredential.mockImplementation(() => {
                throw new Error('Invalid credentials');
            });

            expect(() => new AzureClient(validConfig)).toThrow(AuthenticationError);
            expect(() => new AzureClient(validConfig)).toThrow('Failed to initialize Azure client');
        });

        it('should throw AuthenticationError when API Management client creation fails', () => {
            MockedApiManagementClient.mockImplementation(() => {
                throw new Error('API Management client creation failed');
            });

            expect(() => new AzureClient(validConfig)).toThrow(AuthenticationError);
            expect(() => new AzureClient(validConfig)).toThrow('Failed to initialize Azure client');
        });
    });

    describe('getClient', () => {
        beforeEach(() => {
            azureClient = new AzureClient(validConfig);
        });

        it('should return the API Management client instance', () => {
            const client = azureClient.getClient();
            expect(client).toBe(mockApiManagementClient);
        });
    });

    describe('testConnection', () => {
        beforeEach(() => {
            azureClient = new AzureClient(validConfig);
        });

        it('should return true when connection test is successful', async () => {
            const mockServiceInfo = {
                name: 'test-apim',
                location: 'East US',
                sku: { name: 'Developer', capacity: 1 }
            };
            (mockApiManagementClient.apiManagementService.get as jest.Mock).mockResolvedValue(mockServiceInfo);

            const result = await azureClient.testConnection();

            expect(result).toBe(true);
            expect(mockApiManagementClient.apiManagementService.get).toHaveBeenCalledWith(
                'test-rg',
                'test-apim'
            );
        });

        it('should throw AzureApiError when connection test fails', async () => {
            const error = { statusCode: 401, message: 'Unauthorized' };
            (mockApiManagementClient.apiManagementService.get as jest.Mock).mockRejectedValue(error);

            await expect(azureClient.testConnection()).rejects.toThrow(AzureApiError);
            await expect(azureClient.testConnection()).rejects.toThrow('Failed to connect to Azure API Management');
        });

        it('should handle connection test error without statusCode', async () => {
            const error = { message: 'Network error' };
            (mockApiManagementClient.apiManagementService.get as jest.Mock).mockRejectedValue(error);

            await expect(azureClient.testConnection()).rejects.toThrow(AzureApiError);
            const thrownError = await azureClient.testConnection().catch(e => e);
            expect(thrownError.statusCode).toBe(500);
        });
    });

    describe('getServiceInfo', () => {
        beforeEach(() => {
            azureClient = new AzureClient(validConfig);
        });

        it('should return service information successfully', async () => {
            const mockServiceInfo = {
                name: 'test-apim',
                location: 'East US',
                sku: { name: 'Developer', capacity: 1 },
                publisherName: 'Test Publisher',
                publisherEmail: 'test@example.com',
                gatewayUrl: 'https://test-apim.azure-api.net',
                managementApiUrl: 'https://test-apim.management.azure-api.net',
                portalUrl: 'https://test-apim.portal.azure-api.net',
                scmUrl: 'https://test-apim.scm.azure-api.net'
            };
            (mockApiManagementClient.apiManagementService.get as jest.Mock).mockResolvedValue(mockServiceInfo);

            const result = await azureClient.getServiceInfo();

            expect(result).toEqual({
                name: 'test-apim',
                location: 'East US',
                sku: { name: 'Developer', capacity: 1 },
                publisherName: 'Test Publisher',
                publisherEmail: 'test@example.com',
                gatewayUrl: 'https://test-apim.azure-api.net',
                managementApiUrl: 'https://test-apim.management.azure-api.net',
                portalUrl: 'https://test-apim.portal.azure-api.net',
                scmUrl: 'https://test-apim.scm.azure-api.net'
            });
            expect(mockApiManagementClient.apiManagementService.get).toHaveBeenCalledWith(
                'test-rg',
                'test-apim'
            );
        });

        it('should throw AzureApiError when getting service info fails', async () => {
            const error = { statusCode: 404, message: 'Service not found' };
            (mockApiManagementClient.apiManagementService.get as jest.Mock).mockRejectedValue(error);

            await expect(azureClient.getServiceInfo()).rejects.toThrow(AzureApiError);
            await expect(azureClient.getServiceInfo()).rejects.toThrow('Failed to retrieve Azure API Management service information');
        });

        it('should handle error without statusCode in getServiceInfo', async () => {
            const error = { message: 'Unknown error' };
            (mockApiManagementClient.apiManagementService.get as jest.Mock).mockRejectedValue(error);

            await expect(azureClient.getServiceInfo()).rejects.toThrow(AzureApiError);
            const thrownError = await azureClient.getServiceInfo().catch(e => e);
            expect(thrownError.statusCode).toBe(500);
        });
    });

    describe('handleAzureError', () => {
        beforeEach(() => {
            azureClient = new AzureClient(validConfig);
        });

        it('should throw AuthenticationError for 401 status code', () => {
            const error = { statusCode: 401, message: 'Unauthorized' };

            expect(() => azureClient.handleAzureError(error)).toThrow(AuthenticationError);
            expect(() => azureClient.handleAzureError(error)).toThrow('Unauthorized');
        });

        it('should throw AzureApiError for 403 status code', () => {
            const error = { statusCode: 403, message: 'Forbidden' };

            expect(() => azureClient.handleAzureError(error)).toThrow(AzureApiError);
            expect(() => azureClient.handleAzureError(error)).toThrow('Access forbidden');
        });

        it('should throw AzureApiError for 404 status code', () => {
            const error = { statusCode: 404, message: 'Not found' };

            expect(() => azureClient.handleAzureError(error)).toThrow(AzureApiError);
            expect(() => azureClient.handleAzureError(error)).toThrow('Resource not found');
        });

        it('should throw AzureApiError for 429 status code', () => {
            const error = { statusCode: 429, message: 'Too many requests' };

            expect(() => azureClient.handleAzureError(error)).toThrow(AzureApiError);
            expect(() => azureClient.handleAzureError(error)).toThrow('Rate limit exceeded');
        });

        it('should throw AzureApiError for 500 status code', () => {
            const error = { statusCode: 500, message: 'Internal server error' };

            expect(() => azureClient.handleAzureError(error)).toThrow(AzureApiError);
            expect(() => azureClient.handleAzureError(error)).toThrow('Internal server error');
        });

        it('should throw AzureApiError for unknown status codes', () => {
            const error = { statusCode: 418, message: "I'm a teapot" };

            expect(() => azureClient.handleAzureError(error)).toThrow(AzureApiError);
            expect(() => azureClient.handleAzureError(error)).toThrow("I'm a teapot");
        });

        it('should handle error with status instead of statusCode', () => {
            const error = { status: 400, message: 'Bad request' };

            expect(() => azureClient.handleAzureError(error)).toThrow(AzureApiError);
            expect(() => azureClient.handleAzureError(error)).toThrow('Bad request');
        });

        it('should handle error with body.message', () => {
            const error = { statusCode: 400, body: { message: 'Body error message' } };

            expect(() => azureClient.handleAzureError(error)).toThrow(AzureApiError);
            expect(() => azureClient.handleAzureError(error)).toThrow('Body error message');
        });

        it('should use default message when no message is provided', () => {
            const error = { statusCode: 400 };

            expect(() => azureClient.handleAzureError(error)).toThrow(AzureApiError);
            expect(() => azureClient.handleAzureError(error)).toThrow('Azure API request failed');
        });

        it('should default to 500 status code when none provided', () => {
            const error = { message: 'Some error' };

            expect(() => azureClient.handleAzureError(error)).toThrow(AzureApiError);
            const thrownError = (() => {
                try {
                    azureClient.handleAzureError(error);
                } catch (e) {
                    return e;
                }
            })() as AzureApiError;
            expect(thrownError.statusCode).toBe(500);
        });
    });

    describe('executeWithRetry', () => {
        beforeEach(() => {
            azureClient = new AzureClient(validConfig);
        });

        it('should execute operation successfully on first attempt', async () => {
            const mockOperation = jest.fn().mockResolvedValue('success');

            const result = await azureClient.executeWithRetry(mockOperation);

            expect(result).toBe('success');
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });

        it('should retry on server errors and eventually succeed', async () => {
            const mockOperation = jest.fn()
                .mockRejectedValueOnce({ statusCode: 500, message: 'Server error' })
                .mockRejectedValueOnce({ statusCode: 502, message: 'Bad gateway' })
                .mockResolvedValue('success');

            // Mock the delay method to avoid actual delays
            const delaySpy = jest.spyOn(azureClient as any, 'delay').mockResolvedValue(undefined);

            const result = await azureClient.executeWithRetry(mockOperation);

            expect(result).toBe('success');
            expect(mockOperation).toHaveBeenCalledTimes(3);
            expect(delaySpy).toHaveBeenCalledTimes(2);
            
            delaySpy.mockRestore();
        });

        it('should fail after max retries reached', async () => {
            const error = { statusCode: 500, message: 'Server error' };
            const mockOperation = jest.fn().mockRejectedValue(error);

            // Mock the delay method to avoid actual delays
            const delaySpy = jest.spyOn(azureClient as any, 'delay').mockResolvedValue(undefined);

            await expect(azureClient.executeWithRetry(mockOperation, 2)).rejects.toEqual(error);
            expect(mockOperation).toHaveBeenCalledTimes(2);
            expect(delaySpy).toHaveBeenCalledTimes(1);
            
            delaySpy.mockRestore();
        });

        it('should use custom retry parameters', async () => {
            const error = { statusCode: 500, message: 'Server error' };
            const mockOperation = jest.fn().mockRejectedValue(error);

            // Mock the delay method to avoid actual delays
            const delaySpy = jest.spyOn(azureClient as any, 'delay').mockResolvedValue(undefined);

            await expect(azureClient.executeWithRetry(mockOperation, 4, 500)).rejects.toEqual(error);
            expect(mockOperation).toHaveBeenCalledTimes(4);
            expect(delaySpy).toHaveBeenCalledTimes(3);
            
            delaySpy.mockRestore();
        });

        it('should implement exponential backoff delay', async () => {
            const error = { statusCode: 500, message: 'Server error' };
            const mockOperation = jest.fn().mockRejectedValue(error);

            // Mock the delay method to capture delay values
            const delaySpy = jest.spyOn(azureClient as any, 'delay').mockResolvedValue(undefined);

            await expect(azureClient.executeWithRetry(mockOperation, 3, 100)).rejects.toEqual(error);
            expect(mockOperation).toHaveBeenCalledTimes(3);

            // Verify exponential backoff delays were used
            expect(delaySpy).toHaveBeenCalledWith(100); // 100 * 2^0
            expect(delaySpy).toHaveBeenCalledWith(200); // 100 * 2^1
            
            delaySpy.mockRestore();
        });

        it('should not retry on client errors (4xx)', async () => {
            const error = { statusCode: 400, message: 'Bad request' };
            const mockOperation = jest.fn().mockRejectedValue(error);

            await expect(azureClient.executeWithRetry(mockOperation)).rejects.toEqual(error);
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });

        it('should retry on server errors without statusCode', async () => {
            const error = new Error('Network error');
            const mockOperation = jest.fn()
                .mockRejectedValueOnce(error)
                .mockResolvedValue('success');

            // Mock the delay method to avoid actual delays
            const delaySpy = jest.spyOn(azureClient as any, 'delay').mockResolvedValue(undefined);

            const result = await azureClient.executeWithRetry(mockOperation, 2);

            expect(result).toBe('success');
            expect(mockOperation).toHaveBeenCalledTimes(2);
            expect(delaySpy).toHaveBeenCalledTimes(1);
            
            delaySpy.mockRestore();
        });
    });
});