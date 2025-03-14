# Alkanes Metashrew API Functions

The following are the available view functions and RPC methods that can be called through the Metashrew service. These functions are essential for building the Alkanes Explorer.

## Core Alkanes Functions

1. **simulate**
   - Purpose: Simulates execution of Alkanes smart contracts
   - Input: MessageContextParcel (contains transaction data, calldata, etc.)
   - Output: SimulateResponse (execution result and gas used)
   - Use case: Simulate contract execution for token transfers, contract calls, etc.

2. **multisimulate** ⚠️
   - Purpose: Simulates multiple contract executions in a single call
   - Input: Array of MessageContextParcels
   - Output: Array of execution results
   - Use case: Batch simulation for efficiency
   - Implementation note: Not in the alkanes_* namespace yet, must be called with direct protobuf encoding via metashrew_view
   - Range analysis: Can efficiently process ranges of Alkanes in chunks (e.g., [2, 0] -> [2, 1000])

3. **trace**
   - Purpose: Gets detailed execution trace for a transaction
   - Input: OutPoint (transaction ID and output index)
   - Output: Binary trace data
   - Use case: Show detailed contract execution for debugging/analysis

4. **traceblock** ⚠️
   - Purpose: Gets execution traces for all transactions in a block
   - Input: Block height
   - Output: Binary trace data for all transactions
   - Use case: Block-level analysis of contract executions
   - Implementation note: Not in the jsonrpc yet, must be called with direct protobuf encoding via metashrew_view

5. **alkane_inventory**
   - Purpose: Gets token holdings for an address or token
   - Input: AlkaneInventoryRequest
   - Output: AlkaneInventoryResponse
   - Use case: Show token balances for addresses or token holders

6. **call_view**
   - Purpose: Calls a view function on an Alkanes contract
   - Input: Alkane ID, inputs vector, fuel limit
   - Output: Raw response data
   - Use case: Read contract state without modifying it

7. **call_multiview**
   - Purpose: Calls multiple view functions in a single operation
   - Input: Array of Alkane IDs, array of input vectors, fuel limit
   - Output: Combined response data
   - Use case: Batch operations for efficiency

## Protorune Compatibility Functions

1. **protorunesbyaddress**
   - Purpose: Gets Alkanes tokens owned by an address
   - Input: Address (Bitcoin address)
   - Output: WalletResponse (balances and UTXOs)
   - Use case: Address page showing owned tokens

2. **protorunesbyoutpoint**
   - Purpose: Gets Alkanes tokens at a specific UTXO
   - Input: OutPoint (transaction ID and output index)
   - Output: OutpointResponse (tokens at that UTXO)
   - Use case: Transaction details showing token transfers

3. **protorunesbyheight**
   - Purpose: Gets Alkanes tokens created or transferred at a specific block height
   - Input: Block height
   - Output: RunesResponse (tokens minted/transferred)
   - Use case: Block explorer showing token activity

4. **spendablesbyaddress**
   - Purpose: Gets spendable outputs for an address
   - Input: Address
   - Output: WalletResponse (spendable outputs with tokens)
   - Use case: Wallet functionality showing spendable balances

## Legacy Runes Compatibility Functions

1. **runesbyaddress**
   - Purpose: Gets Runes tokens owned by an address (Protorunes compatibility)
   - Input: Address
   - Output: WalletResponse
   - Use case: Address page showing owned tokens (for Runes compatibility)

2. **runesbyoutpoint**
   - Purpose: Gets Runes tokens at a specific UTXO (Protorunes compatibility)
   - Input: OutPoint
   - Output: OutpointResponse
   - Use case: Transaction details for Runes compatibility

3. **runesbyheight**
   - Purpose: Gets Runes tokens at a specific block height (Protorunes compatibility)
   - Input: Block height
   - Output: RunesResponse
   - Use case: Block explorer for Runes compatibility

## JSON-RPC Methods

1. **sandshrew_multicall**
   - Purpose: Allows batching multiple JSON-RPC calls in a single request
   - Input: Array of calls, where each element is: ["method_name", [param1, param2, ...]]
   - Example: `["metashrew_view", ["traceblock", "0x01000000", "latest"]]`
   - Use case: Efficient data fetching, especially for block ranges

2. **metashrew_height**
   - Purpose: Returns the current height the indexer has processed up to
   - Input: None
   - Output: Current indexer height
   - Use case: Checking indexer sync status

3. **btc_getblockcount**
   - Purpose: Returns the current Bitcoin node's block height
   - Input: None
   - Output: Current Bitcoin block height
   - Use case: Comparing with metashrew_height to determine sync status

## Data Structures

Key data structures used in these API calls:

1. **MessageContextParcel**: Contains transaction data, call data, and token transfers
2. **OutPoint**: Refers to a specific UTXO (transaction ID + output index)
3. **AlkaneInventoryRequest**: Query parameters for token inventory requests
4. **AlkaneId**: Identifier for an Alkanes token or contract
5. **ExtendedCallResponse**: Result of a contract call including return data and events

## Special Implementation Notes

### Protobuf Handling

Functions marked with ⚠️ require direct protobuf handling:

1. **Direct metashrew_view Calls**: Functions like `multisimulate` and `traceblock` are not in the alkanes_* namespace and must be called directly using protobuf encoding.

2. **TypeScript Implementation**: 
   - For TypeScript implementations, refer to `alkanes/src.ts/rpc.ts` for protobuf handling patterns
   - The alkanes_* namespace functions essentially translate between the binary protobuf format and JSON

3. **Rust Implementation**: 
   - For Rust implementations, check the alkanes-rs codebase for implementation details

### Range Analysis with multisimulate

The `multisimulate` function enables efficient processing of ranges of Alkanes:

```typescript
// Example of analyzing a range of 1000 Alkanes
const startId = 0;
const batchSize = 1000;
const alkaneRequests = [];

for (let i = startId; i < startId + batchSize; i++) {
  alkaneRequests.push({
    alkaneId: [2, i], // Format: [type, index]
    params: [] // Any parameters needed
  });
}

// Encode using protobuf (implementation depends on your protobuf library)
const encodedRequest = encodeMultisimulateRequest(alkaneRequests);

// Call via metashrew_view directly
const response = await rpcClient.call("metashrew_view", ["multisimulate", encodedRequest, "latest"]);
// Decode response using protobuf
const decodedResponse = decodeMultisimulateResponse(response);
```

## Calling Pattern

To call standard functions via the Metashrew JSON-RPC API:

```json
{
  "jsonrpc": "2.0",
  "method": "metashrew_view", 
  "params": ["<FUNCTION_NAME>", "<HEX_ENCODED_INPUT>", "latest"],
  "id": 1
}
```

For example, to call the `alkane_inventory` function:

```json
{
  "jsonrpc": "2.0",
  "method": "metashrew_view",
  "params": ["alkane_inventory", "0x01000000...", "latest"],
  "id": 1
}
```

For batch calls using `sandshrew_multicall`:

```json
{
  "jsonrpc": "2.0",
  "method": "sandshrew_multicall",
  "params": [
    [
      ["metashrew_view", ["traceblock", "0x01000000", "latest"]],
      ["metashrew_height", []],
      ["btc_getblockcount", []]
    ]
  ],
  "id": 1
}
```

## Implementation Strategies

### Block Range Processing
Using `sandshrew_multicall`, we can pull a complete trace of all Alkanes activity for a range of blocks with a single RPC call:

```javascript
const startBlock = 880000; // Alkanes genesis block
const endBlock = 880010;
const calls = [];

for (let height = startBlock; height <= endBlock; height++) {
  // Convert height to hex
  const heightHex = "0x" + height.toString(16).padStart(8, '0');
  calls.push(["metashrew_view", ["traceblock", heightHex, "latest"]]);
}

const response = await rpcClient.call("sandshrew_multicall", [calls]);
```

### Sync Status Monitoring
We can determine the indexer's sync status by comparing the results of `metashrew_height` and `btc_getblockcount`:

```javascript
const indexerHeight = await rpcClient.call("metashrew_height", []);
const nodeHeight = await rpcClient.call("btc_getblockcount", []);
const blocksRemaining = nodeHeight - indexerHeight;
const syncPercentage = (indexerHeight / nodeHeight) * 100;
```

### Alkane Range Analysis
Using `multisimulate` to analyze ranges of Alkanes in chunks:

```javascript
async function analyzeAlkaneRange(startId, count, chunkSize = 1000) {
  const results = [];
  
  for (let i = 0; i < count; i += chunkSize) {
    const currentChunkSize = Math.min(chunkSize, count - i);
    const chunk = await getAlkaneChunk(startId + i, currentChunkSize);
    results.push(...chunk);
  }
  
  return results;
}

async function getAlkaneChunk(startId, size) {
  // Implementation depends on your protobuf handling
  const requests = Array.from({length: size}, (_, i) => ({
    alkaneId: [2, startId + i],
    params: [] 
  }));
  
  // Encode, call, and decode as per your protobuf implementation
  // ...
}
```

## GraphQL Integration Strategy

For the Alkanes Explorer, we'll create a GraphQL schema that maps to these view functions, providing:

1. Type-safe interfaces for all data structures
2. Efficient queries combining multiple view calls when needed
3. Automatic conversion of binary/protobuf responses to JSON
4. Pagination for large result sets
5. Caching for frequently accessed data
6. Efficient batching using DataLoader pattern with sandshrew_multicall
7. Protobuf handling for direct metashrew_view calls to specialized functions
