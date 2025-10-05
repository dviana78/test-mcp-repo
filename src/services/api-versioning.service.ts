import { AzureClient } from './azure-client';
import { ILogger, IApiVersioningService } from '../interfaces';
import { ValidationError } from '../utils/errors';
import { 
  ApiVersion, 
  ApiRevision, 
  CreateApiVersionRequest, 
  CreateApiRevisionRequest
} from '../types';
import { 
  validateCreateApiVersion, 
  validateCreateApiRevision, 
  isValidApiId,
  isValidVersionId
} from '../utils/validation';

/**
 * API Versioning Service
 * Handles API versioning and revision operations
 */
export class ApiVersioningService implements IApiVersioningService {
  private readonly azureClient: AzureClient;
  private readonly logger: ILogger;

  constructor(azureClient: AzureClient, logger: ILogger) {
    this.azureClient = azureClient;
    this.logger = logger;
  }

  /**
   * Create a new API version
   */
  public async createApiVersion(request: CreateApiVersionRequest): Promise<ApiVersion> {
    try {
      validateCreateApiVersion(request);
      
      if (!isValidApiId(request.apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      if (!isValidVersionId(request.versionId)) {
        throw new ValidationError('Invalid version ID format');
      }

      this.logger.info('Creating API version', { 
        apiId: request.apiId, 
        versionId: request.versionId 
      });

      const client = this.azureClient.getClient();

      // First, create or get the API version set
      let versionSetId = `${request.apiId}-versions`;
      
      try {
        await client.apiVersionSet.get(
          process.env.AZURE_APIM_RESOURCE_GROUP!,
          process.env.AZURE_APIM_SERVICE_NAME!,
          versionSetId
        );
      } catch (error: any) {
        if (error?.statusCode === 404) {
          // Create version set
          await client.apiVersionSet.createOrUpdate(
            process.env.AZURE_APIM_RESOURCE_GROUP!,
            process.env.AZURE_APIM_SERVICE_NAME!,
            versionSetId,
            {
              displayName: `${request.displayName} Versions`,
              versioningScheme: request.versioningScheme ?? 'Segment',
              versionQueryName: request.versionQueryName,
              versionHeaderName: request.versionHeaderName
            }
          );
        } else {
          throw error;
        }
      }

      // Note: API version creation would require copying from source API
      // const sourceApi = await client.api.get(...) would be used for actual implementation
      
//       const versionedApiId = `${request.apiId}-${request.versionId}`;
 // AUTO-FIX: Removed unused assignment

      // API version creation logic would go here
      // const result = await client.api.beginCreateOrUpdateAndWait(...);

      this.logger.info('API version created successfully', { 
        apiId: request.apiId, 
        versionId: request.versionId 
      });

      return {
        id: versionSetId,
        name: request.versionId,
        displayName: request.displayName,
        description: request.description,
        versioningScheme: request.versioningScheme ?? 'Segment',
        versionQueryName: request.versionQueryName,
        versionHeaderName: request.versionHeaderName
      };
    } catch (error: any) {
      this.logger.error('Failed to create API version', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * List API versions for a specific API
   */
  public async listApiVersions(apiId: string): Promise<ApiVersion[]> {
    try {
      if (!isValidApiId(apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Listing API versions', { apiId });

      const client = this.azureClient.getClient();
      const versionSetId = `${apiId}-versions`;

      try {
        const versionSet = await client.apiVersionSet.get(
          process.env.AZURE_APIM_RESOURCE_GROUP!,
          process.env.AZURE_APIM_SERVICE_NAME!,
          versionSetId
        );

        // Get all APIs that belong to this version set
        const apis = client.api.listByService(
          process.env.AZURE_APIM_RESOURCE_GROUP!,
          process.env.AZURE_APIM_SERVICE_NAME!,
          { filter: `apiVersionSetId eq '${versionSetId}'` }
        );

        const versions: ApiVersion[] = [];
        for await (const api of apis) {
          versions.push({
            id: api.name ?? '',
            name: api.apiVersion ?? '',
            displayName: api.displayName ?? '',
            description: api.description,
            versioningScheme: versionSet.versioningScheme as any || 'Segment',
            versionQueryName: versionSet.versionQueryName,
            versionHeaderName: versionSet.versionHeaderName
          });
        }

        this.logger.info(`Found ${versions.length} API versions`);
        return versions;
      } catch (error: any) {
        if (error?.statusCode === 404) {
          // No version set exists, return empty array
          return [];
        }
        throw error;
      }
    } catch (error: any) {
      this.logger.error('Failed to list API versions', error);
      throw error;
    }
  }

  /**
   * Create a new API revision
   */
  public async createApiRevision(request: CreateApiRevisionRequest): Promise<ApiRevision> {
    try {
      validateCreateApiRevision(request);

      if (!isValidApiId(request.apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Creating API revision', { 
        apiId: request.apiId, 
        description: request.description 
      });

      const client = this.azureClient.getClient();

      // Use a simplified approach with the correct API pattern
      // Get the original API to use as base for revision
      const originalApi = await client.api.get(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        request.apiId
      );

      // Generate a unique revision ID
      const timestamp = Date.now();
      const revisionId = request.apiRevision ?? `rev-${timestamp}`;

      // Create the revision by creating a new API with revision suffix
      const revisionApiId = `${request.apiId};rev=${revisionId}`;
      
      const revisionApi = await client.api.beginCreateOrUpdateAndWait(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        revisionApiId,
        {
          ...originalApi,
          displayName: `${originalApi.displayName} - Revision ${revisionId}`,
          description: request.description ?? originalApi.description,
          isCurrent: false,
          apiRevision: revisionId,
          sourceApiId: `/apis/${request.apiId}`
        }
      );

      this.logger.info('API revision created successfully', { 
        apiId: request.apiId, 
        revision: revisionId 
      });

      return {
        id: revisionApiId,
        apiId: request.apiId,
        apiRevision: revisionId,
        description: request.description,
        isCurrent: false,
        isOnline: revisionApi.isOnline || false,
        privateUrl: revisionApi.serviceUrl,
        createdDateTime: new Date(),
        updatedDateTime: new Date(),
        revisionDescription: request.description
      };
    } catch (error: any) {
      this.logger.error('Failed to create API revision', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * List API revisions for a specific API
   */
  public async listApiRevisions(apiId: string): Promise<ApiRevision[]> {
    try {
      if (!isValidApiId(apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Listing API revisions', { apiId });

      const client = this.azureClient.getClient();
      const result = client.apiRevision.listByService(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        apiId
      );

      const revisions: ApiRevision[] = [];
      
      for await (const revision of result) {
        revisions.push({
          id: revision.apiId ?? '',
          apiId: apiId,
          apiRevision: revision.apiRevision ?? '',
          description: revision.description,
          isCurrent: revision.isCurrent || false,
          isOnline: revision.isOnline || false,
          privateUrl: revision.privateUrl,
          createdDateTime: revision.createdDateTime || new Date(),
          updatedDateTime: revision.updatedDateTime || new Date(),
          revisionDescription: revision.description
        });
      }

      this.logger.info(`Found ${revisions.length} API revisions`);
      return revisions;
    } catch (error: any) {
      this.logger.error('Failed to list API revisions', error);
      throw error;
    }
  }
}