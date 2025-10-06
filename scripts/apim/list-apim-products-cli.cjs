#!/usr/bin/env node

/**
 * List all Azure APIM Products using Azure CLI
 * Simple and fast approach using az commands
 */

const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

console.log('📦 Azure APIM Products CLI Lister');
console.log('=================================\n');

async function listProductsWithCLI() {
  try {
    const resourceGroupName = process.env.AZURE_APIM_RESOURCE_GROUP || 'rg-duf-weu-infra-gapim-dev';
    const serviceName = process.env.AZURE_APIM_SERVICE_NAME || 'apim-duf-weu-infra-gapim-dev-001';
    
    console.log(`💡 Using defaults: RG=${resourceGroupName}, Service=${serviceName}`);
    
    if (!resourceGroupName || !serviceName) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }
    
    console.log('🔐 Checking Azure CLI authentication...');
    
    // Check if Azure CLI is installed and user is logged in
    try {
      execSync('az account show', { stdio: 'pipe' });
      console.log('✅ Azure CLI authenticated successfully');
    } catch (error) {
      console.error('❌ Azure CLI not authenticated. Please run: az login');
      process.exit(1);
    }
    
    console.log(`🎯 Target APIM: ${serviceName} in ${resourceGroupName}\n`);
    
    // Get products using Azure CLI
    console.log('📦 Fetching products...');
    const command = `az apim product list --resource-group "${resourceGroupName}" --service-name "${serviceName}" --output json`;
    
    const output = execSync(command, { encoding: 'utf8' });
    const products = JSON.parse(output);
    
    if (!products || products.length === 0) {
      console.log('ℹ️  No products found in the APIM service.');
      return;
    }
    
    console.log(`✅ Found ${products.length} products:\n`);
    
    // Display products in a formatted way
    displayProducts(products);
    
    // Show summary
    showSummary(products);
    
  } catch (error) {
    console.error('❌ Error listing products:', error.message);
    
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Ensure Azure CLI is installed: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli');
    console.log('   2. Login to Azure: az login');
    console.log('   3. Check your .env file for correct APIM service details');
    console.log('   4. Verify you have permissions to access the APIM service');
    
    process.exit(1);
  }
}

/**
 * Display products in a formatted table-like structure
 */
function displayProducts(products) {
  console.log('📋 Product Details:');
  console.log('===================\n');
  
  products.forEach((product, index) => {
    const status = product.state === 'published' ? '🟢 Published' : '🔴 Not Published';
    const subscription = product.subscriptionRequired ? '🔒 Required' : '🔓 Not Required';
    const approval = product.approvalRequired ? '✋ Required' : '✅ Auto-Approved';
    
    console.log(`${index + 1}. 📦 ${product.displayName || product.name}`);
    console.log(`   ID: ${product.name}`);
    console.log(`   Status: ${status}`);
    console.log(`   Subscription: ${subscription}`);
    console.log(`   Approval: ${approval}`);
    
    if (product.description) {
      const description = product.description.length > 80 
        ? product.description.substring(0, 80) + '...'
        : product.description;
      console.log(`   Description: ${description}`);
    }
    
    console.log(''); // Empty line for separation
  });
}

/**
 * Show summary statistics
 */
function showSummary(products) {
  console.log('📊 Summary Statistics:');
  console.log('======================');
  
  const stats = {
    total: products.length,
    published: products.filter(p => p.state === 'published').length,
    notPublished: products.filter(p => p.state === 'notPublished').length,
    subscriptionRequired: products.filter(p => p.subscriptionRequired).length,
    approvalRequired: products.filter(p => p.approvalRequired).length
  };
  
  console.log(`📦 Total Products: ${stats.total}`);
  console.log(`🟢 Published: ${stats.published}`);
  console.log(`🔴 Not Published: ${stats.notPublished}`);
  console.log(`🔒 Subscription Required: ${stats.subscriptionRequired}`);
  console.log(`✋ Approval Required: ${stats.approvalRequired}`);
  
  // Show percentage breakdowns
  if (stats.total > 0) {
    console.log('\n📈 Percentages:');
    console.log(`   Published: ${Math.round((stats.published / stats.total) * 100)}%`);
    console.log(`   Subscription Required: ${Math.round((stats.subscriptionRequired / stats.total) * 100)}%`);
    console.log(`   Approval Required: ${Math.round((stats.approvalRequired / stats.total) * 100)}%`);
  }
}

/**
 * Display help information
 */
function showHelp() {
  console.log('📦 Azure APIM Products CLI Lister');
  console.log('=================================\n');
  console.log('This script lists all products in your Azure API Management service using Azure CLI.');
  console.log('\nUsage: node list-apim-products-cli.cjs [options]');
  console.log('\nOptions:');
  console.log('  --help, -h    Show this help message');
  console.log('\nPrerequisites:');
  console.log('  1. Azure CLI installed and configured');
  console.log('  2. Logged into Azure (az login)');
  console.log('  3. Environment variables set in .env file');
  console.log('\nEnvironment Variables Required:');
  console.log('  AZURE_APIM_RESOURCE_GROUP   - Resource group containing the APIM service');
  console.log('  AZURE_APIM_SERVICE_NAME     - Name of the APIM service');
  console.log('\nExample .env file:');
  console.log('  AZURE_APIM_RESOURCE_GROUP=rg-duf-weu-infra-gapim-dev');
  console.log('  AZURE_APIM_SERVICE_NAME=apim-duf-weu-infra-gapim-dev-001');
}

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run the script
listProductsWithCLI().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});