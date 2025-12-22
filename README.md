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
├── index.html              # Main HTML file
├── styles.css              # Styling
├── app.js                  # JavaScript functionality
├── secure-keys.js          # Secure key management module (AES-256-GCM encryption)
├── generate_site.py         # Python site generator script
├── proxy-server-example.js  # Example CORS proxy server (Node.js)
├── PROXY_SETUP.md          # CORS proxy setup guide
├── SECURITY.md             # Detailed security documentation
└── README.md               # This file
```

## API Calls & Security

### Default Behavior: Mock Mode
**By default, this tool does NOT make real API calls to Affirm.** It uses mock/simulated responses for safety. This means:
- ✅ No credentials required to use the tool
- ✅ Safe to use without exposing API keys
- ✅ Perfect for testing UI flows and understanding integration patterns
- ⚠️ Responses are simulated and won't reflect actual API behavior

### Secure Key Management System

This tool implements a **highly secure key management system** using industry-standard encryption. Keys are never stored in plain text and are only decrypted in browser memory during active sessions.

#### 🔐 Encryption Architecture

**Algorithm: AES-256-GCM**
- Advanced Encryption Standard with 256-bit keys
- Galois/Counter Mode (GCM) provides authenticated encryption
- Prevents tampering and ensures data integrity

**Key Derivation: PBKDF2**
- Password-Based Key Derivation Function 2
- 100,000 iterations with SHA-256 hashing
- Converts your passphrase into a strong encryption key
- Unique 16-byte random salt per encryption

**Initialization Vector (IV)**
- 12-byte cryptographically secure random IV per encryption
- Required for GCM mode security
- Ensures same plaintext produces different ciphertext

#### 🔐 Security Features

1. **Encryption at Rest**: Keys are encrypted using AES-256-GCM before storage
2. **PBKDF2 Key Derivation**: Passphrase processed through PBKDF2 with 100,000 iterations
3. **Random Salt & IV**: Each encryption uses unique random salt and initialization vector
4. **Memory-Only Decryption**: Keys are only decrypted in browser memory, never stored in plain text
5. **Auto-Expiration**: Decrypted keys automatically expire after 30 minutes of inactivity
6. **Session Management**: Active session timer with ability to extend
7. **Passphrase Protection**: Passphrase never stored - you must remember it
8. **Input Field Security**: Keys cleared from input fields immediately after encryption

#### 🔒 How It Works

1. **Storing Keys**:
   - Enter your Public API Key and Private API Key
   - Create a strong passphrase (minimum 8 characters)
   - Keys are encrypted with your passphrase using AES-256-GCM
   - Only the encrypted data is stored in localStorage
   - Original keys are immediately cleared from input fields

2. **Unlocking Keys**:
   - When you need to use the keys, enter your passphrase
   - Keys are decrypted in memory only (never persisted)
   - Session remains active for 30 minutes
   - Keys automatically clear from memory when session expires

3. **Security Features**:
   - ✅ Keys never stored in plain text
   - ✅ Passphrase never stored (you must remember it)
   - ✅ Auto-expiration prevents long-term exposure
   - ✅ Memory-only decryption (cleared on page refresh)
   - ✅ Session extension available
   - ✅ Manual key clearing option
   - ✅ Passphrase trimming prevents whitespace-related failures
   - ✅ UI automatically updates when session expires

#### 📋 Using Secure Key Management

1. Go to the **API Testing Tools** section
2. Open **Secure Key Management**
3. Enter your **Public API Key** and **Private API Key**
4. Create/enter your **Encryption Passphrase** (remember this!)
5. Select your **Environment** (Sandbox/Production)
6. Check **"Enable Real API Calls"** if needed
7. Click **"Save & Encrypt Keys"**

**To unlock later:**
- Enter your passphrase in the unlock section
- Keys will be decrypted in memory for 30 minutes
- Use "Extend" button to add more time

### 🔒 Security Protections & Limitations

#### What This System Protects Against

✅ **LocalStorage Theft**: Encrypted data is useless without the passphrase  
✅ **Memory Dumps**: Keys auto-expire, reducing exposure window  
✅ **Browser Extensions**: Encrypted storage prevents direct key access  
✅ **Accidental Exposure**: Keys never stored in plain text  
✅ **Long-Term Exposure**: Auto-expiration limits risk window  
✅ **Whitespace Issues**: Passphrase trimming prevents decryption failures  

#### What This System Cannot Protect Against

⚠️ **Browser DevTools**: Network requests show Authorization header (Base64 encoded)  
⚠️ **Malicious Extensions**: Extensions with network access can intercept requests  
⚠️ **Memory Inspection**: Advanced tools could read decrypted keys from memory  
⚠️ **XSS Attacks**: If site is compromised, attacker could access decrypted keys  
⚠️ **Physical Access**: If device is compromised, keys in memory could be extracted  

### ⚠️ Security Warnings

**CRITICAL:** Even with encryption, making API calls from client-side JavaScript has security implications:

1. **Private Key Exposure During API Calls**: When making actual API calls, your private key will be visible in:
   - Browser DevTools (Network tab) - in the Authorization header
   - Browser JavaScript console (if inspected)
   - Any browser extensions with network access
   - Server logs (if requests are proxied)

2. **Best Practices**:
   - ✅ **Only use in Sandbox environment** for testing
   - ✅ **Never commit credentials** to version control
   - ✅ **Use strong, unique passphrases** (12+ characters recommended)
   - ✅ **Clear keys from memory** when done testing
   - ✅ **Consider a backend proxy** for production use
   - ✅ **Use on trusted devices only** - not shared/public computers
   - ❌ **Never use in production** without a secure backend
   - ❌ **Don't share your passphrase** - it's the key to your encrypted data
   - ❌ **Don't reuse passphrases** from other services

3. **Recommended Architecture for Production**:
   ```
   Browser → Your Backend Server → Affirm API
   ```
   This keeps your private key secure on the server side where it can't be accessed by browser tools.

### 🔄 CORS Workarounds

Since Affirm's API doesn't allow direct browser requests due to CORS restrictions, here are practical solutions:

#### Option 1: CORS Proxy (For Testing Only)

**⚠️ Security Warning**: Public CORS proxies are NOT secure for production use. They can see your API keys and data.

1. **Configure in Secure Key Management**:
   - Enter proxy URL in "CORS Proxy" field
   - Example: `http://localhost:3000/proxy/` (for local proxy)
   - API calls will be routed through the proxy

2. **Quick Setup**:
   - See [PROXY_SETUP.md](PROXY_SETUP.md) for detailed setup instructions
   - Use `proxy-server-example.js` as a starting point for your own proxy
   - Or use a public proxy service (testing only):
     - `https://cors-anywhere.herokuapp.com/` (may require temporary access)
     - `https://api.allorigins.win/raw?url=`
     - `https://corsproxy.io/?`

#### Option 2: Your Own Backend Proxy (Recommended)

Create a simple backend server that proxies requests:

**Node.js Example**:
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/proxy/*', async (req, res) => {
  const targetUrl = req.url.replace('/api/proxy/', 'https://');
  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      'Authorization': req.headers.authorization,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  res.json(data);
});

app.listen(3000);
```

Then set CORS Proxy to: `http://localhost:3000/api/proxy/`

#### Option 3: Serverless Functions

**Vercel Function** (`api/proxy.js`):
```javascript
export default async function handler(req, res) {
  const { url, method, body, auth } = JSON.parse(req.body);
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  const data = await response.json();
  res.json(data);
}
```

**Netlify Function** (`netlify/functions/proxy.js`):
```javascript
exports.handler = async (event, context) => {
  const { url, method, body, auth } = JSON.parse(event.body);
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  const data = await response.json();
  return { statusCode: 200, body: JSON.stringify(data) };
};
```

#### Option 4: Browser Extension (Not Recommended)

Some browser extensions can disable CORS, but:
- ❌ Not practical for end users
- ❌ Security risk
- ❌ Not a production solution

#### Best Practice

For production use, **always use a backend server** or **serverless function** that you control. This:
- ✅ Keeps API keys secure on the server
- ✅ Avoids CORS issues
- ✅ Provides better security
- ✅ Allows request logging and monitoring

### 📊 Technical Implementation

**Web Crypto API**: Uses browser's native Web Crypto API for all cryptographic operations
- `crypto.subtle.deriveKey()` - PBKDF2 key derivation
- `crypto.subtle.encrypt()` - AES-GCM encryption
- `crypto.subtle.decrypt()` - AES-GCM decryption
- `crypto.getRandomValues()` - Cryptographically secure random generation

**Browser Compatibility**: Full support in Chrome/Edge (37+), Firefox (34+), Safari (11+), Opera (24+)

**Storage Format**: Encrypted data stored in localStorage with structure:
```json
{
  "encrypted": "base64_encoded_data",
  "environment": "sandbox|production",
  "storedAt": timestamp
}
```

For detailed security documentation, see [SECURITY.md](SECURITY.md).

### Notes

- Mock mode is enabled by default for safety
- Real API calls require valid Affirm API credentials
- This is a testing tool for Partner Engineers and should not be used for production transactions
- For production integrations, always use a secure backend server

## License

Internal tool for Affirm Partner Engineering use.
