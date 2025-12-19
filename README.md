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
├── index.html          # Main HTML file
├── styles.css          # Styling
├── app.js              # JavaScript functionality
├── secure-keys.js      # Secure key management module (AES-256-GCM encryption)
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

### Secure Key Management System

This tool implements a **highly secure key management system** using industry-standard encryption:

#### 🔐 Encryption Features

1. **AES-256-GCM Encryption**: Keys are encrypted using AES-256-GCM (Advanced Encryption Standard with Galois/Counter Mode)
2. **PBKDF2 Key Derivation**: Your passphrase is processed through PBKDF2 with 100,000 iterations and SHA-256 hashing
3. **Random Salt & IV**: Each encryption uses unique random salt and initialization vector
4. **Memory-Only Decryption**: Keys are only decrypted in browser memory, never stored in plain text
5. **Auto-Expiration**: Decrypted keys automatically expire after 30 minutes of inactivity
6. **Session Management**: Active session timer with ability to extend

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
   - ❌ **Never use in production** without a secure backend
   - ❌ **Don't share your passphrase** - it's the key to your encrypted data

3. **Recommended Architecture for Production**:
   ```
   Browser → Your Backend Server → Affirm API
   ```
   This keeps your private key secure on the server side where it can't be accessed by browser tools.

### Notes

- Mock mode is enabled by default for safety
- Real API calls require valid Affirm API credentials
- This is a testing tool for Partner Engineers and should not be used for production transactions
- For production integrations, always use a secure backend server

## License

Internal tool for Affirm Partner Engineering use.
