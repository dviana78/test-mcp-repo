# 🚀 Guide: Adding STDIO-type MCP Server to VS Code

## 📋 Required Configurations

### 1️⃣ **Local Workspace Configuration** (Already completed ✅)

**File**: `.vscode/mcp.json`
```json
{
  "mcpServers": {
    "azure-apim": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "${workspaceFolder}",
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### 2️⃣ **Global VS Code Configuration**

For VS Code to recognize your MCP Server globally, you need to add it to your user configuration:

#### **Option A: Through VS Code interface**
1. Open VS Code
2. Press `Ctrl + Shift + P` (Cmd + Shift + P on Mac)
3. Search for "Preferences: Open User Settings (JSON)"
4. Add this configuration:

```json
{
  "mcp.servers": {
    "azure-apim": {
      "type": "stdio",
      "command": "node",
      "args": ["d:/projects/MCP Server/azure-apim-mcp-server/dist/index.js"],
      "cwd": "d:/projects/MCP Server/azure-apim-mcp-server",
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

#### **Option B: Direct configuration file**
**Location**: `%APPDATA%\Code\User\settings.json` (Windows)

### 3️⃣ **For GitHub Copilot Specifically**

If you want GitHub Copilot to use your MCP Server, add this configuration:

```json
{
  "github.copilot.mcp.servers": {
    "azure-apim": {
      "type": "stdio",
      "command": "node",
      "args": ["d:/projects/MCP Server/azure-apim-mcp-server/dist/index.js"],
      "cwd": "d:/projects/MCP Server/azure-apim-mcp-server",
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## 🔧 Setup Steps

### Step 1: Install Required Extensions
```bash
# In VS Code, install these extensions:
# - GitHub Copilot (if you don't have it)
# - MCP Extension (if available)
```

### Step 2: Configure Environment Variables
Make sure these variables are configured in your system:
```env
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_RESOURCE_GROUP=your-resource-group
AZURE_APIM_SERVICE_NAME=your-apim-service
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
```

### Step 3: Build the Project
```bash
npm run build
```

### Step 4: Restart VS Code
After adding the configuration, restart VS Code completely.

### Paso 5: Verificar la Conexión
1. Abre el Command Palette (`Ctrl + Shift + P`)
2. Busca comandos relacionados con MCP
3. O usa GitHub Copilot con `@azure-apim`

## 🧪 Verificar que Funciona

### Método 1: Command Palette
1. `Ctrl + Shift + P`
2. Busca "MCP" o "Model Context Protocol"
3. Deberías ver tu servidor listado

### Método 2: GitHub Copilot Chat
En el chat de Copilot, prueba:
```
@azure-apim list all APIs
```

### Método 3: Logs de VS Code
1. `View > Output`
2. Selecciona "MCP" o "GitHub Copilot" en el dropdown
3. Busca mensajes relacionados con tu servidor

## 🐛 Troubleshooting

### Problema: Servidor no aparece
**Solución**: 
- Verifica que el path al `dist/index.js` sea correcto
- Asegúrate de que el proyecto esté compilado (`npm run build`)
- Reinicia VS Code completamente

### Problema: Error de permisos
**Solución**:
- Verifica variables de entorno de Azure
- Ejecuta VS Code como administrador si es necesario

### Problema: No se conecta a Azure
**Solución**:
- Verifica credenciales de Azure
- Prueba el servidor independientemente con `node test-stdio-server.js`

## 📱 Comandos Disponibles una vez Configurado

Una vez que el MCP Server esté funcionando en VS Code, podrás usar:

- `@azure-apim list APIs` - Lista todas las APIs
- `@azure-apim get API swagger-petstore` - Obtiene detalles de una API
- `@azure-apim create version for star-wars-api` - Crea nueva versión
- `@azure-apim list revisions for star-wars-api` - Lista revisiones

## ✅ Confirmación Final

Tu MCP Server estará correctamente configurado cuando:
1. No haya errores en los logs de VS Code
2. GitHub Copilot reconozca el prefijo `@azure-apim`
3. Puedas ejecutar comandos y recibir respuestas de Azure APIM