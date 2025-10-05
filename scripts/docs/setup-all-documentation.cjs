/**
 * Master documentation setup script
 * Configures all documentation tools and creates a unified documentation system
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupAllDocumentation() {
    console.log('🚀 Setting up comprehensive documentation system...\n');
    console.log('This will configure TypeDoc, Compodoc, and JSDoc for complete project documentation\n');
    
    try {
        // Create docs directory structure
        console.log('📁 Creating documentation directory structure...');
        const docDirs = [
            './docs',
            './docs-compodoc', 
            './docs-jsdoc',
            './docs-pages',
            './docs-includes',
            './docs-assets',
            './docs-templates',
            './scripts/docs'
        ];
        
        docDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`  ✅ Created ${dir}`);
            }
        });
        
        // Install all documentation dependencies
        console.log('\n📦 Installing documentation dependencies...');
        const dependencies = [
            'typedoc',
            'typedoc-plugin-markdown', 
            'typedoc-plugin-mermaid',
            '@typedoc/plugin-pages',
            '@compodoc/compodoc',
            'jsdoc',
            'jsdoc-to-markdown',
            'better-docs',
            'tui-jsdoc-template',
            'docdash'
        ];
        
        execSync(`npm install --save-dev ${dependencies.join(' ')}`, {
            stdio: 'inherit'
        });
        
        // Setup individual tools
        console.log('\n⚙️ Setting up documentation tools...');
        
        // Run individual setup scripts
        console.log('🔧 Setting up TypeDoc...');
        execSync('node scripts/docs/setup-typedoc.cjs', { stdio: 'inherit' });
        
        console.log('🔧 Setting up Compodoc...');
        execSync('node scripts/docs/setup-compodoc.cjs', { stdio: 'inherit' });
        
        console.log('🔧 Setting up JSDoc...');
        execSync('node scripts/docs/setup-jsdoc.cjs', { stdio: 'inherit' });
        
        // Create unified documentation index
        console.log('\n📋 Creating unified documentation index...');
        const unifiedIndex = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azure APIM MCP Server - Documentation Hub</title>
    <style>
        :root {
            --primary-color: #0078d4;
            --secondary-color: #00bcf2;
            --accent-color: #f0f8ff;
            --text-color: #333;
            --border-color: #e1e5e9;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 50px;
            background: white;
            padding: 40px 20px;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            color: var(--primary-color);
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 1.2rem;
        }
        
        .docs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .doc-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border-top: 4px solid var(--primary-color);
        }
        
        .doc-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .doc-card h3 {
            color: var(--primary-color);
            margin-bottom: 15px;
            font-size: 1.5rem;
        }
        
        .doc-card p {
            margin-bottom: 20px;
            color: #666;
            line-height: 1.6;
        }
        
        .doc-links {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            display: inline-block;
        }
        
        .btn-primary {
            background: var(--primary-color);
            color: white;
        }
        
        .btn-secondary {
            background: var(--secondary-color);
            color: white;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .features {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .features h2 {
            color: var(--primary-color);
            margin-bottom: 20px;
            text-align: center;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .feature {
            padding: 20px;
            background: var(--accent-color);
            border-radius: 10px;
            text-align: center;
        }
        
        .feature h4 {
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .docs-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Azure APIM MCP Server</h1>
            <p>Comprehensive Documentation Hub</p>
        </div>
        
        <div class="docs-grid">
            <div class="doc-card">
                <h3>🔧 TypeDoc Documentation</h3>
                <p>Complete TypeScript API reference with type information, interfaces, and detailed method documentation. Best for developers working with the TypeScript codebase.</p>
                <div class="doc-links">
                    <a href="./docs/index.html" class="btn btn-primary">View TypeDoc</a>
                    <a href="./docs/modules.html" class="btn btn-secondary">Browse Modules</a>
                </div>
            </div>
            
            <div class="doc-card">
                <h3>📊 Compodoc Documentation</h3>
                <p>Interactive documentation with dependency graphs, coverage reports, and visual architecture overview. Ideal for understanding project structure and relationships.</p>
                <div class="doc-links">
                    <a href="./docs-compodoc/index.html" class="btn btn-primary">View Compodoc</a>
                    <a href="./docs-compodoc/dependencies.html" class="btn btn-secondary">Dependency Graph</a>
                </div>
            </div>
            
            <div class="doc-card">
                <h3>📖 JSDoc Documentation</h3>
                <p>Traditional JavaScript documentation with enhanced TypeScript support. Includes detailed examples, usage patterns, and markdown integration.</p>
                <div class="doc-links">
                    <a href="./docs-jsdoc/index.html" class="btn btn-primary">View JSDoc</a>
                    <a href="./docs-jsdoc/API.md" class="btn btn-secondary">API Reference</a>
                </div>
            </div>
        </div>
        
        <div class="features">
            <h2>📋 Documentation Features</h2>
            <div class="features-grid">
                <div class="feature">
                    <h4>🎯 API Reference</h4>
                    <p>Complete method signatures, parameters, and return types</p>
                </div>
                <div class="feature">
                    <h4>🏗️ Architecture</h4>
                    <p>Visual dependency graphs and system architecture</p>
                </div>
                <div class="feature">
                    <h4>📊 Coverage</h4>
                    <p>Documentation coverage reports and metrics</p>
                </div>
                <div class="feature">
                    <h4>💡 Examples</h4>
                    <p>Code examples and usage patterns</p>
                </div>
                <div class="feature">
                    <h4>🔍 Search</h4>
                    <p>Full-text search across all documentation</p>
                </div>
                <div class="feature">
                    <h4>📱 Responsive</h4>
                    <p>Mobile-friendly documentation design</p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated with ❤️ using TypeDoc, Compodoc, and JSDoc</p>
            <p>Azure APIM MCP Server Documentation Hub</p>
        </div>
    </div>
</body>
</html>`;
        
        fs.writeFileSync('./docs/index.html', unifiedIndex);
        console.log('✅ Created unified documentation index');
        
        // Create master documentation generation script
        const masterScript = `#!/usr/bin/env node
/**
 * Master documentation generation script
 * Generates all documentation formats and creates unified hub
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Generating comprehensive project documentation...');

try {
    // Build project first
    console.log('🔨 Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Generate TypeDoc documentation
    console.log('📚 Generating TypeDoc documentation...');
    execSync('npm run docs:generate', { stdio: 'inherit' });
    
    // Generate Compodoc documentation  
    console.log('📊 Generating Compodoc documentation...');
    execSync('npm run docs:compodoc', { stdio: 'inherit' });
    
    // Generate JSDoc documentation
    console.log('📖 Generating JSDoc documentation...');
    execSync('npm run docs:jsdoc', { stdio: 'inherit' });
    execSync('npm run docs:markdown', { stdio: 'inherit' });
    
    // Copy additional files
    console.log('📋 Copying additional documentation files...');
    const additionalFiles = [
        'README.md',
        'FEATURES.md', 
        'PROJECT_COMPLETION_REPORT.md',
        'TOOLS_SUMMARY.md'
    ];
    
    additionalFiles.forEach(file => {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, \`./docs/\${file}\`);
            fs.copyFileSync(file, \`./docs-compodoc/\${file}\`);
            fs.copyFileSync(file, \`./docs-jsdoc/\${file}\`);
            console.log(\`  ✅ Copied \${file} to all documentation folders\`);
        }
    });
    
    console.log('\\n🎉 All documentation generated successfully!');
    console.log('\\n📁 Documentation locations:');
    console.log('• Main Hub: ./docs/index.html');
    console.log('• TypeDoc: ./docs/');
    console.log('• Compodoc: ./docs-compodoc/');
    console.log('• JSDoc: ./docs-jsdoc/');
    console.log('\\n🌐 To serve all documentation:');
    console.log('npm run docs:serve:all');
    
} catch (error) {
    console.error('❌ Error generating documentation:', error.message);
    process.exit(1);
}
`;
        
        fs.writeFileSync('./scripts/docs/generate-all-docs.js', masterScript);
        fs.chmodSync('./scripts/docs/generate-all-docs.js', '755');
        
        // Update package.json with master scripts
        console.log('📝 Adding master documentation scripts...');
        const packageJsonPath = './package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts['docs:all'] = 'node scripts/docs/generate-all-docs.js';
        packageJson.scripts['docs:serve:all'] = 'npx http-server . -p 8080 -o /docs/index.html';
        packageJson.scripts['docs:clean'] = 'rimraf docs docs-compodoc docs-jsdoc';
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        
        // Create GitHub Actions workflow for documentation
        const githubWorkflow = `name: Generate and Deploy Documentation

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  documentation:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Generate documentation
      run: npm run docs:all
      
    - name: Deploy to GitHub Pages
      if: github.ref == 'refs/heads/main'
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs
        destination_dir: docs
`;
        
        if (!fs.existsSync('./.github/workflows')) {
            fs.mkdirSync('./.github/workflows', { recursive: true });
        }
        fs.writeFileSync('./.github/workflows/documentation.yml', githubWorkflow);
        console.log('✅ Created GitHub Actions workflow for documentation');
        
        console.log('\n🎉 Comprehensive documentation system setup completed!');
        console.log('\n📋 Available commands:');
        console.log('• npm run docs:all - Generate all documentation');
        console.log('• npm run docs:serve:all - Serve documentation hub');
        console.log('• npm run docs:clean - Clean all documentation');
        console.log('\n🌐 Documentation will be available at:');
        console.log('• Main Hub: http://localhost:8080/docs/index.html');
        console.log('• TypeDoc: http://localhost:8080/docs/');
        console.log('• Compodoc: http://localhost:8081');
        console.log('• JSDoc: http://localhost:8082');
        console.log('\n📁 All documentation will be committed to the repository in:');
        console.log('• ./docs/ (TypeDoc + Hub)');
        console.log('• ./docs-compodoc/ (Compodoc)');
        console.log('• ./docs-jsdoc/ (JSDoc)');
        
    } catch (error) {
        console.error('❌ Error setting up documentation system:', error.message);
        process.exit(1);
    }
}

// Execute
setupAllDocumentation();