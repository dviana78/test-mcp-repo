import https from 'https';

console.log('\n👥 Star Wars Characters:');
console.log('============================================\n');

// API Configuration
const APIM_BASE_URL = 'apim-dviana78-dev.azure-api.net';
const API_PATH = '/swapi/v1/people';
const SUBSCRIPTION_KEY = 'd5fde29d155f4f0194e259d07818ec61'; // Key obtained de la subscription

function makeRequest(path, page = 1) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: APIM_BASE_URL,
      port: 443,
      path: `${path}?page=${page}`,
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
        'User-Agent': 'Star-Wars-Client/1.0'
      }
    };

    console.log(`📡 Querying page ${page}: https://${APIM_BASE_URL}${path}?page=${page}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`📊 Status: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            resolve(result);
          } else {
            console.log(`❌ Error HTTP ${res.statusCode}:`);
            console.log(data);
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
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

async function getAllCharacters() {
  let allCharacters = [];
  let currentPage = 1;
  let hasNextPage = true;
  
  try {
    console.log('🚀 Starting Star Wars API query...\n');
    
    while (hasNextPage && currentPage <= 10) { // Safety limit
      const response = await makeRequest(API_PATH, currentPage);
      
      if (response.results && Array.isArray(response.results)) {
        allCharacters = allCharacters.concat(response.results);
        console.log(`✅ page ${currentPage}: ${response.results.length} characters found`);
        console.log(`📊 Total so far: ${allCharacters.length} characters`);
        
        // Check if there are more pages
        hasNextPage = !!response.next;
        console.log(`🔄 Are there more pages? ${hasNextPage ? 'Yes' : 'No'}`);
        
        if (response.count) {
          console.log(`🎯 Total expected: ${response.count} characters\n`);
        }
        
        currentPage++;
      } else {
        console.log('❌ No results found in response');
        hasNextPage = false;
      }
      
      // Pause between requests to be respectful to the API
      if (hasNextPage) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`\n🎉 Query completed!`);
    console.log(`📋 Total characters obtained: ${allCharacters.length}\n`);
    console.log('=' * 60);
    console.log('🌟 COMPLETE LIST OF STAR WARS CHARACTERS 🌟');
    console.log('=' * 60);
    
    allCharacters.forEach((character, index) => {
      console.log(`\n${index + 1}. 👤 ${character.name}`);
      console.log(`   📏 Height: ${character.height === 'unkNown' ? 'DescoNocida' : character.height + ' cm'}`);
      console.log(`   ⚖️  Weight: ${character.mass === 'unkNown' ? 'Unknown' : character.mass + ' kg'}`);
      console.log(`   🎨 Hair: ${character.hair_color === 'unkNown' ? 'Unknown' : character.hair_color}`);
      console.log(`   👁️  Eyes: ${character.eye_color === 'unkNown' ? 'UnkNowns' : character.eye_color}`);
      console.log(`   🌌 Piel: ${character.skin_color === 'unkNown' ? 'DescoNocida' : character.skin_color}`);
      console.log(`   🎂 Birth: ${character.birth_year === 'unkNown' ? 'Unknown' : character.birth_year}`);
      console.log(`   ⚧️  Gender: ${character.gender === 'unkNown' ? 'Unknown' : character.gender}`);
      
      // Extraer ID del Planet from la URL
      if (character.homeworld) {
        const planetId = character.homeworld.split('/').filter(x => x).pop();
        console.log(`   🌍 Planet: ID ${planetId}`);
      }
      
      // Movies en las than aparece
      if (character.films && character.films.length > 0) {
        console.log(`   🎬 Movies: ${character.films.length} Appearances`);
      }
    });
    
    console.log(`\n${'=' * 60}`);
    console.log(`📊 Statistics:`);
    console.log(`   Total characters: ${allCharacters.length}`);
    
    // Statistics adicionales
    const genders = {};
    const species = {};
    allCharacters.forEach(char => {
      genders[char.gender] = (genders[char.gender] || 0) + 1;
    });
    
    console.log(`   Por Gender:`);
    Object.entries(genders).forEach(([gender, count]) => {
      console.log(`     ${gender}: ${count}`);
    });
    
  } catch (Error) {
    console.log('\n❌ Error al obtener characters:', Error.message);
    
    if (Error.message.includes('401')) {
      console.log('🔑 Authentication error. Verify la Subscription key.');
    } else if (Error.message.includes('403')) {
      console.log('🚫 Access denied. Verify los permissions de la subscription.');
    } else if (Error.message.includes('404')) {
      console.log('🔍 endpoint No encontrado. Verify la URL de la API.');
    }
  }
}

// Ejecutar la consulta
getAllCharacters();