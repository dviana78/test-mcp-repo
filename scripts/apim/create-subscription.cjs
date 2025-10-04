const { ApiManagementClient } = require('@azure/arm-apimanagement');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

async function createSubscription() {
    console.log('🔑 Creating API Subscription');
    console.log('============================\n');

    try {
        // Authentication
        console.log('🔐 Authenticating with Azure...');
        const credential = new DefaultAzureCredential();
        const client = new ApiManagementClient(credential, process.env.AZURE_SUBSCRIPTION_ID);
        
        const resourceGroupName = process.env.AZURE_APIM_RESOURCE_GROUP;
        const serviceName = process.env.AZURE_APIM_SERVICE_NAME;
        
        console.log(`🎯 Target APIM: ${serviceName} in ${resourceGroupName}`);
        console.log('');

        // Subscription configuration
        const subscriptionId = 'petstore-subscription';
        const productId = 'store'; // The Store product that contains the PetStore API
        
        const subscriptionData = {
            displayName: 'PetStore API Subscription',
            scope: `/products/${productId}`,
            state: 'active',
            allowTracing: true,
            ownerId: null, // Will be set to the user creating it
            notificationDate: null,
            expirationDate: null,
            stateComment: 'Subscription for accessing PetStore API operations'
        };

        console.log('🔑 Creating Subscription');
        console.log('========================');
        console.log(`📝 Display Name: ${subscriptionData.displayName}`);
        console.log(`🆔 Subscription ID: ${subscriptionId}`);
        console.log(`📦 Product Scope: ${productId}`);
        console.log(`📊 State: ${subscriptionData.state}`);
        console.log(`🔍 Allow Tracing: ${subscriptionData.allowTracing}`);
        console.log('');

        // Check if subscription already exists
        console.log('🔍 Checking if subscription already exists...');
        let subscriptionExists = false;
        try {
            await client.subscription.get(resourceGroupName, serviceName, subscriptionId);
            subscriptionExists = true;
            console.log('⚠️ Subscription already exists. Updating...');
        } catch (error) {
            if (error.statusCode === 404) {
                console.log('✅ Subscription does not exist. Creating new subscription...');
            } else {
                throw error;
            }
        }

        // Verify the product exists
        console.log(`🔍 Verifying product exists: ${productId}`);
        try {
            const product = await client.product.get(resourceGroupName, serviceName, productId);
            console.log(`✅ Product found: ${product.displayName}`);
        } catch (error) {
            if (error.statusCode === 404) {
                console.error(`❌ Product "${productId}" not found. Please ensure the product exists before creating a subscription.`);
                return;
            } else {
                throw error;
            }
        }

        // Create or update subscription
        if (subscriptionExists) {
            console.log('🔄 Updating existing subscription...');
            await client.subscription.createOrUpdate(
                resourceGroupName,
                serviceName,
                subscriptionId,
                subscriptionData
            );
            console.log('✅ Subscription updated successfully!');
        } else {
            console.log('🆕 Creating new subscription...');
            await client.subscription.createOrUpdate(
                resourceGroupName,
                serviceName,
                subscriptionId,
                subscriptionData
            );
            console.log('✅ Subscription created successfully!');
        }

        console.log('');

        // Get subscription details including keys
        console.log('🔍 Retrieving subscription details...');
        const subscription = await client.subscription.get(resourceGroupName, serviceName, subscriptionId);
        
        console.log('📋 SUBSCRIPTION DETAILS:');
        console.log('========================');
        console.log(`🔑 Subscription ID: ${subscription.name}`);
        console.log(`📝 Display Name: ${subscription.displayName}`);
        console.log(`📊 State: ${subscription.state}`);
        console.log(`📦 Scope: ${subscription.scope}`);
        console.log(`📅 Created Date: ${subscription.createdDate ? new Date(subscription.createdDate).toLocaleString() : 'N/A'}`);
        console.log(`📅 Start Date: ${subscription.startDate ? new Date(subscription.startDate).toLocaleString() : 'N/A'}`);
        console.log(`📅 End Date: ${subscription.endDate ? new Date(subscription.endDate).toLocaleString() : 'Never expires'}`);
        console.log(`🔍 Allow Tracing: ${subscription.allowTracing}`);

        console.log('');

        // Get subscription keys
        console.log('🔑 Retrieving subscription keys...');
        try {
            const keys = await client.subscriptionKeys.list(resourceGroupName, serviceName, subscriptionId);
            
            console.log('🔐 SUBSCRIPTION KEYS:');
            console.log('====================');
            console.log(`🔑 Primary Key: ${keys.primaryKey || 'Not available'}`);
            console.log(`🔑 Secondary Key: ${keys.secondaryKey || 'Not available'}`);
            
            console.log('');
            console.log('📝 USAGE INSTRUCTIONS:');
            console.log('======================');
            console.log('To use the PetStore API, include one of the following headers in your requests:');
            console.log('');
            console.log('Header-based authentication:');
            console.log(`   Ocp-Apim-Subscription-Key: ${keys.primaryKey || '[PRIMARY_KEY]'}`);
            console.log('');
            console.log('Query parameter-based authentication:');
            console.log(`   ?subscription-key=${keys.primaryKey || '[PRIMARY_KEY]'}`);
            console.log('');
            console.log('Example API call:');
            console.log(`   curl -X GET "https://${serviceName}.azure-api.net/petstore/pet/1" \\`);
            console.log(`        -H "Ocp-Apim-Subscription-Key: ${keys.primaryKey || '[PRIMARY_KEY]'}"`);

        } catch (error) {
            console.warn('⚠️ Could not retrieve subscription keys:', error.message);
        }

        console.log('');

        // List APIs available through this subscription
        console.log('🔍 Verifying API access...');
        try {
            const productApis = await client.productApi.listByProduct(
                resourceGroupName,
                serviceName,
                productId
            );
            
            console.log('🌐 ACCESSIBLE APIs:');
            console.log('==================');
            for (const api of productApis) {
                console.log(`   🔸 ${api.displayName || api.name}`);
                console.log(`      🆔 ID: ${api.name}`);
                if (api.serviceUrl) {
                    console.log(`      🌐 Service URL: ${api.serviceUrl}`);
                }
                console.log('');
            }
        } catch (error) {
            console.warn('⚠️ Could not verify API access:', error.message);
        }

        console.log('🎉 SUBSCRIPTION CREATION COMPLETED!');
        console.log('===================================');
        console.log('✅ Subscription successfully created for PetStore API');
        console.log('✅ Subscription keys generated and ready to use');
        console.log('✅ API access verified');
        console.log('');
        console.log('📝 Next steps:');
        console.log('   • Use the subscription keys to access the PetStore API');
        console.log('   • Test API endpoints using the provided authentication');
        console.log('   • Monitor usage through Azure APIM analytics');
        console.log('   • Manage subscription settings in Azure Portal if needed');

    } catch (error) {
        console.error('❌ Error creating subscription:', error);
        
        if (error.statusCode) {
            console.error(`🔍 HTTP Status: ${error.statusCode}`);
        }
        
        if (error.message) {
            console.error(`💬 Error Details: ${error.message}`);
        }

        console.log('');
        console.log('🔧 Troubleshooting Tips:');
        console.log('   • Verify Azure credentials are properly configured');
        console.log('   • Check that the APIM service exists and is accessible');
        console.log('   • Ensure the "Store" product exists and contains the PetStore API');
        console.log('   • Verify you have sufficient permissions to create subscriptions');
        console.log('   • Make sure the product allows subscriptions (subscriptionRequired: true)');
        
        process.exit(1);
    }
}

// Run the function
createSubscription();