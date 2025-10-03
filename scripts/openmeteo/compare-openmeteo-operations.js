#!/usr/bin/env node
/**
 * Check operations of both Open-Meteo APIs to compare
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Checking operations for both Open-Meteo APIs...\n');

const serverPath = path.join(__dirname, 'dist', 'index.js');

async function checkApiOperations(apiId) {
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
            }
          } catch (e) {
            // Non-JSON output
          }
        }
      });
    });

    child.on('close', (code) => {
      resolve(responses);
    });

    const requests = [
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'operations-checker', version: '1.0.0' }
        }
      }),
      
      JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'get_api_operations',
          arguments: {
            apiId: apiId
          }
        }
      })
    ];

    child.stdin.write(requests[0] + '\n');
    setTimeout(() => {
      child.stdin.write(requests[1] + '\n');
      child.stdin.end();
    }, 2000);

    setTimeout(() => {
      child.kill();
      resolve(responses);
    }, 10000);
  });
}

async function main() {
  try {
    console.log('📋 Checking Open-Meteo API v1 operations...');
    const v1Responses = await checkApiOperations('open-meteo-weather-api-v1');
    
    console.log('📋 Checking Open-Meteo API v2 operations...');
    const v2Responses = await checkApiOperations('open-meteo-weather-api-v2');

    console.log('\n=== COMPARISON RESULTS ===\n');

    // Process v1 results
    const v1Operations = v1Responses.find(r => 
      r.result && r.result.content && r.result.content[0]
    );
    
    if (v1Operations) {
      try {
        const v1Content = JSON.parse(v1Operations.result.content[0].text);
        console.log('🔍 Open-Meteo API v1:');
        console.log(`   📊 Operations found: ${v1Content.operations ? v1Content.operations.length : 0}`);
        
        if (v1Content.operations && v1Content.operations.length > 0) {
          v1Content.operations.forEach((op, i) => {
            console.log(`   ${i + 1}. ${op.method || 'N/A'} ${op.urlTemplate || op.path || 'N/A'}`);
          });
        } else {
          console.log('   ❌ No operations found in v1');
        }
      } catch (e) {
        console.log('   ❌ Failed to parse v1 operations');
      }
    }

    console.log('');

    // Process v2 results
    const v2Operations = v2Responses.find(r => 
      r.result && r.result.content && r.result.content[0]
    );
    
    if (v2Operations) {
      try {
        const v2Content = JSON.parse(v2Operations.result.content[0].text);
        console.log('🔍 Open-Meteo API v2 (FIXED):');
        console.log(`   📊 Operations found: ${v2Content.operations ? v2Content.operations.length : 0}`);
        
        if (v2Content.operations && v2Content.operations.length > 0) {
          console.log('   ✅ SUCCESS! Operations imported from YAML:');
          v2Content.operations.forEach((op, i) => {
            console.log(`   ${i + 1}. ${op.method || 'N/A'} ${op.urlTemplate || op.path || 'N/A'}`);
            if (op.displayName) console.log(`      Name: ${op.displayName}`);
            if (op.description) console.log(`      Description: ${op.description}`);
          });
        } else {
          console.log('   ❌ No operations found in v2 either');
        }
      } catch (e) {
        console.log('   ❌ Failed to parse v2 operations');
        console.log('   📄 Raw content:', v2Operations.result.content[0].text);
      }
    }

    console.log('\n=== CONCLUSION ===');
    
    const v1HasOps = v1Operations && 
      JSON.parse(v1Operations.result.content[0].text).operations &&
      JSON.parse(v1Operations.result.content[0].text).operations.length > 0;
      
    const v2HasOps = v2Operations && 
      JSON.parse(v2Operations.result.content[0].text).operations &&
      JSON.parse(v2Operations.result.content[0].text).operations.length > 0;

    if (v2HasOps && !v1HasOps) {
      console.log('🎉 SUCCESS! The fix worked - v2 has operations, v1 does not');
    } else if (!v2HasOps && !v1HasOps) {
      console.log('❌ Both versions have no operations - the issue persists');
    } else if (v1HasOps && v2HasOps) {
      console.log('🤔 Both versions have operations - v1 might have been fixed retroactively');
    }

  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
}

if (require.main === module) {
  main();
}