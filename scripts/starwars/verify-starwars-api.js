import { spawn } from 'child_process';

console.log('🔍 Verifying Star Wars API Configuration');
console.log('==================================================\n');

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
            console.log('✅ server MCP inicializado\n');
          } else if (response.result.content) {
            response.result.content.forEach(content => {
              if (content.text) {
                try {
                  const data = JSON.parse(content.text);
                  
                  if (data.api) {
                    console.log('📋 API Configuration:');
                    console.log(`   ID: ${data.api.id}`);
                    console.log(`   Nombre: ${data.api.displayName}`);
                    console.log(`   Path: ${data.api.path}`);
                    console.log(`   Service URL: ${data.api.serviceUrl}`);
                    console.log(`   Protocolos: ${data.api.protocols?.join(', ')}`);
                    console.log(`   Subscription required: ${data.api.subscriptionRequired ? 'Yes' : 'No'}`);
                    
                    // Construir URL complete
                    const baseUrl = `https://apim-dviana78-dev.azure-api.net`;
                    const fullPath = data.api.path ? `/${data.api.path}` : '';
                    console.log(`   🌐 URL Base: ${baseUrl}${fullPath}`);
                  } else if (data.operations) {
                    console.log('\n🔧 Operations disponibles:');
                    data.operations.forEach((op, index) => {
                      console.log(`   ${index + 1}. ${op.method} ${op.urlTemplate || op.path}`);
                      console.log(`      Nombre: ${op.displayName || op.name}`);
                    });
                  } else if (data.subscription) {
                    console.log('\n🔑 Subscription details:');
                    console.log(`   ID: ${data.subscription.id}`);
                    console.log(`   Estado: ${data.subscription.state}`);
                    console.log(`   Clave primaria: ${data.subscription.primaryKey || 'No visible'}`);
                  }
                } catch (e) {
                  console.log('📝 Response:', content.text);
                }
              }
            });
          }
        } else if (response.Error) {
          console.log(`❌ Error: ${response.Error.message}`);
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
  console.log(`\n💡 Information to access a la API:`);
  console.log('=====================================');
  console.log('1. URL Base: https://apim-dviana78-dev.azure-api.net/swapi/v1');
  console.log('2. Header: Ocp-Apim-Subscription-Key: [tu-clave]');
  console.log('3. endpoints: /people, /planets, /films, etc.');
  console.log('\n🔍 Si el endpoint No funciona, es posible than:');
  console.log('   - La API is configured incorrectly');
  console.log('   - The backend service No is responding');
  console.log('   - Se necesite una Configuration adicional en APIM');
  console.log(`\n🔚 Process completed con code: ${code}`);
});

// Verification sequence
setTimeout(() => {
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'verify-api', version: '1.0.0' }
  });
}, 500);

setTimeout(() => {
  console.log('🔍 Getting API Details...');
  sendRequest('tools/call', {
    name: 'get_api',
    arguments: {
      apiId: 'star-wars-api'
    }
  });
}, 3000);

setTimeout(() => {
  console.log('\n🔧 Getting API Operations...');
  sendRequest('tools/call', {
    name: 'get_api_operations',
    arguments: {
      apiId: 'star-wars-api'
    }
  });
}, 6000);

setTimeout(() => {
  console.log('\n🔑 Verifying subscription...');
  sendRequest('tools/call', {
    name: 'get_subscription',
    arguments: {
      subscriptionId: 'star-wars-subscription'
    }
  });
}, 9000);

setTimeout(() => {
  server.kill();
}, 12000);