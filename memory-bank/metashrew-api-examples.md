# Metashrew API Examples and Best Practices

This document provides comprehensive curl examples and best practices for interacting with the Metashrew API in the context of the Alkanes Explorer. These examples follow our established best practices, including not using the Sandshrew Project ID header which was found to improve reliability.

## Basic API Request Format

All Metashrew API requests must follow this exact JSON-RPC format, with fields in this specific order:

```json
{
  "method": "method_name",
  "params": [],
  "id": 0,
  "jsonrpc": "2.0"
}
```

### Key Requirements

1. **Field Order**: Always use this exact field order: `method`, `params`, `id`, `jsonrpc`
2. **Request IDs**: Use simple numerical IDs (0, 1, etc.) instead of timestamps
3. **Headers**: Only include `Content-Type: application/json` - do not include `X-Sandshrew-Project-ID`

## Curl Command Examples

### 1. Basic Height Check

Checking the current indexer height is a simple way to test API connectivity:

```bash
curl -X POST "https://mainnet.sandshrew.io/v2/lasereyes" \
  -H "Content-Type: application/json" \
  -d '{
  "method": "metashrew_height",
  "params": [],
  "id": 0,
  "jsonrpc": "2.0"
}'
```

### 2. Block Height Comparison

Checking both indexer and node heights to calculate sync status:

```bash
curl -X POST "https://mainnet.sandshrew.io/v2/lasereyes" \
  -H "Content-Type: application/json" \
  -d '{
  "method": "btc_getblockcount",
  "params": [],
  "id": 0,
  "jsonrpc": "2.0"
}'
```

### 3. Alkanes Token Query by Block Height

Get all Alkanes tokens at a specific block height:

```bash
curl -X POST "https://mainnet.sandshrew.io/v2/lasereyes" \
  -H "Content-Type: application/json" \
  -d '{
  "method": "metashrew_view",
  "params": ["protorunesbyheight", "0x123456", "latest"],
  "id": 0,
  "jsonrpc": "2.0"
}'
```

Replace `0x123456` with the hex-encoded block height.

### 4. Multicall Example

For efficiency, multiple API calls can be batched:

```bash
curl -X POST "https://mainnet.sandshrew.io/v2/lasereyes" \
  -H "Content-Type: application/json" \
  -d '{
  "method": "sandshrew_multicall",
  "params": [
    [
      ["metashrew_height", []],
      ["btc_getblockcount", []]
    ]
  ],
  "id": 0,
  "jsonrpc": "2.0"
}'
```

## API Status Monitoring

When checking API status, parse string responses correctly and handle errors:

```javascript
async function checkApiStatus() {
  try {
    // Attempt multicall first for efficiency
    const calls = [
      ['metashrew_height', []],
      ['btc_getblockcount', []]
    ];
    
    const results = await api.call('sandshrew_multicall', [calls]);
    
    // Parse string responses to integers
    const height = parseInt(results[0], 10);
    const nodeHeight = parseInt(results[1], 10);
    
    return {
      height,
      nodeHeight,
      syncPercentage: calculateSyncPercentage(height, nodeHeight)
    };
  } catch (error) {
    console.error('Multicall failed, falling back to individual calls', error);
    // Implement fallback logic for individual calls
  }
}

function calculateSyncPercentage(height, nodeHeight) {
  // The indexer might be slightly ahead of the node, which is normal
  if (height >= nodeHeight) {
    return 100;
  }
  
  return Math.floor((height / nodeHeight) * 100);
}
```

## Error Handling Strategy

When working with the Metashrew API, implement this error handling approach:

1. **Timeouts**: Set reasonable timeouts for all API calls (5-10 seconds)
2. **Retry Logic**: Implement exponential backoff for failed requests
3. **Fallbacks**: If multicall fails, fall back to individual API calls
4. **User Feedback**: Display meaningful error messages to users, not raw API errors

## Current API Status (as of March 2025)

Recent testing indicates some instability with the Metashrew API. If you encounter errors like:
- `TypeError: req.body.method.split is not a function`
- `TypeError: fetch failed`

Consider implementing the following mitigations:
1. Add a retry mechanism with increasing delays
2. Cache successful responses to reduce API load
3. Provide a graceful degradation path when the API is unavailable

## Additional Resources

For more information on available API methods, refer to the [Alkanes Metashrew API Functions](a118cf12-9b21-4b2e-b73f-d52f395b59e6) memory.
