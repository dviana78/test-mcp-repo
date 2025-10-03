const https = require('https');

// Test direct connection to SWAPI through Azure APIM
const options = {
  hostname: 'apim-dviana78-dev.azure-api.net',
  port: 443,
  path: '/swapi/v1/films',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': '39bf6f3b5185444ba8c560f32fea69b5'
  }
};

console.log('Testing SWAPI connection through Azure APIM...');
console.log('URL:', `https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();