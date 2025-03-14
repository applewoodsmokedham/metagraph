// Script to find Alkanes transactions in recent blocks and fetch their trace data
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { decodeOpReturn } = require('./dist/lib/runestone-decoder');

// Bitcoin RPC credentials
const BITCOIN_RPC_URL = process.env.BITCOIN_RPC_URL || 'http://localhost:8332';
const BITCOIN_RPC_USER = process.env.BITCOIN_RPC_USER;
const BITCOIN_RPC_PASS = process.env.BITCOIN_RPC_PASSWORD;

// Metashrew API settings
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'http://localhost:8080';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';

// Create axios instances
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

// Utility function for Bitcoin RPC calls
async function callBitcoinRpc(method, params = []) {
  try {
    const response = await bitcoinClient.post('', {
      jsonrpc: '2.0',
      id: 'alkanes-trace',
      method,
      params
    });
    return response.data.result;
  } catch (error) {
    console.error(`Bitcoin RPC call failed for method ${method}:`, error.message);
    throw error;
  }
}

// Utility function for Metashrew API calls
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
    console.error(`Metashrew API call failed for method ${method}:`, error.message);
    throw error;
  }
}

// Call a Metashrew view function
async function callView(viewName, hexInput, blockTag = 'latest') {
  return callMetashrewApi('metashrew_view', [viewName, hexInput, blockTag]);
}

// Get trace for a block
async function traceBlock(height) {
  const heightHex = '0x' + height.toString(16).padStart(8, '0');
  return callView('traceblock', heightHex);
}

// Trace a specific transaction using its txid and vout
async function traceTransaction(txid, vout) {
  console.log(`Tracing transaction ${txid}:${vout}...`);
  
  try {
    // Format 1: Direct call to trace with properly formatted outpoint
    const outpoint = `${txid}:${vout}`;
    const result = await callMetashrewApi('trace', [outpoint]);
    console.log(`Successfully traced transaction using direct call`);
    return result;
  } catch (error) {
    console.error(`Direct trace call failed:`, error.message);
    
    try {
      // Format 2: Using metashrew_view with trace function
      const outpoint = { txid, vout };
      const hexInput = Buffer.from(JSON.stringify(outpoint)).toString('hex');
      const result = await callMetashrewApi('metashrew_view', ['trace', hexInput, 'latest']);
      console.log(`Successfully traced transaction using metashrew_view`);
      return result;
    } catch (error) {
      console.error(`metashrew_view trace call failed:`, error.message);
      
      try {
        // Format 3: Try alkanes_trace with formatted object
        const result = await callMetashrewApi('alkanes_trace', [{
          outpoint: { txid, vout }
        }]);
        console.log(`Successfully traced transaction using alkanes_trace`);
        return result;
      } catch (error) {
        console.error(`alkanes_trace call failed:`, error.message);
        throw new Error(`All trace approaches failed for ${txid}:${vout}`);
      }
    }
  }
}

// Process a transaction to check for Alkanes OP_RETURN data
function processTransaction(tx) {
  if (!tx || !tx.vout) return null;
  
  for (const output of tx.vout) {
    if (!output.scriptPubKey || !output.scriptPubKey.hex) continue;
    
    // Check if this is an OP_RETURN output
    if (output.scriptPubKey.type === 'nulldata' || output.scriptPubKey.hex.startsWith('6a')) {
      const decoded = decodeOpReturn(output.scriptPubKey.hex);
      
      if (decoded && decoded.data && decoded.data.protocolName === 'Alkanes') {
        return {
          txid: tx.txid,
          vout: output.n,
          hex: output.scriptPubKey.hex,
          asm: output.scriptPubKey.asm,
          decoded
        };
      }
    }
  }
  
  return null;
}

// Process the trace data to extract status and other metadata for specific transactions
function processTraceData(blockTraceData, transactions) {
  // If we don't have trace data, return transactions as is
  if (!blockTraceData) {
    return transactions.map(tx => ({
      ...tx,
      traceStatus: 'unknown',
      traceError: 'No trace data available'
    }));
  }
  
  // Process transactions with trace data
  return transactions.map(tx => {
    const txid = tx.txid;
    
    // Look for this transaction in the trace data
    let traceInfo = {
      status: 'unknown',
      gasUsed: null,
      operations: [],
      error: null
    };
    
    try {
      // If blockTraceData is a string, try to parse it
      const traceData = typeof blockTraceData === 'string' 
        ? JSON.parse(blockTraceData) 
        : blockTraceData;
      
      // Check if the trace data is actually an error
      if (traceData && traceData.error) {
        return {
          ...tx,
          traceStatus: 'error',
          traceError: `API Error: ${traceData.error.message || JSON.stringify(traceData.error)}`
        };
      }
      
      // Look for transaction info in the trace data
      // Format may vary based on the API response structure
      
      // Try to find transaction by ID
      if (typeof traceData === 'object' && traceData !== null) {
        // Option 1: If trace data is organized by transaction ID
        if (traceData[txid]) {
          traceInfo = {
            ...traceInfo,
            ...traceData[txid],
            status: traceData[txid].status || traceData[txid].result || 'success'
          };
        } 
        // Option 2: If trace data contains an array of transactions
        else if (Array.isArray(traceData.transactions)) {
          const txTrace = traceData.transactions.find(t => t.txid === txid);
          if (txTrace) {
            traceInfo = {
              ...traceInfo,
              ...txTrace,
              status: txTrace.status || txTrace.result || 'success'
            };
          }
        }
        // Option 3: If trace data has nested structure
        else if (traceData.traces || traceData.results) {
          const tracesArray = traceData.traces || traceData.results;
          if (Array.isArray(tracesArray)) {
            const txTrace = tracesArray.find(t => 
              t.txid === txid || 
              (t.outpoint && (t.outpoint.txid === txid || t.outpoint === `${txid}:${tx.vout}`))
            );
            if (txTrace) {
              traceInfo = {
                ...traceInfo,
                ...txTrace,
                status: txTrace.status || txTrace.result || 'success'
              };
            }
          }
        }
        
        // Check for debug string representation (common in Alkanes traces)
        if (typeof traceData === 'string' && traceData.includes(txid)) {
          traceInfo.status = traceData.includes('REVERT') ? 'revert' : 'success';
          traceInfo.gasUsed = traceData.match(/Gas used: (\d+)/) 
            ? parseInt(traceData.match(/Gas used: (\d+)/)[1]) 
            : null;
        }
      }
      
      return {
        ...tx,
        traceStatus: traceInfo.status,
        traceGasUsed: traceInfo.gasUsed,
        traceOperations: traceInfo.operations || [],
        traceError: traceInfo.error
      };
    } catch (error) {
      console.error(`Error processing trace data for ${txid}:`, error.message);
      return {
        ...tx,
        traceStatus: 'error',
        traceError: `Error processing trace: ${error.message}`
      };
    }
  });
}

// Analyze a block for Alkanes transactions
async function analyzeBlock(blockHeight) {
  console.log(`Analyzing block ${blockHeight}...`);
  
  try {
    // Get block hash
    const blockHash = await callBitcoinRpc('getblockhash', [blockHeight]);
    
    // Get full block data
    const block = await callBitcoinRpc('getblock', [blockHash, 2]);
    
    console.log(`Block ${blockHeight} has ${block.tx.length} transactions`);
    
    // Find Alkanes transactions
    const alkanesTransactions = [];
    
    for (const tx of block.tx) {
      const alkanesData = processTransaction(tx);
      if (alkanesData) {
        alkanesTransactions.push(alkanesData);
      }
    }
    
    console.log(`Found ${alkanesTransactions.length} Alkanes transactions in block ${blockHeight}`);
    
    // For each Alkanes transaction, try to get its trace data
    if (alkanesTransactions.length > 0) {
      console.log(`Fetching trace data for ${alkanesTransactions.length} transactions...`);
      
      // Try to fetch trace data for each transaction
      const transactionsWithTrace = await Promise.all(
        alkanesTransactions.map(async (tx) => {
          try {
            const traceData = await traceTransaction(tx.txid, tx.vout);
            return {
              ...tx,
              trace: traceData,
              traceStatus: traceData ? 'success' : 'unknown',
              traceError: null
            };
          } catch (error) {
            console.error(`Failed to trace transaction ${tx.txid}:${tx.vout}:`, error.message);
            return {
              ...tx,
              trace: null,
              traceStatus: 'error',
              traceError: error.message
            };
          }
        })
      );
      
      // Return results with transaction-level trace data
      return {
        blockHeight,
        blockHash,
        blockTime: block.time,
        txCount: block.tx.length,
        alkanesCount: alkanesTransactions.length,
        alkanesTransactions: transactionsWithTrace
      };
    }
    
    // Return results without trace data if no Alkanes transactions
    return {
      blockHeight,
      blockHash,
      blockTime: block.time,
      txCount: block.tx.length,
      alkanesCount: 0,
      alkanesTransactions: []
    };
  } catch (error) {
    console.error(`Failed to analyze block ${blockHeight}:`, error.message);
    return {
      blockHeight,
      error: error.message
    };
  }
}

// Analyze multiple blocks for Alkanes transactions
async function analyzeBlocks(startBlock, count) {
  const results = [];
  
  // Get the current block height if startBlock is not specified
  if (!startBlock) {
    startBlock = await callBitcoinRpc('getblockcount') - count + 1;
  }
  
  console.log(`Analyzing ${count} blocks starting from ${startBlock}...`);
  
  for (let i = 0; i < count; i++) {
    const blockHeight = startBlock + i;
    const blockResult = await analyzeBlock(blockHeight);
    results.push(blockResult);
    
    // Save incremental results to avoid losing data on failure
    saveResults(results, `alkanes_analysis_${startBlock}_to_${startBlock + count - 1}.json`);
  }
  
  return results;
}

// Save results to a file
function saveResults(results, filename) {
  const outputPath = path.join(__dirname, 'data', filename);
  
  // Make sure the data directory exists
  if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Results saved to ${outputPath}`);
}

// Specific block analysis - known Alkanes blocks
async function analyzeKnownBlocks() {
  // Block 880000 is known to have Alkanes activity
  const knownBlocks = [880000, 887380];
  const results = [];
  
  for (const blockHeight of knownBlocks) {
    console.log(`Analyzing known Alkanes block ${blockHeight}...`);
    const blockResult = await analyzeBlock(blockHeight);
    results.push(blockResult);
  }
  
  saveResults(results, 'alkanes_analysis_known_blocks.json');
  return results;
}

// Main function
async function main() {
  try {
    // First, analyze known blocks
    console.log('=== ANALYZING KNOWN ALKANES BLOCKS ===');
    await analyzeKnownBlocks();
    
    // Then analyze the 5 most recent blocks
    console.log('\n=== ANALYZING RECENT BLOCKS ===');
    await analyzeBlocks(null, 5);
    
    console.log('\nAnalysis complete!');
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

// Run the script
main();
