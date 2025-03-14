/**
 * Simple proxy server to handle CORS issues with Metashrew API
 * Run with: node proxy-server.js
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = 3030;

// Enable CORS for all routes
app.use(cors());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// Proxy for local Metashrew instance
const localProxy = createProxyMiddleware({
  target: 'http://localhost:8080',  // Updated to match expected port
  changeOrigin: true,
  pathRewrite: {
    '^/api/local': '/' // Remove the /api/local prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Proxy response from local: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
});

// Proxy for production Metashrew instance
const productionProxy = createProxyMiddleware({
  target: 'https://mainnet.sandshrew.io',
  changeOrigin: true,
  pathRewrite: {
    '^/api/production': '/v2/lasereyes' // Map to the correct production endpoint
  },
  onProxyReq: (proxyReq, req, res) => {
    // Remove the X-Sandshrew-Project-ID header as it causes errors
    proxyReq.removeHeader('X-Sandshrew-Project-ID');
    
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Proxy response from production: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
});

// Parse JSON request bodies
app.use(express.json());

// Set up proxy routes
app.use('/api/local', localProxy);
app.use('/api/production', productionProxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log(`Local Metashrew proxy: http://localhost:${PORT}/api/local`);
  console.log(`Production Metashrew proxy: http://localhost:${PORT}/api/production`);
});
