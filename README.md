# METHANE

A powerful tool for decoding, analyzing, and visualizing Runestones and Protostones found in Bitcoin OP_RETURN data, with a special focus on the protocol field (0x7fff) and parsing protostones as a list of u128 values.

## Features

- **Runestone Decoding**: Parses OP_RETURN data to extract runestones, specifically identifying the protocol field with tag 0x7fff
- **Protocol Analysis**: Identifies and categorizes protocol data, with special handling for Alkanes protocol ID 1
- **Multiple Visualization Methods**:
  - Raw data display for in-depth technical analysis
  - Canvas-based visualization for static representations
  - Interactive WebGL visualization using Three.js
- **Block Exploration**: Browse the latest Bitcoin blocks or search for specific blocks to find runestones
- **Metashrew Integration**: Uses the Metashrew API to fetch additional data about Alkanes tokens
- **API Explorer**: Interactive testing interface for all Metashrew API methods
- **Endpoint Toggle**: Easy switching between local and production endpoints
- **API Status Monitor**: Real-time display of node and indexer heights with sync status

## Prerequisites

- Node.js v16+
- Access to a Bitcoin full node with RPC enabled (optional for local endpoint)
- Metashrew API access (production endpoint available by default)

## Setup

1. Clone this repository
2. Create a `.env` file based on `.EXAMPLE.env` with your configuration
3. Install dependencies:

```bash
cd METHANE
npm install
```

4. Compile TypeScript:

```bash
npm run build
```

5. Start the server:

```bash
npm start
```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

### Block Navigation

- Click "Latest Block" to fetch the most recent Bitcoin block and analyze it for runestones
- Enter a specific block height and click "Fetch Block" to analyze that block
- Click "Fetch Last 10 Blocks" to analyze multiple blocks at once

### API Explorer

- Navigate to API Directory to see all available methods
- Test API methods directly in the browser with the interactive form
- Switch between local and production endpoints using the toggle

### Visualization

Switch between different visualization tabs:

1. **Raw Data**: View the complete JSON data for technical analysis
2. **Canvas**: Static visualization that highlights protocol fields and protostones
3. **WebGL**: Interactive 3D visualization of the runestone data

### Runestone Selection

Click on any runestone in the list to view its detailed information and visualizations.

## Configuration

Edit the `.env` file to configure:

- Bitcoin RPC connection details
- Metashrew API URL
- Server port

## API Best Practices

When interacting with the Metashrew API:

1. **Header Requirements**:
   - ONLY include `Content-Type: application/json`
   - DO NOT include `X-Sandshrew-Project-ID` header (works better without it)

2. **Request Format**:
   - Use this exact field order: `method`, `params`, `id`, `jsonrpc`
   - Always use simple numerical IDs (e.g., 0, 1) instead of timestamps
   - Example:
     ```json
     {
       "method": "metashrew_height",
       "params": [],
       "id": 0,
       "jsonrpc": "2.0"
     }
     ```

3. **Response Handling**:
   - Parse `metashrew_height` responses with `parseInt()` (returns strings)
   - Implement proper error handling with fallbacks
   - Use `sandshrew_multicall` for batch operations when possible

## Development

- `npm run dev`: Start the server in development mode with hot reloading
- `npm run build`: Compile TypeScript to JavaScript
- `npm run lint`: Check code quality
- `npm test`: Run tests

## API Endpoints

- `/api/latest-block`: Get the latest block with decoded runestones
- `/api/block/:height`: Get a specific block with decoded runestones
- `/api/blocks/:start/:count`: Get a range of blocks with decoded runestones
- `/api/protorunes/:height`: Get Alkanes tokens at a specific block height
- `/api/sync-status`: Get Metashrew indexer sync status
- `/api/visualize/:txid/:vout`: Get a canvas visualization for a specific runestone
- `/api/visualize-block/:height`: Get a canvas visualization for a block summary

## Memory Bank

The project includes a comprehensive memory bank in the `memory-bank/` directory that documents:
- Technical patterns and implementation details
- API integration best practices
- Project architecture and design decisions
- Progress tracking and current status

## License

MIT License
