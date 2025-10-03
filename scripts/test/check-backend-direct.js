const https = require('https');

console.log('🔍 Verifying backend Service Direct');
console.log('====================================');

// Verify el backend directo de Star Wars API
const options = {
    hostname: 'swapi.dev',
    port: 443,
    path: '/api/people/',
    method: 'GET',
    headers: {
        'User-Agent': 'Node.js backend Check'
    }
};

const req = https.request(options, (res) => {
    console.log(`📡 Status del backend: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            console.log(`✅ backend funciona correctamente`);
            console.log(`📊 Total characters: ${jsonData.count}`);
            console.log(`👥 Primeros characters:`);
            jsonData.results.slice(0, 3).forEach((character, index) => {
                console.log(`   ${index + 1}. ${character.name}`);
            });
        } catch (Error) {
            console.log(`❌ Error parsing respuesta: ${Error.message}`);
            console.log(`📄 Respuesta cruda:`, data.substring(0, 500));
        }
    });
});

req.on('Error', (Error) => {
    console.log(`❌ Error Connecting al backend: ${Error.message}`);
});

req.end();