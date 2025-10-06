import { AzureConfig } from '../types/index.js';
import { ConfigurationError } from '../utils/errors.js';

export function getAzureConfig(): AzureConfig {
  const requiredEnvVars = [
    'AZURE_TENANT_ID',
    'AZURE_CLIENT_ID', 
    'AZURE_CLIENT_SECRET',
    'AZURE_SUBSCRIPTION_ID',
    'AZURE_APIM_RESOURCE_GROUP',
    'AZURE_APIM_SERVICE_NAME'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new ConfigurationError(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    tenantId: process.env.AZURE_TENANT_ID!,
    clientId: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    subscriptionId: process.env.AZURE_SUBSCRIPTION_ID!,
    resourceGroupName: process.env.AZURE_APIM_RESOURCE_GROUP!,
    serviceName: process.env.AZURE_APIM_SERVICE_NAME!
  };
}

export function validateAzureConfig(config: AzureConfig): boolean {
  const requiredFields: (keyof AzureConfig)[] = [
    'tenantId',
    'clientId',
    'clientSecret',
    'subscriptionId',
    'resourceGroupName',
    'serviceName'
  ];

  for (const field of requiredFields) {
    if (!config[field] || config[field].trim() === '') {
      throw new ConfigurationError(`Azure configuration field '${field}' is required and cannot be empty`);
    }
  }

  return true;
}







