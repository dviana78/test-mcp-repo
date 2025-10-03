#!/usr/bin/env node
/**
 * Create version v2 of the existing Open-Meteo API (not a new API)
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Creating Version v2 of existing Open-Meteo API');
console.log('===============================================\n');

const serverPath = path.join(__dirname, 'dist', 'index.js');

function executeRequest() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [serverPath], {
      stdio: 'pipe'
    });

    let buffer = '';
    let responses = [];

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
            if (parsed.result) {
              responses.push(parsed);
              if (parsed.result.content) {
                console.log('✅ Received response');
              }
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
      resolve(responses);
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
          clientInfo: { name: 'version-creator', version: '1.0.0' }
        }
      }),
      
      // Create API Version v2
      JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'create_api_version',
          arguments: {
            apiId: 'open-meteo-weather-api-v1',  // Base API
            versionId: 'v2',                     // New version
            displayName: 'Open-Meteo Weather API v2',
            description: 'Version v2 of the Open-Meteo Weather API with corrected YAML import and full operations',
            versioningScheme: 'Segment'          // Same as v1
          }
        }
      })
    ];

    console.log('📤 Sending initialization request...');
    child.stdin.write(requests[0] + '\n');
    
    setTimeout(() => {
      console.log('📤 Creating version v2 of open-meteo-weather-api-v1...');
      console.log('   • Base API: open-meteo-weather-api-v1');
      console.log('   • New Version: v2');
      console.log('   • Versioning: Segment (same as v1)');
      console.log('   • Result: One API with two versions');
      child.stdin.write(requests[1] + '\n');
      child.stdin.end();
    }, 2000);

    setTimeout(() => {
      console.log('⏰ Request timeout, closing...');
      child.kill();
      resolve(responses);
    }, 15000);
  });
}

async function main() {
  try {
    console.log('🎯 Goal: Create v2 version of existing API (not separate API)');
    console.log('📋 This will result in:');
    console.log('   • One Open-Meteo API with versions v1 and v2');
    console.log('   • v1: Original (no operations)');
    console.log('   • v2: New version (should inherit structure)\n');
    
    const responses = await executeRequest();
    
    const versionResponse = responses.find(r => 
      r.result && r.result.content && r.result.content[0]
    );
    
    if (versionResponse) {
      console.log('\n🎉 SUCCESS! API Version Response Received');
      
      try {
        const content = versionResponse.result.content[0].text;
        const versionInfo = JSON.parse(content);
        
        console.log('\n📊 Version v2 Details:');
        console.log(`   🆔 Version ID: ${versionInfo.id || versionInfo.versionId || 'N/A'}`);
        console.log(`   🏷️ Name: ${versionInfo.displayName || versionInfo.name || 'N/A'}`);
        console.log(`   📝 Description: ${versionInfo.description || 'N/A'}`);
        console.log(`   🔄 Versioning Scheme: ${versionInfo.versioningScheme || 'N/A'}`);
        
        console.log('\n✅ Version v2 created successfully!');
        console.log('📋 Next steps:');
        console.log('   1. Update v2 with the corrected YAML contract');
        console.log('   2. Verify v2 has the /forecast operation');
        console.log('   3. Delete the separate v2 API we created earlier');
        
      } catch (parseError) {
        console.log('\n📄 Raw response text:', content);
      }
      
    } else {
      console.log('\n❌ Failed to create API version - no valid response received');
      console.log('📋 All responses:', responses);
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
}

if (require.main === module) {
  main();
}