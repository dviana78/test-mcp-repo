import { ApiInfo } from '../types';

/**
 * Interface for API Management Service
 * Handles core API operations: listing, getting details, and creating APIs from YAML
 */
export interface IApiManagementService {
  /**
   * List all APIs in the API Management instance
   * @param options - Optional filtering and pagination options
   * @returns Promise resolving to list of APIs
   */
  listApis(options?: {
    filter?: string;
    top?: number;
    skip?: number;
  }): Promise<ApiInfo[]>;

  /**
   * Get details of a specific API by ID
   * @param apiId - The ID of the API to retrieve
   * @returns Promise resolving to API details
   */
  getApi(apiId: string): Promise<ApiInfo>;

  /**
   * Create a new API from YAML/OpenAPI specification
   * @param params - API creation parameters
   * @returns Promise resolving to created API details
   */
  createApiFromYaml(params: {
    apiId: string;
    displayName: string;
    yamlContract: string;
    description?: string;
    path?: string;
    serviceUrl?: string;
    protocols?: string[];
    subscriptionRequired?: boolean;
    initialVersion?: string;
    versioningScheme?: 'Segment' | 'Query' | 'Header';
    versionQueryName?: string;
    versionHeaderName?: string;
  }): Promise<ApiInfo>;
}