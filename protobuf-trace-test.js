// Test script using protobuf encoding for transaction tracing
require('dotenv').config();
const axios = require('axios');
const protobuf = require('protobufjs');

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
 * Encode an outpoint (txid + vout) for use in trace calls
 * This uses protobuf encoding following the implementation in client.ts
 */
function encodeOutpoint(txid, vout) {
  // Create a new protobuf root
  const root = new protobuf.Root();
  
  // Define the Outpoint message type
  const Outpoint = root.define('Outpoint')
    .add(new protobuf.Field('txid', 1, 'bytes'))
    .add(new protobuf.Field('vout', 2, 'uint32'));
  
  // Compile the message type
  const compiled = Outpoint.setup();
  
  // Convert txid to bytes (reverse the order as Bitcoin uses little-endian)
  // Remove 0x prefix if present
  const txidNormalized = txid.startsWith('0x') ? txid.slice(2) : txid;
  const txidBuffer = Buffer.from(txidNormalized, 'hex');
  
  // Bitcoin uses little-endian for txids, so we need to reverse the bytes
  const txidBytes = Buffer.from(txidBuffer).reverse();
  
  // Create the message object
  const message = {
    txid: txidBytes,
    vout: vout
  };
  
  // Encode the message to a buffer
  const buffer = compiled.encode(message).finish();
  
  // Convert to hex string with 0x prefix
  return '0x' + Buffer.from(buffer).toString('hex');
}

/**
 * Trace a transaction using metashrew_view with protobuf encoding
 */
async function traceTransaction(txid, vout) {
  console.log(`\nTracing transaction ${txid}:${vout} with metashrew_view...`);
  
  try {
    // Format the outpoint using protobuf encoding
    const hexInput = encodeOutpoint(txid, vout);
    console.log('Protobuf-encoded outpoint:', hexInput);
    
    // Call the trace function through metashrew_view
    const result = await callMetashrewApi('metashrew_view', ['trace', hexInput, 'latest']);
    
    console.log('Trace successful!');
    console.log('Result type:', typeof result);
    console.log('Result preview:', truncateResult(result));
    
    return result;
  } catch (error) {
    console.error('Trace failed:', error.message);
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
      
      // Check if result contains meaningful data
      if (typeof result === 'string' && result.length > 0) {
        // Try to decode the result - it might be hex encoded
        try {
          const buffer = Buffer.from(result.replace(/^0x/, ''), 'hex');
          console.log('Decoded buffer length:', buffer.length);
          console.log('First 200 bytes (hex):', buffer.slice(0, 200).toString('hex'));
          
          // If it looks like text, try to display it
          const textPreview = buffer.toString('utf8', 0, 200);
          if (/[\x20-\x7E]/.test(textPreview)) {
            console.log('Result as text (first 200 chars):', textPreview.replace(/[^\x20-\x7E]/g, '.'));
          }
        } catch (error) {
          console.error('Error decoding result:', error.message);
        }
      }
    } else {
      console.log('\nNo trace data was returned (null or empty result).');
    }
  })
  .catch(error => {
    console.error('\nTest failed:', error.message);
  });
