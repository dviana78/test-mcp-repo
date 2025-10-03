#!/usr/bin/env node
/**
 * Create the CORRECT Open-Meteo API with proper versioning from the start
 */

const { spawn } = require('child_process');
const path = require('path');

// The corrected YAML content
const yamlContent = `openapi: 3.0.3
info:
  title: Open-Meteo API
  description: Free weather API without authentication. Provides forecasts, current weather and historical data.
  version: "1.0.0"
servers:
  - url: https://api.open-meteo.com/v1
paths:
  /forecast:
    get:
      summary: Get weather forecast
      description: |
        Returns weather forecast for a given location. You must provide latitude and longitude.
      parameters:
        - name: latitude
          in: query
          required: true
          schema:
            type: number
          example: 40.4168
        - name: longitude
          in: query
          required: true
          schema:
            type: number
          example: -3.7038
        - name: hourly
          in: query
          required: false
          schema:
            type: string
            example: temperature_2m,relativehumidity_2m
        - name: daily
          in: query
          required: false
          schema:
            type: string
            example: temperature_2m_max,temperature_2m_min
        - name: timezone
          in: query
          required: false
          schema:
            type: string
            example: Europe/Madrid
      responses:
        '200':
          description: Successful forecast response
          content:
            application/json:
              example:
                latitude: 40.4168
                longitude: -3.7038
                timezone: Europe/Madrid
                hourly:
                  temperature_2m: [20.3, 19.5, 18.9]
                daily:
                  temperature_2m_max: [25.0, 24.5]
                  temperature_2m_min: [15.2, 14.9]`;

console.log('🌤️ Creating CORRECT Open-Meteo API with proper versioning');
console.log('=======================================================\n');

const serverPath = path.join(__dirname, 'dist', 'index.js');

function executeRequest() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [serverPath], {
      stdio: 'pipe'
    });

    let buffer = '';

    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      buffer += chunk;
      
      let lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      lines.forEach(line => {
        line = line.trim();
        if (line) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.result && parsed.result.content) {
              console.log('✅ Received API creation response');
              resolve(parsed);
            }
          } catch (e) {
            if (line.includes('error') || line.includes('Error')) {
              console.log('⚠️', line);
            }
          }
        }
      });
    });

    child.stderr.on('data', (data) => {
      console.error('❌ Error:', data.toString());
    });

    child.on('close', (code) => {
      console.log(`\nProcess exited with code: ${code}`);
      resolve(null);
    });

    const requests = [
      // Initialize
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'openmeteo-correct-creator', version: '1.0.0' }
        }
      }),
      
      // Create CORRECT API with proper versioning
      JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'create_api_from_yaml',
          arguments: {
            apiId: 'open-meteo-api',
            displayName: 'Open-Meteo Weather API',
            description: 'Free weather API without authentication. Provides forecasts, current weather and historical data worldwide.',
            path: 'weather/openmeteo',
            serviceUrl: 'https://api.open-meteo.com/v1',
            yamlContract: yamlContent,
            protocols: ['https'],
            subscriptionRequired: false,
            initialVersion: 'v1',
            versioningScheme: 'Segment'
          }
        }
      })
    ];

    console.log('📤 Sending initialization request...');
    child.stdin.write(requests[0] + '\n');
    
    setTimeout(() => {
      console.log('📤 Creating CORRECT Open-Meteo API...');
      console.log('   • API ID: open-meteo-api (clean name)');
      console.log('   • Version: v1 (properly versioned from start)');
      console.log('   • Path: weather/openmeteo/v1');
      console.log('   • YAML: Corrected format=openapi with import=true');
      console.log('   • Result: One API ready for future versions');
      child.stdin.write(requests[1] + '\n');
      child.stdin.end();
    }, 2000);

    setTimeout(() => {
      console.log('⏰ Request timeout, closing...');
      child.kill();
      resolve(null);
    }, 20000);
  });
}

async function main() {
  try {
    console.log('🎯 Goal: Create ONE correct API with proper versioning structure');
    console.log('📋 Expected result:');
    console.log('   • API: open-meteo-api');
    console.log('   • Version: v1 (with full operations)');
    console.log('   • Future: Ready for v2, v3, etc.\n');
    
    const result = await executeRequest();
    
    if (result && result.result && result.result.content) {
      console.log('\n🎉 SUCCESS! CORRECT API Created');
      
      try {
        const content = result.result.content[0];
        if (content && content.text) {
          const apiInfo = JSON.parse(content.text);
          
          console.log('\n📊 Correct API Details:');
          console.log(`   🆔 ID: ${apiInfo.id || 'N/A'}`);
          console.log(`   🏷️ Name: ${apiInfo.displayName || 'N/A'}`);
          console.log(`   🌐 Path: ${apiInfo.path || 'N/A'}`);
          console.log(`   🔗 Service URL: ${apiInfo.serviceUrl || 'N/A'}`);
          console.log(`   📦 Protocols: ${apiInfo.protocols ? apiInfo.protocols.join(', ') : 'N/A'}`);
          console.log(`   🔐 Subscription: ${apiInfo.subscriptionRequired ? 'Required' : 'Free'}`);
          
          console.log('\n✅ CORRECT Open-Meteo API created successfully!');
          console.log('\n📋 Next steps:');
          console.log('   1. Verify operations are imported correctly');
          console.log('   2. This API is ready for future v2, v3, etc.');
          console.log('   3. Consider removing the duplicate v1/v2 APIs');
          
        } else {
          console.log('\n📄 Raw response content:', content);
        }
      } catch (parseError) {
        console.log('\n📄 Raw response text:', result.result.content[0].text);
      }
      
    } else {
      console.log('\n❌ Failed to create correct API - no valid response received');
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
}

if (require.main === module) {
  main();
}