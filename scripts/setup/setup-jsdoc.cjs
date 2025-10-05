/**
 * JSDoc Setup Script
 * Configures JSDoc for JavaScript/TypeScript documentation
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up JSDoc for documentation...\n');

try {
    // Install JSDoc and TypeScript plugin
    console.log('📦 Installing JSDoc...');
    execSync('npm install --save-dev jsdoc jsdoc-typescript-plugin', { stdio: 'inherit' });
    
    // Create JSDoc configuration
    const jsdocConfig = {
        "source": {
            "include": ["src/", "README.md"],
            "includePattern": "\\.(js|ts)$",
            "exclude": ["node_modules/", "dist/", "tests/"]
        },
        "opts": {
            "destination": "./docs/",
            "recurse": true,
            "readme": "./README.md"
        },
        "plugins": [
            "plugins/markdown",
            "jsdoc-typescript-plugin"
        ],
        "templates": {
            "cleverLinks": false,
            "monospaceLinks": false
        },
        "typescript": {
            "moduleRoot": "src"
        }
    };
    
    fs.writeFileSync('jsdoc.json', JSON.stringify(jsdocConfig, null, 2));
    console.log('✅ Created jsdoc.json configuration');
    
    // Update package.json scripts
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }
    
    packageJson.scripts['docs:jsdoc'] = 'jsdoc -c jsdoc.json';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with JSDoc scripts');
    
    console.log('\n🎉 JSDoc setup completed!');
    console.log('\n📚 Available commands:');
    console.log('  npm run docs:jsdoc  - Generate JSDoc documentation');
    
} catch (error) {
    console.error('❌ Error setting up JSDoc:', error.message);
}