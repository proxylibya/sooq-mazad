import crypto from 'crypto';

// فحص أمان الرسائل الأساسية
export function validateMessageSecurity(
  senderId: string,
  content: string,
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!senderId || typeof senderId !== 'string') {
    errors.push('معرف المرسل غير صالح');
  }
  if (!content || typeof content !== 'string') {
    errors.push('المحتوى غير صالح');
  }

  if (content && content.length > 5000) {
    errors.push('حجم المحتوى يتجاوز الحد المسموح');
  }

  // تحذيرات بسيطة على كلمات/أنماط شائعة غير آمنة
  const blacklist = [/spam/i, /scam/i, /http:\/\//i, /https:\/\//i];
  for (const rule of blacklist) {
    if (rule.test(content)) {
      warnings.push('تم اكتشاف محتوى قد يكون غير مرغوب فيه أو رابط');
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// تشفير بسيط للمحتوى الحساس (AES-256-GCM)
export const MessageEncryption = {
  encrypt(plain: string): { encrypted: string; iv: string; tag: string } {
    const key = crypto
      .createHash('sha256')
      .update(process.env.MESSAGE_SECRET || 'default_secret')
      .digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
    };
  },

  decrypt(encrypted: string, iv: string, tag: string): string | null {
    try {
      const key = crypto
        .createHash('sha256')
        .update(process.env.MESSAGE_SECRET || 'default_secret')
        .digest();
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
      decipher.setAuthTag(Buffer.from(tag, 'base64'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encrypted, 'base64')),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('فشل في فك التشفير:', error);
      return null;
    }
  },
};
