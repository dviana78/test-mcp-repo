import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);

console.log('🌟 Getting Star Wars Characters');
console.log('=====================================');

async function getStarWarsCharacters() {
    console.log('🔍 Method 1: Direct access to original backend...');
    
    try {
        // Use curl to get data directly from the backend
        const { stdout, stderr } = await execPromise('curl -s https://swapi.dev/api/people/');
        
        if (stderr) {
            console.log('⚠️ Error with curl:', stderr);
            return;
        }

        const data = JSON.parse(stdout);
        console.log(`✅ Success! Found ${data.count} characters`);
        console.log('\n👥 Star Wars Characters:');
        console.log('===========================');
        
        // Show the first characters
        data.results.forEach((character, index) => {
            console.log(`${index + 1}. ${character.name}`);
            console.log(`   🏠 Planet: ${character.homeworld.split('/').slice(-2, -1)[0] || 'Unknown'}`);
            console.log(`   👁️ Eye color: ${character.eye_color}`);
            console.log(`   🎭 Gender: ${character.gender}`);
            console.log('');
        });

        // If there are more pages, get some additional characters
        if (data.next) {
            console.log('📄 Getting more characters...');
            const { stdout: page2 } = await execPromise('curl -s https://swapi.dev/api/people/?page=2');
            const data2 = JSON.parse(page2);
            
            console.log('\n👥 More Characters:');
            console.log('==================');
            data2.results.slice(0, 5).forEach((character, index) => {
                console.log(`${index + 11}. ${character.name}`);
                console.log(`   🏠 Planet: ${character.homeworld.split('/').slice(-2, -1)[0] || 'Unknown'}`);
                console.log(`   👁️ Eye color: ${character.eye_color}`);
                console.log(`   � Gender: ${character.gender}`);
                console.log('');
            });
        }

        console.log('💡 Note sobre APIM:');
        console.log('===================');
        console.log('The Star Wars API is working perfectly on the original backend.');
        console.log('The problem is in the Azure APIM configuration that needs adjustments.');
        console.log('Para solucionarlo, se necesita:');
        console.log('1. Verify the Service URL configuration');
        console.log('2. Configure las rewrite policies de URL');
        console.log('3. Ensure endpoints are mapped correctly');

    } catch (Error) {
        console.log('❌ Error Getting characters:', Error.message);
        console.log('🔄 Trying Alternative method...');
        
        // Alternative method usando Node.js
        const https = await import('https');
        
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'swapi.dev',
                port: 443,
                path: '/api/people/',
                method: 'GET'
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log(`✅ Alternative method successful! ${jsonData.count} characters`);
                        
                        console.log('\n👥 Star Wars Characters:');
                        console.log('===========================');
                        jsonData.results.forEach((character, index) => {
                            console.log(`${index + 1}. ${character.name}`);
                            console.log(`   🎬 Appearances: ${character.films.length} Movies`);
                            console.log(`   📏 Height: ${character.height} cm`);
                            console.log('');
                        });
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
            });

            req.on('Error', reject);
            req.end();
        });
    }
}

getStarWarsCharacters().catch(console.Error);