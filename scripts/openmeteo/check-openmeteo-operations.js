#!/usr/bin/env node
/**
 * Check operations of the Open-Meteo API to see if YAML was imported correctly
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Checking Open-Meteo API operations...\n');

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
      
      // Process complete lines
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
      console.log(`\n📊 Process exited with code: ${code}`);
      console.log(`📋 Total responses: ${responses.length}`);
      resolve(responses);
    });

    // Send the requests
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
            apiId: 'open-meteo-weather-api-v1'
          }
        }
      })
    ];

    console.log('📤 Sending initialization request...');
    child.stdin.write(requests[0] + '\n');
    
    setTimeout(() => {
      console.log('📤 Requesting operations for open-meteo-weather-api-v1...');
      child.stdin.write(requests[1] + '\n');
      child.stdin.end();
    }, 2000);

    setTimeout(() => {
      console.log('⏰ Timeout, closing...');
      child.kill();
      resolve(responses);
    }, 15000);
  });
}

async function main() {
  try {
    const responses = await executeRequest();
    
    // Find the operations response
    const operationsResponse = responses.find(r => 
      r.result && 
      r.result.content && 
      r.result.content[0] && 
      r.result.content[0].text
    );
    
    if (operationsResponse) {
      console.log('\n✅ Operations Response Received');
      
      try {
        const content = operationsResponse.result.content[0].text;
        const operationsInfo = JSON.parse(content);
        
        console.log('\n📋 Open-Meteo API Operations:');
        console.log('================================');
        
        if (operationsInfo.operations && Array.isArray(operationsInfo.operations)) {
          console.log(`📊 Total operations found: ${operationsInfo.operations.length}`);
          
          if (operationsInfo.operations.length === 0) {
            console.log('❌ NO OPERATIONS FOUND! The YAML was not imported correctly.');
            console.log('\n🔧 Expected operations from YAML:');
            console.log('   • GET /forecast - Get weather forecast');
            console.log('\n💡 This confirms that the YAML contract was not properly processed.');
          } else {
            console.log('\n🎯 Operations found:');
            operationsInfo.operations.forEach((op, i) => {
              console.log(`   ${i + 1}. ${op.method || 'N/A'} ${op.urlTemplate || op.path || 'N/A'}`);
              console.log(`      Name: ${op.name || op.displayName || 'N/A'}`);
              console.log(`      Description: ${op.description || 'N/A'}`);
              console.log('');
            });
          }
        } else {
          console.log('❌ Invalid operations format received');
          console.log('📄 Raw content:', content);
        }
        
      } catch (parseError) {
        console.log('❌ Failed to parse operations response');
        console.log('📄 Raw content:', operationsResponse.result.content[0].text);
      }
      
    } else {
      console.log('\n❌ No operations response received');
      console.log('📋 All responses:', responses);
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
}

if (require.main === module) {
  main();
}