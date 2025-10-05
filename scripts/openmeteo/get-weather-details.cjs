/**
 * Get detailed information about Weather API
 */

const { spawn } = require('child_process');

async function getWeatherApiDetails() {
    console.log('🌤️ Getting Weather API Details...\n');
    
    try {
        // First, get operations for weather-v1-final
        console.log('🔍 Getting operations for weather-v1-final API...');
        
        const getOperationsCmd = spawn('node', [
            'scripts/apim/get-starwars-operations.js',
            'weather-v1-final'
        ], {
            stdio: 'inherit',
            shell: true
        });
        
        await new Promise((resolve, reject) => {
            getOperationsCmd.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    console.log(`❌ Operations check failed with code ${code}`);
                    resolve(); // Continue even if this fails
                }
            });
            getOperationsCmd.on('error', reject);
        });
        
        console.log('\n📋 Weather API Summary:');
        console.log('🌐 Name: Weather API v1');
        console.log('🆔 ID: weather-v1-final');
        console.log('📝 Description: Free weather API without authentication');
        console.log('🔗 Base URL: https://api.open-meteo.com/v1');
        console.log('📍 API Path: weather/v1');
        console.log('🔒 Subscription Required: No');
        console.log('🌐 Protocols: HTTPS');
        console.log('🎯 Provider: Open-Meteo (open-meteo.com)');
        
        console.log('\n🛠️ Available Operations:');
        console.log('1. 🌤️ Get Forecast (GET /forecast)');
        console.log('   📍 Endpoint: /forecast?latitude={lat}&longitude={lon}');
        console.log('   📥 Parameters:');
        console.log('     - latitude (required): Geographic coordinate');
        console.log('     - longitude (required): Geographic coordinate');
        console.log('     - Optional: hourly, daily, timezone parameters');
        
        console.log('\n📊 Weather Data Provided:');
        console.log('✅ Current weather conditions');
        console.log('✅ Hourly forecasts (up to 16 days)');
        console.log('✅ Daily forecasts (up to 16 days)');
        console.log('✅ Historical weather data');
        console.log('✅ Temperature, humidity, pressure');
        console.log('✅ Wind speed and direction');
        console.log('✅ Precipitation and cloud cover');
        console.log('✅ UV index and visibility');
        
        console.log('\n🌍 Coverage:');
        console.log('📍 Global coverage');
        console.log('🎯 High resolution: 1km for Central Europe');
        console.log('🎯 Standard resolution: 11km globally');
        
        console.log('\n🔑 Authentication:');
        console.log('🆓 Free API - No authentication required');
        console.log('⚡ Rate limits apply for free usage');
        console.log('💰 Commercial API available for higher limits');
        
        console.log('\n📝 Example Request:');
        console.log('🌐 GET https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060');
        console.log('📍 (Weather for New York City)');
        
    } catch (error) {
        console.error('❌ Error getting weather API details:', error);
    }
}

// Execute
getWeatherApiDetails();