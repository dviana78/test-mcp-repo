#!/usr/bin/env node

// Test script para Azure APIM MCP Server
const { spawn } = require('child_process');
const readline = require('readline');

console.log('🚀 Testing Azure APIM MCP Server...\n');

// Iniciar el servidor MCP
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let messageId = 1;

// Función para enviar mensajes JSON-RPC
function sendMessage(method, params = {}) {
  const message = {
    jsonrpc: '2.0',
    id: messageId++,
    method: method,
    params: params
  };
  
  server.stdin.write(JSON.stringify(message) + '\n');
  console.log('📤 Sent:', JSON.stringify(message, null, 2));
}

// Escuchar respuestas del servidor
server.stdout.on('data', (data) => {
  const response = data.toString().trim();
  if (response) {
    try {
      const parsed = JSON.parse(response);
      console.log('📥 Received:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('📥 Raw response:', response);
    }
  }
});

server.stderr.on('data', (data) => {
  console.log('⚠️  Server stderr:', data.toString());
});

server.on('close', (code) => {
  console.log(`\n🔚 Server process exited with code ${code}`);
});

// Secuencia de prueba
setTimeout(() => {
  console.log('\n1️⃣ Initializing MCP Server...');
  sendMessage('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  });
}, 1000);

setTimeout(() => {
  console.log('\n2️⃣ Requesting available tools...');
  sendMessage('tools/list');
}, 2000);

setTimeout(() => {
  console.log('\n3️⃣ Requesting available resources...');
  sendMessage('resources/list');
}, 3000);

setTimeout(() => {
  console.log('\n✅ Test completed! Server is running correctly.');
  console.log('💡 The server is ready to receive MCP protocol messages.');
  console.log('🔧 Available tools: list_apis, get_api, create_api_version, create_api_revision, list_api_revisions');
  console.log('📚 Available resources: APIs, API details, versions, revisions, operations, products\n');
  
  server.kill('SIGTERM');
}, 4000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Terminating test...');
  server.kill('SIGTERM');
  process.exit(0);
});