const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

const AFFIRM_API_BASE = process.env.AFFIRM_API_BASE || 'https://sandbox.affirm.com/api/v1';
const AFFIRM_PUBLIC_KEY = process.env.AFFIRM_PUBLIC_KEY || '';
const AFFIRM_PRIVATE_KEY = process.env.AFFIRM_PRIVATE_KEY || '';

app.use(express.json());

app.post('/proxy', async (req, res) => {
  const { path, method = 'POST', body } = req.body || {};

  if (!path) {
    res.status(400).json({ error: 'Missing path for Affirm API call' });
    return;
  }

  const url = `${AFFIRM_API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${AFFIRM_PUBLIC_KEY}:${AFFIRM_PRIVATE_KEY}`).toString('base64')}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();

  res.status(response.status).set('Content-Type', response.headers.get('content-type') || 'application/json');
  res.send(text);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Affirm proxy listening on port ${port}`);
});
