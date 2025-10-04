#!/usr/bin/env node

/**
 * Get detailed information about the Swagger Petstore API
 */

import { spawn } from 'child_process';

console.log('🐾 Swagger Petstore API Details');
console.log('===============================\n');

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let requestId = 1;

function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: requestId++,
    method: method,
    params: params
  };
  
  server.stdin.write(JSON.stringify(request) + '\n');
  return requestId - 1;
}

server.stdout.on('data', (data) => {
  const output = data.toString();
  const lines = output.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (line.includes('"jsonrpc"')) {
      try {
        const response = JSON.parse(line);
        handleResponse(response);
      } catch (e) {
        // Ignore non-JSON lines
      }
    }
  }
});

function handleResponse(response) {
  if (response.error) {
    console.log(`❌ Error (ID ${response.id}): ${response.error.message}`);
    return;
  }

  if (!response.result) return;

  switch (response.id) {
    case 1: // initialize
      console.log('✅ Server initialized successfully\n');
      break;
      
    case 2: // get_api
      console.log('📋 API BASIC INFORMATION:');
      console.log('========================');
      if (response.result.content && response.result.content[0]) {
        const data = JSON.parse(response.result.content[0].text);
        const api = data.api;
        
        console.log(`🏷️  Name: ${api.displayName}`);
        console.log(`🆔 ID: ${api.id}`);
        console.log(`📝 Description:`);
        console.log(`   ${api.description.replace(/\n/g, '\n   ')}`);
        console.log(`🌐 Service URL: ${api.serviceUrl}`);
        console.log(`📍 Path: ${api.path || '(root)'}`);
        console.log(`🔒 Protocols: ${api.protocols.join(', ')}`);
        console.log(`🔑 Subscription Required: ${api.subscriptionRequired ? 'Yes' : 'No'}`);
        
        if (api.authenticationSettings) {
          console.log(`🛡️  Authentication: Configured`);
        }
        
        if (api.type) {
          console.log(`📂 API Type: ${api.type}`);
        }
      }
      break;
      
    case 3: // get_api_operations
      console.log('\n🔧 API OPERATIONS:');
      console.log('==================');
      if (response.result.content && response.result.content[0]) {
        const data = JSON.parse(response.result.content[0].text);
        
        console.log(`✅ ${data.message}`);
        console.log(`📊 Total Operations: ${data.operations.length}\n`);
        
        data.operations.forEach((op, index) => {
          console.log(`${index + 1}. 🛠️  ${op.displayName}`);
          console.log(`   📝 Name: ${op.name}`);
          console.log(`   🌐 Method: ${op.method} ${op.urlTemplate}`);
          if (op.description) {
            console.log(`   📖 Description: ${op.description}`);
          }
          console.log('');
        });
      }
      break;
      
    case 4: // get_api_products
      console.log('📦 API PRODUCTS:');
      console.log('================');
      if (response.result.content && response.result.content[0]) {
        const data = JSON.parse(response.result.content[0].text);
        console.log(`✅ ${data.message}`);
        
        if (data.products && data.products.length > 0) {
          console.log(`📊 Total Products: ${data.products.length}\n`);
          data.products.forEach((product, index) => {
            console.log(`${index + 1}. 📦 ${product.displayName}`);
            console.log(`   🆔 ID: ${product.id}`);
            if (product.description) {
              console.log(`   📝 Description: ${product.description}`);
            }
            console.log(`   🔓 State: ${product.state || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log('   ℹ️  No products associated with this API\n');
        }
      }
      break;
      
    case 5: // list_api_revisions
      console.log('🔄 API REVISIONS:');
      console.log('=================');
      if (response.result.content && response.result.content[0]) {
        const data = JSON.parse(response.result.content[0].text);
        console.log(`✅ ${data.message}`);
        
        if (data.revisions && data.revisions.length > 0) {
          console.log(`📊 Total Revisions: ${data.revisions.length}\n`);
          data.revisions.forEach((rev, index) => {
            console.log(`${index + 1}. 🔄 Revision ${rev.apiRevision}`);
            console.log(`   📅 Created: ${new Date(rev.createdDateTime).toLocaleString()}`);
            console.log(`   📝 Description: ${rev.description || 'No description'}`);
            console.log(`   ✅ Current: ${rev.isCurrent ? 'Yes' : 'No'}`);
            if (rev.updatedDateTime) {
              console.log(`   🔄 Updated: ${new Date(rev.updatedDateTime).toLocaleString()}`);
            }
            console.log('');
          });
        }
      }
      break;
      
    case 6: // list_api_versions
      console.log('📋 API VERSIONS:');
      console.log('================');
      if (response.result.content && response.result.content[0]) {
        const data = JSON.parse(response.result.content[0].text);
        console.log(`✅ ${data.message}`);
        
        if (data.versions && data.versions.length > 0) {
          console.log(`📊 Total Versions: ${data.versions.length}\n`);
          data.versions.forEach((version, index) => {
            console.log(`${index + 1}. 📋 ${version.displayName}`);
            console.log(`   🆔 ID: ${version.id}`);
            console.log(`   🏷️  Version ID: ${version.apiVersionId}`);
            if (version.description) {
              console.log(`   📝 Description: ${version.description}`);
            }
            console.log('');
          });
        } else {
          console.log('   ℹ️  No versions found for this API\n');
        }
      }
      break;
  }
}

server.on('close', (code) => {
  console.log('==========================================');
  console.log('🎯 Petstore API Analysis Complete!');
  console.log('==========================================');
});

// Test sequence
setTimeout(() => {
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'petstore-analyzer', version: '1.0.0' }
  });
}, 1000);

setTimeout(() => {
  console.log('🔍 Getting API details...');
  sendRequest('tools/call', {
    name: 'get_api',
    arguments: { apiId: 'swagger-petstore' }
  });
}, 2500);

setTimeout(() => {
  console.log('🔍 Getting API operations...');
  sendRequest('tools/call', {
    name: 'get_api_operations',
    arguments: { apiId: 'swagger-petstore' }
  });
}, 4000);

setTimeout(() => {
  console.log('🔍 Getting API products...');
  sendRequest('tools/call', {
    name: 'get_api_products',
    arguments: { apiId: 'swagger-petstore' }
  });
}, 6000);

setTimeout(() => {
  console.log('🔍 Getting API revisions...');
  sendRequest('tools/call', {
    name: 'list_api_revisions',
    arguments: { apiId: 'swagger-petstore' }
  });
}, 8000);

setTimeout(() => {
  console.log('🔍 Getting API versions...');
  sendRequest('tools/call', {
    name: 'list_api_versions',
    arguments: { apiId: 'swagger-petstore' }
  });
}, 10000);

setTimeout(() => {
  server.kill('SIGTERM');
}, 13000);

process.on('SIGINT', () => {
  server.kill('SIGTERM');
  process.exit(0);
});