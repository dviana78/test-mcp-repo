import { ApiManagementClient } from '@azure/arm-apimanagement';
import { ClientSecretCredential } from '@azure/identity';
import { AzureConfig } from '../types';
import { Logger } from '../utils/logger';
import { AzureApiError, AuthenticationError } from '../utils/errors';

export class AzureClient {
  private readonly client: ApiManagementClient;
  private readonly config: AzureConfig;
  private readonly logger: Logger;

  constructor(config: AzureConfig) {
    this.config = config;
    this.logger = new Logger('AzureClient');
    
    try {
      const credential = new ClientSecretCredential(
        config.tenantId,
        config.clientId,
        config.clientSecret
      );

      this.client = new ApiManagementClient(credential, config.subscriptionId);
      this.logger.info('Azure client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Azure client', error as Error);
      throw new AuthenticationError('Failed to initialize Azure client', { error });
    }
  }

  /**
   * Get the API Management client instance
   */
  public getClient(): ApiManagementClient {
    return this.client;
  }

  /**
   * Test the connection to Azure API Management
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.client.apiManagementService.get(
        this.config.resourceGroupName,
        this.config.serviceName
      );
      this.logger.info('Azure connection test successful');
      return true;
    } catch (error: any) {
      this.logger.error('Azure connection test failed', error);
      throw new AzureApiError(
        'Failed to connect to Azure API Management',
        error?.statusCode || 500,
        { error: error?.message }
      );
    }
  }

  /**
   * Get Azure API Management service information
   */
  public async getServiceInfo() {
    try {
      const service = await this.client.apiManagementService.get(
        this.config.resourceGroupName,
        this.config.serviceName
      );
      
      return {
        name: service.name,
        location: service.location,
        sku: service.sku,
        publisherName: service.publisherName,
        publisherEmail: service.publisherEmail,
        gatewayUrl: service.gatewayUrl,
        managementApiUrl: service.managementApiUrl,
        portalUrl: service.portalUrl,
        scmUrl: service.scmUrl
      };
    } catch (error: any) {
      this.logger.error('Failed to get service info', error);
      throw new AzureApiError(
        'Failed to retrieve Azure API Management service information',
        error?.statusCode || 500,
        { error: error?.message }
      );
    }
  }

  /**
   * Handle Azure REST API errors with proper error mapping
   */
  public handleAzureError(error: any): never {
    const statusCode = error?.statusCode || error?.status || 500;
    let message = 'Azure API request failed';

    if (error?.message) {
      message = error.message;
    } else if (error?.body?.message) {
      message = error.body.message;
    }

    // Map common Azure error codes
    switch (statusCode) {
      case 401:
        throw new AuthenticationError(message, { originalError: error });
      case 403:
        throw new AzureApiError('Access forbidden', 403, { originalError: error });
      case 404:
        throw new AzureApiError('Resource not found', 404, { originalError: error });
      case 429:
        throw new AzureApiError('Rate limit exceeded', 429, { originalError: error });
      case 500:
        throw new AzureApiError('Internal server error', 500, { originalError: error });
      default:
        throw new AzureApiError(message, statusCode, { originalError: error });
    }
  }

  /**
   * Retry wrapper for Azure API calls with exponential backoff
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Don't retry on authentication or client errors
        if (error?.statusCode >= 400 && error?.statusCode < 500) {
          throw error;
        }

        if (attempt === maxRetries) {
          this.logger.error(`Operation failed after ${maxRetries} attempts`, lastError);
          break;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, { error: error?.message });
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}