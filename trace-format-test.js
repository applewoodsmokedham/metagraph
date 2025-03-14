// Test script for Alkanes transaction tracing following the documented API format
require('dotenv').config();
const axios = require('axios');

// Configuration
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'http://localhost:8080';
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
    console.log(`Calling Metashrew API ${method} with params:`, JSON.stringify(params));
    
    const response = await apiClient.post('', {
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

/**
 * Create properly formatted hex input for a trace call
 * @param {string} txid - The transaction ID
 * @param {number} vout - The output index
 * @returns {string} - Hex-encoded outpoint
 */
function encodeOutpoint(txid, vout) {
  // First ensure txid has correct format (no 0x prefix, lowercase)
  const formattedTxid = txid.toLowerCase().replace(/^0x/, '');
  
  // Convert txid to byte array (little-endian)
  const txidBytes = [];
  for (let i = 0; i < formattedTxid.length; i += 2) {
    txidBytes.unshift(parseInt(formattedTxid.substr(i, 2), 16));
  }
  
  // Encode vout as 4-byte little-endian
  const voutBytes = [];
  let v = vout;
  for (let i = 0; i < 4; i++) {
    voutBytes.push(v & 0xff);
    v >>>= 8;
  }
  
  // Combine txid (32 bytes) and vout (4 bytes)
  const outpointBytes = [...txidBytes, ...voutBytes];
  
  // Convert to hex string
  return Buffer.from(outpointBytes).toString('hex');
}

/**
 * Another approach to encode outpoint with less manual byte manipulation
 */
function encodeOutpointSimpler(txid, vout) {
  // Create object with the txid and vout
  const outpoint = { txid, vout };
  
  // Convert to JSON string and then to hex
  return Buffer.from(JSON.stringify(outpoint)).toString('hex');
}

/**
 * String format approach
 */
function encodeOutpointAsString(txid, vout) {
  return `${txid}:${vout}`;
}

/**
 * Call trace using the documented metashrew_view pattern
 */
async function testTraceWithMetashrewView() {
  console.log('\n=== Testing standard metashrew_view with trace function ===');
  
  try {
    // Try the object format first
    const outpoint = { txid: TXID, vout: VOUT };
    const hexInput = Buffer.from(JSON.stringify(outpoint)).toString('hex');
    
    console.log(`Outpoint object:`, outpoint);
    console.log(`Hex-encoded outpoint: ${hexInput}`);
    
    const result = await callMetashrewApi('metashrew_view', ['trace', hexInput, 'latest']);
    console.log('Success! Trace result:', result);
    return result;
  } catch (error) {
    console.error('Error with standard metashrew_view approach:', error.message);
    return null;
  }
}

/**
 * Test alternative formats via multicall
 */
async function testMultipleFormatsViaBatch() {
  console.log('\n=== Testing multiple formats via batch call ===');
  
  try {
    // Prepare different formats to try
    const simpleFormat = encodeOutpointSimpler(TXID, VOUT);
    const stringFormat = encodeOutpointAsString(TXID, VOUT);
    const stringHex = Buffer.from(stringFormat).toString('hex');
    
    // Create array of calls with different formats
    const calls = [
      ['metashrew_view', ['trace', simpleFormat, 'latest']],
      ['metashrew_view', ['trace', stringHex, 'latest']]
    ];
    
    console.log('Trying multiple formats:', {
      simpleFormat,
      stringFormat,
      stringHex
    });
    
    // Make batch call
    const results = await callMetashrewApi('sandshrew_multicall', [calls]);
    console.log('Batch call results:', results);
    
    // Check if any approach worked
    const successIndex = results.findIndex(result => result && !result.error);
    if (successIndex >= 0) {
      console.log(`Format at index ${successIndex} worked!`);
    } else {
      console.log('None of the tested formats worked.');
    }
    
    return results;
  } catch (error) {
    console.error('Error with batch test:', error.message);
    return null;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`Testing trace for transaction ${TXID}:${VOUT}`);
  console.log(`Using API URL: ${METASHREW_API_URL}`);
  
  // Try the standard approach first
  await testTraceWithMetashrewView();
  
  // Try multiple formats in batch
  await testMultipleFormatsViaBatch();
  
  console.log('\nTests completed.');
}

// Run the tests
runTests().catch(console.error);
