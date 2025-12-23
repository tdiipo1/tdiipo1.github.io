// Simple CORS Proxy Server Example
// This is a basic example of a backend proxy to bypass CORS restrictions
// 
// Usage:
// 1. Install dependencies: npm install express cors
// 2. Run: node proxy-server-example.js
// 3. Set CORS Proxy in the testing tool to: http://localhost:3000/proxy/

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint
app.all('/proxy/*', async (req, res) => {
  try {
    // Extract target URL from path
    // /proxy/https://api.affirm.com/api/v2/checkouts -> https://api.affirm.com/api/v2/checkouts
    const targetUrl = req.path.replace('/proxy/', '');
    
    if (!targetUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Forward the request to Affirm API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': req.headers.authorization || '',
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept': 'application/json'
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    const data = await response.json();
    
    // Forward the response
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`CORS Proxy server running on http://localhost:${PORT}`);
  console.log(`Set CORS Proxy in testing tool to: http://localhost:${PORT}/proxy/`);
});

