# Azure APIM Products Management Scripts

This directory contains scripts for managing and listing Azure API Management products.

## Scripts Available

### 1. `list-apim-products-cli.cjs`
**Fast and Simple CLI-based Product Lister**

Uses Azure CLI commands to quickly list all products in your APIM service.

**Features:**
- ✅ Fast execution using Azure CLI
- 📊 Detailed product information with status indicators
- 📈 Summary statistics and percentages
- 🎯 Color-coded output for better readability
- 💡 Built-in default values for Dufry environment

**Usage:**
```bash
node list-apim-products-cli.cjs
```

**Prerequisites:**
- Azure CLI installed and configured
- Logged into Azure (`az login`)
- Optional: Environment variables in `.env` file

### 2. `list-apim-products.cjs`
**Advanced SDK-based Product Lister**

Uses Azure SDK for more detailed product analysis and categorization.

**Features:**
- 📦 Detailed product categorization
- 🏷️ Groups products by business domain
- 📋 Comprehensive product details
- 🔍 Advanced filtering and analysis
- 📊 Category-based statistics

**Usage:**
```bash
node list-apim-products.cjs
```

**Prerequisites:**
- Azure SDK for JavaScript
- Service Principal authentication
- Environment variables configured

## Environment Variables

Create a `.env` file in the project root or export these variables:

```bash
# Required for SDK-based script
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_APIM_RESOURCE_GROUP=your-resource-group
AZURE_APIM_SERVICE_NAME=your-apim-service-name

# For Service Principal authentication (SDK script)
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
```

## Default Configuration (Dufry Environment)

The CLI script includes built-in defaults for the Dufry environment:
- **Resource Group:** `rg-duf-weu-infra-gapim-dev`
- **Service Name:** `apim-duf-weu-infra-gapim-dev-001`

## Sample Output

### Product Categories Found:
- **Integration & APIs** - Salesforce, SAP, VIS integrations
- **AI & Machine Learning** - Avolta GPT, chatbot services, automated translation
- **Business Applications** - Shop management, clienteling, payroll
- **Infrastructure & Platform** - Blob ingest, Kafka, PowerBI
- **Testing & Development** - Showcase, POC APIs

### Statistics Overview:
- **Total Products:** 16
- **Published:** 100% (all products are live)
- **Subscription Required:** 100% (all require subscriptions)
- **Approval Required:** 0% (auto-approved)

## Troubleshooting

### Common Issues:

1. **Authentication Error**
   ```bash
   az login
   ```

2. **Permission Denied**
   - Ensure your account has API Management Contributor role
   - Check subscription access

3. **Environment Variables Missing**
   - Create `.env` file with required variables
   - Or use CLI script with built-in defaults

4. **Network Issues**
   - Check VPN connection if behind corporate firewall
   - Verify Azure service endpoints are accessible

## Related Scripts

- `list-all-apis.cjs` - Lists all APIs in the APIM service
- `get-api-details.cjs` - Gets detailed information about specific APIs
- `create-subscription.cjs` - Creates new subscriptions for products

## Contributing

When adding new scripts:
1. Follow the existing naming convention
2. Include proper error handling and help text
3. Add colored console output for better UX
4. Document in this README

## Support

For issues with these scripts, check:
1. Azure CLI is up to date
2. Proper authentication
3. Network connectivity
4. Service permissions