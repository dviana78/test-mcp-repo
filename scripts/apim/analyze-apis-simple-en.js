#!/usr/bin/env node

/**
 * Simple script to analyze APIM APIs by business domain using Azure CLI
 */

import { execSync } from 'child_process';

console.log('🔍 Azure APIM APIs Analysis by Business Domains');
console.log('===============================================\n');

try {
    console.log('📡 Fetching APIs from Azure APIM...');
    
    // Execute Azure CLI command and get JSON output
    const command = 'az apim api list --resource-group rg-duf-weu-infra-gapim-dev --service-name apim-duf-weu-infra-gapim-dev-001 --output json';
    const output = execSync(command, { encoding: 'utf8' });
    const apis = JSON.parse(output);
    
    console.log(`✅ Found ${apis.length} APIs\n`);
    
    // Initialize domain categories
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
    
    // Categorize APIs
    apis.forEach(api => {
        const path = api.path || '';
        const name = api.name || '';
        const displayName = api.displayName || '';
        const description = api.description || '';
        
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
    
    // Display results
    console.log('📋 APIS GROUPED BY BUSINESS DOMAIN');
    console.log('==================================\n');
    
    let totalCurrent = 0;
    let totalApis = 0;
    
    Object.keys(domains).forEach(domain => {
        const domainApis = domains[domain];
        if (domainApis.length > 0) {
            console.log(`${domain} (${domainApis.length} APIs)`);
            console.log('─'.repeat(60));
            
            domainApis.forEach(api => {
                const current = api.isCurrent ? '🟢' : '🔴';
                const revision = api.apiRevision || '1';
                totalApis++;
                if (api.isCurrent) totalCurrent++;
                
                console.log(`  ${current} ${api.displayName || api.name}`);
                console.log(`     📍 Path: ${api.path}`);
                console.log(`     🔄 Revision: ${revision} ${api.isCurrent ? '(CURRENT)' : ''}`);
                if (api.description && api.description.trim()) {
                    const desc = api.description.length > 80 
                        ? api.description.substring(0, 80) + '...' 
                        : api.description;
                    console.log(`     📝 ${desc}`);
                }
                console.log('');
            });
        }
    });
    
    // Statistics
    console.log('\n📊 SUMMARY STATISTICS');
    console.log('====================');
    console.log(`📈 Total APIs: ${totalApis}`);
    console.log(`✅ Current APIs: ${totalCurrent}`);
    console.log(`🔄 APIs with revisions: ${totalApis - totalCurrent}\n`);
    
    // Top domains
    const domainCounts = Object.entries(domains)
        .map(([name, apis]) => ({ name, count: apis.length }))
        .filter(d => d.count > 0)
        .sort((a, b) => b.count - a.count);
    
    console.log('📊 TOP DOMAINS WITH MOST APIs');
    console.log('=============================');
    domainCounts.forEach(({ name, count }, index) => {
        console.log(`${index + 1}. ${name}: ${count} APIs`);
    });
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}