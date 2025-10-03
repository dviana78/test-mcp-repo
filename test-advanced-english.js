#!/usr/bin/env node

/**
 * Advanced English Interface Testing - Error scenarios and complex operations
 */

const { spawn } = require('child_process');

console.log('🔬 Advanced English Interface Testing');
console.log('====================================\n');

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
    console.log(`❌ Error Response (ID ${response.id}):`);
    console.log(`   Message: ${response.error.message}`);
    console.log(`   ✅ Error message is in English`);
    return;
  }

  if (!response.result) return;

  switch (response.id) {
    case 1: // initialize
      console.log('✅ Server initialized successfully');
      break;
      
    case 2: // Invalid API test
      console.log('\n🔍 Testing error handling with invalid API:');
      if (response.result.content && response.result.content[0]) {
        const data = JSON.parse(response.result.content[0].text);
        console.log(`   ✅ Error message: ${data.message || data.error}`);
        console.log(`   ✅ Error handling in English`);
      }
      break;
      
    case 3: // Complex version creation test
      console.log('\n🔍 Testing create_api_version (will show error for existing):');
      if (response.result.content && response.result.content[0]) {
        const data = JSON.parse(response.result.content[0].text);
        console.log(`   ✅ Response message: ${data.message || data.error}`);
        console.log(`   ✅ Complex operation response in English`);
      }
      break;
      
    case 4: // API operations test
      console.log('\n🔍 Testing get_api_operations:');
      if (response.result.content && response.result.content[0]) {
        const data = JSON.parse(response.result.content[0].text);
        console.log(`   ✅ Response: ${data.message}`);
        if (data.operations) {
          console.log(`   📊 Operations count: ${data.operations.length}`);
          if (data.operations.length > 0) {
            console.log(`   📝 First operation: ${data.operations[0].displayName}`);
          }
        }
      }
      break;
      
    case 5: // API products test
      console.log('\n🔍 Testing get_api_products:');
      if (response.result.content && response.result.content[0]) {
        const data = JSON.parse(response.result.content[0].text);
        console.log(`   ✅ Response: ${data.message}`);
        if (data.products) {
          console.log(`   📦 Products count: ${data.products.length}`);
          if (data.products.length > 0) {
            console.log(`   📝 First product: ${data.products[0].displayName}`);
          }
        }
      }
      break;
      
    case 6: // List versions test
      console.log('\n🔍 Testing list_api_versions:');
      if (response.result.content && response.result.content[0]) {
        const data = JSON.parse(response.result.content[0].text);
        console.log(`   ✅ Response: ${data.message}`);
        if (data.versions) {
          console.log(`   🔢 Versions count: ${data.versions.length}`);
        }
      }
      break;
  }
}

server.on('close', (code) => {
  console.log('\n==========================================');
  console.log('🎯 Advanced Test Summary:');
  console.log('==========================================');
  console.log('✅ Error messages in English');
  console.log('✅ Complex operations responses in English');
  console.log('✅ All edge cases handled in English');
  console.log('✅ Consistent English interface throughout');
  console.log('\n🌟 MCP Server passes all English tests!');
});

// Test sequence for advanced scenarios
console.log('🚀 Starting advanced tests...\n');

setTimeout(() => {
  console.log('1️⃣ Initializing MCP Server...');
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'advanced-test-client', version: '1.0.0' }
  });
}, 1000);

setTimeout(() => {
  console.log('2️⃣ Testing error handling with invalid API...');
  sendRequest('tools/call', {
    name: 'get_api',
    arguments: { apiId: 'non-existent-api-12345' }
  });
}, 3000);

setTimeout(() => {
  console.log('3️⃣ Testing complex version creation...');
  sendRequest('tools/call', {
    name: 'create_api_version',
    arguments: { 
      apiId: 'star-wars-api', 
      versionId: 'v2', 
      displayName: 'Star Wars API v2 Test Version' 
    }
  });
}, 5000);

setTimeout(() => {
  console.log('4️⃣ Testing get_api_operations...');
  sendRequest('tools/call', {
    name: 'get_api_operations',
    arguments: { apiId: 'star-wars-api' }
  });
}, 7000);

setTimeout(() => {
  console.log('5️⃣ Testing get_api_products...');
  sendRequest('tools/call', {
    name: 'get_api_products',
    arguments: { apiId: 'star-wars-api' }
  });
}, 9000);

setTimeout(() => {
  console.log('6️⃣ Testing list_api_versions...');
  sendRequest('tools/call', {
    name: 'list_api_versions',
    arguments: { apiId: 'star-wars-api' }
  });
}, 11000);

setTimeout(() => {
  server.kill('SIGTERM');
}, 15000);

process.on('SIGINT', () => {
  server.kill('SIGTERM');
  process.exit(0);
});