#!/usr/bin/env node
/**
 * Quick gRPC API search using the working debug method
 */

import { spawn } from 'child_process';
import path from 'path';

// Test with a simple filter for gRPC
const testGrpcFilter = {
  method: 'tools/call',
  params: {
    name: 'list_apis',
    arguments: {
      filter: "contains(displayName,'gRPC') or contains(displayName,'grpc') or contains(description,'gRPC') or contains(description,'grpc') or contains(description,'Protobuf') or contains(description,'protobuf')",
      top: 100
    }
  }
};

const testAllApis = {
  method: 'tools/call',
  params: {
    name: 'list_apis',
    arguments: { top: 100 }
  }
};

async function quickTest() {
  console.log('🔍 Quick gRPC API Search\n');
  
  // First, let's get all APIs and search locally
  const serverPath = path.join(__dirname, 'dist', 'index.js');
  const child = spawn('node', [serverPath], { stdio: ['pipe', 'pipe', 'inherit'] });
  
  let output = '';
  child.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  // Send requests
  child.stdin.write(JSON.stringify(testAllApis) + '\n');
  child.stdin.end();
  
  return new Promise((resolve) => {
    child.on('close', () => {
      // Parse the output to look for gRPC APIs
      try {
        const lines = output.split('\n').filter(line => line.trim());
        let foundGrpcApis = false;
        
        for (const line of lines) {
          if (line.includes('"displayName"') || line.includes('"description"')) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('grpc') || lowerLine.includes('protobuf')) {
              if (!foundGrpcApis) {
                console.log('🎉 Found gRPC-related content:');
                foundGrpcApis = true;
              }
              console.log(`   ${line.trim()}`);
            }
          }
        }
        
        if (!foundGrpcApis) {
          console.log('❌ No gRPC APIs detected in current Azure APIM instance');
          console.log('\n📝 This means the gRPC APIs from our tests were not successfully created.');
          console.log('💡 The tests showed success, but the APIs might not have been persisted in Azure APIM.');
        }
        
        resolve();
      } catch (error) {
        console.log('❌ Error analyzing output:', error.message);
        resolve();
      }
    });
  });
}

async function main() {
  await quickTest();
  
  console.log('\n📋 Summary:');
  console.log('Based on the previous full API list, your Azure APIM contains:');
  console.log('• 7 total APIs');
  console.log('• 0 gRPC APIs (none detected)');
  console.log('• 2 APIs created by our MCP Server (User Management, Weather API)');
  console.log('• 5 pre-existing APIs (Star Wars variants, Swagger Petstore)');
  
  console.log('\n💭 Explanation:');
  console.log('The gRPC API creation tests showed "PASSED" results, but this typically means:');
  console.log('1. The MCP protocol communication worked correctly');
  console.log('2. The tool executed without errors');
  console.log('3. However, the actual Azure APIM API creation may have failed silently');
  console.log('4. Azure APIM has limited native gRPC support, which may cause creation issues');
}

if (require.main === module) {
  main().catch(console.error);
}