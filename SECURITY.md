# Security Implementation Details

## Secure Key Management System

This document explains the security measures implemented in the Affirm Integration Testing Suite.

## Encryption Architecture

### Algorithm: AES-256-GCM
- **Standard**: Advanced Encryption Standard (AES) with 256-bit keys
- **Mode**: Galois/Counter Mode (GCM) - provides authenticated encryption
- **Why GCM**: Provides both confidentiality and authenticity, preventing tampering

### Key Derivation: PBKDF2
- **Function**: PBKDF2 (Password-Based Key Derivation Function 2)
- **Hash**: SHA-256
- **Iterations**: 100,000 (high iteration count for security)
- **Salt**: 16-byte random salt (unique per encryption)
- **Purpose**: Converts your passphrase into a strong encryption key

### Initialization Vector (IV)
- **Size**: 12 bytes (required for GCM mode)
- **Generation**: Cryptographically secure random values
- **Uniqueness**: New IV generated for each encryption operation

## Security Features

### 1. Encryption at Rest
- Keys are **never stored in plain text**
- Only encrypted data is persisted to localStorage
- Encrypted data includes: salt, IV, and encrypted key data

### 2. Memory-Only Decryption
- Decrypted keys exist **only in browser memory**
- Keys are **never written to disk** in decrypted form
- Page refresh automatically clears decrypted keys

### 3. Session Management
- **Default Session**: 30 minutes of inactivity
- **Auto-Expiration**: Keys automatically cleared from memory
- **Session Extension**: Manual extension available
- **Timer-Based Clearing**: Automatic cleanup on expiry

### 4. Passphrase Protection
- **Minimum Length**: 8 characters (enforced)
- **Recommendation**: 12+ characters with mixed case, numbers, symbols
- **Storage**: Passphrase is **never stored** - you must remember it
- **Verification**: Incorrect passphrase results in decryption failure

### 5. Input Field Security
- Keys cleared from input fields immediately after encryption
- Passphrase fields use `autocomplete="off"` to prevent browser storage
- No key data persists in form fields

## Data Flow

### Storing Keys
```
User Input (Public Key + Private Key + Passphrase)
    ↓
Generate Random Salt (16 bytes)
    ↓
Derive Encryption Key (PBKDF2: 100k iterations, SHA-256)
    ↓
Generate Random IV (12 bytes)
    ↓
Encrypt Keys (AES-256-GCM)
    ↓
Store: {salt, iv, encrypted_data} → localStorage (encrypted)
    ↓
Clear: Original keys removed from memory
```

### Unlocking Keys
```
User Input (Passphrase)
    ↓
Retrieve Encrypted Data from localStorage
    ↓
Extract Salt and IV
    ↓
Derive Decryption Key (PBKDF2 with same parameters)
    ↓
Decrypt Keys (AES-256-GCM)
    ↓
Store in Memory (decrypted, temporary)
    ↓
Set Session Expiry (30 minutes)
```

### Using Keys for API Calls
```
API Call Request
    ↓
Check: Session Active?
    ↓
Retrieve Decrypted Keys from Memory
    ↓
Create Authorization Header (Base64 encoded)
    ↓
Make API Request
    ↓
Keys remain in memory (not exposed in localStorage)
```

## Security Considerations

### What This System Protects Against

✅ **LocalStorage Theft**: Encrypted data is useless without passphrase
✅ **Memory Dumps**: Keys auto-expire, reducing exposure window
✅ **Browser Extensions**: Encrypted storage prevents direct key access
✅ **Accidental Exposure**: Keys never stored in plain text
✅ **Long-Term Exposure**: Auto-expiration limits risk window

### What This System Cannot Protect Against

⚠️ **Browser DevTools**: Network requests show Authorization header (Base64 encoded)
⚠️ **Malicious Extensions**: Extensions with network access can intercept requests
⚠️ **Memory Inspection**: Advanced tools could read decrypted keys from memory
⚠️ **XSS Attacks**: If site is compromised, attacker could access decrypted keys
⚠️ **Physical Access**: If device is compromised, keys in memory could be extracted

### Best Practices

1. **Use Strong Passphrases**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Don't reuse passphrases from other services

2. **Clear Keys When Done**
   - Use "Clear Keys from Memory" button
   - Close browser tab/window when finished
   - Don't leave sessions active unnecessarily

3. **Sandbox Only**
   - Only use real API keys in Sandbox environment
   - Never use production keys in this tool
   - Use separate passphrases for different environments

4. **Regular Rotation**
   - Rotate API keys periodically
   - Update encrypted storage with new keys
   - Use "Forget All Keys" to remove old encrypted data

5. **Secure Environment**
   - Use on trusted devices only
   - Don't use on shared/public computers
   - Ensure browser is up-to-date

## Technical Implementation

### Web Crypto API
The implementation uses the browser's native Web Crypto API:
- `crypto.subtle.deriveKey()` - PBKDF2 key derivation
- `crypto.subtle.encrypt()` - AES-GCM encryption
- `crypto.subtle.decrypt()` - AES-GCM decryption
- `crypto.getRandomValues()` - Cryptographically secure random generation

### Browser Compatibility
- **Chrome/Edge**: Full support (Chromium 37+)
- **Firefox**: Full support (Firefox 34+)
- **Safari**: Full support (Safari 11+)
- **Opera**: Full support (Opera 24+)

### Storage Format
```json
{
  "encrypted": "base64_encoded_encrypted_data",
  "environment": "sandbox|production",
  "storedAt": 1234567890123
}
```

Encrypted data structure:
```json
{
  "salt": [16 byte array],
  "iv": [12 byte array],
  "data": [encrypted key data]
}
```

## Limitations

This is a **client-side security solution**. For production use:

1. **Use a Backend Server**: Keep private keys on the server
2. **API Proxy**: Route requests through your backend
3. **Token-Based Auth**: Use short-lived tokens instead of keys
4. **Environment Variables**: Store keys in secure server environment

## Conclusion

This secure key management system provides **strong protection** for testing and development scenarios. It uses industry-standard encryption (AES-256-GCM) with proper key derivation (PBKDF2) and implements multiple layers of security including memory-only decryption and automatic expiration.

However, **no client-side solution can be 100% secure**. For production applications, always use a secure backend server to handle API keys.

