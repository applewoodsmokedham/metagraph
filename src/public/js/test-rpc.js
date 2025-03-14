const axios = require('axios');
const { Buffer } = require('buffer');

// Simplified API client for testing purposes
class MetashrewApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async call(method, params = []) {
    try {
      const payload = {
        method,
        params,
        id: 0,
        jsonrpc: '2.0'
      };
      
      console.log(`API call: ${method}`, params);
      
      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.error) {
        throw new Error(`API Error: ${response.data.error.message || JSON.stringify(response.data.error)}`);
      }
      
      // Special handling for metashrew_height
      if (method === 'metashrew_height' && typeof response.data.result === 'string') {
        return parseInt(response.data.result, 10);
      }
      
      return response.data.result;
    } catch (error) {
      console.error(`API call failed for method ${method}:`, error.message);
      throw error;
    }
  }

  async getHeight() {
    try {
      const height = await this.call('metashrew_height', []);
      return height;
    } catch (error) {
      console.error('Failed to get Metashrew height:', error.message);
      return -1;
    }
  }

  async callView(viewName, input, blockTag = 'latest') {
    return this.call('metashrew_view', [viewName, input, blockTag]);
  }
}

// Simple implementations of the Protocol Buffer encoding functions
const protowallet = {
  encodeHeight: (height) => {
    // Simple hex encoding for testing
    const heightHex = typeof height === 'string' ? height : 
      '0x' + height.toString(16).padStart(8, '0');
    return heightHex;
  },
  
  encodeProtorunesWalletInput: (address, protocolTag) => {
    // In a real implementation, this would properly encode using Protocol Buffers
    console.log(`Encoding wallet input: ${address}, protocol tag: ${protocolTag}`);
    const bigIntTag = BigInt(protocolTag);
    // This is a simplified version - in production, proper Protocol Buffer encoding is needed
    return '0x' + Buffer.from(JSON.stringify({
      address,
      protocol_tag: bigIntTag.toString()
    })).toString('hex');
  },

  encodeTransactionId: (txid) => {
    return '0x' + Buffer.from(txid).toString('hex');
  },
  
  decodeWalletOutput: (byteString) => {
    // In a real implementation, this would properly decode using Protocol Buffers
    // Simple mock result for testing
    return {
      outpoints: [],
      balanceSheet: []
    };
  },

  decodeRunesResponse: (byteString) => {
    // Simple mock result for testing
    return {
      blockHeight: 880050,
      runesBurned: [],
      runesMinted: []
    };
  },

  decodeTransactionResult: (byteString) => {
    // Simple mock result for testing
    return {
      height: 880000,
      transaction: "mock transaction data"
    };
  }
};

class AlkanesRpc {
  constructor(baseUrl) {
    this.provider = new MetashrewApiClient(baseUrl);
  }

  async protorunesbyheight({ height }, blockTag = "latest") {
    console.log("Calling protorunesbyheight with height:", height);
    const buffer = protowallet.encodeHeight(height);
    const byteString = await this.provider.callView("protorunesbyheight", buffer, blockTag);
    const decoded = protowallet.decodeRunesResponse(byteString);
    return decoded;
  }

  async protorunesbyaddress({ address, protocolTag }, blockTag = "latest") {
    console.log("Calling protorunesbyaddress with address:", address);
    const buffer = protowallet.encodeProtorunesWalletInput(address, protocolTag || 1337);
    const byteString = await this.provider.callView("protorunesbyaddress", buffer, blockTag);
    const decoded = protowallet.decodeWalletOutput(byteString);
    return decoded;
  }

  async transactionbyid({ txid }, blockTag = "latest") {
    console.log("Calling transactionbyid with txid:", txid);
    const buffer = protowallet.encodeTransactionId(txid);
    const byteString = await this.provider.callView("transactionbyid", buffer, blockTag);
    const decoded = protowallet.decodeTransactionResult(byteString);
    return decoded;
  }
}

async function testApiCalls() {
  const METASHREW_URL = 'http://localhost:8085';
  const rpcClient = new AlkanesRpc(METASHREW_URL);
  
  try {
    // Test basic JSON-RPC call
    console.log("\n1. Testing basic JSON-RPC call: metashrew_height");
    const height = await rpcClient.provider.getHeight();
    console.log("Current height:", height);
    
    // Test protorunesbyheight
    console.log("\n2. Testing protorunesbyheight");
    const heightHex = '0x' + (880050).toString(16).padStart(8, '0');
    const runesByHeight = await rpcClient.protorunesbyheight({
      height: heightHex
    });
    console.log("Runes by height result:", runesByHeight);
    
    // Test protorunesbyaddress
    console.log("\n3. Testing protorunesbyaddress");
    const address = "bc1p3cyx5e2hgh53w7kpxcvm8s4kkega9gv5wfw7c4qxsvxl0u8x834qf0u2dp";
    const protorunesByAddress = await rpcClient.protorunesbyaddress({
      address,
      protocolTag: 1337
    });
    console.log("Protorunes by address result:", protorunesByAddress);
    
    // Test transactionbyid
    console.log("\n4. Testing transactionbyid");
    const txid = "b9d35ea4abff5d2c0823c3fc3d9c3e1397bd31c280c15732a05c3c9ecbf4ebbe";
    const transactionById = await rpcClient.transactionbyid({
      txid
    });
    console.log("Transaction by ID result:", transactionById);
    
  } catch (error) {
    console.error("API test failed:", error.message);
  }
}

// Run the tests
testApiCalls().catch(console.error);
