/**
 * Simple script to check SonarQube issues
 */

import http from 'http';

const SONAR_URL = 'localhost';
const SONAR_PORT = 9000;
const PROJECT_KEY = 'azure-apim-mcp-server';

function getSonarIssues() {
    return new Promise((resolve, reject) => {
        const path = `/api/issues/search?componentKeys=${PROJECT_KEY}&types=CODE_SMELL,BUG,VULNERABILITY&statuses=OPEN,CONFIRMED&ps=500`;
        
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
                    console.log(`📊 Found ${result.total} total issues`);
                    
                    if (result.issues) {
                        result.issues.forEach((issue, index) => {
                            console.log(`\n${index + 1}. Issue: ${issue.rule}`);
                            console.log(`   Type: ${issue.type}`);
                            console.log(`   Severity: ${issue.severity}`);
                            console.log(`   File: ${issue.component}`);
                            console.log(`   Line: ${issue.line || 'N/A'}`);
                            console.log(`   Message: ${issue.message}`);
                        });
                    }
                    
                    resolve(result.issues || []);
                } catch (error) {
                    console.error('❌ Error parsing SonarQube response:', error);
                    console.log('Raw response:', data);
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Error making request to SonarQube:', error);
            reject(error);
        });
        
        req.end();
    });
}

// Execute
console.log('🔍 Checking SonarQube issues...');
getSonarIssues()
    .then(issues => {
        console.log(`\n✅ Analysis complete. Found ${issues.length} issues.`);
    })
    .catch(error => {
        console.error('❌ Failed to get issues:', error);
        process.exit(1);
    });