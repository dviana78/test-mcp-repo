export interface AzureConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  subscriptionId: string;
  resourceGroupName: string;
  serviceName: string;
}

export interface ApiInfo {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  path: string;
  protocols: string[];
  serviceUrl?: string;
  apiVersion?: string;
  apiVersionSetId?: string;
  isCurrent?: boolean;
  isOnline?: boolean;
  type?: 'http' | 'soap' | 'websocket' | 'graphql';
  subscriptionRequired?: boolean;
  authenticationSettings?: AuthenticationSettings;
}

export interface AuthenticationSettings {
  oAuth2?: OAuth2Settings;
  openid?: OpenIdSettings;
}

export interface OAuth2Settings {
  authorizationServerId?: string;
  scope?: string;
}

export interface OpenIdSettings {
  openidProviderId?: string;
  bearerTokenSendingMethods?: string[];
}

export interface ApiVersion {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  versioningScheme: 'Segment' | 'Query' | 'Header';
  versionQueryName?: string;
  versionHeaderName?: string;
  apis?: ApiInfo[];
}

export interface ApiRevision {
  id: string;
  apiId: string;
  apiRevision: string;
  description?: string;
  isCurrent: boolean;
  isOnline: boolean;
  privateUrl?: string;
  createdDateTime: Date;
  updatedDateTime: Date;
  revisionDescription?: string;
}

export interface CreateApiVersionRequest {
  apiId: string;
  versionId: string;
  displayName: string;
  description?: string;
  sourceApiId?: string;
  versioningScheme?: 'Segment' | 'Query' | 'Header';
  versionQueryName?: string;
  versionHeaderName?: string;
}

export interface CreateApiRevisionRequest {
  apiId: string;
  apiRevision?: string;
  description?: string;
  sourceApiRevision?: string;
}

export interface CreateApiRequest {
  name: string;
  displayName: string;
  description?: string;
  path: string;
  protocols: string[];
  serviceUrl?: string;
  format?: 'wadl-xml' | 'wadl-link-json' | 'swagger-json' | 'swagger-link-json' | 'wsdl' | 'wsdl-link' | 'openapi' | 'openapi+json' | 'openapi-link';
  value?: string;
  subscriptionRequired?: boolean;
  apiType?: 'http' | 'soap' | 'websocket' | 'graphql';
}

export interface UpdateApiRequest {
  displayName?: string;
  description?: string;
  path?: string;
  protocols?: string[];
  serviceUrl?: string;
  subscriptionRequired?: boolean;
}

export interface ApiOperationInfo {
  id: string;
  name: string;
  displayName: string;
  method: string;
  urlTemplate: string;
  description?: string;
  policies?: string;
}

export interface ProductInfo {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  state: 'notPublished' | 'published';
  subscriptionRequired: boolean;
  approvalRequired: boolean;
  subscriptionsLimit?: number;
  terms?: string;
}

export interface BackendInfo {
  id: string;
  title: string;
  description?: string;
  url: string;
  protocol: string;
  resourceId?: string;
  properties?: any;
}

// Legacy interfaces for backward compatibility
export interface AzureResource {
    id: string;
    name: string;
    type: string;
    location: string;
    properties: Record<string, any>;
}

export interface AzureApiManagement {
    resourceGroup: string;
    serviceName: string;
    apiVersion: string;
    subscriptionId: string;
}

export interface AzureCredentials {
    tenantId: string;
    clientId: string;
    clientSecret: string;
}