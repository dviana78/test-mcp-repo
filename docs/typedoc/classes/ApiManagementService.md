[**Azure APIM MCP Server Documentation**](../README.md)

***

[Azure APIM MCP Server Documentation](../globals.md) / ApiManagementService

# Class: ApiManagementService

Defined in: [services/api-management.service.ts:16](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-management.service.ts#L16)

API Management Service
Handles core API operations: listing, getting details, and creating APIs from YAML

## Implements

- `IApiManagementService`

## Constructors

### Constructor

> **new ApiManagementService**(`azureClient`, `logger`): `ApiManagementService`

Defined in: [services/api-management.service.ts:20](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-management.service.ts#L20)

#### Parameters

##### azureClient

[`AzureClient`](AzureClient.md)

##### logger

`ILogger`

#### Returns

`ApiManagementService`

## Methods

### listApis()

> **listApis**(`options?`): `Promise`\<`any`[]\>

Defined in: [services/api-management.service.ts:28](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-management.service.ts#L28)

List all APIs in the API Management instance

#### Parameters

##### options?

###### filter?

`string`

###### top?

`number`

###### skip?

`number`

#### Returns

`Promise`\<`any`[]\>

#### Implementation of

`IApiManagementService.listApis`

***

### getApi()

> **getApi**(`apiId`): `Promise`\<[`ApiInfo`](../interfaces/ApiInfo.md)\>

Defined in: [services/api-management.service.ts:66](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-management.service.ts#L66)

Get a specific API by ID

#### Parameters

##### apiId

`string`

#### Returns

`Promise`\<[`ApiInfo`](../interfaces/ApiInfo.md)\>

#### Implementation of

`IApiManagementService.getApi`

***

### createApiFromYaml()

> **createApiFromYaml**(`params`): `Promise`\<[`ApiInfo`](../interfaces/ApiInfo.md)\>

Defined in: [services/api-management.service.ts:94](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/api-management.service.ts#L94)

Create a new API from YAML/OpenAPI contract with optional versioning

#### Parameters

##### params

###### apiId

`string`

###### displayName

`string`

###### description?

`string`

###### path?

`string`

###### serviceUrl?

`string`

###### yamlContract

`string`

###### protocols?

`string`[]

###### subscriptionRequired?

`boolean`

###### initialVersion?

`string`

###### versioningScheme?

`"Segment"` \| `"Query"` \| `"Header"`

###### versionQueryName?

`string`

###### versionHeaderName?

`string`

#### Returns

`Promise`\<[`ApiInfo`](../interfaces/ApiInfo.md)\>

#### Implementation of

`IApiManagementService.createApiFromYaml`
