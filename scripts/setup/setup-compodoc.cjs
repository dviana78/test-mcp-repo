/**
 * Compodoc Setup Script
 * Configures Compodoc for Angular/NestJS-style documentation
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up Compodoc for documentation...\n');

try {
    // Install Compodoc
    console.log('📦 Installing Compodoc...');
    execSync('npm install --save-dev @compodoc/compodoc', { stdio: 'inherit' });
    
    // Create Compodoc configuration
    const compodocConfig = {
        "$schema": "./node_modules/@compodoc/compodoc/package.json",
        "port": 8080,
        "src": "src",
        "output": "docs/compodoc",
        "tsconfig": "tsconfig.json",
        "theme": "material",
        "name": "Azure APIM MCP Server",
        "includeVersion": true,
        "disableSourceCode": false,
        "disableDomTree": false,
        "disableTemplateTab": true,
        "disableStyleTab": true,
        "disableGraph": false,
        "disableCoverage": false,
        "disablePrivate": true,
        "disableProtected": false,
        "disableInternal": false,
        "disableLifeCycleHooks": true,
        "disableRoutesGraph": true,
        "customFavicon": "",
        "gaID": "",
        "gaSite": "auto"
    };
    
    fs.writeFileSync('.compodocrc.json', JSON.stringify(compodocConfig, null, 2));
    console.log('✅ Created .compodocrc.json configuration');
    
    // Update package.json scripts
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }
    
    packageJson.scripts['docs:compodoc'] = 'compodoc -p tsconfig.json -s';
    packageJson.scripts['docs:compodoc:build'] = 'compodoc -p tsconfig.json';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with Compodoc scripts');
    
    console.log('\n🎉 Compodoc setup completed!');
    console.log('\n📚 Available commands:');
    console.log('  npm run docs:compodoc       - Generate and serve docs');
    console.log('  npm run docs:compodoc:build - Generate docs only');
    
} catch (error) {
    console.error('❌ Error setting up Compodoc:', error.message);
}