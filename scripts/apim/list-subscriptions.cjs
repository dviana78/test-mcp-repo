const { ApiManagementClient } = require('@azure/arm-apimanagement');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

async function listSubscriptions() {
    console.log('📋 Listing All API Subscriptions');
    console.log('================================\n');

    try {
        // Authentication
        console.log('🔐 Authenticating with Azure...');
        const credential = new DefaultAzureCredential();
        const client = new ApiManagementClient(credential, process.env.AZURE_SUBSCRIPTION_ID);
        
        const resourceGroupName = process.env.AZURE_APIM_RESOURCE_GROUP;
        const serviceName = process.env.AZURE_APIM_SERVICE_NAME;
        
        console.log(`🎯 Target APIM: ${serviceName} in ${resourceGroupName}\n`);

        // Get all subscriptions
        console.log('📋 Fetching all subscriptions...');
        const subscriptions = await client.subscription.list(resourceGroupName, serviceName);
        
        const subscriptionsArray = [];
        for await (const subscription of subscriptions) {
            subscriptionsArray.push(subscription);
        }

        console.log(`📊 Found ${subscriptionsArray.length} subscriptions\n`);

        // List each subscription with details
        for (let i = 0; i < subscriptionsArray.length; i++) {
            const subscription = subscriptionsArray[i];
            
            console.log(`${i + 1}. 🔑 ${subscription.displayName || subscription.name}`);
            console.log('=' .repeat(50));
            console.log(`🆔 ID: ${subscription.name}`);
            console.log(`📊 State: ${subscription.state}`);
            console.log(`📦 Scope: ${subscription.scope}`);
            console.log(`📅 Created: ${subscription.createdDate ? new Date(subscription.createdDate).toLocaleString() : 'N/A'}`);
            console.log(`📅 Start Date: ${subscription.startDate ? new Date(subscription.startDate).toLocaleString() : 'N/A'}`);
            console.log(`📅 End Date: ${subscription.endDate ? new Date(subscription.endDate).toLocaleString() : 'Never expires'}`);
            console.log(`🔍 Allow Tracing: ${subscription.allowTracing}`);
            
            // Try to get subscription keys
            console.log('\n🔑 Subscription Keys:');
            try {
                const listKeysResponse = await client.subscription.listSecrets(
                    resourceGroupName,
                    serviceName,
                    subscription.name
                );
                
                console.log(`   🔐 Primary Key: ${listKeysResponse.primaryKey || 'Not available'}`);
                console.log(`   🔐 Secondary Key: ${listKeysResponse.secondaryKey || 'Not available'}`);
                
                // Show usage example
                if (listKeysResponse.primaryKey) {
                    console.log('\n📝 Usage Example:');
                    console.log(`   Header: Ocp-Apim-Subscription-Key: ${listKeysResponse.primaryKey}`);
                    console.log(`   Query: ?subscription-key=${listKeysResponse.primaryKey}`);
                }
                
            } catch (keyError) {
                console.log(`   ⚠️ Could not retrieve keys: ${keyError.message}`);
            }
            
            console.log('\n');
        }

        // Summary by state
        console.log('📊 SUMMARY BY STATE:');
        console.log('====================');
        const stateCount = {};
        subscriptionsArray.forEach(sub => {
            stateCount[sub.state] = (stateCount[sub.state] || 0) + 1;
        });

        Object.entries(stateCount).forEach(([state, count]) => {
            console.log(`${state}: ${count} subscriptions`);
        });

        console.log(`\n🎯 Total subscriptions: ${subscriptionsArray.length}`);
        console.log('✅ Subscriptions listing completed!');

    } catch (error) {
        console.error('❌ Error listing subscriptions:', error);
        
        if (error.statusCode) {
            console.error(`🔍 HTTP Status: ${error.statusCode}`);
        }
        
        if (error.message) {
            console.error(`💬 Error Details: ${error.message}`);
        }

        process.exit(1);
    }
}

// Run the function
listSubscriptions();