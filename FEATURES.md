# Azure API Management MCP Server - Features

## Overview
Professional Model Context Protocol (MCP) server for Azure API Management operations, built with Node.js/TypeScript following enterprise-grade architecture patterns.

## 🚀 Core Features

### Azure APIM Integration
- **Full Azure SDK Integration**: Uses `@azure/arm-apimanagement` v9.1.0
- **Azure Authentication**: Supports Service Principal authentication via `@azure/identity`
- **Resource Group Management**: Multi-resource group support
- **Error Handling**: Comprehensive Azure-specific error handling and retry logic

### API Management Operations

#### 1. API Discovery & Listing
- **Tool**: `list_apis`
- **Description**: Retrieve all APIs from Azure APIM instance
- **Response**: Complete API metadata including status, protocols, versions

#### 2. API Details
- **Tool**: `get_api`
- **Description**: Get detailed information about a specific API
- **Parameters**: `apiId` (string)
- **Response**: Full API configuration, settings, and metadata

#### 3. API Version Management
- **Tool**: `create_api_version`
- **Description**: Create new API versions with proper versioning strategies
- **Parameters**: 
  - `apiId` (string)
  - `versionId` (string)
  - `displayName` (string)
  - `description` (optional)
  - `versioningScheme` (Segment|Query|Header)
- **Features**: Supports all Azure APIM versioning schemes

#### 4. API Revision Management
- **Tool**: `create_api_revision`
- **Description**: Create new API revisions for safe deployment
- **Parameters**:
  - `apiId` (string)
  - `description` (optional)
  - `sourceApiRevision` (optional)
- **Features**: Automated revision naming, source revision support

#### 5. API Revision Discovery
- **Tool**: `list_api_revisions`
- **Description**: List all revisions for a specific API
- **Parameters**: `apiId` (string)
- **Response**: Complete revision history with status and metadata

## 🏗️ Architecture

### Professional Structure
```
src/
├── config/          # Configuration management
├── services/        # Business logic layer
├── handlers/        # MCP protocol handlers
├── types/           # TypeScript definitions
└── utils/           # Utilities and helpers
```

### Service Layer
- **ApimService**: Core business logic for Azure APIM operations
- **AzureClient**: Azure SDK abstraction with error handling
- **Logger**: Winston-based structured logging

### Handler Layer
- **ToolsHandler**: MCP tool execution handlers
- **ResourcesHandler**: MCP resource access handlers

### Type Safety
- **Comprehensive TypeScript**: Full type coverage for Azure APIs
- **Zod Validation**: Runtime schema validation
- **MCP Protocol Types**: Complete MCP type definitions

## 🛠️ Technical Features

### Development Tools
- **TypeScript**: ES2022 target with strict mode
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Jest**: Unit and integration testing
- **Rimraf**: Cross-platform clean operations

### Error Handling
- **Structured Errors**: Azure-specific error types
- **Error Recovery**: Automatic retry logic for transient failures
- **Validation Errors**: Comprehensive input validation
- **MCP Error Protocol**: Proper MCP error responses

### Logging
- **Winston Logger**: Professional logging with multiple levels
- **Structured Logging**: JSON format for production
- **File Rotation**: Automatic log file management
- **Context Preservation**: Request tracing and correlation

### Security
- **Environment Variables**: Secure credential management
- **Input Validation**: SQL injection and XSS prevention
- **Azure RBAC**: Proper Azure role-based access control
- **API Rate Limiting**: Azure SDK built-in rate limiting

## 📋 Available MCP Resources

### 1. API List Resource
- **URI**: `apim://apis`
- **Description**: Complete list of APIs in APIM instance
- **Format**: JSON with full metadata

### 2. API Details Resource
- **URI**: `apim://api/{apiId}`
- **Description**: Detailed API information
- **Format**: JSON with configuration details

### 3. API Versions Resource
- **URI**: `apim://api/{apiId}/versions`
- **Description**: All versions of a specific API
- **Format**: JSON with version metadata

### 4. API Revisions Resource
- **URI**: `apim://api/{apiId}/revisions`
- **Description**: All revisions of a specific API
- **Format**: JSON with revision history

### 5. API Operations Resource
- **URI**: `apim://api/{apiId}/operations`
- **Description**: All operations within a specific API
- **Format**: JSON with operation definitions

### 6. API Products Resource
- **URI**: `apim://api/{apiId}/products`
- **Description**: All products associated with an API
- **Format**: JSON with product information

## 🚦 Status & Health

### Build Status
- ✅ **TypeScript Compilation**: Clean compilation without errors
- ✅ **Dependency Resolution**: All packages installed successfully
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Azure SDK Integration**: Latest stable SDK versions

### Testing Ready
- **Unit Tests**: Service layer testing configured
- **Integration Tests**: End-to-end Azure APIM testing
- **Mock Support**: Azure SDK mocking for development

### Production Ready Features
- **Environment Configuration**: Development/production configurations
- **Error Recovery**: Comprehensive error handling
- **Performance Monitoring**: Built-in metrics and logging
- **Security**: Enterprise security practices

## 🔧 Setup Requirements

### Azure Prerequisites
- Azure subscription with APIM instance
- Service Principal with APIM Contributor role
- Resource group access
- Network connectivity to Azure

### Environment Variables
```bash
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_APIM_RESOURCE_GROUP=your-resource-group
AZURE_APIM_SERVICE_NAME=your-apim-service
```

### Commands
```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run dev          # Development mode
npm test             # Run tests
npm run lint         # Code quality check
```

## 📊 Metrics & Monitoring

### Performance Metrics
- Request/response times for Azure API calls
- Success/failure rates for APIM operations
- Resource utilization monitoring

### Health Checks
- Azure connectivity validation
- Service Principal authentication verification
- APIM instance accessibility tests

This MCP server provides a complete, production-ready solution for Azure API Management operations through the Model Context Protocol, enabling AI assistants and automation tools to interact with Azure APIM instances in a structured, type-safe manner.