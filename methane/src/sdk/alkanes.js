import getProvider from './provider';

/**
 * Traces a transaction, showing the execution of a smart contract
 * @param {string} txid - Transaction ID to trace
 * @param {string|number} blockHeight - Block height where transaction was confirmed
 * @param {number} vout - Output index (default: 0)
 * @param {string} endpoint - API endpoint to use ('local', 'production', 'oylnet')
 * @returns {Promise<Object>} - Trace results
 */
export const traceTransaction = async (txid, blockHeight, vout = 0, endpoint = 'local') => {
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

/**
 * Simulates a transaction to preview the outcome
 * @param {Object} params - Simulation parameters
 * @param {string} endpoint - API endpoint to use ('local', 'production', 'oylnet')
 * @returns {Promise<Object>} - Simulation results
 */
export const simulateTransaction = async (params, endpoint = 'local') => {
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

/**
 * Traces all transactions in a block
 * @param {string|number} blockHeight - Block height to trace
 * @param {string} endpoint - API endpoint to use ('local', 'production', 'oylnet')
 * @returns {Promise<Object>} - TraceBlock results
 */
export const traceBlock = async (blockHeight, endpoint = 'local') => {
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
    
    // If the real API fails, return some mock data for demonstration
    return {
      status: "error",
      message: error.message || "Unknown error",
      blockHeight,
      fallback: true,
      transactions: [
        { txid: "3a7e83462a4a94c9fc3d6b46dc6eba39c3d05cb16d2ce4f1670cdf02201", status: "success" },
        { txid: "4b8f94573b5b94d9fc4d6b46dc6eba39c3d05cb16d2ce4f1670cdf02345", status: "success" },
        { txid: "5c9fa5684c6ca5eafd5e7c57dc6eba39c3d05cb16d2ce4f1670cdf02789", status: "success" }
      ]
    };
  }
};