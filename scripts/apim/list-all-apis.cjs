#!/usr/bin/env node

/**
 * List all Azure APIM APIs directly using Azure SDK
 */

const { ApiManagementClient } = require('@azure/arm-apimanagement');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

console.log('🌐 Listing All Azure APIM APIs');
console.log('==============================\n');

async function listAPIs() {
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
    
    console.log('🌐 Fetching APIs...');
    const apis = client.api.listByService(resourceGroupName, serviceName);
    
    const apiList = [];
    for await (const api of apis) {
      apiList.push(api);
    }
    
    console.log(`📊 Total APIs found: ${apiList.length}\n`);
    
    if (apiList.length === 0) {
      console.log('🌐 No APIs found in the APIM service.');
      return;
    }
    
    console.log('🌐 Azure APIM APIs:');
    console.log('==================');
    
    apiList.forEach((api, index) => {
      console.log(`${index + 1}. 🌐 ${api.displayName || api.name}`);
      console.log(`   🆔 ID: ${api.name}`);
      console.log(`   📝 Description: ${api.description || 'No description'}`);
      console.log(`   🔒 Subscription Required: ${api.subscriptionRequired ? 'Yes' : 'No'}`);
      console.log(`   📊 State: ${api.state || 'Unknown'}`);
      console.log(`   🔗 Service URL: ${api.serviceUrl || 'Not specified'}`);
      console.log(`   📍 API Path: ${api.path || 'Not specified'}`);
      
      if (api.protocols && api.protocols.length > 0) {
        console.log(`   🌐 Protocols: ${api.protocols.join(', ')}`);
      }
      
      if (api.apiVersion) {
        console.log(`   🔢 Version: ${api.apiVersion}`);
      }
      
      if (api.apiVersionDescription) {
        console.log(`   📝 Version Description: ${api.apiVersionDescription}`);
      }
      
      console.log('');
    });
    
    console.log('🎯 API Summary:');
    console.log('===============');
    
    const subscriptionRequired = apiList.filter(a => a.subscriptionRequired).length;
    const protocols = {};
    const states = {};
    
    apiList.forEach(api => {
      // Count protocols
      if (api.protocols) {
        api.protocols.forEach(protocol => {
          protocols[protocol] = (protocols[protocol] || 0) + 1;
        });
      }
      
      // Count states
      states[api.state] = (states[api.state] || 0) + 1;
    });
    
    console.log(`• APIs requiring subscription: ${subscriptionRequired}`);
    console.log(`• APIs not requiring subscription: ${apiList.length - subscriptionRequired}`);
    console.log(`• Total APIs: ${apiList.length}`);
    
    console.log('\n📊 Protocol Distribution:');
    Object.entries(protocols).forEach(([protocol, count]) => {
      console.log(`   ${protocol}: ${count} APIs`);
    });
    
    console.log('\n📊 State Distribution:');
    Object.entries(states).forEach(([state, count]) => {
      console.log(`   ${state}: ${count} APIs`);
    });
    
    // Show APIs by category if we can detect patterns
    console.log('\n🏷️ API Categories:');
    const categories = {
      'Star Wars': apiList.filter(a => a.name?.toLowerCase().includes('star') || a.displayName?.toLowerCase().includes('star')),
      'Weather': apiList.filter(a => a.name?.toLowerCase().includes('weather') || a.displayName?.toLowerCase().includes('weather')),
      'gRPC': apiList.filter(a => a.protocols?.includes('grpc') || a.protocols?.includes('grpcs')),
      'REST': apiList.filter(a => a.protocols?.includes('http') || a.protocols?.includes('https')),
      'Other': apiList.filter(a => !a.name?.toLowerCase().includes('star') && !a.name?.toLowerCase().includes('weather'))
    };
    
    Object.entries(categories).forEach(([category, apis]) => {
      if (apis.length > 0) {
        console.log(`   ${category}: ${apis.length} APIs`);
        apis.forEach(api => {
          console.log(`     - ${api.displayName || api.name}`);
        });
      }
    });
    
    console.log('\n✅ APIs listing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error listing APIs:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check Azure credentials (.env file)');
    console.error('   2. Verify APIM service name and resource group');
    console.error('   3. Ensure proper permissions for the service principal');
    console.error('   4. Check if the subscription ID is correct');
  }
}

listAPIs();