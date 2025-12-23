#!/bin/bash
# Quick start script for Affirm CORS Proxy Server

echo "🚀 Starting Affirm CORS Proxy Server..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    echo "  Option 1: Visit https://nodejs.org/ and download the installer"
    echo "  Option 2: Install via Homebrew: brew install node"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if proxy-server.js exists
if [ ! -f "proxy-server.js" ]; then
    echo "❌ proxy-server.js not found!"
    exit 1
fi

echo "✅ Starting proxy server..."
echo ""
node proxy-server.js

