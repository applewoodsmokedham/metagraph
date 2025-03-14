/**
 * Endpoint Toggle Component
 * Creates a consistent UI component for toggling between local and production endpoints
 * Can be added to any page with a simple one-line include
 */

class EndpointToggleComponent {
  constructor(config = {}) {
    this.containerId = config.containerId || 'endpoint-toggle-container';
    this.onEndpointChange = config.onEndpointChange || null;
    
    // Create toggle element if it doesn't exist
    this.createToggleElement();
    
    // Initial UI update
    this.updateUI();
    
    // Listen for endpoint changes from other sources
    document.addEventListener('endpoint-changed', () => {
      this.updateUI();
    });
    
    console.log('[Endpoint Toggle] Component initialized');
  }
  
  /**
   * Create the toggle UI element
   * Will append to containerId if specified, otherwise to body
   */
  createToggleElement() {
    // Check if container exists
    let container = document.getElementById(this.containerId);
    
    // Create container if it doesn't exist
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'endpoint-toggle-container';
      document.body.appendChild(container);
    }
    
    // Set container styles
    Object.assign(container.style, {
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: '1000',
      backgroundColor: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontSize: '14px'
    });
    
    // Create the HTML content
    container.innerHTML = `
      <div class="endpoint-indicator" style="display: flex; align-items: center; margin-bottom: 5px; font-weight: bold;">
        <span class="status-circle" style="width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></span>
        <span>Endpoint: <span id="endpoint-type-display">LOADING</span></span>
      </div>
      <div class="endpoint-sync" style="margin-bottom: 5px; font-size: 12px;">
        Height: <span id="sync-height-display">-</span> / <span id="node-height-display">-</span>
      </div>
      <div style="display: flex; gap: 5px;">
        <button id="toggle-endpoint-btn" style="padding: 5px; border-radius: 4px; border: none; cursor: pointer; background-color: #f0f0f0; flex-grow: 1;">
          Switch Endpoint
        </button>
        <button id="refresh-status-btn" style="padding: 5px; border-radius: 4px; border: none; cursor: pointer; background-color: #e0e0e0; width: 26px;">
          ↻
        </button>
      </div>
    `;
    
    // Add event listener to the toggle button
    document.getElementById('toggle-endpoint-btn').addEventListener('click', () => {
      this.toggleEndpoint();
    });
    
    // Add event listener to the refresh button
    document.getElementById('refresh-status-btn').addEventListener('click', () => {
      this.checkSyncStatus();
    });
  }
  
  /**
   * Toggle between local and production endpoints
   */
  toggleEndpoint() {
    console.log('[Endpoint Toggle] Toggling endpoint');
    
    // Update the endpoint using the API_CONFIG
    const newEndpoint = API_CONFIG.toggleEndpoint();
    console.log('[Endpoint Toggle] New endpoint:', newEndpoint);
    
    // Update UI to reflect the change
    this.updateUI();
    
    // Dispatch a custom event to notify other components of the endpoint change
    const event = new CustomEvent('endpoint-changed', {
      detail: {
        type: API_CONFIG.getActiveEndpointType(),
        endpoint: newEndpoint
      }
    });
    document.dispatchEvent(event);
    console.log('[Endpoint Toggle] Dispatched endpoint-changed event');
    
    // Try to check sync status after a short delay
    setTimeout(() => {
      this.checkSyncStatus();
    }, 500);
    
    // Call onEndpointChange callback if provided
    if (typeof this.onEndpointChange === 'function') {
      this.onEndpointChange(API_CONFIG.getActiveEndpointType(), newEndpoint);
    }
  }
  
  /**
   * Update the UI to reflect the current endpoint
   */
  updateUI() {
    const endpointType = API_CONFIG.getActiveEndpointType();
    const endpointTypeDisplay = document.getElementById('endpoint-type-display');
    const statusCircle = document.querySelector('.status-circle');
    const container = document.getElementById(this.containerId);
    
    if (endpointTypeDisplay) {
      endpointTypeDisplay.textContent = endpointType;
    }
    
    if (statusCircle && container) {
      if (endpointType === 'LOCAL') {
        statusCircle.style.backgroundColor = '#4caf50'; // Green for local
        container.style.borderLeft = '4px solid #4caf50';
      } else {
        statusCircle.style.backgroundColor = '#ff9800'; // Orange for production
        container.style.borderLeft = '4px solid #ff9800';
      }
    }
    
    // Check sync status
    this.checkSyncStatus();
  }
  
  /**
   * Check the sync status of the current endpoint
   */
  async checkSyncStatus() {
    try {
      const syncHeightDisplay = document.getElementById('sync-height-display');
      const nodeHeightDisplay = document.getElementById('node-height-display');
      
      if (!syncHeightDisplay || !nodeHeightDisplay) return;
      
      // Show loading state
      syncHeightDisplay.textContent = '...';
      nodeHeightDisplay.textContent = '...';
      
      // Create a fresh API client to ensure we're using the latest endpoint settings
      const client = new MetashrewApiClient();
      
      // Get sync status using the fresh client
      const syncStatus = await client.checkSync();
      
      // Update displays
      syncHeightDisplay.textContent = syncStatus.height.toLocaleString();
      nodeHeightDisplay.textContent = syncStatus.nodeHeight.toLocaleString();
      
      // Set appropriate status colors based on sync state
      const statusCircle = document.querySelector('.status-circle');
      if (statusCircle) {
        if (syncStatus.syncPercentage >= 99.5) {
          // Fully synced or nearly synced
          statusCircle.style.backgroundColor = '#4caf50'; // Green
        } else if (syncStatus.syncPercentage >= 90) {
          // Partially synced
          statusCircle.style.backgroundColor = '#ff9800'; // Orange
        } else {
          // Poorly synced
          statusCircle.style.backgroundColor = '#f44336'; // Red
        }
      }
      
      console.log('[Endpoint Toggle] Sync status updated:', syncStatus);
      
      return syncStatus;
    } catch (error) {
      console.error('[Endpoint Toggle] Error checking sync status:', error);
      
      const syncHeightDisplay = document.getElementById('sync-height-display');
      const nodeHeightDisplay = document.getElementById('node-height-display');
      
      if (syncHeightDisplay) syncHeightDisplay.textContent = 'ERROR';
      if (nodeHeightDisplay) nodeHeightDisplay.textContent = 'ERROR';
      
      const statusCircle = document.querySelector('.status-circle');
      if (statusCircle) {
        statusCircle.style.backgroundColor = '#f44336'; // Red for error
      }
    }
  }
}

// Create a global instance when the script is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.endpointToggle = new EndpointToggleComponent();
});
