# Script to get Azure credentials
# Run these commands in Azure CLI or PowerShell

# 1. Sign in to Azure
az login

# 2. List available subscriptions
az account list --output table

# 3. Select the correct subscription (replace SUBSCRIPTION_ID)
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# 4. Create Service Principal for MCP Server
az ad sp create-for-rbac --name "mcp-apim-server" --role "API Management Service Contributor" --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RESOURCE_GROUP

# 5. List your APIM instances
az apim list --output table

# 6. Get details of your specific APIM
az apim show --name "YOUR_APIM_NAME" --resource-group "YOUR_RESOURCE_GROUP"