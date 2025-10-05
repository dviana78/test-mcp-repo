[**Azure APIM MCP Server Documentation**](../README.md)

***

[Azure APIM MCP Server Documentation](../globals.md) / ApiVersioningService

# Class: ApiVersioningService

Defined in: [services/api-versioning.service.ts:21](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-versioning.service.ts#L21)

API Versioning Service
Handles API versioning and revision operations

## Implements

- `IApiVersioningService`

## Constructors

### Constructor

> **new ApiVersioningService**(`azureClient`, `logger`): `ApiVersioningService`

Defined in: [services/api-versioning.service.ts:25](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-versioning.service.ts#L25)

#### Parameters

##### azureClient

[`AzureClient`](AzureClient.md)

##### logger

`ILogger`

#### Returns

`ApiVersioningService`

## Methods

### createApiVersion()

> **createApiVersion**(`request`): `Promise`\<[`ApiVersion`](../interfaces/ApiVersion.md)\>

Defined in: [services/api-versioning.service.ts:33](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-versioning.service.ts#L33)

Create a new API version

#### Parameters

##### request

[`CreateApiVersionRequest`](../interfaces/CreateApiVersionRequest.md)

#### Returns

`Promise`\<[`ApiVersion`](../interfaces/ApiVersion.md)\>

#### Implementation of

`IApiVersioningService.createApiVersion`

***

### listApiVersions()

> **listApiVersions**(`apiId`): `Promise`\<[`ApiVersion`](../interfaces/ApiVersion.md)[]\>

Defined in: [services/api-versioning.service.ts:115](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-versioning.service.ts#L115)

List API versions for a specific API

#### Parameters

##### apiId

`string`

#### Returns

`Promise`\<[`ApiVersion`](../interfaces/ApiVersion.md)[]\>

#### Implementation of

`IApiVersioningService.listApiVersions`

***

### createApiRevision()

> **createApiRevision**(`request`): `Promise`\<[`ApiRevision`](../interfaces/ApiRevision.md)\>

Defined in: [services/api-versioning.service.ts:171](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-versioning.service.ts#L171)

Create a new API revision

#### Parameters

##### request

[`CreateApiRevisionRequest`](../interfaces/CreateApiRevisionRequest.md)

#### Returns

`Promise`\<[`ApiRevision`](../interfaces/ApiRevision.md)\>

#### Implementation of

`IApiVersioningService.createApiRevision`

***

### listApiRevisions()

> **listApiRevisions**(`apiId`): `Promise`\<[`ApiRevision`](../interfaces/ApiRevision.md)[]\>

Defined in: [services/api-versioning.service.ts:244](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-versioning.service.ts#L244)

List API revisions for a specific API

#### Parameters

##### apiId

`string`

#### Returns

`Promise`\<[`ApiRevision`](../interfaces/ApiRevision.md)[]\>

#### Implementation of

`IApiVersioningService.listApiRevisions`
