#!/usr/bin/env node

/**
 * Script to group and analyze APIM APIs by business domain
 * Connects with Azure CLI to get data and organizes them by categories
 */

import { spawn } from 'child_process';
import fs from 'fs';

console.log('🔍 Azure APIM APIs Analysis by Business Domains');
console.log('===============================================\n');

// Function to execute Azure CLI commands
function runAzureCommand(command) {
    return new Promise((resolve, reject) => {
        const process = spawn('az', command.split(' ').slice(1), { shell: true });
        let output = '';
        let error = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            error += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(error));
            }
        });
    });
}

// Function to categorize APIs by business domain
function categorizeApisByDomain(apis) {
    const domains = {
        '🤖 Artificial Intelligence & Chatbots': [],
        '📊 Business Intelligence & Analytics': [],
        '🏪 Store Management & Retail': [],
        '🔗 Salesforce Integration': [],
        '💰 SAP & Financial Systems': [],
        '🧾 Documents & VIS2SAP': [],
        '⚙️ Infrastructure & Configuration': [],
        '🎯 Customer Experience & Clienteling': [],
        '🎁 Loyalty & Vouchers': [],
        '🔄 Data Processing (Kafka)': [],
        '📄 Demo & Testing APIs': [],
        '🔧 System APIs': []
    };

    apis.forEach(api => {
        const path = api.Path || '';
        const name = api.Name || '';
        const displayName = api.DisplayName || '';
        const description = api.Description || '';
        
        // Categorization logic based on path and name
        if (path.includes('chatbot') || path.includes('ai') || name.includes('gpt') || description.toLowerCase().includes('bot')) {
            domains['🤖 Artificial Intelligence & Chatbots'].push(api);
        } else if (path.includes('power-bi') || path.includes('dax-query') || path.includes('cosmos')) {
            domains['📊 Business Intelligence & Analytics'].push(api);
        } else if (path.includes('location-store') || path.includes('shop-floor') || path.includes('itek') || path.includes('retail') || path.includes('tpv6')) {
            domains['🏪 Store Management & Retail'].push(api);
        } else if (path.includes('salesforce') || name.includes('salesforce')) {
            domains['🔗 Salesforce Integration'].push(api);
        } else if (path.includes('sap') || path.includes('blackline') || path.includes('payroll')) {
            domains['💰 SAP & Financial Systems'].push(api);
        } else if (path.includes('vis') || path.includes('documents')) {
            domains['🧾 Documents & VIS2SAP'].push(api);
        } else if (path.includes('kafka') || path.includes('configuration')) {
            domains['⚙️ Infrastructure & Configuration'].push(api);
        } else if (path.includes('clienteling') || path.includes('copilot')) {
            domains['🎯 Customer Experience & Clienteling'].push(api);
        } else if (path.includes('loyalty') || path.includes('voucher')) {
            domains['🎁 Loyalty & Vouchers'].push(api);
        } else if (path.includes('pubsub') || name.includes('kafka')) {
            domains['🔄 Data Processing (Kafka)'].push(api);
        } else if (name.includes('petstore') || name.includes('swagger') || displayName.includes('Pet')) {
            domains['📄 Demo & Testing APIs'].push(api);
        } else {
            domains['🔧 System APIs'].push(api);
        }
    });

    return domains;
}

// Function to generate statistics
function generateStatistics(domains) {
    const stats = {
        totalApis: 0,
        currentApis: 0,
        domainCounts: {},
        architectureLayers: {
            external: 0,
            internal: 0,
            system: 0,
            process: 0,
            experience: 0
        }
    };

    Object.keys(domains).forEach(domain => {
        const apis = domains[domain];
        stats.domainCounts[domain] = apis.length;
        stats.totalApis += apis.length;

        apis.forEach(api => {
            if (api.IsCurrent === 'True') {
                stats.currentApis++;
            }

            const path = api.Path || '';
            if (path.includes('external')) stats.architectureLayers.external++;
            else if (path.includes('internal/system')) stats.architectureLayers.system++;
            else if (path.includes('internal/process')) stats.architectureLayers.process++;
            else if (path.includes('experience') || path.includes('exp')) stats.architectureLayers.experience++;
            else if (path.includes('internal')) stats.architectureLayers.internal++;
        });
    });

    return stats;
}

// Main function
async function main() {
    try {
        console.log('📡 Connecting to Azure CLI...');
        
        // Get APIs using Azure CLI
        const command = 'az apim api list --resource-group rg-duf-weu-infra-gapim-dev --service-name apim-duf-weu-infra-gapim-dev-001 --output json';
        const rawOutput = await runAzureCommand(command);
        const apis = JSON.parse(rawOutput);
        
        console.log(`✅ Found ${apis.length} APIs\n`);
        
        // Categorize APIs by domain
        const domains = categorizeApisByDomain(apis);
        
        // Generate statistics
        const stats = generateStatistics(domains);
        
        // Display results by domain
        console.log('📋 APIS GROUPED BY BUSINESS DOMAIN');
        console.log('==================================\n');
        
        Object.keys(domains).forEach(domain => {
            const domainApis = domains[domain];
            if (domainApis.length > 0) {
                console.log(`${domain} (${domainApis.length} APIs)`);
                console.log('─'.repeat(60));
                
                domainApis.forEach(api => {
                    const current = api.IsCurrent === 'True' ? '🟢' : '🔴';
                    const revision = api.ApiRevision || '1';
                    console.log(`  ${current} ${api.DisplayName || api.Name}`);
                    console.log(`     📍 Path: ${api.Path}`);
                    console.log(`     🔄 Revision: ${revision} ${api.IsCurrent === 'True' ? '(CURRENT)' : ''}`);
                    if (api.Description && api.Description.trim()) {
                        const desc = api.Description.length > 80 
                            ? api.Description.substring(0, 80) + '...' 
                            : api.Description;
                        console.log(`     📝 ${desc}`);
                    }
                    console.log('');
                });
            }
        });
        
        // Display final statistics
        console.log('\n📊 GENERAL STATISTICS');
        console.log('====================');
        console.log(`📈 Total APIs: ${stats.totalApis}`);
        console.log(`✅ Current APIs: ${stats.currentApis}`);
        console.log(`🔄 APIs with revisions: ${stats.totalApis - stats.currentApis}\n`);
        
        console.log('🏗️ DISTRIBUTION BY ARCHITECTURAL LAYER');
        console.log('======================================');
        console.log(`🌐 External (Experience): ${stats.architectureLayers.external}`);
        console.log(`⚙️ Internal (System): ${stats.architectureLayers.system}`);
        console.log(`🔄 Internal (Process): ${stats.architectureLayers.process}`);
        console.log(`🎯 Experience: ${stats.architectureLayers.experience}`);
        console.log(`🔧 Other Internal: ${stats.architectureLayers.internal}\n`);
        
        console.log('📊 TOP 5 DOMAINS WITH MOST APIs');
        console.log('===============================');
        const sortedDomains = Object.entries(stats.domainCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
            
        sortedDomains.forEach(([domain, count], index) => {
            console.log(`${index + 1}. ${domain}: ${count} APIs`);
        });
        
        // Save report to file
        const report = {
            timestamp: new Date().toISOString(),
            summary: stats,
            domains: domains
        };
        
        fs.writeFileSync('apim-apis-analysis-report.json', JSON.stringify(report, null, 2));
        console.log('\n💾 Report saved to: apim-apis-analysis-report.json');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Execute only if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}