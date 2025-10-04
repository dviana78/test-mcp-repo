import { validateAzureConfig, getAzureConfig } from '../../../src/config/azure';
import { AzureConfig } from '../../../src/types';

describe('Azure Configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('validateAzureConfig', () => {
        it('should validate correct configuration successfully', () => {
            const validConfig: AzureConfig = {
                tenantId: 'test-tenant-id',
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                subscriptionId: 'test-subscription-id',
                resourceGroupName: 'test-resource-group',
                serviceName: 'test-service-name'
            };

            expect(() => validateAzureConfig(validConfig)).not.toThrow();
        });

        it('should throw error for missing tenantId', () => {
            const invalidConfig = {
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                subscriptionId: 'test-subscription-id',
                resourceGroupName: 'test-resource-group',
                serviceName: 'test-service-name'
            } as AzureConfig;

            expect(() => validateAzureConfig(invalidConfig)).toThrow("Azure configuration field 'tenantId' is required and cannot be empty");
        });

        it('should throw error for missing clientId', () => {
            const invalidConfig = {
                tenantId: 'test-tenant-id',
                clientSecret: 'test-client-secret',
                subscriptionId: 'test-subscription-id',
                resourceGroupName: 'test-resource-group',
                serviceName: 'test-service-name'
            } as AzureConfig;

            expect(() => validateAzureConfig(invalidConfig)).toThrow("Azure configuration field 'clientId' is required and cannot be empty");
        });

        it('should throw error for missing clientSecret', () => {
            const invalidConfig = {
                tenantId: 'test-tenant-id',
                clientId: 'test-client-id',
                subscriptionId: 'test-subscription-id',
                resourceGroupName: 'test-resource-group',
                serviceName: 'test-service-name'
            } as AzureConfig;

            expect(() => validateAzureConfig(invalidConfig)).toThrow("Azure configuration field 'clientSecret' is required and cannot be empty");
        });

        it('should throw error for missing subscriptionId', () => {
            const invalidConfig = {
                tenantId: 'test-tenant-id',
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                resourceGroupName: 'test-resource-group',
                serviceName: 'test-service-name'
            } as AzureConfig;

            expect(() => validateAzureConfig(invalidConfig)).toThrow("Azure configuration field 'subscriptionId' is required and cannot be empty");
        });

        it('should throw error for missing resourceGroupName', () => {
            const invalidConfig = {
                tenantId: 'test-tenant-id',
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                subscriptionId: 'test-subscription-id',
                serviceName: 'test-service-name'
            } as AzureConfig;

            expect(() => validateAzureConfig(invalidConfig)).toThrow("Azure configuration field 'resourceGroupName' is required and cannot be empty");
        });

        it('should throw error for missing serviceName', () => {
            const invalidConfig = {
                tenantId: 'test-tenant-id',
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                subscriptionId: 'test-subscription-id',
                resourceGroupName: 'test-resource-group'
            } as AzureConfig;

            expect(() => validateAzureConfig(invalidConfig)).toThrow("Azure configuration field 'serviceName' is required and cannot be empty");
        });

        it('should throw error for empty string values', () => {
            const invalidConfig = {
                tenantId: '',
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                subscriptionId: 'test-subscription-id',
                resourceGroupName: 'test-resource-group',
                serviceName: 'test-service-name'
            } as AzureConfig;

            expect(() => validateAzureConfig(invalidConfig)).toThrow("Azure configuration field 'tenantId' is required and cannot be empty");
        });

        it('should throw error for whitespace-only values', () => {
            const invalidConfig = {
                tenantId: '   ',
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                subscriptionId: 'test-subscription-id',
                resourceGroupName: 'test-resource-group',
                serviceName: 'test-service-name'
            } as AzureConfig;

            expect(() => validateAzureConfig(invalidConfig)).toThrow("Azure configuration field 'tenantId' is required and cannot be empty");
        });
    });

    describe('getAzureConfig', () => {
        it('should extract configuration from environment variables', () => {
            process.env.AZURE_TENANT_ID = 'test-tenant';
            process.env.AZURE_CLIENT_ID = 'test-client';
            process.env.AZURE_CLIENT_SECRET = 'test-secret';
            process.env.AZURE_SUBSCRIPTION_ID = 'test-subscription';
            process.env.AZURE_APIM_RESOURCE_GROUP = 'test-resource-group';
            process.env.AZURE_APIM_SERVICE_NAME = 'test-service';

            const config = getAzureConfig();

            expect(config).toEqual({
                tenantId: 'test-tenant',
                clientId: 'test-client',
                clientSecret: 'test-secret',
                subscriptionId: 'test-subscription',
                resourceGroupName: 'test-resource-group',
                serviceName: 'test-service'
            });
        });

        it('should throw error for missing environment variables', () => {
            delete process.env.AZURE_TENANT_ID;
            delete process.env.AZURE_CLIENT_ID;
            delete process.env.AZURE_CLIENT_SECRET;
            delete process.env.AZURE_SUBSCRIPTION_ID;
            delete process.env.AZURE_APIM_RESOURCE_GROUP;
            delete process.env.AZURE_APIM_SERVICE_NAME;

            expect(() => getAzureConfig()).toThrow('Missing required environment variables');
        });

        it('should throw error for empty environment variables', () => {
            process.env.AZURE_TENANT_ID = '';
            process.env.AZURE_CLIENT_ID = 'test-client';
            process.env.AZURE_CLIENT_SECRET = 'test-secret';
            process.env.AZURE_SUBSCRIPTION_ID = 'test-subscription';
            process.env.AZURE_APIM_RESOURCE_GROUP = 'test-resource-group';
            process.env.AZURE_APIM_SERVICE_NAME = 'test-service';

            expect(() => getAzureConfig()).toThrow('Missing required environment variables: AZURE_TENANT_ID');
        });

        it('should handle missing specific variables', () => {
            process.env.AZURE_TENANT_ID = 'test-tenant';
            process.env.AZURE_CLIENT_ID = 'test-client';
            process.env.AZURE_CLIENT_SECRET = 'test-secret';
            process.env.AZURE_SUBSCRIPTION_ID = 'test-subscription';
            delete process.env.AZURE_APIM_RESOURCE_GROUP;
            delete process.env.AZURE_APIM_SERVICE_NAME;

            expect(() => getAzureConfig()).toThrow('Missing required environment variables: AZURE_APIM_RESOURCE_GROUP, AZURE_APIM_SERVICE_NAME');
        });

        it('should validate configuration after extraction from environment', () => {
            process.env.AZURE_CLIENT_ID = 'test-client-id';
            process.env.AZURE_CLIENT_SECRET = 'test-client-secret';
            process.env.AZURE_SUBSCRIPTION_ID = 'test-subscription-id';
            process.env.AZURE_APIM_RESOURCE_GROUP = 'test-resource-group';
            process.env.AZURE_APIM_SERVICE_NAME = 'test-service-name';

            expect(() => getAzureConfig()).toThrow('Missing required environment variables: AZURE_TENANT_ID');
        });
    });
});