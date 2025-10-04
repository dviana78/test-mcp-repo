import { 
  ApiVersion, 
  ApiRevision, 
  CreateApiVersionRequest, 
  CreateApiRevisionRequest
} from '../types';

/**
 * Interface for API Versioning Service
 * Handles API versioning and revision operations
 */
export interface IApiVersioningService {
  /**
   * Create a new version of an existing API
   * @param request - API version creation parameters
   * @returns Promise resolving to created API version details
   */
  createApiVersion(request: CreateApiVersionRequest): Promise<ApiVersion>;

  /**
   * List all versions of a specific API
   * @param apiId - The ID of the API to list versions for
   * @returns Promise resolving to list of API versions
   */
  listApiVersions(apiId: string): Promise<ApiVersion[]>;

  /**
   * Create a new revision of an existing API
   * @param request - API revision creation parameters
   * @returns Promise resolving to created API revision details
   */
  createApiRevision(request: CreateApiRevisionRequest): Promise<ApiRevision>;

  /**
   * List all revisions of a specific API
   * @param apiId - The ID of the API to list revisions for
   * @returns Promise resolving to list of API revisions
   */
  listApiRevisions(apiId: string): Promise<ApiRevision[]>;
}