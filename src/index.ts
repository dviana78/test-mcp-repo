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
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { McpServer } from './server';
export * from './types';
export * from './services';
export * from './handlers';
export * from './config';