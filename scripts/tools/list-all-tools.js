import { ToolsHandler } from '../../dist/handlers/tools.js';
import { Logger } from '../../dist/utils/logger.js';

console.log('🔧 **HERRAMIENTAS MCP DISPONIBLES EN EL AZURE APIM SERVER**\n');

try {
  // Mock dependencies for listing tools only
  const mockAzureClient = {};
  const mockLogger = new Logger('ToolLister');
  const toolHandler = new ToolsHandler(mockAzureClient, mockLogger);
  
  const tools = toolHandler.getAvailableTools();
  
  console.log(`📋 **Total de tools disponibles: ${tools.length}**\n`);
  
  // Group tools by category
  const categories = {
    'API Management': [],
    'API Versioning': [],
    'API Operations': [],
    'gRPC APIs': [],
    'Products': [],
    'Subscriptions': [],
    'Backend Services': []
  };
  
  tools.forEach(tool => {
    if (tool.name.includes('version') || tool.name.includes('revision')) {
      categories['API Versioning'].push(tool);
    } else if (tool.name.includes('grpc')) {
      categories['gRPC APIs'].push(tool);
    } else if (tool.name.includes('subscription')) {
      categories['Subscriptions'].push(tool);
    } else if (tool.name.includes('product')) {
      categories['Products'].push(tool);
    } else if (tool.name.includes('backend')) {
      categories['Backend Services'].push(tool);
    } else if (tool.name.includes('operation')) {
      categories['API Operations'].push(tool);
    } else {
      categories['API Management'].push(tool);
    }
  });
  
  // Display tools by category
  Object.entries(categories).forEach(([category, categoryTools]) => {
    if (categoryTools.length > 0) {
      console.log(`\n🏷️  **${category.toUpperCase()}** (${categoryTools.length} tools)`);
      console.log('─'.repeat(50));
      
      categoryTools.forEach((tool, index) => {
        console.log(`\n${index + 1}. 🔧 **${tool.name}**`);
        console.log(`   📝 ${tool.description}`);
        
        if (tool.inputSchema && tool.inputSchema.properties) {
          const props = Object.keys(tool.inputSchema.properties);
          const required = tool.inputSchema.required || [];
          const requiredProps = props.filter(p => required.includes(p));
          const optionalProps = props.filter(p => !required.includes(p));
          
          if (requiredProps.length > 0) {
            console.log(`   🔴 Required parameters: ${requiredProps.join(', ')}`);
          }
          if (optionalProps.length > 0) {
            console.log(`   🔵 Optional parameters: ${optionalProps.join(', ')}`);
          }
        }
      });
    }
  });
  
  // Summary
  console.log('\n\n📊 **SUMMARY BY CATEGORY:**');
  console.log('═'.repeat(50));
  Object.entries(categories).forEach(([category, categoryTools]) => {
    if (categoryTools.length > 0) {
      console.log(`${category.padEnd(20)} : ${categoryTools.length} tools`);
    }
  });
  
  console.log('\n🎯 **MAIN CAPABILITIES:**');
  console.log('• ✅ Complete REST API management');
  console.log('• ✅ gRPC API support with Protobuf');
  console.log('• ✅ Version control and revisions');
  console.log('• ✅ Product and subscription management');
  console.log('• ✅ Backend service administration');
  console.log('• ✅ API operations and endpoints');
  console.log('• ✅ Creation from OpenAPI/YAML specifications');
  console.log('• ✅ Complete Azure APIM integration');
  
} catch (error) {
  console.error('❌ Error listing tools:', error.message);
}