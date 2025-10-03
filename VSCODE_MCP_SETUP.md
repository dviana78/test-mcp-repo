# 🚀 Guía: Añadir MCP Server tipo STDIO a VS Code

## 📋 Configuraciones Necesarias

### 1️⃣ **Configuración Local del Workspace** (Ya completada ✅)

**Archivo**: `.vscode/mcp.json`
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

### 2️⃣ **Configuración Global de VS Code**

Para que VS Code reconozca tu MCP Server globalmente, necesitas añadirlo a tu configuración de usuario:

#### **Opción A: A través de la interfaz de VS Code**
1. Abre VS Code
2. Presiona `Ctrl + Shift + P` (Cmd + Shift + P en Mac)
3. Busca "Preferences: Open User Settings (JSON)"
4. Añade esta configuración:

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

#### **Opción B: Archivo de configuración directo**
**Ubicación**: `%APPDATA%\Code\User\settings.json` (Windows)

### 3️⃣ **Para GitHub Copilot Específicamente**

Si quieres que GitHub Copilot use tu MCP Server, añade esta configuración:

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

## 🔧 Pasos para Configurar

### Paso 1: Instalar Extensiones Necesarias
```bash
# En VS Code, instala estas extensiones:
# - GitHub Copilot (si no la tienes)
# - MCP Extension (si está disponible)
```

### Paso 2: Configurar Variables de Entorno
Asegúrate de que estas variables estén configuradas en tu sistema:
```env
AZURE_SUBSCRIPTION_ID=tu-subscription-id
AZURE_RESOURCE_GROUP=tu-resource-group
AZURE_APIM_SERVICE_NAME=tu-apim-service
AZURE_CLIENT_ID=tu-client-id
AZURE_CLIENT_SECRET=tu-client-secret
AZURE_TENANT_ID=tu-tenant-id
```

### Paso 3: Construir el Proyecto
```bash
npm run build
```

### Paso 4: Reiniciar VS Code
Después de añadir la configuración, reinicia VS Code completamente.

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