#!/usr/bin/env node
/**
 * Script to test subscription tools availability in MCP Server
 */

const { spawn } = require('child_process');
const path = require('path');

async function testSubscriptionTools() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing subscription tools availability in MCP Server...\n');
    
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname
    });

    let stdout = '';
    let stderr = '';
    let responses = [];

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      
      // Parse each line as potential JSON response
      output.split('\n').forEach(line => {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line.trim());
            responses.push(parsed);
            console.log('📡 Response received:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            // Not JSON, might be log output
            console.log('📝 Log:', line.trim());
          }
        }
      });
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('⚠️  Error output:', data.toString());
    });

    // Send initialization request
    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'subscription-tools-tester', version: '1.0.0' }
      }
    };

    console.log('📤 Sending initialize request...');
    child.stdin.write(JSON.stringify(initRequest) + '\n');

    // Wait a bit, then send tools list request
    setTimeout(() => {
      const toolsRequest = {
        jsonrpc: "2.0",
        id: 2,
        method: 'tools/list',
        params: {}
      };

      console.log('📤 Sending tools/list request...');
      child.stdin.write(JSON.stringify(toolsRequest) + '\n');
      
      // Wait and then test a specific subscription tool
      setTimeout(() => {
        const testToolRequest = {
          jsonrpc: "2.0",
          id: 3,
          method: 'tools/call',
          params: {
            name: 'list_subscriptions',
            arguments: {
              top: 5
            }
          }
        };

        console.log('📤 Testing list_subscriptions tool...');
        child.stdin.write(JSON.stringify(testToolRequest) + '\n');
        child.stdin.end();
      }, 2000);
    }, 2000);

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Request timed out after 20 seconds'));
    }, 20000);

    child.on('close', (code) => {
      clearTimeout(timeout);
      
      console.log('\n🔍 Analysis of responses:');
      
      // Find tools list response
      const toolsResponse = responses.find(r => r.result && r.result.tools);
      if (toolsResponse) {
        const tools = toolsResponse.result.tools;
        const subscriptionTools = tools.filter(t => t.name.includes('subscription'));
        
        console.log(`\n📋 Total tools found: ${tools.length}`);
        console.log(`🎯 Subscription tools found: ${subscriptionTools.length}`);
        
        if (subscriptionTools.length > 0) {
          console.log('\n✅ Subscription tools available:');
          subscriptionTools.forEach(tool => {
            console.log(`   • ${tool.name}: ${tool.description}`);
          });
        } else {
          console.log('\n❌ No subscription tools found!');
        }
        
        // List all tool names for verification
        console.log('\n📝 All available tools:');
        tools.forEach(tool => {
          console.log(`   • ${tool.name}`);
        });
      } else {
        console.log('❌ No tools response found');
      }
      
      // Check for tool execution response
      const toolExecResponse = responses.find(r => r.id === 3);
      if (toolExecResponse) {
        if (toolExecResponse.result) {
          console.log('\n✅ list_subscriptions tool executed successfully');
        } else if (toolExecResponse.error) {
          console.log('\n❌ list_subscriptions tool execution failed:', toolExecResponse.error);
        }
      }

      resolve({ 
        success: true, 
        responses, 
        stderr,
        subscriptionToolsCount: subscriptionTools ? subscriptionTools.length : 0 
      });
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function main() {
  try {
    const result = await testSubscriptionTools();
    
    if (result.subscriptionToolsCount > 0) {
      console.log('\n🎉 SUCCESS: Subscription tools are properly registered and available!');
    } else {
      console.log('\n💔 ISSUE: Subscription tools are not being registered properly');
    }
    
  } catch (error) {
    console.error('\n❌ Failed to test subscription tools:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}