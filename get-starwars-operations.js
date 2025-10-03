const { spawn } = require('child_process');

console.log('🌟 API Operations de Star Wars');
console.log('====================================\n');

const server = spawn('Node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd()
});

let buffer = '';
let requestId = 1;

function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id: requestId++,
    method: method,
    params: params
  };
  
  console.log(`📤 Sending: ${method}`);
  if (Object.keys(params).length > 0) {
    console.log(`   Parámetros:`, JSON.stringify(params, null, 2));
  }
  
  server.stdin.write(JSON.stringify(request) + '\n');
}

server.stdout.on('data', (data) => {
  buffer += data.toString();
  
  const lines = buffer.split('\n');
  buffer = lines.pop();
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        
        if (response.result) {
          if (response.result.serverInfo) {
            console.log('✅ server inicializado correctamente\n');
          } else if (response.result.content) {
            console.log('\n🎯 API Operations de Star Wars:\n');
            
            response.result.content.forEach(content => {
              if (content.text) {
                try {
                  const data = JSON.parse(content.text);
                  
                  if (data.operations && Array.isArray(data.operations)) {
                    console.log(`📊 Total de operaciones encontradas: ${data.operations.length}\n`);
                    
                    data.operations.forEach((op, index) => {
                      console.log(`${index + 1}. 🔧 ${op.method?.toUpperCase() || 'N/A'} ${op.urlTemplate || op.path || 'N/A'}`);
                      console.log(`   📝 Nombre: ${op.displayName || op.name || 'N/A'}`);
                      console.log(`   📄 Descripción: ${op.description || 'No description'}`);
                      
                      if (op.request) {
                        if (op.request.queryParameters && op.request.queryParameters.length > 0) {
                          console.log(`   🔍 Query Params: ${op.request.queryParameters.map(p => p.name).join(', ')}`);
                        }
                        if (op.request.headers && op.request.headers.length > 0) {
                          console.log(`   📋 Headers: ${op.request.headers.map(h => h.name).join(', ')}`);
                        }
                      }
                      
                      if (op.responses && op.responses.length > 0) {
                        const statusCodes = op.responses.map(r => r.statusCode).join(', ');
                        console.log(`   📤 Respuestas: ${statusCodes}`);
                      }
                      
                      console.log('');
                    });
                  } else {
                    console.log('📋 Datos recibidos:');
                    console.log(JSON.stringify(data, null, 2));
                  }
                } catch (e) {
                  console.log('📝 Contenido:', content.text);
                }
              }
            });
            
            server.kill();
          }
        } else if (response.Error) {
          console.log(`❌ Error: ${response.Error.message}`);
          if (response.Error.data) {
            console.log('   Detalles:', JSON.stringify(response.Error.data, null, 2));
          }
        }
      } catch (e) {
        // Ignore lines that are not JSON válidas
      }
    }
  });
});

server.stderr.on('data', (data) => {
  console.log('🚨 Error:', data.toString());
});

server.on('close', (code) => {
  console.log(`\n🔚 Process finished con código: ${code}`);
});

// Secuencia de comandos
setTimeout(() => {
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'star-wars-operations', version: '1.0.0' }
  });
}, 500);

setTimeout(() => {
  console.log('\n🌟 Getting operaciones de Star Wars API...');
  sendRequest('tools/call', {
    name: 'get_api_operations',
    arguments: {
      apiId: 'star-wars-api'
    }
  });
}, 3000);