#!/usr/bin/env node
/**
 * Script to create Open-Meteo API v1 from YAML contract
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Read the YAML file
const yamlContent = fs.readFileSync('open-meteo.yaml', 'utf8');

async function createOpenMeteoApi() {
  return new Promise((resolve, reject) => {
    console.log('🌤️ Creating Open-Meteo API v1 from YAML contract...\n');
    
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('📤 Server response:', output);
      stdout += output;
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      console.log('⚠️ Server error:', output);
      stderr += output;
    });

    // Send initialization request
    const initRequest = {
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'open-meteo-creator', version: '1.0.0' }
      }
    };

    // Send API creation request
    const createApiRequest = {
      method: 'tools/call',
      params: {
        name: 'create_api_from_yaml',
        arguments: {
          apiId: 'open-meteo-api-v1',
          displayName: 'Open-Meteo Weather API',
          description: 'Free weather API without authentication. Provides forecasts, current weather and historical data for any location worldwide.',
          path: 'weather/open-meteo',
          serviceUrl: 'https://api.open-meteo.com/v1',
          yamlContract: yamlContent,
          protocols: ['https'],
          subscriptionRequired: false, // Open-Meteo is free without authentication
          initialVersion: 'v1',
          versioningScheme: 'Segment'
        }
      }
    };

    console.log('📋 Creating API with parameters:');
    console.log(`   • API ID: open-meteo-api-v1`);
    console.log(`   • Display Name: Open-Meteo Weather API`);
    console.log(`   • Version: v1`);
    console.log(`   • Path: weather/open-meteo/v1`);
    console.log(`   • Service URL: https://api.open-meteo.com/v1`);
    console.log(`   • Versioning: Segment`);
    console.log(`   • Subscription Required: No (free API)`);
    console.log(`   • YAML Contract: ${yamlContent.length} characters`);
    console.log('');

    child.stdin.write(JSON.stringify(initRequest) + '\n');
    setTimeout(() => {
      child.stdin.write(JSON.stringify(createApiRequest) + '\n');
      child.stdin.end();
    }, 2000);

    const timeout = setTimeout(() => {
      child.kill();
      resolve({ success: false, error: 'Request timed out after 30 seconds', stdout, stderr });
    }, 30000);

    child.on('close', (code) => {
      clearTimeout(timeout);
      console.log(`\n🏁 Process completed with exit code: ${code}`);
      
      try {
        const lines = stdout.trim().split('\n');
        const responses = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);

        // Find the tool response
        const toolResponse = responses.find(r => r.result && r.result.content);
        if (toolResponse) {
          console.log('\n✅ API Creation Response:');
          const content = toolResponse.result.content[0];
          if (content && content.text) {
            try {
              const result = JSON.parse(content.text);
              console.log('🎉 Open-Meteo API v1 created successfully!');
              console.log(`   📍 API ID: ${result.id || 'N/A'}`);
              console.log(`   🏷️ Display Name: ${result.displayName || 'N/A'}`);
              console.log(`   🌐 Path: ${result.path || 'N/A'}`);
              console.log(`   🔗 Service URL: ${result.serviceUrl || 'N/A'}`);
              console.log(`   📦 Protocols: ${result.protocols ? result.protocols.join(', ') : 'N/A'}`);
              console.log(`   🔐 Subscription Required: ${result.subscriptionRequired ? 'Yes' : 'No'}`);
              
              resolve({ success: true, apiInfo: result, responses });
            } catch (parseError) {
              console.log('📄 Raw response:', content.text);
              resolve({ success: true, rawResponse: content.text, responses });
            }
          }
        } else {
          console.log('❌ No valid tool response found');
          console.log('📄 All responses:', responses);
          resolve({ success: false, error: 'No valid response', responses });
        }
      } catch (error) {
        console.error('❌ Failed to process response:', error.message);
        resolve({ success: false, error: error.message, stdout, stderr });
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      console.error('❌ Process error:', error.message);
      reject(error);
    });
  });
}

async function main() {
  try {
    console.log('🌤️ Open-Meteo API Creation Script');
    console.log('====================================\n');
    
    // Check if YAML file exists
    if (!fs.existsSync('open-meteo.yaml')) {
      console.error('❌ open-meteo.yaml file not found!');
      process.exit(1);
    }
    
    console.log('✅ YAML file found, content preview:');
    console.log('---');
    console.log(yamlContent.substring(0, 300) + '...');
    console.log('---\n');
    
    const result = await createOpenMeteoApi();
    
    if (result.success) {
      console.log('\n🎊 SUCCESS! Open-Meteo API v1 has been created in Azure APIM');
      console.log('\n📋 Next steps:');
      console.log('   1. Check the API in Azure APIM portal');
      console.log('   2. Test the /forecast endpoint');
      console.log('   3. Configure policies if needed');
      console.log('   4. Publish to products for consumption');
    } else {
      console.log('\n❌ FAILED! API creation was not successful');
      console.log(`   Error: ${result.error}`);
      if (result.stderr) {
        console.log(`   Details: ${result.stderr}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}