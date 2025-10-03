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

### Step 5: Verify Connection
1. Open the Command Palette (`Ctrl + Shift + P`)
2. Search for MCP-related commands
3. Or use GitHub Copilot with `@azure-apim`

## 🧪 Verify It Works

### Method 1: Command Palette
1. `Ctrl + Shift + P`
2. Search for "MCP" or "Model Context Protocol"
3. You should see your server listed

### Method 2: GitHub Copilot Chat
In Copilot chat, try:
```
@azure-apim list all APIs
```

### Method 3: VS Code Logs
1. `View > Output`
2. Select "MCP" or "GitHub Copilot" in the dropdown
3. Look for messages related to your server

## 🐛 Troubleshooting

### Problem: Server doesn't appear
**Solution**: 
- Verify that the path to `dist/index.js` is correct
- Make sure the project is compiled (`npm run build`)
- Restart VS Code completely

### Problem: Permission error
**Solution**:
- Verify Azure environment variables
- Run VS Code as administrator if necessary

### Problem: Doesn't connect to Azure
**Solution**:
- Verify Azure credentials
- Test the server independently with `node test-stdio-server.js`

## 📱 Available Commands Once Configured

Once the MCP Server is running in VS Code, you'll be able to use:

- `@azure-apim list APIs` - List all APIs
- `@azure-apim get API swagger-petstore` - Get API details
- `@azure-apim create version for star-wars-api` - Create new version
- `@azure-apim list revisions for star-wars-api` - List revisions

## ✅ Final Confirmation

Your MCP Server will be correctly configured when:
1. There are no errors in VS Code logs
2. GitHub Copilot recognizes the `@azure-apim` prefix
3. You can execute commands and receive responses from Azure APIM