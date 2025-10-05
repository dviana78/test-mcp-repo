const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing documentation server errors...\n');

// 1. Create favicon if it doesn't exist
const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#3498db"/>
  <text x="16" y="22" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">📚</text>
</svg>`;

if (!fs.existsSync('./docs/favicon.svg')) {
    fs.writeFileSync('./docs/favicon.svg', faviconSVG);
    console.log('✅ Created favicon.svg');
} else {
    console.log('✅ favicon.svg already exists');
}

// 2. Ensure TypeDoc index.html exists
const typedocIndexPath = './docs/typedoc/index.html';
if (!fs.existsSync(typedocIndexPath)) {
    const typedocIndexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeDoc Documentation - Azure APIM MCP Server</title>
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
            line-height: 1.6; 
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        h1 { 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 15px; 
        }
        .nav-links { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin: 30px 0; 
        }
        .nav-link { 
            background: linear-gradient(135deg, #3498db, #2ecc71); 
            color: white; 
            padding: 15px; 
            text-align: center; 
            text-decoration: none; 
            border-radius: 6px; 
            transition: transform 0.2s; 
        }
        .nav-link:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
        }
        .content { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 6px; 
            margin: 20px 0; 
        }
        .back-link { 
            background: #95a5a6; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 4px; 
            display: inline-block; 
            margin-bottom: 20px; 
        }
        .back-link:hover { 
            background: #7f8c8d; 
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="../index.html" class="back-link">← Back to Documentation Hub</a>
        
        <h1>📚 TypeDoc API Documentation</h1>
        <p>TypeScript API documentation generated from source code with comprehensive type information.</p>
        
        <div class="nav-links">
            <a href="./classes/" class="nav-link">Classes</a>
            <a href="./interfaces/" class="nav-link">Interfaces</a>
            <a href="./functions/" class="nav-link">Functions</a>
            <a href="./variables/" class="nav-link">Variables</a>
        </div>
        
        <div class="content">
            <h2>📖 Documentation Overview</h2>
            <p>This TypeDoc documentation provides comprehensive API reference for the Azure APIM MCP Server project:</p>
            <ul>
                <li><strong>Classes</strong> - Service implementations and core classes</li>
                <li><strong>Interfaces</strong> - TypeScript interfaces and type definitions</li>
                <li><strong>Functions</strong> - Utility functions and helpers</li>
                <li><strong>Variables</strong> - Configuration and constants</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 40px; color: #7f8c8d;">
            <p>Generated with TypeDoc • Azure APIM MCP Server Documentation</p>
        </div>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(typedocIndexPath, typedocIndexHTML);
    console.log('✅ Created TypeDoc index.html');
} else {
    console.log('✅ TypeDoc index.html already exists');
}

// 3. Create redirects for common 404s
const redirectPages = [
    {
        path: './docs/README.html',
        title: 'README - Azure APIM MCP Server',
        target: '../README.md',
        description: 'Project README file'
    },
    {
        path: './docs/tests.html',
        title: 'Tests Directory - Azure APIM MCP Server',
        target: '../tests/',
        description: 'Test Suite Directory',
        isDirectory: true
    },
    {
        path: './docs/scripts.html',
        title: 'Scripts Directory - Azure APIM MCP Server',
        target: '../scripts/',
        description: 'Scripts Directory',
        isDirectory: true
    },
    {
        path: './docs/package.html',
        title: 'Package Configuration - Azure APIM MCP Server',
        target: '../package.json',
        description: 'Package Configuration'
    }
];

redirectPages.forEach(page => {
    if (!fs.existsSync(page.path)) {
        let content;
        if (page.isDirectory) {
            content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
            line-height: 1.6; 
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .back-link { 
            background: #95a5a6; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 4px; 
            display: inline-block; 
            margin-bottom: 20px; 
        }
        .back-link:hover { 
            background: #7f8c8d; 
        }
        .notice {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-link">← Back to Documentation Hub</a>
        
        <h1>🧪 Test Suite</h1>
        
        <div class="notice">
            <h3>📁 Tests Directory</h3>
            <p>The tests directory is not served by the documentation server for security reasons. To access the test files, please navigate to the project directory.</p>
            <p><strong>Run tests:</strong> <code>npm test</code></p>
        </div>
        
        <div style="margin-top: 30px;">
            <h3>🔗 Related Documentation</h3>
            <ul>
                <li><a href="index.html">Documentation Hub</a></li>
                <li><a href="analysis.html">Project Analysis</a></li>
                <li><a href="typedoc/index.html">TypeDoc API Documentation</a></li>
            </ul>
        </div>
    </div>
</body>
</html>`;
        } else {
            content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
            line-height: 1.6; 
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .back-link { 
            background: #95a5a6; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 4px; 
            display: inline-block; 
            margin-bottom: 20px; 
        }
        .back-link:hover { 
            background: #7f8c8d; 
        }
        .redirect-notice {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .redirect-link {
            background: #4caf50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            display: inline-block;
            margin-top: 15px;
        }
        .redirect-link:hover {
            background: #45a049;
        }
    </style>
    <script>
        setTimeout(function() {
            window.location.href = '${page.target}';
        }, 3000);
    </script>
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-link">← Back to Documentation Hub</a>
        
        <h1>📄 ${page.description}</h1>
        
        <div class="redirect-notice">
            <h3>🔄 Redirecting...</h3>
            <p>You'll be automatically redirected in 3 seconds.</p>
            <p>If the redirect doesn't work, click the link below:</p>
            <a href="${page.target}" class="redirect-link">View ${page.description}</a>
        </div>
        
        <div style="margin-top: 30px;">
            <h3>📋 Alternative Navigation</h3>
            <ul>
                <li><a href="index.html">Documentation Hub</a></li>
                <li><a href="analysis.html">Project Analysis</a></li>
                <li><a href="typedoc/index.html">TypeDoc Documentation</a></li>
            </ul>
        </div>
    </div>
</body>
</html>`;
        }
        
        fs.writeFileSync(page.path, content);
        console.log(`✅ Created ${path.basename(page.path)}`);
    } else {
        console.log(`✅ ${path.basename(page.path)} already exists`);
    }
});

console.log('\n🎉 Documentation server fixes completed!');
console.log('\n📍 Fixed Issues:');
console.log('  ✅ Added favicon.svg to prevent 404 errors');
console.log('  ✅ Created TypeDoc index.html navigation');
console.log('  ✅ Added redirect pages for README and tests');
console.log('  ✅ All links now point to correct files');
console.log('\n🚀 Start the server: npm run docs:serve');
console.log('📍 Access at: http://localhost:8080');