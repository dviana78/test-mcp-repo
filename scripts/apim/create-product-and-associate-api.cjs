const { ApiManagementClient } = require('@azure/arm-apimanagement');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

async function createProductAndAssociateAPI() {
    console.log('🏪 Creating Product and Associating API');
    console.log('=====================================\n');

    try {
        // Authentication
        console.log('🔐 Authenticating with Azure...');
        const credential = new DefaultAzureCredential();
        const client = new ApiManagementClient(credential, process.env.AZURE_SUBSCRIPTION_ID);
        
        const resourceGroupName = process.env.AZURE_APIM_RESOURCE_GROUP;
        const serviceName = process.env.AZURE_APIM_SERVICE_NAME;
        
        console.log(`🎯 Target APIM: ${serviceName} in ${resourceGroupName}`);
        console.log('');

        // Product configuration
        const productId = 'store';
        const apiId = 'swagger-petstore';
        
        const productData = {
            displayName: 'Store',
            description: 'Store product for pet store operations and management. Includes APIs for managing pets, orders, and inventory.',
            state: 'published',
            subscriptionRequired: true,
            approvalRequired: false,
            subscriptionsLimit: 100,
            terms: 'Terms of use for Store APIs. By using these APIs, you agree to follow the usage guidelines and respect rate limits.'
        };

        console.log('🏪 Creating Product: Store');
        console.log('==========================');
        console.log(`📝 Display Name: ${productData.displayName}`);
        console.log(`🆔 Product ID: ${productId}`);
        console.log(`📋 Description: ${productData.description}`);
        console.log(`🔒 Subscription Required: ${productData.subscriptionRequired}`);
        console.log(`✅ Approval Required: ${productData.approvalRequired}`);
        console.log(`📊 State: ${productData.state}`);
        console.log(`📈 Subscriptions Limit: ${productData.subscriptionsLimit}`);
        console.log('');

        // Check if product already exists
        console.log('🔍 Checking if product already exists...');
        let productExists = false;
        try {
            await client.product.get(resourceGroupName, serviceName, productId);
            productExists = true;
            console.log('⚠️ Product "Store" already exists. Updating...');
        } catch (error) {
            if (error.statusCode === 404) {
                console.log('✅ Product does not exist. Creating new product...');
            } else {
                throw error;
            }
        }

        // Create or update product
        if (productExists) {
            console.log('🔄 Updating existing product...');
            await client.product.createOrUpdate(
                resourceGroupName,
                serviceName,
                productId,
                productData
            );
            console.log('✅ Product updated successfully!');
        } else {
            console.log('🆕 Creating new product...');
            await client.product.createOrUpdate(
                resourceGroupName,
                serviceName,
                productId,
                productData
            );
            console.log('✅ Product created successfully!');
        }

        console.log('');

        // Check if API exists
        console.log(`🔍 Verifying API exists: ${apiId}`);
        try {
            const api = await client.api.get(resourceGroupName, serviceName, apiId);
            console.log(`✅ API found: ${api.displayName}`);
        } catch (error) {
            if (error.statusCode === 404) {
                console.error(`❌ API "${apiId}" not found. Please ensure the API exists before associating it with the product.`);
                return;
            } else {
                throw error;
            }
        }

        // Associate API with Product
        console.log('');
        console.log('🔗 Associating API with Product');
        console.log('================================');
        console.log(`🔗 Associating API "${apiId}" with Product "${productId}"`);

        try {
            await client.productApi.createOrUpdate(
                resourceGroupName,
                serviceName,
                productId,
                apiId
            );
            console.log('✅ API successfully associated with product!');
        } catch (error) {
            if (error.message && error.message.includes('already exists')) {
                console.log('ℹ️ API is already associated with this product.');
            } else {
                throw error;
            }
        }

        console.log('');

        // Verify association
        console.log('🔍 Verifying association...');
        try {
            const productApis = await client.productApi.listByProduct(
                resourceGroupName,
                serviceName,
                productId
            );
            
            console.log('📋 APIs associated with Store product:');
            for (const api of productApis) {
                console.log(`   🔸 ${api.name} (${api.id})`);
            }
        } catch (error) {
            console.warn('⚠️ Could not verify association:', error.message);
        }

        console.log('');
        console.log('🎉 OPERATION COMPLETED SUCCESSFULLY!');
        console.log('====================================');
        console.log('✅ Product "Store" created/updated');
        console.log('✅ API "swagger-petstore" associated with product');
        console.log('');
        console.log('📝 Next steps:');
        console.log('   • You can now create subscriptions to the Store product');
        console.log('   • Users can subscribe to access the Swagger Petstore API');
        console.log('   • Monitor usage through Azure APIM analytics');

    } catch (error) {
        console.error('❌ Error creating product or associating API:', error);
        
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
        console.log('   • Ensure the API "swagger-petstore" exists in APIM');
        console.log('   • Verify you have sufficient permissions in Azure APIM');
        
        process.exit(1);
    }
}

// Run the function
createProductAndAssociateAPI();