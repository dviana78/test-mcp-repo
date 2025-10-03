#!/usr/bin/env node

/**
 * Azure APIM APIs Simulator
 * This script simulates Azure APIM responses to demonstrate functionality
 */

console.log('🎭 SIMULATION MODE - Azure APIM MCP Server');
console.log('=====================================\n');

// Simulated APIs that you might have in your Azure APIM
const simulatedAPIs = [
  {
    id: 'petstore-api',
    name: 'petstore-api',
    displayName: 'Petstore API',
    description: 'This is a sample server Petstore server.',
    path: '/petstore',
    protocols: ['https'],
    serviceUrl: 'https://petstore.swagger.io/v2',
    apiVersion: 'v2',
    subscriptionRequired: true,
    type: 'http',
    isCurrent: true,
    isOnline: true
  },
  {
    id: 'weather-api',
    name: 'weather-api',
    displayName: 'Weather Forecast API',
    description: 'API to get weather information',
    path: '/weather',
    protocols: ['https'],
    serviceUrl: 'https://api.openweathermap.org/data/2.5',
    apiVersion: 'v2.5',
    subscriptionRequired: true,
    type: 'http',
    isCurrent: true,
    isOnline: true
  },
  {
    id: 'users-api',
    name: 'users-api',
    displayName: 'Users Management API',
    description: 'API for user management',
    path: '/users',
    protocols: ['https'],
    serviceUrl: 'https://your-backend.azurewebsites.net/api',
    apiVersion: 'v1',
    subscriptionRequired: false,
    type: 'http',
    isCurrent: true,
    isOnline: true
  },
  {
    id: 'orders-api',
    name: 'orders-api',
    displayName: 'Orders Processing API',
    description: 'API for order processing',
    path: '/orders',
    protocols: ['https', 'http'],
    serviceUrl: 'https://orders-service.internal.com',
    apiVersion: 'v1.2',
    subscriptionRequired: true,
    type: 'http',
    isCurrent: true,
    isOnline: false
  },
  {
    id: 'analytics-api',
    name: 'analytics-api',
    displayName: 'Analytics & Reporting API',
    description: 'API for data analytics and reporting',
    path: '/analytics',
    protocols: ['https'],
    serviceUrl: 'https://analytics.company.com/api/v3',
    apiVersion: 'v3.0',
    subscriptionRequired: true,
    type: 'http',
    isCurrent: true,
    isOnline: true
  }
];

console.log('📋 Available APIs in your Azure APIM (simulated):');
console.log('================================================\n');

simulatedAPIs.forEach((api, index) => {
  const status = api.isOnline ? '🟢 Online' : '🔴 Offline';
  const subscription = api.subscriptionRequired ? '🔐 Requires subscription' : '🔓 Open access';
  
  console.log(`${index + 1}. ${api.displayName}`);
  console.log(`   📍 ID: ${api.id}`);
  console.log(`   📝 Description: ${api.description}`);
  console.log(`   🌐 Path: ${api.path}`);
  console.log(`   📡 Protocols: ${api.protocols.join(', ')}`);
  console.log(`   🔗 Service URL: ${api.serviceUrl}`);
  console.log(`   📊 Version: ${api.apiVersion}`);
  console.log(`   ${status}`);
  console.log(`   ${subscription}`);
  console.log('   ─────────────────────────────────────────');
});

console.log(`\n📊 Summary:`);
console.log(`   Total APIs: ${simulatedAPIs.length}`);
console.log(`   Online APIs: ${simulatedAPIs.filter(api => api.isOnline).length}`);
console.log(`   APIs with subscription: ${simulatedAPIs.filter(api => api.subscriptionRequired).length}`);

console.log('\n🔧 To see your real APIs:');
console.log('1. Configure correct credentials in .env');
console.log('2. Run: node test-apim-apis.js');
console.log('3. Or use MCP tools from VS Code');

console.log('\n💡 Available tools in MCP Server:');
console.log('   • list_apis - List all APIs');
console.log('   • get_api - Get details of a specific API');
console.log('   • create_api_version - Create new API version');
console.log('   • create_api_revision - Create new API revision');
console.log('   • list_api_revisions - List revisions of an API');