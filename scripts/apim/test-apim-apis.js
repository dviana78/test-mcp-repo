#!/usr/bin/env node

// Script para probar la connection a Azure APIM y list APIs
import { spawn } from 'child_process';

console.log('🔍 Testing connection to Azure APIM...\n');

// Iniciar el server MCP
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

let messageId = 1;
let serverReady = false;

// Función para enviar mensajes JSON-RPC
function sendMessage(method, params = {}) {
  const message = {
    jsonrpc: '2.0',
    id: messageId++,
    method: method,
    params: params
  };
  
  server.stdin.write(JSON.stringify(message) + '\n');
  console.log('📤 Sending:', method);
}

// Escuchar respuestas del server
server.stdout.on('data', (data) => {
  const response = data.toString().trim();
  if (response) {
    // Filtrar logs del server
    if (response.includes('"jsonrpc"')) {
      try {
        const parsed = JSON.parse(response);
        console.log('📥 Response:', JSON.stringify(parsed, null, 2));
        
        if (parsed.method === undefined && parsed.result && serverReady) {
          // Es una response a nuestro request
          if (parsed.result.content) {
            console.log('\n🎯 Resultado de la API:');
            parsed.result.content.forEach(content => {
              if (content.text) {
                console.log(content.text);
              }
            });
          }
          
          // Cerrar el server después de obtener resultado
          setTimeout(() => {
            server.kill('SIGTERM');
          }, 1000);
        }
      } catch (e) {
        // Ignorar respuestas than no son JSON válido
      }
    } else if (response.includes('started successfully')) {
      serverReady = true;
      // Enviar solicitud para list APIs
      setTimeout(() => {
        console.log('\n2️⃣ Solicitando lista de APIs...');
        sendMessage('tools/call', {
          name: 'list_apis',
          arguments: {}
        });
      }, 1000);
    }
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  if (error.includes('error:')) {
    console.log('⚠️  Error del server:', error);
  }
});

server.on('close', (code) => {
  console.log(`\n🔚 Process finished with code ${code}`);
  if (code !== 0) {
    console.log('\n❌ Connection error. Check:');
    console.log('   - Azure credentials in .env');
    console.log('   - Internet connection');
    console.log('   - Service Principal permissions');
    console.log('   - That subscription and APIM exist');
  }
});

// Secuencia de inicialización
setTimeout(() => {
  console.log('1️⃣ Inicializando server MCP...');
  sendMessage('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'apim-test-client',
      version: '1.0.0'
    }
  });
}, 1000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Terminando prueba...');
  server.kill('SIGTERM');
  process.exit(0);
});

setTimeout(() => {
  console.log('\n⏰ Timeout - cerrando server...');
  server.kill('SIGTERM');
}, 15000);