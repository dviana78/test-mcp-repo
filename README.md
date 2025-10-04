# Azure API Management MCP Server

## Overview
This project is a professional Node.js/TypeScript implementation of the Model Context Protocol (MCP) server designed for integration with Azure API Management. It follows enterprise-grade architecture patterns, ensuring a clean separation of concerns, comprehensive error handling, and adherence to TypeScript best practices.

## Features

### 🚀 Core Capabilities
- **Azure API Management Integration**: Full CRUD operations for APIs, backends, and operations
- **YAML Contract Processing**: Create APIs from OpenAPI/YAML specifications
- **Backend Service Management**: Automatic backend creation from YAML server URLs
- **gRPC Support**: Protobuf parsing and HTTP transcoding for gRPC services
- **API Versioning**: Support for segment, query, and header-based versioning
- **Policy Configuration**: Automatic policy setup for backend service routing

### 🛠️ Available Tools (18 Total)

#### **API Management (3 tools)**
- `list_apis`: List all APIs in Azure API Management with filtering options
- `get_api`: Get detailed information about a specific API by ID
- `create_api_from_yaml`: Create APIs with versioning from OpenAPI/YAML contracts

#### **API Versioning (4 tools)**
- `create_api_version`: Create new versions of existing APIs
- `list_api_versions`: List all versions of a specific API
- `create_api_revision`: Create new revisions of existing APIs
- `list_api_revisions`: List all revisions of a specific API

#### **gRPC Support (1 tool)**
- `create_grpc_api_from_proto`: Generate gRPC APIs from Protobuf definitions with HTTP transcoding

#### **Products Management (5 tools)**
- `list_products`: List all products in Azure API Management
- `get_product`: Get detailed information about a specific product
- `create_product`: Create new products in Azure APIM
- `get_api_products`: Get all products that include a specific API
- `add_api_to_product`: Associate APIs with products

#### **Subscriptions Management (3 tools)**
- `list_subscriptions`: List all subscriptions in Azure API Management
- `create_subscription`: Create new subscriptions for products
- `get_subscription`: Get detailed information about a specific subscription

#### **API Operations (1 tool)**
- `get_api_operations`: List all operations/endpoints for a specific API

#### **Backend Services (1 tool)**
- `list_backends`: List all backend services in Azure APIM

## Getting Started

### Prerequisites
- Node.js (version >= 18.0.0)
- TypeScript (version >= 5.x)
- Azure account with API Management service
- Azure service principal with APIM permissions

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/dviana78/test-mcp-repo.git
   cd test-mcp-repo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy the `.env.example` to `.env` and fill in the required values

### Running the Application
```bash
npm run build
npm start
```

## Documentation
For detailed information on the Model Context Protocol, refer to:
- [Official MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/)

## 🌐 Internationalization
This project follows English-only standards for all code, documentation, scripts, and comments:
- **Code & Comments**: All variable names, function names, and code comments are in English
- **Documentation**: README, API docs, and inline documentation in English
- **Scripts & Tools**: All utility scripts and tools use English messages and descriptions
- **Error Messages**: All error messages and logging output in English
- **Consistency**: Ensures universal accessibility and professional standards

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.

---

**Built with ❤️ using TypeScript and Azure API Management**