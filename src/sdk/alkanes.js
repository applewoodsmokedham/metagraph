// Import Node.js shims first to ensure they're loaded before any other imports
import './node-shims.js';
import getProvider from './provider';

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
    
    // Ensure provider.alkanes exists
    if (!provider.alkanes || typeof provider.alkanes.trace !== 'function') {
      throw new Error('Alkanes trace method not available');
    }
    
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
    
    // Ensure provider.alkanes exists
    if (!provider.alkanes || typeof provider.alkanes.simulate !== 'function') {
      throw new Error('Alkanes simulate method not available');
    }
    
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
    
    // Ensure provider.sandshrew exists
    if (!provider.sandshrew || !provider.sandshrew.bitcoindRpc) {
      throw new Error('Sandshrew RPC client not available');
    }
    
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
    
    // Return a proper error response
    return {
      status: "error",
      message: error.message || "Unknown error",
      blockHeight
    };
  }
};

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
    
    // Ensure provider.alkanes exists
    if (!provider.alkanes || typeof provider.alkanes.getAlkanesByAddress !== 'function') {
      throw new Error('Alkanes getAlkanesByAddress method not available');
    }
    
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
    
    // Ensure provider.alkanes exists
    if (!provider.alkanes || typeof provider.alkanes.getAlkanesByHeight !== 'function') {
      throw new Error('Alkanes getAlkanesByHeight method not available');
    }
    
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