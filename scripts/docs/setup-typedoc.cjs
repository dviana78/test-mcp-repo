/**
 * Setup TypeDoc for comprehensive project documentation
 * Generates HTML documentation from TypeScript code and markdown files
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupTypeDoc() {
    console.log('🚀 Setting up TypeDoc for project documentation...\n');
    
    try {
        // Install TypeDoc and plugins
        console.log('📦 Installing TypeDoc and plugins...');
        execSync('npm install --save-dev typedoc typedoc-plugin-markdown typedoc-plugin-mermaid @typedoc/plugin-pages', {
            stdio: 'inherit'
        });
        
        // Create TypeDoc configuration
        console.log('⚙️ Creating TypeDoc configuration...');
        const typeDocConfig = {
            "$schema": "https://typedoc.org/schema.json",
            "entryPoints": [
                "./src/index.ts",
                "./src/**/*.ts"
            ],
            "exclude": [
                "./src/**/*.test.ts",
                "./src/**/*.spec.ts",
                "./node_modules/**/*",
                "./dist/**/*"
            ],
            "out": "./docs",
            "name": "Azure APIM MCP Server Documentation",
            "includeVersion": true,
            "excludePrivate": true,
            "excludeProtected": false,
            "excludeExternals": true,
            "readme": "./README.md",
            "theme": "default",
            "highlightTheme": "light-plus",
            "navigation": {
                "includeCategories": true,
                "includeGroups": true
            },
            "categorizeByGroup": true,
            "sort": ["source-order"],
            "kindSortOrder": [
                "Document",
                "Project",
                "Module",
                "Namespace",
                "Enum",
                "EnumMember",
                "Class",
                "Interface",
                "TypeAlias",
                "Constructor",
                "Property",
                "Variable",
                "Function",
                "Method",
                "Parameter",
                "TypeParameter",
                "Accessor",
                "GetSignature",
                "SetSignature",
                "ObjectLiteral",
                "Reference"
            ],
            "plugin": [
                "typedoc-plugin-mermaid",
                "@typedoc/plugin-pages"
            ],
            "pages": {
                "source": "./docs-pages",
                "output": "pages"
            },
            "gitRevision": "main",
            "gitRemote": "origin",
            "sourceLinkTemplate": "https://github.com/dviana78/test-mcp-repo/blob/{gitRevision}/{path}#L{line}",
            "hideGenerator": false,
            "customCss": "./docs-assets/custom.css",
            "markedOptions": {
                "gfm": true,
                "breaks": false
            }
        };
        
        fs.writeFileSync('./typedoc.json', JSON.stringify(typeDocConfig, null, 2));
        console.log('✅ TypeDoc configuration created: typedoc.json');
        
        // Create docs-pages directory for additional markdown content
        if (!fs.existsSync('./docs-pages')) {
            fs.mkdirSync('./docs-pages', { recursive: true });
            
            // Create index page
            const indexContent = `---
title: Project Overview
---

# Azure APIM MCP Server Documentation

## 🌟 Overview

This project provides a comprehensive Model Context Protocol (MCP) server for Azure API Management operations.

## 📚 Key Features

- **API Management**: Complete CRUD operations for APIs
- **Versioning Support**: API versioning and revision management  
- **gRPC Integration**: Native gRPC API support
- **Weather APIs**: Integration with weather forecast services
- **Product Management**: API product and subscription handling

## 🏗️ Architecture

The project follows a modular architecture with clear separation of concerns:

- **Services Layer**: Core business logic
- **Handlers**: MCP protocol handlers
- **Types**: TypeScript type definitions
- **Utils**: Utility functions and validation

## 🚀 Getting Started

See the main README.md for installation and usage instructions.
`;
            
            fs.writeFileSync('./docs-pages/index.md', indexContent);
            
            // Create API guide
            const apiGuideContent = `---
title: API Reference Guide
---

# API Reference Guide

## 🔧 Available Tools

This MCP server provides the following tools for Azure APIM management:

### API Management
- \`list-apis\`: List all APIs in APIM instance
- \`get-api\`: Get specific API details
- \`create-api-from-yaml\`: Create API from OpenAPI/YAML specification

### API Versioning
- \`create-api-version\`: Create new API version
- \`list-api-versions\`: List API versions
- \`create-api-revision\`: Create API revision

### Product Management
- \`list-products\`: List all products
- \`create-product\`: Create new product
- \`add-api-to-product\`: Associate API with product

### Subscription Management
- \`list-subscriptions\`: List subscriptions
- \`create-subscription\`: Create new subscription

See the generated API documentation for detailed parameter information.
`;
            
            fs.writeFileSync('./docs-pages/api-guide.md', apiGuideContent);
            
            console.log('✅ Documentation pages created in docs-pages/');
        }
        
        // Create custom CSS for better styling
        if (!fs.existsSync('./docs-assets')) {
            fs.mkdirSync('./docs-assets', { recursive: true });
            
            const customCSS = `/* Custom TypeDoc Styling */
:root {
    --color-primary: #0078d4;
    --color-primary-light: #106ebe;
    --color-secondary: #00bcf2;
}

.tsd-page-title h1 {
    color: var(--color-primary);
    border-bottom: 2px solid var(--color-secondary);
    padding-bottom: 10px;
}

.tsd-navigation a {
    color: var(--color-primary);
}

.tsd-navigation a:hover {
    color: var(--color-primary-light);
}

.tsd-signature {
    background: #f8f9fa;
    border-left: 4px solid var(--color-secondary);
    padding: 10px;
    margin: 10px 0;
}

.tsd-comment {
    background: #f0f8ff;
    padding: 15px;
    border-radius: 5px;
    margin: 10px 0;
}

/* Code highlighting */
code {
    background: #f4f4f4;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
}

pre code {
    background: #2d3748;
    color: #e2e8f0;
    padding: 15px;
    border-radius: 5px;
    display: block;
    overflow-x: auto;
}

/* Responsive design */
@media (max-width: 768px) {
    .tsd-page-toolbar {
        padding: 10px;
    }
    
    .container {
        padding: 0 15px;
    }
}
`;
            
            fs.writeFileSync('./docs-assets/custom.css', customCSS);
            console.log('✅ Custom CSS created for documentation styling');
        }
        
        // Update package.json scripts
        console.log('📝 Adding documentation scripts to package.json...');
        const packageJsonPath = './package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts['docs:generate'] = 'typedoc';
        packageJson.scripts['docs:serve'] = 'npx http-server docs -p 8080 -o';
        packageJson.scripts['docs:build'] = 'npm run build && npm run docs:generate';
        packageJson.scripts['docs:watch'] = 'typedoc --watch';
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Documentation scripts added to package.json');
        
        // Create documentation generation script
        const docScript = `#!/usr/bin/env node
/**
 * Generate comprehensive project documentation
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Generating comprehensive project documentation...');

try {
    // Ensure build is up to date
    console.log('🔨 Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Generate TypeDoc documentation
    console.log('📚 Generating TypeDoc documentation...');
    execSync('npx typedoc', { stdio: 'inherit' });
    
    // Copy additional files to docs
    console.log('📋 Copying additional documentation files...');
    
    // Copy main README
    if (fs.existsSync('./README.md')) {
        fs.copyFileSync('./README.md', './docs/README.md');
    }
    
    // Copy other markdown files
    const markdownFiles = [
        'FEATURES.md',
        'PROJECT_COMPLETION_REPORT.md',
        'TOOLS_SUMMARY.md'
    ];
    
    markdownFiles.forEach(file => {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, \`./docs/\${file}\`);
            console.log(\`  ✅ Copied \${file}\`);
        }
    });
    
    console.log('\\n🎉 Documentation generated successfully!');
    console.log('📁 Documentation available in: ./docs/');
    console.log('🌐 To serve locally: npm run docs:serve');
    
} catch (error) {
    console.error('❌ Error generating documentation:', error.message);
    process.exit(1);
}
`;
        
        fs.writeFileSync('./scripts/docs/generate-docs.js', docScript);
        fs.chmodSync('./scripts/docs/generate-docs.js', '755');
        console.log('✅ Documentation generation script created');
        
        // Create .gitignore entries for docs (optional)
        console.log('📝 Updating .gitignore for documentation...');
        let gitignoreContent = '';
        if (fs.existsSync('./.gitignore')) {
            gitignoreContent = fs.readFileSync('./.gitignore', 'utf8');
        }
        
        if (!gitignoreContent.includes('# Documentation')) {
            gitignoreContent += `
# Documentation (uncomment if you don't want to commit generated docs)
# /docs/
# docs-assets/
`;
            fs.writeFileSync('./.gitignore', gitignoreContent);
            console.log('✅ Updated .gitignore with documentation entries');
        }
        
        console.log('\n🎉 TypeDoc setup completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Run: npm run docs:generate');
        console.log('2. View: npm run docs:serve');
        console.log('3. Commit the generated docs/ folder to your repository');
        console.log('\n📁 Documentation will be generated in: ./docs/');
        
    } catch (error) {
        console.error('❌ Error setting up TypeDoc:', error.message);
        process.exit(1);
    }
}

// Execute
setupTypeDoc();