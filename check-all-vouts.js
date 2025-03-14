// Script to check all vout values in a transaction for trace data
require('dotenv').config();
const axios = require('axios');

// Configuration
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';

// The transaction to check
const TXID = '9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e';
const MAX_VOUT = 5;

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
 * Check if an outpoint has trace data
 */
async function checkOutpoint(txid, vout) {
  console.log(`\nChecking outpoint ${txid}:${vout}`);
  
  try {
    // Format the outpoint as expected by the API
    const outpoint = { txid, vout };
    
    // Call the alkanes_trace function directly
    const result = await callMetashrewApi('alkanes_trace', [outpoint]);
    
    if (!result || (Array.isArray(result) && result.length === 0)) {
      console.log(`✘ No trace data found for vout=${vout}`);
      return { vout, hasData: false };
    }
    
    console.log(`✓ FOUND TRACE DATA for vout=${vout}!`);
    console.log('Result type:', typeof result);
    console.log('Is array:', Array.isArray(result));
    console.log('Length:', Array.isArray(result) ? result.length : 'N/A');
    
    if (Array.isArray(result) && result.length > 0) {
      console.log('First item preview:', JSON.stringify(result[0], null, 2).substring(0, 500));
    } else if (typeof result === 'object') {
      console.log('Result preview:', JSON.stringify(result, null, 2).substring(0, 500));
    } else {
      console.log('Result preview:', String(result).substring(0, 500));
    }
    
    return { vout, hasData: true, result };
  } catch (error) {
    console.error(`Error checking vout=${vout}:`, error.message);
    return { vout, hasData: false, error: error.message };
  }
}

/**
 * Check all vout values for a transaction
 */
async function checkAllVouts(txid, maxVout) {
  console.log(`Checking vouts 0-${maxVout} for transaction ${txid}`);
  
  const results = [];
  
  for (let vout = 0; vout <= maxVout; vout++) {
    try {
      const result = await checkOutpoint(txid, vout);
      results.push(result);
    } catch (error) {
      console.error(`Failed to check vout=${vout}:`, error.message);
      results.push({ vout, hasData: false, error: error.message });
    }
  }
  
  return results;
}

// Main execution
console.log(`Checking all vout values for transaction: ${TXID}`);
console.log(`API URL: ${METASHREW_API_URL}`);

checkAllVouts(TXID, MAX_VOUT)
  .then(results => {
    console.log('\n===== SUMMARY =====');
    const withData = results.filter(r => r.hasData);
    
    if (withData.length === 0) {
      console.log('No trace data found in any vout (0-5)');
    } else {
      console.log(`Found trace data in ${withData.length} vout(s):`);
      withData.forEach(r => console.log(`- vout=${r.vout}`));
    }
  })
  .catch(error => {
    console.error('Fatal error:', error.message);
  });
