# 📁 Scripts Directory

This directory contains all scripts organized by categories for the Azure APIM MCP Server.

## 📂 Organized Structure

### 🌟 **starwars/** - Star Wars API Scripts
- `get-starwars-characters.js` - Get Star Wars characters
- `get-starwars-planets.js` - Get Star Wars planets  
- `analyze-starwars-genders.js` - Analyze character genders
- `create-starwars-subscription.js` - Create subscription for Star Wars API

### 🔧 **apim/** - Azure API Management Scripts
- `apim-analyzer.js` - APIM APIs analyzer
- `test-apim-apis.js` - Azure APIM API tests

### 🌤️ **openmeteo/** - OpenMeteo API Scripts
- `open-meteo.yaml` - OpenAPI specification for Weather API
- Scripts related to weather and meteorology

### 🔌 **grpc/** - gRPC Scripts and Files
- `todo.proto` - Protobuf definition for gRPC services
- Scripts for gRPC API tests

### 🧪 **test/** - Test Scripts
- `test-subscription-tools.js` - Subscription tools tests
- Testing and validation scripts

### 🔧 **tools/** - Tool Scripts
- `list-tools.js` - List basic MCP tools
- `list-tools-detailed.js` - List detailed MCP tools
- `list-all-tools.js` - List all tools with categorization

### 🛠️ **utils/** - Utility Scripts
- `organize-repository.js` - Automatic repository organizer
- `get-azure-credentials.sh` - Script to get Azure credentials

## 🚀 Available NPM Scripts

### Star Wars API
```bash
npm run starwars:characters    # Get characters
npm run starwars:planets       # Get planets  
npm run starwars:genders       # Gender analysis
npm run starwars:subscription  # Create subscription
```

### Azure APIM
```bash
npm run apim:analyze          # API analysis
npm run apim:test            # API tests
```

### MCP Tools
```bash
npm run tools:list           # Basic tools list
npm run tools:detailed       # Detailed tools list
npm run tools:list-all       # Complete categorized list
```

### Testing
```bash
npm run test:subscriptions   # Test subscription tools
```

### Utilities
```bash
npm run organize            # Reorganize repository files
npm run utils:credentials   # Configure Azure credentials
```

## 📊 Directory Statistics

- **📁 Total categories**: 7
- **📜 Total scripts**: 20+
- **🔧 NPM scripts**: 15+
- **🎯 Coverage**: REST APIs, gRPC, Testing, Utilities

## 🏗️ Professional Architecture

All scripts are organized following:
- ✅ **Separation of responsibilities**
- ✅ **Consistent nomenclature**
- ✅ **Easy access via NPM scripts**
- ✅ **Complete documentation**
- ✅ **Integration with TypeScript interfaces**

## 🎯 Recently Organized Files

The following files have been moved from the root to their appropriate locations:

- `list-all-tools.js` → `scripts/tools/list-all-tools.js`
- `test-subscription-tools.js` → `scripts/test/test-subscription-tools.js`
- `organize-repository.js` → `scripts/utils/organize-repository.js`
- `get-azure-credentials.sh` → `scripts/utils/get-azure-credentials.sh`
- `open-meteo.yaml` → `scripts/openmeteo/open-meteo.yaml`
- `todo.proto` → `scripts/grpc/todo.proto`

## 🔧 Quick Usage

To run any script, use NPM commands or execute directly:

```bash
# Via NPM (recommended)
npm run tools:list-all

# Direct execution
node scripts/tools/list-all-tools.js
```