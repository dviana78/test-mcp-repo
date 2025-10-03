#!/usr/bin/env node
/**
 * Script to check gRPC APIs specifically in Azure APIM
 */

const { spawn } = require('child_process');
const path = require('path');

async function runMCPCommand(request) {
  return new Promise((resolve, reject) => {
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

    // Send the JSON-RPC request
    const requestStr = JSON.stringify(request) + '\n';
    child.stdin.write(requestStr);
    child.stdin.end();

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Request timed out after 30 seconds'));
    }, 30000);

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

        resolve({ responses, stderr });
      } catch (error) {
        resolve({ error: error.message, stdout, stderr });
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function main() {
  console.log('🔍 Searching for gRPC APIs in Azure APIM...\n');

  try {
    // Test 1: List all APIs with different filters
    console.log('📋 Test 1: List all APIs with large top parameter...');
    const listResult = await runMCPCommand({
      method: 'tools/call',
      params: {
        name: 'list_apis',
        arguments: { top: 1000 }
      }
    });
    
    if (listResult.responses && listResult.responses.length > 0) {
      const apiResponse = listResult.responses.find(r => r.result);
      if (apiResponse && apiResponse.result) {
        try {
          const result = JSON.parse(apiResponse.result.content[0].text);
          console.log(`✅ Found ${result.apis.length} APIs total`);
          
          // Look for gRPC APIs specifically
          const grpcApis = result.apis.filter(api => 
            api.id.includes('grpc') || 
            api.displayName.toLowerCase().includes('grpc') ||
            (api.protocols && api.protocols.some(p => p.includes('grpc')))
          );
          
          if (grpcApis.length > 0) {
            console.log(`🎉 Found ${grpcApis.length} potential gRPC APIs:`);
            grpcApis.forEach(api => {
              console.log(`  - ${api.displayName} (ID: ${api.id})`);
              console.log(`    Path: ${api.path}`);
              console.log(`    Protocols: ${api.protocols.join(', ')}`);
              console.log(`    Service URL: ${api.serviceUrl}\n`);
            });
          } else {
            console.log('❌ No gRPC APIs found in the standard list');
          }
          
          // Show all APIs for reference
          console.log('\n📝 All APIs found:');
          result.apis.forEach(api => {
            console.log(`  • ${api.displayName} (${api.id}) - ${api.protocols.join(', ')}`);
          });
          
        } catch (parseError) {
          console.error('❌ Failed to parse API list response');
        }
      }
    }

    // Test 2: Try to get specific gRPC APIs by ID
    const grpcApiIds = [
      'grpc-user-service-test',
      'grpc-inventory-service-v1',
      'grpc-order-service-query',
      'grpc-notification-service-header'
    ];

    console.log('\n🎯 Test 2: Checking specific gRPC API IDs...');
    for (const apiId of grpcApiIds) {
      try {
        console.log(`\n🔍 Checking API: ${apiId}`);
        const getResult = await runMCPCommand({
          method: 'tools/call',
          params: {
            name: 'get_api',
            arguments: { apiId }
          }
        });
        
        if (getResult.responses && getResult.responses.length > 0) {
          const response = getResult.responses.find(r => r.result);
          if (response && response.result) {
            try {
              const apiInfo = JSON.parse(response.result.content[0].text);
              console.log(`✅ Found gRPC API: ${apiInfo.displayName}`);
              console.log(`   Type: ${apiInfo.apiType || 'N/A'}`);
              console.log(`   Protocols: ${apiInfo.protocols.join(', ')}`);
              console.log(`   Path: ${apiInfo.path}`);
              console.log(`   Service URL: ${apiInfo.serviceUrl}`);
            } catch (parseError) {
              console.log(`❌ Found but failed to parse response for ${apiId}`);
            }
          } else {
            console.log(`❌ API ${apiId} not found or no valid response`);
          }
        }
      } catch (error) {
        console.log(`❌ Error checking ${apiId}: ${error.message}`);
      }
    }

    // Test 3: List with filter for gRPC
    console.log('\n🔎 Test 3: List APIs with gRPC filter...');
    const filterResult = await runMCPCommand({
      method: 'tools/call',
      params: {
        name: 'list_apis',
        arguments: { 
          filter: "contains(name,'grpc') or contains(displayName,'grpc') or contains(displayName,'gRPC')",
          top: 100
        }
      }
    });
    
    if (filterResult.responses && filterResult.responses.length > 0) {
      const response = filterResult.responses.find(r => r.result);
      if (response && response.result) {
        try {
          const result = JSON.parse(response.result.content[0].text);
          if (result.apis && result.apis.length > 0) {
            console.log(`✅ Filter found ${result.apis.length} gRPC APIs:`);
            result.apis.forEach(api => {
              console.log(`  - ${api.displayName} (${api.id})`);
            });
          } else {
            console.log('❌ No APIs found with gRPC filter');
          }
        } catch (parseError) {
          console.log('❌ Failed to parse filtered response');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error during gRPC API search:', error.message);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  });
}