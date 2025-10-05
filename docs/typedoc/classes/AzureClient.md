[**Azure APIM MCP Server Documentation**](../README.md)

***

[Azure APIM MCP Server Documentation](../globals.md) / AzureClient

# Class: AzureClient

Defined in: [services/azure-client.ts:7](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/azure-client.ts#L7)

## Constructors

### Constructor

> **new AzureClient**(`config`): `AzureClient`

Defined in: [services/azure-client.ts:12](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/azure-client.ts#L12)

#### Parameters

##### config

[`AzureConfig`](../interfaces/AzureConfig.md)

#### Returns

`AzureClient`

## Methods

### getClient()

> **getClient**(): `ApiManagementClient`

Defined in: [services/azure-client.ts:34](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/azure-client.ts#L34)

Get the API Management client instance

#### Returns

`ApiManagementClient`

***

### testConnection()

> **testConnection**(): `Promise`\<`boolean`\>

Defined in: [services/azure-client.ts:41](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/azure-client.ts#L41)

Test the connection to Azure API Management

#### Returns

`Promise`\<`boolean`\>

***

### getServiceInfo()

> **getServiceInfo**(): `Promise`\<\{ `name`: `undefined` \| `string`; `location`: `string`; `sku`: `ApiManagementServiceSkuProperties`; `publisherName`: `string`; `publisherEmail`: `string`; `gatewayUrl`: `undefined` \| `string`; `managementApiUrl`: `undefined` \| `string`; `portalUrl`: `undefined` \| `string`; `scmUrl`: `undefined` \| `string`; \}\>

Defined in: [services/azure-client.ts:62](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/azure-client.ts#L62)

Get Azure API Management service information

#### Returns

`Promise`\<\{ `name`: `undefined` \| `string`; `location`: `string`; `sku`: `ApiManagementServiceSkuProperties`; `publisherName`: `string`; `publisherEmail`: `string`; `gatewayUrl`: `undefined` \| `string`; `managementApiUrl`: `undefined` \| `string`; `portalUrl`: `undefined` \| `string`; `scmUrl`: `undefined` \| `string`; \}\>

***

### handleAzureError()

> **handleAzureError**(`error`): `never`

Defined in: [services/azure-client.ts:93](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/azure-client.ts#L93)

Handle Azure REST API errors with proper error mapping

#### Parameters

##### error

`any`

#### Returns

`never`

***

### executeWithRetry()

> **executeWithRetry**\<`T`\>(`operation`, `maxRetries`, `baseDelay`): `Promise`\<`T`\>

Defined in: [services/azure-client.ts:123](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/azure-client.ts#L123)

Retry wrapper for Azure API calls with exponential backoff

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `Promise`\<`T`\>

##### maxRetries

`number` = `3`

##### baseDelay

`number` = `1000`

#### Returns

`Promise`\<`T`\>
