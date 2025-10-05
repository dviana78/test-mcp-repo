/**
 * Microsoft API Extractor Setup Script
 * Configures API Extractor and API Documenter for enterprise-grade documentation
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up Microsoft API Extractor...\n');

try {
    // Install API Extractor and API Documenter
    console.log('📦 Installing Microsoft API tools...');
    execSync('npm install --save-dev @microsoft/api-extractor @microsoft/api-documenter', { stdio: 'inherit' });
    
    // Create API Extractor configuration
    const apiExtractorConfig = {
        "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
        "mainEntryPointFilePath": "<projectFolder>/dist/index.d.ts",
        "bundledPackages": [],
        "compiler": {
            "tsconfigFilePath": "<projectFolder>/tsconfig.json"
        },
        "apiReport": {
            "enabled": true,
            "reportFolder": "<projectFolder>/temp/",
            "reportTempFolder": "<projectFolder>/temp/"
        },
        "docModel": {
            "enabled": true,
            "apiJsonFilePath": "<projectFolder>/temp/<unscopedPackageName>.api.json"
        },
        "dtsRollup": {
            "enabled": true,
            "untrimmedFilePath": "<projectFolder>/dist/<unscopedPackageName>.d.ts",
            "publicTrimmedFilePath": "<projectFolder>/dist/<unscopedPackageName>.d.ts"
        },
        "tsdocMetadata": {
            "enabled": false
        },
        "messages": {
            "compilerMessageReporting": {
                "default": {
                    "logLevel": "warning"
                }
            },
            "extractorMessageReporting": {
                "default": {
                    "logLevel": "warning"
                }
            },
            "tsdocMessageReporting": {
                "default": {
                    "logLevel": "warning"
                }
            }
        }
    };
    
    fs.writeFileSync('api-extractor.json', JSON.stringify(apiExtractorConfig, null, 2));
    console.log('✅ Created api-extractor.json configuration');
    
    // Update package.json scripts
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }
    
    packageJson.scripts['docs:extract'] = 'api-extractor run --local --verbose';
    packageJson.scripts['docs:document'] = 'api-documenter markdown --input-folder temp --output-folder docs/api';
    packageJson.scripts['docs:api'] = 'npm run build && npm run docs:extract && npm run docs:document';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with API Extractor scripts');
    
    console.log('\n🎉 API Extractor setup completed!');
    console.log('\n📚 Available commands:');
    console.log('  npm run docs:extract   - Extract API surface');
    console.log('  npm run docs:document  - Generate API documentation');
    console.log('  npm run docs:api       - Full API documentation pipeline');
    
} catch (error) {
    console.error('❌ Error setting up API Extractor:', error.message);
}