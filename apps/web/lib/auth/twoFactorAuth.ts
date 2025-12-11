// Two Factor Authentication Module
import crypto from 'crypto';
import keydbClient from '../keydb';
import logger from '../logger';

// أنواع التحقق الثنائي
export enum TwoFactorType {
  SMS = 'sms',
  EMAIL = 'email',
  APP = 'app',
}

interface TwoFactorConfig {
  codeLength: number;
  expiryMinutes: number;
  maxAttempts: number;
}

const _defaultConfig: TwoFactorConfig = {
  codeLength: 6,
  expiryMinutes: 5,
  maxAttempts: 3,
};

/**
 * توليد رمز 2FA
 */
export function generateTwoFactorCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

/**
 * حفظ رمز 2FA
 */
export async function storeTwoFactorCode(
  userId: string,
  code: string,
  expiryMinutes: number = 5,
): Promise<void> {
  try {
    const key = `2fa:code:${userId}`;
    const data = {
      code,
      createdAt: Date.now(),
      attempts: 0,
    };
    await keydbClient.set(key, JSON.stringify(data), expiryMinutes * 60);
    logger.info(`2FA code stored for user: ${userId}`, { userId });
  } catch (error) {
    logger.error('Error storing 2FA code', {
      error: error instanceof Error ? error.message : error,
      userId,
    });
    throw error;
  }
}

/**
 * التحقق من رمز 2FA
 */
export async function verifyTwoFactorCode(
  userId: string,
  inputCode: string,
  maxAttempts: number = 3,
): Promise<{ valid: boolean; message?: string }> {
  try {
    const key = `2fa:code:${userId}`;
    const dataStr = await keydbClient.get<string>(key);

    if (!dataStr) {
      return {
        valid: false,
        message: 'رمز التحقق غير موجود أو منتهي الصلاحية',
      };
    }

    const data = JSON.parse(dataStr as string);

    // زيادة عدد المحاولات
    data.attempts += 1;

    if (data.attempts > maxAttempts) {
      await keydbClient.del(key);
      logger.warn(`2FA max attempts exceeded for user: ${userId}`, { userId });
      return {
        valid: false,
        message: 'تم تجاوز عدد المحاولات المسموح بها',
      };
    }

    // التحقق من الرمز
    if (data.code !== inputCode) {
      await keydbClient.set(key, JSON.stringify(data), 300); // 5 minutes
      return {
        valid: false,
        message: `رمز غير صحيح. المحاولات المتبقية: ${maxAttempts - data.attempts}`,
      };
    }

    // الرمز صحيح
    await keydbClient.del(key);
    logger.info(`2FA code verified successfully for user: ${userId}`, {
      userId,
    });
    return { valid: true };
  } catch (error) {
    logger.error('Error verifying 2FA code', {
      error: error instanceof Error ? error.message : error,
      userId,
    });
    return {
      valid: false,
      message: 'خطأ في التحقق من الرمز',
    };
  }
}

/**
 * إرسال رمز عبر SMS (محاكاة)
 */
export async function sendTwoFactorSMS(
  phoneNumber: string,
  code: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    // TODO: دمج مع خدمة SMS حقيقية
    logger.info(`2FA SMS sent to ${phoneNumber}`, {
      phoneNumber,
      code,
      note: 'This is a mock implementation',
    });

    // محاكاة الإرسال
    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: true };
  } catch (error) {
    logger.error('Error sending 2FA SMS', {
      error: error instanceof Error ? error.message : error,
      phoneNumber,
    });
    return {
      success: false,
      message: 'فشل إرسال الرسالة',
    };
  }
}

/**
 * إرسال رمز عبر Email (محاكاة)
 */
export async function sendTwoFactorEmail(
  email: string,
  code: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    // TODO: دمج مع خدمة Email حقيقية
    logger.info(`2FA Email sent to ${email}`, {
      email,
      code,
      note: 'This is a mock implementation',
    });

    // محاكاة الإرسال
    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: true };
  } catch (error) {
    logger.error('Error sending 2FA Email', {
      error: error instanceof Error ? error.message : error,
      email,
    });
    return {
      success: false,
      message: 'فشل إرسال البريد الإلكتروني',
    };
  }
}

/**
 * تفعيل 2FA للمستخدم
 */
export async function enable2FA(userId: string): Promise<void> {
  try {
    const key = `2fa:enabled:${userId}`;
    await keydbClient.set(key, 'true', 0); // no expiry
    logger.info(`2FA enabled for user: ${userId}`, { userId });
  } catch (error) {
    logger.error('Error enabling 2FA', {
      error: error instanceof Error ? error.message : error,
      userId,
    });
    throw error;
  }
}

/**
 * تعطيل 2FA للمستخدم
 */
export async function disable2FA(userId: string): Promise<void> {
  try {
    const key = `2fa:enabled:${userId}`;
    await keydbClient.del(key);
    logger.info(`2FA disabled for user: ${userId}`, { userId });
  } catch (error) {
    logger.error('Error disabling 2FA', {
      error: error instanceof Error ? error.message : error,
      userId,
    });
    throw error;
  }
}

/**
 * التحقق من حالة 2FA للمستخدم
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  try {
    const key = `2fa:enabled:${userId}`;
    const enabled = await keydbClient.exists(key);
    return enabled;
  } catch (error) {
    logger.error('Error checking 2FA status', {
      error: error instanceof Error ? error.message : error,
      userId,
    });
    return false;
  }
}

/**
 * توليد سر TOTP (للاستخدام المستقبلي)
 */
export function generateTOTPSecret(): string {
  return crypto.randomBytes(20).toString('base64');
}

// إنشاء كائن twoFactorAuth مع جميع الوظائف
export const twoFactorAuth = {
  generateTwoFactorCode,
  storeTwoFactorCode,
  verifyTwoFactorCode,
  sendTwoFactorSMS,
  sendTwoFactorEmail,
  enable2FA,
  disable2FA,
  is2FAEnabled,
  generateTOTPSecret,
};

// Export default أيضاً للتوافق
export default twoFactorAuth;
