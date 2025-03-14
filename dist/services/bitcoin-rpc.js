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
exports.callRpc = callRpc;
exports.getBlockCount = getBlockCount;
exports.getBlockHash = getBlockHash;
exports.getBlock = getBlock;
exports.getLatestBlock = getLatestBlock;
exports.getBlockAtHeight = getBlockAtHeight;
exports.getBlockRange = getBlockRange;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Get RPC credentials from environment variables
const RPC_URL = process.env.BITCOIN_RPC_URL || 'http://localhost:8332';
const RPC_USER = process.env.BITCOIN_RPC_USER || '';
const RPC_PASSWORD = process.env.BITCOIN_RPC_PASSWORD || '';
const rpcClient = axios_1.default.create({
    baseURL: RPC_URL,
    auth: {
        username: RPC_USER,
        password: RPC_PASSWORD
    },
    headers: {
        'Content-Type': 'application/json'
    }
});
/**
 * Make a generic RPC call to the Bitcoin node
 * @param method RPC method name
 * @param params Parameters for the RPC call
 * @returns The RPC response
 */
async function callRpc(method, params = []) {
    try {
        const response = await rpcClient.post('', {
            jsonrpc: '2.0',
            id: Date.now(),
            method,
            params
        });
        if (response.data.error) {
            throw new Error(`RPC Error: ${response.data.error.message}`);
        }
        return response.data.result;
    }
    catch (error) {
        console.error(`RPC call failed for method ${method}:`, error);
        throw error;
    }
}
/**
 * Get the current block count
 * @returns The current block height
 */
async function getBlockCount() {
    return callRpc('getblockcount');
}
/**
 * Get the hash of a block at the specified height
 * @param height Block height
 * @returns Block hash
 */
async function getBlockHash(height) {
    return callRpc('getblockhash', [height]);
}
/**
 * Get detailed information about a block
 * @param blockHash Block hash
 * @param verbosity Level of detail (0=hex, 1=decoded, 2=decoded with tx data)
 * @returns Block data
 */
async function getBlock(blockHash, verbosity = 2) {
    return callRpc('getblock', [blockHash, verbosity]);
}
/**
 * Get the latest block with full transaction details
 * @returns Latest block data with transactions
 */
async function getLatestBlock() {
    const height = await getBlockCount();
    const hash = await getBlockHash(height);
    const block = await getBlock(hash, 2);
    return block;
}
/**
 * Get a block at the specified height with full transaction details
 * @param height Block height
 * @returns Block data with transactions
 */
async function getBlockAtHeight(height) {
    const hash = await getBlockHash(height);
    const block = await getBlock(hash, 2);
    return block;
}
/**
 * Get a range of blocks with full transaction details
 * @param start Starting block height
 * @param count Number of blocks to fetch
 * @returns Array of block data
 */
async function getBlockRange(start, count) {
    const blocks = [];
    for (let i = 0; i < count; i++) {
        const height = start - i;
        if (height < 0)
            break;
        const block = await getBlockAtHeight(height);
        blocks.push(block);
    }
    return blocks;
}
//# sourceMappingURL=bitcoin-rpc.js.map