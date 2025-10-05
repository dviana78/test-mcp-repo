[**Azure APIM MCP Server Documentation**](../README.md)

***

[Azure APIM MCP Server Documentation](../globals.md) / GrpcService

# Class: GrpcService

Defined in: [services/grpc.service.ts:16](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/grpc.service.ts#L16)

gRPC Service
Handles gRPC API creation from Protobuf definitions with HTTP transcoding

## Implements

- `IGrpcService`

## Constructors

### Constructor

> **new GrpcService**(`azureClient`, `logger`): `GrpcService`

Defined in: [services/grpc.service.ts:20](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/grpc.service.ts#L20)

#### Parameters

##### azureClient

[`AzureClient`](AzureClient.md)

##### logger

`ILogger`

#### Returns

`GrpcService`

## Methods

### createGrpcApiFromProto()

> **createGrpcApiFromProto**(`params`): `Promise`\<[`ApiInfo`](../interfaces/ApiInfo.md)\>

Defined in: [services/grpc.service.ts:28](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/grpc.service.ts#L28)

Create a new gRPC API from Protobuf definition with optional versioning

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

###### protoDefinition

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

`IGrpcService.createGrpcApiFromProto`
