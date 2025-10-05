[**Azure APIM MCP Server Documentation**](../README.md)

***

[Azure APIM MCP Server Documentation](../globals.md) / ProductsManagementService

# Class: ProductsManagementService

Defined in: [services/products-management.service.ts:13](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/products-management.service.ts#L13)

Products Management Service
Handles product operations: listing, getting details, creating products, and managing API-product associations

## Implements

- `IProductsManagementService`

## Constructors

### Constructor

> **new ProductsManagementService**(`azureClient`, `logger`): `ProductsManagementService`

Defined in: [services/products-management.service.ts:17](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/products-management.service.ts#L17)

#### Parameters

##### azureClient

[`AzureClient`](AzureClient.md)

##### logger

`ILogger`

#### Returns

`ProductsManagementService`

## Methods

### listProducts()

> **listProducts**(`filter?`, `top?`, `skip?`): `Promise`\<[`ProductInfo`](../interfaces/ProductInfo.md)[]\>

Defined in: [services/products-management.service.ts:25](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/products-management.service.ts#L25)

List all products in the API Management instance

#### Parameters

##### filter?

`string`

##### top?

`number`

##### skip?

`number`

#### Returns

`Promise`\<[`ProductInfo`](../interfaces/ProductInfo.md)[]\>

#### Implementation of

`IProductsManagementService.listProducts`

***

### getProduct()

> **getProduct**(`productId`): `Promise`\<[`ProductInfo`](../interfaces/ProductInfo.md)\>

Defined in: [services/products-management.service.ts:66](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/products-management.service.ts#L66)

Get product details by ID

#### Parameters

##### productId

`string`

#### Returns

`Promise`\<[`ProductInfo`](../interfaces/ProductInfo.md)\>

#### Implementation of

`IProductsManagementService.getProduct`

***

### createProduct()

> **createProduct**(`params`): `Promise`\<[`ProductInfo`](../interfaces/ProductInfo.md)\>

Defined in: [services/products-management.service.ts:100](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/products-management.service.ts#L100)

Create a new product

#### Parameters

##### params

###### productId

`string`

###### displayName

`string`

###### description?

`string`

###### subscriptionRequired?

`boolean`

###### approvalRequired?

`boolean`

###### state?

`string`

#### Returns

`Promise`\<[`ProductInfo`](../interfaces/ProductInfo.md)\>

#### Implementation of

`IProductsManagementService.createProduct`

***

### getApiProducts()

> **getApiProducts**(`apiId`): `Promise`\<[`ProductInfo`](../interfaces/ProductInfo.md)[]\>

Defined in: [services/products-management.service.ts:148](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/products-management.service.ts#L148)

Get all products that include a specific API

#### Parameters

##### apiId

`string`

#### Returns

`Promise`\<[`ProductInfo`](../interfaces/ProductInfo.md)[]\>

#### Implementation of

`IProductsManagementService.getApiProducts`

***

### addApiToProduct()

> **addApiToProduct**(`productId`, `apiId`): `Promise`\<`void`\>

Defined in: [services/products-management.service.ts:190](https://github.com/dviana78/test-mcp-repo/blob/main/src/services/products-management.service.ts#L190)

Add API to product

#### Parameters

##### productId

`string`

##### apiId

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

`IProductsManagementService.addApiToProduct`
