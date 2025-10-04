#!/usr/bin/env node

/**
 * Detailed debugging test for Azure APIM APIs
 */

import { spawn } from 'child_process';

console.log('🔬 Detailed debugging test for Azure APIM');
console.log('==============================================\n');

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let requestId = 1;
let logBuffer = [];

function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: requestId++,
    method: method,
    params: params
  };
  
  console.log(`📤 Sending request ${requestId - 1}: ${method}`);
  if (Object.keys(params).length > 0) {
    console.log(`   Parameters:`, JSON.stringify(params, null, 2));
  }
  
  server.stdin.write(JSON.stringify(request) + '\n');
  return requestId - 1;
}

// Capture ALL server logs
server.stderr.on('data', (data) => {
  const logs = data.toString().split('\n').filter(line => line.trim());
  logs.forEach(log => {
    logBuffer.push(log);
    if (log.includes('error:') || log.includes('Failed') || log.includes('Error')) {
      console.log(`🔥 ERROR LOG: ${log}`);
    } else if (log.includes('info:') && (log.includes('Listing APIs') || log.includes('Found'))) {
      console.log(`ℹ️  INFO: ${log}`);
    } else if (log.includes('debug:')) {
      console.log(`🐛 DEBUG: ${log}`);
    }
  });
});

server.stdout.on('data', (data) => {
  const output = data.toString();
  const lines = output.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (line.includes('"jsonrpc"')) {
      try {
        const response = JSON.parse(line);
        handleResponse(response);
      } catch (e) {
        console.log(`❌ Error parsing JSON response: ${e.message}`);
        console.log(`   Raw response: ${line}`);
      }
    }
  }
});

function handleResponse(response) {
  console.log(`\n📥 Response received for request ID ${response.id}:`);
  
  if (response.error) {
    console.log(`❌ ERROR: ${response.error.message}`);
    console.log(`   Code: ${response.error.code}`);
    if (response.error.data) {
      console.log(`   Additional data:`, JSON.stringify(response.error.data, null, 2));
    }
    return;
  }

  if (!response.result) {
    console.log('⚠️  Response without result');
    return;
  }

  switch (response.id) {
    case 1: // initialize
      console.log('✅ Server initialized correctly');
      break;
      
    case 2: // list_apis - no filters
      console.log('📋 Result of list_apis (no filters):');
      processApiListResult(response.result);
      break;
      
    case 3: // list_apis - with top=100
      console.log('📋 Result of list_apis (top=100):');
      processApiListResult(response.result);
      break;
      
    case 4: // list_apis - no $ options
      console.log('📋 Result of list_apis (no $ options):');
      processApiListResult(response.result);
      break;
  }
}

function processApiListResult(result) {
  if (result.content && result.content.length > 0) {
    console.log(`   Content received: ${result.content.length} elements`);
    
    result.content.forEach((content, index) => {
      console.log(`   Content ${index + 1}:`);
      console.log(`     Type: ${content.type}`);
      console.log(`     Text length: ${content.text ? content.text.length : 0}`);
      
      if (content.text) {
        try {
          const apis = JSON.parse(content.text);
          if (Array.isArray(apis)) {
            console.log(`     🎯 APIs found: ${apis.length}`);
            if (apis.length > 0) {
              apis.forEach((api, apiIndex) => {
                console.log(`       ${apiIndex + 1}. ${api.displayName || api.name} (${api.id})`);
                console.log(`          Path: ${api.path}`);
                console.log(`          Online: ${api.isOnline}`);
                console.log(`          Protocols: ${api.protocols?.join(', ')}`);
              });
            } else {
              console.log(`     📭 Empty APIs array`);
            }
          } else {
            console.log(`     ⚠️  Result is not an array: ${typeof apis}`);
            console.log(`     Content:`, JSON.stringify(apis, null, 2));
          }
        } catch (e) {
          console.log(`     ❌ Error parsing APIs: ${e.message}`);
          console.log(`     Raw text: ${content.text.substring(0, 200)}...`);
        }
      }
    });
  } else {
    console.log('   ❌ No content in response');
  }
}

server.on('close', (code) => {
  console.log('\n==========================================');
  console.log('📊 Debugging summary:');
  console.log(`   Exit code: ${code}`);
  console.log(`   Logs captured: ${logBuffer.length}`);
  
  console.log('\n🔍 Relevant logs:');
  const relevantLogs = logBuffer.filter(log => 
    log.includes('Listing APIs') || 
    log.includes('Found') || 
    log.includes('Failed') || 
    log.includes('error:') ||
    log.includes('Azure')
  );
  
  if (relevantLogs.length > 0) {
    relevantLogs.forEach(log => console.log(`   ${log}`));
  } else {
    console.log('   No relevant logs found');
  }
});

// Test sequence
setTimeout(() => {
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'debug-client', version: '1.0.0' }
  });
}, 1000);

setTimeout(() => {
  console.log('\n🧪 Test 1: list_apis without parameters');
  sendRequest('tools/call', {
    name: 'list_apis',
    arguments: {}
  });
}, 3000);

setTimeout(() => {
  console.log('\n🧪 Test 2: list_apis with top=100');
  sendRequest('tools/call', {
    name: 'list_apis',
    arguments: { top: 100 }
  });
}, 6000);

setTimeout(() => {
  console.log('\n🧪 Test 3: list_apis without $ filters');
  sendRequest('tools/call', {
    name: 'list_apis',
    arguments: { skip: 0 }
  });
}, 9000);

setTimeout(() => {
  server.kill('SIGTERM');
}, 15000);

process.on('SIGINT', () => {
  server.kill('SIGTERM');
  process.exit(0);
});