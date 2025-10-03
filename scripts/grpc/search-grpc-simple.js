#!/usr/bin/env node
/**
 * Simple script to search for gRPC APIs
 */

const { spawn } = require('child_process');
const path = require('path');

async function searchGrpcApis() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Searching for gRPC APIs...\n');
    
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responses = [];
    let currentResponse = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      currentResponse += output;
      
      // Try to parse complete JSON responses
      const lines = currentResponse.split('\n');
      currentResponse = lines.pop(); // Keep incomplete line
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            responses.push(response);
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    });

    // Send initialization
    const initRequest = {
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'grpc-search', version: '1.0.0' }
      }
    };

    child.stdin.write(JSON.stringify(initRequest) + '\n');

    // Wait for initialization, then send list request
    setTimeout(() => {
      const listRequest = {
        method: 'tools/call',
        params: {
          name: 'list_apis',
          arguments: { top: 100 }
        }
      };
      child.stdin.write(JSON.stringify(listRequest) + '\n');
      child.stdin.end();
    }, 1000);

    const timeout = setTimeout(() => {
      child.kill();
      resolve({ responses, timeout: true });
    }, 10000);

    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve({ responses, code });
    });
  });
}

async function main() {
  try {
    const result = await searchGrpcApis();
    
    console.log(`📊 Total responses received: ${result.responses.length}\n`);
    
    // Find the list_apis response
    const listResponse = result.responses.find(r => r.result && r.result.content);
    
    if (listResponse) {
      try {
        const content = JSON.parse(listResponse.result.content[0].text);
        const allApis = content.apis || [];
        
        console.log(`📋 Total APIs found: ${allApis.length}\n`);
        
        // Search for gRPC-related APIs
        const grpcApis = allApis.filter(api => {
          const id = (api.id || '').toLowerCase();
          const displayName = (api.displayName || '').toLowerCase();
          const description = (api.description || '').toLowerCase();
          const path = (api.path || '').toLowerCase();
          
          return id.includes('grpc') || 
                 displayName.includes('grpc') || 
                 description.includes('grpc') ||
                 description.includes('protobuf') ||
                 path.includes('grpc') ||
                 (api.protocols && api.protocols.some(p => p.toLowerCase().includes('grpc')));
        });
        
        if (grpcApis.length > 0) {
          console.log(`🎉 Found ${grpcApis.length} gRPC-related APIs:\n`);
          grpcApis.forEach((api, index) => {
            console.log(`${index + 1}. 🔧 ${api.displayName}`);
            console.log(`   ID: ${api.id}`);
            console.log(`   Path: ${api.path}`);
            console.log(`   Protocols: ${(api.protocols || []).join(', ')}`);
            console.log(`   Service URL: ${api.serviceUrl}`);
            console.log(`   Description: ${api.description.substring(0, 100)}...`);
            console.log(`   Subscription Required: ${api.subscriptionRequired ? 'Yes' : 'No'}\n`);
          });
        } else {
          console.log('❌ No gRPC APIs found in Azure APIM');
          console.log('\n📝 Available APIs:');
          allApis.forEach((api, index) => {
            console.log(`${index + 1}. ${api.displayName} (${api.id})`);
          });
        }
        
      } catch (parseError) {
        console.error('❌ Error parsing API list:', parseError.message);
      }
    } else {
      console.log('❌ No valid list response received');
      if (result.timeout) {
        console.log('⏰ Request timed out');
      }
    }
    
  } catch (error) {
    console.error('❌ Search failed:', error.message);
  }
}

if (require.main === module) {
  main();
}