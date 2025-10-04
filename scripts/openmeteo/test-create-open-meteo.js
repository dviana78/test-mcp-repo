#!/usr/bin/env node
/**
 * Test creating Open-Meteo API using the working debug pattern
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Read YAML content
const yamlContent = fs.readFileSync('open-meteo.yaml', 'utf8');

console.log('🌤️ Testing Open-Meteo API creation with debug pattern...\n');

function runCommand() {
  const serverPath = path.join(__dirname, 'dist', 'index.js');
  const child = spawn('node', [serverPath], {
    stdio: 'pipe'
  });

  let responses = [];
  let buffer = '';

  child.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep the incomplete line
    
    lines.forEach(line => {
      if (line.trim()) {
        try {
          const response = JSON.parse(line);
          responses.push(response);
          console.log('📥 Response received:', JSON.stringify(response, null, 2));
        } catch (e) {
          console.log('📄 Non-JSON output:', line);
        }
      }
    });
  });

  child.stderr.on('data', (data) => {
    console.error('❌ Error:', data.toString());
  });

  child.on('close', (code) => {
    console.log(`\n🏁 Process closed with code: ${code}`);
    console.log(`📊 Total responses: ${responses.length}`);
    
    // Check for successful API creation
    const successResponse = responses.find(r => 
      r.result && 
      r.result.content && 
      r.result.content[0] && 
      r.result.content[0].text &&
      r.result.content[0].text.includes('Open-Meteo') || 
      r.result.content[0].text.includes('created successfully')
    );
    
    if (successResponse) {
      console.log('✅ API creation appears successful!');
      try {
        const content = JSON.parse(successResponse.result.content[0].text);
        console.log('🎉 API Details:', content);
      } catch (e) {
        console.log('📄 Response text:', successResponse.result.content[0].text);
      }
    } else {
      console.log('❌ No successful API creation response found');
    }
  });

  // Send requests with proper timing
  const initRequest = JSON.stringify({
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'open-meteo-test', version: '1.0.0' }
    }
  }) + '\n';

  const apiRequest = JSON.stringify({
    method: 'tools/call',
    params: {
      name: 'create_api_from_yaml',
      arguments: {
        apiId: 'open-meteo-weather-v1',
        displayName: 'Open-Meteo Weather API v1',
        description: 'Free weather API for forecasts and current weather data worldwide',
        path: 'weather/openmeteo',
        serviceUrl: 'https://api.open-meteo.com/v1',
        yamlContract: yamlContent,
        protocols: ['https'],
        subscriptionRequired: false,
        initialVersion: 'v1',
        versioningScheme: 'Segment'
      }
    }
  }) + '\n';

  console.log('📤 Sending initialize request...');
  child.stdin.write(initRequest);
  
  setTimeout(() => {
    console.log('📤 Sending API creation request...');
    child.stdin.write(apiRequest);
    child.stdin.end();
  }, 2000);

  // Timeout safety
  setTimeout(() => {
    console.log('⏰ Timeout reached, killing process...');
    child.kill();
  }, 15000);
}

runCommand();