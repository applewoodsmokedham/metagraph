// Test script specifically for the alkanes_traceblock method
require('dotenv').config();
const axios = require('axios');

// Configuration
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';

// Block to test
const BLOCK_HEIGHT = 887380; // Block with known Alkanes transactions

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
    console.error(`Metashrew API call failed for method ${method}:`, error.message);
    throw error;
  }
}

/**
 * Test the alkanes_traceblock method with different formats
 */
async function testAlkanesTraceBlock() {
  console.log(`Testing alkanes_traceblock for block ${BLOCK_HEIGHT}...`);
  
  try {
    // Format 1: Using alkanes_traceblock with block height parameter
    const heightHex = '0x' + BLOCK_HEIGHT.toString(16).padStart(8, '0');
    console.log(`Block height in hex: ${heightHex}`);
    
    // Approach 1: Direct method with block height as parameter
    try {
      console.log('\n=== Testing direct alkanes_traceblock call ===');
      const result1 = await callMetashrewApi('alkanes_traceblock', [BLOCK_HEIGHT]);
      console.log('Success with direct alkanes_traceblock call!');
      console.log('Result type:', typeof result1);
      console.log('Result preview:', truncateResult(result1));
      return result1;
    } catch (error) {
      console.error('Error with direct alkanes_traceblock call:', error.message);
      
      // Approach 2: Using object format with block parameter
      try {
        console.log('\n=== Testing object format ===');
        const result2 = await callMetashrewApi('alkanes_traceblock', [{ block: BLOCK_HEIGHT }]);
        console.log('Success with object format!');
        console.log('Result type:', typeof result2);
        console.log('Result preview:', truncateResult(result2));
        return result2;
      } catch (error) {
        console.error('Error with object format:', error.message);
        
        // Approach 3: Using hex format
        try {
          console.log('\n=== Testing hex format ===');
          const result3 = await callMetashrewApi('alkanes_traceblock', [heightHex]);
          console.log('Success with hex format!');
          console.log('Result type:', typeof result3);
          console.log('Result preview:', truncateResult(result3));
          return result3;
        } catch (error) {
          console.error('Error with hex format:', error.message);
          
          // Approach 4: Using metashrew_view
          try {
            console.log('\n=== Testing metashrew_view approach ===');
            const result4 = await callMetashrewApi('metashrew_view', ['traceblock', heightHex, 'latest']);
            console.log('Success with metashrew_view approach!');
            console.log('Result type:', typeof result4);
            console.log('Result preview:', truncateResult(result4));
            return result4;
          } catch (error) {
            console.error('Error with metashrew_view approach:', error.message);
            
            // Approach 5: Using multicall format
            try {
              console.log('\n=== Testing sandshrew_multicall approach ===');
              const calls = [["alkanes_traceblock", [heightHex]]];
              const result5 = await callMetashrewApi('sandshrew_multicall', [calls]);
              console.log('Success with sandshrew_multicall approach!');
              console.log('Result type:', typeof result5);
              console.log('Result preview:', truncateResult(result5));
              return result5;
            } catch (error) {
              console.error('Error with sandshrew_multicall approach:', error.message);
              throw new Error('All approaches failed');
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('All alkanes_traceblock approaches failed:', error.message);
    return null;
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
console.log(`Testing alkanes_traceblock with Metashrew API at: ${METASHREW_API_URL}`);
testAlkanesTraceBlock()
  .then(result => {
    if (result) {
      console.log('\nSuccessfully retrieved block trace data!');
    } else {
      console.log('\nFailed to retrieve block trace data.');
    }
  })
  .catch(error => {
    console.error('Test failed:', error.message);
  });
