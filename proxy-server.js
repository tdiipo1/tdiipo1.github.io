// CORS Proxy Server for Affirm Integration Testing Suite
// This server bypasses CORS restrictions to allow browser-to-API calls
// Requires Node.js 18+ (for native fetch) or install node-fetch

const express = require('express');
const cors = require('cors');

// Use native fetch (Node 18+) or fallback to node-fetch
let fetch;
try {
    // Try native fetch first (Node 18+)
    fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
    // Fallback: install node-fetch if native fetch not available
    console.warn('Native fetch not available. Install node-fetch: npm install node-fetch@2');
    try {
        fetch = require('node-fetch');
    } catch (err) {
        console.error('Please install node-fetch: npm install node-fetch@2');
        process.exit(1);
    }
}

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint - forwards requests to Affirm API
app.all('/proxy/*', async (req, res) => {
  try {
    // Extract target URL from path
    // /proxy/https://api.affirm.com/api/v2/checkouts -> https://api.affirm.com/api/v2/checkouts
    const targetUrl = req.path.replace('/proxy/', '');
    
    // Handle case where /proxy/ is accessed without a target URL
    if (!targetUrl || targetUrl === '') {
      return res.status(400).json({ 
        error: 'Invalid request. The /proxy/ endpoint requires a target URL.',
        usage: 'Format: /proxy/https://sandbox.affirm.com/api/v2/checkout/direct',
        example: 'http://localhost:3000/proxy/https://sandbox.affirm.com/api/v2/checkout/direct'
      });
    }
    
    if (!targetUrl.startsWith('http')) {
      return res.status(400).json({ 
        error: 'Invalid URL. URL must start with http:// or https://',
        received: targetUrl,
        usage: 'Format: /proxy/https://sandbox.affirm.com/api/v2/checkout/direct'
      });
    }

    console.log(`[${new Date().toISOString()}] ${req.method} ${targetUrl}`);

    // Forward all relevant headers to Affirm API
    // Note: Express lowercases all header names, so we check lowercase versions
    const forwardHeaders = {
      'Authorization': req.headers.authorization || '',
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': 'application/json'
    };
    
    // Forward Idempotency-Key if present (required for transaction operations)
    // Express lowercases headers, so it will be 'idempotency-key'
    const idempotencyKey = req.headers['idempotency-key'];
    if (idempotencyKey) {
      forwardHeaders['Idempotency-Key'] = idempotencyKey;
      console.log(`[Proxy] Forwarding Idempotency-Key: ${idempotencyKey.substring(0, 30)}...`);
    } else {
      console.log(`[Proxy] Warning: No Idempotency-Key header found in request`);
    }
    
    // Log all incoming headers for debugging
    console.log(`[Proxy] Incoming headers:`, Object.keys(req.headers).filter(h => 
      h.includes('authorization') || h.includes('idempotency') || h.includes('content-type')
    ));

    // Forward the request to Affirm API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE' 
        ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
        : undefined
    });

    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }
    
    // Forward the response with original status code
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Proxy server encountered an error forwarding the request'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'CORS Proxy server is running'
  });
});

// Root endpoint with instructions
app.get('/', (req, res) => {
  res.json({
    service: 'Affirm CORS Proxy Server',
    status: 'running',
    endpoints: {
      proxy: '/proxy/*',
      health: '/health'
    },
    usage: 'Set CORS Proxy in testing tool to: http://localhost:3000/proxy/'
  });
});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Affirm CORS Proxy Server');
  console.log('='.repeat(60));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 Set CORS Proxy in testing tool to: http://localhost:${PORT}/proxy/`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(60));
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});
