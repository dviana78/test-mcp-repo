// Debug YAML import issue by checking Azure service logs
const { spawn } = require('child_process');

async function createTestApiAndCheckLogs() {
    console.log('🔍 Creating test API and checking for import issues...\n');
    
    // First, let's see what makes swagger-petstore work
    console.log('1️⃣ Checking swagger-petstore API for comparison:');
    
    const getApiQuery = JSON.stringify({
        method: 'tools/call',
        params: {
            name: 'get_api',
            arguments: { apiId: 'swagger-petstore' }
        }
    });
    
    const serverProcess = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
    });
    
    let output = '';
    
    serverProcess.stdout.on('data', (data) => {
        output += data.toString();
    });
    
    await new Promise((resolve) => {
        serverProcess.on('close', () => {
            try {
                const lines = output.split('\n').filter(line => line.trim());
                const resultLine = lines.find(line => line.includes('"result"'));
                if (resultLine) {
                    const result = JSON.parse(resultLine);
                    console.log('✅ Swagger Petstore API details:');
                    console.log(JSON.stringify(result.result.api, null, 2));
                } else {
                    console.log('⚠️  Could not get API details');
                }
            } catch (e) {
                console.log('❌ Error parsing result');
            }
            resolve();
        });
        
        serverProcess.stdin.write(getApiQuery + '\n');
        setTimeout(() => serverProcess.kill('SIGTERM'), 5000);
    });
    
    // Now create a very simple test API with minimal YAML
    console.log('\n2️⃣ Creating minimal test API:');
    const minimalYaml = `openapi: 3.0.3
info:
  title: Test API
  version: "1.0.0"
paths:
  /test:
    get:
      summary: Test endpoint
      responses:
        '200':
          description: Success`;
    
    const createQuery = JSON.stringify({
        method: 'tools/call',
        params: {
            name: 'create_api_from_yaml',
            arguments: {
                apiId: 'minimal-test-api',
                displayName: 'Minimal Test API',
                description: 'Simple test API',
                path: 'test',
                serviceUrl: 'https://api.test.com',
                protocols: ['https'],
                subscriptionRequired: false,
                yamlContract: minimalYaml
            }
        }
    });
    
    const createProcess = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
    });
    
    let createOutput = '';
    
    createProcess.stdout.on('data', (data) => {
        createOutput += data.toString();
    });
    
    await new Promise((resolve) => {
        createProcess.on('close', () => {
            console.log('📄 Creation output:', createOutput);
            resolve();
        });
        
        createProcess.stdin.write(createQuery + '\n');
        setTimeout(() => createProcess.kill('SIGTERM'), 10000);
    });
    
    console.log('\n🎉 Debug completed!');
}

createTestApiAndCheckLogs().catch(console.error);