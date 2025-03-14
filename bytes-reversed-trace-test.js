// Test script for tracing Alkanes transactions with byte-reversed txids
require('dotenv').config();
const axios = require('axios');

// Configuration
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';
const API_KEY = process.env.SANDSHREW_PROJECT_ID || 'lasereyes'; // Use default if not provided

// Transaction ID known to have Alkanes activity
const TEST_TXID = '9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e';

// Create API client
const apiClient = axios.create({
  baseURL: METASHREW_API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Removed Sandshrew Project ID header - API works better without it
  }
});

/**
 * Reverse bytes in a hex string (for txid conversion)
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
      throw new Error(`API Error: ${JSON.stringify(response.data.error)}`);
    }
    
    return response.data.result;
  } catch (error) {
    console.error(`API call failed for method ${method}:`, error.message);
    throw error;
  }
}

/**
 * Trace an Alkanes transaction with both original and reversed txids
 */
async function testTraceWithBothTxids(txid, vout = 1) {
  console.log(`===== Testing transaction ${txid} =====`);
  
  // Attempt with original txid first (should fail or return empty)
  try {
    console.log(`\nTesting with ORIGINAL txid: ${txid}`);
    const originalResult = await callMetashrewApi('alkanes_trace', [{ txid, vout }]);
    console.log(`Original txid result (probably empty): ${JSON.stringify(originalResult)}`);
  } catch (error) {
    console.log(`Error with original txid: ${error.message}`);
  }
  
  // Reverse the txid and try again (should work)
  const reversedTxid = reverseBytes(txid);
  try {
    console.log(`\nTesting with REVERSED txid: ${reversedTxid}`);
    const reversedResult = await callMetashrewApi('alkanes_trace', [{ txid: reversedTxid, vout }]);
    console.log(`Reversed txid result: ${JSON.stringify(reversedResult).slice(0, 500)}... (truncated)`);
    if (reversedResult && reversedResult.length > 0) {
      console.log(`SUCCESS! Got trace data with reversed txid`);
    } else {
      console.log(`No trace data found even with reversed txid. Try different vout values.`);
    }
  } catch (error) {
    console.log(`Error with reversed txid: ${error.message}`);
  }
}

/**
 * Test vout discovery for a given txid
 */
async function testAllVouts(txid, maxVout = 10) {
  console.log(`\n===== Testing all vouts for transaction ${txid} =====`);
  const reversedTxid = reverseBytes(txid);
  
  for (let vout = 0; vout <= maxVout; vout++) {
    try {
      console.log(`Testing vout ${vout}...`);
      const result = await callMetashrewApi('alkanes_trace', [{ txid: reversedTxid, vout }]);
      
      if (result && result.length > 0) {
        console.log(`SUCCESS! Found trace data at vout ${vout}`);
        console.log(`Result: ${JSON.stringify(result).slice(0, 200)}... (truncated)`);
        return { vout, result }; // Return on first success
      } else {
        console.log(`No trace data at vout ${vout}`);
      }
    } catch (error) {
      console.log(`Error at vout ${vout}: ${error.message}`);
    }
  }
  
  console.log(`No trace data found in any vout from 0 to ${maxVout}`);
  return null;
}

// Main execution function
async function main() {
  try {
    console.log('Testing Alkanes transaction tracing with byte-reversed txids');
    console.log(`API URL: ${METASHREW_API_URL}`);
    console.log(`API KEY: ${API_KEY.substring(0, 3)}...${API_KEY.substring(API_KEY.length - 3)}`);
    
    // Test with the specified transaction
    await testTraceWithBothTxids(TEST_TXID, 1);
    
    // Try to find which vout has the trace data
    await testAllVouts(TEST_TXID, 8);
    
    // Additional test with the example transaction from flex
    const FLEX_TXID = '9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e';
    await testAllVouts(FLEX_TXID, 8);
    
  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

// Run the main function
main();
