// Correct format for sandshrew_multicall based on API documentation
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Configuration
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';

// Transaction IDs to test
const TARGET_TXID = '9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e';
const SAMPLE_TXIDS = [
  '4cb697d3e3028c4e82458e620e3b53fe16c37f51e82f261dce1c3e4a5285da3c',
  '5dead174fbf3cf80803bd4d9c05cd411c8d66ee94a5c1d6b2a6b0ea36e7bb9f0'
];

// Create API client
const apiClient = axios.create({
  baseURL: METASHREW_API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Removed Sandshrew Project ID header - API works better without it
  }
});

/**
 * Make a single JSON-RPC call to the Metashrew API
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
 * Create a JSONRPC multicall for tracing transactions
 */
async function traceMultipleTransactions() {
  try {
    console.log('Building multicall request for transaction traces...');
    
    // First, get the current indexer height for reference
    const indexerHeight = await callMetashrewApi('metashrew_height', []);
    console.log(`Current indexer height: ${indexerHeight}`);
    
    // Build the multicall structure for traces
    const calls = [
      // Get traces for target transaction (all vouts)
      ['alkanes_trace', [{ txid: TARGET_TXID, vout: 0 }]],
      ['alkanes_trace', [{ txid: TARGET_TXID, vout: 1 }]],
      ['alkanes_trace', [{ txid: TARGET_TXID, vout: 2 }]],
      
      // Get traces for sample transactions
      ...SAMPLE_TXIDS.map(txid => ['alkanes_trace', [{ txid, vout: 0 }]])
    ];
    
    // Log the exact call structure
    console.log('Multicall structure:');
    console.log(JSON.stringify(calls, null, 2));
    
    // Generate the complete request for reference
    const completeRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'sandshrew_multicall',
      params: [calls]
    };
    
    // Save the request to a file for reference
    fs.writeFileSync('multicall-request.json', JSON.stringify(completeRequest, null, 2));
    console.log('Complete request saved to multicall-request.json');
    
    // Make the multicall request
    console.log('Executing sandshrew_multicall...');
    const results = await callMetashrewApi('sandshrew_multicall', [calls]);
    
    // Process and display results
    console.log('\nMulticall Results:');
    results.forEach((result, index) => {
      const callInfo = calls[index];
      console.log(`\nCall ${index + 1}: ${callInfo[0]} for ${JSON.stringify(callInfo[1])}`);
      console.log('Result:', result ? JSON.stringify(result).slice(0, 100) + '...' : 'No trace data found');
    });
    
    // Save the complete results
    fs.writeFileSync('multicall-results.json', JSON.stringify({
      calls,
      results,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log('\nComplete results saved to multicall-results.json');
    return results;
  } catch (error) {
    console.error('Error in multicall:', error.message);
    throw error;
  }
}

/**
 * Generate a curl command equivalent of the multicall
 */
function generateCurlCommand() {
  const calls = [
    // Get traces for target transaction (all vouts)
    ['alkanes_trace', [{ txid: TARGET_TXID, vout: 0 }]],
    ['alkanes_trace', [{ txid: TARGET_TXID, vout: 1 }]],
    ['alkanes_trace', [{ txid: TARGET_TXID, vout: 2 }]],
    
    // Get traces for sample transactions
    ...SAMPLE_TXIDS.map(txid => ['alkanes_trace', [{ txid, vout: 0 }]])
  ];
  
  const requestBody = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'sandshrew_multicall',
    params: [calls]
  });
  
  console.log(`\nEquivalent curl command:`);
  console.log(`curl -X POST "${METASHREW_API_URL}" \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`   \\`);
  console.log(`  -d '${requestBody}'`);
  
  // Save to a shell script for easy execution
  const curlScript = `#!/bin/bash
# Generated curl command for sandshrew_multicall

curl -X POST "${METASHREW_API_URL}" \\
  -H "Content-Type: application/json" \\
   \\
  -d '${requestBody}'
`;

  fs.writeFileSync('curl-command.sh', curlScript);
  console.log('Curl command saved to curl-command.sh');
}

// Main execution
async function main() {
  console.log(`Testing multicall for transaction: ${TARGET_TXID}`);
  console.log(`API URL: ${METASHREW_API_URL}`);
  
  try {
    // Generate the curl command for reference
    generateCurlCommand();
    
    // Execute the multicall
    await traceMultipleTransactions();
    
  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error.message);
});
