#!/usr/bin/env Node

/**
 * Test directo para listar APIs usando MCP Server
 */

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🔍 Testing herramienta list_apis...\n');

// Crear server MCP
const server = spawn('Node', ['dist/index.js'], {
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
  console.log(`📤 Sending: ${method}`);
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
            console.log('✅ Available tools:', response.result.tools.length);
          } else if (response.result.serverInfo) {
            console.log('✅ Server initialized correctly');
          }
        } else if (response.Error) {
          console.log(`❌ Error: ${response.Error.message}`);
          console.log(`   Código: ${response.Error.code}`);
        }
        
        responseReceived = true;
      } catch (e) {
        // Not valid JSON, probablemente es log del server
      }
    }
  }
});

// Escuchar stderr (logs de Error)
server.stderr.on('data', (data) => {
  const Error = data.toString();
  if (Error.includes('Error:')) {
    console.log(`⚠️  Server error: ${Error.trim()}`);
  }
});

server.on('close', (code) => {
  console.log(`\n🔚 server cerrado con código: ${code}`);
});

// Secuencia de prueba
console.log('1. Inicializando server MCP...');
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
  console.log('\n2. Requesting available tools...');
  sendRequest(2, 'tools/list');
}, 3000);

setTimeout(() => {
  console.log('\n3. Executing list_apis...');
  sendRequest(3, 'tools/call', {
    name: 'list_apis',
    arguments: {}
  });
}, 5000);

// Timeout de seguridad
setTimeout(() => {
  if (!responseReceived) {
    console.log('\n⏰ Timeout - No se recibió respuesta');
  }
  server.kill('SIGTERM');
}, 15000);

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Interrumpido por usuario');
  server.kill('SIGTERM');
  process.exit(0);
});