/**
 * Method Discovery System for Metashrew API
 * Automatically detects available methods on different endpoints
 * and provides documentation and testing capabilities
 */
class MethodDiscovery {
  constructor() {
    this.methods = {
      LOCAL: [],
      PRODUCTION: [],
      COMMON: []
    };
    
    this.methodDocs = {};
    this.isInitialized = false;
    this.isDiscovering = false;
    
    // Add known core methods that should always be available
    this.knownCoreMethods = [
      'metashrew_height',
      'btc_getblockcount',
      'sandshrew_multicall',
      'metashrew_view'
    ];
    
    // Add known documentation for common methods
    this.initializeKnownMethodDocs();
    
    // Listen for endpoint changes
    document.addEventListener('endpoint-changed', (event) => {
      console.log('[Method Discovery] Endpoint changed:', event.detail);
      this.discoverAvailableMethods();
    });
    
    // Start discovery after DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.discoverAvailableMethods();
      });
    } else {
      // DOM already loaded
      this.discoverAvailableMethods();
    }
  }
  
  /**
   * Initialize documentation for known methods
   */
  initializeKnownMethodDocs() {
    // Add documentation for core methods
    this.addMethodDoc('metashrew_height', {
      category: 'core',
      description: 'Get the current height of the Metashrew indexer',
      params: [],
      returns: 'String representing the current block height (must be parsed to integer)',
      example: {
        method: 'metashrew_height',
        params: [],
        id: 0,
        jsonrpc: '2.0'
      },
      result: '881855'
    });
    
    this.addMethodDoc('btc_getblockcount', {
      category: 'bitcoin',
      description: 'Get the current block height of the Bitcoin node',
      params: [],
      returns: 'Integer representing the current block height',
      example: {
        method: 'btc_getblockcount',
        params: [],
        id: 0,
        jsonrpc: '2.0'
      },
      result: 881854
    });
    
    this.addMethodDoc('sandshrew_multicall', {
      category: 'utility',
      description: 'Execute multiple JSON-RPC calls in a single request',
      params: [
        'calls - Array of [methodName, paramsArray] tuples'
      ],
      returns: 'Array of results in the same order as the calls',
      example: {
        method: 'sandshrew_multicall',
        params: [
          [
            ['metashrew_height', []],
            ['btc_getblockcount', []]
          ]
        ],
        id: 0,
        jsonrpc: '2.0'
      },
      result: ['881855', 881854]
    });
    
    this.addMethodDoc('metashrew_view', {
      category: 'core',
      description: 'Call a view function on the Metashrew indexer',
      params: [
        'function - Name of the view function to call',
        'input - Hex-encoded input data',
        'blockTag - Block tag (usually "latest")'
      ],
      returns: 'Result of the view function call',
      example: {
        method: 'metashrew_view',
        params: ['alkane_inventory', '0x0123...', 'latest'],
        id: 0,
        jsonrpc: '2.0'
      },
      result: '0x0123...'
    });
    
    // Add documentation for Alkanes methods
    this.addMethodDoc('metashrew_view(simulate)', {
      category: 'alkanes',
      description: 'Simulates execution of Alkanes smart contracts',
      params: [
        'MessageContextParcel - Transaction data, calldata, etc.'
      ],
      returns: 'SimulateResponse (execution result and gas used)',
      example: {
        method: 'metashrew_view',
        params: ['simulate', '0x0123...', 'latest'],
        id: 0,
        jsonrpc: '2.0'
      },
      result: '0x0123...'
    });
    
    this.addMethodDoc('metashrew_view(trace)', {
      category: 'alkanes',
      description: 'Gets detailed execution trace for a transaction',
      params: [
        'OutPoint - Transaction ID and output index'
      ],
      returns: 'Binary trace data',
      example: {
        method: 'metashrew_view',
        params: ['trace', '0x0123...', 'latest'],
        id: 0,
        jsonrpc: '2.0'
      },
      result: '0x0123...'
    });
    
    this.addMethodDoc('metashrew_view(traceblock)', {
      category: 'alkanes',
      description: 'Gets execution traces for all transactions in a block',
      params: [
        'Block height'
      ],
      returns: 'Binary trace data for all transactions',
      example: {
        method: 'metashrew_view',
        params: ['traceblock', '0x0123...', 'latest'],
        id: 0,
        jsonrpc: '2.0'
      },
      result: '0x0123...'
    });
    
    this.addMethodDoc('metashrew_view(alkane_inventory)', {
      category: 'alkanes',
      description: 'Gets token holdings for an address or token',
      params: [
        'AlkaneInventoryRequest'
      ],
      returns: 'AlkaneInventoryResponse',
      example: {
        method: 'metashrew_view',
        params: ['alkane_inventory', '0x0123...', 'latest'],
        id: 0,
        jsonrpc: '2.0'
      },
      result: '0x0123...'
    });
    
    this.addMethodDoc('metashrew_view(call_view)', {
      category: 'alkanes',
      description: 'Calls a view function on an Alkanes contract',
      params: [
        'Alkane ID',
        'Inputs vector',
        'Fuel limit'
      ],
      returns: 'Raw response data',
      example: {
        method: 'metashrew_view',
        params: ['call_view', '0x0123...', 'latest'],
        id: 0,
        jsonrpc: '2.0'
      },
      result: '0x0123...'
    });
    
    // Add more method docs as needed
  }
  
  /**
   * Add documentation for a method
   * @param {string} method - Method name
   * @param {Object} doc - Method documentation
   */
  addMethodDoc(method, doc) {
    this.methodDocs[method] = {
      category: 'unknown',
      description: 'No description available',
      params: [],
      returns: 'Unknown',
      example: {},
      result: null,
      ...doc
    };
  }
  
  /**
   * Get documentation for a method
   * @param {string} method - Method name
   * @returns {Object} - Method documentation
   */
  getMethodDocs(method) {
    return this.methodDocs[method] || {
      category: 'unknown',
      description: 'No documentation available',
      params: [],
      returns: 'Unknown',
      example: {},
      result: null
    };
  }
  
  /**
   * Get method categories
   * @returns {Array} - List of categories
   */
  getMethodCategories() {
    const categories = new Set();
    
    Object.values(this.methodDocs).forEach(doc => {
      if (doc.category) {
        categories.add(doc.category);
      }
    });
    
    return Array.from(categories).sort();
  }
  
  /**
   * Get methods by category
   * @param {string} category - Category name
   * @param {string} endpointType - Endpoint type (LOCAL, PRODUCTION, COMMON)
   * @returns {Array} - List of methods in the category
   */
  getMethodsByCategory(category, endpointType = 'COMMON') {
    const methods = this.getAvailableMethods(endpointType);
    
    return methods.filter(method => {
      const doc = this.getMethodDocs(method);
      return doc.category === category;
    });
  }
  
  /**
   * Discover available methods on the active endpoint
   */
  async discoverAvailableMethods() {
    if (this.isDiscovering) {
      console.log('[Method Discovery] Discovery already in progress, skipping...');
      return;
    }
    
    this.isDiscovering = true;
    const endpointType = API_CONFIG.getActiveEndpointType();
    const apiClient = new MetashrewApiClient();
    
    console.log(`[Method Discovery] Starting method discovery for ${endpointType}`);
    
    try {
      // For local and production endpoints, add the known core methods as a fallback
      this.knownCoreMethods.forEach(method => {
        if (!this.methods[endpointType].includes(method)) {
          this.methods[endpointType].push(method);
        }
      });
      
      // Set common methods based on what's available in both local and production
      this.updateCommonMethods();
      
      // Try some test calls to verify endpoint capabilities
      if (endpointType === 'LOCAL' || endpointType === 'PRODUCTION') {
        try {
          // Try to get height
          const height = await apiClient.call('metashrew_height', []);
          console.log(`[Method Discovery] ${endpointType} height:`, height);
          
          // Try to get block count
          try {
            const blockCount = await apiClient.call('btc_getblockcount', []);
            console.log(`[Method Discovery] ${endpointType} block count:`, blockCount);
          } catch (error) {
            console.warn(`[Method Discovery] ${endpointType} does not support btc_getblockcount`);
            
            // Remove unsupported method
            this.methods[endpointType] = this.methods[endpointType].filter(m => m !== 'btc_getblockcount');
          }
          
          // Try a view method test if available
          if (endpointType === 'PRODUCTION') {
            // For production, add known Alkanes view methods
            const alkanesMethods = [
              'metashrew_view(simulate)',
              'metashrew_view(trace)',
              'metashrew_view(traceblock)',
              'metashrew_view(alkane_inventory)',
              'metashrew_view(call_view)',
              'metashrew_view(call_multiview)',
              'metashrew_view(protorunesbyaddress)',
              'metashrew_view(protorunesbyoutpoint)',
              'metashrew_view(protorunesbyheight)'
            ];
            
            alkanesMethods.forEach(method => {
              if (!this.methods[endpointType].includes(method)) {
                this.methods[endpointType].push(method);
              }
            });
          }
        } catch (error) {
          console.error(`[Method Discovery] Error testing ${endpointType} capabilities:`, error);
        }
      }
      
      // Update common methods again after discovery
      this.updateCommonMethods();
      
      // Dispatch event with discovered methods
      this.dispatchMethodsDetectedEvent();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('[Method Discovery] Error discovering methods:', error);
    } finally {
      this.isDiscovering = false;
    }
  }
  
  /**
   * Update common methods based on what's available in both local and production
   */
  updateCommonMethods() {
    this.methods.COMMON = this.methods.LOCAL.filter(method => 
      this.methods.PRODUCTION.includes(method)
    );
    
    // If either LOCAL or PRODUCTION is empty, use the other as COMMON
    if (this.methods.LOCAL.length === 0 && this.methods.PRODUCTION.length > 0) {
      this.methods.COMMON = [...this.methods.PRODUCTION];
    } else if (this.methods.PRODUCTION.length === 0 && this.methods.LOCAL.length > 0) {
      this.methods.COMMON = [...this.methods.LOCAL];
    }
    
    // Ensure all COMMON methods have documentation
    this.methods.COMMON.forEach(method => {
      if (!this.methodDocs[method]) {
        this.addMethodDoc(method, {
          category: this.getCategoryFromMethod(method),
          description: `${method} method`
        });
      }
    });
  }
  
  /**
   * Get a category for a method based on its name
   * @param {string} method - Method name
   * @returns {string} - Category name
   */
  getCategoryFromMethod(method) {
    if (method.startsWith('btc_')) return 'bitcoin';
    if (method.startsWith('eth_')) return 'ethereum';
    if (method.startsWith('metashrew_')) return 'core';
    if (method.startsWith('sandshrew_')) return 'utility';
    if (method.includes('alkane') || method.includes('rune')) return 'alkanes';
    return 'unknown';
  }
  
  /**
   * Dispatch event with detected methods
   */
  dispatchMethodsDetectedEvent() {
    const event = new CustomEvent('methods-detected', {
      detail: {
        methods: this.methods,
        endpointType: API_CONFIG.getActiveEndpointType()
      }
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Get available methods for a specific endpoint type
   * @param {string} endpointType - Endpoint type (LOCAL, PRODUCTION, COMMON)
   * @returns {Array} - List of available methods
   */
  getAvailableMethods(endpointType = 'COMMON') {
    if (!this.isInitialized && !this.isDiscovering) {
      this.discoverAvailableMethods();
    }
    
    return this.methods[endpointType] || [];
  }
}

// Create a singleton instance
const methodDiscovery = new MethodDiscovery();
