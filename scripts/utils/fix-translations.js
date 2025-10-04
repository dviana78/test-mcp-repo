import fs from 'fs';
import path from 'path';

console.log('🔧 Enhanced English Translation Script');
console.log('======================================');

// Precise translation patterns
const preciseTranslations = [
  // Console log patterns with exact Spanish phrases
  { 
    pattern: /console\.log\('([^']*Método[^']*)'\)/g,
    replacement: "console.log('🔍 Method 1: Direct access to original backend...')"
  },
  {
    pattern: /console\.log\('([^']*Encontrados[^']*)'\)/g,
    replacement: "console.log(`✅ Success! Found ${data.count} characters`)"
  },
  {
    pattern: /console\.log\('([^']*characters de Star Wars[^']*)'\)/g,
    replacement: "console.log('\\n👥 Star Wars Characters:')"
  },
  {
    pattern: /console\.log\('([^']*More characters[^']*)'\)/g,
    replacement: "console.log('\\n👥 More Characters:')"
  },
  {
    pattern: /console\.log\('([^']*Error con curl[^']*)'\)/g,
    replacement: "console.log('⚠️ Error with curl:', stderr)"
  },
  {
    pattern: /console\.log\('([^']*Error getting characters[^']*)'\)/g,
    replacement: "console.log('❌ Error getting characters:', error.message)"
  },
  {
    pattern: /console\.log\('([^']*Intentando método alternativo[^']*)'\)/g,
    replacement: "console.log('🔄 Trying alternative method...')"
  },
  {
    pattern: /console\.log\('([^']*Getting more characters[^']*)'\)/g,
    replacement: "console.log('📄 Getting more characters...')"
  },
  {
    pattern: /console\.log\('([^']*La API de Star Wars está funcionando[^']*)'\)/g,
    replacement: "console.log('The Star Wars API is working perfectly on the original backend.')"
  },
  {
    pattern: /console\.log\('([^']*El problema está en la Configuration[^']*)'\)/g,
    replacement: "console.log('The problem is in the Azure APIM configuration that needs adjustments.')"
  },
  {
    pattern: /console\.log\('([^']*Verificar la Configuration del Service URL[^']*)'\)/g,
    replacement: "console.log('1. Verify the Service URL configuration')"
  },
  {
    pattern: /console\.log\('([^']*Configurar las políticas[^']*)'\)/g,
    replacement: "console.log('2. Configure URL rewrite policies')"
  },
  {
    pattern: /console\.log\('([^']*Asegurar than los endpoints[^']*)'\)/g,
    replacement: "console.log('3. Ensure endpoints are mapped correctly')"
  }
];

// Simple word replacements
const wordReplacements = {
  'characters': 'characters',
  'Characters': 'Characters',
  'Encontrados': 'Found',
  'Éxito': 'Success',
  'Error': 'Error',
  'Método': 'Method',
  'Access directo': 'Direct access',
  'backend original': 'original backend',
  'Planet': 'Planet',
  'Eye color': 'Eye color',
  'Gender': 'Gender',
  'Desconocido': 'Unknown',
  'More': 'More',
  'Getting': 'Getting',
  'Intentando': 'Trying',
  'método alternativo': 'alternative method',
  'Películas': 'Movies',
  'Apariciones': 'Appearances',
  'Height': 'Height',
  'exitoso': 'successful',
  'UnkNown': 'Unknown'
};

// Spanish comments to English
const commentTranslations = {
  '// Usar curl para obtener datos directamente del backend': '// Use curl to get data directly from the backend',
  '// Si there are more pages, obtener algunos characters adicionales': '// If there are more pages, get some additional characters',
  '// Método alternativo usando Node.js': '// Alternative method using Node.js',
  '// Mostrar los primeros characters': '// Show the first characters',
  '// Ignorar líneas than no son JSON válidas': '// Ignore lines that are not valid JSON',
  '// No es JSON válido, probablemente es log del server': '// Not valid JSON, probably server log',
  '// Límite de seguridad': '// Safety limit',
  '// Configuration de la API': '// API Configuration',
  '// Clave obtenida de la subscription': '// Key obtained from subscription',
  '// Verificar si there are more pages': '// Check if there are more pages',
  '// Pequeña pausa entre requests': '// Small pause between requests',
  '// Estadísticas main': '// Main statistics',
  '// Estadísticas adicionales': '// Additional statistics',
  '// Películas en las than aparece': '// Movies where character appears'
};

function translateFileContent(content) {
  let translatedContent = content;
  
  // Apply precise pattern replacements first
  preciseTranslations.forEach(({ pattern, replacement }) => {
    translatedContent = translatedContent.replace(pattern, replacement);
  });
  
  // Apply comment translations
  Object.entries(commentTranslations).forEach(([spanish, english]) => {
    translatedContent = translatedContent.replace(spanish, english);
  });
  
  // Apply word replacements
  Object.entries(wordReplacements).forEach(([spanish, english]) => {
    const regex = new RegExp(`\\b${spanish}\\b`, 'g');
    translatedContent = translatedContent.replace(regex, english);
  });
  
  // Fix any remaining Spanish patterns
  translatedContent = translatedContent
    .replace(/console\.log\(`✅ Success! Encontrados \$\{data\.count\} characters`\)/g, 
             "console.log(`✅ Success! Found ${data.count} characters`)")
    .replace(/console\.log\(`✅ Método alternativo exitoso! \$\{jsonData\.count\} characters`\)/g,
             "console.log(`✅ Alternative method successful! ${jsonData.count} characters`)")
    .replace(/🎭 Género:/g, '🎭 Gender:')
    .replace(/🏠 Planeta:/g, '🏠 Planet:')
    .replace(/👁️ Color de ojos:/g, '👁️ Eye color:')
    .replace(/📏 Altura:/g, '📏 Height:')
    .replace(/🎬 Apariciones:/g, '🎬 Appearances:')
    .replace(/películas/g, 'movies');
  
  return translatedContent;
}

function translateSpecificFiles() {
  const files = [
    'get-starwars-characters.js',
    'analyze-starwars-genders.js',
    'get-all-starwars-characters.js',
    'check-backend-direct.js',
    'test-apim-direct.js'
  ];
  
  files.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filename}`);
      return;
    }
    
    try {
      console.log(`🔧 Fixing translation: ${filename}`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      const translatedContent = translateFileContent(content);
      
      fs.writeFileSync(filePath, translatedContent, 'utf8');
      console.log(`✅ Fixed: ${filename}`);
      
    } catch (error) {
      console.log(`❌ Error fixing ${filename}:`, error.message);
    }
  });
}

translateSpecificFiles();
console.log('\n🎉 Enhanced translation completed!');