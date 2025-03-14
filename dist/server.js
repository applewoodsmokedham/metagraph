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
const express_1 = __importStar(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const bitcoin_rpc_1 = require("./services/bitcoin-rpc");
const metashrew_api_1 = require("./services/metashrew-api");
const block_processor_1 = require("./lib/block-processor");
const canvas_visualizer_1 = require("./lib/canvas-visualizer");
const transaction_origin_1 = require("./services/transaction-origin");
// Load environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Determine the correct public directory path
// In development, it's in src/public, in production it's relative to the js file
const isProduction = __filename.endsWith('.js');
const publicDir = isProduction
    ? path_1.default.join(__dirname, '../src/public')
    : path_1.default.join(__dirname, 'public');
// Serve static files from the public directory
app.use(express_1.default.static(publicDir));
app.use(express_1.default.json());
// Create images directory if it doesn't exist
const imagesDir = path_1.default.join(publicDir, 'images');
if (!fs_1.default.existsSync(imagesDir)) {
    fs_1.default.mkdirSync(imagesDir, { recursive: true });
}
// Proxy for Metashrew API
app.post('/api/rpc', (async (req, res) => {
    try {
        const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
        console.log('Forwarding RPC request to:', METASHREW_API_URL);
        console.log('Request body:', JSON.stringify(req.body));
        const response = await axios_1.default.post(METASHREW_API_URL, req.body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Metashrew API proxy error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        res.status(500).json({
            error: 'Failed to connect to Metashrew API',
            message: error.message
        });
    }
}));
// Simple RPC endpoint (alternative path)
app.post('/rpc', (async (req, res) => {
    try {
        const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
        console.log('Forwarding RPC request to:', METASHREW_API_URL);
        const response = await axios_1.default.post(METASHREW_API_URL, req.body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Metashrew API proxy error:', error.message);
        res.status(500).json({
            error: 'Failed to connect to Metashrew API',
            message: error.message
        });
    }
}));
// API endpoint for sync status
app.get('/api/sync-status', (async (req, res) => {
    try {
        // First get the Bitcoin height
        const bitcoinHeight = await (0, bitcoin_rpc_1.getBlockCount)();
        // Then use it to get sync status
        const syncData = await (0, metashrew_api_1.getSyncStatus)(bitcoinHeight);
        // Return the sync data directly - our updated getSyncStatus returns numerical values
        res.json({
            currentHeight: syncData.indexerHeight,
            nodeHeight: syncData.bitcoinHeight,
            syncPercentage: syncData.syncPercentage
        });
    }
    catch (error) {
        console.error('Error fetching sync status:', error.message);
        res.status(500).json({
            currentHeight: 0,
            nodeHeight: 0,
            syncPercentage: 0,
            error: 'Failed to fetch sync status'
        });
    }
}));
// Homepage
app.get('/', ((req, res) => {
    res.sendFile(path_1.default.join(publicDir, 'index.html'));
}));
// API endpoint to get the latest block with decoded runestones
app.get('/api/latest-block', (async (req, res) => {
    try {
        const block = await (0, bitcoin_rpc_1.getLatestBlock)();
        const runestones = (0, block_processor_1.processBlock)(block);
        res.json({
            blockHeight: block.height,
            blockHash: block.hash,
            blockTime: block.time,
            runestoneCount: runestones.length,
            runestones
        });
    }
    catch (error) {
        console.error('Error fetching latest block:', error.message);
        res.status(500).json({ error: 'Failed to fetch latest block' });
    }
}));
// API routes
const router = (0, express_1.Router)();
// API endpoint to get a specific block with decoded runestones
router.get('/block/:height', (async (req, res) => {
    try {
        const height = parseInt(req.params.height);
        if (isNaN(height)) {
            return res.status(400).json({ error: 'Invalid block height' });
        }
        const block = await (0, bitcoin_rpc_1.getBlockAtHeight)(height);
        const runestones = (0, block_processor_1.processBlock)(block);
        res.json({
            blockHeight: block.height,
            blockHash: block.hash,
            blockTime: block.time,
            runestoneCount: runestones.length,
            runestones
        });
    }
    catch (error) {
        console.error(`Error fetching block ${req.params.height}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch block' });
    }
}));
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
        const blocks = await (0, bitcoin_rpc_1.getBlockRange)(start, count);
        const allRunestones = (0, block_processor_1.processBlocks)(blocks);
        const summary = (0, block_processor_1.generateRunestoneSummary)(allRunestones);
        res.json({
            startBlock: start,
            endBlock: start - count + 1,
            blockCount: blocks.length,
            runestoneCount: allRunestones.length,
            summary,
            runestones: allRunestones
        });
    }
    catch (error) {
        console.error(`Error fetching block range ${req.params.start}-${req.params.count}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch block range' });
    }
}));
// API endpoint to get Alkanes tokens at a specific block height
router.get('/protorunes/:height', (async (req, res) => {
    try {
        const height = parseInt(req.params.height);
        if (isNaN(height)) {
            return res.status(400).json({ error: 'Invalid block height' });
        }
        const protorunes = await (0, metashrew_api_1.getProtorunesByHeight)(height);
        res.json(protorunes);
    }
    catch (error) {
        console.error(`Error fetching protorunes for block ${req.params.height}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch protorunes' });
    }
}));
// API endpoint to get sync status
router.get('/sync-status', (async (req, res) => {
    try {
        const bitcoinHeight = await (0, bitcoin_rpc_1.getBlockCount)();
        const status = await (0, metashrew_api_1.getSyncStatus)(bitcoinHeight);
        res.json(status);
    }
    catch (error) {
        console.error('Error fetching sync status:', error.message);
        res.status(500).json({ error: 'Failed to fetch sync status' });
    }
}));
// API endpoint to get a canvas visualization for a specific runestone
router.get('/visualize/:txid/:vout', (async (req, res) => {
    try {
        const { txid, vout } = req.params;
        if (!txid || isNaN(parseInt(vout))) {
            return res.status(400).json({ error: 'Invalid parameters' });
        }
        // Find the runestone in recent blocks
        const latestBlock = await (0, bitcoin_rpc_1.getLatestBlock)();
        const blocks = await (0, bitcoin_rpc_1.getBlockRange)(latestBlock.height, 10);
        const allRunestones = (0, block_processor_1.processBlocks)(blocks);
        const runestone = allRunestones.find(r => r.txid === txid && r.vout === parseInt(vout));
        if (!runestone) {
            return res.status(404).json({ error: 'Runestone not found' });
        }
        // Generate the visualization
        const pngBuffer = canvas_visualizer_1.RunestoneCanvasVisualizer.visualizeSingle(runestone);
        // Save the visualization to a file
        const filename = `${txid}_${vout}.png`;
        const filePath = path_1.default.join(imagesDir, filename);
        fs_1.default.writeFileSync(filePath, pngBuffer);
        // Set the content type and send the image
        res.type('image/png');
        res.send(pngBuffer);
    }
    catch (error) {
        console.error(`Error visualizing runestone ${req.params.txid}:`, error.message);
        res.status(500).json({ error: 'Failed to visualize runestone' });
    }
}));
// API endpoint to get a canvas visualization for a block summary
router.get('/visualize-block/:height', (async (req, res) => {
    try {
        const height = parseInt(req.params.height);
        if (isNaN(height)) {
            return res.status(400).json({ error: 'Invalid block height' });
        }
        const block = await (0, bitcoin_rpc_1.getBlockAtHeight)(height);
        const runestones = (0, block_processor_1.processBlock)(block);
        if (runestones.length === 0) {
            return res.status(404).json({ error: 'No runestones found in this block' });
        }
        // Generate the visualization
        const pngBuffer = canvas_visualizer_1.RunestoneCanvasVisualizer.visualizeSummary(runestones);
        // Save the visualization to a file
        const filename = `block_${height}.png`;
        const filePath = path_1.default.join(imagesDir, filename);
        fs_1.default.writeFileSync(filePath, pngBuffer);
        // Set the content type and send the image
        res.type('image/png');
        res.send(pngBuffer);
    }
    catch (error) {
        console.error(`Error visualizing block ${req.params.height}:`, error.message);
        res.status(500).json({ error: 'Failed to visualize block' });
    }
}));
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
        const traceData = await (0, metashrew_api_1.traceTransaction)(txid, vout);
        // Check if we have valid trace data
        const hasTrace = Array.isArray(traceData) && traceData.length > 0;
        res.json({
            txid,
            reversedTxid: (0, metashrew_api_1.reverseBytes)(txid),
            vout,
            hasTrace,
            traceData
        });
    }
    catch (error) {
        console.error(`Error tracing transaction ${req.params.txid}:`, error.message);
        res.status(500).json({ error: 'Failed to trace transaction' });
    }
}));
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
        const traceResults = await (0, metashrew_api_1.traceMultipleTransactions)(formattedTransactions);
        // Format the results with original and reversed txids
        const results = formattedTransactions.map((tx, index) => ({
            txid: tx.txid,
            reversedTxid: (0, metashrew_api_1.reverseBytes)(tx.txid),
            vout: tx.vout,
            hasTrace: Array.isArray(traceResults[index]) && traceResults[index].length > 0,
            traceData: traceResults[index]
        }));
        res.json({
            transactionCount: results.length,
            transactionsWithTraces: results.filter(r => r.hasTrace).length,
            results
        });
    }
    catch (error) {
        console.error('Error tracing batch of transactions:', error.message);
        res.status(500).json({ error: 'Failed to trace batch of transactions' });
    }
}));
// API endpoint for transaction origin tracing
router.get('/transaction/trace-origin/:txid/:vout', (async (req, res) => {
    try {
        const { txid, vout } = req.params;
        if (!txid || isNaN(parseInt(vout))) {
            return res.status(400).json({ error: 'Invalid transaction parameters' });
        }
        console.log(`Tracing origin for transaction ${txid}:${vout}`);
        const originTrace = await (0, transaction_origin_1.traceTransactionOrigin)(txid, parseInt(vout));
        if (!originTrace) {
            return res.status(404).json({ error: 'Transaction origin trace not found' });
        }
        res.json(originTrace);
    }
    catch (error) {
        console.error('Error tracing transaction origin:', error.message);
        res.status(500).json({ error: 'Failed to trace transaction origin' });
    }
}));
// API endpoint for full execution context
router.get('/transaction/execution-context/:txid/:vout', (async (req, res) => {
    try {
        const { txid, vout } = req.params;
        if (!txid || isNaN(parseInt(vout))) {
            return res.status(400).json({ error: 'Invalid transaction parameters' });
        }
        console.log(`Getting execution context for transaction ${txid}:${vout}`);
        const context = await (0, transaction_origin_1.getExecutionContext)(txid, parseInt(vout));
        if (!context) {
            return res.status(404).json({ error: 'Execution context not found' });
        }
        res.json(context);
    }
    catch (error) {
        console.error('Error getting execution context:', error.message);
        res.status(500).json({ error: 'Failed to get execution context' });
    }
}));
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
    }
    catch (error) {
        console.error('Error searching for transactions:', error.message);
        res.status(500).json({ error: 'Failed to search for transactions' });
    }
}));
// API endpoint to get Alkanes transactions for a specific block
router.get('/block/:height/alkanes', (async (req, res) => {
    try {
        const blockHeight = parseInt(req.params.height);
        if (isNaN(blockHeight)) {
            return res.status(400).json({ error: 'Invalid block height' });
        }
        console.log(`Fetching Alkanes transactions for block ${blockHeight}`);
        // Get the block data
        const block = await (0, bitcoin_rpc_1.getBlockAtHeight)(blockHeight);
        if (!block) {
            return res.status(404).json({ error: 'Block not found' });
        }
        // Get traceblock data to identify Alkanes transactions
        const traceData = await (0, metashrew_api_1.traceBlock)(blockHeight);
        // Get protorunes data for this block
        const protorunesData = await (0, metashrew_api_1.getProtorunesByHeight)(blockHeight);
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
                    const existingIndex = alkanesTransactions.findIndex(tx => tx.txid === runestone.outpoint.txid && tx.vout === runestone.outpoint.vout);
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
    }
    catch (error) {
        console.error(`Error getting Alkanes transactions for block:`, error.message);
        res.status(500).json({ error: 'Failed to get Alkanes transactions' });
    }
}));
// API test endpoint for testing Metashrew connectivity with different configurations
app.get('/api/test-metashrew', (async (req, res) => {
    try {
        const url = req.query.url || process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
        console.log(`Testing Metashrew API connection to ${url} without project ID`);
        // Create a temporary axios client with the specified configuration
        const testClient = axios_1.default.create({
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
        }
        catch (heightError) {
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
            }
            catch (blockCountError) {
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
    }
    catch (error) {
        console.error('Error testing Metashrew API:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: `Server error: ${error.message}`
        });
    }
}));
// API test endpoint for diagnosing Metashrew connectivity issues
app.get('/api/test/metashrew', async (req, res) => {
    try {
        console.log('Testing Metashrew API connection...');
        // Direct API call using axios without our wrapper to see raw response
        const axios = require('axios');
        const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/subfrost';
        console.log(`Making direct API call to ${METASHREW_API_URL}`);
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
    }
    catch (error) {
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
        }).catch((error) => {
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
        }).catch((error) => {
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
        let metashrewHeight = null;
        let btcHeight = null;
        // Check if we have a valid metashrew_height response
        if (metashrewHeightResponse.data && metashrewHeightResponse.data.result) {
            if (typeof metashrewHeightResponse.data.result === 'string') {
                metashrewHeight = parseInt(metashrewHeightResponse.data.result, 10);
            }
            else if (typeof metashrewHeightResponse.data.result === 'number') {
                metashrewHeight = metashrewHeightResponse.data.result;
            }
            console.log('Successfully parsed metashrewHeight:', metashrewHeight);
        }
        // Check if we have a valid btc_getblockcount response
        if (btcBlockCountResponse.data && btcBlockCountResponse.data.result) {
            if (typeof btcBlockCountResponse.data.result === 'string') {
                btcHeight = parseInt(btcBlockCountResponse.data.result, 10);
            }
            else if (typeof btcBlockCountResponse.data.result === 'number') {
                btcHeight = btcBlockCountResponse.data.result;
            }
            console.log('Successfully parsed btcHeight:', btcHeight);
        }
        // Calculate sync status metrics if we have both heights
        let syncPercentage = null;
        let blocksRemaining = null;
        if (metashrewHeight !== null && btcHeight !== null && !isNaN(metashrewHeight) && !isNaN(btcHeight) && btcHeight > 0) {
            // Account for metashrew_height being 1 block ahead (polling for next block)
            if (metashrewHeight > btcHeight) {
                // If indexer is ahead, consider it 100% synced
                syncPercentage = 100;
                blocksRemaining = 0;
            }
            else {
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
    }
    catch (error) {
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
//# sourceMappingURL=server.js.map