#!/usr/bin/env node

import 'dotenv/config';
import { McpServer, setupGracefulShutdown } from './server.js';
import { Logger } from './utils/logger.js';

async function main(): Promise<void> {
  const logger = new Logger('Main');
  
  try {
    logger.info('Initializing Azure APIM MCP Server');
    
    const server = new McpServer();
    setupGracefulShutdown(server);
    
    await server.run();
  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
// Fixed condition for Windows compatibility
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` ||
                     process.argv[1]?.endsWith('index.js') ||
                     process.argv[1]?.endsWith('dist/index.js');

if (isMainModule) {
  main().catch((error) => {
    // En modo MCP, escribir a stderr para no interferir con stdout
    if (process.env.MCP_MODE === 'true') {
      process.stderr.write(`Fatal error: ${error}\n`);
    } else {
      console.error('Fatal error:', error);
    }
    process.exit(1);
  });
}

export { McpServer } from './server.js';
export * from './types/index.js';
export * from './services/index.js';
export * from './handlers/index.js';
export * from './config/index.js';







