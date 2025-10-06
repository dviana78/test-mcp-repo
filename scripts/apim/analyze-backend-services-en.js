#!/usr/bin/env node

/**
 * Script to analyze APIM backend services
 * Lists all backend services configured in Azure API Management
 */

import { execSync } from 'child_process';

try {
    console.log('🔍 AZURE APIM BACKEND SERVICES ANALYSIS');
    console.log('=======================================\n');
    
    // Execute Azure CLI command to get backend services
    console.log('📡 Fetching backend services from Azure APIM...');
    const command = 'az apim backend list --resource-group rg-duf-weu-infra-gapim-dev --service-name apim-duf-weu-infra-gapim-dev-001 --output json';
    const output = execSync(command, { encoding: 'utf8' });
    const backends = JSON.parse(output);
    
    console.log(`✅ Found ${backends.length} backend services\n`);
    
    if (backends.length === 0) {
        console.log('ℹ️ No backend services found in this APIM instance.');
        console.log('\n💡 Backend services are typically configured when:');
        console.log('• APIs need to connect to specific backend URLs');
        console.log('• Custom authentication is required');
        console.log('• Load balancing between multiple backends is needed');
        console.log('• Circuit breaker patterns are implemented');
        process.exit(0);
    }
    
    // Categorize backends by type
    const backendsByProtocol = {
        http: [],
        soap: [],
        fabric: [],
        unknown: []
    };
    
    backends.forEach(backend => {
        const protocol = backend.protocol ? backend.protocol.toLowerCase() : 'unknown';
        if (backendsByProtocol[protocol]) {
            backendsByProtocol[protocol].push(backend);
        } else {
            backendsByProtocol.unknown.push(backend);
        }
    });
    
    // Display backends by protocol
    Object.keys(backendsByProtocol).forEach(protocol => {
        const protocolBackends = backendsByProtocol[protocol];
        if (protocolBackends.length > 0) {
            const protocolIcon = {
                'http': '🌐',
                'soap': '🧼', 
                'fabric': '🔗',
                'unknown': '❓'
            };
            
            console.log(`${protocolIcon[protocol]} ${protocol.toUpperCase()} BACKENDS (${protocolBackends.length})`);
            console.log('═'.repeat(50));
            
            protocolBackends.forEach((backend, index) => {
                console.log(`\n${index + 1}. ${backend.name || backend.id}`);
                console.log(`   🔗 URL: ${backend.url || 'N/A'}`);
                console.log(`   📡 Protocol: ${backend.protocol || 'Unknown'}`);
                
                if (backend.description) {
                    const desc = backend.description.length > 80 
                        ? backend.description.substring(0, 80) + '...' 
                        : backend.description;
                    console.log(`   📝 Description: ${desc}`);
                }
                
                if (backend.resourceId) {
                    console.log(`   🆔 Resource ID: ${backend.resourceId}`);
                }
                
                if (backend.credentials) {
                    const authTypes = [];
                    if (backend.credentials.header) authTypes.push('Header Auth');
                    if (backend.credentials.query) authTypes.push('Query Auth');
                    if (backend.credentials.authorization) authTypes.push('Authorization');
                    if (backend.credentials.certificate) authTypes.push('Certificate');
                    
                    if (authTypes.length > 0) {
                        console.log(`   🔐 Authentication: ${authTypes.join(', ')}`);
                    }
                }
                
                if (backend.proxy) {
                    console.log(`   🌐 Proxy: ${backend.proxy.url}`);
                }
                
                if (backend.tls) {
                    console.log(`   🔒 TLS: Validate Certificate Chain: ${backend.tls.validateCertificateChain ? 'Yes' : 'No'}`);
                    console.log(`   🔒 TLS: Validate Certificate Name: ${backend.tls.validateCertificateName ? 'Yes' : 'No'}`);
                }
            });
            console.log('\n');
        }
    });
    
    // Summary statistics
    console.log('📊 BACKEND SERVICES SUMMARY');
    console.log('===========================');
    console.log(`🌐 HTTP Backends: ${backendsByProtocol.http.length}`);
    console.log(`🧼 SOAP Backends: ${backendsByProtocol.soap.length}`);
    console.log(`🔗 Service Fabric Backends: ${backendsByProtocol.fabric.length}`);
    console.log(`❓ Unknown Protocol Backends: ${backendsByProtocol.unknown.length}`);
    console.log(`📊 Total Backend Services: ${backends.length}`);
    
    // Analysis insights
    console.log('\n💡 BACKEND ANALYSIS INSIGHTS');
    console.log('============================');
    
    const httpBackends = backendsByProtocol.http.length;
    const totalBackends = backends.length;
    
    if (httpBackends > 0) {
        console.log(`✅ Modern Architecture: ${((httpBackends / totalBackends) * 100).toFixed(1)}% of backends use HTTP/REST`);
    }
    
    const authBackends = backends.filter(b => b.credentials).length;
    if (authBackends > 0) {
        console.log(`🔐 Secured Backends: ${authBackends} backends have authentication configured`);
    }
    
    const tlsBackends = backends.filter(b => b.tls).length;
    if (tlsBackends > 0) {
        console.log(`🔒 TLS Configured: ${tlsBackends} backends have TLS settings`);
    }
    
    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS');
    console.log('==================');
    
    if (backends.length === 0) {
        console.log('🔧 Consider configuring backend services for:');
        console.log('   • Better URL management and versioning');
        console.log('   • Centralized authentication configuration'); 
        console.log('   • Load balancing and failover capabilities');
        console.log('   • Circuit breaker and retry policies');
    } else {
        console.log('✅ Backend services are configured - Good practice!');
        
        if (authBackends < totalBackends) {
            console.log('🔐 Consider adding authentication to unprotected backends');
        }
        
        if (tlsBackends < totalBackends) {
            console.log('🔒 Consider configuring TLS validation for enhanced security');
        }
    }
    
    // List backend names for reference
    if (backends.length > 0) {
        console.log('\n📋 BACKEND SERVICE NAMES (for reference)');
        console.log('========================================');
        backends.forEach(backend => {
            const name = backend.name || backend.id;
            const url = backend.url ? ` (${backend.url})` : '';
            console.log(`• ${name}${url}`);
        });
    }
    
} catch (error) {
    console.error('❌ Error analyzing backend services:', error.message);
    console.log('\n🔧 TROUBLESHOOTING');
    console.log('==================');
    console.log('1. Verify Azure CLI is installed and authenticated');
    console.log('2. Check resource group and APIM service names');
    console.log('3. Ensure you have read permissions on the APIM service');
    console.log('4. Backend services might be configured at the API level instead of globally');
    process.exit(1);
}