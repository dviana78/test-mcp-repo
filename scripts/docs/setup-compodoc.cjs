/**
 * Setup Compodoc for advanced project documentation
 * Provides interactive documentation with dependency graphs and coverage
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function setupCompodoc() {
    console.log('🚀 Setting up Compodoc for advanced documentation...\n');
    
    try {
        // Install Compodoc
        console.log('📦 Installing Compodoc...');
        execSync('npm install --save-dev @compodoc/compodoc', {
            stdio: 'inherit'
        });
        
        // Create Compodoc configuration
        console.log('⚙️ Creating Compodoc configuration...');
        const compodocConfig = {
            "name": "Azure APIM MCP Server",
            "version": "1.0.0",
            "description": "Comprehensive documentation for Azure APIM MCP Server",
            "mode": "modules",
            "theme": "laravel",
            "output": "./docs-compodoc",
            "tsconfig": "./tsconfig.json",
            "serve": true,
            "port": 8081,
            "watch": true,
            "exportFormat": "html",
            "coverageTest": 70,
            "coverageTestThresholdFail": true,
            "disableSourceCode": false,
            "disableDomTree": false,
            "disableTemplateTab": false,
            "disableStyleTab": false,
            "disableGraph": false,
            "disableCoverage": false,
            "disablePrivate": false,
            "disableProtected": false,
            "disableInternal": false,
            "disableLifeCycleHooks": false,
            "disableRoutesGraph": false,
            "language": "en-US",
            "theme": "material",
            "extTheme": "./compodoc-theme",
            "toggleMenuItems": [
                "all",
                "modules",
                "components",
                "directives",
                "classes",
                "injectables",
                "interfaces",
                "pipes",
                "miscellaneous",
                "coverage"
            ],
            "navTabConfig": [
                {
                    "id": "readme",
                    "label": "README"
                },
                {
                    "id": "modules",
                    "label": "Modules"
                },
                {
                    "id": "classes",
                    "label": "Classes"
                },
                {
                    "id": "interfaces",
                    "label": "Interfaces"
                },
                {
                    "id": "coverage",
                    "label": "Documentation Coverage"
                }
            ],
            "includes": "./docs-includes",
            "includesName": "Additional Documentation",
            "assetsFolder": "./docs-assets",
            "unitTestCoverage": "./coverage",
            "silent": false,
            "customFavicon": "./docs-assets/favicon.ico"
        };
        
        fs.writeFileSync('./.compodocrc.json', JSON.stringify(compodocConfig, null, 2));
        console.log('✅ Compodoc configuration created: .compodocrc.json');
        
        // Create includes directory for additional documentation
        if (!fs.existsSync('./docs-includes')) {
            fs.mkdirSync('./docs-includes', { recursive: true });
            
            // Create getting started guide
            const gettingStarted = `# Getting Started Guide

## 🚀 Quick Start

Follow these steps to get the Azure APIM MCP Server running:

### Prerequisites

- Node.js 18+ 
- Azure subscription with APIM instance
- Valid Azure credentials

### Installation

\`\`\`bash
npm install
npm run build
\`\`\`

### Configuration

1. Set environment variables:
\`\`\`bash
export AZURE_APIM_RESOURCE_GROUP="your-resource-group"
export AZURE_APIM_SERVICE_NAME="your-apim-service"
export AZURE_SUBSCRIPTION_ID="your-subscription-id"
\`\`\`

2. Start the server:
\`\`\`bash
npm start
\`\`\`

## 📖 Usage Examples

### Creating an API from YAML

\`\`\`typescript
const result = await apiManagementService.createApiFromYaml({
    apiId: 'weather-api',
    displayName: 'Weather API',
    yamlContract: openApiSpec,
    protocols: ['https']
});
\`\`\`

### Listing APIs

\`\`\`typescript
const apis = await apiManagementService.listApis({
    filter: 'name eq \\'weather\\'',
    top: 10
});
\`\`\`
`;
            
            fs.writeFileSync('./docs-includes/getting-started.md', gettingStarted);
            
            // Create architecture guide
            const architectureGuide = `# Architecture Guide

## 🏗️ System Architecture

The Azure APIM MCP Server follows a layered architecture pattern:

### Layers

1. **Protocol Layer** (\`handlers/\`)
   - MCP protocol implementation
   - Request/response handling
   - Tool registration

2. **Service Layer** (\`services/\`)
   - Business logic implementation
   - Azure SDK integration
   - Error handling

3. **Data Layer** (\`types/\`)
   - Type definitions
   - Interface contracts
   - Data models

4. **Utility Layer** (\`utils/\`)
   - Validation functions
   - Helper utilities
   - Common operations

## 🔄 Data Flow

\`\`\`
Client Request → MCP Handler → Service Layer → Azure SDK → Azure APIM
\`\`\`

## 🎯 Key Components

### ApiManagementService
Core service for API operations including creation, listing, and management.

### GrpcService  
Specialized service for gRPC API handling and protobuf processing.

### ApiVersioningService
Handles API versioning and revision management.

## 🔌 Integration Points

- **Azure API Management**: Primary integration target
- **Model Context Protocol**: Communication protocol
- **OpenAPI/Swagger**: API specification format
- **gRPC**: Protocol buffer support
`;
            
            fs.writeFileSync('./docs-includes/architecture.md', architectureGuide);
            
            console.log('✅ Additional documentation created in docs-includes/');
        }
        
        // Create custom theme directory
        if (!fs.existsSync('./compodoc-theme')) {
            fs.mkdirSync('./compodoc-theme', { recursive: true });
            
            const customTheme = `/* Compodoc Custom Theme */
:root {
    --primary-color: #0078d4;
    --secondary-color: #00bcf2;
    --accent-color: #f0f8ff;
    --text-color: #333;
    --background-color: #ffffff;
}

.navbar-brand {
    color: var(--primary-color) !important;
    font-weight: bold;
}

.btn-outline-primary {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.btn-outline-primary:hover {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
}

.card-header {
    background-color: var(--accent-color);
    border-bottom: 2px solid var(--secondary-color);
}

.table-striped tbody tr:nth-of-type(odd) {
    background-color: var(--accent-color);
}

.coverage-percent {
    font-weight: bold;
    color: var(--primary-color);
}

/* Syntax highlighting improvements */
.hljs {
    background: #f8f9fa !important;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 1rem;
}

/* Navigation improvements */
.sidebar {
    background-color: #f8f9fa;
    border-right: 1px solid #dee2e6;
}

.sidebar .nav-link {
    color: var(--text-color);
    padding: 0.5rem 1rem;
}

.sidebar .nav-link:hover {
    background-color: var(--accent-color);
    color: var(--primary-color);
}
`;
            
            fs.writeFileSync('./compodoc-theme/custom.css', customTheme);
            console.log('✅ Custom theme created for Compodoc');
        }
        
        // Update package.json scripts
        console.log('📝 Adding Compodoc scripts to package.json...');
        const packageJsonPath = './package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts['docs:compodoc'] = 'compodoc -p tsconfig.json';
        packageJson.scripts['docs:compodoc:serve'] = 'compodoc -p tsconfig.json -s';
        packageJson.scripts['docs:compodoc:watch'] = 'compodoc -p tsconfig.json -s -w';
        packageJson.scripts['docs:coverage'] = 'compodoc -p tsconfig.json --coverageTest';
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Compodoc scripts added to package.json');
        
        console.log('\n🎉 Compodoc setup completed successfully!');
        console.log('\n📋 Available commands:');
        console.log('• npm run docs:compodoc - Generate documentation');
        console.log('• npm run docs:compodoc:serve - Generate and serve');
        console.log('• npm run docs:compodoc:watch - Watch mode with live reload');
        console.log('• npm run docs:coverage - Generate coverage report');
        console.log('\n📁 Documentation will be available at: http://localhost:8081');
        
    } catch (error) {
        console.error('❌ Error setting up Compodoc:', error.message);
        process.exit(1);
    }
}

// Execute
setupCompodoc();