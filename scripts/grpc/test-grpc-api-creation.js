#!/usr/bin/env node
/**
 * Test script for gRPC API creation tool with Protobuf definitions and versioning
 */

import { spawn } from 'child_process';
import path from 'path';

// Sample Protobuf definition for testing
const sampleProtoDefinition = `
syntax = "proto3";

package grpc.testing;

option java_package = "io.grpc.testing";

// User service definition
service UserService {
  // Get user by ID
  rpc GetUser (GetUserRequest) returns (User);
  
  // Create a new user
  rpc CreateUser (CreateUserRequest) returns (User);
  
  // List all users
  rpc ListUsers (ListUsersRequest) returns (ListUsersResponse);
  
  // Update user information
  rpc UpdateUser (UpdateUserRequest) returns (User);
  
  // Delete user
  rpc DeleteUser (DeleteUserRequest) returns (DeleteUserResponse);
}

// Request message for GetUser
message GetUserRequest {
  int32 user_id = 1;
}

// Request message for CreateUser
message CreateUserRequest {
  string name = 1;
  string email = 2;
  string phone = 3;
}

// Request message for ListUsers
message ListUsersRequest {
  int32 page_size = 1;
  string page_token = 2;
}

// Response message for ListUsers
message ListUsersResponse {
  repeated User users = 1;
  string next_page_token = 2;
}

// Request message for UpdateUser
message UpdateUserRequest {
  int32 user_id = 1;
  User user = 2;
}

// Request message for DeleteUser
message DeleteUserRequest {
  int32 user_id = 1;
}

// Response message for DeleteUser
message DeleteUserResponse {
  bool success = 1;
  string message = 2;
}

// User message definition
message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  string phone = 4;
  int64 created_at = 5;
  int64 updated_at = 6;
}
`;

// Test cases for gRPC API creation
const testCases = [
  {
    name: 'Test 1: Basic gRPC API creation',
    request: {
      method: 'tools/call',
      params: {
        name: 'create_grpc_api_from_proto',
        arguments: {
          apiId: 'grpc-user-service-test',
          displayName: 'gRPC User Service Test',
          description: 'Test gRPC API created from Protobuf definition',
          path: 'grpc/userservice',
          serviceUrl: 'grpcs://api.userservice.com:443',
          protoDefinition: sampleProtoDefinition,
          protocols: ['grpcs', 'grpc'],
          subscriptionRequired: true
        }
      }
    }
  },
  {
    name: 'Test 2: gRPC API with versioning (Segment)',
    request: {
      method: 'tools/call',
      params: {
        name: 'create_grpc_api_from_proto',
        arguments: {
          apiId: 'grpc-inventory-service-v1',
          displayName: 'gRPC Inventory Service',
          description: 'Versioned gRPC API for inventory management',
          path: 'grpc/inventory',
          serviceUrl: 'grpcs://api.inventory.com:443',
          protoDefinition: sampleProtoDefinition.replace('UserService', 'InventoryService').replace('User', 'Product'),
          protocols: ['grpcs'],
          subscriptionRequired: true,
          initialVersion: 'v1',
          versioningScheme: 'Segment'
        }
      }
    }
  },
  {
    name: 'Test 3: gRPC API with Query versioning',
    request: {
      method: 'tools/call',
      params: {
        name: 'create_grpc_api_from_proto',
        arguments: {
          apiId: 'grpc-order-service-query',
          displayName: 'gRPC Order Service',
          description: 'Query-versioned gRPC API for order management',
          path: 'grpc/orders',
          serviceUrl: 'grpcs://api.orders.com:443',
          protoDefinition: sampleProtoDefinition.replace('UserService', 'OrderService').replace('User', 'Order'),
          protocols: ['grpcs', 'grpc'],
          subscriptionRequired: false,
          initialVersion: 'v1.0',
          versioningScheme: 'Query',
          versionQueryName: 'api-version'
        }
      }
    }
  },
  {
    name: 'Test 4: gRPC API with Header versioning',
    request: {
      method: 'tools/call',
      params: {
        name: 'create_grpc_api_from_proto',
        arguments: {
          apiId: 'grpc-notification-service-header',
          displayName: 'gRPC Notification Service',
          description: 'Header-versioned gRPC API for notifications',
          path: 'grpc/notifications',
          serviceUrl: 'grpcs://api.notifications.com:443',
          protoDefinition: sampleProtoDefinition.replace('UserService', 'NotificationService').replace('User', 'Notification'),
          protocols: ['grpcs'],
          subscriptionRequired: true,
          initialVersion: 'v2.1',
          versioningScheme: 'Header',
          versionHeaderName: 'X-API-Version'
        }
      }
    }
  }
];

async function runTest(testCase) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running ${testCase.name}...`);
    console.log('📝 Request:', JSON.stringify(testCase.request, null, 2));
    
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Send the JSON-RPC request
    const request = JSON.stringify(testCase.request) + '\n';
    child.stdin.write(request);
    child.stdin.end();

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`Test timed out after 30 seconds: ${testCase.name}`));
    }, 30000);

    child.on('close', (code) => {
      clearTimeout(timeout);
      
      if (stderr) {
        console.error('❌ Error output:', stderr);
      }

      try {
        const lines = stdout.trim().split('\n');
        const responses = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);

        console.log('✅ Response received:');
        responses.forEach(response => {
          console.log(JSON.stringify(response, null, 2));
        });

        resolve({ success: true, responses, stderr });
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
        console.error('Raw stdout:', stdout);
        resolve({ success: false, error: error.message, stdout, stderr });
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function main() {
  console.log('🧪 Testing gRPC API creation tool with Protobuf definitions and versioning...\n');
  console.log('📋 Sample Protobuf definition:');
  console.log(sampleProtoDefinition.substring(0, 500) + '...\n');

  const results = [];
  
  for (const testCase of testCases) {
    try {
      const result = await runTest(testCase);
      results.push({ testCase: testCase.name, ...result });
      
      if (result.success) {
        console.log(`✅ ${testCase.name}: PASSED`);
      } else {
        console.log(`❌ ${testCase.name}: FAILED`);
      }
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ ${testCase.name}: ERROR -`, error.message);
      results.push({ testCase: testCase.name, success: false, error: error.message });
    }
  }

  console.log('\n📊 Summary:');
  const passed = results.filter(r => r.success).length;
  const failed = results.length - passed;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`  - ${result.testCase}: ${result.error || 'Unknown error'}`);
    });
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}