# CORS Proxy Setup Guide

This guide explains how to set up a CORS proxy to bypass browser CORS restrictions when making API calls to Affirm.

## Why You Need a Proxy

Affirm's API does not allow direct browser requests due to CORS (Cross-Origin Resource Sharing) restrictions. This is a security feature. To make API calls from the browser, you need a proxy server.

## Quick Start: Local Proxy Server

### Option 1: Node.js Proxy (Recommended for Testing)

1. **Install Node.js** (if not already installed)

2. **Create a new directory** and install dependencies:
   ```bash
   mkdir affirm-proxy
   cd affirm-proxy
   npm init -y
   npm install express cors node-fetch
   ```

3. **Copy the proxy server code** from `proxy-server-example.js` to `server.js`

4. **Run the server**:
   ```bash
   node server.js
   ```

5. **Configure in Testing Tool**:
   - Go to Secure Key Management
   - Set CORS Proxy to: `http://localhost:3000/proxy/`
   - Save your configuration

### Option 2: Python Proxy (Alternative)

```python
# proxy.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/proxy/<path:url>', methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def proxy(url):
    full_url = f'https://{url}'
    headers = {
        'Authorization': request.headers.get('Authorization', ''),
        'Content-Type': 'application/json'
    }
    
    response = requests.request(
        method=request.method,
        url=full_url,
        headers=headers,
        json=request.json if request.is_json else None
    )
    
    return jsonify(response.json()), response.status_code

if __name__ == '__main__':
    app.run(port=3000)
```

Install: `pip install flask flask-cors requests`

## Deployment Options

### Vercel Serverless Function

1. **Create `vercel.json`**:
   ```json
   {
     "functions": {
       "api/proxy.js": {
         "runtime": "nodejs18.x"
       }
     }
   }
   ```

2. **Create `api/proxy.js`**:
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

3. **Deploy to Vercel**: `vercel deploy`

4. **Set CORS Proxy** to your Vercel function URL

### Netlify Function

1. **Create `netlify/functions/proxy.js`**:
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

2. **Deploy to Netlify**

3. **Set CORS Proxy** to your Netlify function URL

## Public CORS Proxies (Testing Only)

⚠️ **WARNING**: These are NOT secure for production. They can see your API keys and data.

- `https://cors-anywhere.herokuapp.com/` (may require temporary access)
- `https://api.allorigins.win/raw?url=`
- `https://corsproxy.io/?`

**Usage**: Set CORS Proxy to the proxy URL in Secure Key Management.

## Security Considerations

1. **Never use public proxies with production keys**
2. **Always use HTTPS** for your proxy
3. **Add authentication** to your proxy if deploying publicly
4. **Rate limiting** - consider adding rate limits
5. **Logging** - be careful not to log sensitive data

## Troubleshooting

**Proxy not working?**
- Check proxy server is running
- Verify proxy URL is correct (include trailing slash if required)
- Check browser console for errors
- Verify proxy server logs

**Still getting CORS errors?**
- Ensure proxy is properly forwarding headers
- Check that proxy URL format matches expected pattern
- Try a different proxy service

## Best Practice

For production use, always deploy your own proxy server with:
- Authentication
- Rate limiting
- HTTPS
- Proper error handling
- Request logging (without sensitive data)

