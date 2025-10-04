import { AzureClient } from './azure-client';
import { ILogger, ISubscriptionsManagementService } from '../interfaces';
import { ValidationError, NotFoundError } from '../utils/errors';

/**
 * Subscriptions Management Service
 * Handles subscription operations: listing, creating, and getting subscription details
 */
export class SubscriptionsManagementService implements ISubscriptionsManagementService {
  private azureClient: AzureClient;
  private logger: ILogger;

  constructor(azureClient: AzureClient, logger: ILogger) {
    this.azureClient = azureClient;
    this.logger = logger;
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
      throw error;
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
      this.logger.error('Failed to create subscription', { subscriptionData: params, error });
      
      if (error.statusCode === 400) {
        throw new ValidationError(`Invalid subscription parameters: ${error.message}`);
      } else if (error.statusCode === 404) {
        throw new NotFoundError(`Product '${params.productId}' not found`);
      } else if (error.statusCode === 409) {
        throw new ValidationError(`Subscription with ID '${params.subscriptionId}' already exists`);
      }
      
      throw error;
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
      this.logger.error('Failed to get subscription', { subscriptionId, error });
      
      if (error.statusCode === 404) {
        throw new NotFoundError(`Subscription '${subscriptionId}' not found`);
      }
      
      throw error;
    }
  }
}