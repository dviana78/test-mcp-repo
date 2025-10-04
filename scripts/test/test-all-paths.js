const https = require('https');

console.log('🔍 Testing Diferentes Paths en APIM');
console.log('====================================');

const subscriptionKey = 'd5fde29d155f4f0194e259d07818ec61';

// Diferentes paths para probar
const pathsToTest = [
    '/swapi/v1/people',     // Sin barra final
    '/swapi/v1/people/',    // Con barra final
    '/swapi/people/',       // No version
    '/swapi/people',        // No version ni barra
    '/api/people/',         // Path original del backend
    '/api/people'           // Path original sin barra
];

async function testPath(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'apim-dviana78-dev.azure-api.net',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'User-Agent': 'Node.js APIM Path Test'
            }
        };

        console.log(`\n🧪 Testing: ${path}`);

        const req = https.request(options, (res) => {
            console.log(`   📡 Status: ${res.statusCode}`);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log(`   ✅ Success: ${jsonData.count} characters found`);
                        resolve({ path, success: true, data: jsonData });
                    } catch (Error) {
                        console.log(`   ⚠️  Status 200 pero Error JSON: ${Error.message}`);
                        resolve({ path, success: false, Error: Error.message });
                    }
                } else {
                    console.log(`   ❌ Error ${res.statusCode}: ${data}`);
                    resolve({ path, success: false, status: res.statusCode, Error: data });
                }
            });
        });

        req.on('Error', (Error) => {
            console.log(`   ❌ Connection error: ${Error.message}`);
            resolve({ path, success: false, Error: Error.message });
        });

        req.end();
    });
}

async function testAllPaths() {
    const results = [];
    
    for (const path of pathsToTest) {
        const result = await testPath(path);
        results.push(result);
    }
    
    console.log('\n📊 Summary de Resultados:');
    console.log('=========================');
    
    const successful = results.filter(r => r.success);
    if (successful.length > 0) {
        console.log('✅ Paths than funcionan:');
        successful.forEach(r => {
            console.log(`   - ${r.path}`);
        });
    } else {
        console.log('❌ Ningún path funcionó. Possible causes:');
        console.log('   1. La API No está correctamente configurada en APIM');
        console.log('   2. El backend service URL is misconfigured');
        console.log('   3. Falta Configuration de rewrite de URLs');
        console.log('   4. Problemas con las policies de APIM');
    }
}

testAllPaths().catch(console.Error);