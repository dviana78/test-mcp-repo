#!/usr/bin/env node

/**
 * MCP Server Configuration Helper
 * This script helps configure and test MCP server integration with VS Code
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔧 MCP Server Configuration Helper');
console.log('===================================\n');

// Check if project is built
console.log('1️⃣ Checking if project is built...');
const distExists = fs.existsSync(path.join(process.cwd(), 'dist', 'index.js'));

if (!distExists) {
  console.log('❌ Project not built. Building now...');
  const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Project built successfully\n');
      continueSetup();
    } else {
      console.log('❌ Build failed. Please fix build errors first.');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Project is built\n');
  continueSetup();
}

function continueSetup() {
  // Check mcp.json configuration
  console.log('2️⃣ Checking mcp.json configuration...');
  
  try {
    const mcpConfig = JSON.parse(fs.readFileSync('mcp.json', 'utf8'));
    console.log('✅ mcp.json found and valid');
    
    // Check if servers have type: stdio
    let needsUpdate = false;
    for (const [serverName, config] of Object.entries(mcpConfig.mcpServers || {})) {
      if (!config.type || config.type !== 'stdio') {
        needsUpdate = true;
        break;
      }
    }
    
    if (needsUpdate) {
      console.log('⚠️  mcp.json needs type: "stdio" for VS Code integration');
    } else {
      console.log('✅ mcp.json properly configured with stdio type');
    }
    
  } catch (error) {
    console.log('❌ Error reading mcp.json:', error.message);
  }
  
  console.log('\n3️⃣ Testing MCP Server...');
  testMCPServer();
}

function testMCPServer() {
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let serverWorking = false;
  
  server.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('"jsonrpc"') && output.includes('"result"')) {
      serverWorking = true;
    }
  });
  
  // Test with initialize request
  const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "config-test", version: "1.0.0" }
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  
  setTimeout(() => {
    server.kill('SIGTERM');
    
    if (serverWorking) {
      console.log('✅ MCP Server is working correctly\n');
      showNextSteps();
    } else {
      console.log('❌ MCP Server not responding correctly');
      showTroubleshooting();
    }
  }, 3000);
  
  server.on('error', (err) => {
    console.log('❌ Server error:', err.message);
    showTroubleshooting();
  });
}

function showNextSteps() {
  console.log('📋 Next Steps for VS Code Integration:');
  console.log('=====================================');
  console.log('');
  console.log('1. Install MCP Extension in VS Code:');
  console.log('   - Open VS Code Extension Marketplace');
  console.log('   - Search for "Model Context Protocol" or "MCP"');
  console.log('   - Install the official MCP extension');
  console.log('');
  console.log('2. Configure VS Code User Settings:');
  console.log('   - Press Ctrl+Shift+P');
  console.log('   - Search "Preferences: Open User Settings (JSON)"');
  console.log('   - Add this configuration:');
  console.log('');
  console.log('   {');
  console.log('     "mcp.servers": {');
  console.log('       "azure-apim": {');
  console.log('         "type": "stdio",');
  console.log(`         "command": "node",`);
  console.log(`         "args": ["${path.resolve('dist/index.js')}"],`);
  console.log(`         "cwd": "${process.cwd()}",`);
  console.log('         "env": {');
  console.log('           "NODE_ENV": "production",');
  console.log('           "LOG_LEVEL": "info"');
  console.log('         }');
  console.log('       }');
  console.log('     }');
  console.log('   }');
  console.log('');
  console.log('3. Restart VS Code completely');
  console.log('');
  console.log('4. Look for MCP commands in Command Palette (Ctrl+Shift+P)');
  console.log('   or try using "@azure-apim" in GitHub Copilot chat');
  console.log('');
  console.log('🎯 Your MCP server configuration is ready!');
}

function showTroubleshooting() {
  console.log('\n🐛 Troubleshooting:');
  console.log('===================');
  console.log('1. Make sure all Azure environment variables are set:');
  console.log('   - AZURE_SUBSCRIPTION_ID');
  console.log('   - AZURE_RESOURCE_GROUP');
  console.log('   - AZURE_APIM_SERVICE_NAME');
  console.log('   - AZURE_CLIENT_ID');
  console.log('   - AZURE_CLIENT_SECRET');
  console.log('   - AZURE_TENANT_ID');
  console.log('');
  console.log('2. Try building the project again: npm run build');
  console.log('3. Test manually: node dist/index.js');
  console.log('4. Check logs in logs/ directory for detailed errors');
}

process.on('SIGINT', () => {
  console.log('\n\n⏹️  Configuration helper stopped');
  process.exit(0);
});