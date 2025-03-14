// Utility script to check if a transaction is an Alkanes transaction and fetch its trace data
require('dotenv').config();
const axios = require('axios');
const { decodeOpReturn } = require('./dist/lib/runestone-decoder');

// Configuration
const BITCOIN_RPC_URL = process.env.BITCOIN_RPC_URL || 'http://localhost:8332';
const BITCOIN_RPC_USER = process.env.BITCOIN_RPC_USER;
const BITCOIN_RPC_PASS = process.env.BITCOIN_RPC_PASSWORD;
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'http://localhost:8080';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';

// Command line arguments
const txid = process.argv[2];
if (!txid) {
  console.error('Usage: node check-alkanes-tx.js <txid>');
  process.exit(1);
}

// Create API clients
const bitcoinClient = axios.create({
  baseURL: BITCOIN_RPC_URL,
  auth: {
    username: BITCOIN_RPC_USER,
    password: BITCOIN_RPC_PASS
  }
});

const metashrewClient = axios.create({
  baseURL: METASHREW_API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Removed Sandshrew Project ID header - API works better without it
  }
});

// Utility functions
async function callBitcoinRpc(method, params = []) {
  try {
    const response = await bitcoinClient.post('', {
      jsonrpc: '2.0',
      id: 'alkanes-check',
      method,
      params
    });
    return response.data.result;
  } catch (error) {
    console.error(`Bitcoin RPC Error (${method}):`, error.message);
    throw error;
  }
}

async function callMetashrewApi(method, params = []) {
  try {
    const response = await metashrewClient.post('', {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });
    
    if (response.data.error) {
      throw new Error(`Metashrew API Error: ${response.data.error.message}`);
    }
    
    return response.data.result;
  } catch (error) {
    console.error(`Metashrew API Error (${method}):`, error.message);
    throw error;
  }
}

async function callView(viewName, hexInput, blockTag = 'latest') {
  return callMetashrewApi('metashrew_view', [viewName, hexInput, blockTag]);
}

// Check transaction
async function checkTransaction() {
  try {
    console.log(`Checking transaction: ${txid}`);
    
    // Get raw transaction
    const tx = await callBitcoinRpc('getrawtransaction', [txid, true]);
    console.log(`Transaction found in block: ${tx.blockhash || 'mempool'}`);
    
    // Check each output for Alkanes OP_RETURN data
    let alkanesOutput = null;
    
    for (const output of tx.vout) {
      if (!output.scriptPubKey || !output.scriptPubKey.hex) continue;
      
      if (output.scriptPubKey.type === 'nulldata' || output.scriptPubKey.hex.startsWith('6a')) {
        const decoded = decodeOpReturn(output.scriptPubKey.hex);
        
        console.log(`\nOutput #${output.n} - OP_RETURN data:`);
        console.log(`Hex: ${output.scriptPubKey.hex}`);
        console.log(`ASM: ${output.scriptPubKey.asm}`);
        
        if (decoded && decoded.data) {
          console.log(`Decoded type: ${decoded.type}`);
          
          if (decoded.data.protocolName === 'Alkanes') {
            console.log(`✅ This is an Alkanes protocol transaction!`);
            console.log(`Protocol tag: ${decoded.data.protocolField?.tag}`);
            console.log(`Protocol values: ${decoded.data.protocolField?.values?.join(', ')}`);
            alkanesOutput = { ...output, n: output.n, decoded };
          } else {
            console.log(`❌ Not an Alkanes protocol transaction`);
          }
        }
      }
    }
    
    // Try to get trace data if this is an Alkanes transaction
    if (alkanesOutput) {
      // Get block info for trace
      if (tx.blockhash) {
        const blockInfo = await callBitcoinRpc('getblock', [tx.blockhash]);
        console.log(`\nBlock info:`);
        console.log(`Height: ${blockInfo.height}`);
        console.log(`Timestamp: ${new Date(blockInfo.time * 1000).toISOString()}`);
        
        // Try to get trace using multicall (which worked better in our tests)
        try {
          console.log(`\nFetching trace data using multicall...`);
          const heightHex = '0x' + blockInfo.height.toString(16).padStart(8, '0');
          const calls = [
            ["metashrew_view", ["traceblock", heightHex, "latest"]]
          ];
          
          const multicallResult = await callMetashrewApi('sandshrew_multicall', [calls]);
          if (multicallResult && multicallResult.length > 0) {
            const blockTrace = multicallResult[0];
            console.log(`Successfully fetched block trace data.`);
            
            // Check if we have specific trace data for this transaction
            // Note: The trace data format would need to be examined to extract the specific tx
            console.log(`\nTrace data fetched. You can now use this data for further analysis.`);
            
            // Search for this transaction in the trace data
            if (typeof blockTrace === 'object' && blockTrace !== null) {
              const txMatches = findTransactionInTrace(blockTrace, txid, alkanesOutput.n);
              if (txMatches && txMatches.length > 0) {
                console.log(`Found ${txMatches.length} trace entries for this transaction!`);
                console.log(JSON.stringify(txMatches, null, 2));
              } else {
                console.log(`No specific trace data found for this transaction in the block trace.`);
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch trace:`, error);
        }
      }
    } else {
      console.log(`\nThis transaction does not contain any Alkanes protocol data.`);
    }
  } catch (error) {
    console.error(`Error checking transaction:`, error);
  }
}

// Helper to find a specific transaction in trace data
// Note: This is a placeholder and would need to be adapted based on actual trace data format
function findTransactionInTrace(traceData, txid, vout) {
  // This is a simplified implementation that would need to be updated
  // based on the actual structure of the trace data
  
  // For example, if trace data is an array of transaction traces:
  if (Array.isArray(traceData)) {
    return traceData.filter(item => 
      item.txid === txid || 
      (item.outpoint && item.outpoint.txid === txid && item.outpoint.vout === vout)
    );
  }
  
  // If it's an object with transaction IDs as keys:
  if (typeof traceData === 'object') {
    const matches = [];
    
    // Try to find any property that might contain the txid
    for (const [key, value] of Object.entries(traceData)) {
      if (key === txid || key.includes(txid)) {
        matches.push(value);
      }
      
      // Also look in nested objects if present
      if (typeof value === 'object' && value !== null) {
        // Check if this object contains the txid somewhere
        const stringified = JSON.stringify(value);
        if (stringified.includes(txid)) {
          matches.push(value);
        }
      }
    }
    
    return matches;
  }
  
  return [];
}

// Run the check
checkTransaction().catch(console.error);
