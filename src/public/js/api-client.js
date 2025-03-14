/**
 * API Client for Metashrew
 * Provides methods for making JSON-RPC calls to the Metashrew API
 */
class MetashrewApiClient {
  constructor(options = {}) {
    this.baseUrl = API_CONFIG.getActiveEndpoint();
    this.endpointType = API_CONFIG.getActiveEndpointType();
    this.options = {
      timeout: 10000,
      retries: 1,
      ...options
    };
    
    // Listen for endpoint changes
    document.addEventListener('endpoint-changed', (event) => {
      // Get the endpoint from the event detail or directly from API_CONFIG
      const endpoint = event.detail?.endpoint || API_CONFIG.getActiveEndpoint();
      this.updateBaseUrl(endpoint);
      this.endpointType = event.detail?.type || API_CONFIG.getActiveEndpointType();
      console.log(`[API Client] Endpoint changed to: ${this.endpointType} (${endpoint})`);
    });
    
    // Log initial setup
    console.log('[API Client] Initialized with endpoint:', this.baseUrl);
  }
  
  // Update the base URL when needed
  updateBaseUrl(url) {
    if (url) {
      this.baseUrl = url;
    } else {
      this.baseUrl = API_CONFIG.getActiveEndpoint();
    }
    console.log('[API Client] Base URL updated to:', this.baseUrl);
    return this.baseUrl;
  }
  
  /**
   * Make a basic JSON-RPC call to the Metashrew API
   * Following the exact format requirements:
   * 1. Field order: method, params, id, jsonrpc
   * 2. Fixed ID (0)
   * 3. Only Content-Type header
   * 
   * @param {string} method - RPC method name
   * @param {Array} params - Parameters for the method
   * @returns {Promise<any>} - API response
   */
  async call(method, params = [], options = {}) {
    const endpoint = this.baseUrl;
    const requestId = options.id || 0;
    
    const payload = {
      method,
      params,
      id: requestId,
      jsonrpc: '2.0'
    };
    
    console.log(`[API Client] Calling ${method} at ${endpoint}`, { payload });
    
    let lastError = null;
    let attempts = 0;
    
    // Try the requested endpoint first
    try {
      const response = await this._makeRequest(endpoint, payload);
      return response;
    } catch (error) {
      console.warn(`[API Client] Error calling ${method} at ${endpoint}:`, error);
      lastError = error;
      attempts++;
      
      // If we're using production and it failed, try falling back to local
      if (this.endpointType === 'PRODUCTION' && this.options.retries > 0) {
        try {
          console.log(`[API Client] Attempting fallback to local endpoint for ${method}`);
          const localEndpoint = API_CONFIG.getLocalEndpoint();
          const response = await this._makeRequest(localEndpoint, payload);
          console.log(`[API Client] Successfully used local fallback for ${method}`);
          return response;
        } catch (fallbackError) {
          console.error(`[API Client] Fallback to local also failed for ${method}:`, fallbackError);
          lastError = fallbackError;
        }
      }
    }
    
    // If we got here, all attempts failed
    throw new Error(`API call to ${method} failed: ${lastError?.message || 'Unknown error'}`);
  }
  
  async _makeRequest(endpoint, payload) {
    try {
      // Create a controller for timeout handling that works in all browsers
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`API Error: ${data.error.message || JSON.stringify(data.error)}`);
      }
      
      return data.result;
    } catch (error) {
      // Handle AbortError specially (more user-friendly message)
      if (error.name === 'AbortError') {
        throw new Error(`Request to ${endpoint} timed out after ${this.options.timeout}ms`);
      }
      
      // Add more context to the error
      const enhancedError = new Error(`Request to ${endpoint} failed: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.endpoint = endpoint;
      enhancedError.payload = payload;
      throw enhancedError;
    }
  }
  
  /**
   * Check if the API is synced
   * Returns object with height, nodeHeight, and sync percentage
   */
  async checkSync() {
    let height = -1;
    let nodeHeight = -1;
    let syncPercentage = 0;

    try {
      console.log('[API Client] Checking sync status using endpoint:', this.baseUrl);
      
      // Update baseUrl to ensure it's current
      this.baseUrl = API_CONFIG.getActiveEndpoint();
      
      // Try sandshrew_multicall first (more efficient)
      try {
        // Define the calls to batch
        const calls = [
          ['metashrew_height', []],
          ['btc_getblockcount', []]
        ];
        
        // Make the multicall
        const results = await this.call('sandshrew_multicall', [calls]);
        console.log('[API Client] Multicall results:', results);
        
        if (Array.isArray(results) && results.length === 2) {
          // Parse the heights (metashrew_height returns a string)
          height = parseInt(results[0], 10);
          nodeHeight = parseInt(results[1], 10);
        } else {
          throw new Error('Invalid multicall response format');
        }
      } catch (multicallError) {
        console.warn('[API Client] Multicall failed, falling back to individual calls:', multicallError);
        
        // Fallback to individual calls - try metashrew_height first
        try {
          const heightStr = await this.call('metashrew_height', []);
          height = parseInt(heightStr, 10);
          console.log('[API Client] Retrieved indexer height:', height);
        } catch (heightError) {
          console.error('[API Client] Failed to get metashrew_height:', heightError);
          height = -1;
        }
        
        // Then try btc_getblockcount
        try {
          nodeHeight = await this.call('btc_getblockcount', []);
          console.log('[API Client] Retrieved node height:', nodeHeight);
        } catch (blockCountError) {
          console.error('[API Client] Failed to get btc_getblockcount:', blockCountError);
          
          // If we have a valid indexer height but no node height, estimate node height
          if (height > 0) {
            nodeHeight = Math.max(0, height - 1); // Estimate node height based on indexer height
            console.log('[API Client] Estimated node height:', nodeHeight);
          } else {
            nodeHeight = -1;
          }
        }
      }
      
      // Calculate sync percentage if we have valid heights
      if (height > 0 && nodeHeight > 0) {
        // Note: Indexer can sometimes be ahead of node, so handle that case
        syncPercentage = height >= nodeHeight ? 100 : Math.floor((height / nodeHeight) * 100);
      } else if (height > 0) {
        // If we only have indexer height, assume it's nearly synced
        syncPercentage = 99;
      } else {
        // No valid heights
        syncPercentage = 0;
      }
      
      console.log('[API Client] Sync status calculated:', { height, nodeHeight, syncPercentage });
      
      return {
        height: height > 0 ? height : -1,
        nodeHeight: nodeHeight > 0 ? nodeHeight : -1,
        syncPercentage: syncPercentage
      };
    } catch (error) {
      console.error('[API Client] Error checking sync status:', error);
      
      return {
        height: height > 0 ? height : -1,
        nodeHeight: nodeHeight > 0 ? nodeHeight : -1,
        syncPercentage: syncPercentage
      };
    }
  }
  
  /**
   * Call a view function through the Metashrew API
   * @param {string} viewName - Name of the view function
   * @param {string} input - Hex-encoded input for the view function
   * @param {string} blockTag - Block tag (e.g., 'latest')
   * @returns {Promise<any>} - API response
   */
  async callView(viewName, input, blockTag = 'latest') {
    console.log(`[API Client] Calling view function ${viewName} with input ${input?.substring(0, 30)}... at block ${blockTag}`);
    try {
      const result = await this.call('metashrew_view', [viewName, input, blockTag]);
      return result;
    } catch (error) {
      console.error(`[API Client] Error in callView for ${viewName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get the current height of the Metashrew indexer
   * @returns {Promise<number>} - Current height as a number
   */
  async getHeight() {
    try {
      const height = await this.call('metashrew_height', []);
      return height; // Already parsed to number in call() method
    } catch (error) {
      console.error('[API Client] Failed to get Metashrew height:', error);
      return -1; // Return -1 to indicate error
    }
  }
  
  /**
   * Get the current Bitcoin block height
   * @returns {Promise<number>} - Current BTC block height
   */
  async getBtcHeight() {
    try {
      const height = await this.call('btc_getblockcount', []);
      return height;
    } catch (error) {
      console.error('[API Client] Failed to get BTC height:', error);
      return -1; // Return -1 to indicate error
    }
  }
  
  /**
   * Get API connection status (combines indexer and btc height)
   * @returns {Promise<Object>} - Status object with heights and sync info
   */
  async getSyncStatus() {
    try {
      // Use Promise.all to run both requests in parallel
      const [indexerHeight, btcHeight] = await Promise.all([
        this.getHeight(),
        this.getBtcHeight()
      ]);
      
      // Check if either call failed
      if (indexerHeight === -1 || btcHeight === -1) {
        return {
          isError: true,
          indexerHeight: indexerHeight === -1 ? 'Error' : indexerHeight,
          btcHeight: btcHeight === -1 ? 'Error' : btcHeight
        };
      }
      
      // Calculate sync progress
      // Note: indexerHeight can be slightly ahead of btcHeight, which is normal
      // Treat it as fully synced if they're within 1 block of each other
      const blocksRemaining = Math.max(0, btcHeight - indexerHeight);
      
      // If indexer is ahead or at the same height, it's 100% synced
      // Otherwise calculate the percentage
      let syncPercentage = 100;
      if (indexerHeight < btcHeight) {
        syncPercentage = (indexerHeight / btcHeight) * 100;
      }
      
      return {
        isError: false,
        indexerHeight,
        btcHeight,
        blocksRemaining,
        syncPercentage
      };
    } catch (error) {
      console.error('[API Client] Failed to get sync status:', error);
      return {
        isError: true,
        indexerHeight: 'Error',
        btcHeight: 'Error',
        blocksRemaining: 'Error',
        syncPercentage: 0
      };
    }
  }
  
  /**
   * Make a batch of API calls using sandshrew_multicall
   * @param {Array<Array>} calls - Array of [method, params] arrays
   * @returns {Promise<Array>} - Array of results in the same order as calls
   */
  async multicall(calls) {
    const callsArray = Array.isArray(calls) ? calls : [];
    
    if (callsArray.length === 0) {
      return [];
    }
    
    try {
      const results = await this.call('sandshrew_multicall', [callsArray]);
      return results;
    } catch (error) {
      console.error('[API Client] Multicall failed, falling back to individual calls', error);
      
      // Fall back to individual calls if multicall fails
      const promises = callsArray.map(([method, params]) => {
        return this.call(method, params)
          .catch(err => {
            console.warn(`[API Client] Individual call to ${method} failed:`, err);
            return null; // Return null for failed calls
          });
      });
      
      return Promise.all(promises);
    }
  }
}

// Create a global instance
const apiClient = new MetashrewApiClient();
