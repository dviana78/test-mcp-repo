const https = require('https');

console.log('🎬 Star Wars Female Characters - Movie Appearances');
console.log('===================================================\n');

// Function to make API requests
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

// Function to get all characters
async function getAllCharacters() {
    console.log('📡 Fetching all Star Wars characters...');
    let allCharacters = [];
    let page = 1;
    
    while (true) {
        try {
            const url = `https://swapi.dev/api/people/?page=${page}`;
            const data = await makeRequest(url);
            
            allCharacters = allCharacters.concat(data.results);
            console.log(`✅ Page ${page}: ${data.results.length} characters fetched`);
            
            if (!data.next) break;
            page++;
        } catch (error) {
            console.error(`❌ Error fetching page ${page}:`, error.message);
            break;
        }
    }
    
    return allCharacters;
}

// Function to get movie details
async function getMovieDetails(filmUrls) {
    const movies = [];
    
    for (const filmUrl of filmUrls) {
        try {
            const movie = await makeRequest(filmUrl);
            movies.push({
                title: movie.title,
                episode: movie.episode_id,
                releaseDate: movie.release_date
            });
        } catch (error) {
            console.error(`❌ Error fetching movie ${filmUrl}:`, error.message);
        }
    }
    
    // Sort by episode number
    return movies.sort((a, b) => a.episode - b.episode);
}

// Main analysis function
async function analyzeFemaleCharactersMovies() {
    try {
        console.log('🚀 Starting female characters movie analysis...\n');
        
        // Get all characters
        const allCharacters = await getAllCharacters();
        console.log(`📊 Total characters found: ${allCharacters.length}\n`);
        
        // Filter female characters
        const femaleCharacters = allCharacters.filter(char => char.gender === 'female');
        console.log(`👩 Female characters found: ${femaleCharacters.length}\n`);
        
        console.log('🎬 FEMALE CHARACTERS - MOVIE APPEARANCES:');
        console.log('==========================================\n');
        
        // Process each female character
        for (let i = 0; i < femaleCharacters.length; i++) {
            const character = femaleCharacters[i];
            console.log(`${i + 1}. 👩 ${character.name}`);
            console.log(`   📅 Birth Year: ${character.birth_year}`);
            
            if (character.films && character.films.length > 0) {
                console.log(`   🎬 Movies (${character.films.length}):`);
                
                try {
                    const movies = await getMovieDetails(character.films);
                    movies.forEach(movie => {
                        console.log(`      • Episode ${movie.episode}: ${movie.title} (${movie.releaseDate})`);
                    });
                } catch (error) {
                    console.log(`      ❌ Error fetching movie details: ${error.message}`);
                }
            } else {
                console.log(`   🎬 Movies: No movie appearances found`);
            }
            
            console.log(''); // Empty line for readability
        }
        
        // Summary statistics
        console.log('\n📈 SUMMARY STATISTICS:');
        console.log('=======================');
        
        const movieCounts = {};
        let totalAppearances = 0;
        
        for (const character of femaleCharacters) {
            const movieCount = character.films ? character.films.length : 0;
            totalAppearances += movieCount;
            
            if (movieCounts[movieCount]) {
                movieCounts[movieCount]++;
            } else {
                movieCounts[movieCount] = 1;
            }
        }
        
        console.log(`👩 Total female characters: ${femaleCharacters.length}`);
        console.log(`🎬 Total movie appearances: ${totalAppearances}`);
        console.log(`📊 Average appearances per character: ${(totalAppearances / femaleCharacters.length).toFixed(1)}`);
        
        console.log('\n📊 Distribution by number of movie appearances:');
        Object.entries(movieCounts)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .forEach(([count, characters]) => {
                const plural = characters === 1 ? 'character' : 'characters';
                console.log(`   ${count} movies: ${characters} ${plural}`);
            });
        
        console.log('\n✅ Analysis completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in analysis:', error.message);
    }
}

// Run the analysis
analyzeFemaleCharactersMovies();