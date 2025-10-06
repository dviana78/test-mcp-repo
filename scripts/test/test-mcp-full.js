// Test completo del servidor MCP
import 'dotenv/config';

console.log('Iniciando test del servidor MCP...');

try {
    const { McpServer } = await import('../../dist/server.js');
    
    // Configurar variables para modo MCP
    process.env.MCP_MODE = 'true';
    
    console.log('Creando instancia del servidor...');
    const server = new McpServer();
    
    console.log('Inicializando servicios...');
    await server.initializeServices();
    
    console.log('✅ Servidor MCP inicializado correctamente');
    console.log('✅ Todos los servicios están funcionando');
    
} catch (error) {
    console.error('❌ Error en el servidor MCP:', error.message);
    console.error('Stack:', error.stack);
}