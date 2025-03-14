// Test script for Alkanes transaction tracing using approaches similar to the oyl SDK
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
 * Approach #1: Using alkanes_trace (as suggested by the naming pattern in alkanes-explorer)
 */
async function testAlkanesTrace() {
  console.log('\n=== APPROACH #1: Using alkanes_trace method ===');
  try {
    // Format parameter as an object with outpoint
    const params = [{ 
      outpoint: { 
        txid: TXID, 
        vout: VOUT 
      }
    }];
    
    const result = await callMetashrewApi('alkanes_trace', params);
    console.log('Success! Trace result:', result);
    return result;
  } catch (error) {
    console.error('Error with alkanes_trace approach:', error.message);
    return null;
  }
}

/**
 * Approach #2: Using OYL SDK-style format with 'function' parameter
 */
async function testOylSdkFormat() {
  console.log('\n=== APPROACH #2: Using OYL SDK-style format ===');
  try {
    // Format similar to how GraphQL or other high-level SDKs might call it
    const params = [{
      function: 'trace',
      outpoint: `${TXID}:${VOUT}`
    }];
    
    const result = await callMetashrewApi('metashrew_view', params);
    console.log('Success! Trace result:', result);
    return result;
  } catch (error) {
    console.error('Error with OYL SDK-style format:', error.message);
    return null;
  }
}

/**
 * Approach #3: Using direct API call with specific prefix format
 */
async function testDirectApiCall() {
  console.log('\n=== APPROACH #3: Using direct API call with outpoint string ===');
  try {
    // Different format used in some APIs where outpoint is passed as a single string
    const outpointStr = `${TXID}:${VOUT}`;
    const result = await callMetashrewApi('metashrew_traceOutpoint', [outpointStr]);
    console.log('Success! Trace result:', result);
    return result;
  } catch (error) {
    console.error('Error with direct API call:', error.message);
    return null;
  }
}

/**
 * Approach #4: Using alkanes_traceTransaction
 */
async function testAlkanesTraceTransaction() {
  console.log('\n=== APPROACH #4: Using alkanes_traceTransaction method ===');
  try {
    // Format with transaction parameter
    const params = [{ 
      transaction: {
        txid: TXID,
        vout: VOUT
      }
    }];
    
    const result = await callMetashrewApi('alkanes_traceTransaction', params);
    console.log('Success! Trace result:', result);
    return result;
  } catch (error) {
    console.error('Error with alkanes_traceTransaction approach:', error.message);
    return null;
  }
}

/**
 * Approach #5: Using alkanes_traceOutpoint
 */
async function testAlkanesTraceOutpoint() {
  console.log('\n=== APPROACH #5: Using outpoint parameter format ===');
  try {
    // Format that specifically uses outpoint
    const outpoint = `${TXID}:${VOUT}`;
    const result = await callMetashrewApi('metashrew_trace', [outpoint]);
    console.log('Success! Trace result:', result);
    return result;
  } catch (error) {
    console.error('Error with outpoint parameter format:', error.message);
    return null;
  }
}

/**
 * Run all approaches to see which one works
 */
async function runAllApproaches() {
  console.log(`Testing trace for transaction ${TXID}:${VOUT}`);
  console.log(`Using API URL: ${METASHREW_API_URL}`);
  
  await testAlkanesTrace();
  await testOylSdkFormat();
  await testDirectApiCall();
  await testAlkanesTraceTransaction();
  await testAlkanesTraceOutpoint();
  
  console.log('\nTest completed. Check the results to see if any approach succeeded.');
}

runAllApproaches().catch(console.error);
