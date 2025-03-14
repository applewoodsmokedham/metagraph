// Test script for validating the improved Diesel mint detection
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const { decodeOpReturn } = require('./dist/lib/runestone-decoder');

// Bitcoin RPC credentials
const BITCOIN_RPC_URL = process.env.BITCOIN_RPC_URL || 'http://localhost:8332';
const BITCOIN_RPC_USER = process.env.BITCOIN_RPC_USER;
const BITCOIN_RPC_PASS = process.env.BITCOIN_RPC_PASSWORD;

const auth = {
  username: BITCOIN_RPC_USER,
  password: BITCOIN_RPC_PASS
};

// Test specific transaction that should be a Diesel mint
async function testSpecificTransaction() {
  const txid = '9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e';
  
  try {
    // Get raw transaction
    const getRawTxResponse = await axios.post(
      BITCOIN_RPC_URL,
      {
        jsonrpc: '2.0',
        id: 'test',
        method: 'getrawtransaction',
        params: [txid, true]
      },
      { auth }
    );
    
    const tx = getRawTxResponse.data.result;
    
    // Find OP_RETURN output
    let opReturnOutput = null;
    for (const output of tx.vout) {
      if (output.scriptPubKey.type === 'nulldata' || output.scriptPubKey.hex.startsWith('6a')) {
        opReturnOutput = output;
        break;
      }
    }
    
    if (!opReturnOutput) {
      console.log('No OP_RETURN output found in transaction');
      return;
    }
    
    console.log('Found OP_RETURN output:');
    console.log('Hex:', opReturnOutput.scriptPubKey.hex);
    console.log('ASM:', opReturnOutput.scriptPubKey.asm);
    
    // Use our decoder to decode the OP_RETURN data
    const decoded = decodeOpReturn(opReturnOutput.scriptPubKey.hex);
    
    console.log('\nDecoded result:');
    console.log(JSON.stringify(decoded, null, 2));
    
    // Check if it was correctly identified as a Diesel transaction
    if (decoded && decoded.data && decoded.data.protocolName === 'Diesel') {
      console.log('\n✅ SUCCESS: Transaction correctly identified as a Diesel mint!');
    } else {
      console.log('\n❌ FAILURE: Transaction not identified as a Diesel mint');
    }
  } catch (error) {
    console.error('Error fetching transaction:', error.message);
    if (error.response) {
      console.error('RPC response:', error.response.data);
    }
  }
}

// Test with hex data directly from mempool.space
function testDirectHex() {
  const hexData = '6a5d0eff7f818cec82d08bc0a88281d215';
  console.log('\nTesting direct hex from mempool.space:', hexData);
  
  const decoded = decodeOpReturn(hexData);
  
  console.log('\nDecoded result:');
  console.log(JSON.stringify(decoded, null, 2));
  
  // Check if it was correctly identified as a Diesel transaction
  if (decoded && decoded.data && decoded.data.protocolName === 'Diesel') {
    console.log('\n✅ SUCCESS: Hex data correctly identified as a Diesel mint!');
  } else {
    console.log('\n❌ FAILURE: Hex data not identified as a Diesel mint');
  }
}

// Run tests
async function runTests() {
  console.log('=== TESTING DIESEL MINT TRANSACTION DETECTION ===\n');
  
  console.log('Test 1: Specific Transaction');
  await testSpecificTransaction();
  
  console.log('\nTest 2: Direct Hex Data');
  testDirectHex();
}

runTests().catch(err => {
  console.error('Test failed:', err);
});
