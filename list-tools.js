#!/usr/bin/env node
/**
 * Script to list all available tools in the MCP Server
 */

const { spawn } = require('child_process');
const path = require('path');

async function listTools() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Listing all available tools in MCP Server...\n');
    
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Send initialization request
    const initRequest = {
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'tools-lister', version: '1.0.0' }
      }
    };

    // Send tools list request
    const toolsRequest = {
      method: 'tools/list',
      params: {}
    };

    child.stdin.write(JSON.stringify(initRequest) + '\n');
    setTimeout(() => {
      child.stdin.write(JSON.stringify(toolsRequest) + '\n');
      child.stdin.end();
    }, 1000);

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Request timed out after 15 seconds'));
    }, 15000);

    child.on('close', (code) => {
      clearTimeout(timeout);
      
      try {
        const lines = stdout.trim().split('\n');
        const responses = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);

        // Find the tools list response
        const toolsResponse = responses.find(r => r.result && r.result.tools);
        if (toolsResponse && toolsResponse.result.tools) {
          console.log(`📋 Found ${toolsResponse.result.tools.length} tools available:\n`);
          
          toolsResponse.result.tools.forEach((tool, index) => {
            console.log(`${index + 1}. 🔧 **${tool.name}**`);
            console.log(`   📝 Description: ${tool.description}`);
            
            if (tool.inputSchema && tool.inputSchema.properties) {
              const props = Object.keys(tool.inputSchema.properties);
              console.log(`   🔗 Parameters: ${props.join(', ')}`);
            }
            console.log('');
          });

          // Summary by category
          const restTools = toolsResponse.result.tools.filter(t => 
            t.name.includes('api') && !t.name.includes('grpc')
          ).length;
          
          const grpcTools = toolsResponse.result.tools.filter(t => 
            t.name.includes('grpc')
          ).length;
          
          const versionTools = toolsResponse.result.tools.filter(t => 
            t.name.includes('version') || t.name.includes('revision')
          ).length;
          
          console.log('📊 **Summary by Category:**');
          console.log(`   🌐 REST API Tools: ${restTools}`);
          console.log(`   🔌 gRPC API Tools: ${grpcTools}`);
          console.log(`   📦 Versioning Tools: ${versionTools}`);
          console.log(`   📈 Total Tools: ${toolsResponse.result.tools.length}`);
        } else {
          console.log('❌ No tools found or invalid response format');
        }

        resolve({ success: true, responses, stderr });
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
        console.error('Raw stdout:', stdout);
        resolve({ success: false, error: error.message, stdout, stderr });
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function main() {
  try {
    await listTools();
  } catch (error) {
    console.error('❌ Failed to list tools:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}