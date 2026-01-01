const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { generateKeyPairSync } = require('crypto');

// توليد المفاتيح الأمنية
function generateSecurityKeys() {
    console.log('🔐 توليد المفاتيح الأمنية للنظام...\n');

    // 1. Master Encryption Key
    const masterKey = crypto.randomBytes(32).toString('base64');
    console.log('✅ Master Encryption Key generated');

    // 2. JWT Secret for HS256 (fallback)
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    console.log('✅ JWT Secret generated');

    // 3. RSA Keys for RS256
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    console.log('✅ RSA Key Pair (4096-bit) generated');

    // 4. Refresh Token Keys
    const { 
        publicKey: refreshPublicKey, 
        privateKey: refreshPrivateKey 
    } = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    console.log('✅ Refresh Token RSA Key Pair generated');

    // 5. CSRF Secret
    const csrfSecret = crypto.randomBytes(32).toString('hex');
    console.log('✅ CSRF Secret generated');

    // 6. Session Secret
    const sessionSecret = crypto.randomBytes(32).toString('hex');
    console.log('✅ Session Secret generated');

    // 7. OTP Secret
    const otpSecret = crypto.randomBytes(20).toString('base64');
    console.log('✅ OTP Secret generated');

    // 8. SMS API Key (placeholder)
    const smsApiKey = 'YOUR_SMS_API_KEY_HERE';
    const smsApiSecret = 'YOUR_SMS_API_SECRET_HERE';
    console.log('⚠️  SMS API credentials need to be configured');

    // Create .keys directory if it doesn't exist
    const keysDir = path.join(__dirname, '..', '.keys');
    if (!fs.existsSync(keysDir)) {
        fs.mkdirSync(keysDir, { recursive: true });
        console.log('\n📁 Created .keys directory');
    }

    // Save RSA keys to files
    fs.writeFileSync(path.join(keysDir, 'jwt-private.pem'), privateKey);
    fs.writeFileSync(path.join(keysDir, 'jwt-public.pem'), publicKey);
    fs.writeFileSync(path.join(keysDir, 'refresh-private.pem'), refreshPrivateKey);
    fs.writeFileSync(path.join(keysDir, 'refresh-public.pem'), refreshPublicKey);
    console.log('📁 RSA keys saved to .keys directory');

    // Generate .env.security file
    const envContent = `# ========================================
# 🔐 SECURITY CONFIGURATION
# Generated: ${new Date().toISOString()}
# ========================================

# Master Keys
MASTER_ENCRYPTION_KEY="${masterKey}"
JWT_SECRET="${jwtSecret}"
CSRF_SECRET="${csrfSecret}"
SESSION_SECRET="${sessionSecret}"

# RSA Key Paths (for RS256 JWT)
JWT_PRIVATE_KEY_PATH=".keys/jwt-private.pem"
JWT_PUBLIC_KEY_PATH=".keys/jwt-public.pem"
REFRESH_PRIVATE_KEY_PATH=".keys/refresh-private.pem"
REFRESH_PUBLIC_KEY_PATH=".keys/refresh-public.pem"

# OTP & 2FA
OTP_SECRET="${otpSecret}"
TOTP_WINDOW=2
TOTP_STEP=30
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000

# SMS Configuration (Libya)
SMS_PROVIDER="libya_sms"
SMS_API_KEY="${smsApiKey}"
SMS_API_SECRET="${smsApiSecret}"
SMS_SENDER_NAME="SooqMazad"

# Email Configuration
EMAIL_FROM="security@sooq-mazad.com"
EMAIL_VERIFICATION_EXPIRY=3600000
EMAIL_RESET_EXPIRY=3600000

# Session Configuration  
SESSION_DURATION=86400000
REFRESH_TOKEN_DURATION=604800000
REMEMBER_ME_DURATION=2592000000

# Security Headers
ENABLE_SECURITY_HEADERS=true
ENABLE_CSRF_PROTECTION=true
ENABLE_RATE_LIMITING=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5
REGISTER_RATE_LIMIT_MAX=3

# CORS
CORS_ORIGIN="http://localhost:3021,http://localhost:3022,https://sooq-mazad.com"
CORS_CREDENTIALS=true

# Audit & Logging
ENABLE_AUDIT_LOG=true
LOG_LEVEL="info"
AUDIT_LOG_RETENTION_DAYS=90

# IP & Geolocation
ENABLE_IP_TRACKING=true
ENABLE_GEOLOCATION=true

# Device Fingerprinting
ENABLE_DEVICE_FINGERPRINT=true
TRUSTED_DEVICE_DURATION=2592000000
`;

    // Save .env.security
    const envPath = path.join(__dirname, '..', '.env.security');
    fs.writeFileSync(envPath, envContent);
    console.log('\n📄 Created .env.security file');

    // Add to .gitignore
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    if (!gitignoreContent.includes('.env.security')) {
        gitignoreContent += '\n# Security files\n.env.security\n.keys/\n';
        fs.writeFileSync(gitignorePath, gitignoreContent);
        console.log('📄 Updated .gitignore');
    }

    // Instructions
    console.log('\n' + '='.repeat(50));
    console.log('✅ المفاتيح الأمنية تم توليدها بنجاح!');
    console.log('='.repeat(50));
    console.log('\n📋 الخطوات التالية:');
    console.log('1. انسخ محتوى .env.security إلى .env الرئيسي');
    console.log('2. قم بتحديث SMS API credentials');
    console.log('3. قم بتحديث Email configuration');
    console.log('4. احمِ ملفات .keys/ و .env.security');
    console.log('5. لا تشارك هذه المفاتيح أبداً!');
    console.log('\n⚠️  تحذير: هذه المفاتيح للتطوير فقط.');
    console.log('   في الإنتاج، استخدم خدمات إدارة المفاتيح المتخصصة.');
}

// Run the script
generateSecurityKeys();
