import { McpToolDefinition, McpToolRequest, McpToolResponse } from '../types/index.js';
import { 
  IApiManagementService,
  IApiVersioningService,
  IGrpcService,
  IProductsManagementService,
  ISubscriptionsManagementService,
  IApiOperationsService,
  IBackendServicesService
} from '../interfaces/index.js';
import { Logger } from '../utils/logger.js';
import { ValidationError, createErrorResponse } from '../utils/errors.js';
import { validateMcpToolRequest } from '../utils/validation.js';

export class ToolsHandler {
  private readonly apiManagementService: IApiManagementService;
  private readonly apiVersioningService: IApiVersioningService;
  private readonly grpcService: IGrpcService;
  private readonly productsManagementService: IProductsManagementService;
  private readonly subscriptionsManagementService: ISubscriptionsManagementService;
  private readonly apiOperationsService: IApiOperationsService;
  private readonly backendServicesService: IBackendServicesService;
  private readonly logger: Logger;

  constructor(
    apiManagementService: IApiManagementService,
    apiVersioningService: IApiVersioningService,
    grpcService: IGrpcService,
    productsManagementService: IProductsManagementService,
    subscriptionsManagementService: ISubscriptionsManagementService,
    apiOperationsService: IApiOperationsService,
    backendServicesService: IBackendServicesService
  ) {
    this.apiManagementService = apiManagementService;
    this.apiVersioningService = apiVersioningService;
    this.grpcService = grpcService;
    this.productsManagementService = productsManagementService;
    this.subscriptionsManagementService = subscriptionsManagementService;
    this.apiOperationsService = apiOperationsService;
    this.backendServicesService = backendServicesService;
    this.logger = new Logger('ToolsHandler');
  }

  /**
   * Get list of available tools
   */
  public getAvailableTools(): McpToolDefinition[] {
    return [
      {
        name: 'list_apis',
        description: 'List all APIs in Azure API Management',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'OData filter expression to filter APIs'
            },
            top: {
              type: 'number',
              description: 'Maximum number of APIs to return',
              minimum: 1,
              maximum: 1000
            },
            skip: {
              type: 'number',
              description: 'Number of APIs to skip',
              minimum: 0
            }
          }
        }
      },
      {
        name: 'get_api',
        description: 'Get details of a specific API by ID',
        inputSchema: {
          type: 'object',
          properties: {
            apiId: {
              type: 'string',
              description: 'The ID of the API to retrieve'
            }
          },
          required: ['apiId']
        }
      },
      {
        name: 'create_api_version',
        description: 'Create a new version of an existing API',
        inputSchema: {
          type: 'object',
          properties: {
            apiId: {
              type: 'string',
              description: 'The ID of the source API'
            },
            versionId: {
              type: 'string',
              description: 'The version identifier (e.g., "v2", "2.0")'
            },
            displayName: {
              type: 'string',
              description: 'Display name for the API version'
            },
            description: {
              type: 'string',
              description: 'Optional description for the API version'
            },
            sourceApiId: {
              type: 'string',
              description: 'Optional source API ID if different from apiId'
            },
            versioningScheme: {
              type: 'string',
              enum: ['Segment', 'Query', 'Header'],
              description: 'The versioning scheme to use'
            },
            versionQueryName: {
              type: 'string',
              description: 'Query parameter name for versioning (when using Query scheme)'
            },
            versionHeaderName: {
              type: 'string',
              description: 'Header name for versioning (when using Header scheme)'
            }
          },
          required: ['apiId', 'versionId', 'displayName']
        }
      },
      {
        name: 'list_api_versions',
        description: 'List all versions of a specific API',
        inputSchema: {
          type: 'object',
          properties: {
            apiId: {
              type: 'string',
              description: 'The ID of the API to list versions for'
            }
          },
          required: ['apiId']
        }
      },
      {
        name: 'create_api_revision',
        description: 'Create a new revision of an existing API',
        inputSchema: {
          type: 'object',
          properties: {
            apiId: {
              type: 'string',
              description: 'The ID of the API to create a revision for'
            },
            apiRevision: {
              type: 'string',
              description: 'Optional revision number (if not provided, auto-generated)'
            },
            description: {
              type: 'string',
              description: 'Description of the revision changes'
            },
            sourceApiRevision: {
              type: 'string',
              description: 'Source revision to copy from (if not current)'
            }
          },
          required: ['apiId']
        }
      },
      {
        name: 'list_api_revisions',
        description: 'List all revisions of a specific API',
        inputSchema: {
          type: 'object',
          properties: {
            apiId: {
              type: 'string',
              description: 'The ID of the API to list revisions for'
            }
          },
          required: ['apiId']
        }
      },
      {
        name: 'get_api_operations',
        description: 'Get all operations for a specific API',
        inputSchema: {
          type: 'object',
          properties: {
            apiId: {
              type: 'string',
              description: 'The ID of the API to get operations for'
            }
          },
          required: ['apiId']
        }
      },
      {
        name: 'get_api_products',
        description: 'Get all products that include a specific API',
        inputSchema: {
          type: 'object',
          properties: {
            apiId: {
              type: 'string',
              description: 'The ID of the API to get products for'
            }
          },
          required: ['apiId']
        }
      },
      {
        name: 'create_api_from_yaml',
        description: 'Create a new API from a YAML/OpenAPI contract with optional versioning',
        inputSchema: {
          type: 'object',
          properties: {
            apiId: {
              type: 'string',
              description: 'The ID for the new API'
            },
            displayName: {
              type: 'string',
              description: 'Display name for the API'
            },
            description: {
              type: 'string',
              description: 'Description of the API'
            },
            path: {
              type: 'string',
              description: 'API path (e.g., "myapi/v1")'
            },
            serviceUrl: {
              type: 'string',
              description: 'Backend service URL'
            },
            yamlContract: {
              type: 'string',
              description: 'YAML/OpenAPI contract content'
            },
            protocols: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['http', 'https']
              },
              description: 'Supported protocols'
            },
            subscriptionRequired: {
              type: 'boolean',
              description: 'Whether subscription is required',
              default: true
            },
            initialVersion: {
              type: 'string',
              description: 'Initial version for the API (e.g., "v1", "1.0")'
            },
            versioningScheme: {
              type: 'string',
              enum: ['Segment', 'Query', 'Header'],
              description: 'The versioning scheme to use (default: Segment)',
              default: 'Segment'
            },
            versionQueryName: {
              type: 'string',
              description: 'Query parameter name for versioning (when using Query scheme)',
              default: 'version'
            },
            versionHeaderName: {
              type: 'string',
              description: 'Header name for versioning (when using Header scheme)',
              default: 'Api-Version'
            }
          },
          required: ['apiId', 'displayName', 'yamlContract']
        }
      },
      {
        name: 'list_backends',
        description: 'List all backend services in Azure API Management',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'OData filter expression to filter backends'
            },
            top: {
              type: 'number',
              description: 'Maximum number of backends to return',
              minimum: 1,
              maximum: 1000
            },
            skip: {
              type: 'number',
              description: 'Number of backends to skip',
              minimum: 0
            }
          }
        }
      },
      {
        name: 'create_grpc_api_from_proto',
        description: 'Create a new gRPC API from a Protobuf definition file with optional versioning',
        inputSchema: {
          type: 'object',
          properties: {
            apiId: {
              type: 'string',
              description: 'The ID for the new gRPC API'
            },
            displayName: {
              type: 'string',
              description: 'Display name for the gRPC API'
            },
            description: {
              type: 'string',
              description: 'Description of the gRPC API'
            },
            path: {
              type: 'string',
              description: 'gRPC API path (e.g., "grpc/myservice/v1")'
            },
            serviceUrl: {
              type: 'string',
              description: 'Backend gRPC service URL (e.g., "grpc://api.myservice.com:443")'
            },
            protoDefinition: {
              type: 'string',
              description: 'Protobuf (.proto) file content with service definitions'
            },
            protocols: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['http', 'https', 'grpc', 'grpcs']
              },
              description: 'Supported protocols for gRPC (default: ["grpcs"])'
            },
            subscriptionRequired: {
              type: 'boolean',
              description: 'Whether subscription is required',
              default: true
            },
            initialVersion: {
              type: 'string',
              description: 'Initial version for the gRPC API (e.g., "v1", "1.0")'
            },
            versioningScheme: {
              type: 'string',
              enum: ['Segment', 'Query', 'Header'],
              description: 'The versioning scheme to use (default: Segment)',
              default: 'Segment'
            },
            versionQueryName: {
              type: 'string',
              description: 'Query parameter name for versioning (when using Query scheme)',
              default: 'version'
            },
            versionHeaderName: {
              type: 'string',
              description: 'Header name for versioning (when using Header scheme)',
              default: 'Api-Version'
            }
          },
          required: ['apiId', 'displayName', 'protoDefinition']
        }
      },
      {
        name: 'list_products',
        description: 'List all products in Azure API Management',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'OData filter expression to filter products'
            },
            top: {
              type: 'number',
              description: 'Maximum number of products to return',
              minimum: 1,
              maximum: 1000
            },
            skip: {
              type: 'number',
              description: 'Number of products to skip',
              minimum: 0
            }
          }
        }
      },
      {
        name: 'get_product',
        description: 'Get details of a specific product by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'The ID of the product to retrieve'
            }
          },
          required: ['productId']
        }
      },
      {
        name: 'create_product',
        description: 'Create a new product in Azure API Management',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'The ID for the new product'
            },
            displayName: {
              type: 'string',
              description: 'Display name for the product'
            },
            description: {
              type: 'string',
              description: 'Description of the product'
            },
            subscriptionRequired: {
              type: 'boolean',
              description: 'Whether subscription is required for this product',
              default: true
            },
            approvalRequired: {
              type: 'boolean',
              description: 'Whether approval is required for subscriptions',
              default: false
            },
            state: {
              type: 'string',
              enum: ['published', 'notPublished'],
              description: 'Product state',
              default: 'published'
            }
          },
          required: ['productId', 'displayName']
        }
      },
      {
        name: 'add_api_to_product',
        description: 'Add an API to a product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'The ID of the product'
            },
            apiId: {
              type: 'string',
              description: 'The ID of the API to add to the product'
            }
          },
          required: ['productId', 'apiId']
        }
      },
      {
        name: 'list_subscriptions',
        description: 'List all subscriptions in Azure API Management',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'OData filter expression to filter subscriptions'
            },
            top: {
              type: 'number',
              description: 'Maximum number of subscriptions to return',
              minimum: 1,
              maximum: 1000
            },
            skip: {
              type: 'number',
              description: 'Number of subscriptions to skip',
              minimum: 0
            }
          }
        }
      },
      {
        name: 'create_subscription',
        description: 'Create a new subscription for a product',
        inputSchema: {
          type: 'object',
          properties: {
            subscriptionId: {
              type: 'string',
              description: 'The ID for the new subscription'
            },
            displayName: {
              type: 'string',
              description: 'Display name for the subscription'
            },
            productId: {
              type: 'string',
              description: 'The ID of the product to subscribe to'
            },
            userId: {
              type: 'string',
              description: 'The ID of the user (optional, defaults to admin)'
            },
            primaryKey: {
              type: 'string',
              description: 'Primary subscription key (optional, auto-generated if not provided)'
            },
            secondaryKey: {
              type: 'string',
              description: 'Secondary subscription key (optional, auto-generated if not provided)'
            },
            state: {
              type: 'string',
              enum: ['active', 'suspended', 'submitted', 'rejected', 'cancelled', 'expired'],
              description: 'Subscription state',
              default: 'active'
            }
          },
          required: ['subscriptionId', 'displayName', 'productId']
        }
      },
      {
        name: 'get_subscription',
        description: 'Get details of a specific subscription by ID',
        inputSchema: {
          type: 'object',
          properties: {
            subscriptionId: {
              type: 'string',
              description: 'The ID of the subscription to retrieve'
            }
          },
          required: ['subscriptionId']
        }
      },
      {
        name: 'run_sonar_analysis',
        description: 'Run SonarQube analysis on the current project after compilation',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the project root directory (optional, defaults to current directory)'
            },
            sonarUrl: {
              type: 'string',
              description: 'SonarQube server URL (optional, uses environment variable or localhost:9000)'
            },
            sonarToken: {
              type: 'string',
              description: 'SonarQube authentication token (optional, uses environment variable)'
            },
            includeCoverage: {
              type: 'boolean',
              description: 'Include test coverage in analysis',
              default: true
            },
            waitForQualityGate: {
              type: 'boolean',
              description: 'Wait for quality gate result',
              default: false
            }
          }
        }
      }
    ];
  }

  /**
   * Execute a tool request
   */
  public async executeTool(request: McpToolRequest): Promise<McpToolResponse> {
    try {
      // Validate the request
      validateMcpToolRequest(request);

      this.logger.info('Executing tool', { toolName: request.name, arguments: request.arguments });

      switch (request.name) {
        case 'list_apis':
          return await this.handleListApis(request.arguments);
        
        case 'get_api':
          return await this.handleGetApi(request.arguments);
        
        case 'create_api_version':
          return await this.handleCreateApiVersion(request.arguments);
        
        case 'list_api_versions':
          return await this.handleListApiVersions(request.arguments);
        
        case 'create_api_revision':
          return await this.handleCreateApiRevision(request.arguments);
        
        case 'list_api_revisions':
          return await this.handleListApiRevisions(request.arguments);
        
        case 'get_api_operations':
          return await this.handleGetApiOperations(request.arguments);
        
        case 'get_api_products':
          return await this.handleGetApiProducts(request.arguments);
        
        case 'list_backends':
          return await this.handleListBackends(request.arguments);
        
        case 'create_api_from_yaml':
          return await this.handleCreateApiFromYaml(request.arguments);
        
        case 'create_grpc_api_from_proto':
          return await this.handleCreateGrpcApiFromProto(request.arguments);
        
        case 'list_products':
          return await this.handleListProducts(request.arguments);
        
        case 'get_product':
          return await this.handleGetProduct(request.arguments);
        
        case 'create_product':
          return await this.handleCreateProduct(request.arguments);
        
        case 'add_api_to_product':
          return await this.handleAddApiToProduct(request.arguments);
        
        case 'list_subscriptions':
          return await this.handleListSubscriptions(request.arguments);
        
        case 'create_subscription':
          return await this.handleCreateSubscription(request.arguments);
        
        case 'get_subscription':
          return await this.handleGetSubscription(request.arguments);
        
        case 'run_sonar_analysis':
          return await this.handleRunSonarAnalysis(request.arguments);
        
        default:
          throw new ValidationError(`Unknown tool: ${request.name}`);
      }
    } catch (error: any) {
      this.logger.error('Tool execution failed', error);
      
      const errorResponse = createErrorResponse(error);
      return {
        content: [{
          type: 'text',
          text: `Error: ${errorResponse.message}`
        }],
        isError: true
      };
    }
  }

  private async handleListApis(args: any): Promise<McpToolResponse> {
    const apis = await this.apiManagementService.listApis({
      filter: args.filter,
      top: args.top,
      skip: args.skip
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Found ${apis.length} APIs`,
          apis: apis.map((api: any) => ({
            id: api.id,
            name: api.name,
            displayName: api.displayName,
            description: api.description,
            path: api.path,
            protocols: api.protocols,
            serviceUrl: api.serviceUrl,
            subscriptionRequired: api.subscriptionRequired
          }))
        }, null, 2)
      }]
    };
  }

  private async handleGetApi(args: any): Promise<McpToolResponse> {
    if (!args.apiId) {
      throw new ValidationError('apiId is required');
    }

    const api = await this.apiManagementService.getApi(args.apiId);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `API details for ${api.displayName}`,
          api: {
            id: api.id,
            name: api.name,
            displayName: api.displayName,
            description: api.description,
            path: api.path,
            protocols: api.protocols,
            serviceUrl: api.serviceUrl,
            apiVersion: api.apiVersion,
            subscriptionRequired: api.subscriptionRequired,
            type: api.type
          }
        }, null, 2)
      }]
    };
  }

  private async handleCreateApiVersion(args: any): Promise<McpToolResponse> {
    const requiredFields = ['apiId', 'versionId', 'displayName'];
    for (const field of requiredFields) {
      if (!args[field]) {
        throw new ValidationError(`${field} is required`);
      }
    }

    const version = await this.apiVersioningService.createApiVersion({
      apiId: args.apiId,
      versionId: args.versionId,
      displayName: args.displayName,
      description: args.description,
      sourceApiId: args.sourceApiId,
      versioningScheme: args.versioningScheme,
      versionQueryName: args.versionQueryName,
      versionHeaderName: args.versionHeaderName
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `API version ${args.versionId} created successfully for API ${args.apiId}`,
          version: {
            id: version.id,
            name: version.name,
            displayName: version.displayName,
            description: version.description,
            versioningScheme: version.versioningScheme
          }
        }, null, 2)
      }]
    };
  }

  private async handleListApiVersions(args: any): Promise<McpToolResponse> {
    if (!args.apiId) {
      throw new ValidationError('apiId is required');
    }

    const versions = await this.apiVersioningService.listApiVersions(args.apiId);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Found ${versions.length} versions for API ${args.apiId}`,
          versions: versions.map((version: any) => ({
            id: version.id,
            name: version.name,
            displayName: version.displayName,
            description: version.description,
            versioningScheme: version.versioningScheme
          }))
        }, null, 2)
      }]
    };
  }

  private async handleCreateApiRevision(args: any): Promise<McpToolResponse> {
    if (!args.apiId) {
      throw new ValidationError('apiId is required');
    }

    const revision = await this.apiVersioningService.createApiRevision({
      apiId: args.apiId,
      apiRevision: args.apiRevision,
      description: args.description,
      sourceApiRevision: args.sourceApiRevision
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `API revision ${revision.apiRevision} created successfully for API ${args.apiId}`,
          revision: {
            id: revision.id,
            apiId: revision.apiId,
            apiRevision: revision.apiRevision,
            description: revision.description,
            isCurrent: revision.isCurrent,
            isOnline: revision.isOnline,
            createdDateTime: revision.createdDateTime
          }
        }, null, 2)
      }]
    };
  }

  private async handleListApiRevisions(args: any): Promise<McpToolResponse> {
    if (!args.apiId) {
      throw new ValidationError('apiId is required');
    }

    const revisions = await this.apiVersioningService.listApiRevisions(args.apiId);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Found ${revisions.length} revisions for API ${args.apiId}`,
          revisions: revisions.map((revision: any) => ({
            id: revision.id,
            apiRevision: revision.apiRevision,
            description: revision.description,
            isCurrent: revision.isCurrent,
            isOnline: revision.isOnline,
            createdDateTime: revision.createdDateTime,
            updatedDateTime: revision.updatedDateTime
          }))
        }, null, 2)
      }]
    };
  }

  private async handleGetApiOperations(args: any): Promise<McpToolResponse> {
    if (!args.apiId) {
      throw new ValidationError('apiId is required');
    }

    const operations = await this.apiOperationsService.getApiOperations(args.apiId);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Found ${operations.length} operations for API ${args.apiId}`,
          operations: operations.map((op: any) => ({
            id: op.id,
            name: op.name,
            displayName: op.displayName,
            method: op.method,
            urlTemplate: op.urlTemplate,
            description: op.description
          }))
        }, null, 2)
      }]
    };
  }

  private async handleGetApiProducts(args: any): Promise<McpToolResponse> {
    if (!args.apiId) {
      throw new ValidationError('apiId is required');
    }

    const products = await this.productsManagementService.getApiProducts(args.apiId);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Found ${products.length} products for API ${args.apiId}`,
          products: products.map((product: any) => ({
            id: product.id,
            name: product.name,
            displayName: product.displayName,
            description: product.description,
            state: product.state,
            subscriptionRequired: product.subscriptionRequired,
            approvalRequired: product.approvalRequired
          }))
        }, null, 2)
      }]
    };
  }

  private async handleListBackends(args: any): Promise<McpToolResponse> {
    const backends = await this.backendServicesService.listBackends({
      filter: args.filter,
      top: args.top,
      skip: args.skip
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Found ${backends.length} backend services`,
          backends: backends.map((backend: any) => ({
            id: backend.id,
            title: backend.title,
            description: backend.description,
            url: backend.url,
            protocol: backend.protocol
          }))
        }, null, 2)
      }]
    };
  }

  private async handleCreateApiFromYaml(args: any): Promise<McpToolResponse> {
    const requiredFields = ['apiId', 'displayName', 'yamlContract'];
    for (const field of requiredFields) {
      if (!args[field]) {
        throw new ValidationError(`${field} is required`);
      }
    }

    try {
      const api = await this.apiManagementService.createApiFromYaml({
        apiId: args.apiId,
        displayName: args.displayName,
        description: args.description,
        path: args.path,
        serviceUrl: args.serviceUrl,
        yamlContract: args.yamlContract,
        protocols: args.protocols || ['https'],
        subscriptionRequired: args.subscriptionRequired !== false,
        initialVersion: args.initialVersion,
        versioningScheme: args.versioningScheme || 'Segment',
        versionQueryName: args.versionQueryName || 'version',
        versionHeaderName: args.versionHeaderName || 'Api-Version'
      });

      let message = `API ${args.displayName} created successfully from YAML contract`;
      if (args.initialVersion) {
        message += ` with initial version ${args.initialVersion}`;
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            message: message,
            api: {
              id: api.id,
              name: api.name,
              displayName: api.displayName,
              description: api.description,
              path: api.path,
              protocols: api.protocols,
              serviceUrl: api.serviceUrl,
              subscriptionRequired: api.subscriptionRequired,
              version: api.apiVersion,
              versioningScheme: args.versioningScheme
            }
          }, null, 2)
        }]
      };
    } catch (error: any) {
      throw new Error(`Failed to create API from YAML: ${error.message}`);
    }
  }

  private async handleCreateGrpcApiFromProto(args: any): Promise<McpToolResponse> {
    const requiredFields = ['apiId', 'displayName', 'protoDefinition'];
    for (const field of requiredFields) {
      if (!args[field]) {
        throw new ValidationError(`${field} is required`);
      }
    }

    try {
      const api = await this.grpcService.createGrpcApiFromProto({
        apiId: args.apiId,
        displayName: args.displayName,
        description: args.description,
        path: args.path,
        serviceUrl: args.serviceUrl,
        protoDefinition: args.protoDefinition,
        protocols: args.protocols || ['grpcs'],
        subscriptionRequired: args.subscriptionRequired !== false,
        initialVersion: args.initialVersion,
        versioningScheme: args.versioningScheme || 'Segment',
        versionQueryName: args.versionQueryName || 'version',
        versionHeaderName: args.versionHeaderName || 'Api-Version'
      });

      let message = `gRPC API ${args.displayName} created successfully from Protobuf definition`;
      if (args.initialVersion) {
        message += ` with initial version ${args.initialVersion}`;
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            message: message,
            api: {
              id: api.id,
              name: api.name,
              displayName: api.displayName,
              description: api.description,
              path: api.path,
              protocols: api.protocols,
              serviceUrl: api.serviceUrl,
              subscriptionRequired: api.subscriptionRequired,
              version: api.apiVersion,
              versioningScheme: args.versioningScheme,
              apiType: 'grpc'
            }
          }, null, 2)
        }]
      };
    } catch (error: any) {
      throw new Error(`Failed to create gRPC API from Protobuf: ${error.message}`);
    }
  }

  private async handleListProducts(args: any): Promise<McpToolResponse> {
    const products = await this.productsManagementService.listProducts(args.filter, args.top, args.skip);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Found ${products.length} products`,
          products: products
        }, null, 2)
      }]
    };
  }

  private async handleGetProduct(args: any): Promise<McpToolResponse> {
    if (!args.productId) {
      throw new ValidationError('productId is required');
    }

    const product = await this.productsManagementService.getProduct(args.productId);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Product details for ${args.productId}`,
          product: product
        }, null, 2)
      }]
    };
  }

  private async handleCreateProduct(args: any): Promise<McpToolResponse> {
    const requiredFields = ['productId', 'displayName'];
    for (const field of requiredFields) {
      if (!args[field]) {
        throw new ValidationError(`${field} is required`);
      }
    }

    const product = await this.productsManagementService.createProduct({
      productId: args.productId,
      displayName: args.displayName,
      description: args.description,
      subscriptionRequired: args.subscriptionRequired !== false,
      approvalRequired: args.approvalRequired || false,
      state: args.state || 'published'
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Product ${args.displayName} created successfully`,
          product: {
            id: product.id,
            name: product.name,
            displayName: product.displayName,
            description: product.description,
            subscriptionRequired: product.subscriptionRequired,
            approvalRequired: product.approvalRequired,
            state: product.state
          }
        }, null, 2)
      }]
    };
  }

  private async handleAddApiToProduct(args: any): Promise<McpToolResponse> {
    const requiredFields = ['productId', 'apiId'];
    for (const field of requiredFields) {
      if (!args[field]) {
        throw new ValidationError(`${field} is required`);
      }
    }

    await this.productsManagementService.addApiToProduct(args.productId, args.apiId);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `API ${args.apiId} added to product ${args.productId} successfully`
        }, null, 2)
      }]
    };
  }

  private async handleListSubscriptions(args: any): Promise<McpToolResponse> {
    const subscriptions = await this.subscriptionsManagementService.listSubscriptions(args.filter, args.top, args.skip);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Found ${subscriptions.length} subscriptions`,
          subscriptions: subscriptions
        }, null, 2)
      }]
    };
  }

  private async handleCreateSubscription(args: any): Promise<McpToolResponse> {
    const requiredFields = ['subscriptionId', 'displayName', 'productId'];
    for (const field of requiredFields) {
      if (!args[field]) {
        throw new ValidationError(`${field} is required`);
      }
    }

    const subscription = await this.subscriptionsManagementService.createSubscription({
      subscriptionId: args.subscriptionId,
      displayName: args.displayName,
      productId: args.productId,
      userId: args.userId,
      primaryKey: args.primaryKey,
      secondaryKey: args.secondaryKey,
      state: args.state || 'active'
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Subscription ${args.displayName} created successfully`,
          subscription: {
            id: subscription.id,
            name: subscription.name,
            displayName: subscription.displayName,
            productId: args.productId,
            state: subscription.state,
            primaryKey: subscription.primaryKey,
            secondaryKey: subscription.secondaryKey
          }
        }, null, 2)
      }]
    };
  }

  private async handleGetSubscription(args: any): Promise<McpToolResponse> {
    if (!args.subscriptionId) {
      throw new ValidationError('subscriptionId is required');
    }

    const subscription = await this.subscriptionsManagementService.getSubscription(args.subscriptionId);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: `Subscription details for ${args.subscriptionId}`,
          subscription: subscription
        }, null, 2)
      }]
    };
  }

  private async handleRunSonarAnalysis(args: any): Promise<McpToolResponse> {
    const { spawn } = await import('child_process');
    const { promisify } = await import('util');
    const { access, constants } = await import('fs');
    const path = await import('path');
    
    try {
      // Set default values
      const projectPath = args.projectPath || process.cwd();
      const includeCoverage = args.includeCoverage !== false;
      const waitForQualityGate = args.waitForQualityGate === true;
      
      // Environment variables for SonarQube
      const sonarUrl = args.sonarUrl || process.env.SONAR_HOST_URL;
      const sonarToken = args.sonarToken || process.env.SONAR_TOKEN;
      
      // Validate required SonarQube configuration
      if (!sonarUrl) {
        throw new ValidationError('SonarQube URL is required. Set SONAR_HOST_URL environment variable or pass sonarUrl parameter.');
      }
      
      if (!sonarToken) {
        throw new ValidationError('SonarQube token is required. Set SONAR_TOKEN environment variable or pass sonarToken parameter.');
      }
      
      // Safe URL cleaning without regex vulnerabilities
      const cleanSonarUrl = sonarUrl.endsWith('/') ? sonarUrl.slice(0, -1) : sonarUrl;
      
      this.logger.info('Starting SonarQube analysis', { 
        projectPath, 
        includeCoverage, 
        waitForQualityGate,
        sonarUrl: cleanSonarUrl
      });

      // Check if sonar-project.properties exists
      const sonarPropsPath = path.join(projectPath, 'sonar-project.properties');
      try {
        await promisify(access)(sonarPropsPath, constants.F_OK);
      } catch {
        throw new ValidationError('sonar-project.properties file not found in project root');
      }

      // Run test coverage if requested
      if (includeCoverage) {
        this.logger.info('Running test coverage before SonarQube analysis');
        const coverageProcess = spawn('npm', ['run', 'test:coverage'], {
          cwd: projectPath,
          stdio: 'pipe'
        });

        await new Promise((resolve) => {
          let stderr = '';
          
          coverageProcess.stderr?.on('data', (data) => {
            stderr += data.toString();
          });
          
          coverageProcess.on('close', (code) => {
            if (code === 0) {
              this.logger.info('Test coverage completed successfully');
              resolve(void 0);
            } else {
              this.logger.warn('Test coverage failed, continuing with SonarQube analysis', { stderr });
              resolve(void 0); // Continue even if tests fail
            }
          });
          
          coverageProcess.on('error', (error) => {
            this.logger.warn('Test coverage process error, continuing with SonarQube analysis', error);
            resolve(void 0); // Continue even if tests fail
          });
        });
      }

      // Prepare SonarQube scanner command
      const sonarCommand = process.platform === 'win32' ? 'sonar-scanner.bat' : 'sonar-scanner';
      const sonarArgs = [
        `-Dsonar.host.url=${sonarUrl}`,
        `-Dsonar.projectBaseDir=${projectPath}`
      ];

      if (sonarToken) {
        sonarArgs.push(`-Dsonar.login=${sonarToken}`);
      }

      if (waitForQualityGate) {
        sonarArgs.push('-Dsonar.qualitygate.wait=true');
      }

      this.logger.info('Executing SonarQube scanner', { command: sonarCommand, args: sonarArgs });

      // Run SonarQube scanner
      const sonarProcess = spawn(sonarCommand, sonarArgs, {
        cwd: projectPath,
        stdio: 'pipe',
        env: {
          ...process.env,
          SONAR_HOST_URL: sonarUrl,
          ...(sonarToken && { SONAR_TOKEN: sonarToken })
        }
      });

      const result = await new Promise<{stdout: string, stderr: string, code: number}>((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        sonarProcess.stdout?.on('data', (data) => {
          const output = data.toString();
          stdout += output;
          this.logger.debug('SonarQube scanner output', { output: output.trim() });
        });
        
        sonarProcess.stderr?.on('data', (data) => {
          const output = data.toString();
          stderr += output;
          this.logger.debug('SonarQube scanner error output', { output: output.trim() });
        });
        
        sonarProcess.on('close', (code) => {
          resolve({ stdout, stderr, code: code ?? 0 });
        });
        
        sonarProcess.on('error', (error) => {
          reject(new Error(`SonarQube scanner process error: ${error.message}`));
        });
      });

      if (result.code === 0) {
        this.logger.info('SonarQube analysis completed successfully');
        
        // Extract key information from output
        const lines = result.stdout.split('\n');
        
        // Safe URL extraction without vulnerable regex
        const analysisLine = lines.find(line => line.includes('ANALYSIS SUCCESSFUL'));
        let dashboardUrl = 'Dashboard URL not found';
        if (analysisLine) {
          const httpIndex = analysisLine.indexOf('http');
          if (httpIndex !== -1) {
            const urlPart = analysisLine.substring(httpIndex);
            const spaceIndex = urlPart.indexOf(' ');
            dashboardUrl = spaceIndex !== -1 ? urlPart.substring(0, spaceIndex) : urlPart;
            // Limit URL length for safety
            dashboardUrl = dashboardUrl.substring(0, 500);
          }
        }
        
        const qualityGateStatus = lines.find(line => line.includes('Quality Gate'))?.trim() ?? 'Quality Gate status not available';
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              message: 'SonarQube analysis completed successfully',
              status: 'success',
              projectPath,
              sonarUrl,
              includedCoverage: includeCoverage,
              qualityGateWaited: waitForQualityGate,
              dashboardUrl: dashboardUrl,
              qualityGateStatus,
              summary: {
                exitCode: result.code,
                outputLines: result.stdout.split('\n').length,
                errorLines: result.stderr.split('\n').filter(line => line.trim()).length
              }
            }, null, 2)
          }]
        };
      } else {
        this.logger.error('SonarQube analysis failed', { 
          exitCode: result.code, 
          stderr: result.stderr,
          stdout: result.stdout 
        });
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              message: 'SonarQube analysis failed',
              status: 'failed',
              exitCode: result.code,
              error: result.stderr,
              output: result.stdout
            }, null, 2)
          }]
        };
      }
      
    } catch (error: any) {
      this.logger.error('SonarQube analysis error', error);
      throw new ValidationError(`SonarQube analysis failed: ${error.message}`);
    }
  }
}







