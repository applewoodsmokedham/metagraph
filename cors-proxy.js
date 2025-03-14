/**
 * Simple CORS proxy for Metashrew API
 * Enables browser access to the local Metashrew instance
 */
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 8086;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Main proxy endpoint
app.post('/local', async (req, res) => {
  try {
    console.log('Proxying to local Metashrew:', req.body);
    
    // IMPORTANT: Preserve the exact order: method, params, id, jsonrpc
    const payload = {
      method: req.body.method,
      params: req.body.params,
      id: 0,
      jsonrpc: '2.0'
    };
    
    const response = await axios.post('http://localhost:8085', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Local Metashrew response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to local Metashrew:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({
      error: {
        message: error.message,
        details: error.response ? error.response.data : null
      }
    });
  }
});

// Production endpoint
app.post('/production', async (req, res) => {
  try {
    console.log('Proxying to production Metashrew:', req.body);
    
    // IMPORTANT: Preserve the exact order: method, params, id, jsonrpc
    const payload = {
      method: req.body.method,
      params: req.body.params,
      id: 0,
      jsonrpc: '2.0'
    };
    
    const response = await axios.post('https://mainnet.sandshrew.io/v2/lasereyes', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Production Metashrew response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to production Metashrew:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({
      error: {
        message: error.message,
        details: error.response ? error.response.data : null
      }
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static files
app.use(express.static('src/public'));

// Start the server
app.listen(PORT, () => {
  console.log(`CORS proxy running at http://localhost:${PORT}`);
  console.log(`Local Metashrew proxy: http://localhost:${PORT}/local`);
  console.log(`Production Metashrew proxy: http://localhost:${PORT}/production`);
  console.log(`Access RPC Tester at: http://localhost:${PORT}/alkanes-rpc-tester.html`);
});
