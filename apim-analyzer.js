#!/usr/bin/env node

/**
 * Test completo de Azure APIM - Verificar servicio y APIs
 */

const { spawn } = require('child_process');

console.log('🔍 Análisis completo de Azure APIM');
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
        // Ignorar líneas que no son JSON válido
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
      console.log('✅ Servidor MCP inicializado correctamente');
      console.log(`   Servidor: ${response.result.serverInfo.name} v${response.result.serverInfo.version}`);
      break;
      
    case 2: // tools/list
      console.log(`\n📋 Herramientas disponibles: ${response.result.tools.length}`);
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
                  console.log(`   🌐 Protocolos: ${api.protocols?.join(', ') || 'N/A'}`);
                  console.log(`   🔗 Service URL: ${api.serviceUrl || 'N/A'}`);
                  console.log(`   📄 Descripción: ${api.description || 'N/A'}`);
                  console.log(`   🟢 Estado: ${api.isOnline ? 'Online' : 'Offline'}`);
                  console.log(`   🔐 Suscripción: ${api.subscriptionRequired ? 'Requerida' : 'No requerida'}`);
                });
              } else {
                console.log('📭 No se encontraron APIs en esta instancia de APIM');
                console.log('   Esto es normal para una instancia nueva de Azure APIM');
              }
            } catch (e) {
              console.log(`   Respuesta: ${content.text}`);
            }
          }
        });
      } else {
        console.log('📭 No hay APIs configuradas en tu Azure APIM');
      }
      break;
      
    case 5: // service info
      console.log('\n🏢 Información del servicio APIM:');
      if (response.result.contents && response.result.contents.length > 0) {
        response.result.contents.forEach(content => {
          if (content.text) {
            try {
              const serviceInfo = JSON.parse(content.text);
              console.log(`   Servicio: ${serviceInfo.name || 'N/A'}`);
              console.log(`   Grupo de recursos: ${serviceInfo.resourceGroup || 'N/A'}`);
              console.log(`   Ubicación: ${serviceInfo.location || 'N/A'}`);
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
  console.log('✅ Análisis completado');
  console.log('\n💡 Próximos pasos:');
  console.log('   1. Si no tienes APIs, puedes crear una usando el Azure Portal');
  console.log('   2. Importar APIs existentes desde OpenAPI/Swagger');
  console.log('   3. Usar las herramientas MCP para gestionar APIs');
  console.log('\n🛠️  Herramientas MCP disponibles:');
  console.log('   • create_api_version - Crear versiones de API');
  console.log('   • create_api_revision - Crear revisiones de API');
  console.log('   • get_api - Obtener detalles de API específica');
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
  console.log('2️⃣ Obteniendo herramientas...');
  sendRequest('tools/list');
}, 2000);

setTimeout(() => {
  console.log('3️⃣ Obteniendo recursos...');
  sendRequest('resources/list');
}, 3500);

setTimeout(() => {
  console.log('4️⃣ Listando APIs...');
  sendRequest('tools/call', {
    name: 'list_apis',
    arguments: {}
  });
}, 5000);

setTimeout(() => {
  console.log('5️⃣ Obteniendo info del servicio...');
  sendRequest('resources/read', {
    uri: 'apim://service/info'
  });
}, 6500);

setTimeout(() => {
  server.kill('SIGTERM');
}, 10000);