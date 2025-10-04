/**
 * Interface for Subscriptions Management Service
 * Handles subscription operations: listing, creating, and getting subscription details
 */
export interface ISubscriptionsManagementService {
  /**
   * List all subscriptions
   * @param filter - Optional OData filter expression
   * @param top - Maximum number of subscriptions to return
   * @param skip - Number of subscriptions to skip
   * @returns Promise resolving to list of subscriptions
   */
  listSubscriptions(filter?: string, top?: number, skip?: number): Promise<any[]>;

  /**
   * Create a new subscription
   * @param params - Subscription creation parameters
   * @returns Promise resolving to created subscription details
   */
  createSubscription(params: {
    subscriptionId: string;
    displayName: string;
    productId: string;
    userId?: string;
    primaryKey?: string;
    secondaryKey?: string;
    state?: string;
  }): Promise<any>;

  /**
   * Get subscription details by ID
   * @param subscriptionId - The ID of the subscription to retrieve
   * @returns Promise resolving to subscription details
   */
  getSubscription(subscriptionId: string): Promise<any>;
}