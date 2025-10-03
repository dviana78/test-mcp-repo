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

### 🛠️ Available Tools
- `create_api_from_yaml`: Create APIs with versioning from YAML contracts
- `create_grpc_api_from_proto`: Generate gRPC APIs from Protobuf definitions
- `list_apis`: Enumerate all APIs in Azure APIM
- `get_api`: Get detailed API information
- `get_api_operations`: List all operations for a specific API
- `list_backends`: List all backend services
- `create_api_version`: Create new API versions
- `create_api_revision`: Create API revisions

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

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.

---

**Built with ❤️ using TypeScript and Azure API Management**