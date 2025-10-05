import { 
  ApiInfo
} from '../types';
import { AzureClient } from './azure-client';
import { ILogger, IApiManagementService } from '../interfaces';
import { ValidationError, NotFoundError } from '../utils/errors';
import { 
  isValidApiId,
  sanitizeApiPath
} from '../utils/validation';

/**
 * API Management Service
 * Handles core API operations: listing, getting details, and creating APIs from YAML
 */
export class ApiManagementService implements IApiManagementService {
  private readonly azureClient: AzureClient;
  private readonly logger: ILogger;

  constructor(azureClient: AzureClient, logger: ILogger) {
    this.azureClient = azureClient;
    this.logger = logger;
  }

  /**
   * List all APIs in the API Management instance
   */
  public async listApis(options?: {
    filter?: string;
    top?: number;
    skip?: number;
  }): Promise<any[]> {
    try {
      this.logger.info('Listing APIs', options);
      
      const client = this.azureClient.getClient();
      const queryOptions: any = {};
      
      if (options?.filter) queryOptions.$filter = options.filter;
      if (options?.top) queryOptions.$top = options.top;
      if (options?.skip) queryOptions.$skip = options.skip;

      const result = client.api.listByService(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        queryOptions
      );

      const apis: ApiInfo[] = [];
      
      for await (const api of result) {
        apis.push(this.mapAzureApiToApiInfo(api));
      }

      this.logger.info(`Found ${apis.length} APIs`);
      return apis;
    } catch (error: any) {
      this.logger.error('Failed to list APIs', error);
      throw error;
    }
  }

  /**
   * Get a specific API by ID
   */
  public async getApi(apiId: string): Promise<ApiInfo> {
    try {
      if (!isValidApiId(apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Getting API', { apiId });
      
      const client = this.azureClient.getClient();
      const api = await client.api.get(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        apiId
      );

      return this.mapAzureApiToApiInfo(api);
    } catch (error: any) {
      if (error?.statusCode === 404) {
        throw new NotFoundError(`API with ID '${apiId}' not found`);
      }
      this.logger.error('Failed to get API', error);
      throw error;
    }
  }

  /**
   * Create a new API from YAML/OpenAPI contract with optional versioning
   */
  public async createApiFromYaml(params: {
    apiId: string;
    displayName: string;
    description?: string;
    path?: string;
    serviceUrl?: string;
    yamlContract: string;
    protocols?: string[];
    subscriptionRequired?: boolean;
    initialVersion?: string;
    versioningScheme?: 'Segment' | 'Query' | 'Header';
    versionQueryName?: string;
    versionHeaderName?: string;
  }): Promise<ApiInfo> {
    try {
      if (!isValidApiId(params.apiId)) {
        throw new ValidationError('Invalid API ID format');
      }

      this.logger.info('Creating API from YAML contract with versioning', { 
        apiId: params.apiId, 
        displayName: params.displayName,
        initialVersion: params.initialVersion
      });

      const client = this.azureClient.getClient();

      // Validate YAML content
      if (!params.yamlContract || params.yamlContract.trim().length === 0) {
        throw new ValidationError('YAML contract cannot be empty');
      }

      // Extract backend URL from YAML contract
      let backendUrl = params.serviceUrl;
      try {
        // Parse YAML to extract server URL
        const yamlLines = params.yamlContract.split('\n');
        for (let i = 0; i < yamlLines.length; i++) {
          const line = yamlLines[i];
          if (line.includes('servers:')) {
            // Look for the first URL in servers section
            for (let j = i + 1; j < yamlLines.length; j++) {
              const urlLine = yamlLines[j];
              const urlMatch = /^\s*-\s*url:\s*([^\s]+(?:\s+[^\s]+)*)\s*$/.exec(urlLine);
              if (urlMatch) {
                backendUrl = urlMatch[1].trim();
                this.logger.info('Extracted backend URL from YAML contract', { backendUrl });
                break;
              }
              // Stop if we hit another section
              if (/^[a-zA-Z0-9_][a-zA-Z0-9_]*:/.exec(urlLine)) {
                break;
              }
            }
            break;
          }
        }
      } catch (error: any) {
        this.logger.warn('Failed to extract backend URL from YAML contract, using provided serviceUrl', error);
      }

      // Create backend service if we have a backend URL
      let backendId: string | undefined;
      if (backendUrl) {
        backendId = `${params.apiId}-backend`;
        try {
          const backendParams = {
            title: `${params.displayName} Backend`,
            description: `Backend service for ${params.displayName}`,
            url: backendUrl,
            protocol: 'http', // Azure APIM backend protocol is always 'http'
            properties: {
              serviceFabricCluster: undefined,
              skipCertificateChainValidation: false,
              skipCertificateNameValidation: false
            }
          };

          await client.backend.createOrUpdate(
            process.env.AZURE_APIM_RESOURCE_GROUP!,
            process.env.AZURE_APIM_SERVICE_NAME!,
            backendId,
            backendParams
          );
          
          this.logger.info('Backend service created successfully', { 
            backendId,
            backendUrl
          });
        } catch (error: any) {
          this.logger.warn('Failed to create backend service, using direct service URL', error);
          backendId = undefined;
        }
      }

      // If versioning is requested, create API version set first
      let apiVersionSetId: string | undefined;
      if (params.initialVersion) {
        const versionSetParams = {
          displayName: `${params.displayName} Version Set`,
          description: `Version set for ${params.displayName}`,
          versioningScheme: params.versioningScheme ?? 'Segment',
          versionQueryName: params.versionQueryName,
          versionHeaderName: params.versionHeaderName
        };

        try {
          const versionSet = await client.apiVersionSet.createOrUpdate(
            process.env.AZURE_APIM_RESOURCE_GROUP!,
            process.env.AZURE_APIM_SERVICE_NAME!,
            `${params.apiId}-version-set`,
            versionSetParams
          );
          apiVersionSetId = versionSet.id;
          
          this.logger.info('API Version Set created', { 
            versionSetId: apiVersionSetId,
            versioningScheme: params.versioningScheme
          });
        } catch (error: any) {
          this.logger.warn('Failed to create version set, creating API without versioning', error);
          // Continue without versioning if version set creation fails
        }
      }

      // Prepare API creation parameters with proper import settings
      const apiCreateParams: any = {
        displayName: params.displayName,
        description: params.description ?? `API created from YAML contract`,
        path: sanitizeApiPath(params.path ?? params.apiId),
        protocols: params.protocols || ['https'],
        serviceUrl: backendUrl ?? params.serviceUrl, // Use extracted URL or fallback
        subscriptionRequired: params.subscriptionRequired !== false,
        // Import from YAML/OpenAPI specification
        value: params.yamlContract,
        format: 'openapi' as const,
        apiType: 'http' as const,
        // Ensure operations are imported from the specification
        import: true
      };

      // Add versioning information if provided
      if (params.initialVersion && apiVersionSetId) {
        apiCreateParams.apiVersion = params.initialVersion;
        apiCreateParams.apiVersionSetId = apiVersionSetId;
        
        // Adjust path for versioned API if using Segment versioning
        if (params.versioningScheme === 'Segment' || !params.versioningScheme) {
          const basePath = sanitizeApiPath(params.path ?? params.apiId);
          apiCreateParams.path = `${basePath}/${params.initialVersion}`;
        }
      }

      const result = await client.api.beginCreateOrUpdateAndWait(
        process.env.AZURE_APIM_RESOURCE_GROUP!,
        process.env.AZURE_APIM_SERVICE_NAME!,
        params.apiId,
        apiCreateParams
      );

      // Configure API policies to use the backend service if created
      if (backendId) {
        try {
          const backendPolicy = `
<policies>
  <inbound>
    <base />
    <set-backend-service backend-id="${backendId}" />
  </inbound>
  <backend>
    <base />
  </backend>
  <outbound>
    <base />
  </outbound>
  <on-error>
    <base />
  </on-error>
</policies>`;

          await client.apiPolicy.createOrUpdate(
            process.env.AZURE_APIM_RESOURCE_GROUP!,
            process.env.AZURE_APIM_SERVICE_NAME!,
            params.apiId,
            'policy', // policyId parameter
            {
              value: backendPolicy,
              format: 'xml'
            }
          );
          
          this.logger.info('API policies configured to use backend service', { 
            apiId: params.apiId,
            backendId
          });
        } catch (error: any) {
          this.logger.warn('Failed to configure API policies for backend service', error);
        }
      }

      const createdApi = this.mapAzureApiToApiInfo(result);
      
      this.logger.info('API created successfully from YAML with versioning and backend service', { 
        apiId: params.apiId,
        displayName: params.displayName,
        version: params.initialVersion,
        versionSetId: apiVersionSetId,
        backendId: backendId,
        backendUrl: backendUrl
      });
      
      return createdApi;

    } catch (error: any) {
      this.logger.error('Failed to create API from YAML with versioning', error);
      
      // Handle specific Azure API Management errors
      if (error.statusCode === 400) {
        throw new ValidationError(`Invalid API configuration or YAML contract: ${error.message}`);
      } else if (error.statusCode === 409) {
        throw new ValidationError(`API with ID '${params.apiId}' already exists`);
      }

      throw error;
    }
  }

  /**
   * Map Azure API object to our ApiInfo interface
   */
  private mapAzureApiToApiInfo(azureApi: any): ApiInfo {
    return {
      id: azureApi.name || '',
      name: azureApi.name || '',
      displayName: azureApi.displayName || '',
      description: azureApi.description,
      path: azureApi.path || '',
      protocols: azureApi.protocols || [],
      serviceUrl: azureApi.serviceUrl,
      apiVersion: azureApi.apiVersion,
      apiVersionSetId: azureApi.apiVersionSetId,
      isCurrent: azureApi.isCurrent,
      isOnline: azureApi.isOnline,
      type: azureApi.type,
      subscriptionRequired: azureApi.subscriptionRequired,
      authenticationSettings: azureApi.authenticationSettings
    };
  }
}