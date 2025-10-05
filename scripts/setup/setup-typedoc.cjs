/**
 * TypeDoc Setup Script
 * Installs and configures TypeDoc for TypeScript documentation generation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up TypeDoc for TypeScript documentation...\n');

try {
    // Install TypeDoc
    console.log('📦 Installing TypeDoc...');
    execSync('npm install --save-dev typedoc @types/node', { stdio: 'inherit' });
    
    // Create TypeDoc configuration
    const typedocConfig = {
        "entryPoints": ["src/index.ts"],
        "out": "docs",
        "theme": "default",
        "name": "Azure APIM MCP Server Documentation",
        "excludePrivate": true,
        "excludeProtected": false,
        "excludeInternal": true,
        "readme": "README.md",
        "includeVersion": true,
        "searchInComments": true,
        "sort": ["source-order"],
        "gitRevision": "main",
        "plugin": [],
        "categorizeByGroup": true,
        "defaultCategory": "Other",
        "categoryOrder": [
            "Services",
            "Interfaces", 
            "Types",
            "Utils",
            "Other"
        ]
    };
    
    fs.writeFileSync('typedoc.json', JSON.stringify(typedocConfig, null, 2));
    console.log('✅ Created typedoc.json configuration');
    
    // Update package.json scripts
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }
    
    packageJson.scripts['docs:generate'] = 'typedoc';
    packageJson.scripts['docs:serve'] = 'cd docs && python -m http.server 8080';
    packageJson.scripts['docs:clean'] = 'rimraf docs';
    packageJson.scripts['docs:build'] = 'npm run docs:clean && npm run docs:generate';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with documentation scripts');
    
    console.log('\n🎉 TypeDoc setup completed!');
    console.log('\n📚 Available commands:');
    console.log('  npm run docs:generate  - Generate documentation');
    console.log('  npm run docs:serve     - Serve docs locally');
    console.log('  npm run docs:build     - Clean and generate docs');
    console.log('  npm run docs:clean     - Remove docs folder');
    
} catch (error) {
    console.error('❌ Error setting up TypeDoc:', error.message);
}