// Affirm Integration Testing Suite - JavaScript

// Configuration
const CONFIG = {
    sandbox: {
        baseUrl: 'https://sandbox.affirm.com/api/v2'
    },
    production: {
        baseUrl: 'https://api.affirm.com/api/v2'
    },
    currentEnv: 'sandbox',
    // Set to true to make real API calls (requires valid credentials)
    // WARNING: Never commit private keys to version control!
    useRealAPI: false,
    // CORS Proxy: Optional proxy URL to bypass CORS restrictions
    // Examples:
    // - Public proxy: 'https://cors-anywhere.herokuapp.com/'
    // - Your own proxy: 'https://your-proxy.example.com/'
    // - Leave empty to attempt direct API calls (will fail due to CORS)
    corsProxy: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeSecureKeyManager();
    setupSmoothScrolling();
    setupScrollToTop();
    setupSessionTimer();
});

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll to top button
function setupScrollToTop() {
    const button = document.createElement('button');
    button.className = 'scroll-to-top';
    button.innerHTML = '↑';
    button.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.classList.add('show');
        } else {
            button.classList.remove('show');
        }
    });
}

// Utility: Display test result
function displayResult(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = message;
    element.className = `test-result show ${type}`;
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Utility: Format JSON for display
function formatJSON(obj) {
    return JSON.stringify(obj, null, 2);
}

// Utility: Make API call
// NOTE: By default, this uses MOCK responses for safety.
// Set CONFIG.useRealAPI = true and unlock encrypted keys to make real API calls.
// Keys are securely encrypted and only decrypted in memory during active session.
// Use CONFIG.corsProxy to bypass CORS restrictions (see README for options).
async function makeAPICall(endpoint, method = 'GET', body = null) {
    const config = CONFIG[CONFIG.currentEnv];
    let url = `${config.baseUrl}${endpoint}`;
    
    // If useRealAPI is false, return mock response
    if (!CONFIG.useRealAPI) {
        return await simulateAPICall(url, method, body);
    }

    // Get decrypted keys from secure key manager
    const keys = keyManager.getKeys();
    if (!keys || !keys.publicKey || !keys.privateKey) {
        return {
            success: false,
            error: 'API credentials not available. Please unlock your encrypted keys using your passphrase in the Secure Key Management section.'
        };
    }
    
    // Apply CORS proxy if configured
    if (CONFIG.corsProxy) {
        // Remove trailing slash from proxy if present
        const proxy = CONFIG.corsProxy.replace(/\/$/, '');
        url = `${proxy}/${url}`;
    }
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${btoa(keys.publicKey + ':' + keys.privateKey)}`
        }
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    try {
        // Make actual API call (through proxy if configured)
        const response = await fetch(url, options);
        
        // Handle non-JSON responses (e.g., CORS errors, network errors)
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            // If response is not JSON, try to parse as JSON, otherwise use text
            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text || `HTTP ${response.status} ${response.statusText}` };
            }
        }
        
        if (!response.ok) {
            return {
                success: false,
                error: `API Error (${response.status}): ${data.message || data.error || JSON.stringify(data)}`
            };
        }
        
        return { success: true, data: data };
    } catch (error) {
        // Handle CORS and network errors
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            let errorMsg = `CORS Error: Browser cannot make direct API calls to Affirm due to CORS restrictions.\n\n`;
            
            if (!CONFIG.corsProxy) {
                errorMsg += `⚠️ No CORS Proxy configured!\n\n`;
                errorMsg += `To fix this:\n`;
                errorMsg += `1. Go to Secure Key Management\n`;
                errorMsg += `2. Enter a CORS Proxy URL (e.g., http://localhost:3000/proxy/)\n`;
                errorMsg += `3. See PROXY_SETUP.md for setup instructions\n\n`;
            } else {
                errorMsg += `CORS Proxy configured: ${CONFIG.corsProxy}\n`;
                errorMsg += `If this error persists, check:\n`;
                errorMsg += `- Proxy server is running\n`;
                errorMsg += `- Proxy URL is correct\n`;
                errorMsg += `- Proxy is properly forwarding requests\n\n`;
            }
            
            errorMsg += `Alternative Solutions:\n`;
            errorMsg += `- Use Affirm.js SDK for client-side checkout\n`;
            errorMsg += `- Test API calls using curl or Postman\n`;
            errorMsg += `- Deploy your own backend proxy\n\n`;
            errorMsg += `For more information, see: https://docs.affirm.com/developers/reference/introduction`;
            
            return {
                success: false,
                error: errorMsg
            };
        }
        return {
            success: false,
            error: `Network Error: ${error.message}`
        };
    }
}

// Simulate API call (used when CONFIG.useRealAPI is false)
// This provides safe mock responses without requiring credentials
async function simulateAPICall(url, method, body) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock response based on endpoint
    const mockResponses = {
        '/checkouts': {
            id: 'checkout_' + Date.now(),
            checkout_token: 'token_' + Math.random().toString(36).substr(2, 9),
            created: new Date().toISOString(),
            _note: 'This is a MOCK response. Enable real API calls in configuration to make actual requests.'
        },
        '/transactions': {
            id: 'transaction_' + Date.now(),
            status: 'authorized',
            amount: body?.amount || 0,
            created: new Date().toISOString(),
            _note: 'This is a MOCK response. Enable real API calls in configuration to make actual requests.'
        }
    };

    const endpoint = url.split('/api/v2')[1] || url;
    const mockResponse = mockResponses[endpoint] || { 
        message: 'Mock response', 
        url, 
        method, 
        body,
        _note: 'This is a MOCK response. Enable real API calls in configuration to make actual requests.'
    };
    
    return { success: true, data: mockResponse };
}

// Promotional Messaging Tests
function testProductPageMessaging() {
    const price = parseFloat(document.getElementById('product-price').value);
    const result = {
        price: price,
        messaging: `As low as $${(price / 4).toFixed(2)}/month with Affirm`,
        eligible: price >= 50,
        financingOptions: price >= 50 ? ['Pay in 4', 'Monthly Installments'] : []
    };
    displayResult('product-messaging-result', formatJSON(result), 'success');
}

function testCartMessaging() {
    const total = parseFloat(document.getElementById('cart-total').value);
    const result = {
        cartTotal: total,
        messaging: `Split your purchase into 4 interest-free payments of $${(total / 4).toFixed(2)}`,
        prequalificationAvailable: true,
        estimatedMonthlyPayment: (total / 4).toFixed(2)
    };
    displayResult('cart-messaging-result', formatJSON(result), 'success');
}

function testBannerMessaging() {
    const minAmount = parseFloat(document.getElementById('banner-min').value);
    const result = {
        minimumAmount: minAmount,
        bannerText: `Shop now, pay over time. Starting at $${minAmount}`,
        displayConditions: {
            minPurchase: minAmount,
            eligibleProducts: 'All products'
        }
    };
    displayResult('banner-messaging-result', formatJSON(result), 'success');
}

function testPrequalification() {
    const email = document.getElementById('prequal-email').value;
    const amount = parseFloat(document.getElementById('prequal-amount').value);
    const result = {
        email: email,
        amount: amount,
        prequalified: true,
        financingOptions: [
            { type: 'Pay in 4', monthlyPayment: (amount / 4).toFixed(2) },
            { type: '3 months', monthlyPayment: (amount / 3).toFixed(2) },
            { type: '6 months', monthlyPayment: (amount / 6).toFixed(2) }
        ],
        note: 'Prequalification does not impact credit score'
    };
    displayResult('prequal-result', formatJSON(result), 'success');
}

// Direct API Tests
async function testCheckoutInit() {
    const amount = parseFloat(document.getElementById('checkout-amount').value);
    const merchantName = document.getElementById('merchant-name').value;
    const checkoutType = document.getElementById('checkout-type').value;
    
    // Get public key from secure key manager
    const keys = keyManager.getKeys();
    const publicKey = keys ? keys.publicKey : 'YOUR_PUBLIC_KEY';
    
    const checkoutData = {
        merchant: {
            public_api_key: publicKey,
            user_confirmation_url: window.location.origin + '/confirm',
            user_cancel_url: window.location.origin + '/cancel'
        },
        items: [{
            display_name: 'Test Item',
            sku: 'TEST-001',
            unit_price: amount,
            qty: 1,
            item_image_url: '',
            item_url: window.location.href
        }],
        shipping: {
            name: { full: 'Test User' },
            address: {
                line1: '123 Test St',
                city: 'San Francisco',
                state: 'CA',
                zipcode: '94105',
                country: 'USA'
            }
        },
        billing: {
            name: { full: 'Test User' },
            address: {
                line1: '123 Test St',
                city: 'San Francisco',
                state: 'CA',
                zipcode: '94105',
                country: 'USA'
            }
        },
        total: amount,
        metadata: {
            checkout_type: checkoutType
        }
    };

    const response = await makeAPICall('/checkouts', 'POST', checkoutData);
    
    if (response.success) {
        displayResult('checkout-init-result', 
            `Checkout initialized successfully!\n\n${formatJSON(response.data)}\n\nNext steps:\n1. Open checkout using: affirm.checkout.open()\n2. Use checkout_token to authorize transaction`,
            'success');
    } else {
        displayResult('checkout-init-result', `Error: ${response.error}`, 'error');
    }
}

async function testTransactionAuth() {
    const checkoutToken = document.getElementById('checkout-token').value;
    const orderId = document.getElementById('order-id').value;
    
    if (!checkoutToken) {
        displayResult('transaction-auth-result', 'Error: Checkout token is required', 'error');
        return;
    }

    const authData = {
        checkout_token: checkoutToken,
        order_id: orderId || 'ORDER_' + Date.now()
    };

    const response = await makeAPICall('/transactions', 'POST', authData);
    
    if (response.success) {
        displayResult('transaction-auth-result', 
            `Transaction authorized successfully!\n\n${formatJSON(response.data)}\n\nStore transaction_id for future operations`,
            'success');
    } else {
        displayResult('transaction-auth-result', `Error: ${response.error}`, 'error');
    }
}

async function testTransactionCapture() {
    const transactionId = document.getElementById('capture-transaction-id').value;
    const amount = parseFloat(document.getElementById('capture-amount').value);
    
    if (!transactionId) {
        displayResult('transaction-capture-result', 'Error: Transaction ID is required', 'error');
        return;
    }

    const captureData = amount > 0 ? { amount: amount } : {};
    const response = await makeAPICall(`/transactions/${transactionId}/capture`, 'POST', captureData);
    
    if (response.success) {
        displayResult('transaction-capture-result', 
            `Transaction captured successfully!\n\n${formatJSON(response.data)}`,
            'success');
    } else {
        displayResult('transaction-capture-result', `Error: ${response.error}`, 'error');
    }
}

async function testSplitCapture() {
    const transactionId = document.getElementById('split-transaction-id').value;
    const firstAmount = parseFloat(document.getElementById('split-first').value);
    const secondAmount = parseFloat(document.getElementById('split-second').value);
    
    if (!transactionId) {
        displayResult('split-capture-result', 'Error: Transaction ID is required', 'error');
        return;
    }

    const result = {
        transactionId: transactionId,
        captures: [
            { amount: firstAmount, status: 'pending' },
            { amount: secondAmount, status: 'pending' }
        ],
        totalCaptured: firstAmount + secondAmount,
        remaining: 0
    };
    
    displayResult('split-capture-result', 
        `Split capture configured:\n\n${formatJSON(result)}\n\nExecute captures sequentially`,
        'info');
}

async function testTransactionVoid() {
    const transactionId = document.getElementById('void-transaction-id').value;
    
    if (!transactionId) {
        displayResult('transaction-void-result', 'Error: Transaction ID is required', 'error');
        return;
    }

    const response = await makeAPICall(`/transactions/${transactionId}/void`, 'POST');
    
    if (response.success) {
        displayResult('transaction-void-result', 
            `Transaction voided successfully!\n\n${formatJSON(response.data)}`,
            'success');
    } else {
        displayResult('transaction-void-result', `Error: ${response.error}`, 'error');
    }
}

async function testTransactionRefund() {
    const transactionId = document.getElementById('refund-transaction-id').value;
    const amount = parseFloat(document.getElementById('refund-amount').value);
    
    if (!transactionId) {
        displayResult('transaction-refund-result', 'Error: Transaction ID is required', 'error');
        return;
    }

    const refundData = amount > 0 ? { amount: amount } : {};
    const response = await makeAPICall(`/transactions/${transactionId}/refund`, 'POST', refundData);
    
    if (response.success) {
        displayResult('transaction-refund-result', 
            `Refund processed successfully!\n\n${formatJSON(response.data)}`,
            'success');
    } else {
        displayResult('transaction-refund-result', `Error: ${response.error}`, 'error');
    }
}

// Affirm Lite Tests
function testLiteCheckout() {
    const amount = parseFloat(document.getElementById('lite-amount').value);
    const autofill = document.getElementById('lite-autofill').checked;
    
    const result = {
        amount: amount,
        autofillEnabled: autofill,
        checkoutFlow: 'Affirm Lite pop-up',
        steps: [
            '1. Customer clicks Affirm Lite button',
            '2. Pop-up checkout window opens',
            '3. Customer completes Affirm flow',
            autofill ? '4. Virtual card autofills into payment fields' : '4. Customer manually enters virtual card details',
            '5. Transaction processed via existing payment gateway'
        ],
        virtualCardGenerated: true
    };
    
    displayResult('lite-checkout-result', formatJSON(result), 'success');
}

function testVirtualCardGen() {
    const token = document.getElementById('lite-token').value;
    
    if (!token) {
        displayResult('virtual-card-result', 'Error: Checkout token is required', 'error');
        return;
    }

    const result = {
        checkoutToken: token,
        virtualCard: {
            cardNumber: '4111111111111111',
            cvv: '123',
            expirationMonth: '12',
            expirationYear: '2025',
            cardholderName: 'AFFIRM TEST'
        },
        note: 'This is a test virtual card. In production, retrieve from API using checkout token.'
    };
    
    displayResult('virtual-card-result', formatJSON(result), 'info');
}

function testFallback() {
    const amount = parseFloat(document.getElementById('fallback-amount').value);
    
    const result = {
        amount: amount,
        scenario: 'Autofill failed (e.g., iframe restrictions)',
        fallbackFlow: [
            '1. Customer redirected to Affirm Landing Page',
            '2. Customer completes checkout on landing page',
            '3. Virtual card details displayed',
            '4. Customer copies card details',
            '5. Customer returns to merchant site',
            '6. Customer pastes card details into payment fields'
        ],
        note: 'Fallback ensures transaction completion even when autofill is not possible'
    };
    
    displayResult('fallback-result', formatJSON(result), 'warning');
}

// VCN Tests
function testVCNCheckout() {
    const amount = parseFloat(document.getElementById('vcn-amount').value);
    const platform = document.getElementById('vcn-platform').value;
    
    const result = {
        amount: amount,
        platform: platform,
        checkoutFlow: 'Virtual Card Network',
        steps: [
            '1. Initialize VCN checkout',
            '2. Customer completes Affirm flow',
            '3. Virtual card generated',
            platform === 'web' ? '4. Card details returned via callback' : 
            platform === 'ios' ? '4. Card details returned via iOS SDK' :
            '4. Card details returned via Android SDK',
            '5. Process payment using virtual card'
        ],
        integrationType: 'Uses existing card payment rails'
    };
    
    displayResult('vcn-checkout-result', formatJSON(result), 'success');
}

async function testCardDetails() {
    const cardId = document.getElementById('card-id').value;
    
    if (!cardId) {
        displayResult('card-details-result', 'Error: Card ID is required', 'error');
        return;
    }

    const response = await makeAPICall(`/cards/${cardId}`, 'GET');
    
    if (response.success) {
        displayResult('card-details-result', formatJSON(response.data), 'success');
    } else {
        displayResult('card-details-result', `Error: ${response.error}`, 'error');
    }
}

async function testCardFinalization() {
    const cardId = document.getElementById('finalize-card-id').value;
    
    if (!cardId) {
        displayResult('card-finalize-result', 'Error: Card ID is required', 'error');
        return;
    }

    const response = await makeAPICall(`/cards/${cardId}/finalize`, 'POST');
    
    if (response.success) {
        displayResult('card-finalize-result', 
            `Card finalized successfully!\n\n${formatJSON(response.data)}`,
            'success');
    } else {
        displayResult('card-finalize-result', `Error: ${response.error}`, 'error');
    }
}

async function testCardCancellation() {
    const cardId = document.getElementById('cancel-card-id').value;
    
    if (!cardId) {
        displayResult('card-cancel-result', 'Error: Card ID is required', 'error');
        return;
    }

    const response = await makeAPICall(`/cards/${cardId}/cancel`, 'POST');
    
    if (response.success) {
        displayResult('card-cancel-result', 
            `Card cancelled successfully!\n\n${formatJSON(response.data)}`,
            'success');
    } else {
        displayResult('card-cancel-result', `Error: ${response.error}`, 'error');
    }
}

function testTelesalesVCN() {
    const amount = parseFloat(document.getElementById('telesales-amount').value);
    const phone = document.getElementById('telesales-phone').value;
    
    const result = {
        amount: amount,
        customerPhone: phone,
        flow: 'Telesales VCN',
        steps: [
            '1. Sales agent initiates checkout',
            '2. Affirm checkout link sent via SMS/Email',
            '3. Customer completes checkout on mobile device',
            '4. Virtual card generated',
            '5. Card details shared with sales agent',
            '6. Agent processes payment using virtual card'
        ]
    };
    
    displayResult('telesales-vcn-result', formatJSON(result), 'success');
}

function testInStoreVCN() {
    const amount = parseFloat(document.getElementById('instore-amount').value);
    const location = document.getElementById('store-location').value;
    
    const result = {
        amount: amount,
        storeLocation: location,
        flow: 'In-Store VCN',
        steps: [
            '1. Customer at POS selects Affirm',
            '2. QR code or link displayed',
            '3. Customer scans/opens on mobile device',
            '4. Customer completes checkout',
            '5. Virtual card generated',
            '6. Card details entered at POS or shared with cashier'
        ]
    };
    
    displayResult('instore-vcn-result', formatJSON(result), 'success');
}

// Transaction Lifecycle Tests
async function testFullLifecycle() {
    const amount = parseFloat(document.getElementById('lifecycle-amount').value);
    const merchantId = document.getElementById('lifecycle-merchant-id').value;
    
    const lifecycle = {
        step1: { action: 'Authorize', status: 'completed', transactionId: 'TXN_' + Date.now() },
        step2: { action: 'Capture', status: 'pending', amount: amount },
        step3: { action: 'Settlement', status: 'pending', estimatedDate: new Date(Date.now() + 86400000).toISOString() }
    };
    
    displayResult('lifecycle-result', 
        `Full Transaction Lifecycle:\n\n${formatJSON(lifecycle)}\n\nExecute each step sequentially`,
        'info');
}

async function testTransactionStates() {
    const transactionId = document.getElementById('state-transaction-id').value;
    
    if (!transactionId) {
        displayResult('transaction-state-result', 'Error: Transaction ID is required', 'error');
        return;
    }

    const response = await makeAPICall(`/transactions/${transactionId}`, 'GET');
    
    if (response.success) {
        displayResult('transaction-state-result', formatJSON(response.data), 'success');
    } else {
        displayResult('transaction-state-result', `Error: ${response.error}`, 'error');
    }
}

async function testUpdateTransaction() {
    const transactionId = document.getElementById('update-transaction-id').value;
    const orderId = document.getElementById('update-order-id').value;
    
    if (!transactionId) {
        displayResult('update-transaction-result', 'Error: Transaction ID is required', 'error');
        return;
    }

    const updateData = { order_id: orderId };
    const response = await makeAPICall(`/transactions/${transactionId}`, 'PATCH', updateData);
    
    if (response.success) {
        displayResult('update-transaction-result', 
            `Transaction updated successfully!\n\n${formatJSON(response.data)}`,
            'success');
    } else {
        displayResult('update-transaction-result', `Error: ${response.error}`, 'error');
    }
}

async function testReadTransaction() {
    const transactionId = document.getElementById('read-transaction-id').value;
    
    if (!transactionId) {
        displayResult('read-transaction-result', 'Error: Transaction ID is required', 'error');
        return;
    }

    const response = await makeAPICall(`/transactions/${transactionId}`, 'GET');
    
    if (response.success) {
        displayResult('read-transaction-result', formatJSON(response.data), 'success');
    } else {
        displayResult('read-transaction-result', `Error: ${response.error}`, 'error');
    }
}

// API Testing Tools
async function testAPIRequest() {
    const endpoint = document.getElementById('api-endpoint').value;
    const method = document.getElementById('api-method').value;
    const bodyText = document.getElementById('api-body').value;
    const apiKey = document.getElementById('api-key').value;
    
    let body = null;
    if (bodyText) {
        try {
            body = JSON.parse(bodyText);
        } catch (e) {
            displayResult('api-request-result', `Error: Invalid JSON in request body\n\n${e.message}`, 'error');
            return;
        }
    }

    // Note: Temporary API key override not supported with secure key manager
    // Use the secure key management section to configure keys
    if (apiKey) {
        displayResult('api-request-result', 
            'Note: Temporary API key override is not available with secure key management.\nPlease use the Secure Key Management section to configure your keys.',
            'warning');
        return;
    }
    
    // Make API call using keys from secure key manager
    const response = await makeAPICall(endpoint, method, body);
    
    if (response.success) {
        displayResult('api-request-result', 
            `API Request Successful!\n\nEndpoint: ${method} ${endpoint}\n\nResponse:\n${formatJSON(response.data)}`,
            'success');
    } else {
        displayResult('api-request-result', 
            `API Request Failed!\n\nEndpoint: ${method} ${endpoint}\n\nError: ${response.error}`,
            'error');
    }
}

// Secure key management functions
async function saveAPIConfigSecure() {
    const env = document.getElementById('api-environment').value;
    const publicKey = document.getElementById('public-api-key').value.trim();
    const privateKey = document.getElementById('private-api-key').value.trim();
    const passphrase = document.getElementById('encryption-passphrase').value.trim();
    const useRealAPI = document.getElementById('use-real-api')?.checked || false;
    const corsProxy = document.getElementById('cors-proxy')?.value.trim() || '';
    
    if (!publicKey || !privateKey) {
        displayResult('api-config-result', 'Error: Both Public API Key and Private API Key are required.', 'error');
        return;
    }

    if (!passphrase || passphrase.length < 8) {
        displayResult('api-config-result', 'Error: Passphrase must be at least 8 characters long.', 'error');
        return;
    }

    try {
        CONFIG.currentEnv = env;
        CONFIG.useRealAPI = useRealAPI;
        CONFIG.corsProxy = corsProxy;
        
        // Save environment and API mode preferences to localStorage
        const configToSave = {
            currentEnv: env,
            useRealAPI: useRealAPI,
            corsProxy: corsProxy
        };
        localStorage.setItem('affirmConfig', JSON.stringify(configToSave));
        
        // Store keys securely with encryption
        await keyManager.storeKeys(publicKey, privateKey, passphrase, env);
        
        // Clear input fields for security
        document.getElementById('public-api-key').value = '';
        document.getElementById('private-api-key').value = '';
        document.getElementById('encryption-passphrase').value = '';
        
        let message = `✅ Keys encrypted and stored securely!\n\n`;
        message += `Environment: ${env}\n`;
        message += `Use Real API: ${useRealAPI ? 'YES ⚠️' : 'NO (Mock Mode)'}\n`;
        message += `Public Key: ***${publicKey.slice(-4)}\n`;
        message += `Private Key: ***${privateKey.slice(-4)}\n`;
        message += `CORS Proxy: ${corsProxy || 'None (direct calls - will fail due to CORS)'}\n\n`;
        message += `🔐 Keys are encrypted with AES-256-GCM and stored securely.\n`;
        message += `Keys are decrypted in memory only and will expire after 30 minutes of inactivity.\n\n`;
        
        if (useRealAPI) {
            message += `⚠️ WARNING: Real API calls enabled!\n`;
            if (!corsProxy) {
                message += `⚠️ CORS Proxy not configured - direct API calls will fail!\n`;
                message += `Please configure a CORS proxy in the Secure Key Management section.\n`;
                message += `See README for proxy options.\n\n`;
            }
            message += `Your private key will be visible in browser network requests.\n`;
            message += `Only use this for testing, never in production!`;
        }
        
        displayResult('api-config-result', message, useRealAPI ? 'warning' : 'success');
        updateAPIModeBanner();
        updateKeyManagementUI();
        updateSessionStatus();
    } catch (error) {
        displayResult('api-config-result', `Error: ${error.message}`, 'error');
    }
}

async function unlockKeys() {
    const passphrase = document.getElementById('unlock-passphrase').value.trim();
    
    if (!passphrase) {
        displayResult('api-config-result', 'Error: Passphrase is required.', 'error');
        return;
    }

    try {
        const success = await keyManager.loadKeysIntoMemory(passphrase);
        if (success) {
            document.getElementById('unlock-passphrase').value = '';
            displayResult('api-config-result', 
                '✅ Keys unlocked successfully! Session active for 30 minutes.\n\nKeys are now available in memory and will auto-expire for security.',
                'success');
            updateKeyManagementUI();
            updateSessionStatus();
            updateAPIModeBanner();
        } else {
            displayResult('api-config-result', 
                'Error: No encrypted keys found. Please save your keys first using "Save & Encrypt Keys".',
                'error');
        }
    } catch (error) {
        displayResult('api-config-result', `Error: ${error.message}`, 'error');
    }
}

function clearKeysFromMemory() {
    keyManager.clearKeys();
    displayResult('api-config-result', 
        '✅ Keys cleared from memory.\n\nEncrypted keys remain stored. Use "Unlock Keys" to decrypt them again.',
        'info');
    updateKeyManagementUI();
    updateSessionStatus();
    updateAPIModeBanner();
}

async function forgetKeys() {
    if (!confirm('Are you sure you want to permanently delete all stored encrypted keys? This cannot be undone.')) {
        return;
    }
    
    keyManager.clearStoredKeys();
    document.getElementById('unlock-passphrase').value = '';
    displayResult('api-config-result', 
        '✅ All keys permanently deleted.\n\nYou will need to enter and encrypt your keys again.',
        'info');
    updateKeyManagementUI();
    updateSessionStatus();
    updateAPIModeBanner();
}

function extendSession() {
    if (keyManager.extendSession()) {
        displayResult('api-config-result', 
            '✅ Session extended by 30 minutes.',
            'success');
        updateSessionStatus();
    } else {
        displayResult('api-config-result', 
            'Error: No active session. Please unlock your keys first.',
            'error');
    }
}

function initializeSecureKeyManager() {
    // Load environment preference
    const saved = localStorage.getItem('affirmConfig');
    if (saved) {
        try {
            const savedConfig = JSON.parse(saved);
            CONFIG.currentEnv = savedConfig.currentEnv || 'sandbox';
            CONFIG.useRealAPI = savedConfig.useRealAPI || false;
            CONFIG.corsProxy = savedConfig.corsProxy || '';
            
            document.getElementById('api-environment').value = CONFIG.currentEnv;
            document.getElementById('use-real-api').checked = CONFIG.useRealAPI;
            if (document.getElementById('cors-proxy')) {
                document.getElementById('cors-proxy').value = CONFIG.corsProxy;
            }
        } catch (e) {
            console.error('Error loading config:', e);
        }
    }
    
    updateKeyManagementUI();
    updateSessionStatus();
    updateAPIModeBanner();
}

function updateKeyManagementUI() {
    const unlockSection = document.getElementById('unlock-section');
    const keyEntrySection = document.getElementById('key-entry-section');
    
    if (keyManager.needsUnlock()) {
        unlockSection.style.display = 'block';
        keyEntrySection.style.display = 'none';
    } else {
        unlockSection.style.display = 'none';
        keyEntrySection.style.display = 'block';
    }
}

function updateSessionStatus() {
    const sessionStatus = document.getElementById('session-status');
    const sessionTime = document.getElementById('session-time');
    
    if (keyManager.isSessionActive()) {
        const remaining = keyManager.getRemainingSessionTime();
        sessionTime.textContent = remaining;
        sessionStatus.style.display = 'block';
    } else {
        sessionStatus.style.display = 'none';
    }
}

function setupSessionTimer() {
    // Update session status every minute
    setInterval(() => {
        updateSessionStatus();
        if (!keyManager.isSessionActive() && CONFIG.useRealAPI) {
            updateAPIModeBanner();
        }
    }, 60000);
}

// Legacy function - kept for compatibility but now uses secure key manager
function loadAPIConfig() {
    // This is now handled by initializeSecureKeyManager()
    // Keys are loaded from secure storage when unlocked
}

// Proxy server helper functions
function showProxyInstructions() {
    const instructions = document.getElementById('proxy-instructions');
    if (instructions.style.display === 'none') {
        instructions.style.display = 'block';
    } else {
        instructions.style.display = 'none';
    }
}

function copyProxyCommand() {
    const commands = [
        'cd ' + window.location.pathname.replace(/\/[^/]*$/, ''),
        'npm install',
        'npm start'
    ].join('\n');
    
    navigator.clipboard.writeText(commands).then(() => {
        displayResult('api-config-result', 
            '✅ Commands copied to clipboard!\n\n' +
            'Paste them into your terminal to start the proxy server.\n\n' +
            'After starting, set CORS Proxy to: http://localhost:3000/proxy/',
            'success');
    }).catch(() => {
        // Fallback if clipboard API fails
        const textarea = document.createElement('textarea');
        textarea.value = commands;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        displayResult('api-config-result', 
            '✅ Commands copied to clipboard!\n\n' +
            'Paste them into your terminal to start the proxy server.',
            'success');
    });
}

async function testProxyConnection() {
    const proxyUrl = document.getElementById('cors-proxy').value.trim() || 'http://localhost:3000';
    const healthUrl = proxyUrl.replace(/\/proxy\/?$/, '') + '/health';
    
    displayResult('api-config-result', 
        `Testing proxy connection to: ${healthUrl}\n\nPlease wait...`,
        'info');
    
    try {
        const response = await fetch(healthUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayResult('api-config-result', 
                `✅ Proxy server is running!\n\n${formatJSON(data)}\n\n` +
                `You can now use this proxy for API calls.`,
                'success');
        } else {
            displayResult('api-config-result', 
                `⚠️ Proxy server responded with status ${response.status}\n\n` +
                `Make sure the proxy server is running and the URL is correct.`,
                'warning');
        }
    } catch (error) {
        displayResult('api-config-result', 
            `❌ Cannot connect to proxy server\n\n` +
            `Error: ${error.message}\n\n` +
            `Make sure:\n` +
            `1. Proxy server is running (npm start)\n` +
            `2. URL is correct: ${proxyUrl}\n` +
            `3. No firewall is blocking port 3000`,
            'error');
    }
}

function updateAPIModeBanner() {
    const banner = document.getElementById('api-mode-banner');
    const text = document.getElementById('api-mode-text');
    
    if (CONFIG.useRealAPI && keyManager.isSessionActive()) {
        const remaining = keyManager.getRemainingSessionTime();
        banner.className = 'api-mode-banner real';
        text.textContent = `⚠️ REAL API MODE: Making actual API calls (${remaining} min session remaining)`;
    } else if (CONFIG.useRealAPI && !keyManager.isSessionActive()) {
        banner.className = 'api-mode-banner mock';
        text.textContent = '🔒 Keys locked. Unlock your encrypted keys to use Real API mode.';
    } else {
        banner.className = 'api-mode-banner mock';
        text.textContent = '🔒 MOCK MODE: Using simulated API responses (safe, no credentials needed)';
    }
}

