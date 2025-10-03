#!/usr/bin/env node
/**
 * Create Open-Meteo API v1 based on working debug pattern
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Read the YAML content
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

console.log('🌤️ Creating Open-Meteo Weather API v1');
console.log('=====================================\n');

const serverPath = path.join(__dirname, 'dist', 'index.js');

function executeRequest() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [serverPath], {
      stdio: 'pipe'
    });

    let buffer = '';
    let allOutput = '';

    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      allOutput += chunk;
      buffer += chunk;
      
      // Process complete lines
      let lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      lines.forEach(line => {
        line = line.trim();
        if (line) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.result && parsed.result.content) {
              console.log('✅ Received tool response');
              resolve(parsed);
            }
          } catch (e) {
            // Non-JSON output (logs)
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
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.result) resolve(parsed);
        } catch (e) {
          // Ignore
        }
      }
      console.log(`\nProcess exited with code: ${code}`);
      resolve(null);
    });

    // Send the requests with proper JSON-RPC format
    const requests = [
      // Initialize
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'open-meteo-creator', version: '1.0.0' }
        }
      }),
      
      // Create API
      JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'create_api_from_yaml',
          arguments: {
            apiId: 'open-meteo-weather-api-v1',
            displayName: 'Open-Meteo Weather API v1',
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
      console.log('📤 Sending API creation request...');
      console.log('   • API ID: open-meteo-weather-api-v1');
      console.log('   • Version: v1 (Segment versioning)');
      console.log('   • Path: weather/openmeteo/v1');
      console.log('   • Service URL: https://api.open-meteo.com/v1');
      console.log('   • Subscription Required: No (free API)');
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
    console.log('📋 YAML Contract Preview:');
    console.log('---');
    console.log(yamlContent.substring(0, 400) + '...');
    console.log('---\n');
    
    const result = await executeRequest();
    
    if (result && result.result && result.result.content) {
      console.log('\n🎉 SUCCESS! API Creation Response Received');
      
      try {
        const content = result.result.content[0];
        if (content && content.text) {
          const apiInfo = JSON.parse(content.text);
          console.log('\n📊 API Details:');
          console.log(`   🆔 ID: ${apiInfo.id || 'N/A'}`);
          console.log(`   🏷️ Name: ${apiInfo.displayName || 'N/A'}`);
          console.log(`   🌐 Path: ${apiInfo.path || 'N/A'}`);
          console.log(`   🔗 Service URL: ${apiInfo.serviceUrl || 'N/A'}`);
          console.log(`   📦 Protocols: ${apiInfo.protocols ? apiInfo.protocols.join(', ') : 'N/A'}`);
          console.log(`   🔐 Subscription Required: ${apiInfo.subscriptionRequired ? 'Yes' : 'No'}`);
          
          console.log('\n✅ Open-Meteo Weather API v1 has been created successfully in Azure APIM!');
          console.log('\n📋 Next Steps:');
          console.log('   1. Check the API in Azure APIM portal');
          console.log('   2. Test the /forecast endpoint with parameters:');
          console.log('      - latitude=40.4168&longitude=-3.7038&hourly=temperature_2m');
          console.log('   3. The API is free (no subscription required)');
          
        } else {
          console.log('\n📄 Raw response content:', content);
        }
      } catch (parseError) {
        console.log('\n📄 Raw response text:', result.result.content[0].text);
      }
      
    } else {
      console.log('\n❌ Failed to create API - no valid response received');
      console.log('   This might indicate an issue with Azure APIM connection or server configuration');
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
}

if (require.main === module) {
  main();
}