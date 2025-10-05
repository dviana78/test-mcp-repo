const fs = require('fs');
const path = require('path');

// Project analysis and documentation generator
console.log('Analyzing Node.js TypeScript project for comprehensive documentation...');

// Function to analyze directory structure
function analyzeDirectory(dirPath, maxDepth = 3, currentDepth = 0) {
    const items = [];
    if (currentDepth >= maxDepth) return items;

    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
            
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                const subItems = analyzeDirectory(fullPath, maxDepth, currentDepth + 1);
                items.push({
                    name: entry.name,
                    type: 'directory',
                    path: fullPath,
                    children: subItems
                });
            } else {
                const ext = path.extname(entry.name);
                const stats = fs.statSync(fullPath);
                
                items.push({
                    name: entry.name,
                    type: 'file',
                    extension: ext,
                    path: fullPath,
                    size: stats.size,
                    modified: stats.mtime
                });
            }
        }
    } catch (error) {
        console.warn(`Could not read directory: ${dirPath}`);
    }
    
    return items;
}

// Function to count lines of code
function countLinesOfCode(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let codeLines = 0;
        let commentLines = 0;
        let emptyLines = 0;
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === '') {
                emptyLines++;
            } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                commentLines++;
            } else {
                codeLines++;
            }
        }
        
        return { total: lines.length, code: codeLines, comments: commentLines, empty: emptyLines };
    } catch (error) {
        return { total: 0, code: 0, comments: 0, empty: 0 };
    }
}

// Function to extract dependencies from package.json
function analyzeDependencies() {
    try {
        const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        return {
            dependencies: Object.keys(packageJson.dependencies || {}),
            devDependencies: Object.keys(packageJson.devDependencies || {}),
            scripts: Object.keys(packageJson.scripts || {})
        };
    } catch (error) {
        return { dependencies: [], devDependencies: [], scripts: [] };
    }
}

// Analyze project structure
const projectStructure = analyzeDirectory('./');
const dependencies = analyzeDependencies();

// Count code statistics
let totalStats = { total: 0, code: 0, comments: 0, empty: 0 };
const fileStats = {};

function analyzeFiles(items) {
    for (const item of items) {
        if (item.type === 'file' && ['.ts', '.js', '.tsx', '.jsx'].includes(item.extension)) {
            const stats = countLinesOfCode(item.path);
            fileStats[item.path] = stats;
            totalStats.total += stats.total;
            totalStats.code += stats.code;
            totalStats.comments += stats.comments;
            totalStats.empty += stats.empty;
        } else if (item.type === 'directory' && item.children) {
            analyzeFiles(item.children);
        }
    }
}

analyzeFiles(projectStructure);

// Generate project analysis HTML
const analysisHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Analysis - Azure APIM MCP Server</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid #3498db; }
        .stat-number { font-size: 2em; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
        .stat-label { color: #7f8c8d; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .section { background: white; margin-bottom: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .section-header { background: #34495e; color: white; padding: 15px 20px; border-radius: 8px 8px 0 0; margin: 0; font-size: 1.2em; }
        .section-content { padding: 20px; }
        .tree { font-family: 'Courier New', monospace; font-size: 0.9em; }
        .tree-item { margin: 2px 0; }
        .tree-directory { color: #3498db; font-weight: bold; }
        .tree-file { color: #2c3e50; }
        .tree-indent { color: #bdc3c7; }
        .dependencies { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .dep-section { background: #ecf0f1; padding: 15px; border-radius: 6px; }
        .dep-list { margin: 10px 0; }
        .dep-item { background: #fff; margin: 5px 0; padding: 8px 12px; border-radius: 4px; border-left: 3px solid #3498db; }
        .code-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .code-stat { text-align: center; background: #f8f9fa; padding: 15px; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Project Analysis</h1>
            <p>Comprehensive analysis of Azure APIM MCP Server codebase</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${totalStats.total.toLocaleString()}</div>
                <div class="stat-label">Total Lines</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalStats.code.toLocaleString()}</div>
                <div class="stat-label">Code Lines</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalStats.comments.toLocaleString()}</div>
                <div class="stat-label">Comments</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(fileStats).length}</div>
                <div class="stat-label">Source Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${dependencies.dependencies.length}</div>
                <div class="stat-label">Dependencies</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${dependencies.devDependencies.length}</div>
                <div class="stat-label">Dev Dependencies</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-header">📁 Project Structure</h2>
            <div class="section-content">
                <div class="tree">
                    ${generateTreeHTML(projectStructure)}
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-header">📊 Code Statistics</h2>
            <div class="section-content">
                <div class="code-stats">
                    <div class="code-stat">
                        <h4>Lines of Code</h4>
                        <div style="font-size: 1.5em; color: #27ae60;">${totalStats.code}</div>
                    </div>
                    <div class="code-stat">
                        <h4>Comments</h4>
                        <div style="font-size: 1.5em; color: #f39c12;">${totalStats.comments}</div>
                    </div>
                    <div class="code-stat">
                        <h4>Empty Lines</h4>
                        <div style="font-size: 1.5em; color: #95a5a6;">${totalStats.empty}</div>
                    </div>
                    <div class="code-stat">
                        <h4>Comment Ratio</h4>
                        <div style="font-size: 1.5em; color: #9b59b6;">${((totalStats.comments / totalStats.total) * 100).toFixed(1)}%</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-header">📦 Dependencies</h2>
            <div class="section-content">
                <div class="dependencies">
                    <div class="dep-section">
                        <h3>Production Dependencies (${dependencies.dependencies.length})</h3>
                        <div class="dep-list">
                            ${dependencies.dependencies.map(dep => `<div class="dep-item">${dep}</div>`).join('')}
                        </div>
                    </div>
                    <div class="dep-section">
                        <h3>Development Dependencies (${dependencies.devDependencies.length})</h3>
                        <div class="dep-list">
                            ${dependencies.devDependencies.map(dep => `<div class="dep-item">${dep}</div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-header">🔗 Quick Links</h2>
            <div class="section-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <a href="./typedoc/README.html" style="display: block; padding: 15px; background: #3498db; color: white; text-decoration: none; border-radius: 6px; text-align: center;">
                        📚 TypeDoc Documentation
                    </a>
                    <a href="../README.md" style="display: block; padding: 15px; background: #27ae60; color: white; text-decoration: none; border-radius: 6px; text-align: center;">
                        📄 Project README
                    </a>
                    <a href="../package.json" style="display: block; padding: 15px; background: #e74c3c; color: white; text-decoration: none; border-radius: 6px; text-align: center;">
                        ⚙️ Package Configuration
                    </a>
                    <a href="../src/" style="display: block; padding: 15px; background: #9b59b6; color: white; text-decoration: none; border-radius: 6px; text-align: center;">
                        💻 Source Code
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

function generateTreeHTML(items, indent = 0) {
    let html = '';
    for (const item of items) {
        const indentStr = '│  '.repeat(indent);
        const connector = indent > 0 ? '├── ' : '';
        
        if (item.type === 'directory') {
            html += `<div class="tree-item"><span class="tree-indent">${indentStr}${connector}</span><span class="tree-directory">${item.name}/</span></div>`;
            if (item.children && item.children.length > 0) {
                html += generateTreeHTML(item.children, indent + 1);
            }
        } else {
            const sizeKB = (item.size / 1024).toFixed(1);
            html += `<div class="tree-item"><span class="tree-indent">${indentStr}${connector}</span><span class="tree-file">${item.name}</span> <span style="color: #95a5a6; font-size: 0.8em;">(${sizeKB} KB)</span></div>`;
        }
    }
    return html;
}

// Write the analysis file
fs.writeFileSync('./docs/analysis.html', analysisHTML);
console.log('✅ Created comprehensive project analysis at docs/analysis.html');

// Update the main documentation hub
const updatedHubHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azure APIM MCP Server - Documentation Hub</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 15px; font-size: 2.5em; margin-bottom: 20px; }
        .subtitle { color: #7f8c8d; font-size: 1.2em; margin-bottom: 30px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin: 30px 0; }
        .card { border: 1px solid #e1e8ed; border-radius: 8px; padding: 25px; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); transition: all 0.3s ease; position: relative; overflow: hidden; }
        .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #3498db, #2ecc71); }
        .card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .card h3 { margin-top: 0; color: #34495e; font-size: 1.3em; margin-bottom: 15px; }
        .card p { color: #7f8c8d; line-height: 1.6; margin-bottom: 20px; }
        .card a { color: #3498db; text-decoration: none; font-weight: 600; font-size: 1.1em; }
        .card a:hover { color: #2980b9; text-decoration: underline; }
        .stats { background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%); padding: 20px; border-radius: 8px; margin: 25px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .stat-item { text-align: center; }
        .stat-number { font-size: 1.8em; font-weight: bold; color: #2c3e50; }
        .stat-label { color: #7f8c8d; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .footer { text-align: center; margin-top: 40px; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 20px; }
        .new-badge { background: #e74c3c; color: white; font-size: 0.7em; padding: 3px 8px; border-radius: 12px; margin-left: 10px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Azure APIM MCP Server Documentation</h1>
        <p class="subtitle">Complete documentation and analysis for the Azure API Management Model Context Protocol Server project.</p>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${totalStats.total.toLocaleString()}</div>
                <div class="stat-label">Total Lines</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalStats.code.toLocaleString()}</div>
                <div class="stat-label">Code Lines</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${Object.keys(fileStats).length}</div>
                <div class="stat-label">Source Files</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${dependencies.dependencies.length + dependencies.devDependencies.length}</div>
                <div class="stat-label">Dependencies</div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>📊 Project Analysis<span class="new-badge">NEW</span></h3>
                <p>Comprehensive analysis of project structure, code statistics, dependencies, and metrics.</p>
                <p><a href="./analysis.html">View Project Analysis →</a></p>
            </div>

            <div class="card">
                <h3>🔧 TypeDoc Documentation</h3>
                <p>Complete TypeScript API documentation with interfaces, classes, and type definitions.</p>
                <p><a href="./typedoc/README.html">View TypeDoc Documentation →</a></p>
            </div>

            <div class="card">
                <h3>📄 Project README</h3>
                <p>Main project documentation with setup instructions, usage examples, and API overview.</p>
                <p><a href="../README.md">View Project README →</a></p>
            </div>

            <div class="card">
                <h3>🎯 Azure APIM Scripts</h3>
                <p>Collection of utility scripts for Azure API Management operations, testing, and automation.</p>
                <p><a href="../scripts/">Browse Scripts Directory →</a></p>
            </div>

            <div class="card">
                <h3>🧪 Test Suite</h3>
                <p>Unit and integration tests for validating MCP server functionality and API operations.</p>
                <p><a href="../tests/">View Test Directory →</a></p>
            </div>

            <div class="card">
                <h3>⚙️ Configuration</h3>
                <p>Project configuration files including TypeScript, Jest, and package settings.</p>
                <p><a href="../package.json">View Package Configuration →</a></p>
            </div>
        </div>

        <h2>🗂️ Project Architecture</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <ul style="list-style-type: none; padding: 0;">
                <li style="margin: 10px 0;"><strong>📁 src/</strong> - TypeScript source code and main application logic</li>
                <li style="margin: 10px 0;"><strong>📁 scripts/</strong> - Utility scripts for testing, automation, and Azure operations</li>
                <li style="margin: 10px 0;"><strong>📁 tests/</strong> - Comprehensive test suite with unit and integration tests</li>
                <li style="margin: 10px 0;"><strong>📁 docs/</strong> - Generated documentation and project analysis</li>
                <li style="margin: 10px 0;"><strong>📄 mcp.json</strong> - Model Context Protocol server configuration</li>
                <li style="margin: 10px 0;"><strong>📄 tsconfig.json</strong> - TypeScript compiler configuration</li>
            </ul>
        </div>

        <div class="footer">
            <p>Documentation automatically generated for Azure APIM MCP Server</p>
            <p>Last updated: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('./docs/index.html', updatedHubHTML);
console.log('✅ Updated documentation hub with project analysis');

console.log('\n🎉 Complete documentation system ready!');
console.log('\n📍 Access points:');
console.log('  📊 Project Analysis: ./docs/analysis.html');
console.log('  📚 Documentation Hub: ./docs/index.html');
console.log('  🔧 TypeDoc API Docs: ./docs/typedoc/README.html');
console.log('\n🚀 Serve locally with: npm run docs:serve');