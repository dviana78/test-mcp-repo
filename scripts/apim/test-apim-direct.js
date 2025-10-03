const https = require('https');

console.log('🔍 Testing Access through APIM');
console.log('===================================');

// Usando la clave que obtuvimos anteriormente
const subscriptionKey = 'd5fde29d155f4f0194e259d07818ec61';

const options = {
    hostname: 'apim-dviana78-dev.azure-api.net',
    port: 443,
    path: '/swapi/v1/people/',
    method: 'GET',
    headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'User-Agent': 'Node.js APIM Test'
    }
};

console.log(`🔑 Usando clave: ${subscriptionKey}`);
console.log(`🌐 URL: https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
    console.log(`📡 Status de APIM: ${res.statusCode}`);
    console.log(`📋 Headers de respuesta:`);
    Object.keys(res.headers).forEach(key => {
        console.log(`   ${key}: ${res.headers[key]}`);
    });
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                const jsonData = JSON.parse(data);
                console.log(`✅ APIM funciona correctamente`);
                console.log(`📊 Total characters: ${jsonData.count}`);
                console.log(`👥 Primeros characters:`);
                jsonData.results.slice(0, 3).forEach((character, index) => {
                    console.log(`   ${index + 1}. ${character.name}`);
                });
            } catch (Error) {
                console.log(`❌ Error parsing respuesta: ${Error.message}`);
                console.log(`📄 Respuesta cruda:`, data.substring(0, 500));
            }
        } else {
            console.log(`❌ Error ${res.statusCode}: ${res.statusMessage}`);
            console.log(`📄 Respuesta:`, data);
        }
    });
});

req.on('Error', (Error) => {
    console.log(`❌ Error Connecting a APIM: ${Error.message}`);
});

req.end();