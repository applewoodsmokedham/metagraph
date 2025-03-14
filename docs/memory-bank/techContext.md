# Technical Context

## Technology Stack

### Frontend
- **HTML/CSS/JavaScript**: Core web technologies
- **Minimal CSS Framework**: Custom lightweight styling without external dependencies
- **Vanilla JavaScript**: No frontend frameworks used for simplicity

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web server framework
- **TypeScript**: Static typing for better code quality
- **Axios**: HTTP client for API requests

### API Integration
- **Metashrew API**: Bitcoin indexer and smart contract execution environment
- **JSON-RPC 2.0**: Protocol for calling API methods

## Development Setup

### Required Environment Variables
```
BITCOIN_RPC_URL=http://localhost:8332
BITCOIN_RPC_USER=user
BITCOIN_RPC_PASSWORD=password
METASHREW_API_URL=https://mainnet.sandshrew.io/v2/lasereyes
PORT=3000
```

### Important: No Project ID
The application MUST NOT use any Sandshrew Project ID. API calls work better without authentication.

### Local Development
1. Install dependencies: `npm install`
2. Build TypeScript: `npm run build`
3. Start server: `npm start`
4. Access application at: `http://localhost:3000`

## Technical Constraints

### API Connection
- Metashrew API requires specific JSON-RPC format:
  ```javascript
  {
    "method": "method_name",
    "params": [],
    "id": 0,
    "jsonrpc": "2.0"
  }
  ```
- Field order matters for compatibility
- Use fixed request IDs (0, 1, etc.) rather than timestamps
- Only include `Content-Type: application/json` header

### Response Handling
- `metashrew_height` returns a string that must be parsed to a number
- Account for metashrew_height typically being 1 block ahead of btc_getblockcount
- Implement proper error handling with fallbacks when primary API methods fail

## Dependencies
- No external UI frameworks to maintain simplicity
- Axios for HTTP requests
- Express for server routing
- TypeScript for type safety

## Technical Debt / Known Issues
- No test suite implemented yet
- Manual error handling for each API endpoint
- Limited caching of API responses
