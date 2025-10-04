import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Test the create_api_from_yaml tool with proper format settings
async function testCreateWeatherOpenMeteoAPI() {
    console.log('🌤️ Creating Weather Open-Meteo API v1...\n');
    
    const yamlContent = fs.readFileSync('open-meteo.yaml', 'utf8');
    
    const testInput = JSON.stringify({
        method: 'tools/call',
        params: {
            name: 'create_api_from_yaml',
            arguments: {
                apiId: 'weather-open-meteo',
                displayName: 'Weather Open-Meteo API',
                description: 'Free weather API without authentication. Provides forecasts, current weather and historical data.',
                path: 'weather/open-meteo/v1',
                serviceUrl: 'https://api.open-meteo.com/v1',
                protocols: ['https'],
                subscriptionRequired: false,
                initialVersion: 'v1',
                versioningScheme: 'Segment',
                yamlContract: yamlContent
            }
        }
    });
    
    return new Promise((resolve, reject) => {
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
        
        serverProcess.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Server Output:', output);
                resolve(output);
            } else {
                console.error('❌ Server Error:', errorOutput);
                reject(new Error(`Server exited with code ${code}`));
            }
        });
        
        // Send the test input and close stdin
        serverProcess.stdin.write(testInput + '\n');
        setTimeout(() => {
            serverProcess.kill('SIGTERM');
        }, 5000);
    });
}

testCreateWeatherOpenMeteoAPI()
    .then(() => {
        console.log('\n🎉 Weather Open-Meteo API creation test completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error.message);
        process.exit(1);
    });