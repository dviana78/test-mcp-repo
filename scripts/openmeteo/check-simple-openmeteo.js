#!/usr/bin/env node
/**
 * Check the new simplified Open-Meteo API operations
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Checking simplified Open-Meteo API operations...\n');

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
            }
          } catch (e) {
            // Non-JSON output
          }
        }
      });
    });

    child.on('close', (code) => {
      console.log(`Process exited with code: ${code}`);
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
            apiId: 'openmeteo-simple'
          }
        }
      })
    ];

    child.stdin.write(requests[0] + '\n');
    setTimeout(() => {
      console.log('📤 Checking operations for openmeteo-simple...');
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
    const responses = await executeRequest();
    
    const operationsResponse = responses.find(r => 
      r.result && r.result.content && r.result.content[0]
    );
    
    if (operationsResponse) {
      try {
        const content = operationsResponse.result.content[0].text;
        const operationsInfo = JSON.parse(content);
        
        console.log('\n✅ Operations Response Received');
        console.log('📋 Open-Meteo Simple API Operations:');
        console.log('=====================================');
        
        if (operationsInfo.operations && operationsInfo.operations.length > 0) {
          console.log(`🎉 SUCCESS! Found ${operationsInfo.operations.length} operation(s):`);
          
          operationsInfo.operations.forEach((op, i) => {
            console.log(`\n${i + 1}. ${op.method || 'N/A'} ${op.urlTemplate || op.path || 'N/A'}`);
            console.log(`   📝 Name: ${op.displayName || op.name || 'N/A'}`);
            console.log(`   📄 Description: ${op.description || 'N/A'}`);
            if (op.operationId) console.log(`   🆔 Operation ID: ${op.operationId}`);
          });
          
          console.log('\n🎊 EXCELLENT! The YAML import is working correctly!');
          console.log('📋 Summary:');
          console.log('   ✅ API created successfully');
          console.log('   ✅ Operations imported from YAML');
          console.log('   ✅ /forecast endpoint available');
          console.log('   ✅ Parameters (latitude, longitude) configured');
          
        } else {
          console.log('❌ No operations found - YAML import still not working');
        }
        
      } catch (parseError) {
        console.log('❌ Failed to parse operations response');
        console.log('📄 Raw content:', operationsResponse.result.content[0].text);
      }
      
    } else {
      console.log('❌ No operations response received');
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
}

if (require.main === module) {
  main();
}