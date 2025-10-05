[**Azure APIM MCP Server Documentation**](../README.md)

***

[Azure APIM MCP Server Documentation](../globals.md) / ToolsHandler

# Class: ToolsHandler

Defined in: [handlers/tools.ts:15](https://github.com/dviana78/test-mcp-repo/blob/main/src/handlers/tools.ts#L15)

## Constructors

### Constructor

> **new ToolsHandler**(`apiManagementService`, `apiVersioningService`, `grpcService`, `productsManagementService`, `subscriptionsManagementService`, `apiOperationsService`, `backendServicesService`): `ToolsHandler`

Defined in: [handlers/tools.ts:25](https://github.com/dviana78/test-mcp-repo/blob/main/src/handlers/tools.ts#L25)

#### Parameters

##### apiManagementService

`IApiManagementService`

##### apiVersioningService

`IApiVersioningService`

##### grpcService

`IGrpcService`

##### productsManagementService

`IProductsManagementService`

##### subscriptionsManagementService

`ISubscriptionsManagementService`

##### apiOperationsService

`IApiOperationsService`

##### backendServicesService

`IBackendServicesService`

#### Returns

`ToolsHandler`

## Methods

### getAvailableTools()

> **getAvailableTools**(): [`McpToolDefinition`](../interfaces/McpToolDefinition.md)[]

Defined in: [handlers/tools.ts:47](https://github.com/dviana78/test-mcp-repo/blob/main/src/handlers/tools.ts#L47)

Get list of available tools

#### Returns

[`McpToolDefinition`](../interfaces/McpToolDefinition.md)[]

***

### executeTool()

> **executeTool**(`request`): `Promise`\<[`McpToolResponse`](../interfaces/McpToolResponse.md)\>

Defined in: [handlers/tools.ts:579](https://github.com/dviana78/test-mcp-repo/blob/main/src/handlers/tools.ts#L579)

Execute a tool request

#### Parameters

##### request

[`McpToolRequest`](../interfaces/McpToolRequest.md)

#### Returns

`Promise`\<[`McpToolResponse`](../interfaces/McpToolResponse.md)\>
