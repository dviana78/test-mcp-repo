const { spawn } = require('child_process');

console.log('🔧 Detailed Analysis of Star Wars API in APIM');
console.log('=================================================');

async function sendMcpCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn('Node', ['src/index.ts'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let ErrorOutput = '';

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            ErrorOutput += data.toString();
        });

        child.on('close', (code) => {
            try {
                // Parsear las respuestas JSON line por line
                const lines = output.split('\n').filter(line => line.trim());
                const responses = lines.map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return null;
                    }
                }).filter(Boolean);

                resolve(responses);
            } catch (Error) {
                reject(new Error(`Error parsing output: ${Error.message}\Noutput: ${output}\nError: ${ErrorOutput}`));
            }
        });

        // Enviar los comandos
        const initMessage = JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: { name: "test-client", version: "1.0.0" }
            }
        }) + '\n';

        const commandMessage = JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: method,
            params: params
        }) + '\n';

        child.stdin.write(initMessage);
        child.stdin.write(commandMessage);
        child.stdin.end();
    });
}

async function analyzeApi() {
    try {
        console.log('📡 Getting lista completa de APIs...');
        const listResponse = await sendMcpCommand('tools/call', {
            name: 'mcp_azure-apim_list_apis'
        });
        
        const apiList = listResponse.find(r => r.result?.content);
        if (apiList) {
            console.log('✅ APIs encontradas:');
            const apis = JSON.parse(apiList.result.content[0].text);
            apis.value.forEach((api, index) => {
                console.log(`   ${index + 1}. ${api.name} (ID: ${api.id})`);
                if (api.name.toLowerCase().includes('star') || api.name.toLowerCase().includes('wars')) {
                    console.log(`      🎯 Esta es nuestra API objetivo`);
                    console.log(`      📍 Path: ${api.path}`);
                    console.log(`      🌐 Service URL: ${api.serviceUrl}`);
                    console.log(`      📋 Protocols: ${api.protocols}`);
                }
            });
        }

        console.log('\n🔍 Getting detalles específicos de Star Wars API...');
        const apiResponse = await sendMcpCommand('tools/call', {
            name: 'mcp_azure-apim_get_api',
            arguments: { apiId: 'star-wars-api' }
        });

        const apiDetails = apiResponse.find(r => r.result?.content);
        if (apiDetails) {
            console.log('📋 API Details:');
            const api = JSON.parse(apiDetails.result.content[0].text);
            console.log(`   Nombre: ${api.name}`);
            console.log(`   ID: ${api.id}`);
            console.log(`   Path: ${api.path}`);
            console.log(`   Service URL: ${api.serviceUrl}`);
            console.log(`   Protocols: ${JSON.stringify(api.protocols)}`);
            console.log(`   Subscription Required: ${api.subscriptionRequired}`);
            console.log(`   Type: ${api.type}`);
            
            if (api.authenticationSettings) {
                console.log(`   Authentication: ${JSON.stringify(api.authenticationSettings)}`);
            }
        }

        console.log('\n🔧 Getting API Operations...');
        const opsResponse = await sendMcpCommand('tools/call', {
            name: 'mcp_azure-apim_get_api_operations',
            arguments: { apiId: 'star-wars-api' }
        });

        const operations = opsResponse.find(r => r.result?.content);
        if (operations) {
            console.log('⚙️ Operaciones configuradas:');
            const ops = JSON.parse(operations.result.content[0].text);
            ops.value.forEach((op, index) => {
                console.log(`   ${index + 1}. ${op.method} ${op.urlTemplate}`);
                console.log(`      Nombre: ${op.displayName}`);
                console.log(`      ID: ${op.name}`);
            });
        }

        console.log('\n💡 Análisis del Problema:');
        console.log('========================');
        console.log('Basado en la Information obtenida, el problema puede ser:');
        console.log('1. La Configuration del Service URL en APIM');
        console.log('2. Las rewrite policies de URL No están configuradas');
        console.log('3. El backend service puede estar configurado incorrectamente');
        console.log('4. Falta la Configuration de CORS o headers');

    } catch (Error) {
        console.Error('❌ Error:', Error.message);
    }
}

analyzeApi();