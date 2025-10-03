const https = require('https');

console.log('🪐 Getting All Star Wars Planets');
console.log('================================');

async function getAllPlanets() {
    const allPlanets = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
        console.log(`📡 Getting page ${currentPage}...`);
        
        try {
            const planets = await getPlanetsPage(currentPage);
            
            if (planets && planets.results) {
                allPlanets.push(...planets.results);
                console.log(`✅ Page ${currentPage}: ${planets.results.length} planets`);
                
                hasNextPage = !!planets.next;
                currentPage++;
                
                // Safety limit
                if (currentPage > 20) {
                    console.log('⚠️ Page limit reached');
                    break;
                }
            } else {
                hasNextPage = false;
            }
        } catch (error) {
            console.log(`❌ Error on page ${currentPage}:`, error.message);
            hasNextPage = false;
        }
    }

    return allPlanets;
}

function getPlanetsPage(page) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'swapi.dev',
            port: 443,
            path: `/api/planets/?page=${page}`,
            method: 'GET',
            headers: {
                'User-Agent': 'StarWars Planet Analysis'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

function analyzePlanets(planets) {
    console.log('\n🌍 Complete List of Star Wars Planets:');
    console.log('======================================');
    
    planets.forEach((planet, index) => {
        console.log(`${index + 1}. 🪐 ${planet.name}`);
        console.log(`   🌡️ Climate: ${planet.climate}`);
        console.log(`   🏔️ Terrain: ${planet.terrain}`);
        console.log(`   👥 Population: ${planet.population === 'unknown' ? 'Unknown' : planet.population.toLocaleString()}`);
        console.log(`   ⏰ Rotation period: ${planet.rotation_period} hours`);
        console.log(`   🌅 Orbital period: ${planet.orbital_period} days`);
        console.log(`   📏 Diameter: ${planet.diameter} km`);
        console.log(`   🌊 Surface water: ${planet.surface_water}%`);
        console.log(`   🎬 Featured in ${planet.films.length} movies`);
        console.log(`   👤 Notable residents: ${planet.residents.length} characters`);
        console.log('');
    });

    // Statistics
    console.log('\n📊 Planet Statistics:');
    console.log('=====================');
    console.log(`🪐 Total planets: ${planets.length}`);
    
    // Climate analysis
    const climates = {};
    planets.forEach(planet => {
        const climate = planet.climate || 'unknown';
        climates[climate] = (climates[climate] || 0) + 1;
    });
    
    console.log('\n🌡️ Climate Distribution:');
    Object.entries(climates)
        .sort(([,a], [,b]) => b - a)
        .forEach(([climate, count]) => {
            console.log(`   ${climate}: ${count} planets`);
        });

    // Terrain analysis
    const terrains = {};
    planets.forEach(planet => {
        const terrain = planet.terrain || 'unknown';
        terrains[terrain] = (terrains[terrain] || 0) + 1;
    });
    
    console.log('\n🏔️ Terrain Distribution:');
    Object.entries(terrains)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10) // Show top 10 terrain types
        .forEach(([terrain, count]) => {
            console.log(`   ${terrain}: ${count} planets`);
        });

    // Population analysis
    const populatedPlanets = planets.filter(p => p.population !== 'unknown' && p.population !== '0');
    const unpopulatedPlanets = planets.filter(p => p.population === '0');
    const unknownPopulation = planets.filter(p => p.population === 'unknown');
    
    console.log('\n👥 Population Analysis:');
    console.log(`   Populated planets: ${populatedPlanets.length}`);
    console.log(`   Unpopulated planets: ${unpopulatedPlanets.length}`);
    console.log(`   Unknown population: ${unknownPopulation.length}`);

    // Most populous planets
    const mostPopulous = populatedPlanets
        .filter(p => !isNaN(parseInt(p.population)))
        .sort((a, b) => parseInt(b.population) - parseInt(a.population))
        .slice(0, 5);
    
    if (mostPopulous.length > 0) {
        console.log('\n🏙️ Most Populous Planets:');
        mostPopulous.forEach((planet, index) => {
            const population = parseInt(planet.population).toLocaleString();
            console.log(`   ${index + 1}. ${planet.name}: ${population} inhabitants`);
        });
    }

    // Notable planets by movie appearances
    const moviePlanets = planets
        .filter(p => p.films.length > 0)
        .sort((a, b) => b.films.length - a.films.length)
        .slice(0, 10);
    
    console.log('\n🎬 Planets Featured in Most Movies:');
    moviePlanets.forEach((planet, index) => {
        console.log(`   ${index + 1}. ${planet.name}: ${planet.films.length} movies`);
    });
}

async function main() {
    try {
        console.log('🚀 Starting complete planet analysis...\n');
        
        const allPlanets = await getAllPlanets();
        console.log(`\n✅ Total planets retrieved: ${allPlanets.length}`);
        
        analyzePlanets(allPlanets);
        
    } catch (error) {
        console.error('❌ Error in analysis:', error.message);
    }
}

main();