/**
 * نظام الأمان للعملات الرقمية
 * يوفر تشفير آمن للمفاتيح الخاصة وبيانات المحفظة
 */

import crypto from 'crypto';

// مفتاح التشفير - يجب تغييره في الإنتاج
const ENCRYPTION_KEY = process.env.CRYPTO_ENCRYPTION_KEY || 'sooq-mazad-crypto-key-32-chars!';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

class CryptoSecurity {
    /**
     * إنشاء مفتاح خاص آمن
     */
    static generateSecurePrivateKey(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * تشفير البيانات الحساسة
     */
    static encryptSensitiveData(data: string): string {
        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
            const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const authTag = cipher.getAuthTag();

            // دمج IV + authTag + البيانات المشفرة
            return iv.toString('hex') + authTag.toString('hex') + encrypted;
        } catch (error) {
            console.error('خطأ في تشفير البيانات:', error);
            throw new Error('فشل في تشفير البيانات');
        }
    }

    /**
     * فك تشفير البيانات الحساسة
     */
    static decryptSensitiveData(encryptedData: string): string {
        try {
            // استخراج IV و authTag والبيانات المشفرة
            const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
            const authTag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2), 'hex');
            const encrypted = encryptedData.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2);

            const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('خطأ في فك تشفير البيانات:', error);
            throw new Error('فشل في فك تشفير البيانات');
        }
    }

    /**
     * إنشاء hash آمن
     */
    static hashData(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * التحقق من صحة hash
     */
    static verifyHash(data: string, hash: string): boolean {
        return this.hashData(data) === hash;
    }

    /**
     * إنشاء token عشوائي آمن
     */
    static generateSecureToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }
}

export default CryptoSecurity;
