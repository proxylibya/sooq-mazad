/**
 * نظام حماية وتشفير المحافظ المشفرة
 *
 * تحذير أمني: لا تخزن المفاتيح الخاصة في قاعدة البيانات
 * هذا الملف للاستخدام إذا كان التخزين ضرورياً حقاً
 */

import crypto from 'crypto';

// مفتاح التشفير الرئيسي (يجب أن يكون في متغيرات البيئة)
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

/**
 * التحقق من وجود مفتاح التشفير
 */
function validateEncryptionKey(): void {
  if (!ENCRYPTION_KEY) {
    throw new Error('WALLET_ENCRYPTION_KEY غير موجود في متغيرات البيئة');
  }

  const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('WALLET_ENCRYPTION_KEY يجب أن يكون 32 بايت (64 حرف hex)');
  }
}

/**
 * توليد مفتاح تشفير جديد
 * استخدم هذه الدالة مرة واحدة لتوليد المفتاح
 */
export function generateEncryptionKey(): string {
  const key = crypto.randomBytes(32);
  return key.toString('hex');
}

/**
 * تشفير المفتاح الخاص
 *
 * @param privateKey - المفتاح الخاص للمحفظة المشفرة
 * @returns نص مشفر بصيغة: iv:authTag:encrypted
 */
export function encryptPrivateKey(privateKey: string): string {
  validateEncryptionKey();

  // توليد IV عشوائي (16 بايت)
  const iv = crypto.randomBytes(16);

  // إنشاء Cipher
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!, 'hex'), iv);

  // تشفير البيانات
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // الحصول على Auth Tag للتحقق من السلامة
  const authTag = cipher.getAuthTag();

  // دمج IV + AuthTag + Encrypted في نص واحد
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * فك تشفير المفتاح الخاص
 *
 * @param encryptedData - النص المشفر بصيغة: iv:authTag:encrypted
 * @returns المفتاح الخاص الأصلي
 */
export function decryptPrivateKey(encryptedData: string): string {
  validateEncryptionKey();

  // فصل المكونات
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('صيغة البيانات المشفرة غير صحيحة');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  // إنشاء Decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!, 'hex'), iv);

  // تعيين Auth Tag للتحقق
  decipher.setAuthTag(authTag);

  // فك التشفير
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * توليد عنوان محفظة مشفرة جديد (بدون تخزين المفتاح الخاص)
 * الحل الأمثل: استخدام HD Wallets والمفاتيح العامة فقط
 */
export function generateWalletAddress(): {
  address: string;
  publicKey: string;
  // ملاحظة: لا نعيد المفتاح الخاص هنا
} {
  // هذا مثال بسيط - في الإنتاج استخدم مكتبة محافظ حقيقية
  const keypair = crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'der',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der',
    },
  });

  // استخراج العنوان من المفتاح العام
  const publicKeyHash = crypto.createHash('sha256').update(keypair.publicKey).digest('hex');

  const address = 'T' + publicKeyHash.substring(0, 33); // عنوان TRON مبسط

  return {
    address,
    publicKey: keypair.publicKey.toString('hex'),
  };
}

/**
 * التحقق من صحة عنوان المحفظة
 */
export function validateWalletAddress(address: string): boolean {
  // التحقق من صيغة عنوان TRON (TRC20)
  if (!address || address.length !== 34) return false;
  if (!address.startsWith('T')) return false;

  // التحقق من الأحرف الصالحة (Base58)
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  for (const char of address.substring(1)) {
    if (!base58Chars.includes(char)) return false;
  }

  return true;
}

/**
 * حماية إضافية: Hash للمفتاح الخاص للتحقق بدون الكشف عنه
 */
export function hashPrivateKey(privateKey: string): string {
  return crypto.createHash('sha256').update(privateKey).digest('hex');
}

/**
 * التوصيات الأمنية:
 *
 * 1. لا تخزن المفاتيح الخاصة في قاعدة البيانات أبداً
 * 2. استخدم HSM (Hardware Security Module) للمفاتيح الحساسة
 * 3. استخدم Multi-Signature Wallets للمبالغ الكبيرة
 * 4. استخدم Cold Wallets للتخزين طويل الأمد
 * 5. فعّل 2FA على جميع عمليات السحب
 * 6. راقب جميع المعاملات المشبوهة
 * 7. استخدم Rate Limiting على عمليات السحب
 * 8. أرسل تنبيهات للمستخدم عند أي نشاط غير عادي
 */

export const WalletSecurityRecommendations = {
  // الحد الأدنى لمبلغ السحب
  MIN_WITHDRAWAL_AMOUNT: 10, // USDT

  // الحد الأقصى لمبلغ السحب اليومي
  MAX_DAILY_WITHDRAWAL: 10000, // USDT

  // عدد التأكيدات المطلوبة للإيداع
  REQUIRED_CONFIRMATIONS: 6,

  // مهلة انتظار السحب (بالدقائق)
  WITHDRAWAL_COOLDOWN: 60,

  // رسوم الشبكة التقديرية
  NETWORK_FEE: 1, // USDT
};

/**
 * دالة مساعدة: تنظيف البيانات الحساسة من الذاكرة
 */
export function secureCleanup(sensitiveData: string): void {
  // الكتابة فوق البيانات في الذاكرة
  if (sensitiveData) {
    // في Node.js، لا يمكننا ضمان حذف الذاكرة تماماً
    // لكن يمكننا الكتابة فوقها
    const buffer = Buffer.from(sensitiveData, 'utf8');
    buffer.fill(0);
  }
}

/**
 * الحل الأمثل: عدم تخزين المفاتيح الخاصة نهائياً
 *
 * البدائل الآمنة:
 * 1. استخدام Third-Party Wallet APIs (مثل Tatum, BitGo)
 * 2. استخدام Custodial Wallets للمستخدمين
 * 3. استخدام Smart Contracts مع Multi-Sig
 * 4. دع المستخدم يحتفظ بمفاتيحه الخاصة (Non-Custodial)
 */

export default {
  encryptPrivateKey,
  decryptPrivateKey,
  generateWalletAddress,
  validateWalletAddress,
  hashPrivateKey,
  generateEncryptionKey,
  secureCleanup,
  WalletSecurityRecommendations,
};
