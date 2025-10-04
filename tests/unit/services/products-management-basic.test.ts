import { ProductsManagementService } from '../../../src/services/products-management.service';
import { AzureClient } from '../../../src/services/azure-client';
import { ILogger } from '../../../src/interfaces';
import { ValidationError, NotFoundError } from '../../../src/utils/errors';
import { ProductInfo } from '../../../src/types';

// Mock the dependencies
jest.mock('../../../src/services/azure-client');
jest.mock('../../../src/utils/validation', () => ({
    isValidApiId: jest.fn()
}));

const { isValidApiId } = require('../../../src/utils/validation');

describe('ProductsManagementService', () => {
    let productsService: ProductsManagementService;
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
            product: {
                listByService: jest.fn(),
                get: jest.fn(),
                createOrUpdate: jest.fn()
            },
            apiProduct: {
                listByApis: jest.fn()
            },
            productApi: {
                createOrUpdate: jest.fn()
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
        productsService = new ProductsManagementService(mockAzureClient, mockLogger);

        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('listProducts', () => {
        it('should list products successfully', async () => {
            const mockProducts = [
                {
                    id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/products/product1',
                    name: 'product1',
                    displayName: 'Product 1',
                    description: 'Test product 1',
                    subscriptionRequired: true,
                    approvalRequired: false,
                    state: 'published'
                },
                {
                    id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/products/product2',
                    name: 'product2',
                    displayName: 'Product 2',
                    description: 'Test product 2',
                    subscriptionRequired: false,
                    approvalRequired: true,
                    state: 'notPublished'
                }
            ];

            // Mock async iterator
            mockApiManagementClient.product.listByService.mockReturnValue(
                (async function* () {
                    for (const product of mockProducts) {
                        yield product;
                    }
                })()
            );

            const result = await productsService.listProducts();

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: mockProducts[0].id,
                name: 'product1',
                displayName: 'Product 1',
                description: 'Test product 1',
                subscriptionRequired: true,
                approvalRequired: false,
                state: 'published'
            });
            expect(result[1]).toEqual({
                id: mockProducts[1].id,
                name: 'product2',
                displayName: 'Product 2',
                description: 'Test product 2',
                subscriptionRequired: false,
                approvalRequired: true,
                state: 'notPublished'
            });

            expect(mockApiManagementClient.product.listByService).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                {}
            );
            expect(mockLogger.info).toHaveBeenCalledWith('Listing products', { filter: undefined, top: undefined, skip: undefined });
            expect(mockLogger.info).toHaveBeenCalledWith('Found 2 products');
        });

        it('should list products with filtering options', async () => {
            const mockProducts = [
                {
                    id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/products/product1',
                    name: 'product1',
                    displayName: 'Product 1',
                    description: 'Test product 1',
                    subscriptionRequired: true,
                    approvalRequired: false,
                    state: 'published'
                }
            ];

            mockApiManagementClient.product.listByService.mockReturnValue(
                (async function* () {
                    for (const product of mockProducts) {
                        yield product;
                    }
                })()
            );

            const filter = "startswith(name,'product')";
            const top = 10;
            const skip = 5;

            const result = await productsService.listProducts(filter, top, skip);

            expect(result).toHaveLength(1);
            expect(mockApiManagementClient.product.listByService).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                {
                    $filter: filter,
                    $top: top,
                    $skip: skip
                }
            );
            expect(mockLogger.info).toHaveBeenCalledWith('Listing products', { filter, top, skip });
        });

        it('should handle products with missing optional fields', async () => {
            const mockProducts = [
                {
                    id: '',
                    name: '',
                    displayName: '',
                    description: undefined,
                    subscriptionRequired: undefined,
                    approvalRequired: undefined,
                    state: undefined
                }
            ];

            mockApiManagementClient.product.listByService.mockReturnValue(
                (async function* () {
                    for (const product of mockProducts) {
                        yield product;
                    }
                })()
            );

            const result = await productsService.listProducts();

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: '',
                name: '',
                displayName: '',
                description: '',
                subscriptionRequired: false,
                approvalRequired: false,
                state: 'notPublished'
            });
        });

        it('should handle errors when listing products', async () => {
            const error = new Error('List products failed');
            mockApiManagementClient.product.listByService.mockImplementation(() => {
                throw error;
            });

            await expect(productsService.listProducts()).rejects.toThrow('List products failed');
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to list products', error);
        });
    });

    describe('getProduct', () => {
        it('should get product details successfully', async () => {
            const mockProduct = {
                id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/products/product1',
                name: 'product1',
                displayName: 'Product 1',
                description: 'Test product 1',
                subscriptionRequired: true,
                approvalRequired: false,
                state: 'published'
            };

            mockApiManagementClient.product.get.mockResolvedValue(mockProduct);

            const result = await productsService.getProduct('product1');

            expect(result).toEqual({
                id: mockProduct.id,
                name: 'product1',
                displayName: 'Product 1',
                description: 'Test product 1',
                subscriptionRequired: true,
                approvalRequired: false,
                state: 'published'
            });

            expect(mockApiManagementClient.product.get).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'product1'
            );
            expect(mockLogger.info).toHaveBeenCalledWith('Getting product details', { productId: 'product1' });
        });

        it('should handle product with missing optional fields', async () => {
            const mockProduct = {
                id: '',
                name: '',
                displayName: '',
                description: undefined,
                subscriptionRequired: undefined,
                approvalRequired: undefined,
                state: undefined
            };

            mockApiManagementClient.product.get.mockResolvedValue(mockProduct);

            const result = await productsService.getProduct('product1');

            expect(result).toEqual({
                id: '',
                name: '',
                displayName: '',
                description: '',
                subscriptionRequired: false,
                approvalRequired: false,
                state: 'notPublished'
            });
        });

        it('should throw NotFoundError when product does not exist', async () => {
            const error = { statusCode: 404, message: 'Product not found' };
            mockApiManagementClient.product.get.mockRejectedValue(error);

            await expect(productsService.getProduct('nonexistent-product')).rejects.toThrow(NotFoundError);
            await expect(productsService.getProduct('nonexistent-product')).rejects.toThrow("Product 'nonexistent-product' not found");

            expect(mockLogger.error).toHaveBeenCalledWith('Failed to get product', error);
        });

        it.skip('should handle other errors when getting product', async () => {
            const error = { statusCode: 500, message: 'Internal server error' };
            mockApiManagementClient.product.get.mockRejectedValue(error);
            mockAzureClient.handleAzureError.mockImplementation(() => {
                throw new Error('Azure error handled');
            });

            await expect(productsService.getProduct('product1')).rejects.toThrow('Azure error handled');
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to get product', error);
            expect(mockAzureClient.handleAzureError).toHaveBeenCalledWith(error);
        });
    });

    describe('createProduct', () => {
        const validProductParams = {
            productId: 'new-product',
            displayName: 'New Product',
            description: 'A new test product',
            subscriptionRequired: true,
            approvalRequired: false,
            state: 'published'
        };

        it('should create product successfully', async () => {
            const mockCreatedProduct = {
                id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/products/new-product',
                name: 'new-product',
                displayName: 'New Product',
                description: 'A new test product',
                subscriptionRequired: true,
                approvalRequired: false,
                state: 'published'
            };

            mockApiManagementClient.product.createOrUpdate.mockResolvedValue(mockCreatedProduct);

            const result = await productsService.createProduct(validProductParams);

            expect(result).toEqual({
                id: mockCreatedProduct.id,
                name: 'new-product',
                displayName: 'New Product',
                description: 'A new test product',
                subscriptionRequired: true,
                approvalRequired: false,
                state: 'published'
            });

            expect(mockApiManagementClient.product.createOrUpdate).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'new-product',
                {
                    displayName: 'New Product',
                    description: 'A new test product',
                    subscriptionRequired: true,
                    approvalRequired: false,
                    state: 'published'
                }
            );
            expect(mockLogger.info).toHaveBeenCalledWith('Creating product', { productId: 'new-product' });
        });

        it('should create product with minimal parameters', async () => {
            const minimalParams = {
                productId: 'minimal-product',
                displayName: 'Minimal Product'
            };

            const mockCreatedProduct = {
                id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/products/minimal-product',
                name: 'minimal-product',
                displayName: 'Minimal Product',
                description: '',
                subscriptionRequired: true,
                approvalRequired: false,
                state: 'published'
            };

            mockApiManagementClient.product.createOrUpdate.mockResolvedValue(mockCreatedProduct);

            const result = await productsService.createProduct(minimalParams);

            expect(result).toEqual({
                id: mockCreatedProduct.id,
                name: 'minimal-product',
                displayName: 'Minimal Product',
                description: '',
                subscriptionRequired: true,
                approvalRequired: false,
                state: 'published'
            });

            expect(mockApiManagementClient.product.createOrUpdate).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'minimal-product',
                {
                    displayName: 'Minimal Product',
                    description: undefined,
                    subscriptionRequired: true, // default when not explicitly false
                    approvalRequired: false, // default
                    state: 'published' // default
                }
            );
        });

        it('should handle subscriptionRequired false explicitly', async () => {
            const paramsWithSubFalse = {
                ...validProductParams,
                subscriptionRequired: false
            };

            const mockCreatedProduct = {
                id: '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim/products/new-product',
                name: 'new-product',
                displayName: 'New Product',
                description: 'A new test product',
                subscriptionRequired: false,
                approvalRequired: false,
                state: 'published'
            };

            mockApiManagementClient.product.createOrUpdate.mockResolvedValue(mockCreatedProduct);

            await productsService.createProduct(paramsWithSubFalse);

            expect(mockApiManagementClient.product.createOrUpdate).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'new-product',
                expect.objectContaining({
                    subscriptionRequired: false
                })
            );
        });

        it('should handle product with missing response fields', async () => {
            const mockCreatedProduct = {
                id: '',
                name: '',
                displayName: '',
                description: undefined,
                subscriptionRequired: undefined,
                approvalRequired: undefined,
                state: undefined
            };

            mockApiManagementClient.product.createOrUpdate.mockResolvedValue(mockCreatedProduct);

            const result = await productsService.createProduct(validProductParams);

            expect(result).toEqual({
                id: '',
                name: '',
                displayName: '',
                description: '',
                subscriptionRequired: false,
                approvalRequired: false,
                state: 'notPublished'
            });
        });

        it('should throw ValidationError when product already exists', async () => {
            const error = { statusCode: 409, message: 'Product already exists' };
            mockApiManagementClient.product.createOrUpdate.mockRejectedValue(error);

            await expect(productsService.createProduct(validProductParams)).rejects.toThrow(ValidationError);
            await expect(productsService.createProduct(validProductParams)).rejects.toThrow("Product with ID 'new-product' already exists");

            expect(mockLogger.error).toHaveBeenCalledWith('Failed to create product', error);
        });

        it.skip('should handle other errors when creating product', async () => {
            const error = { statusCode: 500, message: 'Internal server error' };
            mockApiManagementClient.product.createOrUpdate.mockRejectedValue(error);
            mockAzureClient.handleAzureError.mockImplementation(() => {
                throw new Error('Azure error handled');
            });

            await expect(productsService.createProduct(validProductParams)).rejects.toThrow('Azure error handled');
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to create product', error);
            expect(mockAzureClient.handleAzureError).toHaveBeenCalledWith(error);
        });
    });

    describe('getApiProducts', () => {
        beforeEach(() => {
            isValidApiId.mockReturnValue(true);
        });

        it('should get API products successfully', async () => {
            const mockProducts = [
                {
                    name: 'product1',
                    displayName: 'Product 1',
                    description: 'Test product 1',
                    state: 'published',
                    subscriptionRequired: true,
                    approvalRequired: false,
                    subscriptionsLimit: 10,
                    terms: 'Test terms'
                },
                {
                    name: 'product2',
                    displayName: 'Product 2',
                    description: 'Test product 2',
                    state: 'notPublished',
                    subscriptionRequired: false,
                    approvalRequired: true,
                    subscriptionsLimit: 5,
                    terms: 'Other terms'
                }
            ];

            mockApiManagementClient.apiProduct.listByApis.mockReturnValue(
                (async function* () {
                    for (const product of mockProducts) {
                        yield product;
                    }
                })()
            );

            const result = await productsService.getApiProducts('test-api');

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: 'product1',
                name: 'product1',
                displayName: 'Product 1',
                description: 'Test product 1',
                state: 'published',
                subscriptionRequired: true,
                approvalRequired: false,
                subscriptionsLimit: 10,
                terms: 'Test terms'
            });
            expect(result[1]).toEqual({
                id: 'product2',
                name: 'product2',
                displayName: 'Product 2',
                description: 'Test product 2',
                state: 'notPublished',
                subscriptionRequired: false,
                approvalRequired: true,
                subscriptionsLimit: 5,
                terms: 'Other terms'
            });

            expect(isValidApiId).toHaveBeenCalledWith('test-api');
            expect(mockApiManagementClient.apiProduct.listByApis).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'test-api'
            );
            expect(mockLogger.info).toHaveBeenCalledWith('Getting API products', { apiId: 'test-api' });
            expect(mockLogger.info).toHaveBeenCalledWith('Found 2 API products');
        });

        it('should handle products with missing optional fields', async () => {
            const mockProducts = [
                {
                    name: '',
                    displayName: '',
                    description: undefined,
                    state: undefined,
                    subscriptionRequired: undefined,
                    approvalRequired: undefined,
                    subscriptionsLimit: undefined,
                    terms: undefined
                }
            ];

            mockApiManagementClient.apiProduct.listByApis.mockReturnValue(
                (async function* () {
                    for (const product of mockProducts) {
                        yield product;
                    }
                })()
            );

            const result = await productsService.getApiProducts('test-api');

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: '',
                name: '',
                displayName: '',
                description: undefined,
                state: 'notPublished',
                subscriptionRequired: false,
                approvalRequired: false,
                subscriptionsLimit: undefined,
                terms: undefined
            });
        });

        it('should throw ValidationError for invalid API ID', async () => {
            isValidApiId.mockReturnValue(false);

            await expect(productsService.getApiProducts('invalid-api-id')).rejects.toThrow(ValidationError);
            await expect(productsService.getApiProducts('invalid-api-id')).rejects.toThrow('Invalid API ID format');

            expect(isValidApiId).toHaveBeenCalledWith('invalid-api-id');
            expect(mockApiManagementClient.apiProduct.listByApis).not.toHaveBeenCalled();
        });

        it('should handle errors when getting API products', async () => {
            const error = new Error('Get API products failed');
            mockApiManagementClient.apiProduct.listByApis.mockImplementation(() => {
                throw error;
            });

            await expect(productsService.getApiProducts('test-api')).rejects.toThrow('Get API products failed');
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to get API products', error);
        });
    });

    describe('addApiToProduct', () => {
        it('should add API to product successfully', async () => {
            mockApiManagementClient.productApi.createOrUpdate.mockResolvedValue(undefined);

            await productsService.addApiToProduct('product1', 'api1');

            expect(mockApiManagementClient.productApi.createOrUpdate).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'product1',
                'api1'
            );
            expect(mockLogger.info).toHaveBeenCalledWith('Adding API to product', { productId: 'product1', apiId: 'api1' });
            expect(mockLogger.info).toHaveBeenCalledWith('API added to product successfully');
        });

        it('should throw NotFoundError when product or API does not exist', async () => {
            const error = { statusCode: 404, message: 'Product or API not found' };
            mockApiManagementClient.productApi.createOrUpdate.mockRejectedValue(error);

            await expect(productsService.addApiToProduct('nonexistent-product', 'nonexistent-api')).rejects.toThrow(NotFoundError);
            await expect(productsService.addApiToProduct('nonexistent-product', 'nonexistent-api')).rejects.toThrow("Product 'nonexistent-product' or API 'nonexistent-api' not found");

            expect(mockLogger.error).toHaveBeenCalledWith('Failed to add API to product', error);
        });

        it.skip('should handle other errors when adding API to product', async () => {
            const error = { statusCode: 500, message: 'Internal server error' };
            mockApiManagementClient.productApi.createOrUpdate.mockRejectedValue(error);
            mockAzureClient.handleAzureError.mockImplementation(() => {
                throw new Error('Azure error handled');
            });

            await expect(productsService.addApiToProduct('product1', 'api1')).rejects.toThrow('Azure error handled');
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to add API to product', error);
            expect(mockAzureClient.handleAzureError).toHaveBeenCalledWith(error);
        });
    });
});