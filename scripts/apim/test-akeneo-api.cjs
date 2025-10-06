#!/usr/bin/env node

/**
 * Test Akeneo Automated Translation API
 * Tests the batch translation functionality
 */

const https = require('https');
require('dotenv').config();

console.log('🌐 Testing Akeneo Automated Translation API');
console.log('===========================================\n');

// Configuration
const config = {
  baseUrl: 'https://dev-api.dufry.com',
  apiPath: '/external/exp-akeneo/it-g-daa-ai/automated-translation/v1',
  orgId: process.env.AKENEO_ORG_ID || 'test-org-001', // Default test org ID
  subscriptionKey: process.env.APIM_SUBSCRIPTION_KEY,
  correlationId: generateUUID()
};

// Sample test data
const testTranslations = {
  context: "E-commerce product descriptions",
  callbackBaseUrl: "https://webhook.site/test-callback", // Test callback URL
  translations: [
    {
      text: "Welcome to our store! How can we help you today?",
      sourceLanguage: "en",
      targets: [
        {
          translationId: "msg-001-es",
          targetLanguage: "es-es"
        },
        {
          translationId: "msg-001-fr", 
          targetLanguage: "fr"
        },
        {
          translationId: "msg-001-de",
          targetLanguage: "de"
        }
      ]
    },
    {
      text: "Thank you for your purchase. Your order has been confirmed.",
      sourceLanguage: "en",
      targets: [
        {
          translationId: "msg-002-es",
          targetLanguage: "es-es"
        },
        {
          translationId: "msg-002-it",
          targetLanguage: "it"
        }
      ]
    },
    {
      text: "Free shipping on orders over $50",
      sourceLanguage: "en",
      targets: [
        {
          translationId: "promo-001-es",
          targetLanguage: "es-es"
        },
        {
          translationId: "promo-001-fr",
          targetLanguage: "fr"
        }
      ]
    }
  ]
};

/**
 * Generate a UUID for correlation ID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Make HTTP request to the API
 */
function makeRequest(path, method, data, headers) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.baseUrl + path);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-correlation-id': config.correlationId,
        ...headers
      }
    };

    if (config.subscriptionKey) {
      options.headers['Ocp-Apim-Subscription-Key'] = config.subscriptionKey;
    }

    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        const response = {
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: responseBody,
          data: null
        };
        
        try {
          if (responseBody) {
            response.data = JSON.parse(responseBody);
          }
        } catch (e) {
          // Response might not be JSON
        }
        
        resolve(response);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test the batch translation endpoint
 */
async function testBatchTranslation() {
  try {
    console.log('📤 Testing POST /organizations/{orgId}/batch/translations');
    console.log('=' .repeat(60));
    
    const endpoint = `${config.apiPath}/organizations/${config.orgId}/batch/translations`;
    
    console.log(`🎯 Endpoint: ${config.baseUrl}${endpoint}`);
    console.log(`🔑 Correlation ID: ${config.correlationId}`);
    console.log(`🏢 Organization ID: ${config.orgId}`);
    
    if (config.subscriptionKey) {
      console.log(`🔐 Using subscription key: ${config.subscriptionKey.substring(0, 8)}...`);
    } else {
      console.log('⚠️  No subscription key provided. Request may fail.');
    }
    
    console.log('\n📋 Test Payload:');
    console.log(JSON.stringify(testTranslations, null, 2));
    
    console.log('\n🚀 Sending request...\n');
    
    const response = await makeRequest(endpoint, 'POST', testTranslations);
    
    console.log('📥 Response Details:');
    console.log('=' .repeat(40));
    console.log(`Status: ${response.statusCode} ${response.statusMessage}`);
    console.log(`Content-Type: ${response.headers['content-type'] || 'Not specified'}`);
    
    if (response.headers['location']) {
      console.log(`Location: ${response.headers['location']}`);
    }
    
    // Analyze response based on status code
    switch (response.statusCode) {
      case 202:
        console.log('\n✅ SUCCESS: Translation request accepted!');
        console.log('🔄 The translation process has been initiated asynchronously.');
        console.log('📞 A callback will be sent to the specified URL when complete.');
        break;
        
      case 400:
        console.log('\n❌ BAD REQUEST: Invalid request format');
        if (response.data) {
          console.log('Error details:', JSON.stringify(response.data, null, 2));
        }
        break;
        
      case 401:
        console.log('\n🔒 UNAUTHORIZED: Authentication failed');
        console.log('💡 Check your subscription key or authentication settings');
        break;
        
      case 403:
        console.log('\n🚫 FORBIDDEN: Insufficient permissions');
        console.log('💡 Verify your subscription has access to this API');
        break;
        
      case 404:
        console.log('\n🔍 NOT FOUND: Organization or endpoint not found');
        console.log(`💡 Check if organization ID "${config.orgId}" exists`);
        break;
        
      case 429:
        console.log('\n⏱️ RATE LIMITED: Too many requests');
        console.log('💡 Wait a moment and try again');
        break;
        
      case 500:
        console.log('\n💥 INTERNAL SERVER ERROR: Server-side issue');
        break;
        
      case 503:
        console.log('\n🔧 SERVICE UNAVAILABLE: Temporary service issue');
        break;
        
      default:
        console.log(`\n❓ UNEXPECTED RESPONSE: ${response.statusCode}`);
    }
    
    if (response.body) {
      console.log('\n📄 Response Body:');
      console.log(response.body);
    }
    
    // Translation summary
    console.log('\n📊 Translation Summary:');
    console.log('=' .repeat(30));
    console.log(`Total texts to translate: ${testTranslations.translations.length}`);
    
    const totalTargets = testTranslations.translations.reduce((sum, trans) => sum + trans.targets.length, 0);
    console.log(`Total translation targets: ${totalTargets}`);
    
    const languages = new Set();
    testTranslations.translations.forEach(trans => {
      languages.add(trans.sourceLanguage);
      trans.targets.forEach(target => languages.add(target.targetLanguage));
    });
    console.log(`Languages involved: ${Array.from(languages).join(', ')}`);
    
  } catch (error) {
    console.error('\n💥 Error testing API:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 Network issue: Cannot reach the API endpoint');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Connection refused: Service may be down');
    }
  }
}

/**
 * Display configuration and help
 */
function displayConfig() {
  console.log('⚙️ Configuration:');
  console.log('================');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`API Path: ${config.apiPath}`);
  console.log(`Organization ID: ${config.orgId}`);
  console.log(`Subscription Key: ${config.subscriptionKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`Correlation ID: ${config.correlationId}`);
  console.log('');
}

/**
 * Show help information
 */
function showHelp() {
  console.log('🧪 Akeneo API Tester');
  console.log('===================\n');
  console.log('This script tests the Akeneo automated translation API.');
  console.log('\nUsage: node test-akeneo-api.cjs [options]');
  console.log('\nOptions:');
  console.log('  --help, -h    Show this help message');
  console.log('  --config      Show current configuration');
  console.log('\nEnvironment Variables:');
  console.log('  AKENEO_ORG_ID         - Organization ID for testing (optional)');
  console.log('  APIM_SUBSCRIPTION_KEY - Your APIM subscription key (required)');
  console.log('\nExample .env file:');
  console.log('  AKENEO_ORG_ID=your-org-id');
  console.log('  APIM_SUBSCRIPTION_KEY=your-subscription-key');
  console.log('\nTest Data:');
  console.log('  • 3 English texts for translation');
  console.log('  • Target languages: Spanish, French, German, Italian');
  console.log('  • E-commerce context for better translations');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--config')) {
  displayConfig();
  process.exit(0);
}

// Run the test
async function runTest() {
  displayConfig();
  
  if (!config.subscriptionKey) {
    console.log('⚠️  WARNING: No subscription key provided!');
    console.log('💡 Set APIM_SUBSCRIPTION_KEY environment variable or the request may fail.\n');
  }
  
  await testBatchTranslation();
  
  console.log('\n🏁 Test completed!');
  console.log('\n💡 Next steps:');
  console.log('   1. Check your callback URL for translation results');
  console.log('   2. Monitor the correlation ID for request tracking');
  console.log('   3. Review API logs in Azure portal if needed');
}

runTest().catch(error => {
  console.error('💥 Test failed:', error.message);
  process.exit(1);
});