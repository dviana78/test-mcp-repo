#!/usr/bin/env node

/**
 * Script para agrupar y analizar las APIs de APIM por dominio de negocio
 * Conecta con Azure CLI para obtener los datos y los organiza por categorías
 */

import { spawn } from 'child_process';
import fs from 'fs';

console.log('🔍 Análisis de APIs de Azure APIM por Dominios');
console.log('==============================================\n');

// Función para ejecutar comandos de Azure CLI
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

// Función para categorizar APIs por dominio
function categorizeApisByDomain(apis) {
    const domains = {
        '🤖 Inteligencia Artificial y Chatbots': [],
        '📊 Business Intelligence y Analytics': [],
        '🏪 Gestión de Tiendas y Retail': [],
        '🔗 Integración con Salesforce': [],
        '💰 SAP y Sistemas Financieros': [],
        '🧾 Documentos y VIS2SAP': [],
        '⚙️ Infraestructura y Configuración': [],
        '🎯 Experiencia de Cliente y Clienteling': [],
        '🎁 Lealtad y Vouchers': [],
        '🔄 Procesamiento de Datos (Kafka)': [],
        '📄 APIs de Demostración': [],
        '🔧 APIs de Sistema': []
    };

    apis.forEach(api => {
        const path = api.Path || '';
        const name = api.Name || '';
        const displayName = api.DisplayName || '';
        const description = api.Description || '';
        
        // Lógica de categorización basada en el path y nombre
        if (path.includes('chatbot') || path.includes('ai') || name.includes('gpt') || description.toLowerCase().includes('bot')) {
            domains['🤖 Inteligencia Artificial y Chatbots'].push(api);
        } else if (path.includes('power-bi') || path.includes('dax-query') || path.includes('cosmos')) {
            domains['📊 Business Intelligence y Analytics'].push(api);
        } else if (path.includes('location-store') || path.includes('shop-floor') || path.includes('itek') || path.includes('retail') || path.includes('tpv6')) {
            domains['🏪 Gestión de Tiendas y Retail'].push(api);
        } else if (path.includes('salesforce') || name.includes('salesforce')) {
            domains['🔗 Integración con Salesforce'].push(api);
        } else if (path.includes('sap') || path.includes('blackline') || path.includes('payroll')) {
            domains['💰 SAP y Sistemas Financieros'].push(api);
        } else if (path.includes('vis') || path.includes('documents')) {
            domains['🧾 Documentos y VIS2SAP'].push(api);
        } else if (path.includes('kafka') || path.includes('configuration')) {
            domains['⚙️ Infraestructura y Configuración'].push(api);
        } else if (path.includes('clienteling') || path.includes('copilot')) {
            domains['🎯 Experiencia de Cliente y Clienteling'].push(api);
        } else if (path.includes('loyalty') || path.includes('voucher')) {
            domains['🎁 Lealtad y Vouchers'].push(api);
        } else if (path.includes('pubsub') || name.includes('kafka')) {
            domains['🔄 Procesamiento de Datos (Kafka)'].push(api);
        } else if (name.includes('petstore') || name.includes('swagger') || displayName.includes('Pet')) {
            domains['📄 APIs de Demostración'].push(api);
        } else {
            domains['🔧 APIs de Sistema'].push(api);
        }
    });

    return domains;
}

// Función para generar estadísticas
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

// Función principal
async function main() {
    try {
        console.log('📡 Conectando con Azure CLI...');
        
        // Obtener APIs usando Azure CLI
        const command = 'az apim api list --resource-group rg-duf-weu-infra-gapim-dev --service-name apim-duf-weu-infra-gapim-dev-001 --output json';
        const rawOutput = await runAzureCommand(command);
        const apis = JSON.parse(rawOutput);
        
        console.log(`✅ Se encontraron ${apis.length} APIs\n`);
        
        // Categorizar APIs por dominio
        const domains = categorizeApisByDomain(apis);
        
        // Generar estadísticas
        const stats = generateStatistics(domains);
        
        // Mostrar resultados por dominio
        console.log('📋 APIS AGRUPADAS POR DOMINIO DE NEGOCIO');
        console.log('========================================\n');
        
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
                    console.log(`     🔄 Revisión: ${revision} ${api.IsCurrent === 'True' ? '(ACTUAL)' : ''}`);
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
        
        // Mostrar estadísticas finales
        console.log('\n📊 ESTADÍSTICAS GENERALES');
        console.log('=========================');
        console.log(`📈 Total de APIs: ${stats.totalApis}`);
        console.log(`✅ APIs actuales (current): ${stats.currentApis}`);
        console.log(`🔄 APIs con revisiones: ${stats.totalApis - stats.currentApis}\n`);
        
        console.log('🏗️ DISTRIBUCIÓN POR CAPA ARQUITECTÓNICA');
        console.log('=========================================');
        console.log(`🌐 External (Experience): ${stats.architectureLayers.external}`);
        console.log(`⚙️ Internal (System): ${stats.architectureLayers.system}`);
        console.log(`🔄 Internal (Process): ${stats.architectureLayers.process}`);
        console.log(`🎯 Experience: ${stats.architectureLayers.experience}`);
        console.log(`🔧 Other Internal: ${stats.architectureLayers.internal}\n`);
        
        console.log('📊 TOP 5 DOMINIOS CON MÁS APIs');
        console.log('==============================');
        const sortedDomains = Object.entries(stats.domainCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
            
        sortedDomains.forEach(([domain, count], index) => {
            console.log(`${index + 1}. ${domain}: ${count} APIs`);
        });
        
        // Guardar reporte en archivo
        const report = {
            timestamp: new Date().toISOString(),
            summary: stats,
            domains: domains
        };
        
        fs.writeFileSync('apim-apis-analysis.json', JSON.stringify(report, null, 2));
        console.log('\n💾 Reporte guardado en: apim-apis-analysis.json');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}