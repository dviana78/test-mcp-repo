/**
 * Get weather forecast for Spinal, Pamplona area for October 10 and 12, 2025
 */

const https = require('https');

// Spinal (near Pamplona) coordinates - more specific location
const latitude = 42.8350;
const longitude = -1.6100;

async function getWeatherForecast() {
    console.log('🌤️ Getting weather forecast for Spinal (Pamplona area)...\n');
    
    // Parameters for the request
    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode,sunrise,sunset',
        timezone: 'Europe/Madrid',
        start_date: '2025-10-10',
        end_date: '2025-10-12'
    });
    
    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    
    console.log('📍 Location: Spinal, Pamplona area, Navarra');
    console.log(`🗺️ Coordinates: ${latitude}°N, ${longitude}°W`);
    console.log(`🔗 URL: ${url}\n`);
    
    try {
        const data = await makeRequest(url);
        const forecast = JSON.parse(data);
        
        console.log('📅 WEATHER FORECAST - SPINAL (PAMPLONA)');
        console.log('======================================\n');
        
        if (forecast.daily) {
            const dates = forecast.daily.time;
            const maxTemps = forecast.daily.temperature_2m_max;
            const minTemps = forecast.daily.temperature_2m_min;
            const precipitation = forecast.daily.precipitation_sum;
            const windSpeed = forecast.daily.windspeed_10m_max;
            const weatherCodes = forecast.daily.weathercode;
            const sunrise = forecast.daily.sunrise;
            const sunset = forecast.daily.sunset;
            
            // Filter for the requested dates (10th and 12th)
            dates.forEach((date, index) => {
                if (date.includes('2025-10-10') || date.includes('2025-10-12')) {
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                    const formattedDate = dateObj.toLocaleDateString('en-US', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                    });
                    
                    const sunriseTime = new Date(sunrise[index]).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: 'Europe/Madrid'
                    });
                    
                    const sunsetTime = new Date(sunset[index]).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: 'Europe/Madrid'
                    });
                    
                    console.log(`📅 ${dayName.toUpperCase()}, ${formattedDate}`);
                    console.log('─'.repeat(45));
                    console.log(`🌡️ Maximum temperature: ${maxTemps[index]}°C`);
                    console.log(`🌡️ Minimum temperature: ${minTemps[index]}°C`);
                    console.log(`🌧️ Precipitation: ${precipitation[index]} mm`);
                    console.log(`💨 Max wind speed: ${windSpeed[index]} km/h`);
                    console.log(`🌤️ Conditions: ${getWeatherDescription(weatherCodes[index])}`);
                    console.log(`🌅 Sunrise: ${sunriseTime}`);
                    console.log(`🌇 Sunset: ${sunsetTime}`);
                    console.log('');
                }
            });
            
            // Summary for requested dates
            const requestedDates = dates.filter(date => 
                date.includes('2025-10-10') || date.includes('2025-10-12')
            );
            
            const requestedMaxTemps = requestedDates.map(date => {
                const index = dates.indexOf(date);
                return maxTemps[index];
            });
            
            const requestedMinTemps = requestedDates.map(date => {
                const index = dates.indexOf(date);
                return minTemps[index];
            });
            
            console.log('📊 SUMMARY FOR REQUESTED DATES');
            console.log('==============================');
            console.log(`🗓️ Dates: October 10 and 12, 2025`);
            console.log(`🌡️ Average maximum temperature: ${(requestedMaxTemps.reduce((a, b) => a + b, 0) / requestedMaxTemps.length).toFixed(1)}°C`);
            console.log(`🌡️ Average minimum temperature: ${(requestedMinTemps.reduce((a, b) => a + b, 0) / requestedMinTemps.length).toFixed(1)}°C`);
            console.log(`🌡️ Absolute maximum: ${Math.max(...requestedMaxTemps)}°C`);
            console.log(`🌡️ Absolute minimum: ${Math.min(...requestedMinTemps)}°C`);
            
        } else {
            console.log('❌ Could not retrieve forecast data');
        }
        
        console.log('\n📊 ADDITIONAL INFORMATION');
        console.log('=========================');
        console.log(`📍 Location: Spinal, Pamplona area, Navarra, Spain`);
        console.log(`🌐 Source: Open-Meteo API`);
        console.log(`⏰ Timezone: Europe/Madrid`);
        console.log(`🎯 Accuracy: High resolution for Europe`);
        
    } catch (error) {
        console.error('❌ Error getting forecast:', error.message);
        console.log('\n🔄 Trying fallback query...');
        
        // Try fallback request with broader date range
        try {
            const fallbackParams = new URLSearchParams({
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                daily: 'temperature_2m_max,temperature_2m_min,weathercode',
                timezone: 'Europe/Madrid',
                forecast_days: '7'
            });
            
            const fallbackUrl = `https://api.open-meteo.com/v1/forecast?${fallbackParams.toString()}`;
            const fallbackData = await makeRequest(fallbackUrl);
            const fallbackForecast = JSON.parse(fallbackData);
            
            console.log('📅 FORECAST (FALLBACK MODE) - SPINAL');
            console.log('===================================\n');
            
            if (fallbackForecast.daily) {
                fallbackForecast.daily.time.forEach((date, index) => {
                    if (date.includes('2025-10-10') || date.includes('2025-10-12')) {
                        const dateObj = new Date(date);
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                        const formattedDate = dateObj.toLocaleDateString('en-US', { 
                            day: '2-digit', 
                            month: 'long' 
                        });
                        
                        console.log(`📅 ${dayName.toUpperCase()}, ${formattedDate}`);
                        console.log(`🌡️ Max: ${fallbackForecast.daily.temperature_2m_max[index]}°C`);
                        console.log(`🌡️ Min: ${fallbackForecast.daily.temperature_2m_min[index]}°C`);
                        console.log(`🌤️ ${getWeatherDescription(fallbackForecast.daily.weathercode[index])}`);
                        console.log('');
                    }
                });
            }
        } catch (fallbackError) {
            console.error('❌ Error in fallback query:', fallbackError.message);
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
        71: '❄️ Light snow fall',
        73: '❄️ Moderate snow fall',
        75: '❄️ Heavy snow fall',
        80: '🌦️ Slight rain showers',
        81: '⛈️ Moderate rain showers',
        82: '⛈️ Violent rain showers',
        95: '⛈️ Thunderstorm',
        96: '⛈️ Thunderstorm with slight hail',
        99: '⛈️ Thunderstorm with heavy hail'
    };
    
    return descriptions[code] || '🌤️ Unknown condition';
}

// Execute
getWeatherForecast();