// Affirm Integration Testing Suite - JavaScript

// Configuration
const CONFIG = {
    sandbox: {
        baseUrl: 'https://sandbox.affirm.com/api/v2',
        publicKey: '',
        privateKey: ''
    },
    production: {
        baseUrl: 'https://api.affirm.com/api/v2',
        publicKey: '',
        privateKey: ''
    },
    currentEnv: 'sandbox'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadAPIConfig();
    setupSmoothScrolling();
    setupScrollToTop();
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

// Utility: Make API call (mock for now - replace with actual API calls)
async function makeAPICall(endpoint, method = 'GET', body = null) {
    const config = CONFIG[CONFIG.currentEnv];
    const url = `${config.baseUrl}${endpoint}`;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    if (config.publicKey) {
        options.headers['Authorization'] = `Basic ${btoa(config.publicKey + ':' + config.privateKey)}`;
    }

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    try {
        // In a real implementation, this would make an actual API call
        // For now, we'll simulate the response
        const response = await simulateAPICall(url, method, body);
        return { success: true, data: response };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Simulate API call (replace with actual fetch in production)
async function simulateAPICall(url, method, body) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock response based on endpoint
    const mockResponses = {
        '/checkouts': {
            id: 'checkout_' + Date.now(),
            checkout_token: 'token_' + Math.random().toString(36).substr(2, 9),
            created: new Date().toISOString()
        },
        '/transactions': {
            id: 'transaction_' + Date.now(),
            status: 'authorized',
            amount: body?.amount || 0,
            created: new Date().toISOString()
        }
    };

    const endpoint = url.split('/api/v2')[1] || url;
    return mockResponses[endpoint] || { message: 'Mock response', url, method, body };
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
    
    const checkoutData = {
        merchant: {
            public_api_key: CONFIG[CONFIG.currentEnv].publicKey || 'YOUR_PUBLIC_KEY',
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

    // Temporarily override API key if provided
    if (apiKey) {
        const originalKey = CONFIG[CONFIG.currentEnv].publicKey;
        CONFIG[CONFIG.currentEnv].publicKey = apiKey;
        const response = await makeAPICall(endpoint, method, body);
        CONFIG[CONFIG.currentEnv].publicKey = originalKey;
        
        if (response.success) {
            displayResult('api-request-result', 
                `API Request Successful!\n\nEndpoint: ${method} ${endpoint}\n\nResponse:\n${formatJSON(response.data)}`,
                'success');
        } else {
            displayResult('api-request-result', 
                `API Request Failed!\n\nEndpoint: ${method} ${endpoint}\n\nError: ${response.error}`,
                'error');
        }
    } else {
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
}

function saveAPIConfig() {
    const env = document.getElementById('api-environment').value;
    const publicKey = document.getElementById('public-api-key').value;
    const privateKey = document.getElementById('private-api-key').value;
    
    CONFIG.currentEnv = env;
    if (publicKey) CONFIG[env].publicKey = publicKey;
    if (privateKey) CONFIG[env].privateKey = privateKey;
    
    localStorage.setItem('affirmConfig', JSON.stringify(CONFIG));
    
    displayResult('api-config-result', 
        `Configuration saved!\n\nEnvironment: ${env}\nPublic Key: ${publicKey ? '***' + publicKey.slice(-4) : 'Not set'}\nPrivate Key: ${privateKey ? '***' + privateKey.slice(-4) : 'Not set'}`,
        'success');
}

function loadAPIConfig() {
    const saved = localStorage.getItem('affirmConfig');
    if (saved) {
        const savedConfig = JSON.parse(saved);
        Object.assign(CONFIG, savedConfig);
        
        document.getElementById('api-environment').value = CONFIG.currentEnv;
        if (CONFIG[CONFIG.currentEnv].publicKey) {
            document.getElementById('public-api-key').value = CONFIG[CONFIG.currentEnv].publicKey;
        }
    }
}

