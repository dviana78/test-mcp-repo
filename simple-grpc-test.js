#!/usr/bin/env node
/**
 * Simple test for gRPC API creation to debug the issue
 */

const { spawn } = require('child_process');
const path = require('path');

// Simple Protobuf for testing
const simpleProto = `
syntax = "proto3";
service HelloService {
  rpc SayHello (HelloRequest) returns (HelloResponse);
}
message HelloRequest {
  string name = 1;
}
message HelloResponse {
  string message = 1;
}
`;

async function testGrpcCreation() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Testing simple gRPC API creation...');
    
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('STDOUT:', output);
      stdout += output;
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      console.log('STDERR:', output);
      stderr += output;
    });

    // Send initialization request first
    const initRequest = {
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    };

    const grpcRequest = {
      method: 'tools/call',
      params: {
        name: 'create_grpc_api_from_proto',
        arguments: {
          apiId: 'simple-grpc-test',
          displayName: 'Simple gRPC Test',
          description: 'Simple test API',
          path: 'grpc/simple',
          serviceUrl: 'https://api.simple.com/grpc',
          protoDefinition: simpleProto,
          protocols: ['https'],
          subscriptionRequired: true
        }
      }
    };

    // Send requests
    child.stdin.write(JSON.stringify(initRequest) + '\n');
    setTimeout(() => {
      child.stdin.write(JSON.stringify(grpcRequest) + '\n');
      child.stdin.end();
    }, 1000);

    const timeout = setTimeout(() => {
      child.kill();
      resolve({ success: false, error: 'Timeout', stdout, stderr });
    }, 15000);

    child.on('close', (code) => {
      clearTimeout(timeout);
      console.log(`\n🏁 Process exited with code: ${code}`);
      resolve({ success: code === 0, stdout, stderr, code });
    });
  });
}

async function main() {
  try {
    const result = await testGrpcCreation();
    console.log('\n📊 Test Result:', {
      success: result.success,
      code: result.code
    });
    
    if (result.stderr) {
      console.log('\n❌ Errors:', result.stderr);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  main();
}