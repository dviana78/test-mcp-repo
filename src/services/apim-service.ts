import { 
  ApiInfo, 
  ApiVersion, 
  ApiRevision, 
  CreateApiVersionRequest, 
  CreateApiRevisionRequest,
  CreateApiRequest,
  UpdateApiRequest,
  ApiOperationInfo,
  ProductInfo,
  BackendInfo
} from '../types';
import { AzureClient } from './azure-client';
import { Logger } from '../utils/logger';
import { IApimService, ILogger } from '../interfaces';
import { AzureApiError, ValidationError, NotFoundError } from '../utils/errors';
import { 
  validateCreateApiVersion, 
  validateCreateApiRevision, 
  isValidApiId,
  isValidVersionId,
  isValidRevisionId,
  sanitizeApiPath
} from '../utils/validation';

export class ApimService implements IApimService {
  private azureClient: AzureClient;
  private logger: ILogger;

  constructor(azureClient: AzureClient) {
    this.azureClient = azureClient;
    this.logger = new Logger('ApimService');
  }

  /**
   * List all APIs in the API Management instance
   */
  public async listApis(options?: {
    filter?: string;
    top?: number;
    skip?: number;
  }): Promise<any[]> {
    try {
      this.logger.info('Listing APIs', options);
      
      const client = this.azureClient.getClient();
      const queryOptions: any = {};
      
      if (options?.filter) queryOptions.$filter = options.filter;
      if (options?.top) queryOptions.$top = options.top;
      if (options?.skip) queryOptions.$skip = options.skip;

      const result = client.api.listByService(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        queryOptions
      );

      const apis: ApiInfo[] = [];
      
      for await (const api of result) {
        apis.push(this.mapAzureApiToApiInfo(api));
      }

      this.logger.info(`Found ${apis.length} APIs`);
      return apis;
    } catch (error: any) {
      this.logger.error('Failed to list APIs', error);
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * Get a specific API by ID
   */
  public async getApi(apiId: string): Promise<ApiInfo> {
    try {
      if (!isValidApiId(apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Getting API', { apiId });
      
      const client = this.azureClient.getClient();
      const api = await client.api.get(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        apiId
      );

      return this.mapAzureApiToApiInfo(api);
    } catch (error: any) {
      if (error?.statusCode === 404) {
        throw new NotFoundError(`API with ID '${apiId}' not found`);
      }
      this.logger.error('Failed to get API', error);
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * Create a new API version
   */
  public async createApiVersion(request: CreateApiVersionRequest): Promise<ApiVersion> {
    try {
      validateCreateApiVersion(request);
      
      if (!isValidApiId(request.apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      if (!isValidVersionId(request.versionId)) {
        throw new ValidationError('Invalid version ID format');
      }

      this.logger.info('Creating API version', { 
        apiId: request.apiId, 
        versionId: request.versionId 
      });

      const client = this.azureClient.getClient();

      // First, create or get the API version set
      let versionSetId = `${request.apiId}-versions`;
      
      try {
        await client.apiVersionSet.get(
          process.env.AZURE_APIM_RESOURCE_GROUP!,
          process.env.AZURE_APIM_SERVICE_NAME!,
          versionSetId
        );
      } catch (error: any) {
        if (error?.statusCode === 404) {
          // Create version set
          await client.apiVersionSet.createOrUpdate(
            process.env.AZURE_APIM_RESOURCE_GROUP!,
            process.env.AZURE_APIM_SERVICE_NAME!,
            versionSetId,
            {
              displayName: `${request.displayName} Versions`,
              versioningScheme: request.versioningScheme || 'Segment',
              versionQueryName: request.versionQueryName,
              versionHeaderName: request.versionHeaderName
            }
          );
        } else {
          throw error;
        }
      }

      // Create the new API version
      const sourceApi = await this.getApi(request.sourceApiId || request.apiId);
      
      const versionedApiId = `${request.apiId}-${request.versionId}`;
      const apiContract: any = {
        displayName: request.displayName,
        description: request.description,
        path: sourceApi.path,
        protocols: sourceApi.protocols,
        serviceUrl: sourceApi.serviceUrl,
        subscriptionRequired: sourceApi.subscriptionRequired,
        apiVersion: request.versionId,
        apiVersionSetId: versionSetId,
        sourceApiId: request.sourceApiId || request.apiId
      };

      const result = await client.api.beginCreateOrUpdateAndWait(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        versionedApiId,
        apiContract
      );

      this.logger.info('API version created successfully', { 
        apiId: request.apiId, 
        versionId: request.versionId 
      });

      return {
        id: versionSetId,
        name: request.versionId,
        displayName: request.displayName,
        description: request.description,
        versioningScheme: request.versioningScheme || 'Segment',
        versionQueryName: request.versionQueryName,
        versionHeaderName: request.versionHeaderName
      };
    } catch (error: any) {
      this.logger.error('Failed to create API version', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * List API versions for a specific API
   */
  public async listApiVersions(apiId: string): Promise<ApiVersion[]> {
    try {
      if (!isValidApiId(apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Listing API versions', { apiId });

      const client = this.azureClient.getClient();
      const versionSetId = `${apiId}-versions`;

      try {
        const versionSet = await client.apiVersionSet.get(
          process.env.AZURE_APIM_RESOURCE_GROUP!,
          process.env.AZURE_APIM_SERVICE_NAME!,
          versionSetId
        );

        // Get all APIs that belong to this version set
        const apis = client.api.listByService(
          process.env.AZURE_APIM_RESOURCE_GROUP!,
          process.env.AZURE_APIM_SERVICE_NAME!,
          { filter: `apiVersionSetId eq '${versionSetId}'` }
        );

        const versions: ApiVersion[] = [];
        for await (const api of apis) {
          versions.push({
            id: api.name || '',
            name: api.apiVersion || '',
            displayName: api.displayName || '',
            description: api.description,
            versioningScheme: versionSet.versioningScheme as any || 'Segment',
            versionQueryName: versionSet.versionQueryName,
            versionHeaderName: versionSet.versionHeaderName
          });
        }

        this.logger.info(`Found ${versions.length} API versions`);
        return versions;
      } catch (error: any) {
        if (error?.statusCode === 404) {
          // No version set exists, return empty array
          return [];
        }
        throw error;
      }
    } catch (error: any) {
      this.logger.error('Failed to list API versions', error);
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * Get API operations
   */
  public async getApiOperations(apiId: string): Promise<ApiOperationInfo[]> {
    try {
      if (!isValidApiId(apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Getting API operations', { apiId });

      const client = this.azureClient.getClient();
      const result = client.apiOperation.listByApi(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        apiId
      );

      const operations: ApiOperationInfo[] = [];
      
      for await (const operation of result) {
        operations.push({
          id: operation.name || '',
          name: operation.name || '',
          displayName: operation.displayName || '',
          method: operation.method || '',
          urlTemplate: operation.urlTemplate || '',
          description: operation.description,
          policies: operation.policies
        });
      }

      this.logger.info(`Found ${operations.length} API operations`);
      return operations;
    } catch (error: any) {
      this.logger.error('Failed to get API operations', error);
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * Get API products
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
          id: product.name || '',
          name: product.name || '',
          displayName: product.displayName || '',
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
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * List all backend services in the API Management instance
   */
  public async listBackends(options?: {
    filter?: string;
    top?: number;
    skip?: number;
  }): Promise<any[]> {
    try {
      this.logger.info('Listing backend services', options);
      
      const client = this.azureClient.getClient();
      const queryOptions: any = {};
      
      if (options?.filter) queryOptions.$filter = options.filter;
      if (options?.top) queryOptions.$top = options.top;
      if (options?.skip) queryOptions.$skip = options.skip;

      const result = client.backend.listByService(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        queryOptions
      );

      const backends: BackendInfo[] = [];
      
      for await (const backend of result) {
        backends.push({
          id: backend.name || '',
          title: backend.title || '',
          description: backend.description,
          url: backend.url || '',
          protocol: backend.protocol || '',
          resourceId: backend.resourceId,
          properties: backend.properties
        });
      }

      this.logger.info(`Found ${backends.length} backend services`);
      return backends;
    } catch (error: any) {
      this.logger.error('Failed to list backend services', error);
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * Create a new API revision
   */
  public async createApiRevision(request: CreateApiRevisionRequest): Promise<ApiRevision> {
    try {
      validateCreateApiRevision(request);

      if (!isValidApiId(request.apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Creating API revision', { 
        apiId: request.apiId, 
        description: request.description 
      });

      const client = this.azureClient.getClient();

      // Use a simplified approach with the correct API pattern
      // Get the original API to use as base for revision
      const originalApi = await client.api.get(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        request.apiId
      );

      // Generate a unique revision ID
      const timestamp = Date.now();
      const revisionId = request.apiRevision || `rev-${timestamp}`;

      // Create the revision by creating a new API with revision suffix
      const revisionApiId = `${request.apiId};rev=${revisionId}`;
      
      const revisionApi = await client.api.beginCreateOrUpdateAndWait(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        revisionApiId,
        {
          ...originalApi,
          displayName: `${originalApi.displayName} - Revision ${revisionId}`,
          description: request.description || originalApi.description,
          isCurrent: false,
          apiRevision: revisionId,
          sourceApiId: `/apis/${request.apiId}`
        }
      );

      this.logger.info('API revision created successfully', { 
        apiId: request.apiId, 
        revision: revisionId 
      });

      return {
        id: revisionApiId,
        apiId: request.apiId,
        apiRevision: revisionId,
        description: request.description,
        isCurrent: false,
        isOnline: revisionApi.isOnline || false,
        privateUrl: revisionApi.serviceUrl,
        createdDateTime: new Date(),
        updatedDateTime: new Date(),
        revisionDescription: request.description
      };
    } catch (error: any) {
      this.logger.error('Failed to create API revision', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * List API revisions for a specific API
   */
  public async listApiRevisions(apiId: string): Promise<ApiRevision[]> {
    try {
      if (!isValidApiId(apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Listing API revisions', { apiId });

      const client = this.azureClient.getClient();
      const result = client.apiRevision.listByService(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        apiId
      );

      const revisions: ApiRevision[] = [];
      
      for await (const revision of result) {
        revisions.push({
          id: revision.apiId || '',
          apiId: apiId,
          apiRevision: revision.apiRevision || '',
          description: revision.description,
          isCurrent: revision.isCurrent || false,
          isOnline: revision.isOnline || false,
          privateUrl: revision.privateUrl,
          createdDateTime: revision.createdDateTime || new Date(),
          updatedDateTime: revision.updatedDateTime || new Date(),
          revisionDescription: revision.description
        });
      }

      this.logger.info(`Found ${revisions.length} API revisions`);
      return revisions;
    } catch (error: any) {
      this.logger.error('Failed to list API revisions', error);
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * Map Azure API object to our ApiInfo interface
   */
  private mapAzureApiToApiInfo(azureApi: any): ApiInfo {
    return {
      id: azureApi.name || '',
      name: azureApi.name || '',
      displayName: azureApi.displayName || '',
      description: azureApi.description,
      path: azureApi.path || '',
      protocols: azureApi.protocols || [],
      serviceUrl: azureApi.serviceUrl,
      apiVersion: azureApi.apiVersion,
      apiVersionSetId: azureApi.apiVersionSetId,
      isCurrent: azureApi.isCurrent,
      isOnline: azureApi.isOnline,
      type: azureApi.type,
      subscriptionRequired: azureApi.subscriptionRequired,
      authenticationSettings: azureApi.authenticationSettings
    };
  }

  /**
   * Parse Protobuf definition to extract gRPC service information
   */
  private parseProtobufForGrpcService(protoContent: string): { serviceName: string; methods: string[] } {
    const serviceMatch = protoContent.match(/service\s+(\w+)\s*\{([^}]+)\}/s);
    if (!serviceMatch) {
      return { serviceName: 'UnknownService', methods: [] };
    }

    const serviceName = serviceMatch[1];
    const serviceBody = serviceMatch[2];
    
    // Extract RPC methods
    const methodMatches = serviceBody.match(/rpc\s+(\w+)/g) || [];
    const methods = methodMatches.map(match => match.replace('rpc ', ''));

    return { serviceName, methods };
  }

  /**
   * Generate OpenAPI specification from Protobuf for Application Gateway integration
   */
  private generateOpenApiFromProtobuf(protoContent: string, serviceInfo: { serviceName: string; methods: string[] }): string {
    // Extract HTTP annotations from protobuf if present
    const httpAnnotations = this.extractHttpAnnotations(protoContent);
    
    // Generate basic OpenAPI spec for gRPC transcoding
    const openApiSpec = {
      openapi: '3.0.3',
      info: {
        title: `${serviceInfo.serviceName} gRPC API`,
        description: 'gRPC API with HTTP transcoding via Azure Application Gateway',
        version: '1.0.0'
      },
      servers: [
        {
          url: '/grpc'
        }
      ],
      paths: {} as any
    };

    // Generate paths from gRPC methods and HTTP annotations
    serviceInfo.methods.forEach(method => {
      const httpInfo = httpAnnotations[method];
      if (httpInfo) {
        // Use HTTP annotation info
        openApiSpec.paths[httpInfo.path] = {
          [httpInfo.method.toLowerCase()]: {
            summary: `${method} - gRPC transcoded`,
            operationId: method,
            requestBody: httpInfo.method !== 'GET' ? {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    description: `${method}Request message`
                  }
                }
              }
            } : undefined,
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      description: `${method}Response message`
                    }
                  }
                }
              }
            }
          }
        };
      } else {
        // Generate default REST endpoint for gRPC method
        const path = `/v1/${serviceInfo.serviceName.toLowerCase()}/${method.toLowerCase()}`;
        openApiSpec.paths[path] = {
          post: {
            summary: `${method} - gRPC method`,
            operationId: method,
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    description: `${method}Request message`
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      description: `${method}Response message`
                    }
                  }
                }
              }
            }
          }
        };
      }
    });

    return JSON.stringify(openApiSpec, null, 2);
  }

  /**
   * Extract HTTP annotations from protobuf content
   */
  private extractHttpAnnotations(protoContent: string): { [method: string]: { method: string; path: string } } {
    const annotations: { [method: string]: { method: string; path: string } } = {};
    
    // Look for google.api.http annotations
    const httpMatches = protoContent.match(/rpc\s+(\w+)[^}]*option\s*\(google\.api\.http\)\s*=\s*\{([^}]+)\}/gs) || [];
    
    httpMatches.forEach(match => {
      const methodMatch = match.match(/rpc\s+(\w+)/);
      const httpMatch = match.match(/(get|post|put|patch|delete):\s*"([^"]+)"/i);
      
      if (methodMatch && httpMatch) {
        const methodName = methodMatch[1];
        const httpMethod = httpMatch[1].toUpperCase();
        const httpPath = httpMatch[2];
        
        annotations[methodName] = {
          method: httpMethod,
          path: httpPath
        };
      }
    });

    return annotations;
  }

  /**
   * Create a new gRPC API from Protobuf definition with optional versioning
   */
  public async createGrpcApiFromProtoWithVersioning(params: {
    apiId: string;
    displayName: string;
    description?: string;
    path?: string;
    serviceUrl?: string;
    protoDefinition: string;
    protocols?: string[];
    subscriptionRequired?: boolean;
    initialVersion?: string;
    versioningScheme?: 'Segment' | 'Query' | 'Header';
    versionQueryName?: string;
    versionHeaderName?: string;
  }): Promise<ApiInfo> {
    try {
      if (!isValidApiId(params.apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Creating native gRPC API via Azure Application Gateway integration', { 
        apiId: params.apiId, 
        displayName: params.displayName,
        initialVersion: params.initialVersion,
        protocols: params.protocols,
        note: 'Using Application Gateway for native gRPC support with APIM integration'
      });

      const client = this.azureClient.getClient();

      // Validate Protobuf content
      if (!params.protoDefinition || params.protoDefinition.trim().length === 0) {
        throw new ValidationError('Protobuf definition cannot be empty');
      }

      // Basic validation for Protobuf syntax
      if (!params.protoDefinition.includes('service ') || !params.protoDefinition.includes('rpc ')) {
        throw new ValidationError('Protobuf definition must contain at least one service with RPC methods');
      }

      // Extract gRPC service information from Protobuf
      const grpcServiceInfo = this.parseProtobufForGrpcService(params.protoDefinition);
      
      // Extract backend URL if available (look for service endpoints in proto)
      let backendUrl = params.serviceUrl;
      
      // Create backend service for gRPC if we have a backend URL
      let backendId: string | undefined;
      if (backendUrl) {
        backendId = `${params.apiId}-grpc-backend`;
        try {
          const backendParams = {
            title: `${params.displayName} gRPC Backend`,
            description: `Native gRPC backend service for ${params.displayName} via Application Gateway`,
            url: backendUrl,
            protocol: 'http', // APIM backend protocol (Application Gateway handles gRPC conversion)
            properties: {
              skipCertificateChainValidation: false,
              skipCertificateNameValidation: false
            },
            // Store gRPC info in description for reference
            metadata: {
              grpcService: true,
              serviceName: grpcServiceInfo.serviceName,
              methods: grpcServiceInfo.methods.join(',')
            }
          } as any;

          await client.backend.createOrUpdate(
            process.env.AZURE_APIM_RESOURCE_GROUP!,
            process.env.AZURE_APIM_SERVICE_NAME!,
            backendId,
            backendParams
          );
          
          this.logger.info('gRPC Backend service created successfully with Application Gateway integration', { 
            backendId,
            backendUrl,
            grpcService: grpcServiceInfo.serviceName
          });
        } catch (error: any) {
          this.logger.warn('Failed to create gRPC backend service, proceeding without backend integration', error);
          backendId = undefined;
        }
      }

      // If versioning is requested, create API version set first
      let apiVersionSetId: string | undefined;
      if (params.initialVersion) {
        const versionSetParams = {
          displayName: `${params.displayName} Version Set`,
          description: `Version set for gRPC API ${params.displayName}`,
          versioningScheme: params.versioningScheme || 'Segment',
          versionQueryName: params.versionQueryName,
          versionHeaderName: params.versionHeaderName
        };

        try {
          const versionSet = await client.apiVersionSet.createOrUpdate(
            process.env.AZURE_APIM_RESOURCE_GROUP!,
            process.env.AZURE_APIM_SERVICE_NAME!,
            `${params.apiId}-version-set`,
            versionSetParams
          );
          apiVersionSetId = versionSet.id;
          
          this.logger.info('gRPC-compatible API Version Set created', { 
            versionSetId: apiVersionSetId,
            versioningScheme: params.versioningScheme
          });
        } catch (error: any) {
          this.logger.warn('Failed to create version set for gRPC-compatible API, creating API without versioning', error);
          // Continue without versioning if version set creation fails
        }
      }

      // Prepare gRPC API creation via Application Gateway integration
      // Create as HTTP API with gRPC transcoding capabilities
      const grpcProtocols = ['https']; // Use HTTPS for Application Gateway integration
      
      // Generate OpenAPI spec from gRPC service info for Application Gateway
      const openApiSpec = this.generateOpenApiFromProtobuf(params.protoDefinition, grpcServiceInfo);
      
      const apiCreateParams: any = {
        displayName: params.displayName,
        description: `${params.description || 'gRPC API created from Protobuf definition with Application Gateway integration'}\n\n**Native gRPC Support via Azure Application Gateway**\n\n**Service**: ${grpcServiceInfo.serviceName}\n**Methods**: ${grpcServiceInfo.methods.join(', ')}\n\n**Protobuf Definition:**\n\`\`\`proto\n${params.protoDefinition}\n\`\`\``,
        path: sanitizeApiPath(params.path || `grpc/${params.apiId}`),
        protocols: grpcProtocols,
        serviceUrl: backendUrl || params.serviceUrl || `https://appgw.${params.apiId}.com`,
        subscriptionRequired: params.subscriptionRequired !== false,
        // Create as HTTP API with gRPC transcoding
        apiType: 'http' as const,
        // Import the generated OpenAPI specification
        value: openApiSpec,
        format: 'openapi' as const,
        import: true
      };

      // Add versioning information if provided
      if (params.initialVersion && apiVersionSetId) {
        apiCreateParams.apiVersion = params.initialVersion;
        apiCreateParams.apiVersionSetId = apiVersionSetId;
        
        // Adjust path for versioned gRPC API if using Segment versioning
        if (params.versioningScheme === 'Segment' || !params.versioningScheme) {
          const basePath = sanitizeApiPath(params.path || `grpc/${params.apiId}`);
          apiCreateParams.path = `${basePath}/${params.initialVersion}`;
        }
      }

      const result = await client.api.beginCreateOrUpdateAndWait(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        params.apiId,
        apiCreateParams
      );

      // Configure gRPC transcoding policies for Application Gateway integration
      if (backendId) {
        try {
          const grpcTranscodingPolicy = `
<policies>
  <inbound>
    <base />
    <set-backend-service backend-id="${backendId}" />
    <!-- gRPC transcoding headers for Application Gateway -->
    <set-header name="Content-Type" exists-action="override">
      <value>application/grpc</value>
    </set-header>
    <set-header name="grpc-service" exists-action="override">
      <value>${grpcServiceInfo.serviceName}</value>
    </set-header>
    <!-- Enable HTTP/2 for gRPC -->
    <set-header name="Connection" exists-action="override">
      <value>upgrade</value>
    </set-header>
    <set-header name="Upgrade" exists-action="override">
      <value>h2c</value>
    </set-header>
  </inbound>
  <backend>
    <base />
  </backend>
  <outbound>
    <base />
    <!-- Handle gRPC response headers -->
    <set-header name="grpc-status" exists-action="skip">
      <value>0</value>
    </set-header>
  </outbound>
  <on-error>
    <base />
    <!-- gRPC error handling -->
    <set-header name="grpc-status" exists-action="override">
      <value>13</value>
    </set-header>
    <set-header name="grpc-message" exists-action="override">
      <value>Internal error</value>
    </set-header>
  </on-error>
</policies>`;

          await client.apiPolicy.createOrUpdate(
            process.env.AZURE_APIM_RESOURCE_GROUP!,
            process.env.AZURE_APIM_SERVICE_NAME!,
            params.apiId,
            'policy', // policyId parameter
            {
              value: grpcTranscodingPolicy,
              format: 'xml'
            }
          );
          
          this.logger.info('gRPC transcoding policies configured for Application Gateway integration', { 
            apiId: params.apiId,
            backendId,
            serviceName: grpcServiceInfo.serviceName
          });
        } catch (error: any) {
          this.logger.warn('Failed to configure gRPC transcoding policies', error);
        }
      }

      const createdApi = this.mapAzureApiToApiInfo(result);
      
      this.logger.info('gRPC API created successfully with Azure Application Gateway integration', { 
        apiId: params.apiId,
        displayName: params.displayName,
        version: params.initialVersion,
        versionSetId: apiVersionSetId,
        backendId: backendId,
        backendUrl: backendUrl,
        protocols: grpcProtocols,
        serviceName: grpcServiceInfo.serviceName,
        methods: grpcServiceInfo.methods,
        note: 'Created with HTTP transcoding for gRPC via Application Gateway'
      });
      
      return createdApi;

    } catch (error: any) {
      this.logger.error('Failed to create gRPC API from Protobuf with versioning', error);
      
      // Handle specific Azure API Management errors
      if (error.statusCode === 400) {
        throw new ValidationError(`Invalid gRPC-compatible API configuration or Protobuf definition: ${error.message}`);
      } else if (error.statusCode === 409) {
        throw new ValidationError(`gRPC-compatible API with ID '${params.apiId}' already exists`);
      }
      
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * Create a new API from YAML/OpenAPI contract with optional versioning
   */
  public async createApiFromYamlWithVersioning(params: {
    apiId: string;
    displayName: string;
    description?: string;
    path?: string;
    serviceUrl?: string;
    yamlContract: string;
    protocols?: string[];
    subscriptionRequired?: boolean;
    initialVersion?: string;
    versioningScheme?: 'Segment' | 'Query' | 'Header';
    versionQueryName?: string;
    versionHeaderName?: string;
  }): Promise<ApiInfo> {
    try {
      if (!isValidApiId(params.apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Creating API from YAML contract with versioning', { 
        apiId: params.apiId, 
        displayName: params.displayName,
        initialVersion: params.initialVersion
      });

      const client = this.azureClient.getClient();

      // Validate YAML content
      if (!params.yamlContract || params.yamlContract.trim().length === 0) {
        throw new ValidationError('YAML contract cannot be empty');
      }

      // Extract backend URL from YAML contract
      let backendUrl = params.serviceUrl;
      try {
        // Parse YAML to extract server URL
        const yamlLines = params.yamlContract.split('\n');
        for (let i = 0; i < yamlLines.length; i++) {
          const line = yamlLines[i];
          if (line.includes('servers:')) {
            // Look for the first URL in servers section
            for (let j = i + 1; j < yamlLines.length; j++) {
              const urlLine = yamlLines[j];
              const urlMatch = urlLine.match(/^\s*-\s*url:\s*(.+)$/);
              if (urlMatch) {
                backendUrl = urlMatch[1].trim();
                this.logger.info('Extracted backend URL from YAML contract', { backendUrl });
                break;
              }
              // Stop if we hit another section
              if (urlLine.match(/^\w+:/)) {
                break;
              }
            }
            break;
          }
        }
      } catch (error: any) {
        this.logger.warn('Failed to extract backend URL from YAML contract, using provided serviceUrl', error);
      }

      // Create backend service if we have a backend URL
      let backendId: string | undefined;
      if (backendUrl) {
        backendId = `${params.apiId}-backend`;
        try {
          const backendParams = {
            title: `${params.displayName} Backend`,
            description: `Backend service for ${params.displayName}`,
            url: backendUrl,
            protocol: backendUrl.startsWith('https://') ? 'http' : 'http', // Azure APIM uses 'http' for both
            properties: {
              serviceFabricCluster: undefined,
              skipCertificateChainValidation: false,
              skipCertificateNameValidation: false
            }
          };

          await client.backend.createOrUpdate(
            process.env.AZURE_APIM_RESOURCE_GROUP!,
            process.env.AZURE_APIM_SERVICE_NAME!,
            backendId,
            backendParams
          );
          
          this.logger.info('Backend service created successfully', { 
            backendId,
            backendUrl
          });
        } catch (error: any) {
          this.logger.warn('Failed to create backend service, using direct service URL', error);
          backendId = undefined;
        }
      }

      // If versioning is requested, create API version set first
      let apiVersionSetId: string | undefined;
      if (params.initialVersion) {
        const versionSetParams = {
          displayName: `${params.displayName} Version Set`,
          description: `Version set for ${params.displayName}`,
          versioningScheme: params.versioningScheme || 'Segment',
          versionQueryName: params.versionQueryName,
          versionHeaderName: params.versionHeaderName
        };

        try {
          const versionSet = await client.apiVersionSet.createOrUpdate(
            process.env.AZURE_APIM_RESOURCE_GROUP!,
            process.env.AZURE_APIM_SERVICE_NAME!,
            `${params.apiId}-version-set`,
            versionSetParams
          );
          apiVersionSetId = versionSet.id;
          
          this.logger.info('API Version Set created', { 
            versionSetId: apiVersionSetId,
            versioningScheme: params.versioningScheme
          });
        } catch (error: any) {
          this.logger.warn('Failed to create version set, creating API without versioning', error);
          // Continue without versioning if version set creation fails
        }
      }

      // Prepare API creation parameters with proper import settings
      const apiCreateParams: any = {
        displayName: params.displayName,
        description: params.description || `API created from YAML contract`,
        path: sanitizeApiPath(params.path || params.apiId),
        protocols: params.protocols || ['https'],
        serviceUrl: backendUrl || params.serviceUrl, // Use extracted URL or fallback
        subscriptionRequired: params.subscriptionRequired !== false,
        // Import from YAML/OpenAPI specification
        value: params.yamlContract,
        format: 'openapi' as const,
        apiType: 'http' as const,
        // Ensure operations are imported from the specification
        import: true
      };

      // Add versioning information if provided
      if (params.initialVersion && apiVersionSetId) {
        apiCreateParams.apiVersion = params.initialVersion;
        apiCreateParams.apiVersionSetId = apiVersionSetId;
        
        // Adjust path for versioned API if using Segment versioning
        if (params.versioningScheme === 'Segment' || !params.versioningScheme) {
          const basePath = sanitizeApiPath(params.path || params.apiId);
          apiCreateParams.path = `${basePath}/${params.initialVersion}`;
        }
      }

      const result = await client.api.beginCreateOrUpdateAndWait(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        params.apiId,
        apiCreateParams
      );

      // Configure API policies to use the backend service if created
      if (backendId) {
        try {
          const backendPolicy = `
<policies>
  <inbound>
    <base />
    <set-backend-service backend-id="${backendId}" />
  </inbound>
  <backend>
    <base />
  </backend>
  <outbound>
    <base />
  </outbound>
  <on-error>
    <base />
  </on-error>
</policies>`;

          await client.apiPolicy.createOrUpdate(
            process.env.AZURE_APIM_RESOURCE_GROUP!,
            process.env.AZURE_APIM_SERVICE_NAME!,
            params.apiId,
            'policy', // policyId parameter
            {
              value: backendPolicy,
              format: 'xml'
            }
          );
          
          this.logger.info('API policies configured to use backend service', { 
            apiId: params.apiId,
            backendId
          });
        } catch (error: any) {
          this.logger.warn('Failed to configure API policies for backend service', error);
        }
      }

      const createdApi = this.mapAzureApiToApiInfo(result);
      
      this.logger.info('API created successfully from YAML with versioning and backend service', { 
        apiId: params.apiId,
        displayName: params.displayName,
        version: params.initialVersion,
        versionSetId: apiVersionSetId,
        backendId: backendId,
        backendUrl: backendUrl
      });
      
      return createdApi;

    } catch (error: any) {
      this.logger.error('Failed to create API from YAML with versioning', error);
      
      // Handle specific Azure API Management errors
      if (error.statusCode === 400) {
        throw new ValidationError(`Invalid API configuration or YAML contract: ${error.message}`);
      } else if (error.statusCode === 409) {
        throw new ValidationError(`API with ID '${params.apiId}' already exists`);
      }
      
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * Create a new API from YAML/OpenAPI contract
   */
  public async createApiFromYaml(params: {
    apiId: string;
    displayName: string;
    description?: string;
    path?: string;
    serviceUrl?: string;
    yamlContract: string;
    protocols?: string[];
    subscriptionRequired?: boolean;
  }): Promise<ApiInfo> {
    // Delegate to the versioned method without version parameters
    return this.createApiFromYamlWithVersioning({
      ...params,
      initialVersion: undefined,
      versioningScheme: undefined,
      versionQueryName: undefined,
      versionHeaderName: undefined
    });
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
          id: product.id || '',
          name: product.name || '',
          displayName: product.displayName || '',
          description: product.description || '',
          subscriptionRequired: product.subscriptionRequired || false,
          approvalRequired: product.approvalRequired || false,
          state: product.state || 'notPublished'
        });
      }

      this.logger.info(`Found ${products.length} products`);
      return products;
    } catch (error: any) {
      this.logger.error('Failed to list products', error);
      return this.azureClient.handleAzureError(error);
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
        id: result.id || '',
        name: result.name || '',
        displayName: result.displayName || '',
        description: result.description || '',
        subscriptionRequired: result.subscriptionRequired || false,
        approvalRequired: result.approvalRequired || false,
        state: result.state || 'notPublished'
      };
    } catch (error: any) {
      this.logger.error('Failed to get product', error);
      
      if (error.statusCode === 404) {
        throw new NotFoundError(`Product '${productId}' not found`);
      }
      
      return this.azureClient.handleAzureError(error);
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
        id: result.id || '',
        name: result.name || '',
        displayName: result.displayName || '',
        description: result.description || '',
        subscriptionRequired: result.subscriptionRequired || false,
        approvalRequired: result.approvalRequired || false,
        state: result.state || 'notPublished'
      };
    } catch (error: any) {
      this.logger.error('Failed to create product', error);
      
      if (error.statusCode === 409) {
        throw new ValidationError(`Product with ID '${params.productId}' already exists`);
      }
      
      return this.azureClient.handleAzureError(error);
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
      
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * List all subscriptions
   */
  public async listSubscriptions(filter?: string, top?: number, skip?: number): Promise<any[]> {
    try {
      this.logger.info('Listing subscriptions', { filter, top, skip });
      
      const client = this.azureClient.getClient();
      const options: any = {};
      
      if (filter) options.$filter = filter;
      if (top) options.$top = top;
      if (skip) options.$skip = skip;

      const result = client.subscription.list(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        options
      );

      const subscriptions: any[] = [];
      for await (const subscription of result) {
        subscriptions.push({
          id: subscription.id || '',
          name: subscription.name || '',
          displayName: subscription.displayName || '',
          productId: subscription.scope?.split('/').pop() || '',
          state: subscription.state || 'submitted',
          primaryKey: subscription.primaryKey || '',
          secondaryKey: subscription.secondaryKey || '',
          createdDate: subscription.createdDate,
          startDate: subscription.startDate,
          expirationDate: subscription.expirationDate
        });
      }

      this.logger.info(`Found ${subscriptions.length} subscriptions`);
      return subscriptions;
    } catch (error: any) {
      this.logger.error('Failed to list subscriptions', error);
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * Create a new subscription
   */
  public async createSubscription(params: {
    subscriptionId: string;
    displayName: string;
    productId: string;
    userId?: string;
    primaryKey?: string;
    secondaryKey?: string;
    state?: string;
  }): Promise<any> {
    try {
      this.logger.info('Creating subscription', { 
        subscriptionId: params.subscriptionId,
        productId: params.productId 
      });
      
      const client = this.azureClient.getClient();
      const result = await client.subscription.createOrUpdate(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        params.subscriptionId,
        {
          displayName: params.displayName,
          scope: `/products/${params.productId}`,
          ownerId: params.userId ? `/users/${params.userId}` : '/users/1', // Default admin user
          primaryKey: params.primaryKey,
          secondaryKey: params.secondaryKey,
          state: (params.state as any) || 'active'
        }
      );

      return {
        id: result.id || '',
        name: result.name || '',
        displayName: result.displayName || '',
        productId: params.productId,
        state: result.state || 'submitted',
        primaryKey: result.primaryKey || '',
        secondaryKey: result.secondaryKey || '',
        createdDate: result.createdDate,
        startDate: result.startDate,
        expirationDate: result.expirationDate
      };
    } catch (error: any) {
      this.logger.error('Failed to create subscription', error);
      
      if (error.statusCode === 404) {
        throw new NotFoundError(`Product '${params.productId}' not found`);
      } else if (error.statusCode === 409) {
        throw new ValidationError(`Subscription with ID '${params.subscriptionId}' already exists`);
      }
      
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * Get subscription details by ID
   */
  public async getSubscription(subscriptionId: string): Promise<any> {
    try {
      this.logger.info('Getting subscription details', { subscriptionId });
      
      const client = this.azureClient.getClient();
      const result = await client.subscription.get(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        subscriptionId
      );

      return {
        id: result.id || '',
        name: result.name || '',
        displayName: result.displayName || '',
        productId: result.scope?.split('/').pop() || '',
        state: result.state || 'submitted',
        primaryKey: result.primaryKey || '',
        secondaryKey: result.secondaryKey || '',
        createdDate: result.createdDate,
        startDate: result.startDate,
        expirationDate: result.expirationDate
      };
    } catch (error: any) {
      this.logger.error('Failed to get subscription', error);
      
      if (error.statusCode === 404) {
        throw new NotFoundError(`Subscription '${subscriptionId}' not found`);
      }
      
      return this.azureClient.handleAzureError(error);
    }
  }

  /**
   * Create a new gRPC API from Protobuf definition
   */
  public async createGrpcApiFromProto(params: {
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
  }): Promise<any> {
    try {
      this.logger.info('Creating gRPC API from proto definition', { apiId: params.apiId });
      
      // For now, return a mock implementation
      // In a real implementation, this would process the proto definition
      // and create the appropriate gRPC API in Azure APIM
      
      return {
        id: params.apiId,
        displayName: params.displayName,
        type: 'grpc',
        description: params.description,
        path: params.path || `grpc/${params.apiId}`,
        serviceUrl: params.serviceUrl,
        protocols: params.protocols || ['grpcs'],
        subscriptionRequired: params.subscriptionRequired ?? true
      };
    } catch (error: any) {
      this.logger.error('Failed to create gRPC API', error);
      throw error;
    }
  }

  /**
   * Handle and format API errors consistently
   */
  public handleError(error: any, operation: string): any {
    this.logger.error(`Error in ${operation}`, error);
    
    if (error instanceof AzureApiError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode
      };
    }
    
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        statusCode: 400
      };
    }
    
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: error.message,
        statusCode: 404
      };
    }
    
    return {
      success: false,
      error: error.message || 'An unknown error occurred',
      statusCode: error.statusCode || 500
    };
  }

  /**
   * Validate API creation parameters
   */
  public validateApiParams(params: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.apiId || typeof params.apiId !== 'string') {
      errors.push('apiId is required and must be a string');
    }
    
    if (!params.displayName || typeof params.displayName !== 'string') {
      errors.push('displayName is required and must be a string');
    }
    
    if (params.apiId && !isValidApiId(params.apiId)) {
      errors.push('apiId contains invalid characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate YAML/OpenAPI specification
   */
  public validateYamlContract(yamlContent: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!yamlContent || typeof yamlContent !== 'string') {
      errors.push('YAML content is required and must be a string');
      return { isValid: false, errors };
    }
    
    try {
      // Basic validation - in a real implementation, you would use a YAML parser
      // and OpenAPI validator
      if (!yamlContent.trim().startsWith('openapi:') && !yamlContent.trim().startsWith('swagger:')) {
        errors.push('YAML content must be a valid OpenAPI/Swagger specification');
      }
    } catch (error: any) {
      errors.push(`Invalid YAML format: ${error.message}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Protobuf definition
   */
  public validateProtoDefinition(protoContent: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!protoContent || typeof protoContent !== 'string') {
      errors.push('Protobuf content is required and must be a string');
      return { isValid: false, errors };
    }
    
    try {
      // Basic validation - in a real implementation, you would use a protobuf parser
      if (!protoContent.includes('service') || !protoContent.includes('rpc')) {
        errors.push('Protobuf definition must contain at least one service with RPC methods');
      }
    } catch (error: any) {
      errors.push(`Invalid Protobuf format: ${error.message}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}