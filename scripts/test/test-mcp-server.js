#!/usr/bin/env node

/**
 * Script para probar la inicialización del servidor MCP
 */

import { McpServer } from '../../dist/server.js';
import { Logger } from '../../dist/utils/logger.js';

async function testMcpServer() {
    const logger = new Logger('TestMcpServer');
    
    try {
        logger.info('Iniciando prueba del servidor MCP...');
        
        // Simular modo MCP
        process.env.MCP_MODE = 'true';
        
        const server = new McpServer();
        
        // Intentar inicializar los servicios sin ejecutar el servidor
        await server.initializeServices();
        
        logger.info('✅ Servidor MCP inicializado correctamente');
        logger.info('✅ Servicios de Azure inicializados correctamente');
        
        process.exit(0);
        
    } catch (error) {
        logger.error('❌ Error al inicializar el servidor MCP:', error);
        
        // Mostrar detalles específicos del error
        if (error.message) {
            logger.error('Mensaje de error:', error.message);
        }
        
        if (error.stack) {
            logger.error('Stack trace:', error.stack);
        }
        
        process.exit(1);
    }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    testMcpServer();
}