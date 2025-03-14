import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

// Get RPC credentials from environment variables
const RPC_URL = process.env.BITCOIN_RPC_URL || 'http://localhost:8332';
const RPC_USER = process.env.BITCOIN_RPC_USER || '';
const RPC_PASSWORD = process.env.BITCOIN_RPC_PASSWORD || '';

const rpcClient = axios.create({
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
export async function callRpc(method: string, params: any[] = []): Promise<any> {
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
  } catch (error) {
    console.error(`RPC call failed for method ${method}:`, error);
    throw error;
  }
}

/**
 * Get the current block count
 * @returns The current block height
 */
export async function getBlockCount(): Promise<number> {
  return callRpc('getblockcount');
}

/**
 * Get the hash of a block at the specified height
 * @param height Block height
 * @returns Block hash
 */
export async function getBlockHash(height: number): Promise<string> {
  return callRpc('getblockhash', [height]);
}

/**
 * Get detailed information about a block
 * @param blockHash Block hash
 * @param verbosity Level of detail (0=hex, 1=decoded, 2=decoded with tx data)
 * @returns Block data
 */
export async function getBlock(blockHash: string, verbosity: number = 2): Promise<any> {
  return callRpc('getblock', [blockHash, verbosity]);
}

/**
 * Get the latest block with full transaction details
 * @returns Latest block data with transactions
 */
export async function getLatestBlock(): Promise<any> {
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
export async function getBlockAtHeight(height: number): Promise<any> {
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
export async function getBlockRange(start: number, count: number): Promise<any[]> {
  const blocks = [];
  for (let i = 0; i < count; i++) {
    const height = start - i;
    if (height < 0) break;
    const block = await getBlockAtHeight(height);
    blocks.push(block);
  }
  return blocks;
}
