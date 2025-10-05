[**Azure APIM MCP Server Documentation**](../README.md)

***

[Azure APIM MCP Server Documentation](../globals.md) / BackendServicesService

# Class: BackendServicesService

Defined in: [services/backend-services.service.ts:11](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/backend-services.service.ts#L11)

Backend Services Service
Handles backend services management: listing backend services in Azure APIM

## Implements

- `IBackendServicesService`

## Constructors

### Constructor

> **new BackendServicesService**(`azureClient`, `logger`): `BackendServicesService`

Defined in: [services/backend-services.service.ts:15](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/backend-services.service.ts#L15)

#### Parameters

##### azureClient

[`AzureClient`](AzureClient.md)

##### logger

`ILogger`

#### Returns

`BackendServicesService`

## Methods

### listBackends()

> **listBackends**(`options?`): `Promise`\<`any`[]\>

Defined in: [services/backend-services.service.ts:23](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/backend-services.service.ts#L23)

List all backend services in the API Management instance

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

`IBackendServicesService.listBackends`
