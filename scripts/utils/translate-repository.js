import fs from 'fs';
import path from 'path';

console.log('🌍 English Translation Script for Repository');
console.log('============================================');

// Define translation mappings from Spanish to English
const translations = {
  // Common phrases
  'Analysis complete de Azure APIM': 'Complete Azure APIM Analysis',
  'Verifying Configuration de la API de Star Wars': 'Verifying Star Wars API Configuration',
  'Getting Characters de Star Wars': 'Getting Star Wars Characters',
  'Probando Access a través de APIM': 'Testing Access through APIM',
  'Verifying Backend Service Direct': 'Verifying Backend Service Direct',
  'Analysis Detallado de la API Star Wars en APIM': 'Detailed Analysis of Star Wars API in APIM',
  'Analysis de Géneros en Star Wars': 'Star Wars Gender Analysis',
  'Creating Subscription para la API de Star Wars': 'Creating Subscription for Star Wars API',
  
  // Messages and actions
  'Getting': 'Getting',
  'Enviando': 'Sending',
  'Verifying': 'Verifying',
  'Probando': 'Testing',
  'Configuration': 'Configuration',
  'Configurando': 'Configuring',
  'Creating': 'Creating',
  'Analizando': 'Analyzing',
  'Consultando': 'Querying',
  'Conectando': 'Connecting',
  
  // Status messages
  'Éxito': 'Success',
  'Error': 'Error',
  'Error getting': 'Error getting',
  'Error conectando': 'Error connecting',
  'Error parseando': 'Error parsing',
  'Error del server': 'Server error',
  'Error de connection': 'Connection error',
  'Error de autenticación': 'Authentication error',
  
  // API related
  'Información de la API': 'API Information',
  'Operations de la API': 'API Operations',
  'Details de la API': 'API Details',
  'Configuration de la API': 'API Configuration',
  'Subscription requerida': 'Subscription required',
  'Clave de subscription': 'Subscription key',
  'Details de la subscription': 'Subscription details',
  
  // Characters and data
  'characters': 'characters',
  'characters encontrados': 'characters found',
  'More characters': 'More characters',
  'Lista de Characters': 'Character List',
  'Género': 'Gender',
  'Planeta': 'Planet',
  'Color de ojos': 'Eye color',
  'Apariciones': 'Appearances',
  'Películas': 'Movies',
  'Altura': 'Height',
  'Peso': 'Weight',
  'Cabello': 'Hair',
  'Ojos': 'Eyes',
  'Nacimiento': 'Birth',
  
  // Analysis terms
  'Resultados del Analysis': 'Analysis Results',
  'Summary Estadístico': 'Statistical Summary',
  'Estadísticas': 'Statistics',
  'ESTADÍSTICAS': 'STATISTICS',
  'Total de characters': 'Total characters',
  'Characters masculinos': 'Male characters',
  'Characters femeninos': 'Female characters',
  'Droides': 'Droids',
  'Desconocido': 'Unknown',
  'Ninguno': 'None',
  
  // Process messages
  'Proceso completed': 'Process completed',
  'Proceso finished': 'Process finished',
  'Analysis completed': 'Analysis completed',
  'Iniciando analysis': 'Starting analysis',
  'Límite de pages alcanzado': 'Page limit reached',
  'Límite de seguridad': 'Safety limit',
  
  // API paths and endpoints
  'Sin description': 'No description',
  'Sin versión': 'No version',
  'Vehículos terrestres': 'Ground vehicles',
  'Especies alienígenas': 'Alien species',
  'Episodios': 'Episodes',
  
  // Navigation and pagination
  'page': 'page',
  'Page': 'Page',
  'There are more pages': 'More pages available',
  '¿There are more pages?': 'More pages?',
  'Sí': 'Yes',
  'No': 'No',
  
  // Notes and information
  'Nota': 'Note',
  'Información': 'Information',
  'Próximos pasos': 'Next steps',
  'Posibles causas': 'Possible causes',
  'Basado en la información obtenida': 'Based on the information obtained',
  
  // Technical terms
  'backend': 'backend',
  'server': 'server',
  'service': 'service',
  'endpoint': 'endpoint',
  'API esté configurada incorrectamente': 'API is configured incorrectly',
  'backend service URL está mal configurado': 'backend service URL is misconfigured',
  'políticas de rewrite': 'rewrite policies',
  'configuration adicional': 'additional configuration',
  'endpoints estén mapeados correctamente': 'endpoints are mapped correctly',
  
  // Comments
  'Ignorar líneas than no son JSON': 'Ignore lines that are not JSON',
  'No es JSON válido': 'Not valid JSON',
  'Límite de seguridad': 'Safety limit',
  'Método alternativo': 'Alternative method',
  'Configuration de la API': 'API Configuration',
  'Clave obtenida': 'Key obtained',
  'Si there are more pages': 'If there are more pages',
  'Verificar si there are more pages': 'Check if there are more pages',
  'Películas en las than aparece': 'Movies where character appears',
  'Estadísticas adicionales': 'Additional statistics',
  'Por género': 'By gender',
  'Secuencia de verificación': 'Verification sequence'
};

// Files to translate
const filesToTranslate = [
  'apim-analyzer.js',
  'test-list-apis.js',
  'list-tools-detailed.js',
  'get-starwars-operations.js',
  'get-starwars-characters.js',
  'get-starwars-info.js',
  'create-starwars-subscription.js',
  'get-all-starwars-characters.js',
  'verify-starwars-api.js',
  'check-backend-direct.js',
  'test-apim-direct.js',
  'test-all-paths.js',
  'analyze-star-wars-api.js',
  'analyze-starwars-genders.js'
];

function translateText(text) {
  let translatedText = text;
  
  // Apply translations
  for (const [spanish, english] of Object.entries(translations)) {
    const regex = new RegExp(spanish, 'gi');
    translatedText = translatedText.replace(regex, english);
  }
  
  return translatedText;
}

function translateFile(filename) {
  const filePath = path.join(__dirname, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return;
  }
  
  try {
    console.log(`📝 Translating: ${filename}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const translatedContent = translateText(content);
    
    // Create backup
    const backupPath = `${filePath}.backup`;
    fs.writeFileSync(backupPath, content, 'utf8');
    
    // Write translated content
    fs.writeFileSync(filePath, translatedContent, 'utf8');
    
    console.log(`✅ Translated: ${filename} (backup created: ${filename}.backup)`);
    
  } catch (error) {
    console.log(`❌ Error translating ${filename}:`, error.message);
  }
}

function main() {
  console.log('Starting translation process...\n');
  
  filesToTranslate.forEach(filename => {
    translateFile(filename);
  });
  
  console.log('\n🎉 Translation process completed!');
  console.log('📋 Summary:');
  console.log(`   - ${filesToTranslate.length} files processed`);
  console.log('   - Backup files created with .backup extension');
  console.log('   - All Spanish text should now be in English');
}

main();