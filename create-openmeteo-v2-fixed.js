#!/usr/bin/env node
/**
 * Create Open-Meteo API v2 with corrected YAML import
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

console.log('🌤️ Creating Open-Meteo Weather API v2 with CORRECTED YAML import');
console.log('================================================================\n');

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
          clientInfo: { name: 'openmeteo-v2-creator', version: '1.0.0' }
        }
      }),
      
      // Create API v2 with corrected settings
      JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'create_api_from_yaml',
          arguments: {
            apiId: 'open-meteo-weather-api-v2',
            displayName: 'Open-Meteo Weather API v2',
            description: 'Free weather API with CORRECTED YAML import. Provides forecasts, current weather and historical data worldwide.',
            path: 'weather/openmeteo-fixed',
            serviceUrl: 'https://api.open-meteo.com/v1',
            yamlContract: yamlContent,
            protocols: ['https'],
            subscriptionRequired: false,
            initialVersion: 'v2',
            versioningScheme: 'Segment'
          }
        }
      })
    ];

    console.log('📤 Sending initialization request...');
    child.stdin.write(requests[0] + '\n');
    
    setTimeout(() => {
      console.log('📤 Sending CORRECTED API creation request...');
      console.log('   • API ID: open-meteo-weather-api-v2');
      console.log('   • Version: v2 (Segment versioning)');
      console.log('   • Path: weather/openmeteo-fixed/v2');
      console.log('   • Service URL: https://api.open-meteo.com/v1');
      console.log('   • FIX APPLIED: Corrected format=openapi and import=true');
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
    console.log('📋 Expected YAML operations:');
    console.log('   • GET /forecast - Weather forecast with lat/lng parameters');
    console.log('   • Parameters: latitude, longitude, hourly, daily, timezone');
    console.log('   • Response: JSON with weather data\n');
    
    const result = await executeRequest();
    
    if (result && result.result && result.result.content) {
      console.log('\n🎉 SUCCESS! API v2 Creation Response Received');
      
      try {
        const content = result.result.content[0];
        if (content && content.text) {
          const apiInfo = JSON.parse(content.text);
          console.log('\n📊 API v2 Details:');
          console.log(`   🆔 ID: ${apiInfo.id || 'N/A'}`);
          console.log(`   🏷️ Name: ${apiInfo.displayName || 'N/A'}`);
          console.log(`   🌐 Path: ${apiInfo.path || 'N/A'}`);
          console.log(`   🔗 Service URL: ${apiInfo.serviceUrl || 'N/A'}`);
          console.log(`   📦 Protocols: ${apiInfo.protocols ? apiInfo.protocols.join(', ') : 'N/A'}`);
          console.log(`   🔐 Subscription Required: ${apiInfo.subscriptionRequired ? 'Yes' : 'No'}`);
          
          console.log('\n✅ Open-Meteo Weather API v2 created with corrected YAML import!');
          console.log('\n📋 Next step: Check operations to verify YAML was imported correctly');
          
        } else {
          console.log('\n📄 Raw response content:', content);
        }
      } catch (parseError) {
        console.log('\n📄 Raw response text:', result.result.content[0].text);
      }
      
    } else {
      console.log('\n❌ Failed to create API v2 - no valid response received');
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
}

if (require.main === module) {
  main();
}