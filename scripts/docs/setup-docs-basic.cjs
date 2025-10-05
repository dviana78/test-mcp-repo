const fs = require('fs');
const path = require('path');

// Create documentation configuration files
console.log('Setting up documentation for Node.js TypeScript project...');

// 1. TypeDoc configuration (simplified)
const typedocConfig = {
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["./src"],
  "out": "./docs/typedoc",
  "name": "Azure APIM MCP Server Documentation",
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeInternal": false,
  "readme": "./README.md",
  "theme": "default",
  "navigationLinks": {
    "GitHub": "https://github.com/user/azure-apim-mcp-server"
  },
  "sidebarLinks": {
    "Project Home": "./",
    "API Reference": "./modules.html"
  },
  "plugin": ["typedoc-plugin-markdown"],
  "gitRevision": "main",
  "categorizeByGroup": true,
  "sort": ["source-order"]
};

// 2. JSDoc configuration
const jsdocConfig = {
  "source": {
    "include": ["./src/", "./README.md"],
    "includePattern": "\\.(js|ts)$",
    "exclude": ["node_modules/", "docs/", "dist/", "build/"]
  },
  "opts": {
    "destination": "./docs/jsdoc/",
    "recurse": true,
    "readme": "./README.md"
  },
  "plugins": ["plugins/markdown"],
  "templates": {
    "cleverLinks": false,
    "monospaceLinks": false
  },
  "tags": {
    "allowUnknownTags": true,
    "dictionaries": ["jsdoc", "closure"]
  }
};

// 3. Documentation hub HTML
const hubHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azure APIM MCP Server - Documentation Hub</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 30px 0; }
        .card { border: 1px solid #ddd; border-radius: 6px; padding: 20px; background: #fafafa; transition: transform 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .card h3 { margin-top: 0; color: #34495e; }
        .card a { color: #3498db; text-decoration: none; font-weight: 500; }
        .card a:hover { text-decoration: underline; }
        .stats { background: #ecf0f1; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Azure APIM MCP Server Documentation</h1>
        <p>Complete documentation for the Azure API Management Model Context Protocol Server project.</p>
        
        <div class="stats">
            <strong>Project Type:</strong> Node.js TypeScript MCP Server<br>
            <strong>Generated:</strong> ${new Date().toLocaleDateString()}<br>
            <strong>Documentation Tools:</strong> TypeDoc, JSDoc, Custom Analysis
        </div>

        <div class="grid">
            <div class="card">
                <h3>🔧 TypeDoc Documentation</h3>
                <p>Comprehensive TypeScript API documentation with interfaces, classes, and type definitions.</p>
                <p><a href="./typedoc/index.html">View TypeDoc Documentation →</a></p>
            </div>

            <div class="card">
                <h3>📖 JSDoc Documentation</h3>
                <p>Traditional JavaScript documentation with detailed function and module descriptions.</p>
                <p><a href="./jsdoc/index.html">View JSDoc Documentation →</a></p>
            </div>

            <div class="card">
                <h3>📄 Project README</h3>
                <p>Main project documentation with setup instructions and usage examples.</p>
                <p><a href="../README.md">View Project README →</a></p>
            </div>

            <div class="card">
                <h3>🎯 Azure APIM Scripts</h3>
                <p>Collection of scripts for Azure API Management operations and testing.</p>
                <p><a href="../scripts/">Browse Scripts Directory →</a></p>
            </div>
        </div>

        <h2>🗂️ Project Structure</h2>
        <ul>
            <li><strong>src/</strong> - TypeScript source code</li>
            <li><strong>scripts/</strong> - Utility and testing scripts</li>
            <li><strong>tests/</strong> - Unit and integration tests</li>
            <li><strong>docs/</strong> - Generated documentation</li>
        </ul>

        <div class="footer">
            <p>Documentation generated automatically for Azure APIM MCP Server</p>
        </div>
    </div>
</body>
</html>`;

// Create directories
const docsDir = './docs';
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

// Write configuration files
fs.writeFileSync('./typedoc.json', JSON.stringify(typedocConfig, null, 2));
console.log('✅ Created typedoc.json configuration');

fs.writeFileSync('./jsdoc.json', JSON.stringify(jsdocConfig, null, 2));
console.log('✅ Created jsdoc.json configuration');

fs.writeFileSync(path.join(docsDir, 'index.html'), hubHTML);
console.log('✅ Created documentation hub at docs/index.html');

// Add scripts to package.json
const packageJsonPath = './package.json';
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }
    
    packageJson.scripts['docs:typedoc'] = 'typedoc';
    packageJson.scripts['docs:jsdoc'] = 'jsdoc -c jsdoc.json';
    packageJson.scripts['docs:all'] = 'npm run docs:typedoc && npm run docs:jsdoc';
    packageJson.scripts['docs:serve'] = 'npx http-server docs -p 8080 -o';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added documentation scripts to package.json');
}

console.log('\n🎉 Documentation setup complete!');
console.log('\nAvailable commands:');
console.log('  npm run docs:typedoc  - Generate TypeDoc documentation');
console.log('  npm run docs:jsdoc    - Generate JSDoc documentation');
console.log('  npm run docs:all      - Generate all documentation');
console.log('  npm run docs:serve    - Serve documentation locally');
console.log('\nDocumentation will be available at: ./docs/index.html');