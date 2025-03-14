# Runestone Visualizer Quickstart Guide

This guide will help you get started with Runestone Visualizer quickly, whether you're setting up for development or just want to explore the features.

## Prerequisites

- Node.js v16.0.0 or higher
- npm v7.0.0 or higher
- Git

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/runestone-visualizer.git
cd runestone-visualizer
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**

Copy the example environment file and configure it:

```bash
cp .EXAMPLE.env .env
```

Edit the `.env` file to set your configuration (the default values should work for most cases):

```
PORT=3000
METASHREW_API_URL=https://mainnet.sandshrew.io/v2/lasereyes
# NOTE: We've found that the API works better WITHOUT the Sandshrew Project ID
# SANDSHREW_PROJECT_ID=your_project_id
```

4. **Build the project**

```bash
npm run build
```

5. **Start the server**

```bash
npm start
```

The server should now be running at [http://localhost:3000](http://localhost:3000)

## Development Mode

For development with hot-reloading of TypeScript files:

```bash
npm run dev
```

## Key Features

### API Method Testing

The main feature of Runestone Visualizer is the ability to test and explore various API methods:

1. Access the API Methods section from the homepage
2. Select a specific method (e.g., `trace`, `metashrew_height`, etc.)
3. Use the endpoint toggle to switch between local and production endpoints
4. Enter test parameters and execute API calls
5. View formatted results and example code

### Visualization Capabilities

For supported methods, Runestone Visualizer provides interactive visualizations:

1. Explore trace data with 3D visualizations
2. View transaction flows and token transfers
3. Analyze block data with interactive charts
4. Export visualizations for documentation

## Adding a New API Method Page

To add documentation for a new API method:

1. Copy the template file:
```bash
cp src/public/api-methods/template.html src/public/api-methods/your-method-name.html
```

2. Edit the new file and replace placeholder values:
   - `[METHOD_NAME]` with your method name
   - `[METHOD_DESCRIPTION]` with a description
   - `[METHOD_TYPE]` with the type (e.g., "View Function")
   - `[JSON_RPC_METHOD]` with the actual JSON-RPC method name
   - `[VIEW_FUNCTION]` with the view function name if applicable
   - Other placeholder parameters as needed

3. Add the method to the sidebar navigation in all HTML files (or use a build script to update all files)

4. Add necessary JavaScript for any interactive features

## Common API Methods

Here are some commonly used API methods to get started:

### Core Blockchain Data

- **metashrew_height**: Get the current indexer height
- **btc_getblockcount**: Get the current Bitcoin node height
- **sandshrew_multicall**: Batch multiple method calls

### Alkanes Functions

- **trace**: Get detailed execution trace for a transaction
- **simulate**: Simulate execution of Alkanes smart contracts
- **alkane_inventory**: Get token holdings for an address or token

### Protorune Functions

- **protorunesbyaddress**: Get Alkanes tokens owned by an address
- **protorunesbyoutpoint**: Get Alkanes tokens at a specific UTXO
- **protorunesbyheight**: Get tokens created/transferred at a specific height

## Next Steps

Once you're familiar with the basic functionality, consider exploring:

1. The [API integration documentation](../memory-bank/metashrew-api-examples.md) for detailed examples
2. The [CONTRIBUTING.md](../CONTRIBUTING.md) guide if you want to contribute to the project
3. The [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide if you encounter any issues

## Best Practices

1. **API Requests**:
   - Always follow the exact JSON-RPC format
   - Don't include the `X-Sandshrew-Project-ID` header
   - Use fixed IDs (0, 1) instead of timestamps

2. **Error Handling**:
   - Implement proper error catching for API calls
   - Add fallbacks when primary API methods fail
   - Parse string responses with `parseInt()` when needed

3. **Security**:
   - Store API keys and credentials in `.env` files
   - Never hardcode sensitive information
   - Use the server proxy for API requests from client-side

## Need Help?

- Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Look at the [Memory Bank](../memory-bank/) for detailed documentation
- Submit an issue on GitHub if you encounter a bug
