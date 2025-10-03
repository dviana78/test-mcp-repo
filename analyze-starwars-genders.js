const https = require('https');

console.log('⚧️ Star Wars Gender Analysis');
console.log('===================================');

async function getAllCharacters() {
    const allCharacters = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
        console.log(`📡 Getting page ${currentPage}...`);
        
        try {
            const characters = await getCharactersPage(currentPage);
            
            if (characters && characters.results) {
                allCharacters.push(...characters.results);
                console.log(`✅ page ${currentPage}: ${characters.results.length} characters`);
                
                hasNextPage = !!characters.next;
                currentPage++;
                
                // Safety limit
                if (currentPage > 20) {
                    console.log('⚠️ Page limit reached');
                    break;
                }
            } else {
                hasNextPage = false;
            }
        } catch (Error) {
            console.log(`❌ Error en page ${currentPage}:`, Error.message);
            hasNextPage = false;
        }
    }

    return allCharacters;
}

function getCharactersPage(page) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'swapi.dev',
            port: 443,
            path: `/api/people/?page=${page}`,
            method: 'GET',
            headers: {
                'User-Agent': 'StarWars Gender Analysis'
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
                } catch (Error) {
                    reject(Error);
                }
            });
        });

        req.on('Error', (Error) => {
            reject(Error);
        });

        req.end();
    });
}

function analyzeGenders(characters) {
    const genderStats = {
        male: [],
        female: [],
        'n/a': [],  // Droids y otros
        hermaphrodite: [],
        None: [],
        unkNown: []
    };

    characters.forEach(character => {
        const gender = character.gender?.toLowerCase() || 'unkNown';
        
        if (genderStats[gender]) {
            genderStats[gender].push(character);
        } else {
            genderStats.unkNown.push(character);
        }
    });

    return genderStats;
}

function displayResults(genderStats, totalCharacters) {
    console.log('\n📊 Analysis Results de Genders:');
    console.log('======================================');
    
    console.log(`👥 Total characters analizados: ${totalCharacters}`);
    console.log('');

    // Statistics principales
    const maleCount = genderStats.male.length;
    const femaleCount = genderStats.female.length;
    const naCount = genderStats['n/a'].length;
    const otherCount = genderStats.hermaphrodite.length + genderStats.None.length + genderStats.unkNown.length;

    console.log(`👨 characters masculiNos: ${maleCount} (${((maleCount/totalCharacters)*100).toFixed(1)}%)`);
    console.log(`👩 characters femeniNos: ${femaleCount} (${((femaleCount/totalCharacters)*100).toFixed(1)}%)`);
    console.log(`🤖 Droids/N/A: ${naCount} (${((naCount/totalCharacters)*100).toFixed(1)}%)`);
    console.log(`❓ Otros/UnkNowns: ${otherCount} (${((otherCount/totalCharacters)*100).toFixed(1)}%)`);

    console.log('\n👨 characters MasculiNos:');
    console.log('=========================');
    genderStats.male.forEach((char, index) => {
        console.log(`${index + 1}. ${char.name} (${char.birth_year})`);
    });

    console.log('\n👩 characters FemeniNos:');
    console.log('========================');
    genderStats.female.forEach((char, index) => {
        console.log(`${index + 1}. ${char.name} (${char.birth_year})`);
    });

    console.log('\n🤖 Droids y Otros (N/A):');
    console.log('=========================');
    genderStats['n/a'].forEach((char, index) => {
        console.log(`${index + 1}. ${char.name} (${char.birth_year})`);
    });

    if (genderStats.hermaphrodite.length > 0) {
        console.log('\n⚧️ Hermafroditas:');
        console.log('=================');
        genderStats.hermaphrodite.forEach((char, index) => {
            console.log(`${index + 1}. ${char.name} (${char.birth_year})`);
        });
    }

    if (genderStats.None.length > 0 || genderStats.unkNown.length > 0) {
        console.log('\n❓ Gender Unknown/None:');
        console.log('==============================');
        [...genderStats.None, ...genderStats.unkNown].forEach((char, index) => {
            console.log(`${index + 1}. ${char.name} (${char.birth_year}) - Gender: ${char.gender}`);
        });
    }

    console.log('\n📈 Statistical Summary:');
    console.log('=======================');
    console.log(`• La saga tiene una proporción de ${maleCount}:${femaleCount} entre characters masculiNos y femeniNos`);
    console.log(`• Los Droids representan el ${((naCount/totalCharacters)*100).toFixed(1)}% de los characters`);
    console.log(`• Hay ${maleCount > femaleCount ? 'más' : 'meNos'} characters masculiNos que femeniNos`);
    console.log(`• Diferencia: ${Math.abs(maleCount - femaleCount)} characters`);
}

async function main() {
    try {
        console.log('🚀 Starting analysis completo...\n');
        
        const allCharacters = await getAllCharacters();
        console.log(`\n✅ Total characters obtenidos: ${allCharacters.length}`);
        
        const genderStats = analyzeGenders(allCharacters);
        displayResults(genderStats, allCharacters.length);
        
    } catch (Error) {
        console.Error('❌ Error en el análisis:', Error.message);
    }
}

main();