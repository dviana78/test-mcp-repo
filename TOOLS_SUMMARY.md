# 🔧 **Available Tools in your MCP Server**

## 📊 **General Summary**
**Total Tools: 10 tools**

---

## 🌐 **1. REST API MANAGEMENT TOOLS**

### 🔍 **Query Tools**

#### 1. **`list_apis`**
- **Description**: List all APIs in Azure API Management
- **Parameters**:
  - `filter` (optional): OData filter expression
  - `top` (optional): Maximum number of APIs to return (1-1000)
  - `skip` (optional): Number of APIs to skip
- **Usage**: Get complete or filtered list of APIs

#### 2. **`get_api`**
- **Description**: Get details of a specific API by ID
- **Parameters**:
  - `apiId` (required): ID of the API to query
- **Usage**: Detailed information about a specific API

#### 3. **`get_api_operations`**
- **Description**: Get all operations of a specific API
- **Parameters**:
  - `apiId` (required): API ID
- **Usage**: View endpoints and methods of an API

#### 4. **`get_api_products`**
- **Description**: Get all products that include a specific API
- **Parameters**:
  - `apiId` (required): API ID
- **Usage**: See which products include an API

---

## 🏗️ **2. API CREATION TOOLS**

#### 5. **`create_api_from_yaml`** ⭐
- **Description**: Create a new API from a YAML/OpenAPI contract with optional versioning
- **Parameters**:
  - `apiId` (required): ID for the new API
  - `displayName` (required): Display name
  - `yamlContract` (required): YAML/OpenAPI contract content
  - `description` (optional): API description
  - `path` (optional): API path
  - `serviceUrl` (optional): Backend service URL
  - `protocols` (optional): Supported protocols [http, https]
  - `subscriptionRequired` (optional): Whether subscription is required (default: true)
  - **Versioning**:
    - `initialVersion` (optional): Initial version (e.g., "v1", "1.0")
    - `versioningScheme` (optional): Versioning scheme [Segment, Query, Header]
    - `versionQueryName` (optional): Query parameter name (default: "version")
    - `versionHeaderName` (optional): Header name (default: "Api-Version")
- **Status**: ✅ Fully functional

#### 6. **`create_grpc_api_from_proto`** ⭐🆕
- **Description**: Create a new gRPC API from Protobuf definition with optional versioning
- **Parameters**:
  - `apiId` (required): ID for the new gRPC API
  - `displayName` (required): Display name
  - `protoDefinition` (required): .proto file content
  - `description` (optional): gRPC API description
  - `path` (optional): gRPC API path
  - `serviceUrl` (optional): gRPC backend service URL
  - `protocols` (optional): Supported protocols [http, https, grpc, grpcs]
  - `subscriptionRequired` (optional): Whether subscription is required (default: true)
  - **Versioning**:
    - `initialVersion` (optional): Initial version (e.g., "v1", "1.0")
    - `versioningScheme` (optional): Versioning scheme [Segment, Query, Header]
    - `versionQueryName` (optional): Query parameter name (default: "version")
    - `versionHeaderName` (optional): Header name (default: "Api-Version")
- **Status**: ✅ Recently implemented and tested

---

## 📦 **3. VERSIONING TOOLS**

#### 7. **`create_api_version`**
- **Description**: Create a new version of an existing API
- **Parameters**:
  - `apiId` (required): Source API ID
  - `versionId` (required): Version identifier (e.g., "v2", "2.0")
  - `displayName` (required): Version display name
  - `description` (optional): Version description
  - `sourceApiId` (optional): Source API ID if different
  - `versioningScheme` (optional): Versioning scheme [Segment, Query, Header]
  - `versionQueryName` (optional): Query parameter name
  - `versionHeaderName` (optional): Header name
- **Usage**: Create new versions of existing APIs

#### 8. **`list_api_versions`**
- **Description**: List all versions of a specific API
- **Parameters**:
  - `apiId` (required): API ID
- **Usage**: View all available versions of an API

---

## 🔄 **4. REVISION TOOLS**

#### 9. **`create_api_revision`**
- **Description**: Create a new revision of an existing API
- **Parameters**:
  - `apiId` (required): API ID
  - `apiRevision` (optional): Revision number (auto-generated if not provided)
  - `description` (optional): Description of changes
  - `sourceApiRevision` (optional): Source revision to copy from
- **Usage**: Create revisions for API changes

#### 10. **`list_api_revisions`**
- **Description**: List all revisions of a specific API
- **Parameters**:
  - `apiId` (required): API ID
- **Usage**: View revision history of an API

---

## 📊 **Summary by Categories**

| Category | Count | Tools |
|----------|-------|-------|
| **🔍 API Query** | 4 | `list_apis`, `get_api`, `get_api_operations`, `get_api_products` |
| **🏗️ API Creation** | 2 | `create_api_from_yaml`, `create_grpc_api_from_proto` |
| **📦 Version Management** | 2 | `create_api_version`, `list_api_versions` |
| **🔄 Revision Management** | 2 | `create_api_revision`, `list_api_revisions` |
| **📈 Total** | **10** | **Complete and functional tools** |

---

## 🌟 **Highlighted Features**

### ✅ **Advanced Functionalities**
- **Complete versioning**: Support for 3 schemes (Segment, Query, Header)
- **Multiple formats**: YAML/OpenAPI and Protobuf/gRPC
- **Complete management**: Query, creation, versioning and revisions
- **Azure APIM integration**: Direct and functional connection
- **Robust validation**: Error handling and parameter validation

### 🆕 **Latest Additions**
- **`create_grpc_api_from_proto`**: New tool for gRPC APIs
- **Advanced versioning**: Implemented in creation tools
- **Protobuf support**: Validation and processing of .proto files

### 🔗 **Integration Status**
- ✅ **MCP Protocol**: Standard 2024-11-05 implemented
- ✅ **Azure APIM**: Active and functional connection
- ✅ **TypeScript**: Professional compiled architecture
- ✅ **VS Code**: Complete configuration with tasks

---

**🎯 Your MCP Server has a complete and professional set of tools for managing both REST and gRPC APIs in Azure API Management, with advanced versioning and revision capabilities.**