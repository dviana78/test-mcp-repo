#!/usr/bin/env node

/**
 * Get detailed information about a specific Azure APIM API
 */

const { ApiManagementClient } = require('@azure/arm-apimanagement');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

console.log('🔍 Getting Detailed API Information');
console.log('===================================\n');

async function getAPIDetails(apiId) {
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
    console.log(`🌐 API ID: ${apiId}\n`);
    
    const client = new ApiManagementClient(credential, subscriptionId);
    
    console.log('🔍 Fetching API details...');
    
    // Get basic API information
    const api = await client.api.get(resourceGroupName, serviceName, apiId);
    
    console.log('📋 BASIC API INFORMATION:');
    console.log('=========================');
    console.log(`🌐 Name: ${api.displayName || api.name}`);
    console.log(`🆔 ID: ${api.name}`);
    console.log(`📝 Description: ${api.description || 'No description'}`);
    console.log(`🔗 Service URL: ${api.serviceUrl || 'Not specified'}`);
    console.log(`📍 API Path: ${api.path || 'Not specified'}`);
    console.log(`🔒 Subscription Required: ${api.subscriptionRequired ? 'Yes' : 'No'}`);
    console.log(`📊 State: ${api.state || 'Unknown'}`);
    
    if (api.protocols && api.protocols.length > 0) {
      console.log(`🌐 Protocols: ${api.protocols.join(', ')}`);
    }
    
    if (api.apiVersion) {
      console.log(`🔢 Version: ${api.apiVersion}`);
    }
    
    if (api.apiVersionDescription) {
      console.log(`📝 Version Description: ${api.apiVersionDescription}`);
    }
    
    if (api.subscriptionKeyParameterNames) {
      console.log(`🔑 Subscription Key Parameters:`);
      if (api.subscriptionKeyParameterNames.header) {
        console.log(`   Header: ${api.subscriptionKeyParameterNames.header}`);
      }
      if (api.subscriptionKeyParameterNames.query) {
        console.log(`   Query: ${api.subscriptionKeyParameterNames.query}`);
      }
    }
    
    // Get API operations
    console.log('\n🛠️ API OPERATIONS:');
    console.log('==================');
    
    try {
      const operations = client.apiOperation.listByApi(resourceGroupName, serviceName, apiId);
      const operationList = [];
      
      for await (const operation of operations) {
        operationList.push(operation);
      }
      
      if (operationList.length > 0) {
        console.log(`📊 Total operations: ${operationList.length}\n`);
        
        operationList.forEach((operation, index) => {
          console.log(`${index + 1}. 🔧 ${operation.displayName || operation.name}`);
          console.log(`   🆔 Operation ID: ${operation.name}`);
          console.log(`   📝 Description: ${operation.description || 'No description'}`);
          console.log(`   🌐 Method: ${operation.method || 'Unknown'}`);
          console.log(`   📍 URL Template: ${operation.urlTemplate || 'Not specified'}`);
          
          if (operation.templateParameters && operation.templateParameters.length > 0) {
            console.log(`   📥 Parameters:`);
            operation.templateParameters.forEach(param => {
              console.log(`     - ${param.name} (${param.type || 'unknown'}) - ${param.required ? 'Required' : 'Optional'}`);
              if (param.description) {
                console.log(`       Description: ${param.description}`);
              }
            });
          }
          
          console.log('');
        });
      } else {
        console.log('No operations found for this API.');
      }
    } catch (error) {
      console.log(`⚠️ Could not fetch operations: ${error.message}`);
    }
    
    // Get API schema/definition
    console.log('\n📄 API DEFINITION:');
    console.log('==================');
    
    try {
      // Try to get OpenAPI definition
      const schema = await client.apiSchema.listByApi(resourceGroupName, serviceName, apiId);
      const schemaList = [];
      
      for await (const s of schema) {
        schemaList.push(s);
      }
      
      if (schemaList.length > 0) {
        console.log(`📊 Schema documents found: ${schemaList.length}`);
        
        schemaList.forEach((s, index) => {
          console.log(`\n${index + 1}. 📋 Schema: ${s.name}`);
          console.log(`   🔖 Content Type: ${s.contentType || 'Unknown'}`);
          
          if (s.value) {
            // If it's a JSON schema, try to parse and show basic info
            try {
              const parsed = JSON.parse(s.value);
              if (parsed.info) {
                console.log(`   📝 Title: ${parsed.info.title || 'Untitled'}`);
                console.log(`   🔢 Version: ${parsed.info.version || 'Unknown'}`);
                console.log(`   📖 Description: ${parsed.info.description || 'No description'}`);
              }
              
              if (parsed.paths) {
                const pathCount = Object.keys(parsed.paths).length;
                console.log(`   🛤️ Paths defined: ${pathCount}`);
                
                // Show first few paths as examples
                const paths = Object.keys(parsed.paths).slice(0, 5);
                console.log(`   📍 Example paths:`);
                paths.forEach(path => {
                  const methods = Object.keys(parsed.paths[path]);
                  console.log(`     ${path} (${methods.join(', ').toUpperCase()})`);
                });
                
                if (Object.keys(parsed.paths).length > 5) {
                  console.log(`     ... and ${Object.keys(parsed.paths).length - 5} more paths`);
                }
              }
              
              if (parsed.components && parsed.components.schemas) {
                const schemaCount = Object.keys(parsed.components.schemas).length;
                console.log(`   🏗️ Data models: ${schemaCount}`);
              }
              
            } catch (parseError) {
              console.log(`   📄 Schema content available (${s.value.length} characters)`);
              console.log(`   ⚠️ Could not parse as JSON: ${parseError.message}`);
            }
          }
        });
      } else {
        console.log('No schema documents found for this API.');
      }
    } catch (error) {
      console.log(`⚠️ Could not fetch schema: ${error.message}`);
    }
    
    // Get API products
    console.log('\n📦 ASSOCIATED PRODUCTS:');
    console.log('=======================');
    
    try {
      const apiProducts = client.apiProduct.listByApis(resourceGroupName, serviceName, apiId);
      const productList = [];
      
      for await (const product of apiProducts) {
        productList.push(product);
      }
      
      if (productList.length > 0) {
        console.log(`📊 Products using this API: ${productList.length}\n`);
        
        productList.forEach((product, index) => {
          console.log(`${index + 1}. 📦 ${product.displayName || product.name}`);
          console.log(`   🆔 Product ID: ${product.name}`);
          console.log(`   📝 Description: ${product.description || 'No description'}`);
          console.log(`   📊 State: ${product.state || 'Unknown'}`);
          console.log('');
        });
      } else {
        console.log('This API is not associated with any products.');
      }
    } catch (error) {
      console.log(`⚠️ Could not fetch associated products: ${error.message}`);
    }
    
    console.log('\n✅ API details retrieved successfully!');
    
  } catch (error) {
    console.error('❌ Error getting API details:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check that the API ID exists');
    console.error('   2. Verify Azure credentials (.env file)');
    console.error('   3. Ensure proper permissions for the service principal');
    console.error('   4. Check if the API ID is correct (case-sensitive)');
  }
}

// Get API ID from command line arguments or use default
const apiId = process.argv[2] || 'swagger-petstore';

console.log(`🎯 Getting details for API: ${apiId}\n`);
getAPIDetails(apiId);