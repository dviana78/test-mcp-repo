#!/usr/bin/env node
/**
 * Create Open-Meteo API with minimal YAML to avoid validation errors
 */

const { spawn } = require('child_process');
const path = require('path');

// Simplified YAML to avoid validation errors
const yamlContent = `openapi: 3.0.3
info:
  title: Open-Meteo API
  version: "1.0.0"
  description: Free weather API without authentication
servers:
  - url: https://api.open-meteo.com/v1
paths:
  /forecast:
    get:
      summary: Get weather forecast
      operationId: getWeatherForecast
      parameters:
        - name: latitude
          in: query
          required: true
          schema:
            type: number
            format: float
          example: 40.4168
        - name: longitude
          in: query
          required: true
          schema:
            type: number
            format: float  
          example: -3.7038
        - name: hourly
          in: query
          required: false
          schema:
            type: string
          example: temperature_2m
        - name: daily
          in: query
          required: false
          schema:
            type: string
          example: temperature_2m_max
      responses:
        '200':
          description: Weather forecast data
          content:
            application/json:
              schema:
                type: object
                properties:
                  latitude:
                    type: number
                  longitude:
                    type: number
                  hourly:
                    type: object`;

console.log('🌤️ Creating Open-Meteo API with SIMPLIFIED YAML');
console.log('==============================================\n');

const serverPath = path.join(__dirname, 'dist', 'index.js');

function executeRequest() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [serverPath], {
      stdio: 'pipe'
    });

    let buffer = '';
    let responseReceived = false;

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
            if (parsed.result && !responseReceived) {
              responseReceived = true;
              console.log('✅ Received response');
              resolve(parsed);
            }
          } catch (e) {
            if (line.includes('error') || line.includes('Error')) {
              console.log('⚠️', line);
            } else if (line.includes('info') && line.includes('created')) {
              console.log('ℹ️', line);
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
      if (!responseReceived) resolve(null);
    });

    const requests = [
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'simple-openmeteo', version: '1.0.0' }
        }
      }),
      
      JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'create_api_from_yaml',
          arguments: {
            apiId: 'openmeteo-simple',
            displayName: 'Open-Meteo Simple API',
            description: 'Simplified Open-Meteo Weather API',
            path: 'openmeteo',
            serviceUrl: 'https://api.open-meteo.com/v1',
            yamlContract: yamlContent,
            protocols: ['https'],
            subscriptionRequired: false
            // No initial version to avoid versioning complexity
          }
        }
      })
    ];

    console.log('📤 Sending requests...');
    console.log('   • Simplified YAML (no versioning)');
    console.log('   • Basic schema validation');
    console.log('   • Clean API structure');
    
    child.stdin.write(requests[0] + '\n');
    
    setTimeout(() => {
      child.stdin.write(requests[1] + '\n');
      child.stdin.end();
    }, 2000);

    setTimeout(() => {
      if (!responseReceived) {
        console.log('⏰ Timeout, closing...');
        child.kill();
        resolve(null);
      }
    }, 15000);
  });
}

async function main() {
  try {
    console.log('📋 Simplified YAML preview:');
    console.log(yamlContent.substring(0, 400) + '...\n');
    
    const result = await executeRequest();
    
    if (result && result.result && result.result.content) {
      console.log('\n🎉 SUCCESS! Simplified API Created');
      
      try {
        const content = result.result.content[0];
        if (content && content.text) {
          const apiInfo = JSON.parse(content.text);
          
          console.log('\n📊 API Details:');
          console.log(`   🆔 ID: ${apiInfo.id || 'N/A'}`);
          console.log(`   🏷️ Name: ${apiInfo.displayName || 'N/A'}`);
          console.log(`   🌐 Path: ${apiInfo.path || 'N/A'}`);
          console.log(`   🔗 Service URL: ${apiInfo.serviceUrl || 'N/A'}`);
          
          console.log('\n✅ Simplified Open-Meteo API created!');
          console.log('📋 Next: Check if operations were imported correctly');
          
        }
      } catch (parseError) {
        console.log('\n📄 Response:', result.result.content[0].text);
      }
    } else {
      console.log('\n❌ No valid response received');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

if (require.main === module) {
  main();
}