# Azure APIM APIs Domain Analysis Scripts

This folder contains scripts for analyzing and categorizing Azure API Management (APIM) APIs by business domains using Azure CLI.

## Available Scripts

### 📋 analyze-apis-simple-en.js
**English version** - Simple and fast API domain analysis script

**Features:**
- ✅ Connects directly to Azure CLI
- ✅ Categorizes APIs by business domain
- ✅ Shows current vs revision APIs
- ✅ Displays comprehensive statistics
- ✅ Fast execution with minimal dependencies

**Usage:**
```bash
node scripts/apim/analyze-apis-simple-en.js
```

### 📋 analyze-apis-by-domain-en.js
**English version** - Advanced API domain analysis script

**Features:**
- ✅ Full Azure CLI integration with spawn processes
- ✅ Detailed categorization and statistics
- ✅ Exports results to JSON report
- ✅ Architecture layer analysis
- ✅ Top domains ranking

**Usage:**
```bash
node scripts/apim/analyze-apis-by-domain-en.js
```

### 📋 analyze-apis-by-domain.js
**Spanish version** - Versión en español del análisis avanzado

## Business Domain Categories

The scripts organize APIs into the following business domains:

| Domain | Description | Icon |
|--------|-------------|------|
| **Artificial Intelligence & Chatbots** | AI services, chatbots, GPT integration, automated translation | 🤖 |
| **Business Intelligence & Analytics** | PowerBI, DAX queries, Cosmos DB, data analytics | 📊 |
| **Store Management & Retail** | ITEK, Retail-J, TPV6, store operations, shop floor | 🏪 |
| **Salesforce Integration** | Salesforce APIs (REST, Bulk, PubSub), CRM integration | 🔗 |
| **SAP & Financial Systems** | SAP integration, Blackline, payroll, financial APIs | 💰 |
| **Documents & VIS2SAP** | Document management, VIS integration | 🧾 |
| **Infrastructure & Configuration** | Kafka, system configuration, infrastructure APIs | ⚙️ |
| **Customer Experience & Clienteling** | Customer-facing APIs, clienteling solutions | 🎯 |
| **Loyalty & Vouchers** | Loyalty programs, voucher management | 🎁 |
| **Data Processing (Kafka)** | Message processing, event streaming | 🔄 |
| **Demo & Testing APIs** | Swagger Petstore, testing APIs | 📄 |
| **System APIs** | General system APIs, internal services | 🔧 |

## Prerequisites

1. **Azure CLI** must be installed and configured
2. **Node.js** (version 14 or higher)
3. **Azure authentication** - must be logged in to Azure CLI
4. **APIM access** - proper permissions to list APIs

## Setup Instructions

1. **Authenticate with Azure CLI:**
   ```bash
   az login
   ```

2. **Select subscription:**
   ```bash
   az account set --subscription "your-subscription-id"
   ```

3. **Verify APIM access:**
   ```bash
   az apim api list --resource-group rg-duf-weu-infra-gapim-dev --service-name apim-duf-weu-infra-gapim-dev-001 --output table
   ```

4. **Run the analysis:**
   ```bash
   node scripts/apim/analyze-apis-simple-en.js
   ```

## Sample Output

```
🔍 Azure APIM APIs Analysis by Business Domains
===============================================

📡 Fetching APIs from Azure APIM...
✅ Found 202 APIs

📋 APIS GROUPED BY BUSINESS DOMAIN
==================================

🤖 Artificial Intelligence & Chatbots (46 APIs)
────────────────────────────────────────────────
  🟢 it-g-daa-ai.ext.exp.chatbot-service-assistant
     📍 Path: external/experience/it-g-daa-ai/chatbot-service-assistant
     🔄 Revision: 1 (CURRENT)
     📝 Bot service assistant ask and answers experience API.

📊 SUMMARY STATISTICS
====================
📈 Total APIs: 202
✅ Current APIs: 82
🔄 APIs with revisions: 120

📊 TOP DOMAINS WITH MOST APIs
=============================
1. 🏪 Store Management & Retail: 50 APIs
2. 🤖 Artificial Intelligence & Chatbots: 46 APIs
3. 🔧 System APIs: 32 APIs
```

## Configuration

### Environment Variables
The scripts use the following Azure configuration from Azure CLI:
- `AZURE_TENANT_ID` (from az login)
- `AZURE_SUBSCRIPTION_ID` (from az account)
- Default resource group: `rg-duf-weu-infra-gapim-dev`
- Default APIM service: `apim-duf-weu-infra-gapim-dev-001`

### Customization
To use with different APIM services, modify the Azure CLI command in the script:
```javascript
const command = 'az apim api list --resource-group YOUR-RG --service-name YOUR-APIM-SERVICE --output json';
```

## Output Legend

| Symbol | Meaning |
|--------|---------|
| 🟢 | Current API revision |
| 🔴 | Non-current API revision |
| 📍 | API Path |
| 🔄 | Revision number |
| 📝 | API Description |

## Architecture Layers

The analysis identifies the following architectural layers:
- **External (Experience)** - Customer-facing APIs
- **Internal (System)** - Core system APIs
- **Internal (Process)** - Business process APIs
- **Experience** - Experience layer APIs
- **Other Internal** - General internal APIs

## Troubleshooting

### Common Issues

1. **Azure CLI not authenticated:**
   ```bash
   az login
   ```

2. **Permission denied:**
   ```
   Error: (AuthorizationFailed) The client does not have authorization
   ```
   - Verify APIM access permissions
   - Check subscription selection

3. **APIM service not found:**
   ```
   Error: (ResourceNotFound) The Resource 'Microsoft.ApiManagement/service/...' was not found
   ```
   - Verify resource group and service name
   - Check subscription selection

4. **JSON parsing error:**
   - Ensure Azure CLI output is in JSON format
   - Check for any CLI warnings or errors

### Debug Mode
Run with verbose output for troubleshooting:
```bash
az apim api list --resource-group rg-duf-weu-infra-gapim-dev --service-name apim-duf-weu-infra-gapim-dev-001 --output json --debug
```

## Related Files

- `list-all-apis.cjs` - Basic API listing script
- `list-apim-products.js` - Product analysis script
- `test-apim-apis.js` - API testing utilities

## Version History

- **v1.0** - Initial domain analysis script
- **v1.1** - Added English version
- **v1.2** - Added simplified version for better performance
- **v1.3** - Enhanced categorization logic and statistics