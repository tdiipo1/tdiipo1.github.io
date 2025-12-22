// Secure Key Management Module
// Uses Web Crypto API for encryption/decryption with passphrase protection

class SecureKeyManager {
    constructor() {
        this.encryptedKeys = null;
        this.decryptedKeys = null; // Only in memory, never persisted
        this.sessionExpiry = null;
        this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        this.encryptionAlgorithm = 'AES-GCM';
        this.keyLength = 256;
    }

    // Derive encryption key from passphrase using PBKDF2
    async deriveKeyFromPassphrase(passphrase, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(passphrase),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000, // High iteration count for security
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: this.encryptionAlgorithm,
                length: this.keyLength
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Generate random salt
    generateSalt() {
        return crypto.getRandomValues(new Uint8Array(16));
    }

    // Encrypt keys with passphrase
    async encryptKeys(publicKey, privateKey, passphrase) {
        try {
            const salt = this.generateSalt();
            const encryptionKey = await this.deriveKeyFromPassphrase(passphrase, salt);
        
            const data = JSON.stringify({
                publicKey: publicKey,
                privateKey: privateKey,
                timestamp: Date.now()
            });

            const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM requires 12-byte IV

            const encrypted = await crypto.subtle.encrypt(
                {
                    name: this.encryptionAlgorithm,
                    iv: iv
                },
                encryptionKey,
                encoder.encode(data)
            );

            // Store salt and IV with encrypted data
            const encryptedData = {
                salt: Array.from(salt),
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encrypted))
            };

            return btoa(JSON.stringify(encryptedData));
        } catch (error) {
            throw new Error('Encryption failed: ' + error.message);
        }
    }

    // Decrypt keys with passphrase
    async decryptKeys(encryptedData, passphrase) {
        try {
            const encrypted = JSON.parse(atob(encryptedData));
            const salt = new Uint8Array(encrypted.salt);
            const iv = new Uint8Array(encrypted.iv);
            const data = new Uint8Array(encrypted.data);

            const decryptionKey = await this.deriveKeyFromPassphrase(passphrase, salt);

            const decrypted = await crypto.subtle.decrypt(
                {
                    name: this.encryptionAlgorithm,
                    iv: iv
                },
                decryptionKey,
                data
            );

            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decrypted));
        } catch (error) {
            throw new Error('Decryption failed. Incorrect passphrase or corrupted data.');
        }
    }

    // Store encrypted keys
    async storeKeys(publicKey, privateKey, passphrase, environment) {
        // Trim passphrase to prevent whitespace-related decryption failures
        passphrase = passphrase.trim();
        if (!passphrase || passphrase.length < 8) {
            throw new Error('Passphrase must be at least 8 characters long');
        }

        const encrypted = await this.encryptKeys(publicKey, privateKey, passphrase);
        
        const storage = {
            encrypted: encrypted,
            environment: environment,
            storedAt: Date.now()
        };

        localStorage.setItem('affirmSecureKeys', JSON.stringify(storage));
        this.encryptedKeys = storage;
        
        // Also store in memory (decrypted) for current session
        await this.loadKeysIntoMemory(passphrase);
        
        return true;
    }

    // Load keys into memory (decrypted)
    async loadKeysIntoMemory(passphrase) {
        // Trim passphrase to prevent whitespace-related decryption failures
        passphrase = passphrase.trim();
        
        if (!this.encryptedKeys) {
            const stored = localStorage.getItem('affirmSecureKeys');
            if (!stored) return false;
            this.encryptedKeys = JSON.parse(stored);
        }

        try {
            const decrypted = await this.decryptKeys(this.encryptedKeys.encrypted, passphrase);
            this.decryptedKeys = decrypted;
            this.sessionExpiry = Date.now() + this.SESSION_TIMEOUT;
            
            // Set up auto-clear on expiry
            this.setupAutoClear();
            
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get decrypted keys (only if session is valid)
    getKeys() {
        if (!this.decryptedKeys) {
            return null;
        }

        if (this.sessionExpiry && Date.now() > this.sessionExpiry) {
            this.clearKeys();
            return null;
        }

        return {
            publicKey: this.decryptedKeys.publicKey,
            privateKey: this.decryptedKeys.privateKey
        };
    }

    // Clear keys from memory
    clearKeys() {
        this.decryptedKeys = null;
        this.sessionExpiry = null;
    }

    // Clear all stored keys
    clearStoredKeys() {
        localStorage.removeItem('affirmSecureKeys');
        this.encryptedKeys = null;
        this.clearKeys();
    }

    // Check if keys are stored
    hasStoredKeys() {
        return localStorage.getItem('affirmSecureKeys') !== null;
    }

    // Check if session is active
    isSessionActive() {
        return this.decryptedKeys !== null && 
               this.sessionExpiry !== null && 
               Date.now() < this.sessionExpiry;
    }

    // Get remaining session time in minutes
    getRemainingSessionTime() {
        if (!this.sessionExpiry) return 0;
        const remaining = this.sessionExpiry - Date.now();
        return Math.max(0, Math.floor(remaining / 60000));
    }

    // Setup auto-clear on expiry
    setupAutoClear() {
        if (this.autoClearTimer) {
            clearTimeout(this.autoClearTimer);
        }

        const remaining = this.sessionExpiry - Date.now();
        if (remaining > 0) {
            this.autoClearTimer = setTimeout(() => {
                this.clearKeys();
                updateAPIModeBanner();
                // Update UI to show unlock section when session expires
                if (typeof updateKeyManagementUI === 'function') {
                    updateKeyManagementUI();
                }
                if (typeof updateSessionStatus === 'function') {
                    updateSessionStatus();
                }
                if (typeof onSessionExpired === 'function') {
                    onSessionExpired();
                }
            }, remaining);
        }
    }

    // Extend session
    extendSession() {
        if (this.isSessionActive()) {
            this.sessionExpiry = Date.now() + this.SESSION_TIMEOUT;
            this.setupAutoClear();
            return true;
        }
        return false;
    }

    // Check if keys need to be unlocked
    needsUnlock() {
        return this.hasStoredKeys() && !this.isSessionActive();
    }
}

// Global instance
const keyManager = new SecureKeyManager();

// Session expiry callback
function onSessionExpired() {
    const banner = document.getElementById('api-mode-banner');
    if (banner) {
        banner.className = 'api-mode-banner mock';
        const text = document.getElementById('api-mode-text');
        if (text) {
            text.textContent = '🔒 Session expired. Keys cleared from memory for security.';
        }
    }
    
    // Show notification
    if (typeof displayResult === 'function') {
        displayResult('api-config-result', 
            '🔒 Session expired. Your keys have been automatically cleared from memory for security.\n\nPlease unlock your keys again to continue using the API.',
            'warning');
    }
}

