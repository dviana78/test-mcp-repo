[**Azure APIM MCP Server Documentation**](../README.md)

***

[Azure APIM MCP Server Documentation](../globals.md) / SubscriptionsManagementService

# Class: SubscriptionsManagementService

Defined in: [services/subscriptions-management.service.ts:9](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/subscriptions-management.service.ts#L9)

Subscriptions Management Service
Handles subscription operations: listing, creating, and getting subscription details

## Implements

- `ISubscriptionsManagementService`

## Constructors

### Constructor

> **new SubscriptionsManagementService**(`azureClient`, `logger`): `SubscriptionsManagementService`

Defined in: [services/subscriptions-management.service.ts:13](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/subscriptions-management.service.ts#L13)

#### Parameters

##### azureClient

[`AzureClient`](AzureClient.md)

##### logger

`ILogger`

#### Returns

`SubscriptionsManagementService`

## Methods

### listSubscriptions()

> **listSubscriptions**(`filter?`, `top?`, `skip?`): `Promise`\<`any`[]\>

Defined in: [services/subscriptions-management.service.ts:21](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/subscriptions-management.service.ts#L21)

List all subscriptions

#### Parameters

##### filter?

`string`

##### top?

`number`

##### skip?

`number`

#### Returns

`Promise`\<`any`[]\>

#### Implementation of

`ISubscriptionsManagementService.listSubscriptions`

***

### createSubscription()

> **createSubscription**(`params`): `Promise`\<`any`\>

Defined in: [services/subscriptions-management.service.ts:65](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/subscriptions-management.service.ts#L65)

Create a new subscription

#### Parameters

##### params

###### subscriptionId

`string`

###### displayName

`string`

###### productId

`string`

###### userId?

`string`

###### primaryKey?

`string`

###### secondaryKey?

`string`

###### state?

`string`

#### Returns

`Promise`\<`any`\>

#### Implementation of

`ISubscriptionsManagementService.createSubscription`

***

### getSubscription()

> **getSubscription**(`subscriptionId`): `Promise`\<`any`\>

Defined in: [services/subscriptions-management.service.ts:125](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/subscriptions-management.service.ts#L125)

Get subscription details by ID

#### Parameters

##### subscriptionId

`string`

#### Returns

`Promise`\<`any`\>

#### Implementation of

`ISubscriptionsManagementService.getSubscription`
