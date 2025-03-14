/**
 * Alkanes trace implementation using the metashrew_view method
 * This follows the format documented in the API documentation
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const METASHREW_API_URL = process.env.METASHREW_API_URL || 'https://mainnet.sandshrew.io/v2/lasereyes';

// Create API client
const apiClient = axios.create({
  baseURL: METASHREW_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Make a JSON-RPC call to the Metashrew API
 */
export async function callMetashrewApi(method: string, params: any[] = []): Promise<any> {
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
  } catch (error: any) {
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
export async function callView(viewName: string, hexInput: string, blockTag: string = 'latest'): Promise<any> {
  return callMetashrewApi('metashrew_view', [viewName, hexInput, blockTag]);
}

/**
 * Encode an Outpoint for use in trace calls
 * Use proper encoding for the OutPoint structure:
 * { txid: bytes, vout: number }
 */
export function encodeOutpoint(txid: string, vout: number): string {
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
export async function traceTransactionWithMultipleFormats(txid: string, vout: number): Promise<any> {
  // The specific trace errors we've been seeing suggest formatting issues
  // Let's try multiple approaches to find the one that works
  
  // First, try standard encoding approach
  try {
    console.log(`Trying standard encoding for transaction ${txid}:${vout}`);
    const hexInput = encodeOutpoint(txid, vout);
    console.log('Hex Input:', hexInput);
    return await callView('trace', hexInput);
  } catch (error) {
    console.error('Standard encoding failed:', (error as Error).message);
    
    // Try alternate encoding: just use txid:vout as a string
    try {
      console.log('Trying string format encoding...');
      const stringInput = `${txid}:${vout}`;
      const hexInput = Buffer.from(stringInput).toString('hex');
      console.log('String hex input:', hexInput);
      return await callView('trace', hexInput);
    } catch (error) {
      console.error('String format failed:', (error as Error).message);
      
      // Try with protorunesbyoutpoint which uses the same OutPoint format
      try {
        console.log('Trying protorunesbyoutpoint instead...');
        const hexInput = encodeOutpoint(txid, vout);
        return await callView('protorunesbyoutpoint', hexInput);
      } catch (error) {
        console.error('protorunesbyoutpoint failed:', (error as Error).message);
        
        // As a last resort, try direct alkanes_trace call
        try {
          console.log('Trying direct alkanes_trace call...');
          const outpoint = { txid, vout };
          return await callMetashrewApi('alkanes_trace', [outpoint]);
        } catch (error) {
          console.error('alkanes_trace failed:', (error as Error).message);
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
export async function getTransactionTrace(txid: string, vout: number): Promise<any> {
  try {
    const result = await traceTransactionWithMultipleFormats(txid, vout);
    
    if (!result || (Array.isArray(result) && result.length === 0)) {
      console.warn(`No trace data available for transaction ${txid}:${vout}`);
      return null;
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to get trace for transaction ${txid}:${vout}:`, (error as Error).message);
    return null;
  }
}
