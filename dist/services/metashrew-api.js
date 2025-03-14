"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callMetashrewApi = callMetashrewApi;
exports.callView = callView;
exports.multicall = multicall;
exports.getIndexerHeight = getIndexerHeight;
exports.traceBlock = traceBlock;
exports.reverseBytes = reverseBytes;
exports.traceTransaction = traceTransaction;
exports.traceMultipleTransactions = traceMultipleTransactions;
exports.getProtorunesByHeight = getProtorunesByHeight;
exports.getProtorunesByAddress = getProtorunesByAddress;
exports.getSyncStatus = getSyncStatus;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Get Metashrew API URL from environment variables or use default
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/lasereyes';
console.log('Using Metashrew API URL:', METASHREW_API_URL);
console.log('No Sandshrew Project ID used - API works better without authentication');
// Create headers object with required Content-Type
const headers = {
    'Content-Type': 'application/json'
};
// IMPORTANT: DO NOT include the Project ID header
// The API works better without authentication
const apiClient = axios_1.default.create({
    baseURL: METASHREW_API_URL,
    headers,
    timeout: 15000 // 15 second timeout
});
/**
 * Make a generic JSON-RPC call to the Metashrew API
 * @param method Method name
 * @param params Parameters for the call
 * @returns The API response
 */
async function callMetashrewApi(method, params = []) {
    try {
        console.log(`Calling Metashrew API ${method} with params:`, JSON.stringify(params));
        const response = await apiClient.post('', {
            method,
            params,
            id: 0,
            jsonrpc: '2.0'
        });
        if (response.data.error) {
            throw new Error(`Metashrew API Error: ${response.data.error.message}`);
        }
        return response.data.result;
    }
    catch (error) {
        if (error.response) {
            console.error(`Metashrew API call failed for method ${method}:`, {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
            throw new Error(`Metashrew API Error: ${error.response.status} ${error.response.statusText}`);
        }
        else if (error.request) {
            console.error(`Metashrew API request failed for method ${method}:`, error.message);
            throw new Error(`Metashrew API request failed: ${error.message}`);
        }
        else {
            console.error(`Metashrew API error for method ${method}:`, error);
            throw error;
        }
    }
}
/**
 * Call a Metashrew view function
 * @param viewName Name of the view function
 * @param hexInput Hex-encoded input for the view function
 * @param blockTag Block tag (usually 'latest')
 * @returns The view function result
 */
async function callView(viewName, hexInput, blockTag = 'latest') {
    return callMetashrewApi('metashrew_view', [viewName, hexInput, blockTag]);
}
/**
 * Batch multiple calls into a single request
 * @param calls Array of [method, params] tuples
 * @returns Array of results in the same order as the calls
 */
async function multicall(calls) {
    return callMetashrewApi('sandshrew_multicall', [calls]);
}
/**
 * Get the current height the indexer has processed
 * @returns Current indexer height
 */
async function getIndexerHeight() {
    try {
        const heightResult = await callMetashrewApi('metashrew_height', []);
        console.log('Raw metashrew_height response:', heightResult, 'Type:', typeof heightResult);
        // Convert string response to a number (API returns height as a string)
        const height = parseInt(heightResult, 10);
        if (isNaN(height)) {
            console.warn('Failed to parse indexer height:', heightResult);
            return -1;
        }
        console.log('Parsed indexer height:', height);
        return height;
    }
    catch (error) {
        console.warn('Failed to get indexer height, falling back to Bitcoin height:', error);
        return -1; // Return -1 to indicate failure
    }
}
/**
 * Get traces for all transactions in a block
 * @param height Block height (hex encoded)
 * @returns Binary trace data for all transactions in the block
 */
async function traceBlock(height) {
    const heightHex = '0x' + height.toString(16).padStart(8, '0');
    return callView('traceblock', heightHex);
}
/**
 * Reverse bytes in a hex string (for txid conversion)
 * @param hex The hex string to reverse
 * @returns The byte-reversed hex string
 */
function reverseBytes(hex) {
    // Make sure the hex string doesn't have '0x' prefix
    hex = hex.replace(/^0x/, '');
    // Check if the hex string has an odd length
    if (hex.length % 2 !== 0) {
        console.warn('Hex string has odd length, prepending 0:', hex);
        hex = '0' + hex;
    }
    // Convert to byte array and reverse
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(hex.substr(i, 2));
    }
    return bytes.reverse().join('');
}
/**
 * Get detailed execution trace for a transaction using alkanes_trace method
 * @param txid Transaction ID (this will be byte-reversed for alkanes_trace calls)
 * @param vout Output index
 * @returns Binary trace data
 */
async function traceTransaction(txid, vout) {
    // Make direct API call to alkanes_trace with the byte-reversed txid
    const reversedTxid = reverseBytes(txid);
    console.log(`Tracing transaction: original txid=${txid}, reversed txid=${reversedTxid}, vout=${vout}`);
    try {
        return await callMetashrewApi('alkanes_trace', [{ txid: reversedTxid, vout }]);
    }
    catch (error) {
        console.error(`Failed to trace transaction ${txid} (${reversedTxid}), vout ${vout}:`, error);
        return []; // Return empty array on error
    }
}
/**
 * Trace multiple transactions in a single multicall request
 * @param transactions Array of {txid, vout} pairs to trace
 * @returns Array of trace results in the same order as the input
 */
async function traceMultipleTransactions(transactions) {
    // Build the multicall request with byte-reversed txids
    const calls = transactions.map(({ txid, vout }) => {
        const reversedTxid = reverseBytes(txid);
        return ['alkanes_trace', [{ txid: reversedTxid, vout }]];
    });
    try {
        console.log(`Tracing ${transactions.length} transactions via multicall`);
        return await multicall(calls);
    }
    catch (error) {
        console.error('Failed to trace multiple transactions:', error);
        // Return empty arrays for each transaction
        return transactions.map(() => []);
    }
}
/**
 * Get Alkanes tokens created or transferred at a specific block height
 * @param height Block height
 * @returns Tokens minted/transferred in the block
 */
async function getProtorunesByHeight(height) {
    try {
        const heightHex = '0x' + height.toString(16).padStart(8, '0');
        return await callView('protorunesbyheight', heightHex);
    }
    catch (error) {
        console.warn(`Failed to get protorunes for block ${height}:`, error);
        return { runestones: [] }; // Return empty array as fallback
    }
}
/**
 * Get Alkanes tokens owned by an address
 * @param address Bitcoin address
 * @returns Balances and UTXOs for the address
 */
async function getProtorunesByAddress(address) {
    const hexInput = Buffer.from(address).toString('hex');
    return callView('protorunesbyaddress', hexInput);
}
/**
 * Get sync status by comparing indexer height to Bitcoin node height
 * @param bitcoinHeight Current Bitcoin block height
 * @returns Sync status information
 */
async function getSyncStatus(bitcoinHeight) {
    try {
        const indexerHeight = await getIndexerHeight();
        // If we couldn't get the indexer height, return an error status
        if (indexerHeight === -1) {
            return {
                indexerHeight: 0, // Use 0 instead of 'Unknown' for easier frontend processing
                bitcoinHeight,
                blocksRemaining: bitcoinHeight,
                syncPercentage: 0,
                isSynced: false,
                error: 'Failed to connect to Metashrew API'
            };
        }
        const blocksRemaining = bitcoinHeight - indexerHeight;
        const syncPercentage = (indexerHeight / bitcoinHeight) * 100;
        return {
            indexerHeight,
            bitcoinHeight,
            blocksRemaining,
            syncPercentage: parseFloat(syncPercentage.toFixed(2)), // Return as number, not string
            isSynced: blocksRemaining <= 0
        };
    }
    catch (error) {
        console.error('Error getting sync status:', error);
        return {
            indexerHeight: 0, // Use 0 instead of 'Unknown' for easier frontend processing
            bitcoinHeight,
            blocksRemaining: bitcoinHeight,
            syncPercentage: 0,
            isSynced: false,
            error: 'Failed to get sync status'
        };
    }
}
//# sourceMappingURL=metashrew-api.js.map