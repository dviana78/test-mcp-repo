import { SubscriptionsManagementService } from '../../../src/services/subscriptions-management.service';
import { AzureClient } from '../../../src/services/azure-client';
import { ILogger } from '../../../src/interfaces';
import { ValidationError, NotFoundError } from '../../../src/utils/errors';

// Mock the dependencies
jest.mock('../../../src/services/azure-client');

describe('SubscriptionsManagementService', () => {
    let subscriptionsService: SubscriptionsManagementService;
    let mockAzureClient: jest.Mocked<AzureClient>;
    let mockLogger: jest.Mocked<ILogger>;
    let mockApiManagementClient: any;

    beforeEach(() => {
        // Reset environment variables
        process.env.AZURE_APIM_RESOURCE_GROUP = 'test-rg';
        process.env.AZURE_APIM_SERVICE_NAME = 'test-apim';

        // Create logger mock
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn()
        };

        // Create Azure API Management client mock
        mockApiManagementClient = {
            subscription: {
                list: jest.fn(),
                createOrUpdate: jest.fn(),
                get: jest.fn()
            }
        };

        // Create Azure client mock
        mockAzureClient = {
            getClient: jest.fn().mockReturnValue(mockApiManagementClient),
            handleAzureError: jest.fn().mockImplementation((error) => {
                throw error;
            })
        } as any;

        // Create service instance
        subscriptionsService = new SubscriptionsManagementService(mockAzureClient, mockLogger);

        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('listSubscriptions', () => {
        it('should list subscriptions successfully', async () => {
            const mockSubscriptions = [
                {
                    id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/subscriptions/sub1',
                    name: 'sub1',
                    displayName: 'Subscription 1',
                    scope: '/products/product1',
                    state: 'active',
                    primaryKey: 'primary-key-1',
                    secondaryKey: 'secondary-key-1',
                    createdDate: '2023-01-01T00:00:00Z',
                    startDate: '2023-01-01T00:00:00Z',
                    expirationDate: '2024-01-01T00:00:00Z'
                },
                {
                    id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/subscriptions/sub2',
                    name: 'sub2',
                    displayName: 'Subscription 2',
                    scope: '/products/product2',
                    state: 'suspended',
                    primaryKey: 'primary-key-2',
                    secondaryKey: 'secondary-key-2',
                    createdDate: '2023-02-01T00:00:00Z',
                    startDate: '2023-02-01T00:00:00Z',
                    expirationDate: '2024-02-01T00:00:00Z'
                }
            ];

            // Mock async iterator
            mockApiManagementClient.subscription.list.mockReturnValue(
                (async function* () {
                    for (const subscription of mockSubscriptions) {
                        yield subscription;
                    }
                })()
            );

            const result = await subscriptionsService.listSubscriptions();

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: mockSubscriptions[0].id,
                name: 'sub1',
                displayName: 'Subscription 1',
                productId: 'product1',
                state: 'active',
                primaryKey: 'primary-key-1',
                secondaryKey: 'secondary-key-1',
                createdDate: '2023-01-01T00:00:00Z',
                startDate: '2023-01-01T00:00:00Z',
                expirationDate: '2024-01-01T00:00:00Z'
            });
            expect(result[1]).toEqual({
                id: mockSubscriptions[1].id,
                name: 'sub2',
                displayName: 'Subscription 2',
                productId: 'product2',
                state: 'suspended',
                primaryKey: 'primary-key-2',
                secondaryKey: 'secondary-key-2',
                createdDate: '2023-02-01T00:00:00Z',
                startDate: '2023-02-01T00:00:00Z',
                expirationDate: '2024-02-01T00:00:00Z'
            });

            expect(mockApiManagementClient.subscription.list).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                {}
            );
            expect(mockLogger.info).toHaveBeenCalledWith('Listing subscriptions', { filter: undefined, top: undefined, skip: undefined });
            expect(mockLogger.info).toHaveBeenCalledWith('Found 2 subscriptions');
        });

        it('should list subscriptions with filtering options', async () => {
            const mockSubscriptions = [
                {
                    id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/subscriptions/sub1',
                    name: 'sub1',
                    displayName: 'Subscription 1',
                    scope: '/products/product1',
                    state: 'active',
                    primaryKey: 'primary-key-1',
                    secondaryKey: 'secondary-key-1',
                    createdDate: '2023-01-01T00:00:00Z',
                    startDate: '2023-01-01T00:00:00Z',
                    expirationDate: '2024-01-01T00:00:00Z'
                }
            ];

            mockApiManagementClient.subscription.list.mockReturnValue(
                (async function* () {
                    for (const subscription of mockSubscriptions) {
                        yield subscription;
                    }
                })()
            );

            const filter = "state eq 'active'";
            const top = 10;
            const skip = 5;

            const result = await subscriptionsService.listSubscriptions(filter, top, skip);

            expect(result).toHaveLength(1);
            expect(mockApiManagementClient.subscription.list).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                {
                    $filter: filter,
                    $top: top,
                    $skip: skip
                }
            );
            expect(mockLogger.info).toHaveBeenCalledWith('Listing subscriptions', { filter, top, skip });
        });

        it('should handle subscriptions with missing optional fields', async () => {
            const mockSubscriptions = [
                {
                    id: '',
                    name: '',
                    displayName: '',
                    scope: undefined,
                    state: undefined,
                    primaryKey: '',
                    secondaryKey: '',
                    createdDate: undefined,
                    startDate: undefined,
                    expirationDate: undefined
                }
            ];

            mockApiManagementClient.subscription.list.mockReturnValue(
                (async function* () {
                    for (const subscription of mockSubscriptions) {
                        yield subscription;
                    }
                })()
            );

            const result = await subscriptionsService.listSubscriptions();

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: '',
                name: '',
                displayName: '',
                productId: '',
                state: 'submitted',
                primaryKey: '',
                secondaryKey: '',
                createdDate: undefined,
                startDate: undefined,
                expirationDate: undefined
            });
        });

        it('should handle subscriptions with complex scope paths', async () => {
            const mockSubscriptions = [
                {
                    id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/subscriptions/sub1',
                    name: 'sub1',
                    displayName: 'Subscription 1',
                    scope: '/products/complex-product-name-with-dashes',
                    state: 'active',
                    primaryKey: 'primary-key-1',
                    secondaryKey: 'secondary-key-1',
                    createdDate: '2023-01-01T00:00:00Z',
                    startDate: '2023-01-01T00:00:00Z',
                    expirationDate: '2024-01-01T00:00:00Z'
                }
            ];

            mockApiManagementClient.subscription.list.mockReturnValue(
                (async function* () {
                    for (const subscription of mockSubscriptions) {
                        yield subscription;
                    }
                })()
            );

            const result = await subscriptionsService.listSubscriptions();

            expect(result[0].productId).toBe('complex-product-name-with-dashes');
        });

        it('should handle errors when listing subscriptions', async () => {
            const error = new Error('List subscriptions failed');
            mockApiManagementClient.subscription.list.mockImplementation(() => {
                throw error;
            });

            await expect(subscriptionsService.listSubscriptions()).rejects.toThrow('List subscriptions failed');
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to list subscriptions', error);
        });
    });

    describe('createSubscription', () => {
        const validSubscriptionParams = {
            subscriptionId: 'new-subscription',
            displayName: 'New Subscription',
            productId: 'product1',
            userId: 'user1',
            primaryKey: 'custom-primary-key',
            secondaryKey: 'custom-secondary-key',
            state: 'active'
        };

        it('should create subscription successfully', async () => {
            const mockCreatedSubscription = {
                id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/subscriptions/new-subscription',
                name: 'new-subscription',
                displayName: 'New Subscription',
                state: 'active',
                primaryKey: 'custom-primary-key',
                secondaryKey: 'custom-secondary-key',
                createdDate: '2023-01-01T00:00:00Z',
                startDate: '2023-01-01T00:00:00Z',
                expirationDate: '2024-01-01T00:00:00Z'
            };

            mockApiManagementClient.subscription.createOrUpdate.mockResolvedValue(mockCreatedSubscription);

            const result = await subscriptionsService.createSubscription(validSubscriptionParams);

            expect(result).toEqual({
                id: mockCreatedSubscription.id,
                name: 'new-subscription',
                displayName: 'New Subscription',
                productId: 'product1',
                state: 'active',
                primaryKey: 'custom-primary-key',
                secondaryKey: 'custom-secondary-key',
                createdDate: '2023-01-01T00:00:00Z',
                startDate: '2023-01-01T00:00:00Z',
                expirationDate: '2024-01-01T00:00:00Z'
            });

            expect(mockApiManagementClient.subscription.createOrUpdate).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'new-subscription',
                {
                    displayName: 'New Subscription',
                    scope: '/products/product1',
                    ownerId: '/users/user1',
                    primaryKey: 'custom-primary-key',
                    secondaryKey: 'custom-secondary-key',
                    state: 'active'
                }
            );
            expect(mockLogger.info).toHaveBeenCalledWith('Creating subscription', { 
                subscriptionId: 'new-subscription',
                productId: 'product1'
            });
        });

        it('should create subscription with minimal parameters', async () => {
            const minimalParams = {
                subscriptionId: 'minimal-subscription',
                displayName: 'Minimal Subscription',
                productId: 'product1'
            };

            const mockCreatedSubscription = {
                id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/subscriptions/minimal-subscription',
                name: 'minimal-subscription',
                displayName: 'Minimal Subscription',
                state: 'submitted',
                primaryKey: 'auto-generated-primary',
                secondaryKey: 'auto-generated-secondary',
                createdDate: '2023-01-01T00:00:00Z',
                startDate: '2023-01-01T00:00:00Z',
                expirationDate: '2024-01-01T00:00:00Z'
            };

            mockApiManagementClient.subscription.createOrUpdate.mockResolvedValue(mockCreatedSubscription);

            const result = await subscriptionsService.createSubscription(minimalParams);

            expect(result).toEqual({
                id: mockCreatedSubscription.id,
                name: 'minimal-subscription',
                displayName: 'Minimal Subscription',
                productId: 'product1',
                state: 'submitted',
                primaryKey: 'auto-generated-primary',
                secondaryKey: 'auto-generated-secondary',
                createdDate: '2023-01-01T00:00:00Z',
                startDate: '2023-01-01T00:00:00Z',
                expirationDate: '2024-01-01T00:00:00Z'
            });

            expect(mockApiManagementClient.subscription.createOrUpdate).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'minimal-subscription',
                {
                    displayName: 'Minimal Subscription',
                    scope: '/products/product1',
                    ownerId: '/users/1', // Default admin user
                    primaryKey: undefined,
                    secondaryKey: undefined,
                    state: 'active' // Default
                }
            );
        });

        it('should handle subscription with missing response fields', async () => {
            const mockCreatedSubscription = {
                id: '',
                name: '',
                displayName: '',
                state: undefined,
                primaryKey: '',
                secondaryKey: '',
                createdDate: undefined,
                startDate: undefined,
                expirationDate: undefined
            };

            mockApiManagementClient.subscription.createOrUpdate.mockResolvedValue(mockCreatedSubscription);

            const result = await subscriptionsService.createSubscription(validSubscriptionParams);

            expect(result).toEqual({
                id: '',
                name: '',
                displayName: '',
                productId: 'product1',
                state: 'submitted',
                primaryKey: '',
                secondaryKey: '',
                createdDate: undefined,
                startDate: undefined,
                expirationDate: undefined
            });
        });

        it('should throw NotFoundError when product does not exist', async () => {
            const error = { statusCode: 404, message: 'Product not found' };
            mockApiManagementClient.subscription.createOrUpdate.mockRejectedValue(error);

            await expect(subscriptionsService.createSubscription(validSubscriptionParams)).rejects.toThrow(NotFoundError);
            await expect(subscriptionsService.createSubscription(validSubscriptionParams)).rejects.toThrow("Product 'product1' not found");

            expect(mockLogger.error).toHaveBeenCalledWith('Failed to create subscription', { 
                subscriptionData: validSubscriptionParams, 
                error 
            });
        });

        it('should throw ValidationError when subscription already exists', async () => {
            const error = { statusCode: 409, message: 'Subscription already exists' };
            mockApiManagementClient.subscription.createOrUpdate.mockRejectedValue(error);

            await expect(subscriptionsService.createSubscription(validSubscriptionParams)).rejects.toThrow(ValidationError);
            await expect(subscriptionsService.createSubscription(validSubscriptionParams)).rejects.toThrow("Subscription with ID 'new-subscription' already exists");

            expect(mockLogger.error).toHaveBeenCalledWith('Failed to create subscription', { 
                subscriptionData: validSubscriptionParams, 
                error 
            });
        });

        it.skip('should handle other errors when creating subscription', async () => {
            const error = { statusCode: 500, message: 'Internal server error' };
            mockApiManagementClient.subscription.createOrUpdate.mockRejectedValue(error);

            await expect(subscriptionsService.createSubscription(validSubscriptionParams)).rejects.toThrow();
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to create subscription', { 
                subscriptionData: validSubscriptionParams, 
                error 
            });
        });
    });

    describe('getSubscription', () => {
        it('should get subscription details successfully', async () => {
            const mockSubscription = {
                id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/subscriptions/sub1',
                name: 'sub1',
                displayName: 'Subscription 1',
                scope: '/products/product1',
                state: 'active',
                primaryKey: 'primary-key-1',
                secondaryKey: 'secondary-key-1',
                createdDate: '2023-01-01T00:00:00Z',
                startDate: '2023-01-01T00:00:00Z',
                expirationDate: '2024-01-01T00:00:00Z'
            };

            mockApiManagementClient.subscription.get.mockResolvedValue(mockSubscription);

            const result = await subscriptionsService.getSubscription('sub1');

            expect(result).toEqual({
                id: mockSubscription.id,
                name: 'sub1',
                displayName: 'Subscription 1',
                productId: 'product1',
                state: 'active',
                primaryKey: 'primary-key-1',
                secondaryKey: 'secondary-key-1',
                createdDate: '2023-01-01T00:00:00Z',
                startDate: '2023-01-01T00:00:00Z',
                expirationDate: '2024-01-01T00:00:00Z'
            });

            expect(mockApiManagementClient.subscription.get).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'sub1'
            );
            expect(mockLogger.info).toHaveBeenCalledWith('Getting subscription details', { subscriptionId: 'sub1' });
        });

        it('should handle subscription with missing optional fields', async () => {
            const mockSubscription = {
                id: '',
                name: '',
                displayName: '',
                scope: undefined,
                state: undefined,
                primaryKey: '',
                secondaryKey: '',
                createdDate: undefined,
                startDate: undefined,
                expirationDate: undefined
            };

            mockApiManagementClient.subscription.get.mockResolvedValue(mockSubscription);

            const result = await subscriptionsService.getSubscription('sub1');

            expect(result).toEqual({
                id: '',
                name: '',
                displayName: '',
                productId: '',
                state: 'submitted',
                primaryKey: '',
                secondaryKey: '',
                createdDate: undefined,
                startDate: undefined,
                expirationDate: undefined
            });
        });

        it('should throw NotFoundError when subscription does not exist', async () => {
            const error = { statusCode: 404, message: 'Subscription not found' };
            mockApiManagementClient.subscription.get.mockRejectedValue(error);

            await expect(subscriptionsService.getSubscription('nonexistent-subscription')).rejects.toThrow(NotFoundError);
            await expect(subscriptionsService.getSubscription('nonexistent-subscription')).rejects.toThrow("Subscription 'nonexistent-subscription' not found");

            expect(mockLogger.error).toHaveBeenCalledWith('Failed to get subscription', { 
                subscriptionId: 'nonexistent-subscription', 
                error 
            });
        });

        it.skip('should handle other errors when getting subscription', async () => {
            const error = { statusCode: 500, message: 'Internal server error' };
            mockApiManagementClient.subscription.get.mockRejectedValue(error);

            await expect(subscriptionsService.getSubscription('sub1')).rejects.toThrow();
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to get subscription', { 
                subscriptionId: 'sub1', 
                error 
            });
        });
    });
});