/**
 * Setup JSDoc with advanced plugins for comprehensive documentation
 * Supports TypeScript, markdown integration, and multiple output formats
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function setupJSDoc() {
    console.log('🚀 Setting up JSDoc with advanced plugins...\n');
    
    try {
        // Install JSDoc and plugins
        console.log('📦 Installing JSDoc and plugins...');
        execSync('npm install --save-dev jsdoc jsdoc-to-markdown better-docs tui-jsdoc-template docdash', {
            stdio: 'inherit'
        });
        
        // Create JSDoc configuration
        console.log('⚙️ Creating JSDoc configuration...');
        const jsdocConfig = {
            "source": {
                "include": [
                    "./src/",
                    "./README.md"
                ],
                "exclude": [
                    "./src/**/*.test.ts",
                    "./src/**/*.spec.ts",
                    "./node_modules/"
                ],
                "includePattern": "\\.(js|ts)$",
                "excludePattern": "(test|spec)\\.(js|ts)$"
            },
            "opts": {
                "destination": "./docs-jsdoc/",
                "recurse": true,
                "readme": "./README.md",
                "package": "./package.json"
            },
            "plugins": [
                "plugins/markdown",
                "plugins/summarize",
                "better-docs/typescript",
                "better-docs/category"
            ],
            "templates": {
                "cleverLinks": false,
                "monospaceLinks": false,
                "better-docs": {
                    "name": "Azure APIM MCP Server Documentation",
                    "logo": "./docs-assets/logo.png",
                    "title": "Azure APIM MCP Server",
                    "css": "./docs-assets/custom-jsdoc.css",
                    "trackingCode": "",
                    "hideGenerator": true,
                    "navLinks": [
                        {
                            "label": "GitHub",
                            "href": "https://github.com/dviana78/test-mcp-repo"
                        },
                        {
                            "label": "API Reference",
                            "href": "#api-reference"
                        }
                    ],
                    "component": {
                        "wrapper": "./docs-templates/wrapper.hbs"
                    }
                }
            },
            "markdown": {
                "parser": "gfm",
                "hardwrap": false
            }
        };
        
        fs.writeFileSync('./jsdoc.conf.json', JSON.stringify(jsdocConfig, null, 2));
        console.log('✅ JSDoc configuration created: jsdoc.conf.json');
        
        // Create custom CSS for JSDoc
        if (!fs.existsSync('./docs-assets')) {
            fs.mkdirSync('./docs-assets', { recursive: true });
        }
        
        const customJSDocCSS = `/* Custom JSDoc Styling */
:root {
    --primary-blue: #0078d4;
    --secondary-blue: #00bcf2;
    --light-blue: #f0f8ff;
    --dark-text: #333333;
    --light-text: #666666;
}

/* Header styling */
.navbar {
    background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue));
    border-bottom: 3px solid var(--secondary-blue);
}

.navbar-brand {
    color: white !important;
    font-weight: bold;
    font-size: 1.5rem;
}

/* Sidebar styling */
#list-nav {
    background-color: var(--light-blue);
    border-right: 2px solid var(--secondary-blue);
}

#list-nav .nav-link {
    color: var(--dark-text);
    border-radius: 4px;
    margin: 2px 5px;
}

#list-nav .nav-link:hover {
    background-color: var(--secondary-blue);
    color: white;
}

#list-nav .nav-link.active {
    background-color: var(--primary-blue);
    color: white;
}

/* Content styling */
.page-header h1 {
    color: var(--primary-blue);
    border-bottom: 3px solid var(--secondary-blue);
    padding-bottom: 10px;
}

.page-header p {
    color: var(--light-text);
    font-size: 1.1rem;
    margin-top: 10px;
}

/* Code blocks */
pre {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-left: 4px solid var(--secondary-blue);
    padding: 15px;
    border-radius: 4px;
}

code {
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
}

/* Tables */
.table {
    border: 1px solid #dee2e6;
}

.table thead th {
    background-color: var(--primary-blue);
    color: white;
    border: none;
}

.table tbody tr:nth-child(odd) {
    background-color: var(--light-blue);
}

/* Method signatures */
.signature {
    background-color: #f8f9fa;
    border-left: 4px solid var(--primary-blue);
    padding: 10px 15px;
    margin: 10px 0;
    border-radius: 4px;
}

/* Parameters */
.param-type {
    color: var(--primary-blue);
    font-weight: bold;
}

.param-name {
    color: var(--dark-text);
    font-family: monospace;
}

/* Returns */
.returns {
    background-color: var(--light-blue);
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
}

/* Examples */
.example {
    background-color: #fff;
    border: 1px solid var(--secondary-blue);
    border-radius: 4px;
    padding: 15px;
    margin: 15px 0;
}

.example h5 {
    color: var(--primary-blue);
    margin-bottom: 10px;
}

/* Responsive design */
@media (max-width: 768px) {
    .navbar-brand {
        font-size: 1.2rem;
    }
    
    #list-nav {
        display: none;
    }
}

/* Print styles */
@media print {
    .navbar, #list-nav {
        display: none;
    }
    
    .main-content {
        margin-left: 0 !important;
    }
}
`;
        
        fs.writeFileSync('./docs-assets/custom-jsdoc.css', customJSDocCSS);
        console.log('✅ Custom JSDoc CSS created');
        
        // Create documentation generation scripts
        const generateMarkdownDocs = `#!/usr/bin/env node
/**
 * Generate markdown documentation from JSDoc comments
 */

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const path = require('path');

async function generateMarkdownDocs() {
    console.log('📖 Generating markdown documentation...');
    
    try {
        // Get all TypeScript files
        const inputFiles = [
            'src/**/*.ts',
            '!src/**/*.test.ts',
            '!src/**/*.spec.ts'
        ];
        
        // Generate comprehensive markdown
        const output = await jsdoc2md.render({
            files: inputFiles,
            configure: './jsdoc.conf.json'
        });
        
        // Write to API.md
        fs.writeFileSync('./docs-jsdoc/API.md', output);
        console.log('✅ Generated API.md');
        
        // Generate module-specific documentation
        const modules = [
            { name: 'ApiManagement', pattern: 'src/services/api-management.service.ts' },
            { name: 'GrpcService', pattern: 'src/services/grpc.service.ts' },
            { name: 'ApiVersioning', pattern: 'src/services/api-versioning.service.ts' },
            { name: 'Types', pattern: 'src/types/*.ts' },
            { name: 'Utils', pattern: 'src/utils/*.ts' }
        ];
        
        for (const module of modules) {
            try {
                const moduleOutput = await jsdoc2md.render({
                    files: module.pattern,
                    configure: './jsdoc.conf.json'
                });
                
                fs.writeFileSync(\`./docs-jsdoc/\${module.name}.md\`, moduleOutput);
                console.log(\`✅ Generated \${module.name}.md\`);
            } catch (error) {
                console.warn(\`⚠️ Could not generate \${module.name}.md:, error.message\`);
            }
        }
        
        console.log('🎉 Markdown documentation generated successfully!');
        
    } catch (error) {
        console.error('❌ Error generating markdown docs:', error.message);
        process.exit(1);
    }
}

generateMarkdownDocs();
`;
        
        fs.writeFileSync('./scripts/docs/generate-markdown-docs.js', generateMarkdownDocs);
        fs.chmodSync('./scripts/docs/generate-markdown-docs.js', '755');
        
        // Update package.json scripts
        console.log('📝 Adding JSDoc scripts to package.json...');
        const packageJsonPath = './package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts['docs:jsdoc'] = 'jsdoc -c jsdoc.conf.json';
        packageJson.scripts['docs:markdown'] = 'node scripts/docs/generate-markdown-docs.js';
        packageJson.scripts['docs:jsdoc:serve'] = 'jsdoc -c jsdoc.conf.json && npx http-server docs-jsdoc -p 8082 -o';
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ JSDoc scripts added to package.json');
        
        console.log('\n🎉 JSDoc setup completed successfully!');
        console.log('\n📋 Available commands:');
        console.log('• npm run docs:jsdoc - Generate HTML documentation');
        console.log('• npm run docs:markdown - Generate markdown documentation');
        console.log('• npm run docs:jsdoc:serve - Generate and serve HTML docs');
        console.log('\n📁 Documentation will be generated in: ./docs-jsdoc/');
        
    } catch (error) {
        console.error('❌ Error setting up JSDoc:', error.message);
        process.exit(1);
    }
}

// Execute
setupJSDoc();