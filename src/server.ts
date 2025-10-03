import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { AzureClient, ApimService } from './services';
import { ToolsHandler, ResourcesHandler } from './handlers';
import { getAzureConfig } from './config/azure';
import { Logger } from './utils/logger';
import { createErrorResponse } from './utils/errors';

export class McpServer {
  private server: Server;
  private azureClient!: AzureClient;
  private apimService!: ApimService;
  private toolsHandler!: ToolsHandler;
  private resourcesHandler!: ResourcesHandler;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('McpServer');
    this.server = new Server(
      {
        name: 'azure-apim-mcp-server',
        version: '1.0.0',
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async initializeServices(): Promise<void> {
    try {
      const azureConfig = getAzureConfig();
      this.azureClient = new AzureClient(azureConfig);
      this.apimService = new ApimService(this.azureClient);
      this.toolsHandler = new ToolsHandler(this.apimService);
      this.resourcesHandler = new ResourcesHandler(this.apimService);

      // Test Azure connection
      await this.azureClient.testConnection();
      this.logger.info('Services initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize services', error as Error);
      throw error;
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      if (!this.resourcesHandler) {
        await this.initializeServices();
      }
      
      return {
        resources: this.resourcesHandler.getAvailableResources(),
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      if (!this.resourcesHandler) {
        await this.initializeServices();
      }

      try {
        const result = await this.resourcesHandler.getResource({ uri: request.params.uri });
        return result as any;
      } catch (error: any) {
        this.logger.error('Failed to read resource', error);
        const errorResponse = createErrorResponse(error);
        throw new McpError(ErrorCode.InternalError, errorResponse.message);
      }
    });

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