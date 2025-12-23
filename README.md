# Affirm Integration Testing Suite

A comprehensive testing interface for Affirm Partner Engineers to test and validate various Affirm integration scenarios.

## Overview

This GitHub Pages site provides a robust, easy-to-use testing interface for:
- **Promotional Messaging**: Test Affirm promotional messaging components and prequalification flows
- **Direct API**: Test Direct API checkout flows, authorization, and transaction management
- **Affirm Lite**: Test Affirm Lite pop-up checkout and virtual card generation
- **Virtual Card Network (VCN)**: Test VCN integration and card management
- **Transaction Lifecycle**: Test complete transaction lifecycle from authorization to settlement
- **API Testing**: Direct API testing interface for Merchant API endpoints

## Features

- 🎯 **Clear Test Scenarios**: Well-organized test cases for each integration type
- 🔧 **Interactive Testing**: Easy-to-use forms and controls for each test scenario
- 📊 **Real-time Results**: Immediate feedback on test outcomes
- 🔐 **Environment Configuration**: Support for both Sandbox and Production environments
- 📚 **Quick Access**: Direct links to Affirm documentation

## Usage

1. Visit the site at `https://tdiipo1.github.io`
2. Navigate to the relevant test section using the top navigation
3. Fill in the test parameters
4. Click the test button to execute
5. Review the results displayed below

## Local Development

The site is built with static HTML, CSS, and JavaScript. To run locally:

1. Clone this repository
2. Open `index.html` in a web browser
3. Or use a local server:
   ```bash
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## Lightweight Backend Proxy (Node.js)

Running a tiny proxy keeps your private key off the browser and avoids CORS. A ready-to-run example using Express lives in `proxy-server.js`.

### Quickstart: run the proxy

> 🧭 Can I start this proxy from the https://tdiipo1.github.io Environment Configuration page? **No**—the page only stores configuration in your browser. You must run the Node.js proxy from a terminal (local machine, Codespaces, or a server). Once it is running, point the page to it using the "API Base URL or Proxy" field in Environment Configuration.

1. **Install dependencies** (Node 18+):
   ```bash
   npm install express dotenv node-fetch@2
   ```
2. **Create a `.env` file** (or export the vars in your shell):
   ```bash
   AFFIRM_PUBLIC_KEY=your_public_key
   AFFIRM_PRIVATE_KEY=your_private_key
   AFFIRM_API_BASE=https://sandbox.affirm.com/api/v1
   PORT=5050
   ```
3. **Start the server**:
   ```bash
   node proxy-server.js
   ```
   You should see `Affirm proxy listening on port 5050`.
4. **Smoke test it**:
   ```bash
   curl http://localhost:5050/health
   # => {"status":"ok"}
   ```
5. **Optional: hit Affirm through the proxy** (replace the path/body with your call):
   ```bash
   curl -X POST http://localhost:5050/proxy \
     -H "Content-Type: application/json" \
     -d '{"path":"/charges","body":{"merchant_external_reference":"test"}}'
   ```

The proxy exposes two endpoints:

- `POST /proxy` forwards requests to Affirm. Send JSON with a `path`, optional `method`, and optional `body`.
- `GET /health` returns `{ "status": "ok" }` so you can confirm the server is running.

### Point the web app to the proxy

In the site’s Environment Configuration, set the base URL to your proxy (e.g., `http://localhost:5050/proxy`). Requests will flow as:

```
Browser → proxy-server.js → Affirm Sandbox
```

## Python Site Generator

A Python script (`generate_site.py`) is included for generating configuration files and validating the site structure:

```bash
python generate_site.py
```

This script can be extended to programmatically generate test scenarios or update the site.

## Documentation Links

- [Introduction to Affirm](https://docs.affirm.com/developers/docs/home-introduction)
- [Direct API Overview](https://docs.affirm.com/payments/docs/direct-api-overview)
- [Affirm Lite Integration](https://docs.affirm.com/payments/docs/affirm-lite-integration-guide)
- [Virtual Card Network Overview](https://docs.affirm.com/payments/docs/vcn-overview)
- [Solutions We Offer](https://docs.affirm.com/developers/docs/solutions-we-offer)

## File Structure

```
.
├── index.html          # Main HTML file
├── styles.css          # Styling
├── app.js              # JavaScript functionality
├── generate_site.py    # Python site generator script
└── README.md           # This file
```

## API Calls & Security

### Default Behavior: Mock Mode
**By default, this tool does NOT make real API calls to Affirm.** It uses mock/simulated responses for safety. This means:
- ✅ No credentials required to use the tool
- ✅ Safe to use without exposing API keys
- ✅ Perfect for testing UI flows and understanding integration patterns
- ⚠️ Responses are simulated and won't reflect actual API behavior

### Enabling Real API Calls
To make actual API calls to Affirm's API:

1. Go to the **API Testing Tools** section
2. Open **Environment Configuration**
3. Check the **"Enable Real API Calls"** checkbox
4. Enter your **Public API Key** and **Private API Key**
5. Select your environment (Sandbox or Production)
6. Click **Save Configuration**

### ⚠️ Security Warnings

**CRITICAL:** Making API calls from client-side JavaScript has serious security implications:

1. **Private Key Exposure**: Your private API key will be visible in:
   - Browser DevTools (Network tab)
   - Browser JavaScript console
   - Any browser extensions
   - Server logs (if proxied)

2. **Best Practices**:
   - ✅ **Only use in Sandbox environment** for testing
   - ✅ **Never commit credentials** to version control
   - ✅ **Use environment variables** if running locally
   - ✅ **Consider a backend proxy** for production use
   - ❌ **Never use in production** without a secure backend

3. **Recommended Architecture**:
   ```
   Browser → Your Backend Server → Affirm API
   ```
   This keeps your private key secure on the server side.

### Notes

- Mock mode is enabled by default for safety
- Real API calls require valid Affirm API credentials
- This is a testing tool for Partner Engineers and should not be used for production transactions
- For production integrations, always use a secure backend server

## License

Internal tool for Affirm Partner Engineering use.
