/**
 * API Configuration
 * Manages endpoints and provides methods to switch between them
 */
const API_CONFIG = {
  ENDPOINTS: {
    // Use the proxy server routes instead of direct connections
    LOCAL: 'http://localhost:8085',  // Direct to local Metashrew on port 8085
    PRODUCTION: 'https://mainnet.sandshrew.io/v2/lasereyes'  // Direct connection to production
  },
  // Default to production for reliable access
  ACTIVE_ENDPOINT: 'PRODUCTION',
  
  // Get the currently active endpoint URL
  getActiveEndpoint() {
    return this.ENDPOINTS[this.ACTIVE_ENDPOINT];
  },
  
  // Get the currently active endpoint type (name)
  getActiveEndpointType() {
    return this.ACTIVE_ENDPOINT;
  },
  
  // Set the active endpoint by name
  setEndpoint(endpointName) {
    console.log(`[API Config] Setting endpoint to: ${endpointName}`);
    
    if (this.ENDPOINTS[endpointName]) {
      this.ACTIVE_ENDPOINT = endpointName;
      
      // Save to localStorage for persistence across sessions
      try {
        localStorage.setItem('metashrew_endpoint', endpointName);
        console.log(`[API Config] Saved endpoint ${endpointName} to localStorage`);
      } catch (error) {
        console.warn('[API Config] Failed to save endpoint to localStorage:', error);
      }
      
      // Dispatch an event to notify components of endpoint change
      try {
        const event = new CustomEvent('endpoint-changed', {
          detail: {
            type: endpointName,
            url: this.ENDPOINTS[endpointName]
          }
        });
        document.dispatchEvent(event);
        console.log(`[API Config] Dispatched endpoint-changed event: ${endpointName} (${this.ENDPOINTS[endpointName]})`);
      } catch (error) {
        console.error('[API Config] Error dispatching endpoint-changed event:', error);
      }
      
      return this.ENDPOINTS[endpointName];
    } else {
      console.warn(`[API Config] Invalid endpoint name: ${endpointName}`);
      return null;
    }
  },
  
  // Toggle between local and production
  toggleEndpoint() {
    const currentEndpoint = this.ACTIVE_ENDPOINT;
    const newEndpoint = currentEndpoint === 'PRODUCTION' ? 'LOCAL' : 'PRODUCTION';
    
    console.log(`[API Config] Toggling endpoint from ${currentEndpoint} to ${newEndpoint}`);
    return this.setEndpoint(newEndpoint);
  },
  
  // Initialize from localStorage if available
  initialize() {
    try {
      const savedEndpoint = localStorage.getItem('metashrew_endpoint');
      console.log(`[API Config] Retrieved saved endpoint from localStorage: ${savedEndpoint}`);
      
      if (savedEndpoint && this.ENDPOINTS[savedEndpoint]) {
        this.ACTIVE_ENDPOINT = savedEndpoint;
        console.log(`[API Config] Using saved endpoint: ${savedEndpoint}`);
      } else {
        console.log(`[API Config] Using default endpoint: ${this.ACTIVE_ENDPOINT}`);
      }
    } catch (error) {
      console.warn('[API Config] Error initializing from localStorage:', error);
    }
  }
};

// Initialize on script load
API_CONFIG.initialize();
