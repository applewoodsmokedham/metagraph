/**
 * Endpoint Switcher UI Component
 * Adds a floating control panel to switch between local and production API endpoints
 */
document.addEventListener('DOMContentLoaded', function() {
  // Create CSS for the endpoint switcher
  const style = document.createElement('style');
  style.textContent = `
    .endpoint-switcher {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      width: 240px;
    }
    .endpoint-switcher h4 {
      margin: 0 0 10px 0;
      font-size: 16px;
      font-weight: 600;
      color: #343a40;
    }
    .endpoint-switcher-option {
      display: flex;
      align-items: center;
      margin: 8px 0;
    }
    .endpoint-switcher-option label {
      margin-left: 8px;
      cursor: pointer;
    }
    .endpoint-status {
      margin-top: 12px;
      padding: 8px;
      border-radius: 4px;
      font-size: 13px;
      text-align: center;
    }
    .endpoint-status.connected {
      background-color: #d4edda;
      color: #155724;
    }
    .endpoint-status.error {
      background-color: #f8d7da;
      color: #721c24;
    }
    .endpoint-status.syncing {
      background-color: #fff3cd;
      color: #856404;
    }
    .endpoint-toggle {
      position: absolute;
      top: -30px;
      right: 0;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-bottom: none;
      border-radius: 4px 4px 0 0;
      padding: 4px 10px;
      font-size: 12px;
      cursor: pointer;
      color: #495057;
    }
    .endpoint-switcher.collapsed {
      height: 10px;
      padding: 0;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
  
  // Create the endpoint switcher UI
  const createEndpointSwitcher = () => {
    // Create container
    const container = document.createElement('div');
    container.className = 'endpoint-switcher';
    
    // Create toggle button
    const toggle = document.createElement('div');
    toggle.className = 'endpoint-toggle';
    toggle.textContent = 'API Settings';
    toggle.addEventListener('click', () => {
      container.classList.toggle('collapsed');
      localStorage.setItem('endpoint_switcher_collapsed', container.classList.contains('collapsed'));
    });
    container.appendChild(toggle);
    
    // Create heading
    const heading = document.createElement('h4');
    heading.textContent = 'Metashrew API Endpoint';
    container.appendChild(heading);
    
    // Create radio buttons
    const createRadio = (id, label, value) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'endpoint-switcher-option';
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.id = id;
      radio.name = 'endpoint';
      radio.value = value;
      radio.checked = API_CONFIG.ACTIVE_ENDPOINT === value;
      
      const labelEl = document.createElement('label');
      labelEl.htmlFor = id;
      labelEl.textContent = label;
      
      wrapper.appendChild(radio);
      wrapper.appendChild(labelEl);
      
      radio.addEventListener('change', () => {
        if (radio.checked) {
          API_CONFIG.setEndpoint(value);
          updateStatus();
        }
      });
      
      return wrapper;
    };
    
    // Add radio buttons
    container.appendChild(createRadio('endpoint-local', 'Local (localhost:8080)', 'LOCAL'));
    container.appendChild(createRadio('endpoint-prod', 'Production (mainnet)', 'PRODUCTION'));
    
    // Add status indicator
    const status = document.createElement('div');
    status.id = 'endpoint-status';
    status.className = 'endpoint-status';
    container.appendChild(status);
    
    // Add to body
    document.body.appendChild(container);
    
    // Check if switcher should be collapsed
    if (localStorage.getItem('endpoint_switcher_collapsed') === 'true') {
      container.classList.add('collapsed');
    }
    
    // Update status function
    const updateStatus = async () => {
      status.textContent = 'Connecting...';
      status.className = 'endpoint-status';
      
      try {
        const start = performance.now();
        const syncStatus = await apiClient.getSyncStatus();
        const elapsed = Math.round(performance.now() - start);
        
        if (syncStatus.error) {
          status.textContent = 'Connection Error';
          status.className = 'endpoint-status error';
          return;
        }
        
        if (syncStatus.synced) {
          status.textContent = `Connected: Height ${syncStatus.indexerHeight} (${elapsed}ms)`;
          status.className = 'endpoint-status connected';
        } else {
          status.textContent = `Syncing: ${syncStatus.syncPercentage}% (${syncStatus.blocksRemaining} blocks remaining)`;
          status.className = 'endpoint-status syncing';
        }
      } catch (error) {
        status.textContent = 'Connection Error';
        status.className = 'endpoint-status error';
      }
    };
    
    // Initial status update
    updateStatus();
    
    // Update status periodically
    setInterval(updateStatus, 10000);
    
    return { container, updateStatus };
  };
  
  // Create the switcher if API_CONFIG exists
  if (window.API_CONFIG) {
    const { updateStatus } = createEndpointSwitcher();
    
    // Listen for endpoint changes to update status
    document.addEventListener('endpoint-changed', () => {
      setTimeout(updateStatus, 500);
    });
  }
});
