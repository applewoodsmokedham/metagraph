/**
 * Browser-compatible AlkanesRpc class
 * Based on the implementation in alkanes/src.ts/rpc.ts
 * Provides methods for interacting with Metashrew API endpoints
 */
class AlkanesRpc {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || API_CONFIG.getActiveEndpoint();
    this.apiClient = apiClient; // Use the global apiClient instance
    this.endpointType = API_CONFIG.getActiveEndpointType();
    
    console.log(`[AlkanesRpc] Initialized with endpoint: ${this.endpointType} (${this.baseUrl})`);
    
    // Listen for endpoint changes
    document.addEventListener('endpoint-changed', (event) => {
      console.log('[AlkanesRpc] Received endpoint-changed event:', event.detail);
      this.updateBaseUrl(event.detail.url);
      this.endpointType = event.detail.type;
      
      // Force the apiClient to update its baseUrl as well
      if (this.apiClient && typeof this.apiClient.updateBaseUrl === 'function') {
        this.apiClient.updateBaseUrl(event.detail.url);
      }
    });
  }
  
  // Update the base URL when needed
  updateBaseUrl(url) {
    if (url) {
      this.baseUrl = url;
    } else {
      this.baseUrl = API_CONFIG.getActiveEndpoint();
    }
    console.log('[AlkanesRpc] Base URL updated to:', this.baseUrl);
    return this.baseUrl;
  }
  
  // Internal helper for view function calls
  async _call({ method, input }, blockTag = 'latest') {
    console.log(`Calling Alkanes view method: ${method}`);
    console.log(`Input: ${input}`);
    console.log(`Block tag: ${blockTag}`);
    console.log(`Base URL: ${this.baseUrl}`);
    
    try {
      // This correctly calls metashrew_view with the method name, input data, and block tag
      const result = await this.apiClient.callView(method, input, blockTag);
      console.log(`API call success for ${method}:`, result);
      return result;
    } catch (error) {
      console.error(`API call failed for ${method}:`, error);
      // Provide more detailed error information
      throw new Error(`Failed to call ${method}: ${error.message}`);
    }
  }
  
  // Helper method to convert hex string to array buffer
  _hexToArrayBuffer(hex) {
    hex = hex.replace(/^0x/, '');
    const buffer = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      buffer[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return buffer;
  }
  
  // Helper method to convert array buffer to hex string
  _arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // Convert string to hex
  _stringToHex(str) {
    return Array.from(new TextEncoder().encode(str))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // Protocol Buffers-style encoding helpers
  
  /**
   * Encodes a varint (variable-length integer)
   * @param {number} value - The integer to encode
   * @returns {Array<number>} - Array of bytes
   */
  _encodeVarint(value) {
    const result = [];
    while (value >= 0x80) {
      result.push((value & 0x7f) | 0x80);
      value >>>= 7;
    }
    result.push(value & 0x7f);
    return result;
  }
  
  /**
   * Encodes a field with length-delimited wire type (2)
   * @param {number} fieldNumber - Protocol Buffers field number
   * @param {Array<number>} bytes - Array of bytes to encode
   * @returns {Array<number>} - Array of bytes for the encoded field
   */
  _encodeLengthDelimited(fieldNumber, bytes) {
    const headerByte = (fieldNumber << 3) | 2; // Wire type 2 is length-delimited
    const lengthBytes = this._encodeVarint(bytes.length);
    return [headerByte, ...lengthBytes, ...bytes];
  }
  
  /**
   * Encodes a wallet input (Bitcoin address)
   * @param {string} address - Bitcoin address
   * @returns {string} - Hex encoded Protocol Buffer message with 0x prefix
   */
  encodeWalletInput(address) {
    // Convert address to bytes (UTF-8)
    const addressBytes = Array.from(new TextEncoder().encode(address));
    
    // Use field number 1 for the address (wire type 2 = length-delimited)
    const messageBytes = this._encodeLengthDelimited(1, addressBytes);
    
    // Convert to hex string with 0x prefix
    return '0x' + messageBytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Encodes a Bitcoin address and protocol tag for protorunesbyaddress
   * @param {string} address - Bitcoin address
   * @param {BigInt|number} protocolTag - Protocol tag
   * @returns {string} - Hex encoded Protocol Buffer message with 0x prefix
   */
  encodeProtorunesWalletInput(address, protocolTag) {
    // Convert protocol tag to BigInt if it's not already
    protocolTag = typeof protocolTag === 'bigint' ? protocolTag : BigInt(protocolTag);
    
    // Convert address to bytes (UTF-8)
    const addressBytes = Array.from(new TextEncoder().encode(address));
    
    // For protocol tag, use proper varint encoding for BigInt
    const protocolTagBytes = [];
    let remaining = protocolTag;
    while (remaining > 127n) {
      protocolTagBytes.push(Number((remaining & 127n) | 128n));
      remaining >>= 7n;
    }
    protocolTagBytes.push(Number(remaining));
    
    // Build the full message
    let messageBytes = [];
    
    // Add address field (field 1, wire type 2 = length-delimited)
    messageBytes = messageBytes.concat(this._encodeLengthDelimited(1, addressBytes));
    
    // Add protocol tag field (field 2, wire type 0 = varint)
    const tagHeader = (2 << 3) | 0; // field 2, wire type 0
    messageBytes.push(tagHeader);
    messageBytes = messageBytes.concat(protocolTagBytes);
    
    // Convert to hex string with 0x prefix
    return '0x' + messageBytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Encodes a transaction ID for transactionbyid
   * @param {string} txid - Transaction ID (hex string)
   * @returns {string} - Hex encoded Protocol Buffer message with 0x prefix
   */
  encodeTransactionId(txid) {
    // Remove 0x prefix if present
    txid = txid.replace(/^0x/, '');
    
    // Convert txid to bytes
    const txidBytes = [];
    for (let i = 0; i < txid.length; i += 2) {
      txidBytes.push(parseInt(txid.substr(i, 2), 16));
    }
    
    // Use field number 1 for the txid (wire type 2 = length-delimited)
    const messageBytes = this._encodeLengthDelimited(1, txidBytes);
    
    // Convert to hex string with 0x prefix
    return '0x' + messageBytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Encodes a transaction ID and output index for trace
   * @param {string} txid - Transaction ID (hex string)
   * @param {number} vout - Output index
   * @returns {string} - Hex encoded Protocol Buffer message with 0x prefix
   */
  encodeTraceRequest({ txid, vout }) {
    // Remove 0x prefix if present
    txid = txid.replace(/^0x/, '');
    
    // Convert txid to bytes
    const txidBytes = [];
    for (let i = 0; i < txid.length; i += 2) {
      txidBytes.push(parseInt(txid.substr(i, 2), 16));
    }
    
    // Convert vout to varint
    const voutVarint = this._encodeVarint(vout);
    
    // Build the full message
    let messageBytes = [];
    
    // Add txid field (field 1, wire type 2 = length-delimited)
    messageBytes = messageBytes.concat(this._encodeLengthDelimited(1, txidBytes));
    
    // Add vout field (field 2, wire type 0 = varint)
    const voutFieldHeader = (2 << 3) | 0; // Field 2, wire type 0
    messageBytes.push(voutFieldHeader);
    messageBytes = messageBytes.concat(voutVarint);
    
    // Convert to hex string with 0x prefix
    return '0x' + messageBytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Encodes a block height for traceblock
   * @param {number|BigInt} block - Block height
   * @returns {string} - Hex encoded block height with 0x prefix
   */
  encodeTraceBlockRequest({ block }) {
    // Convert block height to hex string with 0x prefix and padded to 8 bytes
    return '0x' + Number(block).toString(16).padStart(8, '0');
  }
  
  /**
   * Encodes a block height for runesbyheight
   * @param {number} height - Block height
   * @returns {string} - Hex encoded block height with 0x prefix
   */
  encodeBlockHeightInput(height) {
    // Convert height to a 32-bit little-endian hex string
    const heightBytes = new Uint8Array(4);
    new DataView(heightBytes.buffer).setUint32(0, height, true); // true for little-endian
    return '0x' + Array.from(heightBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Get Protorunes tokens owned by an address
   * @param {Object} params - Parameters
   * @param {string} params.address - Bitcoin address
   * @param {BigInt|number} [params.protocolTag=1n] - Protocol tag
   * @param {string} [blockTag="latest"] - Block tag
   * @returns {Promise<Object>} - Decoded response with outpoints and balances
   */
  async protorunesbyaddress({ address, protocolTag = 1n }, blockTag = 'latest') {
    console.log(`protorunesbyaddress called for address: ${address}, protocol tag: ${protocolTag}`);
    
    // Encode the input using Protocol Buffers
    const buffer = this.encodeProtorunesWalletInput(address, protocolTag);
    console.log('Encoded buffer:', buffer);
    
    try {
      // Make the API call
      const byteString = await this._call({
        method: 'protorunesbyaddress',
        input: buffer,
      }, blockTag);
      
      // Return raw response
      return byteString;
    } catch (error) {
      console.error('protorunesbyaddress error:', error);
      throw error;
    }
  }
  
  /**
   * Get transaction details by transaction ID
   * @param {Object} params - Parameters
   * @param {string} params.txid - Transaction ID (hex string)
   * @param {string} [blockTag="latest"] - Block tag
   * @returns {Promise<Object>} - Decoded transaction details
   */
  async transactionbyid({ txid }, blockTag = 'latest') {
    // Encode the input
    const buffer = this.encodeTransactionId(txid);
    
    // Make the API call
    const byteString = await this._call({
      method: 'transactionbyid',
      input: buffer,
    }, blockTag);
    
    // Return raw response
    return byteString;
  }
  
  /**
   * Get spendable outputs for an address
   * @param {Object} params - Parameters
   * @param {string} params.address - Bitcoin address
   * @param {BigInt|number} [params.protocolTag=1] - Protocol tag
   * @param {string} [blockTag="latest"] - Block tag
   * @returns {Promise<Object>} - Decoded response with outpoints and balances
   */
  async spendablesbyaddress({ address, protocolTag = 1 }, blockTag = 'latest') {
    console.log(`spendablesbyaddress called for address: ${address}, protocol tag: ${protocolTag}`);
    
    // Encode the input (same as protorunesbyaddress)
    const buffer = this.encodeProtorunesWalletInput(address, protocolTag);
    console.log('Encoded buffer:', buffer);
    
    try {
      // Make the API call
      const byteString = await this._call({
        method: 'spendablesbyaddress',
        input: buffer,
      }, blockTag);
      
      // Return raw response
      return byteString;
    } catch (error) {
      console.error('spendablesbyaddress error:', error);
      throw error;
    }
  }
  
  /**
   * Get Runes tokens owned by an address
   * @param {Object} params - Parameters
   * @param {string} params.address - Bitcoin address
   * @param {string} [blockTag="latest"] - Block tag
   * @returns {Promise<Object>} - Decoded response with outpoints and balances
   */
  async runesbyaddress({ address }, blockTag = 'latest') {
    console.log(`runesbyaddress called for address: ${address}`);
    
    // Encode the input
    const buffer = this.encodeWalletInput(address);
    console.log('Encoded buffer:', buffer);
    
    try {
      // Make the API call
      const byteString = await this._call({
        method: 'runesbyaddress',
        input: buffer,
      }, blockTag);
      
      // Return raw response
      return byteString;
    } catch (error) {
      console.error('runesbyaddress error:', error);
      throw error;
    }
  }
  
  /**
   * Get Runes tokens at a specific block height
   * @param {Object} params - Parameters
   * @param {number} params.height - Block height
   * @param {string} [blockTag="latest"] - Block tag
   * @returns {Promise<Object>} - Decoded response with tokens at that height
   */
  async runesbyheight({ height }, blockTag = 'latest') {
    console.log(`runesbyheight called for height: ${height}`);
    
    // Encode the input
    const payload = this.encodeBlockHeightInput(height);
    console.log('Encoded payload:', payload);
    
    try {
      // Make the API call
      const response = await this._call({
        method: 'runesbyheight',
        input: payload,
      }, blockTag);
      
      // Return raw response
      return response;
    } catch (error) {
      console.error('runesbyheight error:', error);
      throw error;
    }
  }
  
  /**
   * Get Protorunes tokens at a specific block height
   * @param {Object} params - Parameters
   * @param {number} params.height - Block height
   * @param {string} [blockTag="latest"] - Block tag
   * @returns {Promise<Object>} - Decoded response with tokens at that height
   */
  async protorunesbyheight({ height }, blockTag = 'latest') {
    console.log(`protorunesbyheight called for height: ${height}`);
    
    // Encode the input - use the same encoder as runesbyheight
    const payload = this.encodeBlockHeightInput(height);
    console.log('Encoded payload:', payload);
    
    try {
      // Make the API call
      const response = await this._call({
        method: 'protorunesbyheight',
        input: payload,
      }, blockTag);
      
      // Return raw response
      return response;
    } catch (error) {
      console.error('protorunesbyheight error:', error);
      throw error;
    }
  }
  
  /**
   * Get trace for an outpoint (txid + vout)
   * @param {Object} params - Parameters
   * @param {string} params.txid - Transaction ID (hex string)
   * @param {number} params.vout - Output index
   * @param {string} [blockTag="latest"] - Block tag
   * @returns {Promise<Object>} - Decoded trace data
   */
  async trace({ txid, vout }, blockTag = 'latest') {
    console.log(`trace called for txid: ${txid}, vout: ${vout}`);
    
    // Encode the input
    const buffer = this.encodeTraceRequest({ txid, vout });
    console.log('Encoded buffer:', buffer);
    
    try {
      // Make the API call
      const byteString = await this._call({
        method: 'trace',
        input: buffer,
      }, blockTag);
      
      // Return raw response
      return byteString;
    } catch (error) {
      console.error('trace error:', error);
      throw error;
    }
  }
  
  /**
   * Get traces for all transactions in a block
   * @param {Object} params - Parameters
   * @param {number} params.block - Block height
   * @param {string} [blockTag="latest"] - Block tag
   * @returns {Promise<Object>} - Decoded trace data
   */
  async traceblock({ block }, blockTag = 'latest') {
    console.log(`traceblock called for block: ${block}`);
    
    // Encode the input
    const buffer = this.encodeTraceBlockRequest({ block });
    console.log('Encoded buffer:', buffer);
    
    try {
      // Make the API call
      const byteString = await this._call({
        method: 'traceblock',
        input: buffer,
      }, blockTag);
      
      // Return raw response
      return byteString;
    } catch (error) {
      console.error('traceblock error:', error);
      throw error;
    }
  }
}

// Create a global instance
const alkanesRpc = new AlkanesRpc();
