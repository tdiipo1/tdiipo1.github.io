# Mac Setup Guide - Proxy Server

This guide will walk you through setting up and running the CORS proxy server on your MacBook.

## Step 1: Install Node.js

### Option A: Using Homebrew (Recommended)

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js**:
   ```bash
   brew install node
   ```

3. **Verify installation**:
   ```bash
   node --version
   npm --version
   ```

### Option B: Using Official Installer

1. **Visit**: https://nodejs.org/
2. **Download** the macOS installer (LTS version recommended)
3. **Run** the installer and follow the prompts
4. **Verify installation**:
   ```bash
   node --version
   npm --version
   ```

## Step 2: Set Up the Proxy Server

1. **Open Terminal** (Applications > Utilities > Terminal)

2. **Navigate to the project directory**:
   ```bash
   cd ~/Documents/GitHub/tdiipo1.github.io
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

   This will install:
   - `express` - Web server framework
   - `cors` - CORS middleware
   - `node-fetch` - HTTP client (for Node.js < 18)

## Step 3: Start the Proxy Server

### Option A: Using npm (Easiest)

```bash
npm start
```

### Option B: Using the Startup Script

```bash
./start-proxy.sh
```

### Option C: Direct Node Command

```bash
node proxy-server.js
```

You should see:
```
============================================================
🚀 Affirm CORS Proxy Server
============================================================
✅ Server running on http://localhost:3000
📋 Set CORS Proxy in testing tool to: http://localhost:3000/proxy/
🏥 Health check: http://localhost:3000/health
============================================================
Press Ctrl+C to stop the server
```

## Step 4: Configure in Testing Tool

1. **Keep the terminal running** (don't close it - the server needs to stay running)

2. **Open your browser** and go to: https://tdiipo1.github.io

3. **Navigate to**: API Testing Tools → Secure Key Management

4. **Set CORS Proxy** to: `http://localhost:3000/proxy/`

5. **Click "Test Proxy"** button to verify the connection

6. **Save your configuration**

## Step 5: Test the Connection

1. Click the **"Test Proxy"** button in the Secure Key Management section
2. You should see: ✅ Proxy server is running!

## Troubleshooting

### "Command not found: node"
- Node.js is not installed or not in PATH
- Reinstall Node.js or restart Terminal

### "Port 3000 already in use"
- Another process is using port 3000
- Change PORT in `proxy-server.js` to a different port (e.g., 3001)
- Or stop the other process: `lsof -ti:3000 | xargs kill`

### "Cannot connect to proxy server"
- Make sure the server is running in Terminal
- Check that the URL is exactly: `http://localhost:3000/proxy/`
- Try the health check: Open `http://localhost:3000/health` in your browser

### "npm: command not found"
- Node.js/npm is not installed
- Follow Step 1 to install Node.js

## Running in Background (Optional)

If you want to run the server in the background:

```bash
# Using nohup
nohup node proxy-server.js > proxy.log 2>&1 &

# Or using screen
screen -S proxy
node proxy-server.js
# Press Ctrl+A then D to detach
# Reattach with: screen -r proxy
```

## Stopping the Server

- Press `Ctrl+C` in the terminal where the server is running
- Or if running in background: `pkill -f proxy-server.js`

## Next Steps

Once the proxy is running:
1. ✅ Set CORS Proxy URL in the testing tool
2. ✅ Unlock your encrypted API keys
3. ✅ Enable Real API Calls
4. ✅ Start testing Affirm API endpoints!

