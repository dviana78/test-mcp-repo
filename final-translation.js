const fs = require('fs');
const path = require('path');

console.log('🔄 Final Translation Pass - All Repository Files');
console.log('================================================');

// Comprehensive Spanish to English translations
const finalTranslations = {
  // Remaining Spanish phrases
  'Error con curl': 'Error with curl',
  'Si hay más páginas': 'If there are more pages',
  'obtener algunos characters adicionales': 'get some additional characters',
  'Getting más characters': 'Getting more characters',
  'más characters': 'more characters',
  'Más Characters': 'More Characters',
  'alguNos': 'some',
  'páginas': 'pages',
  'página': 'page',
  'Página': 'Page',
  'Obteniendo': 'Getting',
  'obteniendo': 'getting',
  'Enviando': 'Sending',
  'enviando': 'sending',
  'Verificando': 'Verifying',
  'verificando': 'verifying',
  'Probando': 'Testing',
  'probando': 'testing',
  'Creando': 'Creating',
  'creando': 'creating',
  'Analizando': 'Analyzing',
  'analizando': 'analyzing',
  'Consultando': 'Querying',
  'consultando': 'querying',
  'Conectando': 'Connecting',
  'conectando': 'connecting',
  'Configurando': 'Configuring',
  'configurando': 'configuring',
  'Iniciando': 'Starting',
  'iniciando': 'starting',
  
  // Analysis terms
  'análisis completo': 'complete analysis',
  'Análisis completo': 'Complete analysis',
  'Análisis Detallado': 'Detailed Analysis',
  'análisis detallado': 'detailed analysis',
  'Resultados del Análisis': 'Analysis Results',
  'resultados del análisis': 'analysis results',
  'Resumen Estadístico': 'Statistical Summary',
  'resumen estadístico': 'statistical summary',
  'Estadísticas': 'Statistics',
  'estadísticas': 'statistics',
  'Total de characters': 'Total characters',
  'total de characters': 'total characters',
  'characters masculinos': 'male characters',
  'characters femeninos': 'female characters',
  'Droides': 'Droids',
  'droides': 'droids',
  'Desconocido': 'Unknown',
  'desconocido': 'unknown',
  'Ninguno': 'None',
  'ninguno': 'none',
  
  // Process terms
  'Proceso completado': 'Process completed',
  'proceso completado': 'process completed',
  'Proceso terminado': 'Process finished',
  'proceso terminado': 'process finished',
  'Análisis completado': 'Analysis completed',
  'análisis completado': 'analysis completed',
  'límite de páginas alcanzado': 'page limit reached',
  'Límite de páginas alcanzado': 'Page limit reached',
  'límite de seguridad': 'safety limit',
  'Límite de seguridad': 'Safety limit',
  
  // API and technical terms
  'Información de la API': 'API Information',
  'información de la API': 'API information',
  'Operaciones de la API': 'API Operations',
  'operaciones de la API': 'API operations',
  'Detalles de la API': 'API Details',
  'detalles de la API': 'API details',
  'Configuration de la API': 'API Configuration',
  'configuration de la API': 'API configuration',
  'Suscripción requerida': 'Subscription required',
  'suscripción requerida': 'subscription required',
  'Clave de suscripción': 'Subscription key',
  'clave de suscripción': 'subscription key',
  'Detalles de la suscripción': 'Subscription details',
  'detalles de la suscripción': 'subscription details',
  
  // Character analysis terms
  'characters': 'characters',
  'characters encontrados': 'characters found',
  'Lista de Characters': 'Character List',
  'lista de characters': 'character list',
  'Gender': 'Gender',
  'gender': 'gender',
  'Género': 'Gender',
  'género': 'gender',
  'Planet': 'Planet',
  'planet': 'planet',
  'Planeta': 'Planet',
  'planeta': 'planet',
  'Eye color': 'Eye color',
  'eye color': 'eye color',
  'Color de ojos': 'Eye color',
  'color de ojos': 'eye color',
  'Apariciones': 'Appearances',
  'apariciones': 'appearances',
  'Movies': 'Movies',
  'movies': 'movies',
  'Películas': 'Movies',
  'películas': 'movies',
  'Height': 'Height',
  'height': 'height',
  'Altura': 'Height',
  'altura': 'height',
  'Weight': 'Weight',
  'weight': 'weight',
  'Peso': 'Weight',
  'peso': 'weight',
  'Hair': 'Hair',
  'hair': 'hair',
  'Cabello': 'Hair',
  'cabello': 'hair',
  'Eyes': 'Eyes',
  'eyes': 'eyes',
  'Ojos': 'Eyes',
  'ojos': 'eyes',
  'Birth': 'Birth',
  'birth': 'birth',
  'Nacimiento': 'Birth',
  'nacimiento': 'birth',
  
  // Status and result terms
  'Success': 'Success',
  'success': 'success',
  'exitoso': 'successful',
  'éxito': 'success',
  'Error': 'Error',
  'error': 'error',
  'Error getting': 'Error getting',
  'error getting': 'error getting',
  'Error connecting': 'Error connecting',
  'error connecting': 'error connecting',
  'Error parsing': 'Error parsing',
  'error parsing': 'error parsing',
  'Server error': 'Server error',
  'server error': 'server error',
  'Connection error': 'Connection error',
  'connection error': 'connection error',
  'Authentication error': 'Authentication error',
  'authentication error': 'authentication error',
  
  // Navigation terms
  'More pages available': 'More pages available',
  'more pages available': 'more pages available',
  '¿Hay más páginas?': 'More pages?',
  'hay más páginas': 'more pages available',
  'Sí': 'Yes',
  'sí': 'yes',
  'No': 'No',
  'no': 'no',
  
  // Notes and information
  'Nota': 'Note',
  'nota': 'note',
  'Información': 'Information',
  'información': 'information',
  'Próximos pasos': 'Next steps',
  'próximos pasos': 'next steps',
  'Posibles causas': 'Possible causes',
  'posibles causas': 'possible causes',
  'Basado en la información obtenida': 'Based on the information obtained',
  'basado en la información obtenida': 'based on the information obtained',
  
  // Technical configuration terms
  'backend': 'backend',
  'servidor': 'server',
  'servicio': 'service',
  'endpoint': 'endpoint',
  'API esté configurada incorrectamente': 'API is configured incorrectly',
  'backend service URL está mal configurado': 'backend service URL is misconfigured',
  'políticas de rewrite': 'rewrite policies',
  'configuration adicional': 'additional configuration',
  'endpoints estén mapeados correctamente': 'endpoints are mapped correctly',
  
  // Common verbs and actions
  'Usar': 'Use',
  'usar': 'use',
  'Mostrar': 'Show',
  'mostrar': 'show',
  'Verificar': 'Verify',
  'verificar': 'verify',
  'Comprobar': 'Check',
  'comprobar': 'check',
  'Configurar': 'Configure',
  'configurar': 'configure',
  'Asegurar': 'Ensure',
  'asegurar': 'ensure',
  'Intentando': 'Trying',
  'intentando': 'trying',
  'método alternativo': 'alternative method',
  'Método alternativo': 'Alternative method'
};

// Get all JavaScript files in the current directory
function getAllJavaScriptFiles() {
  const files = fs.readdirSync(__dirname);
  return files.filter(file => 
    file.endsWith('.js') && 
    !file.includes('.backup') && 
    file !== 'translate-repository.js' && 
    file !== 'fix-translations.js' && 
    file !== 'final-translation.js'
  );
}

function applyFinalTranslations(content) {
  let translatedContent = content;
  
  // Apply all translations
  Object.entries(finalTranslations).forEach(([spanish, english]) => {
    // Use word boundaries for exact matches
    const regex = new RegExp(`\\b${spanish.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    translatedContent = translatedContent.replace(regex, english);
  });
  
  return translatedContent;
}

async function translateAllFiles() {
  try {
    console.log('🔍 Finding all JavaScript files...');
    const files = getAllJavaScriptFiles();
    
    console.log(`📁 Found ${files.length} JavaScript files to process`);
    
    let processedCount = 0;
    let modifiedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(__dirname, file);
      
      try {
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const translatedContent = applyFinalTranslations(originalContent);
        
        if (originalContent !== translatedContent) {
          fs.writeFileSync(filePath, translatedContent, 'utf8');
          console.log(`✅ Translated: ${file}`);
          modifiedCount++;
        } else {
          console.log(`📄 No changes needed: ${file}`);
        }
        
        processedCount++;
        
      } catch (error) {
        console.log(`❌ Error processing ${file}:`, error.message);
      }
    }
    
    console.log('\n🎉 Final translation completed!');
    console.log(`📊 Summary:`);
    console.log(`   - ${processedCount} files processed`);
    console.log(`   - ${modifiedCount} files modified`);
    console.log(`   - All Spanish text should now be in English`);
    
  } catch (error) {
    console.error('❌ Error during translation:', error.message);
  }
}

translateAllFiles();