# METHANE Project: Oyl SDK Integration Plan

This document outlines the implementation plan for properly integrating the Oyl SDK into the METHANE project, focusing specifically on removing mock data and ensuring real data is used throughout the application.

## Current Issues

1. **Mock Data in Provider Implementation**:
   - `provider.js` uses mock data for `checkHealth()` and `getBlockHeight()`
   - A fallback mock provider is created if initialization fails

2. **Mock Data in Alkanes Implementation**:
   - `alkanes.js` has fallback mock data in the `traceBlock` function

3. **Environment Variable Handling**:
   - Fallback to 'mock-project-id' if environment variable is not set

## Implementation Plan

### 1. Fix Provider Implementation (`methane/src/sdk/provider.js`)

#### 1.1. Update Provider Configuration

Replace the current provider implementation with a proper implementation that uses the Oyl SDK Provider without mock data:

```javascript
/**
 * Provider implementation for the METHANE application
 * 
 * This implementation uses the oyl-sdk Provider to interact with 
 * Bitcoin networks and provides a consistent interface across environments.
 */
import { Provider } from '@oyl/sdk';
import * as bitcoin from 'bitcoinjs-lib';

// Define network configurations for our application
const networks = {
  mainnet: {
    url: 'https://mainnet.sandshrew.io',
    version: 'v2',
    projectId: import.meta.env.VITE_SANDSHREW_PROJECT_ID || 'lasereyes',
    network: bitcoin.networks.bitcoin,
    networkType: 'mainnet'
  },
  
  regtest: {
    url: 'http://localhost:18888',
    projectId: 'regtest',
    network: bitcoin.networks.regtest,
    networkType: 'regtest',
    version: 'v1'
  },
  
  oylnet: {
    url: 'https://oylnet.oyl.gg',
    version: 'v2',
    projectId: 'oylnet',
    network: bitcoin.networks.testnet,
    networkType: 'testnet'
  }
};

/**
 * Get a provider instance for the specified environment
 * This wraps the oyl-sdk Provider with our application-specific functionality
 * 
 * @param {string} network - Network name ('mainnet', 'regtest', 'oylnet')
 * @returns {Provider} Provider instance configured for the specified network
 */
const getProvider = (network = 'regtest') => {
  const config = networks[network] || networks.regtest;
  
  try {
    // Create an instance of the oyl-sdk Provider with our configuration
    const provider = new Provider(config);
    
    // Add application-specific methods to the provider
    provider.checkHealth = async () => {
      try {
        // Use the provider's sandshrew client to check if the node is responsive
        const blockCount = await provider.sandshrew.bitcoindRpc.getBlockCount();
        return blockCount > 0;
      } catch (error) {
        console.error(`Provider health check failed:`, error);
        return false;
      }
    };
    
    // Use the actual provider to get block height
    provider.getBlockHeight = async () => {
      try {
        // Use the provider's sandshrew client to get the current block height
        return await provider.sandshrew.bitcoindRpc.getBlockCount();
      } catch (error) {
        console.warn(`Failed to get block height:`, error);
        throw new Error(`Failed to get block height: ${error.message || 'Unknown error'}`);
      }
    };
    
    return provider;
  } catch (error) {
    console.error(`Failed to create provider for ${network}:`, error);
    throw new Error(`Failed to create provider for ${network}: ${error.message || 'Unknown error'}`);
  }
};

export default getProvider;
```

Key changes:
- Remove fallback to 'mock-project-id' and use 'lasereyes' as default if env var is not set
- Implement `checkHealth()` to actually check if the node is responsive
- Implement `getBlockHeight()` to get the actual block height from the node
- Remove the mock provider fallback and throw an error instead

### 2. Fix Alkanes Implementation (`methane/src/sdk/alkanes.js`)

#### 2.1. Update Trace Transaction Function

```javascript
/**
 * Traces a transaction, showing the execution of a smart contract
 * @param {string} txid - Transaction ID to trace
 * @param {string|number} blockHeight - Block height where transaction was confirmed
 * @param {number} vout - Output index (default: 0)
 * @param {string} endpoint - API endpoint to use ('regtest', 'mainnet', 'oylnet')
 * @returns {Promise<Object>} - Trace results
 */
export const traceTransaction = async (txid, blockHeight, vout = 0, endpoint = 'regtest') => {
  try {
    const provider = getProvider(endpoint);
    console.log(`Tracing transaction ${txid} at height ${blockHeight} with ${endpoint} endpoint`);
    
    // Use the oyl-sdk Provider to trace the transaction
    const result = await provider.alkanes.trace({ txid, vout });
    
    return {
      status: "success",
      message: "Trace completed",
      txid,
      blockHeight,
      steps: result.steps || []
    };
  } catch (error) {
    console.error('Error tracing transaction:', error);
    return {
      status: "error",
      message: error.message || "Unknown error",
      txid,
      blockHeight
    };
  }
};
```

#### 2.2. Update Simulate Transaction Function

```javascript
/**
 * Simulates a transaction to preview the outcome
 * @param {Object} params - Simulation parameters
 * @param {string} endpoint - API endpoint to use ('regtest', 'mainnet', 'oylnet')
 * @returns {Promise<Object>} - Simulation results
 */
export const simulateTransaction = async (params, endpoint = 'regtest') => {
  try {
    const provider = getProvider(endpoint);
    console.log(`Simulating transaction with ${endpoint} endpoint`, params);
    
    // Use the oyl-sdk Provider to simulate the transaction
    const result = await provider.alkanes.simulate(params);
    
    return {
      status: "success",
      message: "Simulation completed",
      txid: params.txid,
      results: result
    };
  } catch (error) {
    console.error('Error simulating transaction:', error);
    return {
      status: "error",
      message: error.message || "Unknown error"
    };
  }
};
```

#### 2.3. Update Trace Block Function

Replace the current implementation with one that doesn't use mock data:

```javascript
/**
 * Traces all transactions in a block
 * @param {string|number} blockHeight - Block height to trace
 * @param {string} endpoint - API endpoint to use ('regtest', 'mainnet', 'oylnet')
 * @returns {Promise<Object>} - TraceBlock results
 */
export const traceBlock = async (blockHeight, endpoint = 'regtest') => {
  try {
    const provider = getProvider(endpoint);
    console.log(`Tracing block at height ${blockHeight} with ${endpoint} endpoint`);
    
    // First get all the transactions in the block
    // We'll need to use the Sandshrew client to get block information
    const blockHash = await provider.sandshrew.bitcoindRpc.getBlockHash(blockHeight);
    const blockInfo = await provider.sandshrew.bitcoindRpc.getBlock(blockHash, 2); // Verbosity 2 gets full tx info
    
    if (!blockInfo || !blockInfo.tx) {
      throw new Error(`Block information not available for height ${blockHeight}`);
    }
    
    // For better performance, limit the number of transactions to process if needed
    const transactions = blockInfo.tx.slice(0, 20); // Process up to 20 transactions for demo
    
    return {
      status: "success",
      message: "Block trace completed",
      blockHeight,
      blockHash: blockInfo.hash,
      timestamp: blockInfo.time,
      transactions: transactions.map(tx => ({
        txid: tx.txid || tx.hash,
        status: "pending" // Initial status before tracing
      }))
    };
  } catch (error) {
    console.error('Error tracing block:', error);
    
    // Instead of returning mock data, return an error response
    return {
      status: "error",
      message: error.message || "Unknown error",
      blockHeight
    };
  }
};
```

Key changes:
- Remove mock data fallback in the catch block
- Return a proper error response instead

### 3. Additional Methods to Implement

#### 3.1. Get Alkanes By Address

```javascript
/**
 * Gets all Alkanes owned by a specific address
 * @param {string} address - Bitcoin address to query
 * @param {string} endpoint - API endpoint to use ('regtest', 'mainnet', 'oylnet')
 * @returns {Promise<Object>} - Alkanes owned by the address
 */
export const getAlkanesByAddress = async (address, endpoint = 'regtest') => {
  try {
    const provider = getProvider(endpoint);
    console.log(`Getting Alkanes for address ${address} with ${endpoint} endpoint`);
    
    // Use the oyl-sdk Provider to get Alkanes by address
    const result = await provider.alkanes.getAlkanesByAddress({
      address,
      protocolTag: '1'
    });
    
    return {
      status: "success",
      message: "Alkanes retrieved",
      address,
      alkanes: result
    };
  } catch (error) {
    console.error('Error getting Alkanes by address:', error);
    return {
      status: "error",
      message: error.message || "Unknown error",
      address
    };
  }
};
```

#### 3.2. Get Alkanes By Height

```javascript
/**
 * Gets all Alkanes at a specific block height
 * @param {number} height - Block height to query
 * @param {string} endpoint - API endpoint to use ('regtest', 'mainnet', 'oylnet')
 * @returns {Promise<Object>} - Alkanes at the specified height
 */
export const getAlkanesByHeight = async (height, endpoint = 'regtest') => {
  try {
    const provider = getProvider(endpoint);
    console.log(`Getting Alkanes at height ${height} with ${endpoint} endpoint`);
    
    // Use the oyl-sdk Provider to get Alkanes by height
    const result = await provider.alkanes.getAlkanesByHeight({
      height,
      protocolTag: '1'
    });
    
    return {
      status: "success",
      message: "Alkanes retrieved",
      height,
      alkanes: result
    };
  } catch (error) {
    console.error('Error getting Alkanes by height:', error);
    return {
      status: "error",
      message: error.message || "Unknown error",
      height
    };
  }
};
```

### 4. Environment Configuration

#### 4.1. Create .env Template

Create a `.env.template` file in the project root with the following content:

```
# Sandshrew API Configuration
VITE_SANDSHREW_PROJECT_ID=lasereyes
```

#### 4.2. Update Vite Configuration

Ensure the Vite configuration properly handles environment variables:

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Add Node.js polyfills for Bitcoin libraries
    nodePolyfills({
      // Whether to polyfill specific globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports
      protocolImports: true,
    }),
  ],
  define: {
    // Ensure process.env is properly handled
    'process.env': process.env,
  }
})
```

## Testing Plan

After implementing these changes, test the application with the following steps:

1. **Test Provider Initialization**:
   - Verify that the provider is properly initialized for each network
   - Verify that the `checkHealth()` method returns the actual health status
   - Verify that the `getBlockHeight()` method returns the actual block height

2. **Test Alkanes Methods**:
   - Test `traceTransaction` with a valid transaction ID
   - Test `simulateTransaction` with valid parameters
   - Test `traceBlock` with a valid block height
   - Test `getAlkanesByAddress` with a valid address
   - Test `getAlkanesByHeight` with a valid height

3. **Test Error Handling**:
   - Verify that errors are properly handled and returned
   - Verify that no mock data is returned in error cases

## Implementation Notes

1. **Error Handling**:
   - All methods should catch errors and return a structured error response
   - No mock data should be returned in error cases

2. **Logging**:
   - Add appropriate logging to help with debugging
   - Log all API calls and their results

3. **Performance Considerations**:
   - Limit the number of transactions processed in `traceBlock` to avoid performance issues
   - Consider adding pagination for methods that return large amounts of data

4. **Environment Variables**:
   - Use environment variables for configuration
   - Provide sensible defaults if environment variables are not set

By following this implementation plan, the METHANE application will properly integrate with the Oyl SDK and use real data instead of mock data.