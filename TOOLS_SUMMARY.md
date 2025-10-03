# 🔧 **Herramientas Disponibles en tu MCP Server**

## 📊 **Resumen General**
**Total de Tools: 10 herramientas**

---

## 🌐 **1. HERRAMIENTAS DE GESTIÓN DE APIs REST**

### 🔍 **Tools de Consulta**

#### 1. **`list_apis`**
- **Descripción**: Lista todas las APIs en Azure API Management
- **Parámetros**:
  - `filter` (opcional): Expresión de filtro OData
  - `top` (opcional): Máximo número de APIs a devolver (1-1000)
  - `skip` (opcional): Número de APIs a omitir
- **Uso**: Obtener listado completo o filtrado de APIs

#### 2. **`get_api`**
- **Descripción**: Obtiene detalles de una API específica por ID
- **Parámetros**:
  - `apiId` (requerido): ID de la API a consultar
- **Uso**: Información detallada de una API específica

#### 3. **`get_api_operations`**
- **Descripción**: Obtiene todas las operaciones de una API específica
- **Parámetros**:
  - `apiId` (requerido): ID de la API
- **Uso**: Ver endpoints y métodos de una API

#### 4. **`get_api_products`**
- **Descripción**: Obtiene todos los productos que incluyen una API específica
- **Parámetros**:
  - `apiId` (requerido): ID de la API
- **Uso**: Ver en qué productos está incluida una API

---

## 🏗️ **2. HERRAMIENTAS DE CREACIÓN DE APIs**

#### 5. **`create_api_from_yaml`** ⭐
- **Descripción**: Crear una nueva API desde un contrato YAML/OpenAPI con versionado opcional
- **Parámetros**:
  - `apiId` (requerido): ID para la nueva API
  - `displayName` (requerido): Nombre para mostrar
  - `yamlContract` (requerido): Contenido del contrato YAML/OpenAPI
  - `description` (opcional): Descripción de la API
  - `path` (opcional): Path de la API
  - `serviceUrl` (opcional): URL del servicio backend
  - `protocols` (opcional): Protocolos soportados [http, https]
  - `subscriptionRequired` (opcional): Si requiere suscripción (default: true)
  - **Versionado**:
    - `initialVersion` (opcional): Versión inicial (ej: "v1", "1.0")
    - `versioningScheme` (opcional): Esquema de versionado [Segment, Query, Header]
    - `versionQueryName` (opcional): Nombre del parámetro query (default: "version")
    - `versionHeaderName` (opcional): Nombre del header (default: "Api-Version")
- **Estado**: ✅ Completamente funcional

#### 6. **`create_grpc_api_from_proto`** ⭐🆕
- **Descripción**: Crear una nueva API gRPC desde definición Protobuf con versionado opcional
- **Parámetros**:
  - `apiId` (requerido): ID para la nueva API gRPC
  - `displayName` (requerido): Nombre para mostrar
  - `protoDefinition` (requerido): Contenido del archivo .proto
  - `description` (opcional): Descripción de la API gRPC
  - `path` (opcional): Path de la API gRPC
  - `serviceUrl` (opcional): URL del servicio gRPC backend
  - `protocols` (opcional): Protocolos soportados [http, https, grpc, grpcs]
  - `subscriptionRequired` (opcional): Si requiere suscripción (default: true)
  - **Versionado**:
    - `initialVersion` (opcional): Versión inicial (ej: "v1", "1.0")
    - `versioningScheme` (opcional): Esquema de versionado [Segment, Query, Header]
    - `versionQueryName` (opcional): Nombre del parámetro query (default: "version")
    - `versionHeaderName` (opcional): Nombre del header (default: "Api-Version")
- **Estado**: ✅ Recién implementada y probada

---

## 📦 **3. HERRAMIENTAS DE VERSIONADO**

#### 7. **`create_api_version`**
- **Descripción**: Crear una nueva versión de una API existente
- **Parámetros**:
  - `apiId` (requerido): ID de la API fuente
  - `versionId` (requerido): Identificador de versión (ej: "v2", "2.0")
  - `displayName` (requerido): Nombre para mostrar de la versión
  - `description` (opcional): Descripción de la versión
  - `sourceApiId` (opcional): ID de API fuente si es diferente
  - `versioningScheme` (opcional): Esquema de versionado [Segment, Query, Header]
  - `versionQueryName` (opcional): Nombre del parámetro query
  - `versionHeaderName` (opcional): Nombre del header
- **Uso**: Crear nuevas versiones de APIs existentes

#### 8. **`list_api_versions`**
- **Descripción**: Lista todas las versiones de una API específica
- **Parámetros**:
  - `apiId` (requerido): ID de la API
- **Uso**: Ver todas las versiones disponibles de una API

---

## 🔄 **4. HERRAMIENTAS DE REVISIONES**

#### 9. **`create_api_revision`**
- **Descripción**: Crear una nueva revisión de una API existente
- **Parámetros**:
  - `apiId` (requerido): ID de la API
  - `apiRevision` (opcional): Número de revisión (auto-generado si no se proporciona)
  - `description` (opcional): Descripción de los cambios
  - `sourceApiRevision` (opcional): Revisión fuente a copiar
- **Uso**: Crear revisiones para cambios en APIs

#### 10. **`list_api_revisions`**
- **Descripción**: Lista todas las revisiones de una API específica
- **Parámetros**:
  - `apiId` (requerido): ID de la API
- **Uso**: Ver historial de revisiones de una API

---

## 📊 **Resumen por Categorías**

| Categoría | Cantidad | Herramientas |
|-----------|----------|-------------|
| **🔍 Consulta de APIs** | 4 | `list_apis`, `get_api`, `get_api_operations`, `get_api_products` |
| **🏗️ Creación de APIs** | 2 | `create_api_from_yaml`, `create_grpc_api_from_proto` |
| **📦 Gestión de Versiones** | 2 | `create_api_version`, `list_api_versions` |
| **🔄 Gestión de Revisiones** | 2 | `create_api_revision`, `list_api_revisions` |
| **📈 Total** | **10** | **Herramientas completas y funcionales** |

---

## 🌟 **Características Destacadas**

### ✅ **Funcionalidades Avanzadas**
- **Versionado completo**: Soporte para 3 esquemas (Segment, Query, Header)
- **Múltiples formatos**: YAML/OpenAPI y Protobuf/gRPC
- **Gestión completa**: Consulta, creación, versionado y revisiones
- **Integración Azure APIM**: Conexión directa y funcional
- **Validación robusta**: Manejo de errores y validación de parámetros

### 🆕 **Últimas Incorporaciones**
- **`create_grpc_api_from_proto`**: Nueva herramienta para APIs gRPC
- **Versionado avanzado**: Implementado en herramientas de creación
- **Soporte Protobuf**: Validación y procesamiento de archivos .proto

### 🔗 **Estado de Integración**
- ✅ **MCP Protocol**: Estándar 2024-11-05 implementado
- ✅ **Azure APIM**: Conexión activa y funcional
- ✅ **TypeScript**: Arquitectura profesional compilada
- ✅ **VS Code**: Configuración completa con tasks

---

**🎯 Tu MCP Server tiene un conjunto completo y profesional de herramientas para gestionar APIs tanto REST como gRPC en Azure API Management, con capacidades avanzadas de versionado y revisiones.**