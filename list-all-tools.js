const { ToolsHandler } = require('./dist/handlers/tools');
const { ApimService } = require('./dist/services/apim-service');
const { AzureClient } = require('./dist/services/azure-client');
const { Logger } = require('./dist/utils/logger');

console.log('🔧 **HERRAMIENTAS MCP DISPONIBLES EN EL AZURE APIM SERVER**\n');

try {
  // Mock dependencies for listing tools only
  const mockAzureClient = {};
  const mockLogger = new Logger('ToolLister');
  const toolHandler = new ToolsHandler(mockAzureClient, mockLogger);
  
  const tools = toolHandler.getAvailableTools();
  
  console.log(`📋 **Total de herramientas disponibles: ${tools.length}**\n`);
  
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
            console.log(`   🔴 Parámetros requeridos: ${requiredProps.join(', ')}`);
          }
          if (optionalProps.length > 0) {
            console.log(`   🔵 Parámetros opcionales: ${optionalProps.join(', ')}`);
          }
        }
      });
    }
  });
  
  // Summary
  console.log('\n\n📊 **RESUMEN POR CATEGORÍA:**');
  console.log('═'.repeat(50));
  Object.entries(categories).forEach(([category, categoryTools]) => {
    if (categoryTools.length > 0) {
      console.log(`${category.padEnd(20)} : ${categoryTools.length} tools`);
    }
  });
  
  console.log('\n🎯 **CAPACIDADES PRINCIPALES:**');
  console.log('• ✅ Gestión completa de APIs REST');
  console.log('• ✅ Soporte para APIs gRPC con Protobuf');
  console.log('• ✅ Control de versiones y revisiones');
  console.log('• ✅ Gestión de productos y subscripciones');
  console.log('• ✅ Administración de servicios backend');
  console.log('• ✅ Operaciones y endpoints de APIs');
  console.log('• ✅ Creación desde especificaciones OpenAPI/YAML');
  console.log('• ✅ Integración completa con Azure APIM');
  
} catch (error) {
  console.error('❌ Error al listar las herramientas:', error.message);
}