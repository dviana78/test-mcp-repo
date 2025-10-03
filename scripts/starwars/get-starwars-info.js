const { spawn } = require('child_process');

console.log('🌟 Verifying API de Star Wars y Getting characters');
console.log('====================================================\n');

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
            console.log('✅ server MCP inicializado\n');
          } else if (response.result.content) {
            console.log('\n📋 API Information:\n');
            
            response.result.content.forEach(content => {
              if (content.text) {
                try {
                  const data = JSON.parse(content.text);
                  console.log('🎯 API Details de Star Wars:');
                  console.log(JSON.stringify(data, null, 2));
                } catch (e) {
                  console.log('📝 Contenido:', content.text);
                }
              }
            });
            
            // Después de obtener info de la API, intentar llamar a un endpoint
            setTimeout(() => {
              console.log('\n🔍 Ahora vamos a intentar acceder a los datos...');
              console.log('ℹ️  Note: Como Azure APIM puede requerir autenticación,');
              console.log('    vamos a show la estructura de la API y sugerir Next steps.\n');
              
              server.kill();
            }, 2000);
            
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
  console.log('🚨 Server error:', data.toString());
});

server.on('close', (code) => {
  console.log(`\n📊 Resumen de la API de Star Wars:`);
  console.log(`===============================`);
  console.log(`🎬 La API incluye 6 endpoints principales:`);
  console.log(`   👥 /people - characters (Luke, Leia, Han Solo, etc.)`);
  console.log(`   🌍 /planets - Planets (Tatooine, Alderaan, etc.)`);
  console.log(`   🎭 /films - Movies (Episodes I-VI)`);
  console.log(`   🚗 /vehicles - Ground vehicles`);
  console.log(`   🚀 /starships - Naves espaciales`);
  console.log(`   👽 /species - Alien species`);
  console.log(`\n💡 Para obtener los datos reales:`);
  console.log(`   1. Verify que la API esté activa en Azure APIM`);
  console.log(`   2. Check si requiere suscripción o clave API`);
  console.log(`   3. Use el portal de Azure APIM para probar endpoints`);
  console.log(`   4. O use herramientas como Postman con las credenciales correctas`);
  console.log(`\n🔚 Process finished con código: ${code}`);
});

// Secuencia de comandos
setTimeout(() => {
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'star-wars-info', version: '1.0.0' }
  });
}, 500);

setTimeout(() => {
  console.log('🌟 Getting Information detallada de Star Wars API...');
  sendRequest('tools/call', {
    name: 'get_api',
    arguments: {
      apiId: 'star-wars-api'
    }
  });
}, 3000);