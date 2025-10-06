// Test de protocolo MCP
import 'dotenv/config';

console.log('Probando protocolo MCP...');

// Simular solicitud de inicialización MCP
const initMessage = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
            name: "test-client",
            version: "1.0.0"
        }
    }
};

console.log('Mensaje de inicialización:', JSON.stringify(initMessage));

try {
    const { McpServer } = await import('./dist/server.js');
    
    process.env.MCP_MODE = 'true';
    const server = new McpServer();
    
    console.log('✅ Servidor creado, listo para protocolo MCP');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}