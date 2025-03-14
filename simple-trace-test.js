// Simple test for the trace function using string outpoint format
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
    
    return response.data.result;
  } catch (error) {
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.statusText);
      console.error('Response data:', error.response.data);
    }
    console.error(`Metashrew API call failed for method ${method}:`, error.message);
    throw error;
  }
}

/**
 * Format outpoint as a string with txid:vout format
 */
function formatOutpointAsString(txid, vout) {
  return `${txid}:${vout}`;
}

/**
 * Encode outpoint as hex for metashrew_view
 */
function encodeOutpointAsHex(txid, vout) {
  // Format 1: Simple string in "txid:vout" format
  const outpointStr = formatOutpointAsString(txid, vout);
  return Buffer.from(outpointStr).toString('hex');
}

/**
 * Try different formats for the trace function
 */
async function testTraceFormats(txid, vout) {
  console.log(`Testing different formats for tracing transaction ${txid}:${vout}\n`);
  
  // Format 1: Using the string format directly encoded as hex
  try {
    console.log('\n--- APPROACH 1: String format encoded as hex ---');
    const outpointStr = formatOutpointAsString(txid, vout);
    const hexInput = Buffer.from(outpointStr).toString('hex');
    
    console.log(`Outpoint string: ${outpointStr}`);
    console.log(`Hex-encoded: ${hexInput}`);
    
    const result = await callMetashrewApi('metashrew_view', ['trace', hexInput, 'latest']);
    
    console.log('Success with string format!');
    console.log('Result:', truncateResult(result));
    return result;
  } catch (error) {
    console.error('String format failed:', error.message);
    
    // Format 2: Try with just the txid and passing vout as separate parameter
    try {
      console.log('\n--- APPROACH 2: Just txid, separate vout parameter ---');
      const params = ['trace', txid, vout.toString(), 'latest'];
      console.log(`Params: ${JSON.stringify(params)}`);
      
      const result = await callMetashrewApi('metashrew_view', params);
      
      console.log('Success with separate parameters!');
      console.log('Result:', truncateResult(result));
      return result;
    } catch (error) {
      console.error('Separate parameters failed:', error.message);
      
      // Format 3: Try passing txid+vout as a JSON object
      try {
        console.log('\n--- APPROACH 3: JSON object format ---');
        const outpointObj = { txid, vout };
        const jsonStr = JSON.stringify(outpointObj);
        const hexInput = Buffer.from(jsonStr).toString('hex');
        
        console.log(`Outpoint JSON: ${jsonStr}`);
        console.log(`Hex-encoded: ${hexInput}`);
        
        const result = await callMetashrewApi('metashrew_view', ['trace', hexInput, 'latest']);
        
        console.log('Success with JSON object format!');
        console.log('Result:', truncateResult(result));
        return result;
      } catch (error) {
        console.error('JSON object format failed:', error.message);
        throw new Error('All trace format approaches failed');
      }
    }
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

testTraceFormats(TXID, VOUT)
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
