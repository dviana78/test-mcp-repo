import { 
  ApiOperationInfo
} from '../types/index.js';
import { AzureClient } from './azure-client.js';
import { ILogger, IApiOperationsService } from '../interfaces/index.js';
import { ValidationError } from '../utils/errors.js';
import { isValidApiId } from '../utils/validation.js';

/**
 * API Operations Service
 * Handles API operations management: getting operations/endpoints for specific APIs
 */
export class ApiOperationsService implements IApiOperationsService {
  private readonly azureClient: AzureClient;
  private readonly logger: ILogger;

  constructor(azureClient: AzureClient, logger: ILogger) {
    this.azureClient = azureClient;
    this.logger = logger;
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
          id: operation.name ?? '',
          name: operation.name ?? '',
          displayName: operation.displayName ?? '',
          method: operation.method ?? '',
          urlTemplate: operation.urlTemplate ?? '',
          description: operation.description,
          policies: operation.policies
        });
      }

      this.logger.info(`Found ${operations.length} API operations`);
      return operations;
    } catch (error: any) {
      this.logger.error('Failed to get API operations', error);
      
      // Re-throw validation errors as-is
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw error;
    }
  }
}







