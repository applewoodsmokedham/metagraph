// Test script focusing exclusively on individual transaction tracing with metashrew_view
require('dotenv').config();
const axios = require('axios');

// Configuration
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';

// Sample Alkanes transaction that we found earlier
const TXID = '9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e';
const VOUT = 1;

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
    console.log(`Calling Metashrew API ${method} with params:`, JSON.stringify(params, null, 2));
    
    const response = await apiClient.post('', {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });

    if (response.data.error) {
      throw new Error(`Metashrew API Error: ${response.data.error.message || JSON.stringify(response.data.error)}`);
    }

    console.log('Response headers:', response.headers);
    
    return response.data.result;
  } catch (error) {
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.statusText);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    }
    console.error(`Metashrew API call failed for method ${method}:`, error.message);
    throw error;
  }
}

/**
 * Format the outpoint correctly for the trace function
 * This follows the implementation in metashrew-api.ts
 */
function formatOutpointForTrace(txid, vout) {
  // Create the outpoint object
  const outpoint = { txid, vout };
  
  // Convert to a hex string as required by the API
  const hexInput = Buffer.from(JSON.stringify(outpoint)).toString('hex');
  
  console.log('Original outpoint object:', outpoint);
  console.log('Hex-encoded outpoint:', hexInput);
  
  return hexInput;
}

/**
 * Trace a transaction using metashrew_view
 */
async function traceTransaction(txid, vout) {
  console.log(`\nTracing transaction ${txid}:${vout} with metashrew_view...`);
  
  try {
    // Format the outpoint as expected by the API
    const hexInput = formatOutpointForTrace(txid, vout);
    
    // Call the trace function through metashrew_view
    const result = await callMetashrewApi('metashrew_view', ['trace', hexInput, 'latest']);
    
    console.log('Trace successful!');
    console.log('Result type:', typeof result);
    console.log('Result preview:', truncateResult(result));
    
    return result;
  } catch (error) {
    console.error('Trace failed:', error.message);
    
    // Additional debugging for the hex encoding
    console.log('\nVerifying hex encoding...');
    const outpoint = { txid, vout };
    console.log('Original JSON:', JSON.stringify(outpoint));
    
    // Try alternative encoding approaches for debugging
    try {
      // Try with specific JSON formatting (no spaces)
      const compactJson = JSON.stringify(outpoint).replace(/\s/g, '');
      const compactHex = Buffer.from(compactJson).toString('hex');
      console.log('Compact JSON:', compactJson);
      console.log('Compact hex:', compactHex);
      
      // Try with a different format
      const stringFormat = `${txid}:${vout}`;
      const stringHex = Buffer.from(stringFormat).toString('hex');
      console.log('String format:', stringFormat);
      console.log('String hex:', stringHex);
    } catch (encodeError) {
      console.error('Error during hex encoding tests:', encodeError.message);
    }
    
    throw error;
  }
}

// Helper to truncate large results for console output
function truncateResult(result) {
  if (!result) return 'null';
  
  const str = typeof result === 'string' ? result : JSON.stringify(result);
  if (str.length <= 500) return str;
  return str.substring(0, 500) + '...';
}

// Run the test
console.log(`Testing transaction trace with Metashrew API at: ${METASHREW_API_URL}`);
console.log('Using TXID:', TXID);
console.log('Using VOUT:', VOUT);

traceTransaction(TXID, VOUT)
  .then(result => {
    if (result) {
      console.log('\nSuccessfully retrieved transaction trace data!');
    } else {
      console.log('\nNo trace data was returned (null or empty result).');
    }
  })
  .catch(error => {
    console.error('\nTest failed:', error.message);
  });
