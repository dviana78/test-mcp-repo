#!/usr/bin/env node

/**
 * Test complete de Azure APIM - Verify service y APIs
 */

import { spawn } from 'child_process';

console.log('🔍 Complete Azure APIM Analysis');
console.log('==================================\n');

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
        // Ignore lines that are not JSON válido
      }
    }
  }
});

function handleResponse(response) {
  if (response.Error) {
    console.log(`❌ Error (ID ${response.id}): ${response.Error.message}`);
    return;
  }

  if (!response.result) return;

  switch (response.id) {
    case 1: // initialize
      console.log('✅ MCP Server initialized correctly');
      console.log(`   Server: ${response.result.serverInfo.name} v${response.result.serverInfo.version}`);
      break;
      
    case 2: // tools/list
      console.log(`\n📋 Available tools: ${response.result.tools.length}`);
      response.result.tools.forEach(tool => {
        console.log(`   • ${tool.name} - ${tool.description}`);
      });
      break;
      
    case 3: // resources/list
      console.log(`\n📚 Recursos disponibles: ${response.result.resources.length}`);
      response.result.resources.forEach(resource => {
        console.log(`   • ${resource.name} (${resource.uri})`);
      });
      break;
      
    case 4: // list_apis
      console.log('\n🔍 Resultado de list_apis:');
      if (response.result.content && response.result.content.length > 0) {
        response.result.content.forEach(content => {
          if (content.text) {
            try {
              const apis = JSON.parse(content.text);
              if (Array.isArray(apis) && apis.length > 0) {
                console.log(`\n📊 Se encontraron ${apis.length} APIs:`);
                apis.forEach((api, index) => {
                  console.log(`\n${index + 1}. 📋 ${api.displayName || api.name}`);
                  console.log(`   🆔 ID: ${api.id}`);
                  console.log(`   📍 Path: ${api.path}`);
                  console.log(`   🌐 Protocols: ${api.protocols?.join(', ') || 'N/A'}`);
                  console.log(`   🔗 Service URL: ${api.serviceUrl || 'N/A'}`);
                  console.log(`   📄 Description: ${api.description || 'N/A'}`);
                  console.log(`   🟢 Status: ${api.isOnline ? 'Online' : 'Offline'}`);
                  console.log(`   🔐 Subscription: ${api.subscriptionRequired ? 'Required' : 'Not required'}`);
                });
              } else {
                console.log('📭 No APIs found in this APIM instance');
                console.log('   This is Normal for a new Azure APIM instance');
              }
            } catch (e) {
              console.log(`   Response: ${content.text}`);
            }
          }
        });
      } else {
        console.log('📭 No hay APIs configuradas en tu Azure APIM');
      }
      break;
      
    case 5: // service info
      console.log('\n🏢 Information del service APIM:');
      if (response.result.contents && response.result.contents.length > 0) {
        response.result.contents.forEach(content => {
          if (content.text) {
            try {
              const serviceInfo = JSON.parse(content.text);
              console.log(`   service: ${serviceInfo.name || 'N/A'}`);
              console.log(`   Grupo de recursos: ${serviceInfo.resourceGroup || 'N/A'}`);
              console.log(`   Location: ${serviceInfo.location || 'N/A'}`);
              console.log(`   Tier: ${serviceInfo.sku || 'N/A'}`);
            } catch (e) {
              console.log(`   Info: ${content.text}`);
            }
          }
        });
      }
      break;
  }
}

server.on('close', (code) => {
  console.log('\n=====================================');
  console.log('✅ Analysis completed');
  console.log('\n💡 Next steps:');
  console.log('   1. If you don\'t have APIs, you can create one using the Azure Portal');
  console.log('   2. Import existing APIs from OpenAPI/Swagger');
  console.log('   3. Use MCP tools to manage APIs');
  console.log('\n🛠️  Available MCP tools:');
  console.log('   • create_api_version - Create API versions');
  console.log('   • create_api_revision - Create API revisions');
  console.log('   • get_api - Get specific API details');
});

// Secuencia de pruebas
setTimeout(() => {
  console.log('1️⃣ Inicializando...');
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'apim-analyzer', version: '1.0.0' }
  });
}, 500);

setTimeout(() => {
  console.log('2️⃣ Getting tools...');
  sendRequest('tools/list');
}, 2000);

setTimeout(() => {
  console.log('3️⃣ Getting resources...');
  sendRequest('resources/list');
}, 3500);

setTimeout(() => {
  console.log('4️⃣ Listing APIs...');
  sendRequest('tools/call', {
    name: 'list_apis',
    arguments: {}
  });
}, 5000);

setTimeout(() => {
  console.log('5️⃣ Getting info del service...');
  sendRequest('resources/read', {
    uri: 'apim://service/info'
  });
}, 6500);

setTimeout(() => {
  server.kill('SIGTERM');
}, 10000);