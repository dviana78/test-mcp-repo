const fs = require('fs');
const path = require('path');

console.log('📁 Repository Organization Script');
console.log('================================');

// Define file organization structure
const fileOrganization = {
  'scripts/starwars': [
    'get-starwars-characters.js',
    'get-starwars-info.js',
    'get-starwars-operations.js',
    'get-all-starwars-characters.js',
    'analyze-starwars-genders.js',
    'create-starwars-subscription.js',
    'verify-starwars-api.js',
    'analyze-star-wars-api.js',
    'get-starwars-planets.js'
  ],
  'scripts/apim': [
    'apim-analyzer.js',
    'test-apim-apis.js',
    'test-apim-direct.js',
    'debug-apis.js',
    'simulate-apim-apis.js'
  ],
  'scripts/openmeteo': [
    'check-openmeteo-operations.js',
    'check-simple-openmeteo.js',
    'check-weather-openmeteo-v1.js',
    'compare-openmeteo-operations.js',
    'create-correct-openmeteo.js',
    'create-open-meteo-api.js',
    'create-openmeteo-final.js',
    'create-openmeteo-v2-fixed.js',
    'create-simple-openmeteo.js',
    'create-weather-openmeteo-correct.js',
    'create-weather-openmeteo-v1.js',
    'simple-open-meteo-test.js',
    'test-create-open-meteo.js',
    'verify-weather-apis.js'
  ],
  'scripts/grpc': [
    'check-grpc-apis.js',
    'quick-grpc-search.js',
    'search-grpc-simple.js',
    'simple-grpc-test.js',
    'test-grpc-api-creation.js'
  ],
  'scripts/test': [
    'test-list-apis.js',
    'test-server.js',
    'test-stdio-server.js',
    'test-swapi-direct.js',
    'test-versioned-api-creation.js',
    'test-create-api-yaml.js',
    'test-copilot-integration.js',
    'test-english-interface.js',
    'test-advanced-english.js',
    'test-all-paths.js',
    'check-backend-direct.js'
  ],
  'scripts/tools': [
    'list-tools.js',
    'list-tools-detailed.js',
    'configure-mcp.js',
    'petstore-details.js'
  ],
  'scripts/utils': [
    'translate-repository.js',
    'fix-translations.js',
    'final-translation.js',
    'debug-yaml-import.js',
    'create-version-v2.js'
  ]
};

// Files to keep in root
const keepInRoot = [
  'package.json',
  'tsconfig.json',
  'jest.config.js',
  'README.md',
  'mcp.json',
  'open-meteo.yaml',
  'todo.proto',
  'get-azure-credentials.sh',
  'organize-repository.js', // This script itself
  // Documentation files
  'FEATURES.md',
  'INTERNATIONALIZATION.md',
  'NEW_GRPC_TOOL_SUMMARY.md',
  'NEW_TOOL_SUMMARY.md',
  'PROJECT_COMPLETION_REPORT.md',
  'TOOLS_SUMMARY.md',
  'TRANSLATION_SUMMARY.md',
  'VERSIONED_API_SUMMARY.md',
  'VSCODE_MCP_SETUP.md'
];

function moveFile(fileName, targetDir) {
  const sourcePath = path.join(__dirname, fileName);
  const targetPath = path.join(__dirname, targetDir, fileName);
  
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  File not found: ${fileName}`);
    return false;
  }
  
  try {
    // Create target directory if it doesn't exist
    const targetDirPath = path.join(__dirname, targetDir);
    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
    }
    
    // Move the file
    fs.renameSync(sourcePath, targetPath);
    console.log(`✅ Moved: ${fileName} → ${targetDir}/`);
    return true;
  } catch (error) {
    console.log(`❌ Error moving ${fileName}:`, error.message);
    return false;
  }
}

function organizeFiles() {
  let movedCount = 0;
  let totalFiles = 0;
  
  console.log('🚀 Starting file organization...\n');
  
  // Organize files by category
  Object.entries(fileOrganization).forEach(([targetDir, files]) => {
    console.log(`📂 Organizing ${targetDir}:`);
    
    files.forEach(fileName => {
      totalFiles++;
      if (moveFile(fileName, targetDir)) {
        movedCount++;
      }
    });
    
    console.log(''); // Empty line for readability
  });
  
  // Move backup files
  console.log('🗂️  Moving backup files:');
  const allFiles = fs.readdirSync(__dirname);
  const backupFiles = allFiles.filter(file => file.endsWith('.backup'));
  
  if (backupFiles.length > 0) {
    const backupDir = 'scripts/utils/backups';
    const backupDirPath = path.join(__dirname, backupDir);
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }
    
    backupFiles.forEach(fileName => {
      totalFiles++;
      if (moveFile(fileName, backupDir)) {
        movedCount++;
      }
    });
  } else {
    console.log('📄 No backup files found');
  }
  
  console.log('\n📊 Organization Summary:');
  console.log('========================');
  console.log(`📁 Files processed: ${totalFiles}`);
  console.log(`✅ Files moved: ${movedCount}`);
  console.log(`📄 Files kept in root: ${keepInRoot.length}`);
  
  console.log('\n📂 New Directory Structure:');
  console.log('===========================');
  console.log('📁 scripts/');
  console.log('  ├── 🌟 starwars/     - Star Wars API scripts');
  console.log('  ├── ☁️  apim/        - Azure APIM related scripts');
  console.log('  ├── 🌤️  openmeteo/   - OpenMeteo weather API scripts');
  console.log('  ├── 🔧 grpc/        - gRPC related scripts');
  console.log('  ├── 🧪 test/        - Testing and verification scripts');
  console.log('  ├── 🛠️  tools/       - MCP tools and utilities');
  console.log('  └── 🔧 utils/       - Translation and utility scripts');
  console.log('     └── 💾 backups/  - Backup files');
  
  console.log('\n💡 Next Steps:');
  console.log('==============');
  console.log('1. Update any import paths in your code if needed');
  console.log('2. Update documentation references to new file paths');
  console.log('3. Consider adding a package.json script for easy access');
  console.log('4. Run git add . && git commit -m "Organize repository structure"');
}

// Check if we're running this script
if (require.main === module) {
  organizeFiles();
}

module.exports = { organizeFiles, fileOrganization };

console.log('\n🎉 Repository organization completed!');