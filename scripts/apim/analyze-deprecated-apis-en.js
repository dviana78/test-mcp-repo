#!/usr/bin/env node

/**
 * Script to identify deprecated APIs in Azure APIM
 * Searches for APIs marked as deprecated in descriptions or names
 */

import { execSync } from 'child_process';

try {
    // Execute Azure CLI command and get JSON output
    const command = 'az apim api list --resource-group rg-duf-weu-infra-gapim-dev --service-name apim-duf-weu-infra-gapim-dev-001 --output json';
    const output = execSync(command, { encoding: 'utf8' });
    const apis = JSON.parse(output);
    
    console.log('🚨 DEPRECATED APIS ANALYSIS');
    console.log('===========================\n');
    
    // Find deprecated APIs
    const deprecatedApis = [];
    const deprecatedKeywords = ['deprecated', 'deprecate', 'withdraw', 'obsolete', 'legacy', 'retire', 'end of life', 'eol'];
    
    apis.forEach(api => {
        const name = (api.name || '').toLowerCase();
        const displayName = (api.displayName || '').toLowerCase();
        const description = (api.description || '').toLowerCase();
        const path = (api.path || '').toLowerCase();
        
        // Check if API is marked as deprecated
        const isDeprecated = deprecatedKeywords.some(keyword => 
            description.includes(keyword) || 
            name.includes(keyword) || 
            displayName.includes(keyword) ||
            path.includes(keyword)
        );
        
        if (isDeprecated) {
            deprecatedApis.push({
                name: api.name,
                displayName: api.displayName,
                description: api.description,
                path: api.path,
                revision: api.apiRevision,
                isCurrent: api.isCurrent,
                protocols: api.protocols
            });
        }
    });
    
    // Display deprecated APIs
    if (deprecatedApis.length > 0) {
        console.log(`⚠️ Found ${deprecatedApis.length} deprecated APIs:\n`);
        
        deprecatedApis.forEach((api, index) => {
            const status = api.isCurrent ? '🟢 CURRENT' : '🔴 OLD REVISION';
            const revision = api.revision || '1';
            
            console.log(`${index + 1}. ${status} - ${api.displayName || api.name}`);
            console.log(`   📍 Path: ${api.path}`);
            console.log(`   🔄 Revision: ${revision}`);
            console.log(`   🔗 Protocols: ${api.protocols ? api.protocols.join(', ') : 'N/A'}`);
            
            if (api.description) {
                const desc = api.description.length > 100 
                    ? api.description.substring(0, 100) + '...' 
                    : api.description;
                console.log(`   📝 Description: ${desc}`);
            }
            console.log('');
        });
        
        // Summary by status
        const currentDeprecated = deprecatedApis.filter(api => api.isCurrent).length;
        const oldRevisionDeprecated = deprecatedApis.filter(api => !api.isCurrent).length;
        
        console.log('\n📊 DEPRECATED APIS SUMMARY');
        console.log('==========================');
        console.log(`🟢 Current deprecated APIs: ${currentDeprecated}`);
        console.log(`🔴 Old revision deprecated APIs: ${oldRevisionDeprecated}`);
        console.log(`📊 Total deprecated APIs: ${deprecatedApis.length}`);
        console.log(`📈 Total APIs in APIM: ${apis.length}`);
        console.log(`📉 Deprecation rate: ${((deprecatedApis.length / apis.length) * 100).toFixed(1)}%`);
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS');
        console.log('==================');
        if (currentDeprecated > 0) {
            console.log('⚠️ Action Required: You have current APIs marked as deprecated');
            console.log('   - Review migration plans for dependent applications');
            console.log('   - Set up proper deprecation timelines');
            console.log('   - Notify API consumers about deprecation');
        }
        if (oldRevisionDeprecated > 0) {
            console.log('🧹 Cleanup Opportunity: Consider removing old deprecated revisions');
            console.log('   - Archive or delete unused deprecated revisions');
            console.log('   - Keep only necessary versions for rollback purposes');
        }
        
        // List unique deprecated API names
        console.log('\n📋 DEPRECATED API NAMES (for reference)');
        console.log('=======================================');
        const uniqueNames = [...new Set(deprecatedApis.map(api => api.displayName || api.name))];
        uniqueNames.forEach(name => {
            console.log(`• ${name}`);
        });
        
    } else {
        console.log('✅ Good news! No deprecated APIs found in your APIM.');
        console.log('\n📊 ANALYSIS SUMMARY');
        console.log('==================');
        console.log(`📈 Total APIs analyzed: ${apis.length}`);
        console.log('🎯 Deprecation keywords searched: deprecated, deprecate, withdraw, obsolete, legacy, retire, end of life, eol');
        console.log('✨ All APIs appear to be active and maintained');
        
        console.log('\n💡 BEST PRACTICES');
        console.log('=================');
        console.log('🔍 Regular deprecation audits are recommended');
        console.log('📝 Consider adding deprecation notices to API descriptions when planning retirement');
        console.log('📅 Implement API versioning strategy for smooth transitions');
    }
    
} catch (error) {
    console.error('❌ Error analyzing deprecated APIs:', error.message);
    console.log('\n🔧 TROUBLESHOOTING');
    console.log('==================');
    console.log('1. Verify Azure CLI is installed and authenticated');
    console.log('2. Check resource group and APIM service names');
    console.log('3. Ensure you have read permissions on the APIM service');
    process.exit(1);
}