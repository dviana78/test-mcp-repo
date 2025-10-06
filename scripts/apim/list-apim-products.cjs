#!/usr/bin/env node

/**
 * List all Azure APIM Products directly using Azure SDK
 */

const { ApiManagementClient } = require('@azure/arm-apimanagement');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

console.log('📦 Listing All Azure APIM Products');
console.log('===================================\n');

async function listProducts() {
  try {
    console.log('🔐 Authenticating with Azure...');
    const credential = new DefaultAzureCredential();
    
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    const resourceGroupName = process.env.AZURE_APIM_RESOURCE_GROUP;
    const serviceName = process.env.AZURE_APIM_SERVICE_NAME;
    
    if (!subscriptionId || !resourceGroupName || !serviceName) {
      throw new Error('Missing required environment variables. Check .env file.');
    }
    
    console.log(`🎯 Target APIM: ${serviceName} in ${resourceGroupName}`);
    
    const client = new ApiManagementClient(credential, subscriptionId);
    
    console.log('📦 Fetching products...\n');
    
    const products = [];
    for await (const product of client.product.listByService(resourceGroupName, serviceName)) {
      products.push(product);
    }
    
    if (products.length === 0) {
      console.log('ℹ️  No products found in the APIM service.');
      return;
    }
    
    console.log(`✅ Found ${products.length} products:\n`);
    
    // Group products by category for better organization
    const categorizedProducts = categorizeProducts(products);
    
    // Display products by category
    for (const [category, categoryProducts] of Object.entries(categorizedProducts)) {
      console.log(`\n🏷️  ${category.toUpperCase()} (${categoryProducts.length} products)`);
      console.log('='.repeat(50));
      
      categoryProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. 📦 ${product.displayName || product.name}`);
        console.log(`   🔗 Name: ${product.name}`);
        console.log(`   📋 Description: ${product.description || 'No description'}`);
        console.log(`   🔒 State: ${product.state}`);
        console.log(`   📝 Subscription Required: ${product.subscriptionRequired ? 'Yes' : 'No'}`);
        console.log(`   ✅ Approval Required: ${product.approvalRequired ? 'Yes' : 'No'}`);
        
        if (product.terms) {
          console.log(`   📜 Terms: ${product.terms}`);
        }
      });
    }
    
    // Summary statistics
    console.log('\n📊 Summary Statistics:');
    console.log('======================');
    console.log(`Total Products: ${products.length}`);
    console.log(`Published: ${products.filter(p => p.state === 'published').length}`);
    console.log(`Not Published: ${products.filter(p => p.state === 'notPublished').length}`);
    console.log(`Subscription Required: ${products.filter(p => p.subscriptionRequired).length}`);
    console.log(`Approval Required: ${products.filter(p => p.approvalRequired).length}`);
    
    // Display categories breakdown
    console.log('\n📈 Products by Category:');
    for (const [category, categoryProducts] of Object.entries(categorizedProducts)) {
      console.log(`  ${category}: ${categoryProducts.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error listing products:', error.message);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('\n🔍 Network connectivity issue detected.');
    }
    
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Check Azure credentials (.env file)');
    console.log('   2. Verify APIM service name and resource group');
    console.log('   3. Ensure proper permissions for the service principal');
    console.log('   4. Check if the subscription ID is correct');
    
    process.exit(1);
  }
}

/**
 * Categorize products based on their names and descriptions
 */
function categorizeProducts(products) {
  const categories = {
    'Integration & APIs': [],
    'AI & Machine Learning': [],
    'Business Applications': [],
    'Infrastructure & Platform': [],
    'Testing & Development': [],
    'Other': []
  };
  
  products.forEach(product => {
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const displayName = (product.displayName || '').toLowerCase();
    
    const content = `${name} ${description} ${displayName}`;
    
    if (content.includes('salesforce') || content.includes('sap') || content.includes('integration')) {
      categories['Integration & APIs'].push(product);
    } else if (content.includes('ai') || content.includes('chatbot') || content.includes('automated') || content.includes('avolta-gpt')) {
      categories['AI & Machine Learning'].push(product);
    } else if (content.includes('shop') || content.includes('management') || content.includes('payroll') || content.includes('clienteling')) {
      categories['Business Applications'].push(product);
    } else if (content.includes('kafka') || content.includes('pubsub') || content.includes('blob') || content.includes('power-bi')) {
      categories['Infrastructure & Platform'].push(product);
    } else if (content.includes('showcase') || content.includes('poc') || content.includes('test')) {
      categories['Testing & Development'].push(product);
    } else {
      categories['Other'].push(product);
    }
  });
  
  // Remove empty categories
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });
  
  return categories;
}

/**
 * Display help information
 */
function showHelp() {
  console.log('📦 Azure APIM Products Lister');
  console.log('============================\n');
  console.log('This script lists all products in your Azure API Management service.');
  console.log('\nUsage: node list-apim-products.cjs [options]');
  console.log('\nOptions:');
  console.log('  --help, -h    Show this help message');
  console.log('\nEnvironment Variables Required:');
  console.log('  AZURE_SUBSCRIPTION_ID      - Your Azure subscription ID');
  console.log('  AZURE_APIM_RESOURCE_GROUP   - Resource group containing the APIM service');
  console.log('  AZURE_APIM_SERVICE_NAME     - Name of the APIM service');
  console.log('\nExample .env file:');
  console.log('  AZURE_SUBSCRIPTION_ID=your-subscription-id');
  console.log('  AZURE_APIM_RESOURCE_GROUP=your-resource-group');
  console.log('  AZURE_APIM_SERVICE_NAME=your-apim-service-name');
}

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run the script
listProducts().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});