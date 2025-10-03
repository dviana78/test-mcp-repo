#!/usr/bin/env node
/**
 * Simple script to create Open-Meteo API using our existing tools
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Read the YAML content
const yamlContent = fs.readFileSync('open-meteo.yaml', 'utf8');

console.log('🌤️ Creating Open-Meteo API v1...');
console.log(`📋 YAML Content (${yamlContent.length} chars):`);
console.log('---');
console.log(yamlContent);
console.log('---\n');

// Using our existing pattern from debug-apis.js
const serverPath = path.join(__dirname, 'dist', 'index.js');
const child = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';

child.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString());
});

child.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

child.on('close', (code) => {
  console.log(`\nProcess exited with code: ${code}`);
  
  try {
    const responses = output.trim().split('\n').map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
    
    console.log('\n📥 Parsed responses:');
    responses.forEach((resp, i) => {
      console.log(`Response ${i + 1}:`, JSON.stringify(resp, null, 2));
    });
    
  } catch (error) {
    console.error('Parse error:', error.message);
    console.log('Raw output:', output);
  }
});

// Send requests
const requests = [
  {
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'open-meteo-creator', version: '1.0.0' }
    }
  },
  {
    method: 'tools/call',
    params: {
      name: 'create_api_from_yaml',
      arguments: {
        apiId: 'open-meteo-api-v1',
        displayName: 'Open-Meteo Weather API',
        description: 'Free weather API without authentication. Provides forecasts, current weather and historical data.',
        path: 'weather/open-meteo',
        serviceUrl: 'https://api.open-meteo.com/v1',
        yamlContract: yamlContent,
        protocols: ['https'],
        subscriptionRequired: false,
        initialVersion: 'v1',
        versioningScheme: 'Segment'
      }
    }
  }
];

console.log('📤 Sending requests...\n');

// Send initialization
child.stdin.write(JSON.stringify(requests[0]) + '\n');

// Wait then send API creation request
setTimeout(() => {
  console.log('📤 Sending API creation request...');
  child.stdin.write(JSON.stringify(requests[1]) + '\n');
  child.stdin.end();
}, 3000);