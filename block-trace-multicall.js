// Block Trace Multicall Example
// This script demonstrates using sandshrew_multicall to efficiently fetch trace data
// for all Alkanes transactions in a block.
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Configuration
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';

// Create API client
const apiClient = axios.create({
  baseURL: METASHREW_API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Removed Sandshrew Project ID header - API works better without it
  }
});

/**
 * Make a standard JSON-RPC call to the Metashrew API
 */
async function callMetashrewApi(method, params = []) {
  try {
    console.log(`Calling ${method} with params:`, JSON.stringify(params).slice(0, 100) + '...');
    
    const response = await apiClient.post('', {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });

    if (response.data.error) {
      throw new Error(`API Error: ${response.data.error.message || JSON.stringify(response.data.error)}`);
    }
    
    return response.data.result;
  } catch (error) {
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.statusText);
      console.error('Response data:', error.response.data);
    }
    console.error(`API call failed for method ${method}:`, error.message);
    throw error;
  }
}

/**
 * Make a sandshrew_multicall request to batch multiple API calls
 * Input format: [["method_name", [param1, param2, ...]], ["method_name2", [param1, param2, ...]]]
 */
async function multicall(calls) {
  try {
    console.log(`Making multicall with ${calls.length} requests...`);
    
    const response = await apiClient.post('', {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'sandshrew_multicall',
      params: [calls]
    });

    if (response.data.error) {
      throw new Error(`Multicall API Error: ${response.data.error.message || JSON.stringify(response.data.error)}`);
    }
    
    return response.data.result;
  } catch (error) {
    if (error.response) {
      console.error('Multicall response error:', error.response.status, error.response.statusText);
      console.error('Response data:', error.response.data);
    }
    console.error('Multicall failed:', error.message);
    throw error;
  }
}

/**
 * Get the latest block height from the Bitcoin node
 */
async function getLatestBlockHeight() {
  return callMetashrewApi('btc_getblockcount', []);
}

/**
 * Get a specific block height (defaults to latest if not provided)
 */
async function getBlockToProcess(blockHeight = null) {
  if (!blockHeight) {
    blockHeight = await getLatestBlockHeight();
    console.log(`Using latest block height: ${blockHeight}`);
  }
  
  // Get block hash from height
  const blockHash = await callMetashrewApi('getblockhash', [blockHeight]);
  
  // Get complete block with all transaction details (verbosity=2)
  const block = await callMetashrewApi('getblock', [blockHash, 2]);
  
  return { blockHeight, blockHash, block };
}

/**
 * Reverse bytes in a hex string (for txid conversion)
 * This is required for the alkanes_trace API method
 */
function reverseBytes(hex) {
  // Make sure the hex string doesn't have '0x' prefix
  hex = hex.replace(/^0x/, '');
  
  // Check if the hex string has an odd length
  if (hex.length % 2 !== 0) {
    console.warn('Hex string has odd length, prepending 0:', hex);
    hex = '0' + hex;
  }
  
  // Convert to byte array and reverse
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(hex.substr(i, 2));
  }
  
  return bytes.reverse().join('');
}

/**
 * Identify potential Alkanes transactions in a block by looking for OP_RETURN outputs
 */
function identifyAlkanesTransactions(block) {
  console.log(`Scanning ${block.tx.length} transactions for Alkanes operations...`);
  
  // Look for transactions with OP_RETURN outputs (potential Alkanes transactions)
  const potentialAlkanesTxs = block.tx.filter(tx => 
    tx.vout && tx.vout.some(vout => 
      vout.scriptPubKey && vout.scriptPubKey.type === 'nulldata'
    )
  );
  
  console.log(`Found ${potentialAlkanesTxs.length} potential Alkanes transactions`);
  
  // For each transaction, we'll check:
  // 1. The OP_RETURN outputs (standard Alkanes pattern)
  // 2. Vout 4 specifically (where trace data is found)
  const alkanesTxsWithVouts = potentialAlkanesTxs.map(tx => {
    // Collect OP_RETURN vouts
    const nulldataVouts = tx.vout
      .map((vout, index) => ({ vout: index, type: vout.scriptPubKey?.type }))
      .filter(v => v.type === 'nulldata');
    
    // Always include vout 4 for trace data (if it exists)
    const hasVout4 = tx.vout.length > 4;
    const voutsToCheck = [...nulldataVouts];
    
    if (hasVout4) {
      if (!voutsToCheck.some(v => v.vout === 4)) {
        voutsToCheck.push({ vout: 4, type: 'trace_data' });
      }
    } else {
      console.log(`Transaction ${tx.txid} has only ${tx.vout.length} outputs, no vout 4`);
    }
    
    return {
      txid: tx.txid,
      alkanesVouts: voutsToCheck,
      // Store both original and reversed txid for reference
      reversedTxid: reverseBytes(tx.txid)
    };
  });
  
  return alkanesTxsWithVouts;
}

/**
 * Build a multicall request for tracing all identified Alkanes transactions
 */
function buildTraceMulticall(alkanesTxsWithVouts) {
  const calls = [];
  
  // For each transaction and each valid vout, add a trace call
  for (const tx of alkanesTxsWithVouts) {
    for (const voutInfo of tx.alkanesVouts) {
      // Add alkanes_trace call with the BYTE-REVERSED txid
      calls.push([
        "alkanes_trace", 
        [{ txid: tx.reversedTxid, vout: voutInfo.vout }]
      ]);
    }
  }
  
  console.log(`Created multicall with ${calls.length} trace requests`);
  return calls;
}

/**
 * Process traces and map them back to their transactions
 */
function processTraceResults(alkanesTxsWithVouts, traceResults) {
  console.log(`Processing ${traceResults.length} trace results...`);
  
  let index = 0;
  const tracedTransactions = [];
  
  // Map each trace result back to its transaction
  for (const tx of alkanesTxsWithVouts) {
    const voutTraces = [];
    
    for (const voutInfo of tx.alkanesVouts) {
      const traceResult = traceResults[index++];
      voutTraces.push({
        vout: voutInfo.vout,
        type: voutInfo.type,
        hasTrace: Array.isArray(traceResult) && traceResult.length > 0,
        trace: traceResult
      });
    }
    
    // Check if any vout has a valid trace
    const hasAnyTrace = voutTraces.some(vt => vt.hasTrace);
    
    tracedTransactions.push({
      txid: tx.txid,
      reversedTxid: tx.reversedTxid,
      isAlkanes: hasAnyTrace,
      voutTraces
    });
  }
  
  return tracedTransactions;
}

/**
 * Main function to demonstrate the exact multicall approach
 */
async function demonstrateBlockTraceMulticall(blockHeight = null) {
  console.log('ALKANES BLOCK TRACE MULTICALL DEMONSTRATION');
  console.log(`API URL: ${METASHREW_API_URL}`);
  console.log(`Using byte-reversal for txids and checking vout 4 specifically`);
  
  try {
    // Step 1: Get the block to process
    const { blockHeight: actualBlockHeight, blockHash, block } = await getBlockToProcess(blockHeight);
    console.log(`\nProcessing block ${actualBlockHeight} (${blockHash})`);
    console.log(`Block contains ${block.tx.length} total transactions`);
    
    // Step 2: Identify potential Alkanes transactions in the block
    const alkanesTxsWithVouts = identifyAlkanesTransactions(block);
    
    if (alkanesTxsWithVouts.length === 0) {
      console.log('No potential Alkanes transactions found in this block.');
      return;
    }
    
    // Step 3: Build the multicall for tracing all identified transactions
    const traceCalls = buildTraceMulticall(alkanesTxsWithVouts);
    
    // Step 4: Execute the multicall to get all traces in one request
    console.log('\nFetching trace data for all potential Alkanes transactions...');
    console.log('EXACT MULTICALL FORMAT:');
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'sandshrew_multicall',
      params: [traceCalls]
    }, null, 2));
    
    const traceResults = await multicall(traceCalls);
    
    // Step 5: Process the trace results and map them to transactions
    const tracedTransactions = processTraceResults(alkanesTxsWithVouts, traceResults);
    
    // Step 6: Count successful traces
    const successfulTraces = tracedTransactions.filter(tx => 
      tx.voutTraces.some(vt => vt.hasTrace)
    );
    
    console.log(`\nResults: ${successfulTraces.length} of ${alkanesTxsWithVouts.length} transactions have trace data`);
    
    // Save the results to a file
    const outputFile = `block-${actualBlockHeight}-traces-${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify({
      blockHeight: actualBlockHeight,
      blockHash,
      totalTransactions: block.tx.length,
      alkanesCandidates: alkanesTxsWithVouts.length,
      tracedTransactions,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log(`\nDetailed trace data saved to ${outputFile}`);
    
    // Show a sample of the first successful trace if available
    const firstSuccessful = tracedTransactions.find(tx => 
      tx.voutTraces.some(vt => vt.hasTrace)
    );
    
    if (firstSuccessful) {
      const successfulVout = firstSuccessful.voutTraces.find(vt => vt.hasTrace);
      console.log('\nSAMPLE SUCCESSFUL TRACE:');
      console.log(`Transaction: ${firstSuccessful.txid}`);
      console.log(`Vout: ${successfulVout.vout}`);
      console.log('Trace data preview:', JSON.stringify(successfulVout.trace).slice(0, 200) + '...');
    }
    
    return tracedTransactions;
  } catch (error) {
    console.error('Error in block trace multicall demonstration:', error);
  }
}

// Run with the latest block (or specify a block height as argument)
const blockHeightArg = process.argv[2] ? parseInt(process.argv[2]) : null;
demonstrateBlockTraceMulticall(blockHeightArg)
  .then(() => console.log('\nDemonstration complete.'))
  .catch(error => console.error('Fatal error:', error.message));
