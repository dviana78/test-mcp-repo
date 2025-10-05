/**
 * Get weather forecast for Pamplona, Spain for October 9-10, 2025
 */

const https = require('https');

// Pamplona coordinates
const latitude = 42.8169;
const longitude = -1.6432;

async function getWeatherForecast() {
    console.log('🌤️ Getting weather forecast for Pamplona...\n');
    
    // Parameters for the request
    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode',
        timezone: 'Europe/Madrid',
        start_date: '2025-10-09',
        end_date: '2025-10-10'
    });
    
    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    
    console.log('📍 Location: Pamplona, Spain');
    console.log(`🗺️ Coordinates: ${latitude}°N, ${longitude}°W`);
    console.log(`🔗 URL: ${url}\n`);
    
    try {
        const data = await makeRequest(url);
        const forecast = JSON.parse(data);
        
        console.log('📅 WEATHER FORECAST - PAMPLONA');
        console.log('==============================\n');
        
        if (forecast.daily) {
            const dates = forecast.daily.time;
            const maxTemps = forecast.daily.temperature_2m_max;
            const minTemps = forecast.daily.temperature_2m_min;
            const precipitation = forecast.daily.precipitation_sum;
            const windSpeed = forecast.daily.windspeed_10m_max;
            const weatherCodes = forecast.daily.weathercode;
            
            dates.forEach((date, index) => {
                const dateObj = new Date(date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                const formattedDate = dateObj.toLocaleDateString('en-US', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                });
                
                console.log(`📅 ${dayName.toUpperCase()}, ${formattedDate}`);
                console.log('─'.repeat(40));
                console.log(`🌡️ Maximum temperature: ${maxTemps[index]}°C`);
                console.log(`🌡️ Minimum temperature: ${minTemps[index]}°C`);
                console.log(`🌧️ Precipitation: ${precipitation[index]} mm`);
                console.log(`💨 Max wind speed: ${windSpeed[index]} km/h`);
                console.log(`🌤️ Weather code: ${weatherCodes[index]} ${getWeatherDescription(weatherCodes[index])}`);
                console.log('');
            });
        } else {
            console.log('❌ Could not retrieve forecast data');
        }
        
        console.log('📊 SUMMARY');
        console.log('==========');
        console.log(`🗓️ Period: October 9-10, 2025`);
        console.log(`📍 Location: Pamplona, Navarra, Spain`);
        console.log(`🌐 Source: Open-Meteo API`);
        console.log(`⏰ Timezone: Europe/Madrid`);
        
    } catch (error) {
        console.error('❌ Error getting forecast:', error.message);
        console.log('\n🔄 Trying alternative query...');
        
        // Try alternative request without date range
        try {
            const altParams = new URLSearchParams({
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                daily: 'temperature_2m_max,temperature_2m_min',
                timezone: 'Europe/Madrid',
                forecast_days: '7'
            });
            
            const altUrl = `https://api.open-meteo.com/v1/forecast?${altParams.toString()}`;
            const altData = await makeRequest(altUrl);
            const altForecast = JSON.parse(altData);
            
            console.log('📅 WEEKLY FORECAST - PAMPLONA (Includes Oct 9-10)');
            console.log('===============================================\n');
            
            if (altForecast.daily) {
                altForecast.daily.time.forEach((date, index) => {
                    if (date.includes('2025-10-09') || date.includes('2025-10-10')) {
                        const dateObj = new Date(date);
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                        const formattedDate = dateObj.toLocaleDateString('en-US', { 
                            day: '2-digit', 
                            month: 'long' 
                        });
                        
                        console.log(`📅 ${dayName.toUpperCase()}, ${formattedDate}`);
                        console.log(`🌡️ Max: ${altForecast.daily.temperature_2m_max[index]}°C`);
                        console.log(`🌡️ Min: ${altForecast.daily.temperature_2m_min[index]}°C`);
                        console.log('');
                    }
                });
            }
        } catch (altError) {
            console.error('❌ Error in alternative query:', altError.message);
        }
    }
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                }
            });
        }).on('error', reject);
    });
}

function getWeatherDescription(code) {
    const descriptions = {
        0: '☀️ Clear sky',
        1: '🌤️ Mainly clear',
        2: '⛅ Partly cloudy',
        3: '☁️ Overcast',
        45: '🌫️ Fog',
        48: '🌫️ Depositing rime fog',
        51: '🌦️ Light drizzle',
        53: '🌦️ Moderate drizzle',
        55: '🌧️ Dense drizzle',
        61: '🌧️ Slight rain',
        63: '🌧️ Moderate rain',
        65: '🌧️ Heavy rain',
        80: '🌦️ Slight rain showers',
        81: '⛈️ Moderate rain showers',
        82: '⛈️ Violent rain showers'
    };
    
    return descriptions[code] || '🌤️ Unknown condition';
}

// Execute
getWeatherForecast();