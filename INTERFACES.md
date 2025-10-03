# Interfaces Documentation

This document describes the interfaces implemented in the Azure APIM MCP Server for professional architecture.

## Overview

The project now implements a contract-based architecture using TypeScript interfaces, which provides:

- **Type Safety**: Ensures all implementations follow the defined contracts
- **Dependency Injection**: Enables easy testing and mocking
- **Separation of Concerns**: Clear boundaries between service contracts and implementations
- **Maintainability**: Easier to extend and modify services

## Interfaces

### ILogger

Location: `src/interfaces/ILogger.ts`

The `ILogger` interface defines the contract for logging services throughout the application.

#### Methods

- `info(message: string, meta?: any): void` - Log informational messages
- `error(message: string, meta?: any): void` - Log error messages
- `warn(message: string, meta?: any): void` - Log warning messages  
- `debug(message: string, meta?: any): void` - Log debug messages
- `child(context: object): ILogger` - Create a child logger with additional context

#### Implementation

The `Logger` class in `src/utils/logger.ts` implements this interface using Winston as the underlying logging framework.

#### Factory Pattern

The `ILoggerFactory` interface provides a factory method for creating logger instances with specific contexts.

### IApimService

Location: `src/interfaces/IApimService.ts`

The `IApimService` interface defines the comprehensive contract for Azure API Management operations.

#### Core API Management Methods

- `listApis(options?)` - List all APIs with optional filtering
- `getApi(apiId)` - Get specific API details
- `createApiFromYaml(params)` - Create API from OpenAPI/YAML specification
- `createGrpcApiFromProto(params)` - Create gRPC API from Protobuf definition

#### Versioning Methods

- `createApiVersion(params)` - Create new API version
- `listApiVersions(apiId)` - List all versions of an API
- `createApiRevision(params)` - Create new API revision
- `listApiRevisions(apiId)` - List all revisions of an API

#### Operations and Products

- `getApiOperations(apiId)` - Get all operations for an API
- `getApiProducts(apiId)` - Get products associated with an API

#### Backend Services

- `listBackends(options?)` - List backend services

#### Validation and Error Handling

- `handleError(error, operation)` - Consistent error handling
- `validateApiParams(params)` - Validate API creation parameters
- `validateYamlContract(yamlContent)` - Validate OpenAPI specifications
- `validateProtoDefinition(protoContent)` - Validate Protobuf definitions

#### Implementation

The `ApimService` class in `src/services/apim-service.ts` implements this interface, providing full Azure APIM integration.

## Configuration Interfaces

### IApimServiceConfig

Defines the configuration contract for initializing APIM services:

```typescript
interface IApimServiceConfig {
  subscriptionId: string;
  resourceGroupName: string;
  serviceName: string;
  credentials?: {
    clientId?: string;
    clientSecret?: string;
    tenantId?: string;
  };
  defaults?: {
    protocols?: string[];
    subscriptionRequired?: boolean;
    versioningScheme?: 'Segment' | 'Query' | 'Header';
  };
}
```

## Common Types

### IServiceResponse

Standard response format for all service operations:

```typescript
interface IServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}
```

### IPaginationOptions

Standard pagination parameters:

```typescript
interface IPaginationOptions {
  top?: number;
  skip?: number;
  filter?: string;
}
```

## Usage Examples

### Logger Usage

```typescript
import { ILogger, LoggerFactory } from '../interfaces';

// Create logger with context
const loggerFactory = new LoggerFactory();
const logger: ILogger = loggerFactory.createLogger({ service: 'ApiManager' });

// Use logger
logger.info('API operation started', { apiId: 'weather-api' });
logger.error('Operation failed', { error: 'Connection timeout' });

// Create child logger with additional context
const childLogger = logger.child({ operation: 'createApi' });
childLogger.debug('Validating parameters');
```

### APIM Service Usage

```typescript
import { IApimService, IApimServiceConfig } from '../interfaces';
import { ApimService } from '../services/apim-service';

// Configure service
const config: IApimServiceConfig = {
  subscriptionId: 'your-subscription-id',
  resourceGroupName: 'your-resource-group',
  serviceName: 'your-apim-service'
};

// Create service instance
const apimService: IApimService = new ApimService(azureClient);

// Use service
const apis = await apimService.listApis({
  filter: "name eq 'weather'",
  top: 10,
  skip: 0
});

// Create new API
const newApi = await apimService.createApiFromYaml({
  apiId: 'weather-api-v2',
  displayName: 'Weather API v2',
  yamlContract: yamlContent,
  description: 'Advanced weather forecasting API'
});
```

## Benefits

### Type Safety

All service interactions are now type-checked at compile time, reducing runtime errors and improving code reliability.

### Testing

Interfaces enable easy mocking for unit tests:

```typescript
const mockLogger: ILogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  child: jest.fn()
};

const mockApimService: IApimService = {
  listApis: jest.fn().mockResolvedValue([]),
  getApi: jest.fn(),
  // ... other methods
};
```

### Dependency Injection

Services can be easily swapped or extended without changing dependent code:

```typescript
class ApiManager {
  constructor(
    private apimService: IApimService,
    private logger: ILogger
  ) {}
  
  async manageApi(apiId: string) {
    this.logger.info('Managing API', { apiId });
    return await this.apimService.getApi(apiId);
  }
}
```

## Migration Notes

### Breaking Changes

1. **listApis** method signature changed from `(filter?, top?, skip?)` to `(options?)`
2. **listBackends** method signature changed from `(filter?, top?, skip?)` to `(options?)`

### Backward Compatibility

Legacy functions in the logger module are maintained for backward compatibility:

- `logInfo(message, context?)`
- `logError(message, context?)`  
- `logDebug(message, context?)`

## Future Enhancements

1. **Additional Interfaces**: Consider adding interfaces for Azure Client, Error Handlers, and Validation services
2. **Generic Service Interface**: Create a base `IService` interface for common service patterns
3. **Configuration Management**: Add interfaces for configuration providers and environment management
4. **Event System**: Implement interfaces for event-driven architecture patterns