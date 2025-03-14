# Metashrew API Reference

## API Endpoint
```
https://mainnet.sandshrew.io/v2/lasereyes
```

## Important: No Project ID Required
The Metashrew API works **better without** the Sandshrew Project ID. Do not include any Project ID or authentication headers in requests.

## Request Format
JSON-RPC 2.0 format with specific field order:

```json
{
  "method": "method_name",
  "params": [],
  "id": 0,
  "jsonrpc": "2.0"
}
```

## Core Methods

### metashrew_height
Returns the current height of the indexer.

**Request:**
```json
{
  "method": "metashrew_height",
  "params": [],
  "id": 0,
  "jsonrpc": "2.0"
}
```

**Response:**
```json
{
  "id": 0,
  "result": "887712",
  "jsonrpc": "2.0"
}
```

**Note:** The result is returned as a string and must be parsed to a number.

### btc_getblockcount
Returns the current height of the Bitcoin node.

**Request:**
```json
{
  "method": "btc_getblockcount",
  "params": [],
  "id": 0,
  "jsonrpc": "2.0"
}
```

**Response:**
```json
{
  "result": 887711,
  "error": null,
  "id": 0
}
```

### metashrew_view
Calls a view function on the Metashrew API.

**Request:**
```json
{
  "method": "metashrew_view",
  "params": ["viewName", "hexInput", "blockTag"],
  "id": 0,
  "jsonrpc": "2.0"
}
```

**Example View Functions:**
- `simulate`: Simulate contract execution
- `trace`: Get transaction trace
- `traceblock`: Get traces for all transactions in a block
- `multisimulate`: Simulate multiple contracts at once

### sandshrew_multicall
Batches multiple RPC calls into a single request for efficiency.

**Request:**
```json
{
  "method": "sandshrew_multicall",
  "params": [
    [
      ["metashrew_height", []],
      ["btc_getblockcount", []]
    ]
  ],
  "id": 0,
  "jsonrpc": "2.0"
}
```

**Response:**
```json
{
  "id": 0,
  "result": ["887712", 887711],
  "jsonrpc": "2.0"
}
```

## Implementation Notes

### Height Relationship
- `metashrew_height` will typically be 1 block ahead of `btc_getblockcount`
- This is normal behavior as it represents the block the indexer is currently polling for

### Error Handling
- Always check for response.data.error
- Parse string responses with parseInt() when needed
- Provide fallbacks when primary methods fail

### Field Order Matters
Always arrange JSON-RPC fields in this exact order:
1. `method`
2. `params`
3. `id`
4. `jsonrpc`

### Request IDs
Use simple numerical IDs (0, 1, etc.) instead of timestamps.
