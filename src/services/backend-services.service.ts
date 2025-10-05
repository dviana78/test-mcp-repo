import { 
  BackendInfo
} from '../types';
import { AzureClient } from './azure-client';
import { ILogger, IBackendServicesService } from '../interfaces';

/**
 * Backend Services Service
 * Handles backend services management: listing backend services in Azure APIM
 */
export class BackendServicesService implements IBackendServicesService {
  private readonly azureClient: AzureClient;
  private readonly logger: ILogger;

  constructor(azureClient: AzureClient, logger: ILogger) {
    this.azureClient = azureClient;
    this.logger = logger;
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
          id: backend.name ?? '',
          title: backend.title ?? '',
          description: backend.description,
          url: backend.url ?? '',
          protocol: backend.protocol ?? '',
          resourceId: backend.resourceId,
          properties: backend.properties
        });
      }

      this.logger.info(`Found ${backends.length} backend services`);
      return backends;
    } catch (error: any) {
      this.logger.error('Failed to list backend services', error);
      throw error;
    }
  }
}