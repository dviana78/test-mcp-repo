import { AzureClient } from '../../../src/services/azure-client';
import { AzureConfig } from '../../../src/types';

// Mock the Azure Identity module
jest.mock('@azure/identity', () => ({
    ClientSecretCredential: jest.fn().mockImplementation(() => ({
        getToken: jest.fn().mockResolvedValue({ token: 'mock-token' })
    }))
}));

// Mock the Azure API Management module
jest.mock('@azure/arm-apimanagement', () => ({
    ApiManagementClient: jest.fn().mockImplementation(() => ({
        apiManagementService: {
            get: jest.fn(),
        },
        api: {
            listByService: jest.fn(),
            get: jest.fn(),
            createOrUpdate: jest.fn(),
        },
        product: {
            listByService: jest.fn(),
            get: jest.fn(),
            createOrUpdate: jest.fn(),
        },
        subscription: {
            list: jest.fn(),
            get: jest.fn(),
            createOrUpdate: jest.fn(),
        }
    }))
}));

describe('AzureClient', () => {
    let azureClient: AzureClient;
    let mockConfig: AzureConfig;

    beforeEach(() => {
        mockConfig = {
            subscriptionId: 'test-subscription-id',
            resourceGroupName: 'test-resource-group',
            serviceName: 'test-apim-service',
            tenantId: 'test-tenant-id',
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret'
        };

        azureClient = new AzureClient(mockConfig);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create an instance of AzureClient', () => {
        expect(azureClient).toBeInstanceOf(AzureClient);
    });

    it('should have getClient method', () => {
        expect(typeof azureClient.getClient).toBe('function');
        expect(azureClient.getClient()).toBeDefined();
    });

    describe('testConnection', () => {
        it('should test connection successfully', async () => {
            // Mock successful API call
            const mockClient = azureClient.getClient();
            mockClient.apiManagementService.get = jest.fn().mockResolvedValue({
                id: 'test-service',
                name: 'test-apim-service'
            });

            const result = await azureClient.testConnection();

            expect(result).toBe(true);
            expect(mockClient.apiManagementService.get).toHaveBeenCalledWith(
                'test-resource-group',
                'test-apim-service'
            );
        });

        it('should handle connection errors', async () => {
            // Mock failed API call
            const error = new Error('Connection failed');
            const mockClient = azureClient.getClient();
            mockClient.apiManagementService.get = jest.fn().mockRejectedValue(error);

            await expect(azureClient.testConnection()).rejects.toThrow();
        });

        it('should handle authentication errors', async () => {
            const authError = new Error('Authentication failed');
            authError.name = 'AuthenticationError';
            const mockClient = azureClient.getClient();
            mockClient.apiManagementService.get = jest.fn().mockRejectedValue(authError);

            await expect(azureClient.testConnection()).rejects.toThrow();
        });

        it('should handle authorization errors', async () => {
            const authzError = new Error('Authorization failed');
            authzError.name = 'AuthorizationError';
            const mockClient = azureClient.getClient();
            mockClient.apiManagementService.get = jest.fn().mockRejectedValue(authzError);

            await expect(azureClient.testConnection()).rejects.toThrow();
        });
    });

    describe('constructor validation', () => {
        it('should accept valid configuration', () => {
            const validConfig: AzureConfig = {
                subscriptionId: 'valid-sub-id',
                resourceGroupName: 'valid-rg',
                serviceName: 'valid-service',
                tenantId: 'valid-tenant',
                clientId: 'valid-client',
                clientSecret: 'valid-secret'
            };

            expect(() => new AzureClient(validConfig)).not.toThrow();
        });

        it('should initialize Azure API Management client', () => {
            const client = new AzureClient(mockConfig);
            expect(client).toBeInstanceOf(AzureClient);
            expect(client.getClient()).toBeDefined();
        });

        it('should handle invalid configuration gracefully', () => {
            const invalidConfig = {
                subscriptionId: '',
                resourceGroupName: '',
                serviceName: '',
                tenantId: '',
                clientId: '',
                clientSecret: ''
            } as AzureConfig;

            // Should still create the instance but might fail on first API call
            expect(() => new AzureClient(invalidConfig)).not.toThrow();
        });
    });
});