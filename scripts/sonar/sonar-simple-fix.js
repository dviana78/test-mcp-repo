#!/usr/bin/env node

/**
 * SonarQube Auto-Fix Script (Simple Version)
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

console.log('🚀 Starting SonarQube Auto-Fix (simple version)...');
console.log('📁 Project directory:', projectRoot);

// Apply direct fixes based on known issues
async function applyDirectFixes() {
    console.log('\n🔧 Applying direct fixes...');
    
    // Fix 1: Add readonly to variables in api-management.service.ts
    const apiManagementPath = join(projectRoot, 'src/services/api-management.service.ts');
    try {
        let content = readFileSync(apiManagementPath, 'utf8');
        const originalContent = content;
        
        // Agregar readonly a azureClient
        content = content.replace(
            /(\s+)(private\s+)(azureClient)/g,
            '$1private readonly $3'
        );
        
        if (content !== originalContent) {
            writeFileSync(apiManagementPath, content, 'utf8');
            console.log('✅ api-management.service.ts: Agregado readonly a azureClient');
        }
    } catch (error) {
        console.error('❌ Error en api-management.service.ts:', error.message);
    }
    
    // Fix 2: Agregar readonly a variables en subscriptions-management.service.ts
    const subscriptionsPath = join(projectRoot, 'src/services/subscriptions-management.service.ts');
    try {
        let content = readFileSync(subscriptionsPath, 'utf8');
        const originalContent = content;
        
        // Agregar readonly a azureClient y logger
        content = content.replace(
            /(\s+)(private\s+)(azureClient|logger)/g,
            '$1private readonly $3'
        );
        
        // Reemplazar || con ?? (nullish coalescing)
        content = content.replace(/\s*\|\|\s*/g, ' ?? ');
        
        if (content !== originalContent) {
            writeFileSync(subscriptionsPath, content, 'utf8');
            console.log('✅ subscriptions-management.service.ts: Aplicadas correcciones de readonly y nullish coalescing');
        }
    } catch (error) {
        console.error('❌ Error en subscriptions-management.service.ts:', error.message);
    }
    
    console.log('\n🎉 Correcciones directas completadas!');
}

// Ejecutar
applyDirectFixes().catch(console.error);