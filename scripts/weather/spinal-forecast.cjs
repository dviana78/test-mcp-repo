/**
 * Get weather forecast for Spinal, Pamplona area for October 10 and 12, 2025
 */

const https = require('https');

// Spinal (near Pamplona) coordinates - more specific location
const latitude = 42.8350;
const longitude = -1.6100;

async function getWeatherForecast() {
    console.log('🌤️ Obteniendo pronóstico del tiempo para Spinal (área de Pamplona)...\n');
    
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
    
    console.log('📍 Ubicación: Spinal, área de Pamplona, Navarra');
    console.log(`🗺️ Coordenadas: ${latitude}°N, ${longitude}°W`);
    console.log(`🔗 URL: ${url}\n`);
    
    try {
        const data = await makeRequest(url);
        const forecast = JSON.parse(data);
        
        console.log('📅 PRONÓSTICO DEL TIEMPO - SPINAL (PAMPLONA)');
        console.log('============================================\n');
        
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
                    const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                    const formattedDate = dateObj.toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                    });
                    
                    const sunriseTime = new Date(sunrise[index]).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: 'Europe/Madrid'
                    });
                    
                    const sunsetTime = new Date(sunset[index]).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: 'Europe/Madrid'
                    });
                    
                    console.log(`📅 ${dayName.toUpperCase()}, ${formattedDate}`);
                    console.log('─'.repeat(45));
                    console.log(`🌡️ Temperatura máxima: ${maxTemps[index]}°C`);
                    console.log(`🌡️ Temperatura mínima: ${minTemps[index]}°C`);
                    console.log(`🌧️ Precipitación: ${precipitation[index]} mm`);
                    console.log(`💨 Viento máximo: ${windSpeed[index]} km/h`);
                    console.log(`🌤️ Condiciones: ${getWeatherDescription(weatherCodes[index])}`);
                    console.log(`🌅 Amanecer: ${sunriseTime}`);
                    console.log(`🌇 Puesta de sol: ${sunsetTime}`);
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
            
            console.log('📊 RESUMEN PARA LOS DÍAS SOLICITADOS');
            console.log('===================================');
            console.log(`🗓️ Fechas: 10 y 12 de octubre de 2025`);
            console.log(`🌡️ Temperatura máxima promedio: ${(requestedMaxTemps.reduce((a, b) => a + b, 0) / requestedMaxTemps.length).toFixed(1)}°C`);
            console.log(`🌡️ Temperatura mínima promedio: ${(requestedMinTemps.reduce((a, b) => a + b, 0) / requestedMinTemps.length).toFixed(1)}°C`);
            console.log(`🌡️ Máxima absoluta: ${Math.max(...requestedMaxTemps)}°C`);
            console.log(`🌡️ Mínima absoluta: ${Math.min(...requestedMinTemps)}°C`);
            
        } else {
            console.log('❌ No se pudieron obtener los datos del pronóstico');
        }
        
        console.log('\n📊 INFORMACIÓN ADICIONAL');
        console.log('========================');
        console.log(`📍 Ubicación: Spinal, área de Pamplona, Navarra, España`);
        console.log(`🌐 Fuente: Open-Meteo API`);
        console.log(`⏰ Zona horaria: Europe/Madrid`);
        console.log(`🎯 Precisión: Alta resolución para Europa`);
        
    } catch (error) {
        console.error('❌ Error al obtener el pronóstico:', error.message);
        console.log('\n🔄 Intentando con consulta de respaldo...');
        
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
            
            console.log('📅 PRONÓSTICO (MODO RESPALDO) - SPINAL');
            console.log('=====================================\n');
            
            if (fallbackForecast.daily) {
                fallbackForecast.daily.time.forEach((date, index) => {
                    if (date.includes('2025-10-10') || date.includes('2025-10-12')) {
                        const dateObj = new Date(date);
                        const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                        const formattedDate = dateObj.toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'long' 
                        });
                        
                        console.log(`📅 ${dayName.toUpperCase()}, ${formattedDate}`);
                        console.log(`🌡️ Máxima: ${fallbackForecast.daily.temperature_2m_max[index]}°C`);
                        console.log(`🌡️ Mínima: ${fallbackForecast.daily.temperature_2m_min[index]}°C`);
                        console.log(`🌤️ ${getWeatherDescription(fallbackForecast.daily.weathercode[index])}`);
                        console.log('');
                    }
                });
            }
        } catch (fallbackError) {
            console.error('❌ Error en consulta de respaldo:', fallbackError.message);
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
        0: '☀️ Cielo despejado',
        1: '🌤️ Principalmente despejado',
        2: '⛅ Parcialmente nublado',
        3: '☁️ Nublado',
        45: '🌫️ Niebla',
        48: '🌫️ Niebla con escarcha',
        51: '🌦️ Llovizna ligera',
        53: '🌦️ Llovizna moderada',
        55: '🌧️ Llovizna intensa',
        61: '🌧️ Lluvia ligera',
        63: '🌧️ Lluvia moderada',
        65: '🌧️ Lluvia intensa',
        71: '❄️ Nevada ligera',
        73: '❄️ Nevada moderada',
        75: '❄️ Nevada intensa',
        80: '🌦️ Chubascos ligeros',
        81: '⛈️ Chubascos moderados',
        82: '⛈️ Chubascos intensos',
        95: '⛈️ Tormenta',
        96: '⛈️ Tormenta con granizo ligero',
        99: '⛈️ Tormenta con granizo intenso'
    };
    
    return descriptions[code] || '🌤️ Condición desconocida';
}

// Execute
getWeatherForecast();