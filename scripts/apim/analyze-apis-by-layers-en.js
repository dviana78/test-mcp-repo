#!/usr/bin/env node

/**
 * Script to analyze APIM APIs by business domain and architectural layers
 * Lists APIs organized by domain and then by architectural layer (Experience, Process, System)
 */

import { execSync } from 'child_process';

console.log('🏗️ Azure APIM APIs Analysis by Domains and Architectural Layers');
console.log('================================================================\n');

try {
    console.log('📡 Fetching APIs from Azure APIM...');
    
    // Execute Azure CLI command and get JSON output
    const command = 'az apim api list --resource-group rg-duf-weu-infra-gapim-dev --service-name apim-duf-weu-infra-gapim-dev-001 --output json';
    const output = execSync(command, { encoding: 'utf8' });
    const apis = JSON.parse(output);
    
    console.log(`✅ Found ${apis.length} APIs\n`);
    
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
        
        domains[targetDomain][layer].push(api);
    });
    
    // Display results organized by domain and layer
    console.log('📋 APIS ORGANIZED BY DOMAIN AND ARCHITECTURAL LAYER');
    console.log('===================================================\n');
    
    let totalByLayer = {
        experience: 0,
        process: 0,
        system: 0,
        other: 0
    };
    
    Object.keys(domains).forEach(domainName => {
        const domain = domains[domainName];
        const totalInDomain = domain.experience.length + domain.process.length + domain.system.length + domain.other.length;
        
        if (totalInDomain > 0) {
            console.log(`${domainName} (${totalInDomain} APIs)`);
            console.log('═'.repeat(70));
            
            // Experience Layer
            if (domain.experience.length > 0) {
                console.log(`\n  🌐 EXPERIENCE LAYER (${domain.experience.length} APIs)`);
                console.log('  ─────────────────────────────────────────────');
                domain.experience.forEach(api => {
                    const current = api.isCurrent ? '🟢' : '🔴';
                    const revision = api.apiRevision || '1';
                    console.log(`    ${current} ${api.displayName || api.name}`);
                    console.log(`       📍 ${api.path}`);
                    console.log(`       🔄 Rev: ${revision} ${api.isCurrent ? '(CURRENT)' : ''}`);
                    if (api.description && api.description.trim()) {
                        const desc = api.description.length > 60 
                            ? api.description.substring(0, 60) + '...' 
                            : api.description;
                        console.log(`       📝 ${desc}`);
                    }
                    console.log('');
                });
                totalByLayer.experience += domain.experience.length;
            }
            
            // Process Layer
            if (domain.process.length > 0) {
                console.log(`  ⚙️ PROCESS LAYER (${domain.process.length} APIs)`);
                console.log('  ─────────────────────────────────────────────');
                domain.process.forEach(api => {
                    const current = api.isCurrent ? '🟢' : '🔴';
                    const revision = api.apiRevision || '1';
                    console.log(`    ${current} ${api.displayName || api.name}`);
                    console.log(`       📍 ${api.path}`);
                    console.log(`       🔄 Rev: ${revision} ${api.isCurrent ? '(CURRENT)' : ''}`);
                    if (api.description && api.description.trim()) {
                        const desc = api.description.length > 60 
                            ? api.description.substring(0, 60) + '...' 
                            : api.description;
                        console.log(`       📝 ${desc}`);
                    }
                    console.log('');
                });
                totalByLayer.process += domain.process.length;
            }
            
            // System Layer
            if (domain.system.length > 0) {
                console.log(`  🔧 SYSTEM LAYER (${domain.system.length} APIs)`);
                console.log('  ─────────────────────────────────────────────');
                domain.system.forEach(api => {
                    const current = api.isCurrent ? '🟢' : '🔴';
                    const revision = api.apiRevision || '1';
                    console.log(`    ${current} ${api.displayName || api.name}`);
                    console.log(`       📍 ${api.path}`);
                    console.log(`       🔄 Rev: ${revision} ${api.isCurrent ? '(CURRENT)' : ''}`);
                    if (api.description && api.description.trim()) {
                        const desc = api.description.length > 60 
                            ? api.description.substring(0, 60) + '...' 
                            : api.description;
                        console.log(`       📝 ${desc}`);
                    }
                    console.log('');
                });
                totalByLayer.system += domain.system.length;
            }
            
            // Other Layer
            if (domain.other.length > 0) {
                console.log(`  📋 OTHER APIS (${domain.other.length} APIs)`);
                console.log('  ─────────────────────────────────────────────');
                domain.other.forEach(api => {
                    const current = api.isCurrent ? '🟢' : '🔴';
                    const revision = api.apiRevision || '1';
                    console.log(`    ${current} ${api.displayName || api.name}`);
                    console.log(`       📍 ${api.path}`);
                    console.log(`       🔄 Rev: ${revision} ${api.isCurrent ? '(CURRENT)' : ''}`);
                    if (api.description && api.description.trim()) {
                        const desc = api.description.length > 60 
                            ? api.description.substring(0, 60) + '...' 
                            : api.description;
                        console.log(`       📝 ${desc}`);
                    }
                    console.log('');
                });
                totalByLayer.other += domain.other.length;
            }
            
            console.log('\n');
        }
    });
    
    // Architecture layer summary
    console.log('\n🏗️ ARCHITECTURAL LAYERS SUMMARY');
    console.log('===============================');
    console.log(`🌐 Experience Layer: ${totalByLayer.experience} APIs`);
    console.log(`⚙️ Process Layer: ${totalByLayer.process} APIs`);
    console.log(`🔧 System Layer: ${totalByLayer.system} APIs`);
    console.log(`📋 Other APIs: ${totalByLayer.other} APIs`);
    console.log(`📊 Total: ${totalByLayer.experience + totalByLayer.process + totalByLayer.system + totalByLayer.other} APIs\n`);
    
    // Layer distribution percentage
    const total = totalByLayer.experience + totalByLayer.process + totalByLayer.system + totalByLayer.other;
    console.log('📈 LAYER DISTRIBUTION');
    console.log('====================');
    console.log(`🌐 Experience: ${((totalByLayer.experience / total) * 100).toFixed(1)}%`);
    console.log(`⚙️ Process: ${((totalByLayer.process / total) * 100).toFixed(1)}%`);
    console.log(`🔧 System: ${((totalByLayer.system / total) * 100).toFixed(1)}%`);
    console.log(`📋 Other: ${((totalByLayer.other / total) * 100).toFixed(1)}%`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}