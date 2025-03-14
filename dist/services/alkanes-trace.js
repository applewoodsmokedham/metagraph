"use strict";
/**
 * Alkanes trace implementation using the metashrew_view method
 * This follows the format documented in the API documentation
 */
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
exports.encodeOutpoint = encodeOutpoint;
exports.traceTransactionWithMultipleFormats = traceTransactionWithMultipleFormats;
exports.getTransactionTrace = getTransactionTrace;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/lasereyes';
// Create API client
const apiClient = axios_1.default.create({
    baseURL: METASHREW_API_URL,
    headers: {
        'Content-Type': 'application/json'
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
    }
    catch (error) {
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
 * Encode an Outpoint for use in trace calls
 * Use proper encoding for the OutPoint structure:
 * { txid: bytes, vout: number }
 */
function encodeOutpoint(txid, vout) {
    // Remove 0x prefix if present
    const txidNormalized = txid.startsWith('0x') ? txid.slice(2) : txid;
    // Create simple representation
    const outpoint = { txid: txidNormalized, vout };
    // Convert to hex string
    const hexInput = Buffer.from(JSON.stringify(outpoint)).toString('hex');
    return hexInput;
}
/**
 * Try calling the trace function with various encodings
 * This follows the documented metashrew_view approach
 */
async function traceTransactionWithMultipleFormats(txid, vout) {
    // The specific trace errors we've been seeing suggest formatting issues
    // Let's try multiple approaches to find the one that works
    // First, try standard encoding approach
    try {
        console.log(`Trying standard encoding for transaction ${txid}:${vout}`);
        const hexInput = encodeOutpoint(txid, vout);
        console.log('Hex Input:', hexInput);
        return await callView('trace', hexInput);
    }
    catch (error) {
        console.error('Standard encoding failed:', error.message);
        // Try alternate encoding: just use txid:vout as a string
        try {
            console.log('Trying string format encoding...');
            const stringInput = `${txid}:${vout}`;
            const hexInput = Buffer.from(stringInput).toString('hex');
            console.log('String hex input:', hexInput);
            return await callView('trace', hexInput);
        }
        catch (error) {
            console.error('String format failed:', error.message);
            // Try with protorunesbyoutpoint which uses the same OutPoint format
            try {
                console.log('Trying protorunesbyoutpoint instead...');
                const hexInput = encodeOutpoint(txid, vout);
                return await callView('protorunesbyoutpoint', hexInput);
            }
            catch (error) {
                console.error('protorunesbyoutpoint failed:', error.message);
                // As a last resort, try direct alkanes_trace call
                try {
                    console.log('Trying direct alkanes_trace call...');
                    const outpoint = { txid, vout };
                    return await callMetashrewApi('alkanes_trace', [outpoint]);
                }
                catch (error) {
                    console.error('alkanes_trace failed:', error.message);
                    throw new Error('All trace methods failed');
                }
            }
        }
    }
}
/**
 * Main function that attempts to trace a transaction
 * Returns the trace data or null if not found
 */
async function getTransactionTrace(txid, vout) {
    try {
        const result = await traceTransactionWithMultipleFormats(txid, vout);
        if (!result || (Array.isArray(result) && result.length === 0)) {
            console.warn(`No trace data available for transaction ${txid}:${vout}`);
            return null;
        }
        return result;
    }
    catch (error) {
        console.error(`Failed to get trace for transaction ${txid}:${vout}:`, error.message);
        return null;
    }
}
//# sourceMappingURL=alkanes-trace.js.map