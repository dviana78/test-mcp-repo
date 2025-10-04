import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { 
  AzureClient,
  ApiManagementService,
  ApiVersioningService,
  GrpcService,
  ProductsManagementService,
  SubscriptionsManagementService,
  ApiOperationsService,
  BackendServicesService
} from './services';
import { ToolsHandler } from './handlers';
import { getAzureConfig } from './config/azure';
import { Logger } from './utils/logger';
import { createErrorResponse } from './utils/errors';

export class McpServer {
  private server: Server;
  private azureClient!: AzureClient;
  
  // Specialized services
  private apiManagementService!: ApiManagementService;
  private apiVersioningService!: ApiVersioningService;
  private grpcService!: GrpcService;
  private productsManagementService!: ProductsManagementService;
  private subscriptionsManagementService!: SubscriptionsManagementService;
  private apiOperationsService!: ApiOperationsService;
  private backendServicesService!: BackendServicesService;
  
  private toolsHandler!: ToolsHandler;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('McpServer');
    this.server = new Server({
      name: 'azure-apim-mcp-server',
      version: '1.0.0',
    });

    this.setupHandlers();
  }

  private async initializeServices(): Promise<void> {
    try {
      const azureConfig = getAzureConfig();
      this.azureClient = new AzureClient(azureConfig);
      
      // Initialize specialized services
      const logger = new Logger('SpecializedServices');
      this.apiManagementService = new ApiManagementService(this.azureClient, logger);
      this.apiVersioningService = new ApiVersioningService(this.azureClient, logger);
      this.grpcService = new GrpcService(this.azureClient, logger);
      this.productsManagementService = new ProductsManagementService(this.azureClient, logger);
      this.subscriptionsManagementService = new SubscriptionsManagementService(this.azureClient, logger);
      this.apiOperationsService = new ApiOperationsService(this.azureClient, logger);
      this.backendServicesService = new BackendServicesService(this.azureClient, logger);
      
      // Initialize handlers with direct service injection
      this.toolsHandler = new ToolsHandler(
        this.apiManagementService,
        this.apiVersioningService,
        this.grpcService,
        this.productsManagementService,
        this.subscriptionsManagementService,
        this.apiOperationsService,
        this.backendServicesService
      );
      // Note: ResourcesHandler removed as it depended on the coordinator service
      // If needed, it should be refactored to use specialized services directly

      // Test Azure connection
      await this.azureClient.testConnection();
      this.logger.info('Services initialized successfully with direct service injection');
    } catch (error) {
      this.logger.error('Failed to initialize services', error as Error);
      throw error;
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      if (!this.toolsHandler) {
        await this.initializeServices();
      }

      return {
        tools: this.toolsHandler.getAvailableTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.toolsHandler) {
        await this.initializeServices();
      }

      try {
        const result = await this.toolsHandler.executeTool({
          name: request.params.name,
          arguments: request.params.arguments || {},
        });
        
        return result as any;
      } catch (error: any) {
        this.logger.error('Failed to execute tool', error);
        const errorResponse = createErrorResponse(error);
        throw new McpError(ErrorCode.InternalError, errorResponse.message);
      }
    });
  }

  public async run(): Promise<void> {
    try {
      this.logger.info('Starting Azure APIM MCP Server');

      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      this.logger.info('Azure APIM MCP Server started successfully');
    } catch (error) {
      this.logger.error('Failed to start server', error as Error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.server.close();
      this.logger.info('Server stopped');
    } catch (error) {
      this.logger.error('Error stopping server', error as Error);
    }
  }
}

// Handle graceful shutdown
function setupGracefulShutdown(server: McpServer): void {
  const handleShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    await server.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGQUIT', () => handleShutdown('SIGQUIT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

export { setupGracefulShutdown };