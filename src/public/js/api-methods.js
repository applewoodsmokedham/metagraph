/**
 * Shared functionality for API method pages
 */

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
  // Set active sidebar link
  setActiveSidebarLink();
  
  // Add event listeners to example tabs
  setupExampleTabs();
  
  // Set up form submission
  setupFormSubmission();
});

// Set active sidebar link based on current page
function setActiveSidebarLink() {
  const currentPath = window.location.pathname;
  const filename = currentPath.split('/').pop();
  
  const sidebarLinks = document.querySelectorAll('.sidebar a');
  sidebarLinks.forEach(link => {
    if (link.getAttribute('href').includes(filename)) {
      link.classList.add('active');
    }
  });
}

// Set up example tabs
function setupExampleTabs() {
  const tabs = document.querySelectorAll('.example-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Show corresponding content
      const contentId = tab.getAttribute('data-target');
      document.querySelectorAll('.example-content').forEach(content => {
        content.style.display = 'none';
      });
      document.getElementById(contentId).style.display = 'block';
    });
  });
  
  // Activate first tab by default
  if (tabs.length > 0) {
    tabs[0].click();
  }
}

// Set up form submission for API testing
function setupFormSubmission() {
  const form = document.querySelector('.api-test-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading spinner
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = '<div class="loading-spinner"></div>';
    
    // Get method and parameters
    const methodName = document.getElementById('method-name').value;
    let params = [];
    
    try {
      // Try to parse params as JSON if available
      const paramsElement = document.getElementById('method-params');
      if (paramsElement && paramsElement.value.trim()) {
        params = JSON.parse(paramsElement.value);
      }
    } catch (error) {
      resultsContainer.innerHTML = `
        <div class="result-header">
          <h3><span class="status-indicator status-error"></span> Error</h3>
        </div>
        <div class="error-message">Parameter parsing error: ${error.message}</div>
        <details class="raw-response">
          <summary>Raw Error Details</summary>
          <div class="details-content">
            <div class="code-block">${error.stack || 'No stack trace available'}</div>
          </div>
        </details>
      `;
      return;
    }
    
    // Build the request payload
    const payload = {
      method: methodName,
      params: params,
      id: 0,
      jsonrpc: '2.0'
    };
    
    try {
      // Send the request to our server proxy
      const response = await fetch('/api/rpc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      // Check if response is okay first
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}`, { cause: { responseText: errorText } });
      }
      
      // Try to parse the response as JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // Handle non-JSON responses
        const responseText = await response.text();
        throw new Error('Invalid JSON response from API', { cause: { responseText } });
      }
      
      // Format the response
      const isSuccess = !data.error;
      
      if (isSuccess) {
        resultsContainer.innerHTML = `
          <div class="result-header">
            <h3><span class="status-indicator status-success"></span> Success</h3>
          </div>
          
          <h4>Formatted Result:</h4>
          <div class="code-block">${formatResult(data.result)}</div>
          
          <details class="raw-response">
            <summary>Raw Response</summary>
            <div class="details-content">
              <div class="code-block">${JSON.stringify(data, null, 2)}</div>
            </div>
          </details>
        `;
      } else {
        resultsContainer.innerHTML = `
          <div class="result-header">
            <h3><span class="status-indicator status-error"></span> Error</h3>
          </div>
          <div class="error-message">${data.error.message || 'Unknown error'}</div>
          
          <details class="raw-response">
            <summary>Raw Error Response</summary>
            <div class="details-content">
              <div class="code-block">${JSON.stringify(data.error, null, 2)}</div>
            </div>
          </details>
          
          <div class="error-tips">
            <p>Troubleshooting tips:</p>
            <ul>
              <li>Check parameter formats and values</li>
              <li>Verify addresses use the correct format (preferably taproot addresses starting with bc1p...)</li>
              <li>If using a block tag other than "latest", ensure it's a valid block height</li>
              <li>The API may be experiencing issues - try again later</li>
            </ul>
          </div>
        `;
      }
    } catch (error) {
      // Get error details if available
      let errorDetails = '';
      if (error.cause && error.cause.responseText) {
        errorDetails = error.cause.responseText;
      }
      
      resultsContainer.innerHTML = `
        <div class="result-header">
          <h3><span class="status-indicator status-error"></span> Error</h3>
        </div>
        <div class="error-message">${error.message}</div>
        
        <details class="raw-response">
          <summary>Raw Error Response</summary>
          <div class="details-content">
            <div class="code-block">${errorDetails || 'No additional error details available'}</div>
          </div>
        </details>
        
        <div class="error-tips">
          <p>Troubleshooting tips:</p>
          <ul>
            <li>Check your internet connection</li>
            <li>Verify the API endpoint is accessible</li>
            <li>Check parameter formats and values</li>
            <li>The API may be experiencing issues - try again later</li>
          </ul>
        </div>
      `;
    }
  });
}

// Format result for display
function formatResult(result) {
  if (result === null) return 'null';
  if (result === undefined) return 'undefined';
  
  try {
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    }
    return String(result);
  } catch (error) {
    return `Error formatting result: ${error.message}`;
  }
}
