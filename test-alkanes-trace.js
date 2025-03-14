// Test script for Alkanes transaction tracing
require('dotenv').config();
const axios = require('axios');

// Configuration
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'http://localhost:8080';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';

// Sample Alkanes transaction that we found earlier
const TXID = '9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e';
const VOUT = 1; // We need to specify the correct vout

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
 * Call a Metashrew view function
 */
async function callView(viewName, hexInput, blockTag = 'latest') {
  return callMetashrewApi('metashrew_view', [viewName, hexInput, blockTag]);
}

/**
 * Trace a transaction using direct trace call
 */
async function traceTransaction(txid, vout) {
  const outpoint = { txid, vout };
  console.log(`Creating outpoint:`, outpoint);
  
  const hexInput = Buffer.from(JSON.stringify(outpoint)).toString('hex');
  console.log(`Hex input: ${hexInput}`);
  
  return callView('trace', hexInput);
}

/**
 * Trace a transaction using trace method directly
 */
async function directTraceCall(txid, vout) {
  console.log(`Trying direct trace call for ${txid}:${vout}`);
  
  try {
    // Format the parameters exactly for the trace call
    const result = await callMetashrewApi('trace', [`${txid}:${vout}`]);
    return result;
  } catch (error) {
    console.error(`Direct trace call failed:`, error.message);
    throw error;
  }
}

/**
 * Run multiple trace approaches
 */
async function runTraceTests() {
  console.log(`Testing trace for transaction ${TXID}:${VOUT}`);
  console.log(`Using API URL: ${METASHREW_API_URL}`);
  
  // Try approach 1: Using metashrew_view with 'trace'
  console.log('\n=== APPROACH 1: Using metashrew_view with trace ===');
  try {
    const result = await traceTransaction(TXID, VOUT);
    console.log(`Success! Trace result:`, result);
  } catch (error) {
    console.error(`Error with approach 1:`, error.message);
  }
  
  // Try approach 2: Direct trace call
  console.log('\n=== APPROACH 2: Using direct trace call ===');
  try {
    const result = await directTraceCall(TXID, VOUT);
    console.log(`Success! Trace result:`, result);
  } catch (error) {
    console.error(`Error with approach 2:`, error.message);
  }
  
  // Try approach 3: Using JSON-RPC 'trace' method with stringified parameters
  console.log('\n=== APPROACH 3: Using trace with string parameter ===');
  try {
    const outpointStr = `${TXID}:${VOUT}`;
    const result = await callMetashrewApi('trace', [outpointStr]);
    console.log(`Success! Trace result:`, result);
  } catch (error) {
    console.error(`Error with approach 3:`, error.message);
  }
  
  // Try approach 4: Using string input with metashrew_view
  console.log('\n=== APPROACH 4: Using metashrew_view with string input ===');
  try {
    const hexInput = Buffer.from(`${TXID}:${VOUT}`).toString('hex');
    const result = await callView('trace', hexInput);
    console.log(`Success! Trace result:`, result);
  } catch (error) {
    console.error(`Error with approach 4:`, error.message);
  }
}

// Run the tests
runTraceTests().catch(console.error);
