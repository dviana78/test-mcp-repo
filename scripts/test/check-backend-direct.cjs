const https = require('https');

console.log('🔍 Verifying Backend Service Direct');
console.log('====================================');

// Verify the direct Star Wars API backend
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
    console.log(`📡 Backend Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            console.log(`✅ Backend working correctly`);
            console.log(`📊 Total characters: ${jsonData.count}`);
            console.log(`👥 First characters:`);
            jsonData.results.slice(0, 3).forEach((character, index) => {
                console.log(`   ${index + 1}. ${character.name}`);
            });
        } catch (Error) {
            console.log(`❌ Error parsing response: ${Error.message}`);
            console.log(`📄 Raw response:`, data.substring(0, 500));
        }
    });
});

req.on('Error', (Error) => {
    console.log(`❌ Error connecting to backend: ${Error.message}`);
});

req.end();