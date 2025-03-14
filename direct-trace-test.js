// Direct trace method test script
require('dotenv').config();
const axios = require('axios');

// Configuration
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';

// Sample Alkanes transaction
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
    console.log(`Calling Metashrew API method "${method}" with params:`, JSON.stringify(params, null, 2));
    
    const response = await apiClient.post('', {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });

    if (response.data.error) {
      throw new Error(`Metashrew API Error: ${response.data.error.message || JSON.stringify(response.data.error)}`);
    }
    
    console.log(`Response from ${method}:`, response.data.result ? 'Success!' : 'No result');
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
 * Try multiple formats for direct trace calls
 */
async function testTraceDirectCall() {
  console.log('Testing direct trace API calls with different parameter formats\n');
  
  // Approach 1: Pass the outpoint as a JSON object
  try {
    console.log('\n--- APPROACH 1: Outpoint as JSON object ---');
    const outpoint = { txid: TXID, vout: VOUT };
    console.log('Outpoint:', outpoint);
    
    const result = await callMetashrewApi('trace', [outpoint]);
    
    console.log('Success with JSON object!');
    console.log('Result type:', typeof result);
    console.log('Result preview:', truncateResult(result));
    
    return { approach: 1, result };
  } catch (error) {
    console.error('JSON object approach failed:', error.message);
    
    // Approach 2: Pass txid and vout as separate parameters
    try {
      console.log('\n--- APPROACH 2: txid and vout as separate parameters ---');
      console.log('Parameters:', [TXID, VOUT]);
      
      const result = await callMetashrewApi('trace', [TXID, VOUT]);
      
      console.log('Success with separate parameters!');
      console.log('Result type:', typeof result);
      console.log('Result preview:', truncateResult(result));
      
      return { approach: 2, result };
    } catch (error) {
      console.error('Separate parameters approach failed:', error.message);
      
      // Approach 3: Pass txid:vout string
      try {
        console.log('\n--- APPROACH 3: txid:vout as string ---');
        const outpointStr = `${TXID}:${VOUT}`;
        console.log('Outpoint string:', outpointStr);
        
        const result = await callMetashrewApi('trace', [outpointStr]);
        
        console.log('Success with string format!');
        console.log('Result type:', typeof result);
        console.log('Result preview:', truncateResult(result));
        
        return { approach: 3, result };
      } catch (error) {
        console.error('String format approach failed:', error.message);
        
        // Approach 4: Try with alkanes_trace method
        try {
          console.log('\n--- APPROACH 4: Using alkanes_trace method ---');
          const outpoint = { txid: TXID, vout: VOUT };
          console.log('Parameters:', [outpoint]);
          
          const result = await callMetashrewApi('alkanes_trace', [outpoint]);
          
          console.log('Success with alkanes_trace!');
          console.log('Result type:', typeof result);
          console.log('Result preview:', truncateResult(result));
          
          return { approach: 4, result };
        } catch (error) {
          console.error('alkanes_trace approach failed:', error.message);
          throw new Error('All direct trace approaches failed');
        }
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
console.log(`Testing direct transaction trace with Metashrew API at: ${METASHREW_API_URL}`);
console.log('Using TXID:', TXID);
console.log('Using VOUT:', VOUT);

testTraceDirectCall()
  .then(({ approach, result }) => {
    console.log(`\nSUCCESS with approach ${approach}!`);
    
    if (result) {
      console.log('Result exists with type:', typeof result);
      
      if (typeof result === 'string' && result.length > 0) {
        // Try to decode the result if it's hex-encoded
        try {
          if (result.startsWith('0x')) {
            result = result.substring(2);
          }
          
          const buffer = Buffer.from(result, 'hex');
          console.log('Decoded buffer length:', buffer.length);
          
          // Check if it looks like text
          const textPreview = buffer.toString('utf8', 0, 100);
          if (/[\x20-\x7E]/.test(textPreview)) {
            console.log('Preview as text:', textPreview.replace(/[^\x20-\x7E]/g, '.'));
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
    console.error('\nAll trace approaches failed:', error.message);
  });
