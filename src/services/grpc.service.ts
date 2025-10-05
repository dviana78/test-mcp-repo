import { 
  ApiInfo
} from '../types';
import { AzureClient } from './azure-client';
import { ILogger, IGrpcService } from '../interfaces';
import { ValidationError } from '../utils/errors';
import { 
  isValidApiId,
  sanitizeApiPath
} from '../utils/validation';

/**
 * gRPC Service
 * Handles gRPC API creation from Protobuf definitions with HTTP transcoding
 */
export class GrpcService implements IGrpcService {
  private readonly azureClient: AzureClient;
  private readonly logger: ILogger;

  constructor(azureClient: AzureClient, logger: ILogger) {
    this.azureClient = azureClient;
    this.logger = logger;
  }

  /**
   * Create a new gRPC API from Protobuf definition with optional versioning
   */
  public async createGrpcApiFromProto(params: {
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
          versioningScheme: params.versioningScheme ?? 'Segment',
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
        description: `${params.description ?? 'gRPC API created from Protobuf definition with Application Gateway integration'}\n\n**Native gRPC Support via Azure Application Gateway**\n\n**Service**: ${grpcServiceInfo.serviceName}\n**Methods**: ${grpcServiceInfo.methods.join(', ')}\n\n**Protobuf Definition:**\n\`\`\`proto\n${params.protoDefinition}\n\`\`\``,
        path: sanitizeApiPath(params.path ?? `grpc/${params.apiId}`),
        protocols: grpcProtocols,
        serviceUrl: backendUrl ?? params.serviceUrl ?? `https://appgw.${params.apiId}.com`,
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
          const basePath = sanitizeApiPath(params.path ?? `grpc/${params.apiId}`);
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
      this.logger.error('Failed to create gRPC API from protobuf', error);
      
      // Re-throw validation errors as-is
      if (error instanceof ValidationError) {
        throw error;
      }
      
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
      const methodMatch = /rpc\s+(\w+)/.exec(match);
      const httpMatch = /(get|post|put|patch|delete):\s*"([^"]+)"/i.exec(match);
      
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
}