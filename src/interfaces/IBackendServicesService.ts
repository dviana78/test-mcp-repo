import { BackendInfo } from '../types/index.js';

/**
 * Interface for Backend Services Service
 * Handles backend services management: listing backend services in Azure APIM
 */
export interface IBackendServicesService {
  /**
   * List all backend services in the API Management instance
   * @param options - Optional filtering and pagination options
   * @returns Promise resolving to list of backend services
   */
  listBackends(options?: {
    filter?: string;
    top?: number;
    skip?: number;
  }): Promise<BackendInfo[]>;
}







