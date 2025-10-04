#!/usr/bin/env node

/**
 * List all Azure APIM Products directly using Azure SDK
 */

import apimPkg from '@azure/arm-apimanagement';
const { AzureApiManagementClient } = apimPkg;
import identityPkg from '@azure/identity';
const { DefaultAzureCredential } = identityPkg;
import dotenvPkg from 'dotenv';
const { config } = dotenvPkg;

// Load environment variables
config();

console.log('📦 Listing All Azure APIM Products');
console.log('==================================\n');

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
    
    const client = new AzureApiManagementClient(credential, subscriptionId);
    
    console.log('📦 Fetching products...');
    const products = client.product.listByService(resourceGroupName, serviceName);
    
    const productList = [];
    for await (const product of products) {
      productList.push(product);
    }
    
    console.log(`📊 Total products found: ${productList.length}\n`);
    
    if (productList.length === 0) {
      console.log('📦 No products found in the APIM service.');
      return;
    }
    
    console.log('📦 Azure APIM Products:');
    console.log('======================');
    
    productList.forEach((product, index) => {
      console.log(`${index + 1}. 📦 ${product.displayName || product.name}`);
      console.log(`   🆔 ID: ${product.name}`);
      console.log(`   📝 Description: ${product.description || 'No description'}`);
      console.log(`   🔒 Subscription Required: ${product.subscriptionRequired ? 'Yes' : 'No'}`);
      console.log(`   ✅ Approval Required: ${product.approvalRequired ? 'Yes' : 'No'}`);
      console.log(`   📊 State: ${product.state || 'Unknown'}`);
      
      if (product.subscriptionsLimit) {
        console.log(`   👥 Subscription Limit: ${product.subscriptionsLimit}`);
      }
      
      if (product.terms) {
        console.log(`   📋 Terms: ${product.terms}`);
      }
      
      console.log('');
    });
    
    console.log('🎯 Product Summary:');
    console.log('==================');
    
    const subscriptionRequired = productList.filter(p => p.subscriptionRequired).length;
    const approvalRequired = productList.filter(p => p.approvalRequired).length;
    const published = productList.filter(p => p.state === 'published').length;
    const notPublished = productList.filter(p => p.state === 'notPublished').length;
    
    console.log(`• Products requiring subscription: ${subscriptionRequired}`);
    console.log(`• Products requiring approval: ${approvalRequired}`);
    console.log(`• Published products: ${published}`);
    console.log(`• Not published products: ${notPublished}`);
    console.log(`• Total products: ${productList.length}`);
    
    console.log('\n📋 Product States:');
    const states = {};
    productList.forEach(p => {
      states[p.state] = (states[p.state] || 0) + 1;
    });
    
    Object.entries(states).forEach(([state, count]) => {
      console.log(`   ${state}: ${count} products`);
    });
    
    console.log('\n✅ Products listing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error listing products:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check Azure credentials (.env file)');
    console.error('   2. Verify APIM service name and resource group');
    console.error('   3. Ensure proper permissions for the service principal');
    console.error('   4. Check if the subscription ID is correct');
  }
}

listProducts();