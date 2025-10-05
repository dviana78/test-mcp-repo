**Azure APIM MCP Server Documentation**

***

# Azure API Management MCP Server

## Overview
This project is a professional Node.js/TypeScript implementation of the Model Context Protocol (MCP) server designed for integration with Azure API Management. It follows enterprise-grade architecture patterns, ensuring a clean separation of concerns, comprehensive error handling, and adherence to TypeScript best practices.

## APIM MCP Server Overview

### 🏗️ **Architecture & Technology Stack**
This is a comprehensive **Azure API Management MCP Server** that bridges Azure cloud services with the Model Context Protocol, providing a robust foundation for enterprise API management automation.

**Core Technologies:**
- **Runtime**: Node.js ≥18.0.0 with ES Modules
- **Language**: TypeScript 5.x with strict type checking
- **Protocol**: Model Context Protocol (MCP) SDK v0.4.0
- **Cloud Integration**: Azure API Management via ARM client
- **Authentication**: Azure DefaultAzureCredential with service principal support

### 🎯 **Primary Purpose & Use Cases**
The server acts as an intelligent intermediary that exposes Azure API Management capabilities through the standardized MCP protocol, enabling:

1. **Automated API Lifecycle Management**: Complete CRUD operations for APIs, products, and subscriptions
2. **Multi-Protocol API Support**: REST, gRPC, OpenAPI, and custom protocol integration
3. **Enterprise API Governance**: Centralized management of API products, subscriptions, and access control
4. **Development Workflow Integration**: Seamless integration with development tools via MCP clients
5. **Cross-Platform API Testing**: Comprehensive testing framework for multiple API types

#### **Enterprise-Grade Capabilities**
- **Subscription Management**: Automated key generation and lifecycle management
- **Product Association**: Dynamic API-to-product mapping with access control
- **Authentication & Security**: Azure AD integration with subscription-key authentication
- **Monitoring & Analytics**: Built-in logging and error tracking
- **Version Control**: API versioning with segment, query, and header strategies

#### **Development & Operations**
- **Hot Reload Development**: TSX watch mode for rapid development cycles
- **Comprehensive Testing**: Jest framework with integration and unit tests
- **Script Automation**: 30+ utility scripts for common operations
- **CI/CD Ready**: TypeScript compilation and automated deployment support

### 🚀 **Operational Excellence**
The server demonstrates production-ready characteristics:
- **High Availability**: Designed for enterprise deployment scenarios
- **Error Resilience**: Comprehensive error handling and graceful degradation
- **Performance Optimized**: Efficient Azure SDK usage with connection pooling
- **Scalability**: Modular architecture supporting horizontal scaling
- **Observability**: Structured logging with Winston and Azure integration

### 📈 **Business Value**
This MCP server provides significant business value through:
- **Reduced Integration Time**: Standardized MCP interface for all API operations
- **Operational Efficiency**: Automated API management reducing manual overhead
- **Developer Productivity**: Rich toolset for rapid API development and testing
- **Enterprise Compliance**: Centralized governance and security management
- **Cost Optimization**: Efficient resource utilization and automated workflows

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

## 🔍 Code Quality & Analysis

### SonarQube Integration
This project includes comprehensive SonarQube integration for automated code quality analysis. SonarQube analysis can be triggered through multiple methods:

#### 🛠️ **MCP Tool Integration** 
Use the `run_sonar_analysis` tool through the MCP server:
```typescript
// Example MCP tool usage
{
  "name": "run_sonar_analysis",
  "arguments": {
    "includeCoverage": true,
    "waitForQualityGate": false,
    "projectPath": "/path/to/project"
  }
}
```

#### 📦 **NPM Scripts**
- `npm run sonar:scan` - Run SonarQube analysis only
- `npm run sonar:scan:coverage` - Run tests with coverage + SonarQube analysis
- `npm run build:analyze` - Build project + run SonarQube analysis

#### 🖥️ **Standalone Script**
```bash
# Basic analysis
node scripts/sonar/run-analysis.js

# With coverage
node scripts/sonar/run-analysis.js --coverage

# With quality gate waiting
node scripts/sonar/run-analysis.js --coverage --wait-quality-gate --verbose
```

#### ⚙️ **Configuration**
1. **Environment Variables** (add to your `.env` file):
   ```bash
   SONAR_HOST_URL=http://localhost:9000  # or https://sonarcloud.io
   SONAR_TOKEN=your-sonar-token-here
   ```

2. **SonarQube Properties** (`sonar-project.properties`):
   - Pre-configured for TypeScript projects
   - Includes test coverage integration
   - Configured exclusions for optimal analysis

#### 🚀 **Automated Analysis**
SonarQube analysis runs automatically when:
- Using `npm run build:analyze` command
- Calling the `run_sonar_analysis` MCP tool
- Running the standalone analysis script

#### 📊 **Quality Metrics**
The integration provides:
- **Code Coverage**: Jest coverage reports integration
- **Technical Debt**: Automatic debt ratio calculation
- **Security**: Security hotspot detection
- **Maintainability**: Code complexity analysis
- **Reliability**: Bug detection and classification

#### 🎯 **Quality Gates**
- Configurable quality gate thresholds
- Optional blocking on quality gate failures
- Detailed reporting on code quality metrics

For detailed SonarQube setup instructions, refer to the [SonarQube Documentation](https://docs.sonarqube.org/).

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
