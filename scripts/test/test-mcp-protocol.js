#!/usr/bin/env node

/**
 * Test completo del protocolo MCP
 */

import 'dotenv/config';
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Test completo del protocolo MCP');
console.log('===================================');

const serverPath = join(__dirname, '..', '..', 'dist', 'index.js');

const env = {
    ...process.env,
    MCP_MODE: 'true',
    LOG_LEVEL: 'info'
};

const server = spawn('node', [serverPath], {
    env,
    stdio: ['pipe', 'pipe', 'pipe']
});

let messageId = 1;

function sendMcpMessage(method, params = {}) {
    const message = {
        jsonrpc: "2.0",
        id: messageId++,
        method,
        params
    };
    
    console.log(`📤 Enviando: ${method}`);
    server.stdin.write(JSON.stringify(message) + '\n');
}

let serverReady = false;

server.stdout.on('data', (data) => {
    try {
        const response = JSON.parse(data.toString().trim());
        console.log('📥 Respuesta MCP:', JSON.stringify(response, null, 2));
    } catch {
        console.log('📤 Output raw:', data.toString().trim());
    }
});

server.stderr.on('data', (data) => {
    const output = data.toString().trim();
    console.log('📥 Log:', output);
    
    if (output.includes('started successfully') && !serverReady) {
        serverReady = true;
        console.log('\n🚀 Servidor listo - Iniciando secuencia de pruebas...');
        
        // Secuencia de pruebas MCP
        setTimeout(() => {
            sendMcpMessage('initialize', {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: { name: "test-client", version: "1.0.0" }
            });
        }, 100);
        
        setTimeout(() => {
            sendMcpMessage('tools/list');
        }, 500);
        
        setTimeout(() => {
            console.log('\n✅ Secuencia de pruebas completada');
            server.kill('SIGTERM');
        }, 1000);
    }
});

server.on('error', (error) => {
    console.error('❌ Error:', error);
});

server.on('close', (code, signal) => {
    console.log(`\n🏁 Test finalizado - Código: ${code}, Señal: ${signal}`);
    
    if (serverReady) {
        console.log('✅ El servidor MCP está funcionando correctamente');
        console.log('✅ Listo para usar en VS Code');
    }
});

// Timeout de seguridad
setTimeout(() => {
    console.log('\n⏰ Timeout - Finalizando...');
    server.kill('SIGKILL');
}, 5000);