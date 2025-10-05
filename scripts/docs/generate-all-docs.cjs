const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting complete documentation generation...\n');

try {
    // 1. Generate TypeDoc documentation
    console.log('📚 Generating TypeDoc documentation...');
    execSync('npm run docs:typedoc', { stdio: 'inherit' });
    console.log('✅ TypeDoc documentation generated\n');

    // 2. Run project analysis
    console.log('📊 Running project analysis...');
    execSync('node scripts/docs/analyze-project.cjs', { stdio: 'inherit' });
    console.log('✅ Project analysis completed\n');

    // 3. Verify all documentation files exist
    console.log('🔍 Verifying documentation files...');
    const requiredFiles = [
        './docs/index.html',
        './docs/analysis.html',
        './docs/typedoc/README.html',
        './typedoc.json',
        './DOCUMENTATION_SYSTEM.md'
    ];

    let allFilesExist = true;
    for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
            console.log(`  ✅ ${file}`);
        } else {
            console.log(`  ❌ ${file} - MISSING`);
            allFilesExist = false;
        }
    }

    console.log('');

    if (allFilesExist) {
        console.log('🎉 Documentation generation completed successfully!');
        console.log('');
        console.log('📍 Access your documentation:');
        console.log('  🌐 Start local server: npm run docs:serve');
        console.log('  📚 Documentation Hub: http://localhost:8080');
        console.log('  📊 Project Analysis: http://localhost:8080/analysis.html');
        console.log('  🔧 TypeDoc API: http://localhost:8080/typedoc/README.html');
        console.log('');
        console.log('📁 Direct file access:');
        console.log('  📚 Hub: ./docs/index.html');
        console.log('  📊 Analysis: ./docs/analysis.html');
        console.log('  📄 System Docs: ./DOCUMENTATION_SYSTEM.md');
    } else {
        console.log('⚠️  Some documentation files are missing. Please check the errors above.');
        process.exit(1);
    }

} catch (error) {
    console.error('❌ Error during documentation generation:');
    console.error(error.message);
    process.exit(1);
}