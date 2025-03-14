# Mempool.space Reference for Alkanes Explorer

This document adapts the architecture and workflows of mempool.space for our Alkanes Explorer implementation, with special focus on protorunes message handling and efficient rendering.

## System Architecture

### Core Components

Based on mempool.space's architecture, our Alkanes Explorer will consist of:

1. **Backend Services**
   - Metashrew API interface (replaces Bitcoin Core RPC)
   - Database layer (MariaDB or similar)
   - WebSocket service for real-time updates
   - Caching layer with Redis

2. **Frontend Application**
   - Next.js application with server-side rendering
   - Responsive UI with Tailwind CSS
   - D3.js for visualizations
   - WebSocket client for real-time updates

3. **API Services**
   - GraphQL layer wrapping Metashrew API
   - RESTful API endpoints for compatibility
   - Batch request handling for efficiency

## Key Workflows Adapted for Alkanes

### 1. Block Explorer

**Original mempool.space workflow**:
- Display blocks in chronological order
- Show block details (height, timestamp, transactions, size, etc.)
- Visual representation of transaction fee rates
- Links to individual transactions and addresses

**Adaptation for Alkanes**:
- Maintain similar block listing structure
- Add Alkanes-specific metrics (contract executions, token transfers)
- Integrate with `traceblock` API for execution traces
- Use SSR for initial block data to improve performance
- Show OP_RETURN data with Runestone/Protostone[] parsing for each block

```typescript
// Example Server-Side Rendering approach for blocks page
export async function getServerSideProps(context) {
  const { height } = context.params;
  const heightHex = "0x" + parseInt(height).toString(16).padStart(8, '0');
  
  // Get block data using Metashrew API
  const blockData = await metashrewClient.call("metashrew_view", 
    ["traceblock", heightHex, "latest"]);
  
  // Process and decode protobuf data
  const decodedBlockData = decodeBlockTraceData(blockData);
  
  return {
    props: {
      blockData: decodedBlockData,
      height: parseInt(height),
      timestamp: new Date().toISOString(),
    },
  };
}
```

### 2. Transaction Explorer

**Original mempool.space workflow**:
- Transaction details (inputs, outputs, fee, confirmation status)
- Visual representation of inputs/outputs
- UTXO tracking
- OP_RETURN data display
- Mempool status and fee estimation

**Adaptation for Alkanes**:
- Maintain transaction details view with Bitcoin-specific data
- Add Alkanes contract execution trace when available
- Parse OP_RETURN data looking for Runestone with Protostone[] extension
- Render the protorunes message details in a special formatted section
- Integrate with `trace` API for detailed execution information

```typescript
// Example of parsing and displaying Protostone data
function renderProtorunesData(opReturnData) {
  try {
    // Check if this is a valid Runestone with Protostone[] extension
    if (isRunestoneWithProtostone(opReturnData)) {
      const protostoneData = decodeProtostoneData(opReturnData);
      
      return (
        <div className="protostone-data">
          <h3>Protostone Data</h3>
          <div className="token-data">
            <span>Token ID: {protostoneData.id}</span>
            <span>Amount: {protostoneData.amount}</span>
            {/* Additional token data */}
          </div>
          {protostoneData.metadata && (
            <div className="metadata">
              <h4>Metadata</h4>
              <pre>{JSON.stringify(protostoneData.metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      );
    }
    return null;
  } catch (error) {
    console.error("Error parsing Protostone data", error);
    return <div className="error">Invalid Protostone data</div>;
  }
}
```

### 3. Address Explorer

**Original mempool.space workflow**:
- Address transaction history
- UTXO set and balance
- QR code generation
- Address format validation

**Adaptation for Alkanes**:
- Maintain address transaction history view
- Add Alkanes token balances section using `alkane_inventory`
- Show contracts associated with the address
- Use SSR for initial data loading and client-side rendering for updates

```typescript
// Example of fetching address data with SSR
export async function getServerSideProps(context) {
  const { address } = context.params;
  
  try {
    // Make parallel requests for efficiency
    const [addressTxs, alkaneInventory] = await Promise.all([
      // Get regular Bitcoin transactions
      metashrewClient.call("metashrew_view", ["protorunesbyaddress", address, "latest"]),
      // Get Alkanes token inventory
      metashrewClient.call("metashrew_view", ["alkane_inventory", 
        encodeAlkaneInventoryRequest({ address }), "latest"])
    ]);
    
    return {
      props: {
        address,
        transactions: decodeAddressTxs(addressTxs),
        tokens: decodeAlkaneInventory(alkaneInventory),
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error fetching address data", error);
    return { props: { error: "Failed to load address data" } };
  }
}
```

### 4. Mempool Visualization

**Original mempool.space workflow**:
- Visual representation of mempool transactions
- Fee rate tiers color-coding
- Block templates based on fee rates
- Real-time updates via WebSocket

**Adaptation for Alkanes**:
- Maintain mempool visualization with fee rate tiers
- Add section for pending Alkanes transactions/contract calls
- Display potential token transfers in pending transactions
- Use WebSockets for real-time updates of new transactions

### 5. Contract Explorer (New)

**New workflow for Alkanes**:
- List of deployed contracts with metadata
- Contract execution history
- Token issuance and transfer history
- Contract source code verification (if available)
- Interactive contract calling interface

```typescript
// Example contract page implementation
export async function getServerSideProps(context) {
  const { alkaneId } = context.params;
  
  // Fetch contract data
  const contractData = await metashrewClient.call("metashrew_view", 
    ["call_view", encodeCallViewParams(alkaneId), "latest"]);
  
  // Get recent contract executions using multisimulate or direct call
  const recentExecutions = await getRecentContractExecutions(alkaneId);
  
  return {
    props: {
      alkaneId,
      contract: decodeContractData(contractData),
      executions: recentExecutions,
      timestamp: new Date().toISOString(),
    },
  };
}
```

## OP_RETURN and Protorunes Integration

A critical element of our Alkanes Explorer will be the parsing and display of Runestone data with Protostone[] extensions in OP_RETURN outputs.

### Parsing Process

1. When encountering an OP_RETURN output:
   - Check if it contains a valid Runestone format
   - Look for Protostone[] extension in the Runestone

2. If Protostone[] is found:
   - Decode the binary data according to protorune specs
   - Display the parsed token information
   - Link to any associated contract addresses

3. Display additional execution trace data:
   - Use the `trace` API to fetch execution information
   - Render a visual representation of the contract execution
   - Show gas usage, state changes, and other execution details

### Example Implementation

```typescript
// Detect Runestone with Protostone extension in OP_RETURN
function parseOpReturn(opReturnHex) {
  // Standard Runestone detection logic
  const isRunestone = opReturnHex.startsWith('5257'); // "RW" in hex
  
  if (!isRunestone) return null;
  
  // Parse Runestone format
  const runestoneData = parseRunestone(opReturnHex);
  
  // Look for Protostone extension
  const protostoneExtension = runestoneData.extensions.find(ext => 
    ext.tag === 'Protostone[]');
  
  if (!protostoneExtension) return runestoneData;
  
  // Decode Protostone binary data
  const decodedProtostone = decodeProtostoneData(protostoneExtension.value);
  
  return {
    ...runestoneData,
    protostone: decodedProtostone
  };
}

// Component to render OP_RETURN with Protostone
function OpReturnDisplay({ txOutput }) {
  const parsedData = parseOpReturn(txOutput.scriptPubKey.hex);
  
  if (!parsedData) {
    return <div className="op-return">OP_RETURN: {txOutput.scriptPubKey.asm}</div>;
  }
  
  if (!parsedData.protostone) {
    return <div className="runestone">
      <h4>Runestone Data</h4>
      {/* Regular Runestone display */}
    </div>;
  }
  
  return (
    <div className="protostone">
      <h4>Protostone Token</h4>
      <div className="token-details">
        <div>Token ID: {parsedData.protostone.id}</div>
        <div>Operation: {parsedData.protostone.operation}</div>
        {/* Additional Protostone details */}
      </div>
      {parsedData.protostone.trace && (
        <div className="execution-trace">
          <h5>Execution Trace</h5>
          <TraceViewer trace={parsedData.protostone.trace} />
        </div>
      )}
    </div>
  );
}
```

## Server-Side Rendering (SSR) Strategy

To achieve optimal performance, we'll implement a hybrid SSR approach using Next.js:

### SSR Implementation Strategy

1. **Key pages that benefit from SSR**:
   - Home/dashboard (initial load performance)
   - Block details pages (critical path)
   - Transaction details pages (critical path)
   - Address pages (initial data load)

2. **Client-side rendering for**:
   - Real-time updates of mempool state
   - Interactive visualizations
   - User preference-dependent content
   - Low-priority information that can load after the initial render

3. **Incremental Static Regeneration (ISR) for**:
   - Static content like "About" pages
   - Historical blocks that won't change
   - Documentation pages

### Performance Optimizations

1. **API response caching**:
   - Redis-based caching layer for common API requests
   - Cache invalidation on new blocks or relevant mempool changes
   - Tiered caching strategy with different TTLs based on data type

2. **Code splitting and lazy loading**:
   - Load visualization libraries only when needed
   - Dynamically import heavy components
   - Prioritize critical path rendering

3. **Progressive data loading**:
   - Initial render with critical data via SSR
   - Load additional details client-side after initial render
   - WebSocket updates for real-time data

```typescript
// Example Next.js page with hybrid SSR/CSR approach
function BlockPage({ initialBlockData }) {
  // State for client-side updates
  const [blockData, setBlockData] = useState(initialBlockData);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  
  // Lazy-loaded components
  const AdvancedDetailsViewer = useMemo(() => 
    dynamic(() => import('../components/AdvancedDetailsViewer')), []);
  
  // WebSocket connection for updates
  useEffect(() => {
    const socket = setupBlockDataWebSocket(initialBlockData.height);
    socket.on('update', (newData) => {
      setBlockData(currentData => ({...currentData, ...newData}));
    });
    return () => socket.disconnect();
  }, [initialBlockData.height]);
  
  return (
    <div className="block-page">
      {/* Critical path content - SSR rendered */}
      <BlockHeader blockData={blockData} />
      <TransactionsList transactions={blockData.transactions} />
      
      {/* Progressive enhancement - Client side rendered */}
      {showAdvancedDetails ? (
        <AdvancedDetailsViewer blockData={blockData} />
      ) : (
        <button onClick={() => setShowAdvancedDetails(true)}>
          Show Advanced Details
        </button>
      )}
    </div>
  );
}

// Server-side rendering
export async function getServerSideProps({ params }) {
  // Fetch critical data for initial render
  const blockData = await fetchBlockData(params.height);
  
  return {
    props: {
      initialBlockData: blockData,
    },
  };
}
```

## Conclusion

By adapting the successful patterns from mempool.space while incorporating Alkanes-specific features like Protostone parsing and execution trace visualization, we can create a powerful, user-friendly explorer that provides deep insights into Alkanes contract operations and token transfers.

The use of server-side rendering with Next.js will ensure excellent performance while still providing rich, interactive features. The hybrid approach allows us to leverage the best of both server and client rendering based on the specific needs of each page and component.
