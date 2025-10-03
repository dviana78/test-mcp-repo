// Check weather-openmeteo-v1 API operations
const { spawn } = require('child_process');

async function checkWeatherOpenMeteoAPI() {
    console.log('🔍 Checking Weather OpenMeteo v1 API...\n');
    
    const queries = [
        {
            name: 'Get API Details',
            input: JSON.stringify({
                method: 'tools/call',
                params: {
                    name: 'get_api',
                    arguments: { apiId: 'weather-openmeteo-v1' }
                }
            })
        },
        {
            name: 'Get API Operations', 
            input: JSON.stringify({
                method: 'tools/call',
                params: {
                    name: 'get_api_operations',
                    arguments: { apiId: 'weather-openmeteo-v1' }
                }
            })
        }
    ];
    
    for (const query of queries) {
        console.log(`\n📋 ${query.name}:`);
        
        const serverProcess = spawn('node', ['dist/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });
        
        let output = '';
        let errorOutput = '';
        
        serverProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        serverProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        await new Promise((resolve) => {
            serverProcess.on('close', () => {
                if (output.includes('result')) {
                    try {
                        const lines = output.split('\n').filter(line => line.trim());
                        const resultLine = lines.find(line => line.includes('"result"'));
                        if (resultLine) {
                            const result = JSON.parse(resultLine);
                            console.log('✅ Result:', JSON.stringify(result.result, null, 2));
                        }
                    } catch (e) {
                        console.log('📄 Raw output:', output);
                    }
                } else {
                    console.log('⚠️  No result found in output');
                    if (errorOutput) console.log('❌ Error:', errorOutput);
                }
                resolve();
            });
            
            serverProcess.stdin.write(query.input + '\n');
            setTimeout(() => serverProcess.kill('SIGTERM'), 3000);
        });
    }
}

checkWeatherOpenMeteoAPI()
    .then(() => {
        console.log('\n🎉 API check completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Check failed:', error.message);
        process.exit(1);
    });