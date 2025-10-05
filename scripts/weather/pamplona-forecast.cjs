/**
 * Get weather forecast for Pamplona, Spain for October 9-10, 2025
 */

const https = require('https');

// Pamplona coordinates
const latitude = 42.8169;
const longitude = -1.6432;

async function getWeatherForecast() {
    console.log('🌤️ Obteniendo pronóstico del tiempo para Pamplona...\n');
    
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
    
    console.log('📍 Ubicación: Pamplona, España');
    console.log(`🗺️ Coordenadas: ${latitude}°N, ${longitude}°W`);
    console.log(`🔗 URL: ${url}\n`);
    
    try {
        const data = await makeRequest(url);
        const forecast = JSON.parse(data);
        
        console.log('📅 PRONÓSTICO DEL TIEMPO - PAMPLONA');
        console.log('====================================\n');
        
        if (forecast.daily) {
            const dates = forecast.daily.time;
            const maxTemps = forecast.daily.temperature_2m_max;
            const minTemps = forecast.daily.temperature_2m_min;
            const precipitation = forecast.daily.precipitation_sum;
            const windSpeed = forecast.daily.windspeed_10m_max;
            const weatherCodes = forecast.daily.weathercode;
            
            dates.forEach((date, index) => {
                const dateObj = new Date(date);
                const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                const formattedDate = dateObj.toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                });
                
                console.log(`📅 ${dayName.toUpperCase()}, ${formattedDate}`);
                console.log('─'.repeat(40));
                console.log(`🌡️ Temperatura máxima: ${maxTemps[index]}°C`);
                console.log(`🌡️ Temperatura mínima: ${minTemps[index]}°C`);
                console.log(`🌧️ Precipitación: ${precipitation[index]} mm`);
                console.log(`💨 Viento máximo: ${windSpeed[index]} km/h`);
                console.log(`🌤️ Código meteorológico: ${weatherCodes[index]} ${getWeatherDescription(weatherCodes[index])}`);
                console.log('');
            });
        } else {
            console.log('❌ No se pudieron obtener los datos del pronóstico');
        }
        
        console.log('📊 RESUMEN');
        console.log('==========');
        console.log(`🗓️ Período: 9-10 de octubre de 2025`);
        console.log(`📍 Ubicación: Pamplona, Navarra, España`);
        console.log(`🌐 Fuente: Open-Meteo API`);
        console.log(`⏰ Zona horaria: Europe/Madrid`);
        
    } catch (error) {
        console.error('❌ Error al obtener el pronóstico:', error.message);
        console.log('\n🔄 Intentando con una consulta alternativa...');
        
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
            
            console.log('📅 PRONÓSTICO SEMANAL - PAMPLONA (Incluye 9-10 octubre)');
            console.log('====================================================\n');
            
            if (altForecast.daily) {
                altForecast.daily.time.forEach((date, index) => {
                    if (date.includes('2025-10-09') || date.includes('2025-10-10')) {
                        const dateObj = new Date(date);
                        const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                        const formattedDate = dateObj.toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'long' 
                        });
                        
                        console.log(`📅 ${dayName.toUpperCase()}, ${formattedDate}`);
                        console.log(`🌡️ Máxima: ${altForecast.daily.temperature_2m_max[index]}°C`);
                        console.log(`🌡️ Mínima: ${altForecast.daily.temperature_2m_min[index]}°C`);
                        console.log('');
                    }
                });
            }
        } catch (altError) {
            console.error('❌ Error en consulta alternativa:', altError.message);
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
        80: '🌦️ Chubascos ligeros',
        81: '⛈️ Chubascos moderados',
        82: '⛈️ Chubascos intensos'
    };
    
    return descriptions[code] || '🌤️ Condición desconocida';
}

// Execute
getWeatherForecast();