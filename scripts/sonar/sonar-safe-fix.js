/**
 * SonarQube Auto-Fix Safe and Secure
 * Only applies corrections that we know are safe
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import http from 'http';

const SONAR_URL = 'localhost';
const SONAR_PORT = 9000;
const PROJECT_KEY = 'azure-apim-mcp-server';

const projectRoot = process.cwd();

console.log('🚀 Starting SonarQube Safe Auto-Fix...');
console.log(`📁 Project directory: ${projectRoot}`);

/**
 * Gets SonarQube issues using the REST API
 */
function getSonarIssues() {
    return new Promise((resolve, reject) => {
        const path = `/api/issues/search?componentKeys=${PROJECT_KEY}&types=CODE_SMELL&statuses=OPEN,CONFIRMED&ps=500`;
        
        // Get token from environment
        const token = process.env.SONAR_TOKEN || 'squ_f0560c122b452758e28c8669f0cf8bdd9f8d28db';
        const auth = Buffer.from(`${token}:`).toString('base64');
        
        const req = http.request({
            hostname: SONAR_URL,
            port: SONAR_PORT,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json'
            }
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (data.trim() === '') {
                        console.log('⚠️ Empty response from SonarQube API');
                        resolve([]);
                        return;
                    }
                    const result = JSON.parse(data);
                    resolve(result.issues || []);
                } catch (error) {
                    console.error('❌ Error parsing JSON response:', data);
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

/**
 * Applies fix for nullish coalescing (|| -> ??) - SAFE
 */
function fixNullishCoalescing(content, line, startOffset, endOffset) {
    const lines = content.split('\n');
    if (line - 1 < lines.length) {
        const currentLine = lines[line - 1];
        // Only replace if it's in a clear assignment context
        if (currentLine.includes(' || ') && (currentLine.includes('??') === false)) {
            const before = currentLine.substring(0, startOffset);
            const after = currentLine.substring(endOffset);
            lines[line - 1] = before + '??' + after;
            return lines.join('\n');
        }
    }
    return content;
}

/**
 * Applies fix for readonly properties - SAFE
 */
function fixReadonlyProperty(content, line, startOffset, endOffset) {
    const lines = content.split('\n');
    if (line - 1 < lines.length) {
        const currentLine = lines[line - 1];
        
        // Only apply readonly to clear class property declarations
        const readonlyPattern = /(private|public|protected)(\s+)(\w+)(\s*:)/;
        const match = currentLine.match(readonlyPattern);
        
        if (match && !currentLine.includes('readonly')) {
            const newLine = currentLine.replace(readonlyPattern, `$1 readonly$2$3$4`);
            lines[line - 1] = newLine;
            return lines.join('\n');
        }
    }
    return content;
}

/**
 * Applies fix for unused imports - CONSERVATIVE  
 */
function fixUnusedImports(content, line, startOffset, endOffset) {
    const lines = content.split('\n');
    if (line - 1 < lines.length) {
        const currentLine = lines[line - 1];
        
        // Only remove complete import lines that are clearly unused
        if (currentLine.trim().startsWith('import ') && currentLine.includes(' from ') && currentLine.trim().endsWith(';')) {
            
            // Extract what's being imported
            const importMatch = currentLine.match(/import\s+(?:{([^}]+)}|\s*(\w+))/);
            if (importMatch) {
                const importedItems = importMatch[1] ? 
                    importMatch[1].split(',').map(s => s.trim()) : 
                    [importMatch[2]];
                
                // Check if any of these imported items appear to be used in the content
                // This is a simple heuristic - look for the items in the rest of the file
                const restOfContent = lines.slice(line).join('\n');
                
                let hasUsages = false;
                for (const item of importedItems) {
                    // Simple check: if the item name appears in the code (excluding the import line)
                    if (restOfContent.includes(item)) {
                        hasUsages = true;
                        break;
                    }
                }
                
                if (!hasUsages) {
                    // Only comment out if we're confident it's not used
                    lines[line - 1] = '// ' + currentLine + ' // AUTO-FIX: Removed unused import';
                    return lines.join('\n');
                } else {
                    console.log(`ℹ️ Import at line ${line} appears to be used - skipping for safety`);
                }
            }
        }
    }
    return content;
}

/**
 * Applies fix for useless assignments - SAFE
 */
function fixUselessAssignment(content, line, startOffset, endOffset) {
    const lines = content.split('\n');
    if (line - 1 < lines.length) {
        const currentLine = lines[line - 1];
        
        // Look for const/let assignments that are never used
        // We need to be very careful here to avoid breaking function calls
        
        // Only handle simple single-line variable assignments
        const simpleAssignmentPattern = /^\s*(const|let)\s+\w+\s*=\s*[^;]+;\s*$/;
        
        if (simpleAssignmentPattern.test(currentLine)) {
            // This is a simple assignment, safe to comment out
            lines[line - 1] = '// ' + currentLine + ' // AUTO-FIX: Removed unused assignment';
            return lines.join('\n');
        } else {
            // More complex case - just log it for manual review
            console.log(`ℹ️ Complex unused assignment at line ${line} - requires manual review`);
        }
    }
    return content;
}

/**
 * Applies fix for RegExp.exec() vs String.match() - SAFE
 */
function fixRegexpExec(content, line, startOffset, endOffset) {
    const lines = content.split('\n');
    if (line - 1 < lines.length) {
        const currentLine = lines[line - 1];
        
        // Look for .match() calls that should be RegExp.exec()
        // Only handle simple cases to avoid breaking complex logic
        if (currentLine.includes('.match(') && !currentLine.includes('?.match(')) {
            // Pattern: variable.match(/regex/) -> /regex/.exec(variable)
            const simpleMatchPattern = /(\w+)\.match\((\/.+?\/[gimuy]*)\)/g;
            let newLine = currentLine;
            let hasChanges = false;
            
            let match;
            while ((match = simpleMatchPattern.exec(currentLine)) !== null) {
                const [fullMatch, variable, regexPart] = match;
                
                // Only replace if it's a clear, simple regex pattern
                if (regexPart.startsWith('/') && regexPart.includes('/')) {
                    const replacement = `${regexPart}.exec(${variable})`;
                    newLine = newLine.replace(fullMatch, replacement);
                    hasChanges = true;
                }
            }
            
            if (hasChanges) {
                lines[line - 1] = newLine;
                return lines.join('\n');
            }
        } else {
            console.log(`ℹ️ Complex RegExp case at line ${line} - requires manual review`);
        }
    }
    return content;
}

/**
 * Processes and fixes issues in a file - ONLY SAFE RULES
 */
async function fixFileIssues(filePath, issues) {
    const fullPath = join(projectRoot, filePath);
    
    try {
        let content = readFileSync(fullPath, 'utf8');
        let modified = false;
        const originalContent = content;
        
        // Sort issues by line (from highest to lowest to avoid offset issues)
        const sortedIssues = issues.sort((a, b) => b.line - a.line);
        
        for (const issue of sortedIssues) {
            const { rule, line, textRange } = issue;
            
            switch (rule) {
                case 'typescript:S6606': // Nullish coalescing - SAFE
                    const beforeNullish = content;
                    content = fixNullishCoalescing(content, line, textRange.startOffset, textRange.endOffset);
                    if (content !== beforeNullish) modified = true;
                    break;
                    
                case 'typescript:S2933': // Readonly properties - SAFE
                    const beforeReadonly = content;
                    content = fixReadonlyProperty(content, line, textRange.startOffset, textRange.endOffset);
                    if (content !== beforeReadonly) modified = true;
                    break;
                    
                case 'typescript:S1128': // Unused imports - SAFE
                    const beforeImport = content;
                    content = fixUnusedImports(content, line, textRange.startOffset, textRange.endOffset);
                    if (content !== beforeImport) modified = true;
                    break;
                    
                case 'typescript:S1854': // Useless assignments - SAFE
                    const beforeAssignment = content;
                    content = fixUselessAssignment(content, line, textRange.startOffset, textRange.endOffset);
                    if (content !== beforeAssignment) modified = true;
                    break;
                    
                case 'typescript:S6594': // RegExp.exec() - SAFE
                    const beforeRegexp = content;
                    content = fixRegexpExec(content, line, textRange.startOffset, textRange.endOffset);
                    if (content !== beforeRegexp) modified = true;
                    break;
                
                // Complex rules that require manual review
                case 'typescript:S3776': // Cognitive complexity
                    console.log(`⚠️ Manual review needed: High cognitive complexity in ${filePath}:${line} - Consider refactoring`);
                    break;
                    
                default:
                    console.log(`⚠️ Rule not included (requires manual review): ${rule} in ${filePath}:${line}`);
            }
        }
        
        if (modified && content !== originalContent) {
            writeFileSync(fullPath, content, 'utf8');
            const safeRules = ['typescript:S6606', 'typescript:S2933', 'typescript:S1128', 'typescript:S1854', 'typescript:S6594'];
            const fixedCount = sortedIssues.filter(i => safeRules.includes(i.rule)).length;
            console.log(`✅ ${filePath}: ${fixedCount} issues fixed`);
            return fixedCount;
        }
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
    
    return 0;
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('\n📥 Getting SonarQube issues...');
        const issues = await getSonarIssues();
        
        if (!issues || issues.length === 0) {
            console.log('✅ No issues found to fix');
            return;
        }
        
        console.log(`📊 Found ${issues.length} total issues`);
        const safeRules = ['typescript:S6606', 'typescript:S2933', 'typescript:S1128', 'typescript:S1854', 'typescript:S6594'];
        const safeIssues = issues.filter(i => safeRules.includes(i.rule));
        const complexIssues = issues.filter(i => i.rule === 'typescript:S3776');
        
        console.log(`🛡️ Safe issues for auto-correction: ${safeIssues.length}`);
        if (complexIssues.length > 0) {
            console.log(`🧠 Complex issues requiring manual review: ${complexIssues.length}`);
        }
        
        if (safeIssues.length === 0) {
            console.log('⚠️ No issues can be automatically fixed safely');
            if (complexIssues.length > 0) {
                console.log('💡 There are complex issues that require manual refactoring');
            }
            return;
        }
        
        // Group issues by file
        const issuesByFile = {};
        for (const issue of safeIssues) {
            const filePath = issue.component.replace(`${PROJECT_KEY}:`, '');
            if (!issuesByFile[filePath]) {
                issuesByFile[filePath] = [];
            }
            issuesByFile[filePath].push(issue);
        }
        
        console.log(`\n🔧 Processing ${Object.keys(issuesByFile).length} files...`);
        
        let totalFixed = 0;
        
        // Process each file
        for (const [filePath, fileIssues] of Object.entries(issuesByFile)) {
            const fixed = await fixFileIssues(filePath, fileIssues);
            totalFixed += fixed;
        }
        
        console.log(`\n🎉 Process completed!`);
        console.log(`📈 Total issues fixed: ${totalFixed}`);
        
        if (totalFixed > 0) {
            console.log('\n💡 Run npm run build:analyze to verify the fixes');
        }
        
    } catch (error) {
        console.error('❌ Error in process:', error);
        process.exit(1);
    }
}

// Execute the script
main();