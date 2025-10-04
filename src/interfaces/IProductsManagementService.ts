import { ProductInfo } from '../types';

/**
 * Interface for Products Management Service
 * Handles product operations: listing, getting details, creating products, and managing API-product associations
 */
export interface IProductsManagementService {
  /**
   * List all products in the API Management instance
   * @param filter - Optional OData filter expression
   * @param top - Maximum number of products to return
   * @param skip - Number of products to skip
   * @returns Promise resolving to list of products
   */
  listProducts(filter?: string, top?: number, skip?: number): Promise<ProductInfo[]>;

  /**
   * Get product details by ID
   * @param productId - The ID of the product to retrieve
   * @returns Promise resolving to product details
   */
  getProduct(productId: string): Promise<ProductInfo>;

  /**
   * Create a new product
   * @param params - Product creation parameters
   * @returns Promise resolving to created product details
   */
  createProduct(params: {
    productId: string;
    displayName: string;
    description?: string;
    subscriptionRequired?: boolean;
    approvalRequired?: boolean;
    state?: string;
  }): Promise<ProductInfo>;

  /**
   * Get all products that include a specific API
   * @param apiId - The ID of the API to get products for
   * @returns Promise resolving to list of products
   */
  getApiProducts(apiId: string): Promise<ProductInfo[]>;

  /**
   * Add API to product
   * @param productId - The ID of the product
   * @param apiId - The ID of the API to add to the product
   * @returns Promise that resolves when operation completes
   */
  addApiToProduct(productId: string, apiId: string): Promise<void>;
}