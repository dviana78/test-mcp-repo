const { ApiManagementClient } = require('@azure/arm-apimanagement');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

async function listProductAPIs() {
    console.log('🔗 Listing APIs Associated with Products');
    console.log('========================================\n');

    try {
        // Authentication
        console.log('🔐 Authenticating with Azure...');
        const credential = new DefaultAzureCredential();
        const client = new ApiManagementClient(credential, process.env.AZURE_SUBSCRIPTION_ID);
        
        const resourceGroupName = process.env.AZURE_APIM_RESOURCE_GROUP;
        const serviceName = process.env.AZURE_APIM_SERVICE_NAME;
        
        console.log(`🎯 Target APIM: ${serviceName} in ${resourceGroupName}\n`);

        // Get all products
        console.log('📦 Fetching all products...');
        const products = await client.product.listByService(resourceGroupName, serviceName);
        
        const productsArray = [];
        for await (const product of products) {
            productsArray.push(product);
        }

        console.log(`📊 Found ${productsArray.length} products\n`);

        // For each product, list associated APIs
        for (const product of productsArray) {
            console.log(`📦 Product: ${product.displayName} (${product.name})`);
            console.log('=' .repeat(50));
            
            try {
                const productApis = await client.productApi.listByProduct(
                    resourceGroupName,
                    serviceName,
                    product.name
                );

                const apisArray = [];
                for await (const api of productApis) {
                    apisArray.push(api);
                }

                if (apisArray.length > 0) {
                    console.log(`🔗 Associated APIs (${apisArray.length}):`);
                    apisArray.forEach((api, index) => {
                        console.log(`   ${index + 1}. 🔸 ${api.displayName || api.name}`);
                        console.log(`      🆔 ID: ${api.name}`);
                        if (api.description) {
                            const shortDesc = api.description.length > 100 
                                ? api.description.substring(0, 100) + '...'
                                : api.description;
                            console.log(`      📝 Description: ${shortDesc}`);
                        }
                        if (api.serviceUrl) {
                            console.log(`      🌐 Service URL: ${api.serviceUrl}`);
                        }
                        console.log('');
                    });
                } else {
                    console.log('❌ No APIs associated with this product\n');
                }
            } catch (error) {
                console.log(`⚠️ Error fetching APIs for product ${product.name}: ${error.message}\n`);
            }

            console.log('');
        }

        // Summary
        console.log('📊 SUMMARY');
        console.log('==========');
        let totalAPIs = 0;
        
        for (const product of productsArray) {
            try {
                const productApis = await client.productApi.listByProduct(
                    resourceGroupName,
                    serviceName,
                    product.name
                );

                const apisArray = [];
                for await (const api of productApis) {
                    apisArray.push(api);
                }

                console.log(`📦 ${product.displayName}: ${apisArray.length} APIs`);
                totalAPIs += apisArray.length;
            } catch (error) {
                console.log(`📦 ${product.displayName}: Error fetching APIs`);
            }
        }

        console.log(`\n🎯 Total APIs across all products: ${totalAPIs}`);
        console.log('✅ Product-API association listing completed!');

    } catch (error) {
        console.error('❌ Error listing product APIs:', error);
        
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
listProductAPIs();