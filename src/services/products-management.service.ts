import { 
  ProductInfo
} from '../types/index.js';
import { AzureClient } from './azure-client.js';
import { ILogger, IProductsManagementService } from '../interfaces/index.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { isValidApiId } from '../utils/validation.js';

/**
 * Products Management Service
 * Handles product operations: listing, getting details, creating products, and managing API-product associations
 */
export class ProductsManagementService implements IProductsManagementService {
  private readonly azureClient: AzureClient;
  private readonly logger: ILogger;

  constructor(azureClient: AzureClient, logger: ILogger) {
    this.azureClient = azureClient;
    this.logger = logger;
  }

  /**
   * List all products in the API Management instance
   */
  public async listProducts(filter?: string, top?: number, skip?: number): Promise<ProductInfo[]> {
    try {
      this.logger.info('Listing products', { filter, top, skip });
      
      const client = this.azureClient.getClient();
      const options: any = {};
      
      if (filter) options.$filter = filter;
      if (top) options.$top = top;
      if (skip) options.$skip = skip;

      const result = client.product.listByService(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        options
      );

      const products: ProductInfo[] = [];
      for await (const product of result) {
        products.push({
          id: product.id ?? '',
          name: product.name ?? '',
          displayName: product.displayName ?? '',
          description: product.description ?? '',
          subscriptionRequired: product.subscriptionRequired || false,
          approvalRequired: product.approvalRequired || false,
          state: product.state ?? 'notPublished'
        });
      }

      this.logger.info(`Found ${products.length} products`);
      return products;
    } catch (error: any) {
      this.logger.error('Failed to list products', error);
      throw error;
    }
  }

  /**
   * Get product details by ID
   */
  public async getProduct(productId: string): Promise<ProductInfo> {
    try {
      this.logger.info('Getting product details', { productId });
      
      const client = this.azureClient.getClient();
      const result = await client.product.get(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        productId
      );

      return {
        id: result.id ?? '',
        name: result.name ?? '',
        displayName: result.displayName ?? '',
        description: result.description ?? '',
        subscriptionRequired: result.subscriptionRequired || false,
        approvalRequired: result.approvalRequired || false,
        state: result.state ?? 'notPublished'
      };
    } catch (error: any) {
      this.logger.error('Failed to get product', error);
      
      if (error.statusCode === 404) {
        throw new NotFoundError(`Product '${productId}' not found`);
      }
      
      throw error;
    }
  }

  /**
   * Create a new product
   */
  public async createProduct(params: {
    productId: string;
    displayName: string;
    description?: string;
    subscriptionRequired?: boolean;
    approvalRequired?: boolean;
    state?: string;
  }): Promise<ProductInfo> {
    try {
      this.logger.info('Creating product', { productId: params.productId });
      
      const client = this.azureClient.getClient();
      const result = await client.product.createOrUpdate(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        params.productId,
        {
          displayName: params.displayName,
          description: params.description,
          subscriptionRequired: params.subscriptionRequired !== false,
          approvalRequired: params.approvalRequired || false,
          state: (params.state as any) || 'published'
        }
      );

      return {
        id: result.id ?? '',
        name: result.name ?? '',
        displayName: result.displayName ?? '',
        description: result.description ?? '',
        subscriptionRequired: result.subscriptionRequired || false,
        approvalRequired: result.approvalRequired || false,
        state: result.state ?? 'notPublished'
      };
    } catch (error: any) {
      this.logger.error('Failed to create product', error);
      
      if (error.statusCode === 409) {
        throw new ValidationError(`Product with ID '${params.productId}' already exists`);
      }
      
      throw error;
    }
  }

  /**
   * Get all products that include a specific API
   */
  public async getApiProducts(apiId: string): Promise<ProductInfo[]> {
    try {
      if (!isValidApiId(apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Getting API products', { apiId });

      const client = this.azureClient.getClient();
      const result = client.apiProduct.listByApis(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        apiId
      );

      const products: ProductInfo[] = [];
      
      for await (const product of result) {
        products.push({
          id: product.name ?? '',
          name: product.name ?? '',
          displayName: product.displayName ?? '',
          description: product.description,
          state: product.state as any || 'notPublished',
          subscriptionRequired: product.subscriptionRequired || false,
          approvalRequired: product.approvalRequired || false,
          subscriptionsLimit: product.subscriptionsLimit,
          terms: product.terms
        });
      }

      this.logger.info(`Found ${products.length} API products`);
      return products;
    } catch (error: any) {
      this.logger.error('Failed to get API products', error);
      throw error;
    }
  }

  /**
   * Add API to product
   */
  public async addApiToProduct(productId: string, apiId: string): Promise<void> {
    try {
      this.logger.info('Adding API to product', { productId, apiId });
      
      const client = this.azureClient.getClient();
      await client.productApi.createOrUpdate(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        productId,
        apiId
      );

      this.logger.info('API added to product successfully');
    } catch (error: any) {
      this.logger.error('Failed to add API to product', error);
      
      if (error.statusCode === 404) {
        throw new NotFoundError(`Product '${productId}' or API '${apiId}' not found`);
      }
      
      throw error;
    }
  }
}







