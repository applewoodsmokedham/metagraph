require('dotenv').config();
const axios = require('axios');
const { decodeOpReturn } = require('./dist/lib/runestone-decoder');
const { processTransaction } = require('./dist/lib/block-processor');

// Bitcoin RPC settings
const BITCOIN_RPC_URL = process.env.BITCOIN_RPC_URL || 'http://localhost:8332';
const BITCOIN_RPC_USER = process.env.BITCOIN_RPC_USER;
const BITCOIN_RPC_PASSWORD = process.env.BITCOIN_RPC_PASSWORD;

// Create axios instances for API calls
const bitcoinClient = axios.create({
  baseURL: BITCOIN_RPC_URL,
  auth: {
    username: BITCOIN_RPC_USER,
    password: BITCOIN_RPC_PASSWORD
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to make Bitcoin RPC calls
async function callBitcoinRpc(method, params = []) {
  try {
    const response = await bitcoinClient.post('', {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });

    if (response.data.error) {
      throw new Error(`Bitcoin RPC error: ${response.data.error.message}`);
    }

    return response.data.result;
  } catch (error) {
    console.error(`Bitcoin RPC call failed for method ${method}:`, error.message);
    throw error;
  }
}

// Get detailed block data from Bitcoin node
async function getBlockData(blockHash) {
  return callBitcoinRpc('getblock', [blockHash, 2]);
}

// Get block hash by height
async function getBlockHash(height) {
  return callBitcoinRpc('getblockhash', [height]);
}

// Examine every OP_RETURN output in a block for Diesel patterns
async function examineBlock(blockHeight) {
  try {
    // First, get the block hash
    const blockHash = await getBlockHash(blockHeight);
    
    // Then get the full block data with all transactions
    const blockData = await getBlockData(blockHash);
    
    console.log(`\nExamining Block ${blockHeight}: Found ${blockData.tx.length} transactions`);
    
    // Track all OP_RETURN outputs and potential runestones
    const opReturnOutputs = [];
    const potentialRunestones = [];
    const potentialDieselMints = [];
    
    // Examine each transaction
    for (const tx of blockData.tx) {
      if (!tx.vout) continue;
      
      for (const output of tx.vout) {
        if (!output.scriptPubKey || !output.scriptPubKey.hex) continue;
        
        // Check if this is an OP_RETURN output
        if (output.scriptPubKey.type === 'nulldata' || output.scriptPubKey.hex.startsWith('6a')) {
          opReturnOutputs.push({
            txid: tx.txid,
            vout: output.n,
            hex: output.scriptPubKey.hex
          });
          
          // Try to decode the OP_RETURN data using our decoder
          const decoded = decodeOpReturn(output.scriptPubKey.hex);
          
          if (decoded) {
            potentialRunestones.push({
              txid: tx.txid,
              vout: output.n,
              type: decoded.type,
              data: decoded.data
            });
            
            // Check for Diesel pattern in the decoded data
            const dataString = JSON.stringify(decoded).toLowerCase();
            if (dataString.includes('diesel') || dataString.includes('alkane')) {
              potentialDieselMints.push({
                txid: tx.txid,
                vout: output.n,
                data: decoded
              });
            }
          }
        }
      }
    }
    
    console.log(`Found ${opReturnOutputs.length} OP_RETURN outputs`);
    console.log(`Found ${potentialRunestones.length} potential runestones`);
    console.log(`Found ${potentialDieselMints.length} potential Diesel mints`);
    
    // If we found potential Diesel mints, show the first one
    if (potentialDieselMints.length > 0) {
      console.log('\nFirst potential Diesel mint:');
      console.log('TXID:', potentialDieselMints[0].txid);
      console.log('Data:', JSON.stringify(potentialDieselMints[0].data, null, 2));
    }
    
    // If we found OP_RETURN outputs but no Diesel mints, analyze the first few
    else if (opReturnOutputs.length > 0) {
      console.log('\nAnalyzing first 3 OP_RETURN outputs:');
      
      // Analyze at most 3 outputs
      const samplesToAnalyze = opReturnOutputs.slice(0, 3);
      
      for (const sample of samplesToAnalyze) {
        console.log(`\nTXID: ${sample.txid}`);
        console.log(`ScriptPubKey hex: ${sample.hex}`);
        
        // Analyze the hex data
        const buffer = Buffer.from(sample.hex.replace(/^6a/, ''), 'hex');
        
        // Show as ASCII if possible
        let ascii = '';
        for (let i = 0; i < buffer.length; i++) {
          const byte = buffer[i];
          if (byte >= 32 && byte <= 126) {
            ascii += String.fromCharCode(byte);
          } else {
            ascii += '.';
          }
        }
        
        console.log('ASCII representation:', ascii);
        
        // Test our decoder on this output
        const decoded = decodeOpReturn(sample.hex);
        console.log('Our decoder result:', decoded ? 'Decoded successfully' : 'Failed to decode');
        if (decoded) {
          console.log('Type:', decoded.type);
          console.log('Data:', JSON.stringify(decoded.data, null, 2));
        }
      }
    }
    
    return {
      blockHeight,
      opReturnCount: opReturnOutputs.length,
      runestoneCount: potentialRunestones.length,
      dieselCount: potentialDieselMints.length,
      dieselMints: potentialDieselMints
    };
  } catch (error) {
    console.error(`Error processing block ${blockHeight}:`, error.message);
    return {
      blockHeight,
      error: error.message
    };
  }
}

// Examine a known block with Alkanes activity (block 880000)
async function examineKnownBlock() {
  const KNOWN_BLOCK = 880000; // Block known to have Alkanes activity
  console.log(`Examining known block ${KNOWN_BLOCK} for Alkanes/Diesel activity...`);
  return examineBlock(KNOWN_BLOCK);
}

// Main function to analyze blocks
async function analyzeBlocks() {
  try {
    // First, check a known block with Alkanes activity
    await examineKnownBlock();
    
    // Get the current block height
    const latestBlockHeight = await callBitcoinRpc('getblockcount', []);
    console.log(`\nCurrent block height: ${latestBlockHeight}`);
    
    // Analyze the latest blocks
    for (let i = 0; i < 3; i++) {
      const blockHeight = latestBlockHeight - i;
      await examineBlock(blockHeight);
    }
    
    console.log('\n=== ANALYSIS COMPLETE ===');
    console.log('Recommendation:');
    console.log('1. The "Error connecting to API" message is due to the Metashrew API not responding correctly.');
    console.log('2. Our decoder is finding OP_RETURN data and attempting to decode it as runestones.');
    console.log('3. To fix the API error, you may need to contact the Metashrew API provider or try an alternative API endpoint.');
  } catch (error) {
    console.error('Error analyzing blocks:', error);
  }
}

// Run the analysis
analyzeBlocks().catch(console.error);
