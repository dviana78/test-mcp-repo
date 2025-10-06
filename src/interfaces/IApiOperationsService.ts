import { ApiOperationInfo } from '../types/index.js';

/**
 * Interface for API Operations Service
 * Handles API operations management: getting operations/endpoints for specific APIs
 */
export interface IApiOperationsService {
  /**
   * Get all operations for a specific API
   * @param apiId - The ID of the API to get operations for
   * @returns Promise resolving to list of API operations
   */
  getApiOperations(apiId: string): Promise<ApiOperationInfo[]>;
}







