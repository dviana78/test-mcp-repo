// Test simple del servidor MCP
import 'dotenv/config';

console.log('Probando inicialización...');
console.log('Variables de entorno cargadas:');
console.log('AZURE_TENANT_ID:', process.env.AZURE_TENANT_ID ? 'Configurado' : 'No configurado');
console.log('AZURE_CLIENT_ID:', process.env.AZURE_CLIENT_ID ? 'Configurado' : 'No configurado');
console.log('AZURE_SUBSCRIPTION_ID:', process.env.AZURE_SUBSCRIPTION_ID ? 'Configurado' : 'No configurado');

try {
    const { getAzureConfig } = await import('../../dist/config/azure.js');
    const config = getAzureConfig();
    console.log('✅ Configuración de Azure cargada correctamente');
} catch (error) {
    console.error('❌ Error al cargar configuración de Azure:', error.message);
}