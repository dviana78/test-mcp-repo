# 🏗️ Documentación Jerárquica - Azure APIM MCP Server

## 📋 Índice de Navegación Jerárquica

1. [🎯 **McpServer** - Clase Principal](#mcpserver---clase-principal)
2. [🔄 **ToolsHandler** - Manejador de Herramientas](#toolshandler---manejador-de-herramientas)
3. [☁️ **AzureClient** - Cliente Azure](#azureclient---cliente-azure)
4. [🎛️ **Servicios Especializados**](#servicios-especializados)
   - [📊 ApiManagementService](#apimanagementservice)
   - [📝 ApiVersioningService](#apiversioningservice)
   - [🔌 GrpcService](#grpcservice)
   - [📦 ProductsManagementService](#productsmanagementservice)
   - [🎫 SubscriptionsManagementService](#subscriptionsmanagementservice)
   - [⚙️ ApiOperationsService](#apioperationsservice)
   - [🔗 BackendServicesService](#backendservicesservice)

---

## 🎯 **McpServer** - Clase Principal

### 📖 **Propósito**
Clase principal que orquesta todo el servidor MCP (Model Context Protocol). Es el punto de entrada que coordina todos los servicios y maneja las peticiones del protocolo MCP.

### 🔧 **Métodos Principales**

#### `constructor()`
- **Función**: Inicializa el servidor MCP
- **Hace**: 
  - Crea una instancia del logger
  - Configura el servidor MCP con nombre y versión
  - Llama a `setupHandlers()` para configurar los manejadores

#### `initializeServices(): Promise<void>`
- **Función**: Inicializa todos los servicios del sistema
- **Hace**:
  1. Obtiene la configuración de Azure (`getAzureConfig()`)
  2. Crea el cliente Azure (`AzureClient`)
  3. Inicializa todos los servicios especializados:
     - ApiManagementService
     - ApiVersioningService
     - GrpcService
     - ProductsManagementService
     - SubscriptionsManagementService
     - ApiOperationsService
     - BackendServicesService
  4. Crea el ToolsHandler con inyección de dependencias
  5. Prueba la conexión con Azure
- **Retorna**: Promise que se resuelve cuando todos los servicios están listos

#### `setupHandlers(): void`
- **Función**: Configura los manejadores del protocolo MCP
- **Hace**:
  - Configura el manejador para `ListToolsRequest` (listar herramientas disponibles)
  - Configura el manejador para `CallToolRequest` (ejecutar herramientas)
  - Asegura que los servicios estén inicializados antes de procesar peticiones

#### `start(): Promise<void>`
- **Función**: Inicia el servidor MCP
- **Hace**:
  - Inicializa todos los servicios
  - Conecta el servidor al transporte stdio
  - Comienza a escuchar peticiones MCP

---

## 🔄 **ToolsHandler** - Manejador de Herramientas

### 📖 **Propósito**
Intermediario entre el servidor MCP y los servicios especializados. Traduce las peticiones MCP en llamadas a los métodos apropiados de cada servicio.

### 🔧 **Métodos Principales**

#### `constructor(servicios...)`
- **Función**: Recibe todas las instancias de los servicios especializados
- **Hace**: Almacena referencias a todos los servicios para poder delegarles las operaciones

#### `getAvailableTools(): ToolDefinition[]`
- **Función**: Retorna la lista de todas las herramientas disponibles
- **Hace**: Recopila las definiciones de herramientas de todos los servicios especializados

#### `handleToolCall(name: string, arguments: any): Promise<any>`
- **Función**: Ejecuta una herramienta específica
- **Hace**: 
  - Identifica qué servicio debe manejar la herramienta
  - Delega la ejecución al servicio apropiado
  - Retorna el resultado o error formateado

---

## ☁️ **AzureClient** - Cliente Azure

### 📖 **Propósito**
Abstrae todas las operaciones de bajo nivel con Azure API Management. Maneja autenticación, configuración y peticiones HTTP a la API de Azure.

### 🔧 **Métodos Principales**

#### `constructor(config: AzureConfig)`
- **Función**: Inicializa el cliente con configuración de Azure
- **Hace**: Configura credenciales, endpoints y parámetros de conexión

#### `testConnection(): Promise<void>`
- **Función**: Verifica que la conexión con Azure funcione
- **Hace**: Realiza una petición de prueba para validar credenciales y conectividad

#### `getApiManagementClient(): ApiManagementClient`
- **Función**: Retorna el cliente oficial de Azure API Management
- **Hace**: Proporciona acceso directo al SDK de Azure para operaciones complejas

---

## 🎛️ **Servicios Especializados**

---

### 📊 **ApiManagementService**

#### 📖 **Propósito**
Maneja las operaciones principales de gestión de APIs: listar, obtener detalles, crear y actualizar APIs.

#### 🔧 **Métodos Detallados**

##### `listApis(): Promise<ApiInfo[]>`
- **Función**: Lista todas las APIs disponibles en Azure APIM
- **Hace**:
  1. Conecta con Azure API Management
  2. Obtiene la lista completa de APIs
  3. Extrae información relevante (ID, nombre, descripción, versión)
  4. Filtra APIs activas/válidas
- **Retorna**: Array de objetos ApiInfo con información básica de cada API

##### `getApiDetails(apiId: string): Promise<DetailedApiInfo>`
- **Función**: Obtiene información detallada de una API específica
- **Parámetros**: `apiId` - Identificador único de la API
- **Hace**:
  1. Valida que el apiId sea válido
  2. Busca la API en Azure APIM
  3. Obtiene configuración completa (endpoints, políticas, schemas)
  4. Recopila métricas y estado
- **Retorna**: Objeto DetailedApiInfo con toda la información de la API
- **Errores**: Lanza NotFoundError si la API no existe

##### `createApiFromYaml(yamlContent: string, apiId: string): Promise<ApiInfo>`
- **Función**: Crea una nueva API a partir de un archivo YAML/OpenAPI
- **Parámetros**: 
  - `yamlContent` - Contenido del archivo YAML con la especificación
  - `apiId` - ID único para la nueva API
- **Hace**:
  1. Valida el formato del YAML
  2. Parsea la especificación OpenAPI
  3. Crea la API en Azure APIM
  4. Configura endpoints y operaciones
  5. Aplica políticas por defecto
- **Retorna**: ApiInfo de la API creada
- **Errores**: ValidationError si el YAML es inválido

---

### 📝 **ApiVersioningService**

#### 📖 **Propósito**
Gestiona las versiones de APIs, permite crear nuevas versiones y administrar el ciclo de vida de versiones.

#### 🔧 **Métodos Detallados**

##### `listApiVersions(apiId: string): Promise<ApiVersion[]>`
- **Función**: Lista todas las versiones de una API específica
- **Parámetros**: `apiId` - ID de la API base
- **Hace**:
  1. Busca todas las versiones asociadas a la API
  2. Obtiene información de cada versión (número, estado, fecha)
  3. Ordena por fecha de creación
- **Retorna**: Array de ApiVersion con información de cada versión

##### `createApiVersion(apiId: string, versionInfo: VersionInfo): Promise<ApiVersion>`
- **Función**: Crea una nueva versión de una API existente
- **Parámetros**:
  - `apiId` - API base
  - `versionInfo` - Información de la nueva versión
- **Hace**:
  1. Valida que la API base exista
  2. Verifica que la versión no exista ya
  3. Crea la nueva versión copiando configuración base
  4. Aplica cambios específicos de la versión
- **Retorna**: ApiVersion de la nueva versión creada

##### `setApiVersionRevision(apiId: string, versionId: string, revisionInfo: RevisionInfo): Promise<ApiRevision>`
- **Función**: Crea una revisión dentro de una versión específica
- **Hace**: Gestiona cambios incrementales sin crear una nueva versión completa

---

### 🔌 **GrpcService**

#### 📖 **Propósito**
Especializado en gestionar APIs que usan el protocolo gRPC, incluyendo la importación de archivos .proto y configuración específica.

#### 🔧 **Métodos Detallados**

##### `createGrpcApi(protoFile: string, apiId: string): Promise<ApiInfo>`
- **Función**: Crea una API gRPC a partir de un archivo .proto
- **Parámetros**:
  - `protoFile` - Contenido del archivo Protocol Buffers
  - `apiId` - ID para la nueva API gRPC
- **Hace**:
  1. Parsea el archivo .proto
  2. Extrae definiciones de servicios y mensajes
  3. Genera configuración de endpoints gRPC
  4. Crea la API en Azure APIM con configuración gRPC
- **Retorna**: ApiInfo de la API gRPC creada

##### `listGrpcApis(): Promise<ApiInfo[]>`
- **Función**: Lista únicamente las APIs que usan protocolo gRPC
- **Hace**: Filtra las APIs por tipo de protocolo y configuración gRPC

##### `updateGrpcApi(apiId: string, protoFile: string): Promise<ApiInfo>`
- **Función**: Actualiza una API gRPC existente con un nuevo archivo .proto
- **Hace**: Reemplaza la configuración gRPC manteniendo políticas y configuración de Azure

---

### 📦 **ProductsManagementService**

#### 📖 **Propósito**
Gestiona los productos de API en Azure APIM. Los productos agrupan APIs y definen políticas de acceso, límites y audiencias.

#### 🔧 **Métodos Detallados**

##### `listProducts(): Promise<ProductInfo[]>`
- **Función**: Lista todos los productos disponibles
- **Hace**: 
  1. Obtiene productos de Azure APIM
  2. Extrae información de nombre, descripción, estado
  3. Incluye número de APIs asociadas
- **Retorna**: Array de ProductInfo

##### `createProduct(productInfo: ProductInfo): Promise<ProductInfo>`
- **Función**: Crea un nuevo producto
- **Parámetros**: `productInfo` - Información del producto (nombre, descripción, políticas)
- **Hace**:
  1. Valida información del producto
  2. Crea el producto en Azure APIM
  3. Configura políticas por defecto
  4. Establece límites de acceso

##### `addApiToProduct(productId: string, apiId: string): Promise<void>`
- **Función**: Asocia una API a un producto
- **Hace**: 
  1. Valida que tanto el producto como la API existan
  2. Crea la asociación en Azure APIM
  3. Aplica las políticas del producto a la API

##### `removeApiFromProduct(productId: string, apiId: string): Promise<void>`
- **Función**: Desasocia una API de un producto
- **Hace**: Elimina la relación manteniendo tanto el producto como la API

---

### 🎫 **SubscriptionsManagementService**

#### 📖 **Propósito**
Gestiona las suscripciones de usuarios a productos de API. Controla el acceso, claves de API y límites de uso.

#### 🔧 **Métodos Detallados**

##### `listSubscriptions(): Promise<SubscriptionInfo[]>`
- **Función**: Lista todas las suscripciones activas
- **Hace**:
  1. Obtiene suscripciones de Azure APIM
  2. Incluye información de usuario, producto, estado
  3. Muestra fechas de expiración y límites
- **Retorna**: Array de SubscriptionInfo

##### `createSubscription(subscriptionData: SubscriptionData): Promise<SubscriptionInfo>`
- **Función**: Crea una nueva suscripción
- **Parámetros**: `subscriptionData` - Datos del usuario y producto
- **Hace**:
  1. Valida que el producto exista
  2. Verifica que el usuario no tenga suscripción duplicada
  3. Genera claves de API únicas
  4. Configura límites según el producto
- **Retorna**: SubscriptionInfo con claves generadas

##### `renewSubscriptionKeys(subscriptionId: string): Promise<SubscriptionKeys>`
- **Función**: Regenera las claves de API de una suscripción
- **Hace**: 
  1. Invalida claves actuales
  2. Genera nuevas claves primaria y secundaria
  3. Actualiza la configuración en Azure

##### `deleteSubscription(subscriptionId: string): Promise<void>`
- **Función**: Elimina una suscripción
- **Hace**: Revoca acceso y elimina todas las claves asociadas

---

### ⚙️ **ApiOperationsService**

#### 📖 **Propósito**
Gestiona las operaciones específicas dentro de cada API (GET, POST, PUT, DELETE endpoints).

#### 🔧 **Métodos Detallados**

##### `listApiOperations(apiId: string): Promise<OperationInfo[]>`
- **Función**: Lista todas las operaciones de una API
- **Parámetros**: `apiId` - ID de la API
- **Hace**:
  1. Obtiene definición completa de la API
  2. Extrae cada endpoint/operación
  3. Incluye métodos HTTP, rutas, parámetros
- **Retorna**: Array de OperationInfo

##### `createApiOperation(apiId: string, operation: OperationData): Promise<OperationInfo>`
- **Función**: Añade una nueva operación a una API existente
- **Hace**:
  1. Valida que la operación no exista
  2. Añade el endpoint a la API
  3. Configura parámetros y respuestas
  4. Actualiza la documentación automáticamente

##### `updateApiOperation(apiId: string, operationId: string, operation: OperationData): Promise<OperationInfo>`
- **Función**: Modifica una operación existente
- **Hace**: Actualiza configuración manteniendo compatibilidad hacia atrás

##### `deleteApiOperation(apiId: string, operationId: string): Promise<void>`
- **Función**: Elimina una operación de la API
- **Hace**: Remueve el endpoint y actualiza la documentación

---

### 🔗 **BackendServicesService**

#### 📖 **Propósito**
Gestiona los servicios backend que están detrás de las APIs. Configura URLs, balanceadores, autenticación hacia servicios externos.

#### 🔧 **Métodos Detallados**

##### `listBackendServices(): Promise<BackendInfo[]>`
- **Función**: Lista todos los servicios backend configurados
- **Hace**:
  1. Obtiene configuraciones de backend de Azure APIM
  2. Incluye URLs, estados de salud, protocolos
  3. Muestra qué APIs usan cada backend
- **Retorna**: Array de BackendInfo

##### `createBackendService(backendConfig: BackendConfig): Promise<BackendInfo>`
- **Función**: Registra un nuevo servicio backend
- **Parámetros**: `backendConfig` - URL, autenticación, configuración
- **Hace**:
  1. Valida conectividad con el backend
  2. Configura autenticación si es necesaria
  3. Establece políticas de retry y timeout
  4. Registra el backend en Azure APIM

##### `updateBackendService(backendId: string, config: BackendConfig): Promise<BackendInfo>`
- **Función**: Actualiza configuración de un backend
- **Hace**: Modifica configuración sin interrumpir APIs que lo usan

##### `testBackendConnection(backendId: string): Promise<ConnectionStatus>`
- **Función**: Verifica que el backend esté funcionando
- **Hace**:
  1. Realiza petición de prueba al backend
  2. Verifica tiempo de respuesta
  3. Valida autenticación
- **Retorna**: Estado de conexión y métricas

---

## 🔄 **Flujo de Ejecución Jerárquico**

### 📊 **Cuando llega una petición MCP:**

1. **McpServer** recibe la petición
2. **McpServer** llama a **ToolsHandler**
3. **ToolsHandler** identifica el servicio apropiado
4. **Servicio Especializado** ejecuta la operación
5. **Servicio** usa **AzureClient** para conectar con Azure
6. **AzureClient** realiza la petición HTTP a Azure APIM
7. La respuesta sube por la jerarquía hasta llegar al cliente MCP

### 🎯 **Ejemplo Práctico: Listar APIs**
```
Cliente MCP → McpServer → ToolsHandler → ApiManagementService → AzureClient → Azure APIM
     ← respuesta ← respuesta ← respuesta ← respuesta ← respuesta ← JSON APIs
```

---

*Esta documentación proporciona una vista jerárquica completa del sistema, empezando desde la clase más alta (McpServer) y descendiendo por cada nivel hasta los métodos específicos de cada servicio.*