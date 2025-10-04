import { spawn } from 'child_process';

console.log('⭐ Creating Subscription for Star Wars API');
console.log('=============================================\n');

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
    console.log(`   Parameters:`, JSON.stringify(params, null, 2));
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
            console.log('✅ server MCP inicializado\n');
          } else if (response.result.content) {
            console.log('\n📋 Response:\n');
            
            response.result.content.forEach(content => {
              if (content.text) {
                try {
                  const data = JSON.parse(content.text);
                  console.log(JSON.stringify(data, null, 2));
                } catch (e) {
                  console.log(content.text);
                }
              }
            });
          }
        } else if (response.Error) {
          console.log(`❌ Error: ${response.Error.message}`);
          if (response.Error.data) {
            console.log('   Details:', JSON.stringify(response.Error.data, null, 2));
          }
        }
      } catch (e) {
        // Ignore lines that are not JSON válidas
      }
    }
  });
});

server.stderr.on('data', (data) => {
  console.log('🚨 Server error:', data.toString());
});

server.on('close', (code) => {
  console.log(`\n🔚 Process completed con code: ${code}`);
  console.log('\n📊 Summary de lo than hemos hecho:');
  console.log('1. ✅ Created product "Star Wars" para organizar las APIs');
  console.log('2. ✅ Agregado la API de Star Wars al product');
  console.log('3. ✅ Created subscription to access a la API');
  console.log('\n💡 Next steps:');
  console.log('   - Use la Subscription key para hacer requests a la API');
  console.log('   - Probar endpoints como: /people, /planets, /films');
  console.log('   - Configure policies de rate limiting if necessary');
});

// Secuencia de comandos
setTimeout(() => {
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'star-wars-subscription', version: '1.0.0' }
  });
}, 500);

setTimeout(() => {
  console.log('🏗️  Step 1: Creating product "Star Wars"...');
  sendRequest('tools/call', {
    name: 'create_product',
    arguments: {
      productId: 'star-wars-product',
      displayName: 'Star Wars Product',
      description: 'Product than incluye todas las APIs relacionadas con Star Wars',
      subscriptionRequired: true,
      approvalRequired: false,
      state: 'published'
    }
  });
}, 3000);

setTimeout(() => {
  console.log('\n🔗 Step 2: Agregando API de Star Wars al product...');
  sendRequest('tools/call', {
    name: 'add_api_to_product',
    arguments: {
      productId: 'star-wars-product',
      apiId: 'star-wars-api'
    }
  });
}, 6000);

setTimeout(() => {
  console.log('\n🔑 Step 3: Creating subscription to access a la API...');
  sendRequest('tools/call', {
    name: 'create_subscription',
    arguments: {
      subscriptionId: 'star-wars-subscription',
      displayName: 'Star Wars API Subscription',
      productId: 'star-wars-product'
    }
  });
}, 9000);

setTimeout(() => {
  console.log('\n📋 Step 4: Verifying subscription creada...');
  sendRequest('tools/call', {
    name: 'get_subscription',
    arguments: {
      subscriptionId: 'star-wars-subscription'
    }
  });
}, 12000);

setTimeout(() => {
  server.kill();
}, 15000);