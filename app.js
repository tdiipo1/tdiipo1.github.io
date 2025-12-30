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

// Dark mode toggle function
function toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update toggle button icon
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Initialize dark mode from localStorage
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    html.setAttribute('data-theme', savedTheme);
    
    // Update toggle button icon
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Initialize last updated timestamp from GitHub API
async function initializeLastUpdated() {
    const timestampElement = document.getElementById('last-updated-timestamp');
    if (!timestampElement) return;
    
    try {
        // Fetch the last commit date from GitHub API
        const response = await fetch('https://api.github.com/repos/tdiipo1/tdiipo1.github.io/commits?per_page=1', {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const commits = await response.json();
            if (commits && commits.length > 0 && commits[0].commit && commits[0].commit.author) {
                const lastCommitDate = new Date(commits[0].commit.author.date);
                
                // Format: "December 19, 2024 at 10:30 AM PST"
                const options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                };
                const formattedDate = lastCommitDate.toLocaleString('en-US', options);
                timestampElement.textContent = formattedDate;
                return;
            }
        }
    } catch (error) {
        console.warn('Failed to fetch last commit date from GitHub API:', error);
    }
    
    // Fallback: Use a manually set date or show "Unknown"
    // Update this date when you make significant changes
    const fallbackDate = new Date('2024-12-30T08:00:00-08:00');
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    };
    timestampElement.textContent = fallbackDate.toLocaleString('en-US', options) + ' (cached)';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    initializeLastUpdated();
    initializeSecureKeyManager();
    setupSmoothScrolling();
    setupScrollToTop();
    setupSessionTimer();
    // Initialize API Request Builder with prefilled body
    updateAPIRequestBody();
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

// Utility: Copy text to clipboard
function copyToClipboard(text, buttonId) {
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        const button = document.getElementById(buttonId);
        if (button) {
            const originalText = button.textContent;
            button.textContent = '✓ Copied!';
            button.style.background = '#28a745';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '#6c757d';
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            const button = document.getElementById(buttonId);
            if (button) {
                const originalText = button.textContent;
                button.textContent = '✓ Copied!';
                button.style.background = '#28a745';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '#6c757d';
                }, 2000);
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
    });
}

// Utility: Generate idempotency key (must be <= 36 characters per Affirm API)
function generateIdempotencyKey(prefix, identifier) {
    // Format: prefix_timestamp_random
    // Ensure total length <= 36 characters
    const timestamp = Date.now().toString(36); // Base36 encoding for shorter timestamp
    const random = Math.random().toString(36).substr(2, 6); // 6 random chars
    const id = identifier ? identifier.toString().substr(0, 8) : ''; // Max 8 chars from identifier
    
    // Build key: prefix_id_timestamp_random (max 36 chars)
    let key = prefix;
    if (id) {
        key += `_${id}`;
    }
    key += `_${timestamp}_${random}`;
    
    // Ensure it's exactly 36 characters or less
    if (key.length > 36) {
        // If too long, use hash-like approach
        const hash = key.split('').reduce((acc, char) => {
            return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
        }, 0).toString(36);
        key = `${prefix}_${hash}`.substr(0, 36);
    }
    
    return key;
}

// Utility: Make API call
// NOTE: By default, this uses MOCK responses for safety.
// Set CONFIG.useRealAPI = true and unlock encrypted keys to make real API calls.
// Keys are securely encrypted and only decrypted in memory during active session.
// Use CONFIG.corsProxy to bypass CORS restrictions (see README for options).
// idempotencyKey: Optional unique key for idempotent requests (e.g., transaction authorization)
async function makeAPICall(endpoint, method = 'GET', body = null, idempotencyKey = null) {
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
        // Normalize proxy URL: remove trailing slashes, ensure /proxy/ endpoint
        let proxy = CONFIG.corsProxy.trim();
        // Remove trailing slashes
        proxy = proxy.replace(/\/+$/, '');
        // Always remove any existing /proxy segments to handle redundant cases like /proxy/proxy
        // Extract base URL (everything before /proxy)
        const baseUrl = proxy.replace(/\/proxy\/?.*$/, '');
        // Ensure it ends with exactly one /proxy
        proxy = baseUrl + '/proxy';
        // Construct full URL: proxy-url/proxy/https://api.affirm.com/api/v2/endpoint
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
    
    // Add idempotency key header if provided (required for transaction authorization)
    if (idempotencyKey) {
        options.headers['Idempotency-Key'] = idempotencyKey;
    }

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    try {
        // Debug logging (remove in production)
        console.log('Making API call:', {
            method: method,
            url: url,
            endpoint: endpoint,
            hasBody: !!body,
            bodySize: body ? JSON.stringify(body).length : 0
        });
        
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
        '/checkout/direct': {
            checkout_id: 'PO4D77JZ6W5X123T',
            redirect_url: 'https://sandbox.affirm.com/products/checkout?public_api_key=TEST&checkout_ari=PO4D77JZ6W5X123T',
            _note: 'This is a MOCK response. Enable real API calls in configuration to make actual requests.'
        },
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

// Toggle function for showing all fields
function toggleAllFields() {
    const toggle = document.getElementById('show-all-fields-toggle');
    const section = document.getElementById('all-fields-section');
    if (toggle && section) {
        section.style.display = toggle.checked ? 'block' : 'none';
    }
}

// Direct API Tests
async function testCheckoutInit() {
    const amount = parseFloat(document.getElementById('checkout-amount').value);
    const merchantName = document.getElementById('merchant-name').value;
    const checkoutType = document.getElementById('checkout-type').value;
    
    // Get public key from secure key manager
    const keys = keyManager.getKeys();
    const publicKey = keys ? keys.publicKey : 'YOUR_PUBLIC_KEY';
    
    // Generate a unique order ID for testing
    const orderId = document.getElementById('checkout-order-id')?.value || 'TEST_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Convert amounts to cents (integers) - Affirm API requires amounts in smallest currency unit
    const amountCents = Math.round(amount * 100);
    const taxAmountCents = Math.round(parseFloat(document.getElementById('checkout-tax-amount')?.value || (amount * 0.1)) * 100);
    
    // Get shipping info from form or use defaults
    const shippingFirstName = document.getElementById('shipping-first-name')?.value || 'AITS';
    const shippingLastName = document.getElementById('shipping-last-name')?.value || 'User';
    const shippingFullName = `${shippingFirstName} ${shippingLastName}`;
    const shippingLine1 = document.getElementById('shipping-line1')?.value || '123 Test St';
    const shippingLine2 = document.getElementById('shipping-line2')?.value || 'Apt 123';
    const shippingCity = document.getElementById('shipping-city')?.value || 'San Francisco';
    const shippingState = document.getElementById('shipping-state')?.value || 'CA';
    const shippingZipcode = document.getElementById('shipping-zipcode')?.value || '94105';
    const shippingCountry = document.getElementById('shipping-country')?.value || 'USA';
    
    // Get billing info from form or use defaults
    const billingFirstName = document.getElementById('billing-first-name')?.value || 'AITS';
    const billingLastName = document.getElementById('billing-last-name')?.value || 'User';
    const billingLine1 = document.getElementById('billing-line1')?.value || '123 Test St';
    const billingLine2 = document.getElementById('billing-line2')?.value || 'Apt 123';
    const billingCity = document.getElementById('billing-city')?.value || 'San Francisco';
    const billingState = document.getElementById('billing-state')?.value || 'CA';
    const billingZipcode = document.getElementById('billing-zipcode')?.value || '94105';
    const billingCountry = document.getElementById('billing-country')?.value || 'USA';
    
    // Build merchant object with optional fields
    const merchantObj = {
        public_api_key: publicKey,  // Required: public API key must be in request body
        user_confirmation_url: 'https://tdiipo1.github.io/confirm.html',
        user_cancel_url: 'https://tdiipo1.github.io/cancel'
    };
    
    // Add optional merchant fields if provided
    const merchantNameField = document.getElementById('merchant-name-field')?.value?.trim();
    if (merchantNameField) merchantObj.name = merchantNameField;
    
    const confirmationAction = document.getElementById('merchant-confirmation-action')?.value?.trim();
    if (confirmationAction) merchantObj.user_confirmation_url_action = confirmationAction;
    
    const useVcn = document.getElementById('merchant-use-vcn')?.value;
    if (useVcn !== undefined) merchantObj.use_vcn = useVcn === 'true';
    
    // Build shipping object with optional contact info
    const shippingObj = {
        name: {
            first: shippingFirstName,
            last: shippingLastName,
            full: shippingFullName
        },
        address: {
            line1: shippingLine1,
            line2: shippingLine2,
            city: shippingCity,
            state: shippingState,
            zipcode: shippingZipcode,
            country: shippingCountry
        }
    };
    
    const shippingPhone = document.getElementById('shipping-phone')?.value?.trim();
    if (shippingPhone) shippingObj.phone_number = shippingPhone;
    
    const shippingEmail = document.getElementById('shipping-email')?.value?.trim();
    if (shippingEmail) shippingObj.email = shippingEmail;
    
    // Build billing object with optional contact info
    const billingObj = {
        name: {
            first: billingFirstName,
            last: billingLastName
        },
        address: {
            line1: billingLine1,
            line2: billingLine2,
            city: billingCity,
            state: billingState,
            zipcode: billingZipcode,
            country: billingCountry
        }
    };
    
    const billingPhone = document.getElementById('billing-phone')?.value?.trim();
    if (billingPhone) billingObj.phone_number = billingPhone;
    
    const billingEmail = document.getElementById('billing-email')?.value?.trim();
    if (billingEmail) billingObj.email = billingEmail;
    
    // Build checkout data object
    const checkoutData = {
        merchant: merchantObj,
        items: [{
            display_name: document.getElementById('checkout-item-name')?.value || 'Test Item',
            sku: document.getElementById('checkout-item-sku')?.value || 'TEST-001',
            unit_price: amountCents,  // Convert to cents
            qty: parseInt(document.getElementById('checkout-item-qty')?.value || '1'),
            item_image_url: document.getElementById('checkout-item-image-url')?.value || '',
            item_url: document.getElementById('checkout-item-url')?.value || window.location.href
        }],
        shipping: shippingObj,
        billing: billingObj,
        total: amountCents,  // Convert to cents
        tax_amount: taxAmountCents,  // Convert to cents
        order_id: orderId
    };
    
    // Add currency (required field)
    const currency = document.getElementById('checkout-currency')?.value || 'USD';
    checkoutData.currency = currency;
    
    // Add shipping_amount if provided
    const shippingAmount = document.getElementById('checkout-shipping-amount')?.value;
    if (shippingAmount && parseFloat(shippingAmount) > 0) {
        checkoutData.shipping_amount = Math.round(parseFloat(shippingAmount) * 100); // Convert to cents
    }
    
    // Add financing_program if provided
    const financingProgram = document.getElementById('financing-program')?.value?.trim();
    if (financingProgram) checkoutData.financing_program = financingProgram;
    
    // Add expiration timestamps if provided
    const checkoutExpiration = document.getElementById('checkout-expiration')?.value;
    if (checkoutExpiration) {
        // Convert datetime-local to ISO timestamp (no milliseconds)
        const expirationDate = new Date(checkoutExpiration);
        checkoutData.checkout_expiration = expirationDate.toISOString().replace(/\.\d{3}Z$/, '');
    }
    
    const expirationTime = document.getElementById('expiration-time')?.value;
    if (expirationTime) {
        // Convert datetime-local to ISO timestamp
        const expirationDate = new Date(expirationTime);
        checkoutData.expiration_time = expirationDate.toISOString().replace(/\.\d{3}Z$/, '');
    }
    
    // Add store information if provided (for in-store transactions)
    const storeName = document.getElementById('store-name')?.value?.trim();
    const storeLine1 = document.getElementById('store-line1')?.value?.trim();
    if (storeName || storeLine1) {
        checkoutData.store = {};
        if (storeName) checkoutData.store.name = storeName;
        if (storeLine1) {
            checkoutData.store.address = {
                line1: storeLine1
            };
            const storeLine2 = document.getElementById('store-line2')?.value?.trim();
            if (storeLine2) checkoutData.store.address.line2 = storeLine2;
            
            const storeCity = document.getElementById('store-city')?.value?.trim();
            if (storeCity) checkoutData.store.address.city = storeCity;
            
            const storeState = document.getElementById('store-state')?.value?.trim();
            if (storeState) checkoutData.store.address.state = storeState;
            
            const storeZipcode = document.getElementById('store-zipcode')?.value?.trim();
            if (storeZipcode) checkoutData.store.address.zipcode = storeZipcode;
            
            const storeCountry = document.getElementById('store-country')?.value?.trim();
            if (storeCountry) checkoutData.store.address.country = storeCountry;
        }
    }
    
    // Add discounts if provided (parse JSON)
    const discountsJson = document.getElementById('checkout-discounts')?.value?.trim();
    if (discountsJson) {
        try {
            const discounts = JSON.parse(discountsJson);
            if (typeof discounts === 'object' && discounts !== null) {
                checkoutData.discounts = discounts;
            }
        } catch (e) {
            console.warn('Invalid discounts JSON, skipping:', e);
        }
    }
    
    // Add metadata if provided (parse JSON)
    const metadataJson = document.getElementById('checkout-metadata')?.value?.trim();
    if (metadataJson) {
        try {
            const metadata = JSON.parse(metadataJson);
            if (typeof metadata === 'object' && metadata !== null) {
                checkoutData.metadata = metadata;
            }
        } catch (e) {
            console.warn('Invalid metadata JSON, skipping:', e);
        }
    }

    // Use the correct endpoint: /api/v2/checkout/direct (not /checkouts)
    console.log('Checkout Data:', checkoutData);
    console.log('Endpoint: /checkout/direct');
    
    const response = await makeAPICall('/checkout/direct', 'POST', checkoutData);
    
    if (response.success) {
        const checkoutId = response.data.checkout_id || 'N/A';
        const redirectUrl = response.data.redirect_url || '';
        
        // Auto-populate checkout token field for authorization
        const checkoutTokenField = document.getElementById('checkout-token');
        if (checkoutTokenField && checkoutId !== 'N/A') {
            checkoutTokenField.value = checkoutId;
        }
        
        // Auto-populate order ID field for authorization if it's empty
        const orderIdField = document.getElementById('order-id');
        if (orderIdField && !orderIdField.value && orderId) {
            orderIdField.value = orderId;
        }
        
        // Create HTML with clickable redirect URL that opens in popup
        let resultHtml = `Checkout initialized successfully!<br><br>`;
        resultHtml += `<strong>Order ID:</strong> <span id="order-id-display">${orderId}</span> `;
        resultHtml += `<button onclick="copyToClipboard('${orderId}', 'order-id-copy-btn')" id="order-id-copy-btn" style="padding: 4px 8px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em; margin-left: 5px;" title="Copy Order ID">📋 Copy</button><br>`;
        resultHtml += `<strong>Checkout ID:</strong> <span id="checkout-id-display">${checkoutId}</span> `;
        resultHtml += `<button onclick="copyToClipboard('${checkoutId}', 'checkout-id-copy-btn')" id="checkout-id-copy-btn" style="padding: 4px 8px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em; margin-left: 5px;" title="Copy Checkout ID">📋 Copy</button><br><br>`;
        
        if (redirectUrl) {
            resultHtml += `<strong>Redirect URL:</strong> <a href="${redirectUrl}" target="_blank" onclick="window.open('${redirectUrl}', 'AffirmCheckout', 'width=800,height=600,scrollbars=yes,resizable=yes'); return false;" style="color: var(--accent-color); text-decoration: underline; word-break: break-all;">${redirectUrl}</a> `;
            resultHtml += `<button onclick="window.open('${redirectUrl}', 'AffirmCheckout', 'width=800,height=600,scrollbars=yes,resizable=yes')" style="margin-left: 10px; padding: 4px 12px; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">Open in Popup</button><br><br>`;
            
            // Auto-open popup window
            setTimeout(() => {
                window.open(redirectUrl, 'AffirmCheckout', 'width=800,height=600,scrollbars=yes,resizable=yes');
            }, 500); // Small delay to ensure page is ready
        }
        
        resultHtml += `<pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;">${formatJSON(response.data)}</pre><br>`;
        resultHtml += `✅ Checkout ID has been auto-populated in the Transaction Authorization section<br><br>`;
        resultHtml += `<strong>Next steps:</strong><br>`;
        resultHtml += `1. Go to "Transaction Authorization" section<br>`;
        resultHtml += `2. Click "AUTHORIZE TRANSACTION" (checkout_id is already filled)<br>`;
        resultHtml += `3. After authorization, use the returned transaction_id for capture/void/refund operations`;
        
        // Use innerHTML instead of textContent for HTML rendering
        const resultDiv = document.getElementById('checkout-init-result');
        if (resultDiv) {
            resultDiv.innerHTML = resultHtml;
            resultDiv.className = 'test-result show success';
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    } else {
        displayResult('checkout-init-result', 
            `Error: ${response.error}\n\nDebug Info:\n- Endpoint used: /checkout/direct\n- Check browser console for detailed request info`,
            'error');
    }
}

async function testTransactionAuth() {
    const checkoutToken = document.getElementById('checkout-token').value;
    const orderId = document.getElementById('order-id').value;
    
    if (!checkoutToken) {
        displayResult('transaction-auth-result', 'Error: Checkout token is required', 'error');
        return;
    }

    // According to Affirm docs: https://docs.affirm.com/developers/reference/authorize_transaction
    // The request body requires:
    // - transaction_id: The checkout token from the checkout initialization step
    // - order_id: The merchant's order identifier
    // The Idempotency-Key header is required to prevent duplicate transactions
    const finalOrderId = orderId || 'ORDER_' + Date.now();
    const authData = {
        transaction_id: checkoutToken,  // Note: checkout_token from checkout becomes transaction_id here
        order_id: finalOrderId
    };
    
    // Generate a unique idempotency key for this authorization request (<= 36 chars)
    const idempotencyKey = generateIdempotencyKey('auth', finalOrderId);

    // According to Affirm docs: https://docs.affirm.com/developers/reference/authorize_transaction
    // The endpoint is /api/v1/transactions (not /api/v2)
    // We need to use the v1 endpoint specifically for transaction authorization
    const baseUrl = CONFIG.currentEnv === 'sandbox' 
        ? 'https://sandbox.affirm.com/api/v1'
        : 'https://api.affirm.com/api/v1';
    const url = `${baseUrl}/transactions`;
    
    // Apply CORS proxy if configured
    let finalUrl = url;
    if (CONFIG.corsProxy) {
        let proxy = CONFIG.corsProxy.trim();
        proxy = proxy.replace(/\/+$/, '');
        const proxyBaseUrl = proxy.replace(/\/proxy\/?.*$/, '');
        proxy = proxyBaseUrl + '/proxy';
        finalUrl = `${proxy}/${url}`;
    }
    
    // Get decrypted keys from secure key manager
    const keys = keyManager.getKeys();
    if (!keys || !keys.publicKey || !keys.privateKey) {
        displayResult('transaction-auth-result', 
            'Error: API credentials not available. Please unlock your encrypted keys using your passphrase in the Secure Key Management section.',
            'error');
        return;
    }
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${btoa(keys.publicKey + ':' + keys.privateKey)}`,
            'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(authData)
    };
    
    try {
        const response = await fetch(finalUrl, options);
        
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }
        
        if (response.ok) {
            // Extract transaction_id from response (could be data.id or data.transaction_id)
            const transactionId = data.id || data.transaction_id || checkoutToken;
            
            // Auto-populate transaction_id fields for capture, void, refund, update operations
            const captureField = document.getElementById('capture-transaction-id');
            const voidField = document.getElementById('void-transaction-id');
            const refundField = document.getElementById('refund-transaction-id');
            const updateField = document.getElementById('update-transaction-id');
            const splitField = document.getElementById('split-transaction-id');
            
            if (captureField) captureField.value = transactionId;
            if (voidField) voidField.value = transactionId;
            if (refundField) refundField.value = transactionId;
            if (updateField) updateField.value = transactionId;
            if (splitField) splitField.value = transactionId;
            
            displayResult('transaction-auth-result', 
                `Transaction authorized successfully!\n\nOrder ID: ${finalOrderId}\nTransaction ID: ${transactionId}\n\n${formatJSON(data)}\n\n✅ Transaction ID has been auto-populated in Capture, Void, Refund, and Update fields`,
                'success');
        } else {
            displayResult('transaction-auth-result', 
                `Error: API Error (${response.status}): ${data.message || data.error || JSON.stringify(data)}\n\nDebug Info:\n- Endpoint used: ${url}\n- Order ID: ${finalOrderId}\n- Idempotency Key: ${idempotencyKey.substring(0, 30)}...\n- Transaction ID (from checkout): ${checkoutToken.substring(0, 10)}...\n- Check browser console for detailed request info`,
                'error');
        }
    } catch (error) {
        displayResult('transaction-auth-result', 
            `Error: Network Error - ${error.message}\n\nDebug Info:\n- Endpoint used: ${url}\n- Order ID: ${finalOrderId}\n- Check browser console for detailed error info`,
            'error');
    }
}

async function testTransactionCapture() {
    const transactionId = document.getElementById('capture-transaction-id').value;
    const amount = parseFloat(document.getElementById('capture-amount').value);
    
    if (!transactionId) {
        displayResult('transaction-capture-result', 'Error: Transaction ID is required', 'error');
        return;
    }

    // According to Affirm docs: https://docs.affirm.com/developers/reference/capture_transaction
    // Amount must be in cents (integer), and endpoint uses /api/v1
    const captureData = amount > 0 ? { amount: Math.round(amount * 100) } : {};
    
    // Use v1 API for transaction operations
    const baseUrl = CONFIG.currentEnv === 'sandbox' 
        ? 'https://sandbox.affirm.com/api/v1'
        : 'https://api.affirm.com/api/v1';
    const url = `${baseUrl}/transactions/${transactionId}/capture`;
    
    // Generate idempotency key for capture (<= 36 chars)
    const idempotencyKey = generateIdempotencyKey('capt', transactionId);
    
    // Apply CORS proxy if configured
    let finalUrl = url;
    if (CONFIG.corsProxy) {
        let proxy = CONFIG.corsProxy.trim();
        proxy = proxy.replace(/\/+$/, '');
        const proxyBaseUrl = proxy.replace(/\/proxy\/?.*$/, '');
        proxy = proxyBaseUrl + '/proxy';
        finalUrl = `${proxy}/${url}`;
    }
    
    // Get decrypted keys
    const keys = keyManager.getKeys();
    if (!keys || !keys.publicKey || !keys.privateKey) {
        displayResult('transaction-capture-result', 
            'Error: API credentials not available. Please unlock your encrypted keys.',
            'error');
        return;
    }
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${btoa(keys.publicKey + ':' + keys.privateKey)}`,
            'Idempotency-Key': idempotencyKey
        },
        body: Object.keys(captureData).length > 0 ? JSON.stringify(captureData) : undefined
    };
    
    try {
        const response = await fetch(finalUrl, options);
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }
        
        if (response.ok) {
            displayResult('transaction-capture-result', 
                `Transaction captured successfully!\n\n${formatJSON(data)}`,
                'success');
        } else {
            displayResult('transaction-capture-result', 
                `Error: API Error (${response.status}): ${data.message || data.error || JSON.stringify(data)}`,
                'error');
        }
    } catch (error) {
        displayResult('transaction-capture-result', 
            `Error: Network Error - ${error.message}`,
            'error');
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

    // According to Affirm docs: https://docs.affirm.com/developers/reference/void_transaction
    // Endpoint uses /api/v1
    const baseUrl = CONFIG.currentEnv === 'sandbox' 
        ? 'https://sandbox.affirm.com/api/v1'
        : 'https://api.affirm.com/api/v1';
    const url = `${baseUrl}/transactions/${transactionId}/void`;
    
    // Generate idempotency key for void (<= 36 chars)
    const idempotencyKey = generateIdempotencyKey('void', transactionId);
    
    // Apply CORS proxy if configured
    let finalUrl = url;
    if (CONFIG.corsProxy) {
        let proxy = CONFIG.corsProxy.trim();
        proxy = proxy.replace(/\/+$/, '');
        const proxyBaseUrl = proxy.replace(/\/proxy\/?.*$/, '');
        proxy = proxyBaseUrl + '/proxy';
        finalUrl = `${proxy}/${url}`;
    }
    
    // Get decrypted keys
    const keys = keyManager.getKeys();
    if (!keys || !keys.publicKey || !keys.privateKey) {
        displayResult('transaction-void-result', 
            'Error: API credentials not available. Please unlock your encrypted keys.',
            'error');
        return;
    }
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${btoa(keys.publicKey + ':' + keys.privateKey)}`,
            'Idempotency-Key': idempotencyKey
        }
    };
    
    try {
        const response = await fetch(finalUrl, options);
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }
        
        if (response.ok) {
            displayResult('transaction-void-result', 
                `Transaction voided successfully!\n\n${formatJSON(data)}`,
                'success');
        } else {
            displayResult('transaction-void-result', 
                `Error: API Error (${response.status}): ${data.message || data.error || JSON.stringify(data)}`,
                'error');
        }
    } catch (error) {
        displayResult('transaction-void-result', 
            `Error: Network Error - ${error.message}`,
            'error');
    }
}

async function testTransactionRefund() {
    const transactionId = document.getElementById('refund-transaction-id').value;
    const amount = parseFloat(document.getElementById('refund-amount').value);
    
    if (!transactionId) {
        displayResult('transaction-refund-result', 'Error: Transaction ID is required', 'error');
        return;
    }

    // According to Affirm docs: https://docs.affirm.com/developers/reference/refund_transaction
    // Amount must be in cents (integer), and endpoint uses /api/v1
    const refundData = amount > 0 ? { amount: Math.round(amount * 100) } : {};
    
    // Use v1 API for transaction operations
    const baseUrl = CONFIG.currentEnv === 'sandbox' 
        ? 'https://sandbox.affirm.com/api/v1'
        : 'https://api.affirm.com/api/v1';
    const url = `${baseUrl}/transactions/${transactionId}/refund`;
    
    // Generate idempotency key for refund (<= 36 chars)
    const idempotencyKey = generateIdempotencyKey('ref', transactionId);
    
    // Apply CORS proxy if configured
    let finalUrl = url;
    if (CONFIG.corsProxy) {
        let proxy = CONFIG.corsProxy.trim();
        proxy = proxy.replace(/\/+$/, '');
        const proxyBaseUrl = proxy.replace(/\/proxy\/?.*$/, '');
        proxy = proxyBaseUrl + '/proxy';
        finalUrl = `${proxy}/${url}`;
    }
    
    // Get decrypted keys
    const keys = keyManager.getKeys();
    if (!keys || !keys.publicKey || !keys.privateKey) {
        displayResult('transaction-refund-result', 
            'Error: API credentials not available. Please unlock your encrypted keys.',
            'error');
        return;
    }
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${btoa(keys.publicKey + ':' + keys.privateKey)}`,
            'Idempotency-Key': idempotencyKey
        },
        body: Object.keys(refundData).length > 0 ? JSON.stringify(refundData) : undefined
    };
    
    try {
        const response = await fetch(finalUrl, options);
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }
        
        if (response.ok) {
            displayResult('transaction-refund-result', 
                `Refund processed successfully!\n\n${formatJSON(data)}`,
                'success');
        } else {
            displayResult('transaction-refund-result', 
                `Error: API Error (${response.status}): ${data.message || data.error || JSON.stringify(data)}`,
                'error');
        }
    } catch (error) {
        displayResult('transaction-refund-result', 
            `Error: Network Error - ${error.message}`,
            'error');
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

    // Generate idempotency key for card finalization (<= 36 chars)
    const idempotencyKey = generateIdempotencyKey('fin', cardId);
    
    // Cards API uses /api/v2, makeAPICall will handle it correctly
    const response = await makeAPICall(`/cards/${cardId}/finalize`, 'POST', null, idempotencyKey);
    
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

    // Generate idempotency key for card cancellation (<= 36 chars)
    const idempotencyKey = generateIdempotencyKey('can', cardId);
    
    // Cards API uses /api/v2, makeAPICall will handle it correctly
    const response = await makeAPICall(`/cards/${cardId}/cancel`, 'POST', null, idempotencyKey);
    
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

    // According to Affirm docs: https://docs.affirm.com/developers/reference/read_transaction
    // Endpoint uses /api/v1
    const baseUrl = CONFIG.currentEnv === 'sandbox' 
        ? 'https://sandbox.affirm.com/api/v1'
        : 'https://api.affirm.com/api/v1';
    const url = `${baseUrl}/transactions/${transactionId}`;
    
    // Apply CORS proxy if configured
    let finalUrl = url;
    if (CONFIG.corsProxy) {
        let proxy = CONFIG.corsProxy.trim();
        proxy = proxy.replace(/\/+$/, '');
        const proxyBaseUrl = proxy.replace(/\/proxy\/?.*$/, '');
        proxy = proxyBaseUrl + '/proxy';
        finalUrl = `${proxy}/${url}`;
    }
    
    // Get decrypted keys
    const keys = keyManager.getKeys();
    if (!keys || !keys.publicKey || !keys.privateKey) {
        displayResult('transaction-state-result', 
            'Error: API credentials not available. Please unlock your encrypted keys.',
            'error');
        return;
    }
    
    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${btoa(keys.publicKey + ':' + keys.privateKey)}`
        }
    };
    
    try {
        const response = await fetch(finalUrl, options);
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }
        
        if (response.ok) {
            displayResult('transaction-state-result', formatJSON(data), 'success');
        } else {
            displayResult('transaction-state-result', 
                `Error: API Error (${response.status}): ${data.message || data.error || JSON.stringify(data)}`,
                'error');
        }
    } catch (error) {
        displayResult('transaction-state-result', 
            `Error: Network Error - ${error.message}`,
            'error');
    }
}

async function testUpdateTransaction() {
    const transactionId = document.getElementById('update-transaction-id').value;
    const orderId = document.getElementById('update-order-id').value;
    
    if (!transactionId) {
        displayResult('update-transaction-result', 'Error: Transaction ID is required', 'error');
        return;
    }

    // According to Affirm docs: https://docs.affirm.com/developers/reference/update_transaction
    // Endpoint uses /api/v1 and method is POST (not PATCH)
    const updateData = orderId ? { order_id: orderId } : {};
    
    const baseUrl = CONFIG.currentEnv === 'sandbox' 
        ? 'https://sandbox.affirm.com/api/v1'
        : 'https://api.affirm.com/api/v1';
    const url = `${baseUrl}/transactions/${transactionId}`;
    
    // Generate idempotency key for update (<= 36 chars)
    const idempotencyKey = generateIdempotencyKey('upd', transactionId);
    
    // Apply CORS proxy if configured
    let finalUrl = url;
    if (CONFIG.corsProxy) {
        let proxy = CONFIG.corsProxy.trim();
        proxy = proxy.replace(/\/+$/, '');
        const proxyBaseUrl = proxy.replace(/\/proxy\/?.*$/, '');
        proxy = proxyBaseUrl + '/proxy';
        finalUrl = `${proxy}/${url}`;
    }
    
    // Get decrypted keys
    const keys = keyManager.getKeys();
    if (!keys || !keys.publicKey || !keys.privateKey) {
        displayResult('update-transaction-result', 
            'Error: API credentials not available. Please unlock your encrypted keys.',
            'error');
        return;
    }
    
    const options = {
        method: 'POST',  // Affirm uses POST for updates, not PATCH
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${btoa(keys.publicKey + ':' + keys.privateKey)}`,
            'Idempotency-Key': idempotencyKey
        },
        body: Object.keys(updateData).length > 0 ? JSON.stringify(updateData) : undefined
    };
    
    try {
        const response = await fetch(finalUrl, options);
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }
        
        if (response.ok) {
            displayResult('update-transaction-result', 
                `Transaction updated successfully!\n\n${formatJSON(data)}`,
                'success');
        } else {
            displayResult('update-transaction-result', 
                `Error: API Error (${response.status}): ${data.message || data.error || JSON.stringify(data)}`,
                'error');
        }
    } catch (error) {
        displayResult('update-transaction-result', 
            `Error: Network Error - ${error.message}`,
            'error');
    }
}

async function testReadTransaction() {
    const transactionId = document.getElementById('read-transaction-id').value;
    
    if (!transactionId) {
        displayResult('read-transaction-result', 'Error: Transaction ID is required', 'error');
        return;
    }

    // According to Affirm docs: https://docs.affirm.com/developers/reference/read_transaction
    // Endpoint uses /api/v1
    const baseUrl = CONFIG.currentEnv === 'sandbox' 
        ? 'https://sandbox.affirm.com/api/v1'
        : 'https://api.affirm.com/api/v1';
    const url = `${baseUrl}/transactions/${transactionId}`;
    
    // Apply CORS proxy if configured
    let finalUrl = url;
    if (CONFIG.corsProxy) {
        let proxy = CONFIG.corsProxy.trim();
        proxy = proxy.replace(/\/+$/, '');
        const proxyBaseUrl = proxy.replace(/\/proxy\/?.*$/, '');
        proxy = proxyBaseUrl + '/proxy';
        finalUrl = `${proxy}/${url}`;
    }
    
    // Get decrypted keys
    const keys = keyManager.getKeys();
    if (!keys || !keys.publicKey || !keys.privateKey) {
        displayResult('read-transaction-result', 
            'Error: API credentials not available. Please unlock your encrypted keys.',
            'error');
        return;
    }
    
    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${btoa(keys.publicKey + ':' + keys.privateKey)}`
        }
    };
    
    try {
        const response = await fetch(finalUrl, options);
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }
        
        if (response.ok) {
            displayResult('read-transaction-result', formatJSON(data), 'success');
        } else {
            displayResult('read-transaction-result', 
                `Error: API Error (${response.status}): ${data.message || data.error || JSON.stringify(data)}`,
                'error');
        }
    } catch (error) {
        displayResult('read-transaction-result', 
            `Error: Network Error - ${error.message}`,
            'error');
    }
}

// API Testing Tools
// Function to update request body based on selected endpoint
function updateAPIRequestBody() {
    const endpoint = document.getElementById('api-endpoint').value;
    const method = document.getElementById('api-method').value;
    const bodyTextarea = document.getElementById('api-body');
    
    // Get keys if available
    const keys = keyManager.getKeys();
    const publicKey = keys ? keys.publicKey : 'YOUR_PUBLIC_KEY';
    
    // Generate sample data
    const orderId = 'TEST_' + Date.now();
    const amountCents = 19999; // $199.99 in cents
    const taxAmountCents = 1999; // $19.99 in cents
    
    let bodyTemplate = {};
    
    // Set method based on endpoint if it's a POST endpoint
    if (endpoint === '/checkout/direct' || endpoint === '/transactions' || 
        endpoint.includes('/capture') || endpoint.includes('/void') || 
        endpoint.includes('/refund') || endpoint.includes('/finalize') || 
        endpoint.includes('/cancel')) {
        document.getElementById('api-method').value = 'POST';
    } else if (endpoint.includes('/{id}') && !endpoint.includes('/capture') && 
               !endpoint.includes('/void') && !endpoint.includes('/refund') && 
               !endpoint.includes('/finalize') && !endpoint.includes('/cancel')) {
        document.getElementById('api-method').value = 'GET';
    }
    
    // Generate body template based on endpoint
    if (endpoint === '/checkout/direct') {
        bodyTemplate = {
            merchant: {
                public_api_key: publicKey,
                user_confirmation_url: 'https://tdiipo1.github.io/confirm.html',
                user_cancel_url: 'https://tdiipo1.github.io/cancel'
            },
            items: [{
                display_name: 'Test Item',
                sku: 'TEST-001',
                unit_price: amountCents,
                qty: 1,
                item_image_url: '',
                item_url: window.location.href
            }],
            shipping: {
                name: {
                    first: 'AITS',
                    last: 'User',
                    full: 'AITS User'
                },
                address: {
                    line1: '123 Test St',
                    line2: 'Apt 123',
                    city: 'San Francisco',
                    state: 'CA',
                    zipcode: '94105',
                    country: 'USA'
                }
            },
            billing: {
                name: {
                    first: 'AITS',
                    last: 'User'
                },
                address: {
                    line1: '123 Test St',
                    line2: 'Apt 123',
                    city: 'San Francisco',
                    state: 'CA',
                    zipcode: '94105',
                    country: 'USA'
                }
            },
            total: amountCents,
            tax_amount: taxAmountCents,
            order_id: orderId
        };
    } else if (endpoint === '/transactions') {
        // According to Affirm docs: https://docs.affirm.com/developers/reference/authorize_transaction
        // The request body requires transaction_id (the checkout token) and order_id
        bodyTemplate = {
            transaction_id: 'CHECKOUT_TOKEN_HERE',
            order_id: orderId
        };
    } else if (endpoint.includes('/capture')) {
        // According to Affirm docs: https://docs.affirm.com/developers/reference/capture_transaction
        // Amount must be in cents (integer), optional field
        bodyTemplate = {
            amount: amountCents  // Optional: omit for full capture
        };
    } else if (endpoint.includes('/refund')) {
        // According to Affirm docs: https://docs.affirm.com/developers/reference/refund_transaction
        // Amount must be in cents (integer), optional field
        bodyTemplate = {
            amount: amountCents  // Optional: omit for full refund
        };
    } else if (endpoint.includes('/void')) {
        // According to Affirm docs: https://docs.affirm.com/developers/reference/void_transaction
        // No body required for void
        bodyTemplate = {};
    } else if (endpoint.includes('/finalize')) {
        // According to Affirm docs: https://docs.affirm.com/developers/reference/finalize_card
        // Cards API may have different requirements - check documentation
        bodyTemplate = {};
    } else if (endpoint.includes('/cancel')) {
        // According to Affirm docs: https://docs.affirm.com/developers/reference/cancel_card
        // Cards API may have different requirements - check documentation
        bodyTemplate = {};
    }
    
    // Only update body if method requires a body (POST, PUT, PATCH)
    if (['POST', 'PUT', 'PATCH'].includes(method) && Object.keys(bodyTemplate).length > 0) {
        bodyTextarea.value = JSON.stringify(bodyTemplate, null, 2);
    } else {
        bodyTextarea.value = '';
    }
}

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
function showProxyInstructions(section) {
    // Toggle only the relevant instruction element based on context
    let instructions;
    if (section === 'unlock') {
        instructions = document.getElementById('proxy-instructions-unlock');
    } else {
        instructions = document.getElementById('proxy-instructions');
    }
    
    if (instructions) {
        if (instructions.style.display === 'none' || !instructions.style.display) {
            instructions.style.display = 'block';
        } else {
            instructions.style.display = 'none';
        }
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
    // Get proxy URL from input or use default
    const proxyInput = document.getElementById('cors-proxy');
    let proxyUrl = (proxyInput ? proxyInput.value.trim() : '') || 'http://localhost:3000';
    
    // Remove /proxy suffix if present to get base URL
    proxyUrl = proxyUrl.replace(/\/proxy\/?$/, '');
    const healthUrl = proxyUrl + '/health';
    
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

