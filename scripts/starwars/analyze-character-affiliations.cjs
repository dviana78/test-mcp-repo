const https = require('https');

console.log('⚔️ Star Wars Characters - Rebels vs Dark Side Analysis');
console.log('======================================================\n');

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

// Character classification based on known affiliations
const characterClassification = {
    rebels: [
        'Luke Skywalker', 'Leia Organa', 'Han Solo', 'Chewbacca', 
        'Obi-Wan Kenobi', 'Yoda', 'Mon Mothma', 'Ackbar', 'Wedge Antilles',
        'Jek Tono Porkins', 'Arvel Crynyd', 'Nien Nunb', 'Wicket Systri Warrick',
        'Beru Whitesun lars', 'Owen Lars', 'Biggs Darklighter', 'Bail Prestor Organa',
        'R2-D2', 'C-3PO', 'R5-D4', 'R4-P17'
    ],
    
    darkSide: [
        'Darth Vader', 'Palpatine', 'Darth Maul', 'Dooku', 'Anakin Skywalker',
        'Wilhuff Tarkin', 'Boba Fett', 'Jabba Desilijic Tiure', 'Greedo',
        'IG-88', 'Bossk', 'Jango Fett', 'Zam Wesell', 'Grievous',
        'Nute Gunray', 'Poggle the Lesser', 'Wat Tambor', 'San Hill',
        'Sly Moore'
    ],
    
    jedi: [
        'Qui-Gon Jinn', 'Mace Windu', 'Ki-Adi-Mundi', 'Kit Fisto',
        'Eeth Koth', 'Adi Gallia', 'Saesee Tiin', 'Yarael Poof',
        'Plo Koon', 'Luminara Unduli', 'Barriss Offee', 'Ayla Secura',
        'Shaak Ti', 'Jocasta Nu'
    ],
    
    republic: [
        'Padmé Amidala', 'Finis Valorum', 'Mas Amedda', 'Quarsh Panaka',
        'Gregar Typho', 'Cordé', 'Dormé', 'Ric Olié'
    ],
    
    neutralOrOther: [
        'Shmi Skywalker', 'Watto', 'Sebulba', 'Jar Jar Binks',
        'Roos Tarpals', 'Rugor Nass', 'Bib Fortuna', 'Lando Calrissian',
        'Lobot', 'Ratts Tyerel', 'Dud Bolt', 'Gasgano', 'Ben Quadinaros',
        'Cliegg Lars', 'Dexter Jettster', 'Lama Su', 'Taun We',
        'Tarfful', 'Raymus Antilles', 'Tion Medon'
    ]
};

// Function to classify character
function classifyCharacter(characterName) {
    if (characterClassification.rebels.includes(characterName)) {
        return 'Rebel Alliance';
    } else if (characterClassification.darkSide.includes(characterName)) {
        return 'Dark Side/Empire';
    } else if (characterClassification.jedi.includes(characterName)) {
        return 'Jedi Order';
    } else if (characterClassification.republic.includes(characterName)) {
        return 'Republic';
    } else if (characterClassification.neutralOrOther.includes(characterName)) {
        return 'Neutral/Other';
    } else {
        return 'Unknown';
    }
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

// Main analysis function
async function analyzeCharacterAffiliations() {
    try {
        console.log('🚀 Starting character affiliation analysis...\n');
        
        // Get all characters
        const allCharacters = await getAllCharacters();
        console.log(`📊 Total characters found: ${allCharacters.length}\n`);
        
        // Classify characters
        const affiliations = {
            'Rebel Alliance': [],
            'Dark Side/Empire': [],
            'Jedi Order': [],
            'Republic': [],
            'Neutral/Other': [],
            'Unknown': []
        };
        
        allCharacters.forEach(character => {
            const affiliation = classifyCharacter(character.name);
            affiliations[affiliation].push(character);
        });
        
        // Display results
        console.log('⚔️ STAR WARS CHARACTERS BY AFFILIATION:');
        console.log('========================================\n');
        
        // Rebels
        console.log('🔴 REBEL ALLIANCE:');
        console.log('==================');
        console.log(`Total: ${affiliations['Rebel Alliance'].length} characters\n`);
        affiliations['Rebel Alliance'].forEach((char, index) => {
            console.log(`${index + 1}. 👤 ${char.name}`);
            console.log(`   📅 Birth Year: ${char.birth_year}`);
            console.log(`   👁️ Eye Color: ${char.eye_color}`);
            console.log(`   🎭 Gender: ${char.gender}`);
            console.log('');
        });
        
        // Dark Side
        console.log('⚫ DARK SIDE/EMPIRE:');
        console.log('====================');
        console.log(`Total: ${affiliations['Dark Side/Empire'].length} characters\n`);
        affiliations['Dark Side/Empire'].forEach((char, index) => {
            console.log(`${index + 1}. 👤 ${char.name}`);
            console.log(`   📅 Birth Year: ${char.birth_year}`);
            console.log(`   👁️ Eye Color: ${char.eye_color}`);
            console.log(`   🎭 Gender: ${char.gender}`);
            console.log('');
        });
        
        // Jedi Order
        console.log('🔵 JEDI ORDER:');
        console.log('==============');
        console.log(`Total: ${affiliations['Jedi Order'].length} characters\n`);
        affiliations['Jedi Order'].forEach((char, index) => {
            console.log(`${index + 1}. 👤 ${char.name}`);
            console.log(`   📅 Birth Year: ${char.birth_year}`);
            console.log(`   👁️ Eye Color: ${char.eye_color}`);
            console.log(`   🎭 Gender: ${char.gender}`);
            console.log('');
        });
        
        // Republic
        console.log('🟡 GALACTIC REPUBLIC:');
        console.log('=====================');
        console.log(`Total: ${affiliations['Republic'].length} characters\n`);
        affiliations['Republic'].forEach((char, index) => {
            console.log(`${index + 1}. 👤 ${char.name}`);
            console.log(`   📅 Birth Year: ${char.birth_year}`);
            console.log(`   👁️ Eye Color: ${char.eye_color}`);
            console.log(`   🎭 Gender: ${char.gender}`);
            console.log('');
        });
        
        // Neutral/Other
        console.log('⚪ NEUTRAL/OTHER:');
        console.log('=================');
        console.log(`Total: ${affiliations['Neutral/Other'].length} characters\n`);
        affiliations['Neutral/Other'].forEach((char, index) => {
            console.log(`${index + 1}. 👤 ${char.name}`);
            console.log(`   📅 Birth Year: ${char.birth_year}`);
            console.log(`   👁️ Eye Color: ${char.eye_color}`);
            console.log(`   🎭 Gender: ${char.gender}`);
            console.log('');
        });
        
        // Unknown
        if (affiliations['Unknown'].length > 0) {
            console.log('❓ UNKNOWN AFFILIATION:');
            console.log('=======================');
            console.log(`Total: ${affiliations['Unknown'].length} characters\n`);
            affiliations['Unknown'].forEach((char, index) => {
                console.log(`${index + 1}. 👤 ${char.name}`);
                console.log(`   📅 Birth Year: ${char.birth_year}`);
                console.log(`   👁️ Eye Color: ${char.eye_color}`);
                console.log(`   🎭 Gender: ${char.gender}`);
                console.log('');
            });
        }
        
        // Summary statistics
        console.log('\n📈 AFFILIATION SUMMARY:');
        console.log('========================');
        Object.entries(affiliations).forEach(([affiliation, characters]) => {
            if (characters.length > 0) {
                const percentage = ((characters.length / allCharacters.length) * 100).toFixed(1);
                console.log(`${affiliation}: ${characters.length} characters (${percentage}%)`);
            }
        });
        
        // Rebels vs Dark Side comparison
        const rebelsCount = affiliations['Rebel Alliance'].length + affiliations['Jedi Order'].length;
        const darkSideCount = affiliations['Dark Side/Empire'].length;
        
        console.log('\n⚔️ REBELS vs DARK SIDE:');
        console.log('========================');
        console.log(`🔴 Light Side Forces (Rebels + Jedi): ${rebelsCount} characters`);
        console.log(`⚫ Dark Side Forces: ${darkSideCount} characters`);
        console.log(`📊 Light vs Dark Ratio: ${(rebelsCount / darkSideCount).toFixed(1)}:1`);
        
        console.log('\n✅ Analysis completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in analysis:', error.message);
    }
}

// Run the analysis
analyzeCharacterAffiliations();