/**
 * Runestone Visualizer - Main JavaScript
 * Handles UI interactions and API calls
 */

// Initialize WebGL visualizer
let webglVisualizer = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the WebGL visualizer
  webglVisualizer = new RunestoneWebGLVisualizer('webgl-container');
  
  // Setup event listeners
  setupEventListeners();
  
  // Check sync status on load
  checkSyncStatus();
  
  // Load the latest block by default
  document.getElementById('latest-block').click();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      
      // Add active class to clicked button and corresponding pane
      button.classList.add('active');
      const tabId = `${button.dataset.tab}-tab`;
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // Latest block button
  document.getElementById('latest-block').addEventListener('click', fetchLatestBlock);
  
  // Fetch specific block button
  document.getElementById('fetch-block').addEventListener('click', () => {
    const heightInput = document.getElementById('block-height');
    const height = parseInt(heightInput.value);
    
    if (isNaN(height) || height < 0) {
      alert('Please enter a valid block height');
      return;
    }
    
    fetchBlockByHeight(height);
  });
  
  // Fetch range of blocks button
  document.getElementById('fetch-range').addEventListener('click', fetchBlockRange);
}

/**
 * Check the sync status of the Metashrew API
 */
async function checkSyncStatus() {
  try {
    const response = await fetch('/api/sync-status');
    const data = await response.json();
    
    const indicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    if (data.error) {
      indicator.className = 'status-indicator error';
      statusText.textContent = 'Error connecting to API';
      return;
    }
    
    if (data.isSynced) {
      indicator.className = 'status-indicator synced';
      statusText.textContent = `Synced at block ${data.indexerHeight}`;
    } else {
      indicator.className = 'status-indicator';
      statusText.textContent = `Syncing: ${data.syncPercentage} (${data.blocksRemaining} blocks remaining)`;
    }
  } catch (error) {
    console.error('Error checking sync status:', error);
    const indicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    indicator.className = 'status-indicator error';
    statusText.textContent = 'Error connecting to API';
  }
}

/**
 * Fetch the latest block data
 */
async function fetchLatestBlock() {
  try {
    showLoading('Fetching latest block...');
    
    const response = await fetch('/api/latest-block');
    const data = await response.json();
    
    if (data.error) {
      showError(data.error);
      return;
    }
    
    // Update UI with the block data
    updateBlockInfo(data);
    displayRunestones(data.runestones);
    
    // Update visualizations
    updateVisualizations(data.runestones);
    
    // Update the block height input with the current height
    document.getElementById('block-height').value = data.blockHeight;
  } catch (error) {
    console.error('Error fetching latest block:', error);
    showError('Failed to fetch latest block');
  }
}

/**
 * Fetch a block by its height
 * @param {number} height The block height
 */
async function fetchBlockByHeight(height) {
  try {
    showLoading(`Fetching block ${height}...`);
    
    const response = await fetch(`/api/block/${height}`);
    const data = await response.json();
    
    if (data.error) {
      showError(data.error);
      return;
    }
    
    // Update UI with the block data
    updateBlockInfo(data);
    displayRunestones(data.runestones);
    
    // Update visualizations
    updateVisualizations(data.runestones);
  } catch (error) {
    console.error(`Error fetching block ${height}:`, error);
    showError(`Failed to fetch block ${height}`);
  }
}

/**
 * Fetch a range of blocks
 */
async function fetchBlockRange() {
  try {
    const heightInput = document.getElementById('block-height');
    let height = parseInt(heightInput.value);
    
    if (isNaN(height) || height < 0) {
      // If no height is specified, first get the latest block
      const latestResponse = await fetch('/api/latest-block');
      const latestData = await latestResponse.json();
      
      if (latestData.error) {
        showError(latestData.error);
        return;
      }
      
      height = latestData.blockHeight;
      heightInput.value = height;
    }
    
    showLoading(`Fetching blocks ${height} to ${height - 9}...`);
    
    const response = await fetch(`/api/blocks/${height}/10`);
    const data = await response.json();
    
    if (data.error) {
      showError(data.error);
      return;
    }
    
    // Update UI with the block range data
    updateBlockRangeInfo(data);
    displayRunestones(data.runestones);
    
    // Update visualizations with summary data
    updateSummaryVisualizations(data);
  } catch (error) {
    console.error('Error fetching block range:', error);
    showError('Failed to fetch block range');
  }
}

/**
 * Update the block information section
 * @param {Object} data Block data
 */
function updateBlockInfo(data) {
  const blockDetails = document.getElementById('block-details');
  
  const date = new Date(data.blockTime * 1000).toLocaleString();
  
  blockDetails.innerHTML = `
    <p><strong>Height:</strong> ${data.blockHeight}</p>
    <p><strong>Hash:</strong> ${data.blockHash}</p>
    <p><strong>Time:</strong> ${date}</p>
    <p><strong>Runestones:</strong> ${data.runestoneCount}</p>
  `;
  
  // Update raw data view
  const rawData = document.getElementById('raw-data');
  rawData.textContent = JSON.stringify(data, null, 2);
}

/**
 * Update block information for a range of blocks
 * @param {Object} data Block range data
 */
function updateBlockRangeInfo(data) {
  const blockDetails = document.getElementById('block-details');
  
  blockDetails.innerHTML = `
    <p><strong>Block Range:</strong> ${data.startBlock} to ${data.endBlock}</p>
    <p><strong>Total Blocks:</strong> ${data.blockCount}</p>
    <p><strong>Total Runestones:</strong> ${data.runestoneCount}</p>
  `;
  
  if (data.summary.protocolCounts) {
    blockDetails.innerHTML += '<p><strong>Protocol Distribution:</strong></p>';
    blockDetails.innerHTML += '<ul>';
    
    for (const [protocol, count] of Object.entries(data.summary.protocolCounts)) {
      blockDetails.innerHTML += `<li>${protocol}: ${count}</li>`;
    }
    
    blockDetails.innerHTML += '</ul>';
  }
  
  // Update raw data view
  const rawData = document.getElementById('raw-data');
  rawData.textContent = JSON.stringify(data, null, 2);
}

/**
 * Display the list of runestones
 * @param {Array} runestones Array of runestone data
 */
function displayRunestones(runestones) {
  const runestonesContainer = document.getElementById('runestone-items');
  
  if (!runestones || runestones.length === 0) {
    runestonesContainer.innerHTML = '<p>No runestones or OP_RETURN outputs found in this block</p>';
    return;
  }
  
  let html = '';
  
  for (const runestone of runestones) {
    // Extract protocol information - be more flexible to handle different data formats
    const protocolName = getProtocolName(runestone);
    const protocolTag = getProtocolTag(runestone);
    const protocolValues = getProtocolValues(runestone);
    const rawScriptPubKey = runestone.scriptPubKey || runestone.hex || 'N/A';
    const asciiRepresentation = runestone.ascii || 'N/A';
    
    html += `
      <div class="runestone-card" data-txid="${runestone.txid}" data-vout="${runestone.vout}">
        <h3>Txid: ${truncate(runestone.txid, 20)}</h3>
        <p><strong>Block:</strong> ${runestone.blockHeight}</p>
        <p><strong>Protocol:</strong> ${protocolName}</p>
        <p><strong>Tag:</strong> ${protocolTag}</p>
        <p><strong>Values:</strong> ${truncate(protocolValues, 30)}</p>
        <div class="op-return-data">
          <p><strong>OP_RETURN hex:</strong> ${truncate(rawScriptPubKey, 20)} <span class="toggle-data">[Show more]</span></p>
          <div class="full-data hidden">
            <p><strong>Full hex:</strong> ${rawScriptPubKey}</p>
            <p><strong>ASCII:</strong> ${asciiRepresentation}</p>
          </div>
        </div>
        <div>
          <span class="tag">Vout: ${runestone.vout}</span>
          <span class="tag ${getProtocolClass(protocolName)}">${protocolName}</span>
        </div>
      </div>
    `;
  }
  
  runestonesContainer.innerHTML = html;
  
  // Add click event listeners to the cards
  const cards = document.querySelectorAll('.runestone-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const txid = card.dataset.txid;
      const vout = card.dataset.vout;
      
      // Find the runestone in the current data
      const runestone = runestones.find(r => r.txid === txid && r.vout === parseInt(vout));
      
      if (runestone) {
        // Update visualizations for this specific runestone
        updateVisualizationsForRunestone(runestone);
        
        // Update raw data view
        const rawData = document.getElementById('raw-data');
        rawData.textContent = JSON.stringify(runestone, null, 2);
        
        // Switch to the raw data tab
        document.querySelector('.tab-btn[data-tab="raw"]').click();
      }
    });
  });
  
  // Add toggle listeners for OP_RETURN data
  document.querySelectorAll('.toggle-data').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const fullData = e.target.closest('.op-return-data').querySelector('.full-data');
      fullData.classList.toggle('hidden');
      e.target.textContent = fullData.classList.contains('hidden') ? '[Show more]' : '[Hide]';
    });
  });
}

/**
 * Extract protocol name from runestone data
 * @param {Object} runestone Runestone data
 * @returns {string} Protocol name
 */
function getProtocolName(runestone) {
  // Check for proper Diesel pattern
  if (runestone.data?.protocolName) {
    return runestone.data.protocolName;
  }
  
  // Check for recognized protocol tags in protostones
  if (runestone.data?.protostones && runestone.data.protostones.length > 0) {
    // Check for known protocol tags
    for (const stone of runestone.data.protostones) {
      if (stone.tag === "0x43" && stone.values && stone.values.join('') === "79,82,69") {
        return "CORE";
      }
      if (stone.tag === "0x45" && stone.values && stone.values.join(',').includes("88,83,65,84")) {
        return "EXSAT";
      }
      if (stone.tag === "0x10aa") {
        return "Bitcoin Witness";
      }
    }
    
    // If we found protostones but no recognized protocol, use the first tag
    return `Protocol Tag: ${runestone.data.protostones[0].tag}`;
  }
  
  // Look for Diesel data
  if (runestone.asm && runestone.asm.includes('OP_RETURN')) {
    return "OP_RETURN";
  }
  
  return "Unknown";
}

/**
 * Extract protocol tag from runestone data
 * @param {Object} runestone Runestone data
 * @returns {string} Protocol tag
 */
function getProtocolTag(runestone) {
  if (runestone.data?.protocolField?.tag) {
    return runestone.data.protocolField.tag;
  }
  
  if (runestone.data?.protostones && runestone.data.protostones.length > 0) {
    return runestone.data.protostones.map(stone => stone.tag).join(', ');
  }
  
  return 'N/A';
}

/**
 * Extract protocol values from runestone data
 * @param {Object} runestone Runestone data
 * @returns {string} Protocol values
 */
function getProtocolValues(runestone) {
  if (runestone.data?.protocolField?.values) {
    return runestone.data.protocolField.values.join(', ');
  }
  
  if (runestone.data?.protostones && runestone.data.protostones.length > 0) {
    return runestone.data.protostones
      .map(stone => `${stone.tag}: [${stone.values ? stone.values.join(', ') : ''}]`)
      .join('; ');
  }
  
  return 'None';
}

/**
 * Get CSS class based on protocol name
 * @param {string} protocolName Protocol name
 * @returns {string} CSS class
 */
function getProtocolClass(protocolName) {
  const protocolMap = {
    'Diesel': 'diesel-tag',
    'CORE': 'core-tag',
    'EXSAT': 'exsat-tag',
    'Bitcoin Witness': 'witness-tag',
    'OP_RETURN': 'opreturn-tag',
    'Unknown': 'unknown-tag'
  };
  
  return protocolMap[protocolName] || 'unknown-tag';
}

/**
 * Update visualizations for runestones
 * @param {Array} runestones Array of runestone data
 */
function updateVisualizations(runestones) {
  if (!runestones || runestones.length === 0) {
    document.getElementById('canvas-container').innerHTML = '<p>No data to visualize</p>';
    if (webglVisualizer) {
      webglVisualizer.clearScene();
    }
    return;
  }
  
  // Update Canvas visualization
  if (runestones.length === 1) {
    // Single runestone view
    updateCanvasForRunestone(runestones[0]);
    
    // Update WebGL visualization for a single runestone
    if (webglVisualizer) {
      webglVisualizer.visualizeSingle(runestones[0]);
    }
  } else {
    // Multiple runestones view
    const height = runestones[0].blockHeight;
    
    // Canvas visualization
    const canvasContainer = document.getElementById('canvas-container');
    canvasContainer.innerHTML = `<img src="/api/visualize-block/${height}" alt="Block visualization">`;
    
    // WebGL visualization
    if (webglVisualizer) {
      webglVisualizer.visualizeSummary(runestones);
    }
  }
}

/**
 * Update visualizations for a summary of blocks
 * @param {Object} data Block range data
 */
function updateSummaryVisualizations(data) {
  if (!data.runestones || data.runestones.length === 0) {
    document.getElementById('canvas-container').innerHTML = '<p>No data to visualize</p>';
    if (webglVisualizer) {
      webglVisualizer.clearScene();
    }
    return;
  }
  
  // Create a URL for the canvas visualization of the most recent block with runestones
  const latestBlockWithRunestones = Math.max(...data.summary.blockHeights);
  
  // Canvas visualization
  const canvasContainer = document.getElementById('canvas-container');
  canvasContainer.innerHTML = `<img src="/api/visualize-block/${latestBlockWithRunestones}" alt="Block visualization">`;
  
  // WebGL visualization
  if (webglVisualizer) {
    webglVisualizer.visualizeSummary(data.runestones);
  }
}

/**
 * Update visualizations for a specific runestone
 * @param {Object} runestone Runestone data
 */
function updateVisualizationsForRunestone(runestone) {
  // Update Canvas visualization
  updateCanvasForRunestone(runestone);
  
  // Update WebGL visualization
  if (webglVisualizer) {
    webglVisualizer.visualizeSingle(runestone);
  }
}

/**
 * Update Canvas visualization for a specific runestone
 * @param {Object} runestone Runestone data
 */
function updateCanvasForRunestone(runestone) {
  const canvasContainer = document.getElementById('canvas-container');
  canvasContainer.innerHTML = `<img src="/api/visualize/${runestone.txid}/${runestone.vout}" alt="Runestone visualization">`;
}

/**
 * Show a loading message in the raw data area
 * @param {string} message Loading message
 */
function showLoading(message) {
  const rawData = document.getElementById('raw-data');
  rawData.textContent = message;
}

/**
 * Show an error message in the raw data area
 * @param {string} message Error message
 */
function showError(message) {
  const rawData = document.getElementById('raw-data');
  rawData.textContent = `Error: ${message}`;
}

/**
 * Truncate a string if it's too long
 * @param {string} str String to truncate
 * @param {number} length Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, length) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}
