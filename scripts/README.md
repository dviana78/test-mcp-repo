# 📁 Scripts Directory

This directory contains all the utility scripts organized by functionality.

## 📂 Directory Structure

### 🌟 **starwars/**
Scripts related to Star Wars API (SWAPI) functionality:
- `get-starwars-characters.js` - Get all Star Wars characters
- `get-starwars-planets.js` - Get all Star Wars planets  
- `analyze-starwars-genders.js` - Analyze character gender distribution
- `get-starwars-operations.js` - Get Star Wars API operations
- `create-starwars-subscription.js` - Create APIM subscription for Star Wars API
- `verify-starwars-api.js` - Verify Star Wars API configuration
- `analyze-star-wars-api.js` - Detailed API analysis
- `get-all-starwars-characters.js` - Complete character retrieval
- `get-starwars-info.js` - Get Star Wars API information

### ☁️ **apim/**
Azure API Management related scripts:
- `apim-analyzer.js` - Complete APIM analysis tool
- `test-apim-apis.js` - Test APIM API functionality
- `test-apim-direct.js` - Direct APIM access testing
- `debug-apis.js` - API debugging utilities
- `simulate-apim-apis.js` - APIM simulation scripts

### 🌤️ **openmeteo/**
OpenMeteo weather API scripts:
- `create-open-meteo-api.js` - Create OpenMeteo API
- `create-openmeteo-final.js` - Final OpenMeteo setup
- `check-openmeteo-operations.js` - Check OpenMeteo operations
- `verify-weather-apis.js` - Verify weather API functionality
- Plus various other OpenMeteo utility scripts

### 🔧 **grpc/**
gRPC related functionality:
- `check-grpc-apis.js` - Check gRPC API status
- `simple-grpc-test.js` - Basic gRPC testing
- `test-grpc-api-creation.js` - Test gRPC API creation
- `quick-grpc-search.js` - Quick gRPC search utility
- `search-grpc-simple.js` - Simple gRPC search

### 🧪 **test/**
Testing and verification scripts:
- `test-list-apis.js` - Test API listing functionality
- `test-server.js` - Server testing utilities
- `test-swapi-direct.js` - Direct SWAPI testing
- `check-backend-direct.js` - Backend verification
- Plus various other testing utilities

### 🛠️ **tools/**
MCP tools and utilities:
- `list-tools.js` - List available MCP tools
- `list-tools-detailed.js` - Detailed tool information
- `configure-mcp.js` - MCP configuration
- `petstore-details.js` - Petstore API details

### 🔧 **utils/**
Utility and maintenance scripts:
- `translate-repository.js` - Repository translation utilities
- `debug-yaml-import.js` - YAML import debugging
- `create-version-v2.js` - Version management

#### 💾 **utils/backups/**
Backup files from translations and modifications

## 🚀 Usage Examples

### Run Star Wars character analysis:
```bash
node scripts/starwars/get-starwars-characters.js
```

### Test APIM functionality:
```bash
node scripts/apim/apim-analyzer.js
```

### List available MCP tools:
```bash
node scripts/tools/list-tools.js
```

### Check weather API:
```bash
node scripts/openmeteo/verify-weather-apis.js
```

## 📝 Notes

- All scripts are self-contained and can be run independently
- Scripts maintain their original functionality after organization
- Backup files are preserved in `utils/backups/`
- Documentation and configuration files remain in the project root

## 🎯 Quick Access

For frequently used scripts, consider adding npm scripts to `package.json`:

```json
{
  "scripts": {
    "starwars:characters": "node scripts/starwars/get-starwars-characters.js",
    "starwars:planets": "node scripts/starwars/get-starwars-planets.js",
    "apim:analyze": "node scripts/apim/apim-analyzer.js",
    "tools:list": "node scripts/tools/list-tools.js"
  }
}
```