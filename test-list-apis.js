#!/usr/bin/env node

/**
 * Test directo para listar APIs usando MCP Server
 */

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🔍 Probando herramienta list_apis...\n');

// Crear servidor MCP
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseReceived = false;

// Función para enviar mensaje JSON-RPC
function sendRequest(id, method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: id,
    method: method,
    params: params
  };
  
  const message = JSON.stringify(request) + '\n';
  console.log(`📤 Enviando: ${method}`);
  server.stdin.write(message);
}

// Escuchar stdout (respuestas JSON-RPC)
server.stdout.on('data', (data) => {
  const output = data.toString();
  
  // Filtrar solo las respuestas JSON-RPC
  const lines = output.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (line.includes('"jsonrpc"')) {
      try {
        const response = JSON.parse(line);
        console.log('\n📥 Respuesta recibida:');
        
        if (response.result) {
          if (response.result.content && response.result.content.length > 0) {
            console.log('\n🎯 APIs encontradas:');
            response.result.content.forEach(content => {
              if (content.text) {
                try {
                  const apis = JSON.parse(content.text);
                  if (Array.isArray(apis)) {
                    apis.forEach((api, index) => {
                      console.log(`\n${index + 1}. ${api.displayName || api.name}`);
                      console.log(`   ID: ${api.id}`);
                      console.log(`   Path: ${api.path}`);
                      console.log(`   Protocols: ${api.protocols?.join(', ') || 'N/A'}`);
                      console.log(`   Status: ${api.isOnline ? '🟢 Online' : '🔴 Offline'}`);
                    });
                  }
                } catch (e) {
                  console.log(content.text);
                }
              }
            });
          } else if (response.result.tools) {
            console.log('✅ Herramientas disponibles:', response.result.tools.length);
          } else if (response.result.serverInfo) {
            console.log('✅ Servidor inicializado correctamente');
          }
        } else if (response.error) {
          console.log(`❌ Error: ${response.error.message}`);
          console.log(`   Código: ${response.error.code}`);
        }
        
        responseReceived = true;
      } catch (e) {
        // No es JSON válido, probablemente es log del servidor
      }
    }
  }
});

// Escuchar stderr (logs de error)
server.stderr.on('data', (data) => {
  const error = data.toString();
  if (error.includes('error:')) {
    console.log(`⚠️  Error del servidor: ${error.trim()}`);
  }
});

server.on('close', (code) => {
  console.log(`\n🔚 Servidor cerrado con código: ${code}`);
});

// Secuencia de prueba
console.log('1. Inicializando servidor MCP...');
setTimeout(() => {
  sendRequest(1, 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'api-test-client',
      version: '1.0.0'
    }
  });
}, 1000);

setTimeout(() => {
  console.log('\n2. Solicitando herramientas disponibles...');
  sendRequest(2, 'tools/list');
}, 3000);

setTimeout(() => {
  console.log('\n3. Ejecutando list_apis...');
  sendRequest(3, 'tools/call', {
    name: 'list_apis',
    arguments: {}
  });
}, 5000);

// Timeout de seguridad
setTimeout(() => {
  if (!responseReceived) {
    console.log('\n⏰ Timeout - no se recibió respuesta');
  }
  server.kill('SIGTERM');
}, 15000);

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Interrumpido por usuario');
  server.kill('SIGTERM');
  process.exit(0);
});