import { McpResourceDefinition, McpResourceRequest, McpResourceResponse } from '../types';
import { ApimService } from '../services';
import { Logger } from '../utils/logger';
import { ValidationError, createErrorResponse } from '../utils/errors';
import { validateMcpResourceRequest } from '../utils/validation';

export class ResourcesHandler {
  private apimService: ApimService;
  private logger: Logger;

  constructor(apimService: ApimService) {
    this.apimService = apimService;
    this.logger = new Logger('ResourcesHandler');
  }

  /**
   * Get list of available resources
   */
  public getAvailableResources(): McpResourceDefinition[] {
    return [
      {
        uri: 'apim://apis',
        name: 'API List',
        description: 'List of all APIs in Azure API Management',
        mimeType: 'application/json'
      },
      {
        uri: 'apim://api/{apiId}',
        name: 'API Details',
        description: 'Detailed information about a specific API',
        mimeType: 'application/json'
      },
      {
        uri: 'apim://api/{apiId}/versions',
        name: 'API Versions',
        description: 'List of versions for a specific API',
        mimeType: 'application/json'
      },
      {
        uri: 'apim://api/{apiId}/revisions',
        name: 'API Revisions',
        description: 'List of revisions for a specific API',
        mimeType: 'application/json'
      },
      {
        uri: 'apim://service/info',
        name: 'Service Information',
        description: 'Information about the Azure API Management service',
        mimeType: 'application/json'
      }
    ];
  }

  /**
   * Get a specific resource
   */
  public async getResource(request: McpResourceRequest): Promise<McpResourceResponse> {
    try {
      // Validate the request
      validateMcpResourceRequest(request);

      this.logger.info('Getting resource', { uri: request.uri });

      const uri = request.uri;
      const uriParts = uri.replace('apim://', '').split('/');

      switch (uriParts[0]) {
        case 'apis':
          return await this.handleGetApisList();
        
        case 'api':
          return await this.handleGetApiResource(uriParts);
        
        case 'service':
          return await this.handleGetServiceResource(uriParts);
        
        default:
          throw new ValidationError(`Unknown resource type: ${uriParts[0]}`);
      }
    } catch (error: any) {
      this.logger.error('Resource retrieval failed', error);
      
      const errorResponse = createErrorResponse(error);
      return {
        contents: [{
          uri: request.uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            error: errorResponse.message,
            code: errorResponse.code
          })
        }]
      };
    }
  }

  private async handleGetApisList(): Promise<McpResourceResponse> {
    const apis = await this.apimService.listApis();
    
    return {
      contents: [{
        uri: 'apim://apis',
        mimeType: 'application/json',
        text: JSON.stringify({
          apis: apis.map(api => ({
            id: api.id,
            name: api.name,
            displayName: api.displayName,
            description: api.description,
            path: api.path,
            protocols: api.protocols,
            serviceUrl: api.serviceUrl,
            subscriptionRequired: api.subscriptionRequired,
            apiVersion: api.apiVersion
          }))
        }, null, 2)
      }]
    };
  }

  private async handleGetApiResource(uriParts: string[]): Promise<McpResourceResponse> {
    if (uriParts.length < 2) {
      throw new ValidationError('API ID is required');
    }

    const apiId = uriParts[1];
    const resourceType = uriParts[2];

    if (!resourceType) {
      // Get API details
      const api = await this.apimService.getApi(apiId);
      
      return {
        contents: [{
          uri: `apim://api/${apiId}`,
          mimeType: 'application/json',
          text: JSON.stringify({
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
              type: api.type,
              authenticationSettings: api.authenticationSettings
            }
          }, null, 2)
        }]
      };
    }

    switch (resourceType) {
      case 'revisions':
        return await this.handleGetApiRevisions(apiId);
      
      default:
        throw new ValidationError(`Unknown API resource type: ${resourceType}`);
    }
  }

  private async handleGetApiRevisions(apiId: string): Promise<McpResourceResponse> {
    const revisions = await this.apimService.listApiRevisions(apiId);
    
    return {
      contents: [{
        uri: `apim://api/${apiId}/revisions`,
        mimeType: 'application/json',
        text: JSON.stringify({
          apiId,
          revisions: revisions.map(revision => ({
            id: revision.id,
            apiRevision: revision.apiRevision,
            description: revision.description,
            isCurrent: revision.isCurrent,
            isOnline: revision.isOnline,
            privateUrl: revision.privateUrl,
            createdDateTime: revision.createdDateTime,
            updatedDateTime: revision.updatedDateTime
          }))
        }, null, 2)
      }]
    };
  }

  private async handleGetServiceResource(uriParts: string[]): Promise<McpResourceResponse> {
    if (uriParts[1] === 'info') {
      // Get service information using environment variables
      const serviceInfo = {
        name: process.env.AZURE_APIM_SERVICE_NAME,
        resourceGroup: process.env.AZURE_APIM_RESOURCE_GROUP,
        subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
        status: 'Connected'
      };
      
      return {
        contents: [{
          uri: 'apim://service/info',
          mimeType: 'application/json',
          text: JSON.stringify({
            service: serviceInfo
          }, null, 2)
        }]
      };
    }

    throw new ValidationError(`Unknown service resource: ${uriParts[1]}`);
  }
}