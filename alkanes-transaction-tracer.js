// Alkanes Transaction Tracer
// This script traces individual transactions using the alkanes_trace method
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

// Logging setup
const LOG_FILE = 'alkanes-transaction-traces.log';
const startTime = new Date().toISOString();
fs.appendFileSync(LOG_FILE, `\n\n====== NEW TRACE SESSION: ${startTime} ======\n`);

/**
 * Log a message to console and file
 */
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}`;
  
  console.log(message);
  
  if (data) {
    const dataStr = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    if (dataStr.length > 1000) {
      console.log('Data: [truncated for console display]');
      logMessage += `\nData: ${dataStr.substring(0, 1000)}... [truncated, full in log file]`;
    } else {
      console.log('Data:', dataStr);
      logMessage += `\nData: ${dataStr}`;
    }
  }
  
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

/**
 * Make a JSON-RPC call to the Metashrew API
 */
async function callMetashrewApi(method, params = []) {
  try {
    log(`Calling Metashrew API method "${method}"`, params);
    
    const response = await apiClient.post('', {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });

    if (response.data.error) {
      throw new Error(`Metashrew API Error: ${response.data.error.message || JSON.stringify(response.data.error)}`);
    }
    
    log(`Response received from ${method}`, response.data.result ? { success: true, size: JSON.stringify(response.data.result).length } : { success: false });
    return response.data.result;
  } catch (error) {
    let errorMessage = `Metashrew API call failed for method ${method}: ${error.message}`;
    
    if (error.response) {
      errorMessage += `\nStatus: ${error.response.status} ${error.response.statusText}`;
      errorMessage += `\nResponse data: ${JSON.stringify(error.response.data)}`;
    }
    
    log(errorMessage);
    throw error;
  }
}

/**
 * Trace a transaction using alkanes_trace method
 * This uses the format that was successful in our testing
 */
async function traceTransaction(txid, vout) {
  log(`Tracing transaction ${txid}:${vout} with alkanes_trace`);
  
  try {
    // Format the outpoint as expected by the API
    const outpoint = { txid, vout };
    
    // Call the alkanes_trace function directly
    const result = await callMetashrewApi('alkanes_trace', [outpoint]);
    
    // Check if we got a meaningful result
    if (!result || (Array.isArray(result) && result.length === 0)) {
      log(`No trace data available for transaction ${txid}:${vout}`);
      return null;
    }
    
    log(`Successfully traced transaction ${txid}:${vout}`, { 
      resultType: typeof result,
      isArray: Array.isArray(result),
      length: Array.isArray(result) ? result.length : (typeof result === 'string' ? result.length : 'N/A')
    });
    
    return result;
  } catch (error) {
    log(`Failed to trace transaction ${txid}:${vout}: ${error.message}`);
    throw error;
  }
}

/**
 * Extract the execution status from trace data
 */
function extractExecutionStatus(traceData) {
  try {
    // Check if we have valid trace data
    if (!traceData) {
      return { status: 'unknown', reason: 'No trace data available' };
    }
    
    // If it's an array with no elements, it likely means no execution occurred
    if (Array.isArray(traceData) && traceData.length === 0) {
      return { status: 'no_execution', reason: 'Empty trace array' };
    }
    
    // If it's an array with elements, examine each element
    if (Array.isArray(traceData)) {
      // Look for status indicators in the trace data
      const hasRevert = traceData.some(item => 
        (item.error && item.error.includes('revert')) || 
        (item.status && item.status === 'reverted')
      );
      
      const hasSuccess = traceData.some(item =>
        (item.status && (item.status === 'success' || item.status === 'successful'))
      );
      
      if (hasRevert) {
        return { status: 'reverted', reason: 'Found revert indicator in trace' };
      } else if (hasSuccess) {
        return { status: 'success', reason: 'Found success indicator in trace' };
      }
      
      // If no clear indicators, check if there are any operations
      if (traceData.length > 0) {
        return { status: 'executed', reason: 'Trace data exists but no clear status indicators' };
      }
    }
    
    // If it's an object, check for status fields
    if (typeof traceData === 'object' && !Array.isArray(traceData)) {
      if (traceData.status) {
        return { status: traceData.status, reason: 'Status field present in trace data' };
      }
      
      if (traceData.error) {
        return { status: 'error', reason: traceData.error };
      }
    }
    
    // Default fallback
    return { 
      status: 'unknown', 
      reason: 'Could not determine execution status from trace data',
      traceType: typeof traceData,
      preview: Array.isArray(traceData) 
        ? `Array with ${traceData.length} elements` 
        : JSON.stringify(traceData).substring(0, 100)
    };
  } catch (error) {
    return { status: 'error', reason: `Error analyzing trace data: ${error.message}` };
  }
}

/**
 * Process a batch of transactions
 */
async function processTransactions(transactions) {
  log(`Processing ${transactions.length} transactions`);
  
  const results = [];
  
  for (const tx of transactions) {
    try {
      const { txid, vout } = tx;
      log(`Processing transaction ${txid}:${vout}`);
      
      // Get trace data
      const traceData = await traceTransaction(txid, vout);
      
      // Extract execution status
      const executionStatus = extractExecutionStatus(traceData);
      
      // Compile results
      const result = {
        txid,
        vout,
        executionStatus,
        hasTraceData: !!traceData,
        timestamp: new Date().toISOString()
      };
      
      results.push(result);
      log(`Transaction ${txid}:${vout} processed: ${executionStatus.status}`);
      
    } catch (error) {
      log(`Error processing transaction: ${error.message}`);
      results.push({
        txid: tx.txid,
        vout: tx.vout,
        executionStatus: { status: 'error', reason: error.message },
        hasTraceData: false,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return results;
}

// Sample transactions for testing
const sampleTransactions = [
  { txid: '9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e', vout: 1 },
  { txid: '2cf4a155572450d6595e31b62645e50c8b5fa82d91c8e0e586f394d2f4b1ca7c', vout: 0 }
];

// Main execution
async function main() {
  log('Starting Alkanes Transaction Tracer');
  log(`API URL: ${METASHREW_API_URL}`);
  
  try {
    const results = await processTransactions(sampleTransactions);
    
    // Save results to JSON file
    const outputFile = `alkanes-traces-${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    log(`Processing complete. Results saved to ${outputFile}`);
    log('Summary of results:');
    
    results.forEach(result => {
      log(`- ${result.txid}:${result.vout} - Status: ${result.executionStatus.status}`);
    });
    
  } catch (error) {
    log(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  log(`Unhandled error: ${error.message}`);
  process.exit(1);
});
