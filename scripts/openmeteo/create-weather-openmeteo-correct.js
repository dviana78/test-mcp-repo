// Create Weather Open-Meteo API with correct YAML import
const { ApimService } = require('./dist/services/apim-service.js');
const fs = require('fs');

async function createWeatherOpenMeteoWithOperations() {
    console.log('🌤️ Creating Weather Open-Meteo API v1 with operations...\n');
    
    try {
        const apimService = new ApimService();
        const yamlContent = fs.readFileSync('open-meteo.yaml', 'utf8');
        
        console.log('📝 YAML Content Preview:');
        console.log(yamlContent.substring(0, 200) + '...\n');
        
        // Use the same parameters that worked for openmeteo-simple
        const result = await apimService.createApiFromYamlWithVersioning({
            apiId: 'weather-open-meteo-v1',
            displayName: 'Weather Open-Meteo API v1',
            description: 'Free weather API without authentication. Provides forecasts, current weather and historical data.',
            path: 'weather/open-meteo/v1',
            serviceUrl: 'https://api.open-meteo.com/v1',
            protocols: ['https'],
            subscriptionRequired: false,
            yamlContract: yamlContent,
            initialVersion: 'v1',
            versioningScheme: 'Segment'
        });
        
        console.log('✅ API Creation Result:', JSON.stringify(result, null, 2));
        
        // Check operations after creation
        setTimeout(async () => {
            try {
                console.log('\n🔍 Checking operations...');
                const operations = await apimService.getApiOperations('weather-open-meteo-v1');
                console.log('📋 Operations found:', JSON.stringify(operations, null, 2));
            } catch (error) {
                console.log('❌ Error checking operations:', error.message);
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

createWeatherOpenMeteoWithOperations();