#!/usr/bin/env node

/**
 * Script to list API names organized by business domain and architectural layers
 * Shows only the API names as they appear in the console output
 */

import { execSync } from 'child_process';

try {
    // Execute Azure CLI command and get JSON output
    const command = 'az apim api list --resource-group rg-duf-weu-infra-gapim-dev --service-name apim-duf-weu-infra-gapim-dev-001 --output json';
    const output = execSync(command, { encoding: 'utf8' });
    const apis = JSON.parse(output);
    
    // Initialize domain categories
    const domains = {
        '🤖 Artificial Intelligence & Chatbots': {
            experience: [],
            process: [],
            system: [],
            other: []
        },
        '📊 Business Intelligence & Analytics': {
            experience: [],
            process: [],
            system: [],
            other: []
        },
        '🏪 Store Management & Retail': {
            experience: [],
            process: [],
            system: [],
            other: []
        },
        '🔗 Salesforce Integration': {
            experience: [],
            process: [],
            system: [],
            other: []
        },
        '💰 SAP & Financial Systems': {
            experience: [],
            process: [],
            system: [],
            other: []
        },
        '🧾 Documents & VIS2SAP': {
            experience: [],
            process: [],
            system: [],
            other: []
        },
        '⚙️ Infrastructure & Configuration': {
            experience: [],
            process: [],
            system: [],
            other: []
        },
        '🎯 Customer Experience & Clienteling': {
            experience: [],
            process: [],
            system: [],
            other: []
        },
        '🎁 Loyalty & Vouchers': {
            experience: [],
            process: [],
            system: [],
            other: []
        },
        '🔄 Data Processing (Kafka)': {
            experience: [],
            process: [],
            system: [],
            other: []
        },
        '📄 Demo & Testing APIs': {
            experience: [],
            process: [],
            system: [],
            other: []
        },
        '🔧 System APIs': {
            experience: [],
            process: [],
            system: [],
            other: []
        }
    };
    
    // Function to determine architectural layer
    function getArchitecturalLayer(path) {
        if (path.includes('external') || path.includes('experience') || path.includes('exp')) {
            return 'experience';
        } else if (path.includes('internal/process') || path.includes('process/')) {
            return 'process';
        } else if (path.includes('internal/system') || path.includes('system/')) {
            return 'system';
        } else {
            return 'other';
        }
    }
    
    // Categorize APIs by domain and layer
    apis.forEach(api => {
        const path = api.path || '';
        const name = api.name || '';
        const displayName = api.displayName || '';
        const description = api.description || '';
        const layer = getArchitecturalLayer(path);
        
        let targetDomain = '🔧 System APIs'; // default
        
        if (path.includes('chatbot') || path.includes('ai') || name.includes('gpt') || description.toLowerCase().includes('bot')) {
            targetDomain = '🤖 Artificial Intelligence & Chatbots';
        } else if (path.includes('power-bi') || path.includes('dax-query') || path.includes('cosmos')) {
            targetDomain = '📊 Business Intelligence & Analytics';
        } else if (path.includes('location-store') || path.includes('shop-floor') || path.includes('itek') || path.includes('retail') || path.includes('tpv6')) {
            targetDomain = '🏪 Store Management & Retail';
        } else if (path.includes('salesforce') || name.includes('salesforce')) {
            targetDomain = '🔗 Salesforce Integration';
        } else if (path.includes('sap') || path.includes('blackline') || path.includes('payroll')) {
            targetDomain = '💰 SAP & Financial Systems';
        } else if (path.includes('vis') || path.includes('documents')) {
            targetDomain = '🧾 Documents & VIS2SAP';
        } else if (path.includes('kafka') || path.includes('configuration')) {
            targetDomain = '⚙️ Infrastructure & Configuration';
        } else if (path.includes('clienteling') || path.includes('copilot')) {
            targetDomain = '🎯 Customer Experience & Clienteling';
        } else if (path.includes('loyalty') || path.includes('voucher')) {
            targetDomain = '🎁 Loyalty & Vouchers';
        } else if (path.includes('pubsub') || name.includes('kafka')) {
            targetDomain = '🔄 Data Processing (Kafka)';
        } else if (name.includes('petstore') || name.includes('swagger') || displayName.includes('Pet')) {
            targetDomain = '📄 Demo & Testing APIs';
        }
        
        const apiName = api.displayName || api.name;
        if (!domains[targetDomain][layer].includes(apiName)) {
            domains[targetDomain][layer].push(apiName);
        }
    });
    
    // Calculate totals for summary
    let totalByLayer = {
        experience: 0,
        process: 0,
        system: 0,
        other: 0
    };
    
    Object.keys(domains).forEach(domainName => {
        const domain = domains[domainName];
        totalByLayer.experience += domain.experience.length;
        totalByLayer.process += domain.process.length;
        totalByLayer.system += domain.system.length;
        totalByLayer.other += domain.other.length;
    });
    
    // Architecture layer summary
    console.log('🏗️ ARCHITECTURAL LAYERS SUMMARY');
    console.log('===============================');
    console.log(`🌐 Experience Layer: ${totalByLayer.experience} APIs`);
    console.log(`⚙️ Process Layer: ${totalByLayer.process} APIs`);
    console.log(`🔧 System Layer: ${totalByLayer.system} APIs`);
    console.log(`📋 Other APIs: ${totalByLayer.other} APIs`);
    console.log(`📊 Total: ${totalByLayer.experience + totalByLayer.process + totalByLayer.system + totalByLayer.other} APIs\n`);
    
    // Create a simple text list for easy copying
    console.log('\n📝 SIMPLE API NAME LIST (for copying)');
    console.log('====================================');
    
    const allApiNames = [];
    const addedNames = new Set(); // Para evitar duplicados
    
    Object.keys(domains).forEach(domainName => {
        const domain = domains[domainName];
        const totalInDomain = domain.experience.length + domain.process.length + domain.system.length + domain.other.length;
        
        if (totalInDomain > 0) {
            console.log(`\n${domainName}:`);
            
            if (domain.experience.length > 0) {
                console.log('  Experience:');
                domain.experience.forEach(apiName => {
                    console.log(`    ${apiName}`);
                    if (!addedNames.has(apiName)) {
                        allApiNames.push(apiName);
                        addedNames.add(apiName);
                    }
                });
            }
            
            if (domain.process.length > 0) {
                console.log('  Process:');
                domain.process.forEach(apiName => {
                    console.log(`    ${apiName}`);
                    if (!addedNames.has(apiName)) {
                        allApiNames.push(apiName);
                        addedNames.add(apiName);
                    }
                });
            }
            
            if (domain.system.length > 0) {
                console.log('  System:');
                domain.system.forEach(apiName => {
                    console.log(`    ${apiName}`);
                    if (!addedNames.has(apiName)) {
                        allApiNames.push(apiName);
                        addedNames.add(apiName);
                    }
                });
            }
            
            if (domain.other.length > 0) {
                console.log('  Other:');
                domain.other.forEach(apiName => {
                    console.log(`    ${apiName}`);
                    if (!addedNames.has(apiName)) {
                        allApiNames.push(apiName);
                        addedNames.add(apiName);
                    }
                });
            }
        }
    });
    
    // Unique API names count
    console.log(`\n📈 Total unique API names: ${allApiNames.length}`);
    console.log(`📈 Total API instances from Azure: ${apis.length}`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}