const { spawn } = require('child_process');

console.log('🔧 Listing de Tools Disponibles en MCP Server');
console.log('==============================================\n');

const server = spawn('Node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd()
});

let buffer = '';

server.stdout.on('data', (data) => {
  buffer += data.toString();
  
  const lines = buffer.split('\n');
  buffer = lines.pop();
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        
        if (response.result && response.result.tools) {
          console.log(`✅ Total de tools encontradas: ${response.result.tools.length}\n`);
          
          response.result.tools.forEach((tool, index) => {
            console.log(`${index + 1}. 🛠️  ${tool.name}`);
            console.log(`   📝 Description: ${tool.description}`);
            
            if (tool.inputSchema && tool.inputSchema.properties) {
              const required = tool.inputSchema.required || [];
              const optional = Object.keys(tool.inputSchema.properties).filter(p => !required.includes(p));
              
              if (required.length > 0) {
                console.log(`   ✅ Required parameters: ${required.join(', ')}`);
              }
              if (optional.length > 0) {
                console.log(`   📋 Optional parameters: ${optional.join(', ')}`);
              }
            }
            console.log('');
          });
          
          server.kill();
        }
      } catch (e) {
        // Ignore lines that are not JSON
      }
    }
  });
});

server.on('close', () => {
  console.log('🔚 Analysis completed');
});

// Inicializar y solicitar tools
setTimeout(() => {
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'tools-lister', version: '1.0.0' }
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
}, 500);

setTimeout(() => {
  const toolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
  };
  
  server.stdin.write(JSON.stringify(toolsRequest) + '\n');
}, 2000);