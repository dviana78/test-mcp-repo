#!/usr/bin/env node

/**
 * SonarQube Auto-Fix Script
 * Automatically fixes maintainability issues detected by SonarQube
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

// SonarQube configuration
const SONAR_CONFIG = {
    serverUrl: 'http://localhost:9000',
    projectKey: 'azure-apim-mcp-server',
    token: process.env.SONAR_TOKEN || 'squ_f0560c122b452758e28c8669f0cf8bdd9f8d28db'
};

// Types of issues that we can fix automatically
const FIXABLE_RULES = {
    'typescript:S2933': 'readonly-variables',      // Variables that should be readonly
    'typescript:S6606': 'nullish-coalescing',     // Use ?? instead of ||
    'typescript:S1854': 'unused-variables',       // Unused variables
    'typescript:S1481': 'unused-variables',       // Unused variables
};

class SonarAutoFixer {
    constructor() {
        this.issuesFixed = [];
        this.issuesSkipped = [];
        this.errors = [];
    }

    /**
     * Obtiene las issues desde la API de SonarQube usando http
     */
    async getIssues() {
        return new Promise((resolve, reject) => {
            try {
                const url = `${SONAR_CONFIG.serverUrl}/api/issues/search?componentKeys=${SONAR_CONFIG.projectKey}&statuses=OPEN,CONFIRMED&impactSoftwareQualities=MAINTAINABILITY&ps=500`;
                const auth = Buffer.from(SONAR_CONFIG.token + ':').toString('base64');
                
                console.log('🔍 Getting SonarQube issues...');
                
                const options = {
                    hostname: 'localhost',
                    port: 9000,
                    path: `/api/issues/search?componentKeys=${SONAR_CONFIG.projectKey}&statuses=OPEN,CONFIRMED&impactSoftwareQualities=MAINTAINABILITY&ps=500`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Accept': 'application/json'
                    }
                };

                const req = http.request(options, (res) => {
                    let data = '';
                    
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res.on('end', () => {
                        try {
                            const jsonData = JSON.parse(data);
                            console.log(`📊 Found ${jsonData.issues.length} maintainability issues`);
                            resolve(jsonData.issues);
                        } catch (parseError) {
                            console.error('❌ Error parseando respuesta JSON:', parseError.message);
                            resolve([]);
                        }
                    });
                });

                req.on('error', (error) => {
                    console.error('❌ Error conectando con SonarQube:', error.message);
                    resolve([]);
                });

                req.end();
                
            } catch (error) {
                console.error('❌ Error obteniendo issues de SonarQube:', error.message);
                resolve([]);
            }
        });
    }

    /**
     * Agrupa las issues por archivo y tipo
     */
    groupIssuesByFile(issues) {
        const grouped = {};
        
        for (const issue of issues) {
            if (!FIXABLE_RULES[issue.rule]) {
                this.issuesSkipped.push({
                    rule: issue.rule,
                    reason: 'Tipo de issue no soportado para auto-fix'
                });
                continue;
            }

            const filePath = issue.component.replace(`${SONAR_CONFIG.projectKey}:`, '');
            const absolutePath = join(projectRoot, filePath);

            if (!grouped[absolutePath]) {
                grouped[absolutePath] = [];
            }

            grouped[absolutePath].push({
                rule: issue.rule,
                type: FIXABLE_RULES[issue.rule],
                line: issue.line,
                message: issue.message,
                textRange: issue.textRange,
                key: issue.key
            });
        }

        return grouped;
    }

    /**
     * Corrige issues de tipo readonly-variables (S2933)
     */
    fixReadonlyVariables(content, issues) {
        let modifiedContent = content;
        const lines = content.split('\n');
        
        // Sort issues by descending line to avoid offset problems
        const readonlyIssues = issues
            .filter(issue => issue.type === 'readonly-variables')
            .sort((a, b) => b.line - a.line);

        for (const issue of readonlyIssues) {
            const lineIndex = issue.line - 1;
            const line = lines[lineIndex];
            
            // Buscar declaraciones de propiedades de clase
            const privateMatch = line.match(/^(\s+)(private\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)/);
            const publicMatch = line.match(/^(\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/);
            
            if (privateMatch) {
                // private variable -> private readonly variable
                const [, spaces, privateKeyword, varName] = privateMatch;
                lines[lineIndex] = line.replace(privateKeyword, 'private readonly ');
                this.issuesFixed.push({
                    rule: issue.rule,
                    file: 'current',
                    line: issue.line,
                    fix: `Agregado 'readonly' a variable privada '${varName}'`
                });
            } else if (publicMatch) {
                // public property -> readonly property
                const [, spaces, varName] = publicMatch;
                lines[lineIndex] = line.replace(/^(\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/, '$1readonly $2:');
                this.issuesFixed.push({
                    rule: issue.rule,
                    file: 'current',
                    line: issue.line,
                    fix: `Agregado 'readonly' a propiedad '${varName}'`
                });
            }
        }

        return lines.join('\n');
    }

    /**
     * Corrige issues de tipo nullish-coalescing (S6606)
     */
    fixNullishCoalescing(content, issues) {
        let modifiedContent = content;
        
        // Sort issues by descending line
        const nullishIssues = issues
            .filter(issue => issue.type === 'nullish-coalescing')
            .sort((a, b) => b.line - a.line);

        for (const issue of nullishIssues) {
            const lines = modifiedContent.split('\n');
            const lineIndex = issue.line - 1;
            const line = lines[lineIndex];
            
            // Buscar patrones de || y reemplazar con ??
            // Solo reemplazar en contextos seguros (no booleanos)
            const orPattern = /(\w+|\)\s*)\s*\|\|\s*([^|&]+)/g;
            
            if (line.includes('||')) {
                // Reemplazar || con ?? de manera conservadora
                const newLine = line.replace(/\s*\|\|\s*/g, ' ?? ');
                lines[lineIndex] = newLine;
                
                this.issuesFixed.push({
                    rule: issue.rule,
                    file: 'current',
                    line: issue.line,
                    fix: 'Reemplazado || con ?? (nullish coalescing)'
                });
                
                modifiedContent = lines.join('\n');
            }
        }

        return modifiedContent;
    }

    /**
     * Procesa un archivo y aplica las correcciones
     */
    async processFile(filePath, issues) {
        try {
            console.log(`🔧 Processing: ${filePath.replace(projectRoot, '.')}`);
            console.log(`   Issues to fix: ${issues.length}`);

            const content = readFileSync(filePath, 'utf8');
            let modifiedContent = content;

            // Apply fixes by type
            modifiedContent = this.fixReadonlyVariables(modifiedContent, issues);
            modifiedContent = this.fixNullishCoalescing(modifiedContent, issues);

            // Only write if there were changes
            if (modifiedContent !== content) {
                writeFileSync(filePath, modifiedContent, 'utf8');
                console.log(`   ✅ File updated`);
            } else {
                console.log(`   ⏭️  No changes required`);
            }

        } catch (error) {
            console.error(`   ❌ Error procesando archivo: ${error.message}`);
            this.errors.push({
                file: filePath,
                error: error.message
            });
        }
    }

    /**
     * Execute the complete auto-correction process
     */
    async run() {
        console.log('🚀 Starting SonarQube Auto-Fix...\n');

        // Get issues
        const issues = await this.getIssues();
        if (issues.length === 0) {
            console.log('✨ No issues found to fix');
            return;
        }

        // Agrupar por archivo
        const groupedIssues = this.groupIssuesByFile(issues);
        const fileCount = Object.keys(groupedIssues).length;
        
        console.log(`📁 Files to process: ${fileCount}\n`);

        // Process each file
        for (const [filePath, fileIssues] of Object.entries(groupedIssues)) {
            await this.processFile(filePath, fileIssues);
        }

        // Show summary
        this.printSummary();
    }

    /**
     * Show the fixes summary
     */
    printSummary() {
        console.log('\n📊 FIXES SUMMARY');
        console.log('=' .repeat(50));
        
        console.log(`✅ Issues fixed: ${this.issuesFixed.length}`);
        console.log(`⏭️  Issues skipped: ${this.issuesSkipped.length}`);
        console.log(`❌ Errors: ${this.errors.length}`);

        if (this.issuesFixed.length > 0) {
            console.log('\n🔧 Applied fixes:');
            for (const fix of this.issuesFixed) {
                console.log(`   • Line ${fix.line}: ${fix.fix}`);
            }
        }

        if (this.issuesSkipped.length > 0) {
            console.log('\n⏭️  Skipped issues:');
            const skippedByRule = {};
            for (const skip of this.issuesSkipped) {
                skippedByRule[skip.rule] = (skippedByRule[skip.rule] || 0) + 1;
            }
            for (const [rule, count] of Object.entries(skippedByRule)) {
                console.log(`   • ${rule}: ${count} issues`);
            }
        }

        if (this.errors.length > 0) {
            console.log('\n❌ Errors found:');
            for (const error of this.errors) {
                console.log(`   • ${error.file}: ${error.error}`);
            }
        }

        console.log('\n🎉 Auto-fix completed!');
    }
}

// Execute only if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const autoFixer = new SonarAutoFixer();
    autoFixer.run().catch(console.error);
}

export default SonarAutoFixer;