[**Azure APIM MCP Server Documentation**](../README.md)

***

[Azure APIM MCP Server Documentation](../globals.md) / ApiOperationsService

# Class: ApiOperationsService

Defined in: [services/api-operations.service.ts:13](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-operations.service.ts#L13)

API Operations Service
Handles API operations management: getting operations/endpoints for specific APIs

## Implements

- `IApiOperationsService`

## Constructors

### Constructor

> **new ApiOperationsService**(`azureClient`, `logger`): `ApiOperationsService`

Defined in: [services/api-operations.service.ts:17](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-operations.service.ts#L17)

#### Parameters

##### azureClient

[`AzureClient`](AzureClient.md)

##### logger

`ILogger`

#### Returns

`ApiOperationsService`

## Methods

### getApiOperations()

> **getApiOperations**(`apiId`): `Promise`\<[`ApiOperationInfo`](../interfaces/ApiOperationInfo.md)[]\>

Defined in: [services/api-operations.service.ts:25](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-operations.service.ts#L25)

Get API operations

#### Parameters

##### apiId

`string`

#### Returns

`Promise`\<[`ApiOperationInfo`](../interfaces/ApiOperationInfo.md)[]\>

#### Implementation of

`IApiOperationsService.getApiOperations`
