// Script to verify the transaction details and try alternative tracing approaches
require('dotenv').config();
const axios = require('axios');

// Configuration
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';

// The transaction to check
const TXID = '9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e';

// Create API client
const apiClient = axios.create({
  baseURL: METASHREW_API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Removed Sandshrew Project ID header - API works better without it
  }
});

/**
 * Make a JSON-RPC call to the Metashrew API
 */
async function callMetashrewApi(method, params = []) {
  try {
    console.log(`Calling ${method} with params:`, JSON.stringify(params, null, 2));
    
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
 * Get transaction details from the Bitcoin node
 */
async function getTransactionDetails(txid) {
  console.log(`\nGetting transaction details for ${txid}`);
  
  try {
    // Use the getrawtransaction RPC method
    const result = await callMetashrewApi('getrawtransaction', [txid, true]);
    
    if (!result) {
      console.log(`Transaction not found: ${txid}`);
      return null;
    }
    
    console.log(`Transaction has ${result.vout?.length || 0} vout entries`);
    
    // Print vout details
    if (result.vout && result.vout.length > 0) {
      console.log('\nVout details:');
      result.vout.forEach((vout, index) => {
        console.log(`[${index}] Value: ${vout.value}, Type: ${vout.scriptPubKey?.type || 'unknown'}`);
        if (vout.scriptPubKey?.asm) {
          console.log(`    Script: ${vout.scriptPubKey.asm.substring(0, 100)}...`);
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error(`Error getting transaction details: ${error.message}`);
    
    // Try an alternative method
    try {
      console.log('\nTrying alternative approach with btc_gettransaction...');
      const result = await callMetashrewApi('btc_gettransaction', [txid]);
      
      if (result) {
        console.log('Found transaction with btc_gettransaction!');
        return result;
      }
    } catch (alt_error) {
      console.error(`Alternative method also failed: ${alt_error.message}`);
    }
    
    return null;
  }
}

/**
 * Try to get trace data using various methods
 */
async function tryAlternativeTraceMethods(txid) {
  console.log('\n===== TRYING ALTERNATIVE TRACE METHODS =====');
  
  // Try a hexadecimal format of the txid
  try {
    console.log('\n1. Using hex format of txid...');
    const hexTxid = Buffer.from(txid, 'hex').toString('hex');
    const result = await callMetashrewApi('alkanes_trace', [{ txid: hexTxid, vout: 0 }]);
    if (result && (!Array.isArray(result) || result.length > 0)) {
      console.log('Success with hex format!');
      return { method: 'hex_format', result };
    }
    console.log('No data with hex format.');
  } catch (error) {
    console.error(`Hex format failed: ${error.message}`);
  }
  
  // Try with protorunesbyoutpoint
  try {
    console.log('\n2. Using protorunesbyoutpoint...');
    const outpoint = { txid, vout: 0 };
    const hexInput = Buffer.from(JSON.stringify(outpoint)).toString('hex');
    const result = await callMetashrewApi('metashrew_view', ['protorunesbyoutpoint', hexInput, 'latest']);
    console.log('protorunesbyoutpoint result:', result);
    if (result) {
      return { method: 'protorunesbyoutpoint', result };
    }
  } catch (error) {
    console.error(`protorunesbyoutpoint failed: ${error.message}`);
  }
  
  // Try with the simulate method
  try {
    console.log('\n3. Using simulate...');
    const outpoint = { txid, vout: 0 };
    const result = await callMetashrewApi('alkanes_simulate', [outpoint]);
    console.log('simulate result:', result);
    if (result) {
      return { method: 'simulate', result };
    }
  } catch (error) {
    console.error(`simulate failed: ${error.message}`);
  }
  
  console.log('\nAll alternative methods failed.');
  return null;
}

/**
 * Check if a transaction has Alkanes operations directly
 */
async function checkTransactionForAlkanes(txid) {
  console.log(`\nChecking if transaction ${txid} has Alkanes operations`);
  
  try {
    // Try with hasAlkaneOperations if available
    const result = await callMetashrewApi('alkanes_hasoperations', [txid]);
    console.log('hasAlkaneOperations result:', result);
    return result;
  } catch (error) {
    console.error(`hasAlkaneOperations failed: ${error.message}`);
    return null;
  }
}

// Main execution
async function main() {
  console.log(`Verifying transaction: ${TXID}`);
  console.log(`API URL: ${METASHREW_API_URL}`);
  
  // Get transaction details
  const txDetails = await getTransactionDetails(TXID);
  
  if (txDetails) {
    // If we have more than 5 vouts, try them
    if (txDetails.vout && txDetails.vout.length > 5) {
      console.log(`\nTransaction has ${txDetails.vout.length} outputs, checking additional vouts...`);
      
      for (let vout = 5; vout < txDetails.vout.length; vout++) {
        try {
          console.log(`\nChecking outpoint ${TXID}:${vout}`);
          const outpoint = { txid: TXID, vout };
          const result = await callMetashrewApi('alkanes_trace', [outpoint]);
          
          if (result && (!Array.isArray(result) || result.length > 0)) {
            console.log(`✓ FOUND TRACE DATA for vout=${vout}!`);
            console.log('Result:', result);
            return;
          } else {
            console.log(`✘ No trace data found for vout=${vout}`);
          }
        } catch (error) {
          console.error(`Error checking vout ${vout}: ${error.message}`);
        }
      }
    }
  }
  
  // Check if transaction has Alkanes operations directly
  await checkTransactionForAlkanes(TXID);
  
  // Try alternative methods
  await tryAlternativeTraceMethods(TXID);
  
  console.log('\n===== CONCLUSION =====');
  if (txDetails) {
    console.log(`Transaction exists with ${txDetails.vout?.length || 0} outputs`);
    console.log('However, no trace data was found with any of the methods we tried.');
    console.log('This could indicate:');
    console.log('1. The transaction might not have Alkanes operations despite appearances');
    console.log('2. The Metashrew API might have limitations or require additional parameters');
    console.log('3. We might need a different approach to retrieve trace data for this transaction');
  } else {
    console.log('Could not retrieve transaction details. Please check if the txid is correct.');
  }
}

main().catch(error => {
  console.error('Fatal error:', error.message);
});
