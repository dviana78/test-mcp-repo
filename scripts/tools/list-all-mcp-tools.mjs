console.log('🔧 ALL AVAILABLE MCP TOOLS');
console.log('==========================');
console.log('');

const tools = [
  {
    name: 'list_apis',
    description: 'List all APIs in Azure API Management',
    params: ['filter', 'top', 'skip'],
    required: []
  },
  {
    name: 'get_api',
    description: 'Get details of a specific API by ID',
    params: ['apiId'],
    required: ['apiId']
  },
  {
    name: 'create_api_version',
    description: 'Create a new version of an existing API',
    params: ['apiId', 'versionId', 'displayName', 'description', 'sourceApiId', 'versioningScheme', 'versionQueryName', 'versionHeaderName'],
    required: ['apiId', 'versionId', 'displayName']
  },
  {
    name: 'list_api_versions',
    description: 'List all versions of a specific API',
    params: ['apiId'],
    required: ['apiId']
  },
  {
    name: 'create_api_revision',
    description: 'Create a new revision of an existing API',
    params: ['apiId', 'apiRevision', 'description', 'sourceApiRevision'],
    required: ['apiId']
  },
  {
    name: 'list_api_revisions',
    description: 'List all revisions of a specific API',
    params: ['apiId'],
    required: ['apiId']
  },
  {
    name: 'get_api_operations',
    description: 'Get all operations for a specific API',
    params: ['apiId'],
    required: ['apiId']
  },
  {
    name: 'get_api_products',
    description: 'Get all products that include a specific API',
    params: ['apiId'],
    required: ['apiId']
  },
  {
    name: 'create_api_from_yaml',
    description: 'Create a new API from a YAML/OpenAPI contract with optional versioning',
    params: ['apiId', 'displayName', 'description', 'path', 'serviceUrl', 'yamlContract', 'protocols', 'subscriptionRequired', 'initialVersion', 'versioningScheme', 'versionQueryName', 'versionHeaderName'],
    required: ['apiId', 'displayName', 'yamlContract']
  },
  {
    name: 'list_backends',
    description: 'List all backend services in Azure API Management',
    params: ['filter', 'top', 'skip'],
    required: []
  },
  {
    name: 'create_grpc_api_from_proto',
    description: 'Create a new gRPC API from a Protobuf definition file with optional versioning',
    params: ['apiId', 'displayName', 'description', 'path', 'serviceUrl', 'protoDefinition', 'protocols', 'subscriptionRequired', 'initialVersion', 'versioningScheme', 'versionQueryName', 'versionHeaderName'],
    required: ['apiId', 'displayName', 'protoDefinition']
  },
  {
    name: 'list_products',
    description: 'List all products in Azure API Management',
    params: ['filter', 'top', 'skip'],
    required: []
  },
  {
    name: 'get_product',
    description: 'Get details of a specific product by ID',
    params: ['productId'],
    required: ['productId']
  },
  {
    name: 'create_product',
    description: 'Create a new product in Azure API Management',
    params: ['productId', 'displayName', 'description', 'subscriptionRequired', 'approvalRequired', 'state'],
    required: ['productId', 'displayName']
  },
  {
    name: 'add_api_to_product',
    description: 'Add an API to a product',
    params: ['productId', 'apiId'],
    required: ['productId', 'apiId']
  },
  {
    name: 'list_subscriptions',
    description: 'List all subscriptions in Azure API Management',
    params: ['filter', 'top', 'skip'],
    required: []
  },
  {
    name: 'create_subscription',
    description: 'Create a new subscription for a product',
    params: ['subscriptionId', 'displayName', 'productId', 'userId', 'primaryKey', 'secondaryKey', 'state'],
    required: ['subscriptionId', 'displayName', 'productId']
  },
  {
    name: 'get_subscription',
    description: 'Get details of a specific subscription by ID',
    params: ['subscriptionId'],
    required: ['subscriptionId']
  }
];

console.log(`📊 Total available tools: ${tools.length}`);
console.log('');

// Group tools by category
const categories = {
  'API Management': ['list_apis', 'get_api', 'create_api_from_yaml', 'get_api_operations', 'get_api_products'],
  'API Versioning': ['create_api_version', 'list_api_versions', 'create_api_revision', 'list_api_revisions'],
  'gRPC Services': ['create_grpc_api_from_proto'],
  'Backend Services': ['list_backends'],
  'Product Management': ['list_products', 'get_product', 'create_product', 'add_api_to_product'],
  'Subscription Management': ['list_subscriptions', 'create_subscription', 'get_subscription']
};

Object.entries(categories).forEach(([category, toolNames], categoryIndex) => {
  console.log(`${categoryIndex + 1}. 📂 ${category}`);
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  toolNames.forEach((toolName, toolIndex) => {
    const tool = tools.find(t => t.name === toolName);
    if (tool) {
      console.log(`   ${categoryIndex + 1}.${toolIndex + 1} 🛠️  ${tool.name}`);
      console.log(`        📝 ${tool.description}`);
      if (tool.params.length > 0) {
        console.log(`        📥 Parameters: ${tool.params.join(', ')}`);
      }
      if (tool.required.length > 0) {
        console.log(`        ⚠️  Required: ${tool.required.join(', ')}`);
      }
      console.log('');
    }
  });
});

console.log('🔍 TOOLS BY FUNCTIONALITY:');
console.log('===========================');
console.log('');

console.log('🌐 API MANAGEMENT:');
console.log('   • list_apis - List all APIs');
console.log('   • get_api - Get specific API details');
console.log('   • create_api_from_yaml - Create API from YAML/OpenAPI contract');
console.log('   • get_api_operations - Get API operations');
console.log('   • get_api_products - Get products that include an API');
console.log('');

console.log('🔄 API VERSIONING:');
console.log('   • create_api_version - Create new API version');
console.log('   • list_api_versions - List API versions');
console.log('   • create_api_revision - Create API revision');
console.log('   • list_api_revisions - List API revisions');
console.log('');

console.log('⚡ gRPC SERVICES:');
console.log('   • create_grpc_api_from_proto - Create gRPC API from Protobuf');
console.log('');

console.log('🔗 BACKEND SERVICES:');
console.log('   • list_backends - List backend services');
console.log('');

console.log('📦 PRODUCT MANAGEMENT:');
console.log('   • list_products - List products');
console.log('   • get_product - Get product details');
console.log('   • create_product - Create new product');
console.log('   • add_api_to_product - Add API to product');
console.log('');

console.log('🎫 SUBSCRIPTION MANAGEMENT:');
console.log('   • list_subscriptions - List subscriptions');
console.log('   • create_subscription - Create new subscription');
console.log('   • get_subscription - Get subscription details');
console.log('');

console.log('💡 USAGE EXAMPLES:');
console.log('==================');
console.log('');
console.log('1. 📋 List all APIs:');
console.log('   Tool: list_apis');
console.log('   Parameters: { "top": 50 }');
console.log('');
console.log('2. 🔍 Get API details:');
console.log('   Tool: get_api');
console.log('   Parameters: { "apiId": "weather-api" }');
console.log('');
console.log('3. ✨ Create new API version:');
console.log('   Tool: create_api_version');
console.log('   Parameters: {');
console.log('     "apiId": "weather-api",');
console.log('     "versionId": "v2",');
console.log('     "displayName": "Weather API v2"');
console.log('   }');
console.log('');
console.log('4. 📄 Create API from OpenAPI:');
console.log('   Tool: create_api_from_yaml');
console.log('   Parameters: {');
console.log('     "apiId": "new-api",');
console.log('     "displayName": "New API",');
console.log('     "yamlContract": "openapi: 3.0.0..."');
console.log('   }');
console.log('');

console.log('🎯 CURRENT CONFIGURATION:');
console.log('==========================');
console.log('• Azure APIM Service: apim-dviana78-dev');
console.log('• Available APIs: 8');
console.log('• MCP Tools: 18');
console.log('• Specialized Services: 7');
console.log('');

console.log('🔚 Listing completed - All MCP tools are available!');