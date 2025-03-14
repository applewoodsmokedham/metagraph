// Test script for the new trace implementation
// This is a temporary script to test before fully integrating into the website
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
const SANDSHREW_PROJECT_ID = process.env.SANDSHREW_PROJECT_ID || '';
const TXID = '9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e';

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
 * Call a Metashrew view function via metashrew_view
 */
async function callView(viewName, hexInput, blockTag = 'latest') {
  return callMetashrewApi('metashrew_view', [viewName, hexInput, blockTag]);
}

/**
 * Try an alternative approach using protorunesbyoutpoint
 * This may give us insight into the transaction even if direct trace fails
 */
async function getProtorunesForOutpoint(txid, vout) {
  console.log(`Getting protorunes for outpoint ${txid}:${vout}`);
  
  try {
    // First, try with standard Json encoding 
    const outpoint = { txid, vout };
    const hexInput = Buffer.from(JSON.stringify(outpoint)).toString('hex');
    
    console.log('Using hex input:', hexInput);
    const result = await callView('protorunesbyoutpoint', hexInput);
    
    if (result) {
      console.log('Found protorunes data!');
      return result;
    }
  } catch (error) {
    console.error('Standard encoding failed:', error.message);
    
    // If that fails, try with an alternative format
    try {
      // Simple txid:vout string format
      const outpointString = `${txid}:${vout}`;
      const hexInput = Buffer.from(outpointString).toString('hex');
      
      console.log('Using alternative hex input:', hexInput);
      const result = await callView('protorunesbyoutpoint', hexInput);
      
      if (result) {
        console.log('Found protorunes data with alternative format!');
        return result;
      }
    } catch (error) {
      console.error('Alternative format failed:', error.message);
    }
  }
  
  console.log('No protorunes data found for this outpoint');
  return null;
}

/**
 * Get transaction details - this is crucial for understanding the structure
 */
async function getTransactionDetails(txid) {
  console.log(`Getting transaction details for ${txid}`);
  
  try {
    const result = await callMetashrewApi('getrawtransaction', [txid, true]);
    
    if (result) {
      console.log(`Transaction has ${result.vout?.length || 0} outputs`);
      // For Alkanes transactions, check for OP_RETURN outputs
      const hasOpReturn = result.vout?.some(vout => 
        vout.scriptPubKey?.type === 'nulldata'
      );
      
      if (hasOpReturn) {
        console.log('Transaction contains OP_RETURN output (typical for Alkanes)');
      }
      
      return result;
    }
  } catch (error) {
    console.error('Failed to get transaction details:', error.message);
  }
  
  return null;
}

/**
 * Parse OP_RETURN data to check if it's an Alkanes operation
 */
function parseOpReturnForAlkanes(vout) {
  if (!vout || !vout.scriptPubKey || vout.scriptPubKey.type !== 'nulldata') {
    return null;
  }
  
  try {
    const asm = vout.scriptPubKey.asm;
    if (!asm) return null;
    
    console.log('OP_RETURN ASM:', asm);
    
    // Check for Alkanes markers - can be customized based on protocol specifics
    if (asm.includes('OP_RETURN')) {
      const parts = asm.split(' ');
      // Skip OP_RETURN and look at the data
      if (parts.length >= 3) {
        // The third part is often a length indicator
        const dataHex = parts.slice(2).join('');
        console.log('OP_RETURN data:', dataHex);
        
        // Try to decode as text to see if there are recognizable patterns
        try {
          const dataBuffer = Buffer.from(dataHex, 'hex');
          const dataText = dataBuffer.toString('utf8');
          console.log('OP_RETURN as text:', dataText.replace(/[^\x20-\x7E]/g, '.'));
        } catch (e) {
          // Ignore decode errors
        }
        
        return { dataHex };
      }
    }
  } catch (error) {
    console.error('Error parsing OP_RETURN:', error.message);
  }
  
  return null;
}

/**
 * Try various API methods to get any kind of data about an Alkanes transaction
 */
async function getAllAvailableData(txid) {
  console.log(`Gathering all available data for transaction ${txid}`);
  
  const result = {
    txid,
    transactionDetails: null,
    opReturnData: null,
    protorunesData: [],
    blockHeight: null,
    timestamp: new Date().toISOString()
  };
  
  // First, get the basic transaction details
  const txDetails = await getTransactionDetails(txid);
  result.transactionDetails = txDetails;
  
  if (txDetails) {
    // Check for OP_RETURN output and parse it
    for (let i = 0; i < txDetails.vout.length; i++) {
      const vout = txDetails.vout[i];
      if (vout.scriptPubKey?.type === 'nulldata') {
        result.opReturnData = parseOpReturnForAlkanes(vout);
        break;
      }
    }
    
    // Extract the block height
    if (txDetails.height) {
      result.blockHeight = txDetails.height;
    } else if (txDetails.blockhash) {
      try {
        const blockHeader = await callMetashrewApi('getblockheader', [txDetails.blockhash]);
        if (blockHeader && blockHeader.height) {
          result.blockHeight = blockHeader.height;
        }
      } catch (error) {
        console.error('Failed to get block height:', error.message);
      }
    }
    
    // Try to get protorunes data for each vout
    for (let i = 0; i < txDetails.vout.length; i++) {
      try {
        const protorunesData = await getProtorunesForOutpoint(txid, i);
        if (protorunesData) {
          result.protorunesData.push({ vout: i, data: protorunesData });
        }
      } catch (error) {
        // Continue to the next vout on error
      }
    }
  }
  
  return result;
}

/**
 * Main execution
 */
async function main() {
  console.log(`Testing trace integration for transaction: ${TXID}`);
  console.log(`API URL: ${METASHREW_API_URL}`);
  
  try {
    // Get all available data about the transaction
    const allData = await getAllAvailableData(TXID);
    
    // Save the results to a file
    const outputFile = `transaction-data-${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
    
    console.log(`\nData collection complete. Results saved to ${outputFile}`);
    
    // Summary
    console.log('\n===== SUMMARY =====');
    console.log(`Transaction: ${TXID}`);
    
    if (allData.transactionDetails) {
      console.log(`Confirmed: This is a valid transaction with ${allData.transactionDetails.vout.length} outputs`);
      
      if (allData.opReturnData) {
        console.log('Contains OP_RETURN data consistent with Alkanes operations');
      } else {
        console.log('Does not contain recognizable OP_RETURN data');
      }
      
      if (allData.protorunesData.length > 0) {
        console.log(`Found protorunes data for ${allData.protorunesData.length} outputs`);
      } else {
        console.log('No protorunes data found');
      }
      
      if (allData.blockHeight) {
        console.log(`Block height: ${allData.blockHeight}`);
      }
    } else {
      console.log('Could not retrieve transaction details');
    }
    
    console.log('\nRecommendations for website integration:');
    console.log('1. Focus on extracting and displaying OP_RETURN data for Alkanes transactions');
    console.log('2. Use protorunesbyoutpoint as a fallback when direct trace calls fail');
    console.log('3. Consider implementing a block-level view showing all Alkanes transactions in a block');
  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error.message);
});
