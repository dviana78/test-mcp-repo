#!/usr/bin/env node

/**
 * Script de diagnóstico para el servidor MCP
 * Simula la inicialización de VS Code MCP
 */

import 'dotenv/config';
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Diagnóstico del servidor MCP');
console.log('================================');

// Simular la ejecución del servidor MCP como lo haría VS Code
const serverPath = join(__dirname, '..', '..', 'dist', 'index.js');
console.log('📂 Ruta del servidor:', serverPath);

const env = {
    ...process.env,
    MCP_MODE: 'true',
    LOG_LEVEL: 'info',
    NODE_ENV: 'production'
};

console.log('🔧 Variables de entorno MCP:');
console.log('   MCP_MODE:', env.MCP_MODE);
console.log('   LOG_LEVEL:', env.LOG_LEVEL);
console.log('   NODE_ENV:', env.NODE_ENV);

console.log('\n🚀 Iniciando servidor MCP...');

const server = spawn('node', [serverPath], {
    env,
    stdio: ['pipe', 'pipe', 'pipe']
});

let initSent = false;

server.stdout.on('data', (data) => {
    console.log('📤 STDOUT:', data.toString().trim());
    
    // Enviar mensaje de inicialización después de que el servidor esté listo
    if (!initSent && data.toString().includes('initialized')) {
        console.log('\n📨 Enviando mensaje de inicialización MCP...');
        
        const initMessage = {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: {
                    name: "debug-client",
                    version: "1.0.0"
                }
            }
        };
        
        server.stdin.write(JSON.stringify(initMessage) + '\n');
        initSent = true;
        
        // Timeout para finalizar el test
        setTimeout(() => {
            console.log('\n✅ Test completado - Finalizando servidor...');
            server.kill('SIGTERM');
        }, 2000);
    }
});

server.stderr.on('data', (data) => {
    console.log('📥 STDERR:', data.toString().trim());
});

server.on('error', (error) => {
    console.error('❌ Error del proceso servidor:', error);
});

server.on('close', (code, signal) => {
    console.log(`\n🏁 Servidor finalizado con código: ${code}, señal: ${signal}`);
    
    if (code === 0) {
        console.log('✅ El servidor MCP funciona correctamente');
    } else {
        console.log('❌ El servidor MCP tiene problemas');
    }
});

// Timeout de seguridad
setTimeout(() => {
    console.log('\n⏰ Timeout - Finalizando test...');
    server.kill('SIGKILL');
}, 10000);