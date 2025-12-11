import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';

// إعدادات التشفير المتقدمة
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  tagLength: 16,
  saltRounds: 12,
  jwtExpiry: '24h',
  refreshTokenExpiry: '7d',
};

// فئة التشفير المتقدم
export class AdvancedEncryption {
  private encryptionKey: Buffer;
  private jwtSecret: Secret;

  constructor() {
    this.encryptionKey = this.deriveKey(
      process.env.ENCRYPTION_KEY || 'default-key-change-in-production',
    );
    this.jwtSecret = (process.env.JWT_SECRET ||
      'your-secret-key-change-in-production') as Secret;
  }

  // اشتقاق مفتاح التشفير من كلمة مرور
  private deriveKey(password: string): Buffer {
    const salt = crypto.createHash('sha256').update('car-auction-salt').digest();
    return crypto.pbkdf2Sync(password, salt, 100000, ENCRYPTION_CONFIG.keyLength, 'sha512');
  }

  // تشفير البيانات الحساسة
  encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    // إنشاء IV عشوائي واستخدام createCipheriv (التطبيق الصحيح لـ AES-GCM)
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
    const cipher = crypto.createCipheriv(
      ENCRYPTION_CONFIG.algorithm,
      this.encryptionKey,
      iv,
    ) as any; // Cast to access GCM-specific APIs across Node type versions
    cipher.setAAD(Buffer.from('car-auction-aad'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  // فك تشفير البيانات
  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_CONFIG.algorithm,
      this.encryptionKey,
      iv,
    ) as any; // Cast to access GCM-specific APIs across Node type versions
    decipher.setAAD(Buffer.from('car-auction-aad'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // تشفير كلمة المرور مع Salt متقدم
  async hashPassword(password: string): Promise<string> {
    // إضافة pepper للحماية الإضافية
    const pepper = process.env.PASSWORD_PEPPER || 'default-pepper-change-in-production';
    const passwordWithPepper = password + pepper;

    return await bcrypt.hash(passwordWithPepper, ENCRYPTION_CONFIG.saltRounds);
  }

  // التحقق من كلمة المرور
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const pepper = process.env.PASSWORD_PEPPER || 'default-pepper-change-in-production';
    const passwordWithPepper = password + pepper;

    return await bcrypt.compare(passwordWithPepper, hashedPassword);
  }

  // إنشاء JWT token آمن
  generateJWT(payload: any, options?: { expiresIn?: string; audience?: string }): string {
    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(), // معرف فريد للتوكن
    };

    const signOptions: any = {
      expiresIn: options?.expiresIn || ENCRYPTION_CONFIG.jwtExpiry,
      audience: options?.audience || 'car-auction-users',
      issuer: 'car-auction-system',
      algorithm: 'HS256',
    };
    return jwt.sign(tokenPayload, this.jwtSecret, signOptions);
  }

  // التحقق من JWT token
  verifyJWT(token: string): any {
    try {
      const verifyOptions: any = {
        audience: 'car-auction-users',
        issuer: 'car-auction-system',
        algorithms: ['HS256'],
      };
      return jwt.verify(token, this.jwtSecret, verifyOptions);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // إنشاء refresh token
  generateRefreshToken(userId: string): string {
    return this.generateJWT(
      { userId, type: 'refresh' },
      { expiresIn: ENCRYPTION_CONFIG.refreshTokenExpiry },
    );
  }

  // تشفير البيانات الشخصية (PII)
  encryptPII(data: string): string {
    const encrypted = this.encrypt(data);
    return `${encrypted.iv}:${encrypted.tag}:${encrypted.encrypted}`;
  }

  // فك تشفير البيانات الشخصية
  decryptPII(encryptedData: string): string {
    const [iv, tag, encrypted] = encryptedData.split(':');
    return this.decrypt({ iv, tag, encrypted });
  }

  // إنشاء hash آمن للبيانات
  createSecureHash(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data + this.jwtSecret)
      .digest('hex');
  }

  // التحقق من hash البيانات
  verifySecureHash(data: string, hash: string): boolean {
    const computedHash = this.createSecureHash(data);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
  }

  // إنشاء رمز OTP آمن
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }

    return otp;
  }

  // تشفير رمز OTP مع انتهاء صلاحية
  encryptOTP(otp: string, expiryMinutes: number = 5): string {
    const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
    const otpData = `${otp}:${expiryTime}`;
    return this.encryptPII(otpData);
  }

  // فك تشفير والتحقق من OTP
  verifyOTP(encryptedOTP: string, providedOTP: string): { valid: boolean; expired: boolean } {
    try {
      const decryptedData = this.decryptPII(encryptedOTP);
      const [storedOTP, expiryTime] = decryptedData.split(':');

      const now = Date.now();
      const expired = now > parseInt(expiryTime);
      const valid = storedOTP === providedOTP && !expired;

      return { valid, expired };
    } catch (error) {
      return { valid: false, expired: true };
    }
  }
}

// إنشاء مثيل واحد للاستخدام في التطبيق
export const encryption = new AdvancedEncryption();

// دوال مساعدة للاستخدام السريع
export const hashPassword = (password: string) => encryption.hashPassword(password);
export const verifyPassword = (password: string, hash: string) =>
  encryption.verifyPassword(password, hash);
export const generateJWT = (payload: any, options?: any) =>
  encryption.generateJWT(payload, options);
export const verifyJWT = (token: string) => encryption.verifyJWT(token);
export const encryptPII = (data: string) => encryption.encryptPII(data);
export const decryptPII = (data: string) => encryption.decryptPII(data);
export const generateOTP = (length?: number) => encryption.generateOTP(length);
export const encryptOTP = (otp: string, expiry?: number) => encryption.encryptOTP(otp, expiry);
export const verifyOTP = (encrypted: string, provided: string) =>
  encryption.verifyOTP(encrypted, provided);
