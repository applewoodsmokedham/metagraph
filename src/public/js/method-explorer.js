/**
 * Method Explorer Component
 * A reusable component for exploring and testing Metashrew API methods
 */
class MethodExplorer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`[Method Explorer] Container with ID ${containerId} not found`);
      return;
    }
    
    this.options = {
      showCategories: true,
      categoriesFilter: [],
      methodsFilter: [],
      endpointTypeFilter: 'COMMON',
      onMethodSelect: null,
      showTesting: true,
      ...options
    };
    
    this.selectedMethod = null;
    this.methodInput = {};
    
    // Create the UI
    this.createUI();
    
    // Listen for method detection updates
    document.addEventListener('methods-detected', (event) => {
      console.log('[Method Explorer] Methods detected event:', event.detail);
      this.updateMethodsList();
    });
    
    // Listen for endpoint changes
    document.addEventListener('endpoint-changed', (event) => {
      console.log('[Method Explorer] Endpoint changed event:', event.detail);
      this.updateEndpointDisplay(event.detail.type);
      // Methods will be updated via the methods-detected event
    });
    
    // Initial update
    this.updateEndpointDisplay(API_CONFIG.getActiveEndpointType());
    this.updateMethodsList();
  }
  
  /**
   * Create the UI components
   */
  createUI() {
    this.container.innerHTML = `
      <div class="method-explorer">
        <div class="explorer-header">
          <h3>Metashrew API Explorer</h3>
          <div class="endpoint-info">
            <span>Endpoint: <span id="explorer-endpoint-type">Loading...</span></span>
          </div>
        </div>
        
        <div class="explorer-body">
          <div class="methods-panel">
            <div class="methods-filter">
              <select id="category-filter" class="category-filter">
                <option value="all">All Categories</option>
              </select>
            </div>
            <div id="methods-list" class="methods-list">Loading methods...</div>
          </div>
          
          <div class="method-details">
            <div id="method-info" class="method-info">
              <p>Select a method to see details</p>
            </div>
            
            ${this.options.showTesting ? `
              <div class="method-testing">
                <h4>Test Method</h4>
                <div id="method-params" class="method-params"></div>
                <div class="testing-controls">
                  <button id="test-method" class="test-button">Execute</button>
                </div>
                <div id="test-result" class="test-result"></div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    if (this.options.showCategories) {
      const categoryFilter = document.getElementById('category-filter');
      categoryFilter.addEventListener('change', (e) => {
        this.updateMethodsList(e.target.value);
      });
    }
    
    if (this.options.showTesting) {
      const testButton = document.getElementById('test-method');
      testButton.addEventListener('click', () => {
        this.testSelectedMethod();
      });
    }
  }
  
  /**
   * Update the methods list based on selected filters
   * @param {string} categoryFilter - Selected category filter
   */
  updateMethodsList(categoryFilter = 'all') {
    const methodsList = document.getElementById('methods-list');
    const categorySelect = document.getElementById('category-filter');
    
    // Get methods data
    let methods = [];
    let categories = methodDiscovery.getMethodCategories();
    
    // Apply filters
    if (this.options.endpointTypeFilter) {
      methods = methodDiscovery.getAvailableMethods(this.options.endpointTypeFilter);
    } else {
      methods = methodDiscovery.getAvailableMethods('COMMON');
    }
    
    // Update categories dropdown
    if (this.options.showCategories) {
      // Save the current selection
      const currentSelection = categorySelect.value;
      
      // Clear existing options except the 'All' option
      while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
      }
      
      // Add categories
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = this.formatCategoryName(category);
        categorySelect.appendChild(option);
      });
      
      // Restore selection if possible
      if (currentSelection && Array.from(categorySelect.options).some(opt => opt.value === currentSelection)) {
        categorySelect.value = currentSelection;
      }
    }
    
    // Filter by category if specified
    if (categoryFilter && categoryFilter !== 'all') {
      methods = methods.filter(method => {
        const doc = methodDiscovery.getMethodDocs(method);
        return doc.category === categoryFilter;
      });
    }
    
    // Filter by explicit method list if provided
    if (this.options.methodsFilter && this.options.methodsFilter.length > 0) {
      methods = methods.filter(method => this.options.methodsFilter.includes(method));
    }
    
    // Build the methods list HTML
    if (methods.length === 0) {
      methodsList.innerHTML = '<p class="no-methods">No methods available for this endpoint or category</p>';
      return;
    }
    
    // Group methods by category
    const methodsByCategory = {};
    methods.forEach(method => {
      const doc = methodDiscovery.getMethodDocs(method);
      const category = doc.category || 'unknown';
      
      if (!methodsByCategory[category]) {
        methodsByCategory[category] = [];
      }
      methodsByCategory[category].push({
        name: method,
        doc
      });
    });
    
    // Build the HTML
    let html = '';
    
    // If not showing categories dropdown but still want to group visually
    if (!this.options.showCategories || categoryFilter === 'all') {
      Object.keys(methodsByCategory).forEach(category => {
        html += `<div class="method-category">
          <h4>${this.formatCategoryName(category)}</h4>
          <ul>`;
          
        methodsByCategory[category].forEach(method => {
          html += `<li class="method-item" data-method="${method.name}">
            ${method.name}
          </li>`;
        });
        
        html += `</ul>
        </div>`;
      });
    } else {
      // Just show the methods for the selected category
      html += '<ul>';
      methods.forEach(method => {
        html += `<li class="method-item" data-method="${method}">
          ${method}
        </li>`;
      });
      html += '</ul>';
    }
    
    methodsList.innerHTML = html;
    
    // Add click event listeners to method items
    const methodItems = methodsList.querySelectorAll('.method-item');
    methodItems.forEach(item => {
      item.addEventListener('click', () => {
        // Remove selected class from all items
        methodItems.forEach(i => i.classList.remove('selected'));
        
        // Add selected class to clicked item
        item.classList.add('selected');
        
        // Show method details
        this.showMethodDetails(item.dataset.method);
      });
    });
  }
  
  /**
   * Format a category name for display
   * @param {string} category - Raw category name
   * @returns {string} - Formatted category name
   */
  formatCategoryName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
  
  /**
   * Show details for a selected method
   * @param {string} methodName - Method name
   */
  showMethodDetails(methodName) {
    const methodInfo = document.getElementById('method-info');
    const methodParams = document.getElementById('method-params');
    const testResult = document.getElementById('test-result');
    
    if (!methodName) {
      methodInfo.innerHTML = '<p>Select a method to see details</p>';
      if (methodParams) methodParams.innerHTML = '';
      if (testResult) testResult.innerHTML = '';
      this.selectedMethod = null;
      return;
    }
    
    // Get method documentation
    const doc = methodDiscovery.getMethodDocs(methodName);
    this.selectedMethod = methodName;
    
    // Build method info HTML
    let methodInfoHtml = `
      <h3>${methodName}</h3>
      <p class="method-description">${doc.description}</p>
      
      <div class="method-signature">
        <h4>Parameters</h4>
        ${Array.isArray(doc.params) && doc.params.length > 0 
          ? `<ul>${doc.params.map(param => `<li>${param}</li>`).join('')}</ul>`
          : '<p>No parameters</p>'
        }
        
        <h4>Returns</h4>
        <p>${doc.returns}</p>
      </div>
      
      <div class="method-example">
        <h4>Example Request</h4>
        <pre><code>${this.formatJson(doc.example)}</code></pre>
        
        <h4>Example Response</h4>
        <pre><code>${this.formatJson(doc.result)}</code></pre>
      </div>
    `;
    
    methodInfo.innerHTML = methodInfoHtml;
    
    // Build parameters form if testing is enabled
    if (this.options.showTesting && methodParams) {
      this.buildParametersForm(methodName, doc);
    }
    
    // Clear previous test results
    if (testResult) {
      testResult.innerHTML = '';
    }
    
    // Call optional callback
    if (typeof this.options.onMethodSelect === 'function') {
      this.options.onMethodSelect(methodName, doc);
    }
  }
  
  /**
   * Build form for parameter input
   * @param {string} methodName - Method name
   * @param {Object} doc - Method documentation
   */
  buildParametersForm(methodName, doc) {
    const methodParams = document.getElementById('method-params');
    this.methodInput = {}; // Reset input storage
    
    // Handle Alkanes view methods differently
    if (methodName.startsWith('metashrew_view(') && methodName.endsWith(')')) {
      const viewMethod = methodName.slice(14, -1);
      
      methodParams.innerHTML = `
        <div class="param-group">
          <label>View Method Name:</label>
          <input type="text" id="param-view-method" value="${viewMethod}" readonly>
        </div>
        <div class="param-group">
          <label>Hex Input:</label>
          <textarea id="param-hex-input" placeholder="Enter hex encoded input"></textarea>
        </div>
        <div class="param-group">
          <label>Block Tag:</label>
          <input type="text" id="param-block-tag" value="latest">
        </div>
      `;
      
      // Store reference to inputs
      this.methodInput = {
        viewMethod: document.getElementById('param-view-method'),
        hexInput: document.getElementById('param-hex-input'),
        blockTag: document.getElementById('param-block-tag')
      };
      
      return;
    }
    
    // Standard methods
    if (!Array.isArray(doc.params) || doc.params.length === 0) {
      methodParams.innerHTML = '<p>This method does not require any parameters</p>';
      return;
    }
    
    // Build form for parameters
    let html = '';
    
    doc.params.forEach((param, index) => {
      // Extract parameter name without type info
      const paramName = param.split(' - ')[0];
      const inputId = `param-${index}`;
      
      html += `
        <div class="param-group">
          <label for="${inputId}">${paramName}:</label>
          <input type="text" id="${inputId}" placeholder="Enter ${paramName}">
        </div>
      `;
    });
    
    methodParams.innerHTML = html;
    
    // Store references to inputs
    const inputs = methodParams.querySelectorAll('input');
    inputs.forEach((input, index) => {
      this.methodInput[index] = input;
    });
  }
  
  /**
   * Execute the selected method with provided parameters
   */
  async testSelectedMethod() {
    if (!this.selectedMethod) {
      return;
    }
    
    const testResult = document.getElementById('test-result');
    testResult.innerHTML = '<p>Executing method...</p>';
    
    try {
      const apiClient = new MetashrewApiClient();
      let result;
      
      // Handle Alkanes view methods differently
      if (this.selectedMethod.startsWith('metashrew_view(') && this.selectedMethod.endsWith(')')) {
        const viewMethod = this.methodInput.viewMethod.value;
        const hexInput = this.methodInput.hexInput.value || '';
        const blockTag = this.methodInput.blockTag.value || 'latest';
        
        result = await apiClient.call('metashrew_view', [viewMethod, hexInput, blockTag]);
      } else {
        // Build parameters array
        const params = [];
        for (let i = 0; i < Object.keys(this.methodInput).length; i++) {
          if (this.methodInput[i]) {
            const value = this.methodInput[i].value;
            
            // Try to parse as JSON if it looks like JSON
            try {
              if (value && (value.startsWith('{') || value.startsWith('[')) && 
                  (value.endsWith('}') || value.endsWith(']'))) {
                params.push(JSON.parse(value));
              } else {
                params.push(value);
              }
            } catch (e) {
              params.push(value); // Use as-is if JSON parsing fails
            }
          }
        }
        
        result = await apiClient.call(this.selectedMethod, params);
      }
      
      testResult.innerHTML = `
        <h4>Result</h4>
        <pre class="result-json"><code>${this.formatJson(JSON.stringify(result))}</code></pre>
      `;
    } catch (error) {
      testResult.innerHTML = `
        <h4>Error</h4>
        <pre class="result-error"><code>${error.message}</code></pre>
      `;
      console.error('[Method Explorer] Test execution failed:', error);
    }
  }
  
  /**
   * Update the displayed endpoint type
   * @param {string} endpointType - Endpoint type name
   */
  updateEndpointDisplay(endpointType) {
    const endpointDisplay = document.getElementById('explorer-endpoint-type');
    if (endpointDisplay) {
      endpointDisplay.textContent = endpointType;
      endpointDisplay.className = endpointType.toLowerCase();
    }
  }
  
  /**
   * Format JSON string for display
   * @param {string} json - JSON string to format
   * @returns {string} - Formatted JSON string
   */
  formatJson(json) {
    try {
      const obj = typeof json === 'string' ? JSON.parse(json) : json;
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return json; // Return as-is if parsing fails
    }
  }
}
