// Verify weather-openmeteo-v1 API operations with retry
import { spawn } from 'child_process';

console.log('🔍 Verifying Weather OpenMeteo v1 API operations...\n');

async function checkOperationsWithRetry(apiId, maxRetries = 3) {
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`📋 Attempt ${attempt}/${maxRetries}: Checking operations for ${apiId}`);
        
        const query = JSON.stringify({
            method: 'tools/call',
            params: {
                name: 'get_api_operations',
                arguments: { apiId: apiId }
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
        
        const result = await new Promise((resolve) => {
            serverProcess.on('close', () => {
                try {
                    const lines = output.split('\n').filter(line => line.trim());
                    const resultLine = lines.find(line => line.includes('"result"'));
                    if (resultLine) {
                        const parsedResult = JSON.parse(resultLine);
                        resolve(parsedResult.result);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
            
            serverProcess.stdin.write(query + '\n');
            setTimeout(() => serverProcess.kill('SIGTERM'), 5000);
        });
        
        if (result && result.operations && result.operations.length > 0) {
            console.log('✅ Success! Operations found:');
            result.operations.forEach(op => {
                console.log(`   - ${op.method} ${op.urlTemplate} (${op.displayName})`);
            });
            return result;
        } else {
            console.log(`⏳ No operations found on attempt ${attempt}`);
            if (attempt < maxRetries) {
                console.log('   Waiting 5 seconds before retry...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    
    console.log('❌ No operations found after all retry attempts');
    return null;
}

// Check both APIs
async function main() {
    console.log('🌤️ Checking Weather APIs:\n');
    
    // Check the original weather-open-meteo
    console.log('1️⃣ Checking weather-open-meteo:');
    await checkOperationsWithRetry('weather-open-meteo');
    
    console.log('\n2️⃣ Checking weather-openmeteo-v1:');
    await checkOperationsWithRetry('weather-openmeteo-v1');
    
    console.log('\n🎉 Verification completed!');
}

main().catch(console.error);