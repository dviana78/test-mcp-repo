/**
 * Interface for Azure API Management Service
 * Defines the contract for comprehensive APIM operations
 */
export interface IApimService {
  // ========== API Management Operations ==========
  
  /**
   * List all APIs in the Azure APIM instance
   * @param options - Optional filtering and pagination options
   * @returns Promise resolving to list of APIs
   */
  listApis(options?: {
    filter?: string;
    top?: number;
    skip?: number;
  }): Promise<any[]>;

  /**
   * Get details of a specific API by ID
   * @param apiId - The ID of the API to retrieve
   * @returns Promise resolving to API details
   */
  getApi(apiId: string): Promise<any>;

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
  }): Promise<any>;

  /**
   * Create a new gRPC API from Protobuf definition
   * @param params - gRPC API creation parameters
   * @returns Promise resolving to created gRPC API details
   */
  createGrpcApiFromProto(params: {
    apiId: string;
    displayName: string;
    protoDefinition: string;
    description?: string;
    path?: string;
    serviceUrl?: string;
    protocols?: string[];
    subscriptionRequired?: boolean;
    initialVersion?: string;
    versioningScheme?: 'Segment' | 'Query' | 'Header';
    versionQueryName?: string;
    versionHeaderName?: string;
  }): Promise<any>;

  // ========== API Versioning Operations ==========

  /**
   * Create a new version of an existing API
   * @param params - API version creation parameters
   * @returns Promise resolving to created API version details
   */
  createApiVersion(params: {
    apiId: string;
    versionId: string;
    displayName: string;
    description?: string;
    sourceApiId?: string;
    versioningScheme?: 'Segment' | 'Query' | 'Header';
    versionQueryName?: string;
    versionHeaderName?: string;
  }): Promise<any>;

  /**
   * List all versions of a specific API
   * @param apiId - The ID of the API to list versions for
   * @returns Promise resolving to list of API versions
   */
  listApiVersions(apiId: string): Promise<any[]>;

  /**
   * Create a new revision of an existing API
   * @param params - API revision creation parameters
   * @returns Promise resolving to created API revision details
   */
  createApiRevision(params: {
    apiId: string;
    apiRevision?: string;
    description?: string;
    sourceApiRevision?: string;
  }): Promise<any>;

  /**
   * List all revisions of a specific API
   * @param apiId - The ID of the API to list revisions for
   * @returns Promise resolving to list of API revisions
   */
  listApiRevisions(apiId: string): Promise<any[]>;

  // ========== API Operations Management ==========

  /**
   * Get all operations for a specific API
   * @param apiId - The ID of the API to get operations for
   * @returns Promise resolving to list of API operations
   */
  getApiOperations(apiId: string): Promise<any[]>;

  // ========== Product Management ==========

  /**
   * Get all products that include a specific API
   * @param apiId - The ID of the API to get products for
   * @returns Promise resolving to list of products
   */
  getApiProducts(apiId: string): Promise<any[]>;

  // ========== Backend Services ==========

  /**
   * List all backend services in the APIM instance
   * @param options - Optional filtering and pagination options
   * @returns Promise resolving to list of backend services
   */
  listBackends(options?: {
    filter?: string;
    top?: number;
    skip?: number;
  }): Promise<any[]>;

  // ========== Error Handling ==========

  /**
   * Handle and format API errors consistently
   * @param error - The error to handle
   * @param operation - The operation that failed
   * @returns Formatted error response
   */
  handleError(error: any, operation: string): any;

  // ========== Validation ==========

  /**
   * Validate API creation parameters
   * @param params - Parameters to validate
   * @returns Validation result
   */
  validateApiParams(params: any): { isValid: boolean; errors: string[] };

  /**
   * Validate YAML/OpenAPI specification
   * @param yamlContent - YAML content to validate
   * @returns Validation result
   */
  validateYamlContract(yamlContent: string): { isValid: boolean; errors: string[] };

  /**
   * Validate Protobuf definition
   * @param protoContent - Protobuf content to validate
   * @returns Validation result
   */
  validateProtoDefinition(protoContent: string): { isValid: boolean; errors: string[] };
}

/**
 * Configuration interface for APIM service initialization
 */
export interface IApimServiceConfig {
  /**
   * Azure subscription ID
   */
  subscriptionId: string;

  /**
   * Azure resource group name
   */
  resourceGroupName: string;

  /**
   * APIM service name
   */
  serviceName: string;

  /**
   * Azure credentials configuration
   */
  credentials?: {
    clientId?: string;
    clientSecret?: string;
    tenantId?: string;
  };

  /**
   * Default API settings
   */
  defaults?: {
    protocols?: string[];
    subscriptionRequired?: boolean;
    versioningScheme?: 'Segment' | 'Query' | 'Header';
  };
}

/**
 * Factory interface for creating APIM service instances
 */
export interface IApimServiceFactory {
  /**
   * Create a new APIM service instance
   * @param config - Service configuration
   * @param logger - Logger instance for the service
   * @returns A new APIM service instance
   */
  createApimService(config: IApimServiceConfig, logger?: any): IApimService;
}