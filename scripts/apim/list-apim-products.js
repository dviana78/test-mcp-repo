#!/usr/bin/env node

/**
 * List all Azure APIM Products using MCP Server
 */

import { spawn } from 'child_process';

console.log('📦 Listing All Azure APIM Products');
console.log('==================================\n');

// Create MCP server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseReceived = false;

// Function to send JSON-RPC message
function sendRequest(id, method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: id,
    method: method,
    params: params
  };
  
  const message = JSON.stringify(request) + '\n';
  console.log(`📤 Sending: ${method}`);
  server.stdin.write(message);
}

// Handle server output
server.stdout.on('data', (data) => {
  const response = data.toString().trim();
  console.log(`📥 Response received`);
  
  try {
    const parsed = JSON.parse(response);
    
    if (parsed.result && parsed.result.content) {
      responseReceived = true;
      
      console.log('\n📦 Azure APIM Products:');
      console.log('======================');
      
      // Parse the products data
      const content = parsed.result.content[0];
      if (content.type === 'text') {
        const productsData = JSON.parse(content.text);
        
        if (productsData.value && Array.isArray(productsData.value)) {
          console.log(`📊 Total products found: ${productsData.value.length}\n`);
          
          productsData.value.forEach((product, index) => {
            console.log(`${index + 1}. 📦 ${product.properties?.displayName || product.name}`);
            console.log(`   🆔 ID: ${product.name}`);
            console.log(`   📝 Description: ${product.properties?.description || 'No description'}`);
            console.log(`   🔒 Subscription Required: ${product.properties?.subscriptionRequired ? 'Yes' : 'No'}`);
            console.log(`   ✅ Approval Required: ${product.properties?.approvalRequired ? 'Yes' : 'No'}`);
            console.log(`   📊 State: ${product.properties?.state || 'Unknown'}`);
            
            if (product.properties?.subscriptionsLimit) {
              console.log(`   👥 Subscription Limit: ${product.properties.subscriptionsLimit}`);
            }
            
            console.log('');
          });
          
          console.log('🎯 Product Summary:');
          console.log('==================');
          
          const subscriptionRequired = productsData.value.filter(p => p.properties?.subscriptionRequired).length;
          const approvalRequired = productsData.value.filter(p => p.properties?.approvalRequired).length;
          const published = productsData.value.filter(p => p.properties?.state === 'published').length;
          
          console.log(`• Products requiring subscription: ${subscriptionRequired}`);
          console.log(`• Products requiring approval: ${approvalRequired}`);
          console.log(`• Published products: ${published}`);
          console.log(`• Total products: ${productsData.value.length}`);
          
        } else {
          console.log('📦 No products found or unexpected response format');
        }
      }
    } else if (parsed.error) {
      console.log(`❌ Error: ${parsed.error.message}`);
      console.log(`   Code: ${parsed.error.code}`);
    }
  } catch (error) {
    console.log('❌ Error parsing response:', error.message);
    console.log('🔍 Raw response:', response);
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  if (error.includes('error:')) {
    console.log('⚠️  Server error:', error);
  }
});

server.on('close', (code) => {
  console.log(`\n🔚 Server closed with code: ${code}`);
  
  if (!responseReceived && code !== 0) {
    console.log('\n❌ No response received. Check:');
    console.log('   1. Azure credentials are configured');
    console.log('   2. APIM service is accessible');
    console.log('   3. MCP server is working correctly');
  }
});

// Send initialization and tool call
setTimeout(() => {
  console.log('🚀 Initializing MCP server...');
  
  // Initialize
  sendRequest(1, 'initialize', {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "apim-products-client",
      version: "1.0.0"
    }
  });
  
  // List products
  setTimeout(() => {
    console.log('📦 Requesting products list...');
    sendRequest(2, 'tools/call', {
      name: 'list_products',
      arguments: {
        top: 100
      }
    });
  }, 1000);
  
}, 500);

// Set timeout for the request
setTimeout(() => {
  if (!responseReceived) {
    console.log('\n⏰ Timeout - No response received');
    server.kill();
  }
}, 30000);