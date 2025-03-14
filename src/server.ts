import express, { Request, Response, Router, RequestHandler } from 'express';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { getLatestBlock, getBlockAtHeight, getBlockRange, getBlockCount } from './services/bitcoin-rpc';
import { getProtorunesByHeight, getSyncStatus, traceTransaction, traceMultipleTransactions, reverseBytes, traceBlock } from './services/metashrew-api';
import { processBlock, processBlocks, generateRunestoneSummary } from './lib/block-processor';
import { RunestoneCanvasVisualizer } from './lib/canvas-visualizer';
import { getExecutionContext, traceTransactionOrigin } from './services/transaction-origin';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Determine the correct public directory path
// In development, it's in src/public, in production it's relative to the js file
const isProduction = __filename.endsWith('.js');
const publicDir = isProduction 
  ? path.join(__dirname, '../src/public') 
  : path.join(__dirname, 'public');

// Serve static files from the public directory
app.use(express.static(publicDir));
app.use(express.json());

// Create images directory if it doesn't exist
const imagesDir = path.join(publicDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Generic RPC endpoint for API method pages
app.post('/api/rpc', (async (req: Request, res: Response) => {
  try {
    const { method, params, id, jsonrpc } = req.body;
    
    if (!method) {
      res.status(400).json({ error: { message: 'Method is required' } });
      return;
    }
    
    // Make the API call to Metashrew
    try {
      const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
      const response = await axios.post(METASHREW_API_URL, {
        method,
        params: params || [],
        id: id || 0,
        jsonrpc: jsonrpc || '2.0'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Return the response data
      res.json(response.data);
      return;
    } catch (error: any) {
      console.error(`Metashrew API error for method ${method}:`, error);
      
      // Format the error response
      res.status(500).json({
        error: {
          message: `API call to ${method} failed: ${error.message}`,
          details: error.response?.data || null
        },
        id: id || 0,
        jsonrpc: jsonrpc || '2.0'
      });
      return;
    }
  } catch (error: any) {
    console.error('RPC endpoint error:', error);
    res.status(500).json({
      error: { message: `Server error: ${error.message}` },
      id: 0,
      jsonrpc: '2.0'
    });
    return;
  }
}) as RequestHandler);

// Simple RPC endpoint (alternative path)
app.post('/rpc', (async (req, res) => {
  try {
    const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
    
    console.log('Forwarding RPC request to:', METASHREW_API_URL);
    
    const response = await axios.post(METASHREW_API_URL, req.body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Metashrew API proxy error:', error.message);
    res.status(500).json({ 
      error: 'Failed to connect to Metashrew API',
      message: error.message
    });
  }
}) as RequestHandler);

// API endpoint for sync status
app.get('/api/sync-status', (async (req, res) => {
  try {
    // First get the Bitcoin height
    const bitcoinHeight = await getBlockCount();
    
    // Then use it to get sync status
    const syncData = await getSyncStatus(bitcoinHeight);
    
    // Return the sync data directly - our updated getSyncStatus returns numerical values
    res.json({
      currentHeight: syncData.indexerHeight,
      nodeHeight: syncData.bitcoinHeight,
      syncPercentage: syncData.syncPercentage
    });
  } catch (error: any) {
    console.error('Error fetching sync status:', error.message);
    res.status(500).json({ 
      currentHeight: 0,
      nodeHeight: 0,
      syncPercentage: 0,
      error: 'Failed to fetch sync status' 
    });
  }
}) as RequestHandler);

// Homepage
app.get('/', ((req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
}) as RequestHandler);

// API endpoint to get the latest block with decoded runestones
app.get('/api/latest-block', (async (req, res) => {
  try {
    const block = await getLatestBlock();
    const runestones = processBlock(block);
    
    res.json({
      blockHeight: block.height,
      blockHash: block.hash,
      blockTime: block.time,
      runestoneCount: runestones.length,
      runestones
    });
  } catch (error: any) {
    console.error('Error fetching latest block:', error.message);
    res.status(500).json({ error: 'Failed to fetch latest block' });
  }
}) as RequestHandler);

// API routes
const router = Router();

// API endpoint to get a specific block with decoded runestones
router.get('/block/:height', (async (req, res) => {
  try {
    const height = parseInt(req.params.height);
    if (isNaN(height)) {
      return res.status(400).json({ error: 'Invalid block height' });
    }
    
    const block = await getBlockAtHeight(height);
    const runestones = processBlock(block);
    
    res.json({
      blockHeight: block.height,
      blockHash: block.hash,
      blockTime: block.time,
      runestoneCount: runestones.length,
      runestones
    });
  } catch (error: any) {
    console.error(`Error fetching block ${req.params.height}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch block' });
  }
}) as RequestHandler);

// API endpoint to get runestones from a range of blocks
router.get('/blocks/:start/:count', (async (req, res) => {
  try {
    const start = parseInt(req.params.start);
    const count = parseInt(req.params.count);
    
    if (isNaN(start) || isNaN(count)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    if (count > 20) {
      return res.status(400).json({ error: 'Count cannot exceed 20 blocks' });
    }
    
    const blocks = await getBlockRange(start, count);
    const allRunestones = processBlocks(blocks);
    const summary = generateRunestoneSummary(allRunestones);
    
    res.json({
      startBlock: start,
      endBlock: start - count + 1,
      blockCount: blocks.length,
      runestoneCount: allRunestones.length,
      summary,
      runestones: allRunestones
    });
  } catch (error: any) {
    console.error(`Error fetching block range ${req.params.start}-${req.params.count}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch block range' });
  }
}) as RequestHandler);

// API endpoint to get Alkanes tokens at a specific block height
router.get('/protorunes/:height', (async (req, res) => {
  try {
    const height = parseInt(req.params.height);
    if (isNaN(height)) {
      return res.status(400).json({ error: 'Invalid block height' });
    }
    
    const protorunes = await getProtorunesByHeight(height);
    res.json(protorunes);
  } catch (error: any) {
    console.error(`Error fetching protorunes for block ${req.params.height}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch protorunes' });
  }
}) as RequestHandler);

// API endpoint to get sync status
router.get('/sync-status', (async (req, res) => {
  try {
    const bitcoinHeight = await getBlockCount();
    const status = await getSyncStatus(bitcoinHeight);
    res.json(status);
  } catch (error: any) {
    console.error('Error fetching sync status:', error.message);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
}) as RequestHandler);

// API endpoint to get a canvas visualization for a specific runestone
router.get('/visualize/:txid/:vout', (async (req, res) => {
  try {
    const { txid, vout } = req.params;
    if (!txid || isNaN(parseInt(vout))) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    // Find the runestone in recent blocks
    const latestBlock = await getLatestBlock();
    const blocks = await getBlockRange(latestBlock.height, 10);
    const allRunestones = processBlocks(blocks);
    
    const runestone = allRunestones.find(r => 
      r.txid === txid && r.vout === parseInt(vout)
    );
    
    if (!runestone) {
      return res.status(404).json({ error: 'Runestone not found' });
    }
    
    // Generate the visualization
    const pngBuffer = RunestoneCanvasVisualizer.visualizeSingle(runestone);
    
    // Save the visualization to a file
    const filename = `${txid}_${vout}.png`;
    const filePath = path.join(imagesDir, filename);
    fs.writeFileSync(filePath, pngBuffer);
    
    // Set the content type and send the image
    res.type('image/png');
    res.send(pngBuffer);
  } catch (error: any) {
    console.error(`Error visualizing runestone ${req.params.txid}:`, error.message);
    res.status(500).json({ error: 'Failed to visualize runestone' });
  }
}) as RequestHandler);

// API endpoint to get a canvas visualization for a block summary
router.get('/visualize-block/:height', (async (req, res) => {
  try {
    const height = parseInt(req.params.height);
    if (isNaN(height)) {
      return res.status(400).json({ error: 'Invalid block height' });
    }
    
    const block = await getBlockAtHeight(height);
    const runestones = processBlock(block);
    
    if (runestones.length === 0) {
      return res.status(404).json({ error: 'No runestones found in this block' });
    }
    
    // Generate the visualization
    const pngBuffer = RunestoneCanvasVisualizer.visualizeSummary(runestones);
    
    // Save the visualization to a file
    const filename = `block_${height}.png`;
    const filePath = path.join(imagesDir, filename);
    fs.writeFileSync(filePath, pngBuffer);
    
    // Set the content type and send the image
    res.type('image/png');
    res.send(pngBuffer);
  } catch (error: any) {
    console.error(`Error visualizing block ${req.params.height}:`, error.message);
    res.status(500).json({ error: 'Failed to visualize block' });
  }
}) as RequestHandler);

// API endpoint to trace an Alkanes transaction
router.get('/trace/:txid/:vout?', (async (req, res) => {
  try {
    const txid = req.params.txid;
    // Default to vout 4 based on our discovery, but allow overriding
    const vout = req.params.vout ? parseInt(req.params.vout) : 4;
    
    if (!txid || isNaN(vout)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    console.log(`Tracing transaction ${txid} at vout ${vout}`);
    
    // Get the trace data using the byte-reversal implementation
    const traceData = await traceTransaction(txid, vout);
    
    // Check if we have valid trace data
    const hasTrace = Array.isArray(traceData) && traceData.length > 0;
    
    res.json({
      txid,
      reversedTxid: reverseBytes(txid),
      vout,
      hasTrace,
      traceData
    });
  } catch (error: any) {
    console.error(`Error tracing transaction ${req.params.txid}:`, error.message);
    res.status(500).json({ error: 'Failed to trace transaction' });
  }
}) as RequestHandler);

// API endpoint to trace multiple transactions at once with multicall
router.post('/trace-batch', (async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty transactions array' });
    }
    
    // Validate each transaction has a txid and optional vout (default to 4)
    const formattedTransactions = transactions.map(tx => ({
      txid: tx.txid,
      vout: tx.vout !== undefined ? parseInt(tx.vout) : 4 // Default to vout 4
    }));
    
    console.log(`Tracing batch of ${formattedTransactions.length} transactions`);
    
    // Get the trace results for all transactions
    const traceResults = await traceMultipleTransactions(formattedTransactions);
    
    // Format the results with original and reversed txids
    const results = formattedTransactions.map((tx, index) => ({
      txid: tx.txid,
      reversedTxid: reverseBytes(tx.txid),
      vout: tx.vout,
      hasTrace: Array.isArray(traceResults[index]) && traceResults[index].length > 0,
      traceData: traceResults[index]
    }));
    
    res.json({
      transactionCount: results.length,
      transactionsWithTraces: results.filter(r => r.hasTrace).length,
      results
    });
  } catch (error: any) {
    console.error('Error tracing batch of transactions:', error.message);
    res.status(500).json({ error: 'Failed to trace batch of transactions' });
  }
}) as RequestHandler);

// API endpoint for transaction origin tracing
router.get('/transaction/trace-origin/:txid/:vout', (async (req, res) => {
  try {
    const { txid, vout } = req.params;
    if (!txid || isNaN(parseInt(vout))) {
      return res.status(400).json({ error: 'Invalid transaction parameters' });
    }
    
    console.log(`Tracing origin for transaction ${txid}:${vout}`);
    const originTrace = await traceTransactionOrigin(txid, parseInt(vout));
    
    if (!originTrace) {
      return res.status(404).json({ error: 'Transaction origin trace not found' });
    }
    
    res.json(originTrace);
  } catch (error: any) {
    console.error('Error tracing transaction origin:', error.message);
    res.status(500).json({ error: 'Failed to trace transaction origin' });
  }
}) as RequestHandler);

// API endpoint for full execution context
router.get('/transaction/execution-context/:txid/:vout', (async (req, res) => {
  try {
    const { txid, vout } = req.params;
    if (!txid || isNaN(parseInt(vout))) {
      return res.status(400).json({ error: 'Invalid transaction parameters' });
    }
    
    console.log(`Getting execution context for transaction ${txid}:${vout}`);
    const context = await getExecutionContext(txid, parseInt(vout));
    
    if (!context) {
      return res.status(404).json({ error: 'Execution context not found' });
    }
    
    res.json(context);
  } catch (error: any) {
    console.error('Error getting execution context:', error.message);
    res.status(500).json({ error: 'Failed to get execution context' });
  }
}) as RequestHandler);

// API endpoint to search for known Alkanes transactions
router.get('/transaction/search', (async (req, res) => {
  try {
    // For a simple implementation, we can just return a list of recent transactions
    // In a production environment, you would implement a proper search mechanism
    // For now, we'll just use a mock result
    
    const sampleTransactions = [
      {
        txid: "4ea485613f137babe2f678d47983a261dfd4d80188f34e252a6a35b17351109e",
        vout: 0,
        blockHeight: 881234,
        timestamp: Date.now() - 3600000, // 1 hour ago
        type: "contract execution"
      },
      {
        txid: "7f9d5043fbe078a25ca064c9592c6940d73127b7b422b45b2f34e12b456ff2eb",
        vout: 0,
        blockHeight: 881230,
        timestamp: Date.now() - 7200000, // 2 hours ago
        type: "contract creation"
      },
      {
        txid: "bdaf4c3026f4b66adbe526aeae115c30df0af59feaa5a8467d16e0b434b29ecf",
        vout: 0,
        blockHeight: 881220,
        timestamp: Date.now() - 14400000, // 4 hours ago
        type: "factory deployment"
      }
    ];
    
    res.json(sampleTransactions);
  } catch (error: any) {
    console.error('Error searching for transactions:', error.message);
    res.status(500).json({ error: 'Failed to search for transactions' });
  }
}) as RequestHandler);

// API endpoint to get Alkanes transactions for a specific block
router.get('/block/:height/alkanes', (async (req, res) => {
  try {
    const blockHeight = parseInt(req.params.height);
    if (isNaN(blockHeight)) {
      return res.status(400).json({ error: 'Invalid block height' });
    }
    
    console.log(`Fetching Alkanes transactions for block ${blockHeight}`);
    
    // Get the block data
    const block = await getBlockAtHeight(blockHeight);
    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }
    
    // Get traceblock data to identify Alkanes transactions
    const traceData = await traceBlock(blockHeight);
    
    // Get protorunes data for this block
    const protorunesData = await getProtorunesByHeight(blockHeight);
    
    // Process and identify Alkanes transactions
    // We'll consider a transaction as an Alkanes transaction if it appears in either
    // the trace data or the protorunes data
    
    const alkanesTransactions = [];
    
    // If trace data is available, extract transaction IDs
    if (traceData && Array.isArray(traceData)) {
      for (const trace of traceData) {
        // The structure depends on the actual trace data format
        // This is a simplified example - adjust based on actual format
        if (trace && trace.txid) {
          alkanesTransactions.push({
            txid: trace.txid,
            vout: trace.vout || 0,
            type: 'execution'
          });
        }
      }
    }
    
    // If protorunes data is available, extract transaction IDs
    if (protorunesData && protorunesData.runestones) {
      for (const runestone of protorunesData.runestones) {
        // Extract transaction ID from runestone
        // Again, adjust based on actual format
        if (runestone && runestone.outpoint && runestone.outpoint.txid) {
          // Check if this transaction is already in our list
          const existingIndex = alkanesTransactions.findIndex(tx => 
            tx.txid === runestone.outpoint.txid && tx.vout === runestone.outpoint.vout
          );
          
          if (existingIndex === -1) {
            alkanesTransactions.push({
              txid: runestone.outpoint.txid,
              vout: runestone.outpoint.vout,
              type: 'token_activity'
            });
          }
        }
      }
    }
    
    // Fallback: If we couldn't identify Alkanes transactions through the above methods,
    // we can use a simpler approach to analyze block transactions
    if (alkanesTransactions.length === 0 && block.tx) {
      // This would be a more basic approach, perhaps using known patterns
      // or other heuristics to identify likely Alkanes transactions
      console.log('No Alkanes transactions identified through API, using fallback detection');
      
      // Simplified example - in a real implementation you'd have more sophisticated detection
      const sampleTxs = block.tx.slice(0, 3); // Just for demonstration
      for (const txid of sampleTxs) {
        alkanesTransactions.push({
          txid,
          vout: 0,
          type: 'potential'
        });
      }
    }
    
    res.json({
      blockHeight,
      blockHash: block.hash,
      alkanesTransactions
    });
  } catch (error: any) {
    console.error(`Error getting Alkanes transactions for block:`, error.message);
    res.status(500).json({ error: 'Failed to get Alkanes transactions' });
  }
}) as RequestHandler);

// API test endpoint for testing Metashrew connectivity with different configurations
app.get('/api/test-metashrew', (async (req, res) => {
  try {
    const url = req.query.url as string || process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
    
    console.log(`Testing Metashrew API connection to ${url} without project ID`);
    
    // Create a temporary axios client with the specified configuration
    const testClient = axios.create({
      baseURL: url,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Attempt to call the metashrew_height method
    try {
      const heightResponse = await testClient.post('', {
        method: 'metashrew_height',
        params: [],
        id: 0,
        jsonrpc: '2.0'
      });
      
      console.log(`metashrew_height response:`, heightResponse.data);
      
      if (heightResponse.data.error) {
        return res.json({
          success: false,
          method: 'metashrew_height',
          error: heightResponse.data.error,
          message: `API returned error: ${heightResponse.data.error.message || JSON.stringify(heightResponse.data.error)}`
        });
      }
      
      return res.json({
        success: true,
        method: 'metashrew_height',
        result: heightResponse.data.result,
        message: `Successfully connected to ${url} without project ID`
      });
    } catch (heightError: any) {
      console.error('metashrew_height failed:', heightError.message);
      
      // Try btc_getblockcount as a fallback
      try {
        const blockCountResponse = await testClient.post('', {
          method: 'btc_getblockcount',
          params: [],
          id: 1,
          jsonrpc: '2.0'
        });
        
        console.log(`btc_getblockcount response:`, blockCountResponse.data);
        
        if (blockCountResponse.data.error) {
          return res.json({
            success: false,
            method: 'btc_getblockcount',
            error: blockCountResponse.data.error,
            message: `API returned error: ${blockCountResponse.data.error.message || JSON.stringify(blockCountResponse.data.error)}`
          });
        }
        
        return res.json({
          success: true,
          method: 'btc_getblockcount',
          result: blockCountResponse.data.result,
          message: `Successfully connected to ${url} without project ID (metashrew_height failed but btc_getblockcount worked)`
        });
      } catch (blockCountError: any) {
        const errorDetails = blockCountError.response 
          ? { status: blockCountError.response.status, data: blockCountError.response.data }
          : { message: blockCountError.message };
          
        return res.json({
          success: false,
          method: 'both',
          error: errorDetails,
          message: `Failed to connect to ${url}: ${blockCountError.message}`
        });
      }
    }
  } catch (error: any) {
    console.error('Error testing Metashrew API:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: `Server error: ${error.message}`
    });
  }
}) as RequestHandler);

// API test endpoint for diagnosing Metashrew connectivity issues
app.get('/api/test/metashrew', async (req, res) => {
  try {
    console.log('Testing Metashrew API connection...');
    
    // Direct API call using axios without our wrapper to see raw response
    const axios = require('axios');
    const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
    
    console.log(`Making direct API call to ${METASHREW_API_URL}`);
    
    // Create interfaces for our response objects
    interface JsonRpcResponse {
      jsonrpc: string;
      id: number;
      result?: any;
      error?: {
        message: string;
        stack?: string;
      };
    }
    
    interface ApiResponse {
      status: number;
      data: JsonRpcResponse;
    }
    
    const response = await axios.post(METASHREW_API_URL, {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'metashrew_height',
      params: []
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
    
    res.json({
      success: true,
      apiUrl: METASHREW_API_URL,
      rawResponse: response.data,
      parsedHeight: parseInt(response.data.result, 10)
    });
  } catch (error: any) {
    console.error('API Test Error:', error.message);
    
    // Get detailed error information
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response data'
    };
    
    console.error('Detailed Error:', JSON.stringify(errorDetails, null, 2));
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: errorDetails
    });
  }
});

// API status endpoint - provides detailed information about all API endpoints
app.get('/api/status', async (req, res) => {
  try {
    console.log('Fetching API status information...');
    
    // Direct API calls using axios to get raw responses
    const axios = require('axios');
    const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/lasereyes';
    
    console.log(`Making direct API calls to ${METASHREW_API_URL}`);
    
    // Create interfaces for our response objects
    interface JsonRpcResponse {
      jsonrpc: string;
      id: number;
      result?: any;
      error?: {
        message: string;
        stack?: string;
      };
    }
    
    interface ApiResponse {
      status: number;
      data: JsonRpcResponse;
    }
    
    // Try direct individual calls first - this seems to work better
    console.log('Attempting direct individual calls first...');
    
    // Get metashrew_height
    const metashrewHeightResponse = await axios.post(METASHREW_API_URL, {
      method: 'metashrew_height',
      params: [],
      id: 0,
      jsonrpc: '2.0'
    }, {
      headers: { 'Content-Type': 'application/json' }
    }).catch((error: any) => {
      console.log('metashrew_height request failed:', error.message);
      return { 
        status: error.response?.status || 500,
        data: {
          jsonrpc: '2.0',
          error: { message: error.message },
          id: 0
        }
      };
    });
    
    // Get btc_getblockcount
    const btcBlockCountResponse = await axios.post(METASHREW_API_URL, {
      method: 'btc_getblockcount',
      params: [],
      id: 1,
      jsonrpc: '2.0'
    }, {
      headers: { 'Content-Type': 'application/json' }
    }).catch((error: any) => {
      console.log('btc_getblockcount request failed:', error.message);
      return { 
        status: error.response?.status || 500,
        data: {
          jsonrpc: '2.0',
          error: { message: error.message },
          id: 1
        }
      };
    });
    
    // Parse the responses
    let metashrewHeight: number | null = null;
    let btcHeight: number | null = null;
    
    // Check if we have a valid metashrew_height response
    if (metashrewHeightResponse.data && metashrewHeightResponse.data.result) {
      if (typeof metashrewHeightResponse.data.result === 'string') {
        metashrewHeight = parseInt(metashrewHeightResponse.data.result, 10);
      } else if (typeof metashrewHeightResponse.data.result === 'number') {
        metashrewHeight = metashrewHeightResponse.data.result;
      }
      console.log('Successfully parsed metashrewHeight:', metashrewHeight);
    }
    
    // Check if we have a valid btc_getblockcount response
    if (btcBlockCountResponse.data && btcBlockCountResponse.data.result) {
      if (typeof btcBlockCountResponse.data.result === 'string') {
        btcHeight = parseInt(btcBlockCountResponse.data.result, 10);
      } else if (typeof btcBlockCountResponse.data.result === 'number') {
        btcHeight = btcBlockCountResponse.data.result;
      }
      console.log('Successfully parsed btcHeight:', btcHeight);
    }
    
    // Calculate sync status metrics if we have both heights
    let syncPercentage: number | null = null;
    let blocksRemaining: number | null = null;
    
    if (metashrewHeight !== null && btcHeight !== null && !isNaN(metashrewHeight) && !isNaN(btcHeight) && btcHeight > 0) {
      // Account for metashrew_height being 1 block ahead (polling for next block)
      if (metashrewHeight > btcHeight) {
        // If indexer is ahead, consider it 100% synced
        syncPercentage = 100;
        blocksRemaining = 0;
      } else {
        syncPercentage = (metashrewHeight / btcHeight) * 100;
        blocksRemaining = btcHeight - metashrewHeight;
      }
    }
    
    // Prepare the response
    const response = {
      success: true,
      endpoints: {
        metashrew_height: {
          url: METASHREW_API_URL,
          status: metashrewHeightResponse.status,
          rawResponse: metashrewHeightResponse.data,
          parsedValue: metashrewHeight
        },
        btc_getblockcount: {
          url: METASHREW_API_URL, // This is correct as both methods are called on the same endpoint
          status: btcBlockCountResponse.status,
          rawResponse: btcBlockCountResponse.data,
          parsedValue: btcHeight
        }
      },
      syncStatus: {
        indexerHeight: metashrewHeight,
        btcHeight: btcHeight,
        syncPercentage: syncPercentage,
        blocksRemaining: blocksRemaining
      },
      attemptedMethods: {
        individualCalls: true
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in API status endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Mount the router
app.use('/api', router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Static files served from: ${publicDir}`);
});
