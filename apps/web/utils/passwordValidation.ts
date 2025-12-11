/**
 * نظام التحقق الموحد من كلمات المرور
 * يضمن تطبيق نفس القواعد في جميع APIs
 */

export interface PasswordPolicy {
  minLength: number;
  recommendedLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  preventCommonPasswords: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-100
}

/**
 * السياسة الأمنية الافتراضية - مُبسطة للمستخدمين الليبيين
 * ملاحظة: تم تخفيف القيود لتسهيل التسجيل
 */
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 6,              // حد أدنى إجباري
  recommendedLength: 8,      // موصى به للأمان
  requireUppercase: false,   // اختياري
  requireLowercase: false,   // اختياري
  requireNumber: false,      // اختياري - تم تعطيله لتسهيل التسجيل
  requireSpecialChar: false, // اختياري
  preventCommonPasswords: false, // معطل - السماح بكلمات المرور البسيطة
};

/**
 * قائمة كلمات المرور الشائعة المحظورة
 */
const COMMON_PASSWORDS = [
  '123456', '123456789', '12345678', '1234567', '123123',
  'password', 'password123', 'qwerty', 'abc123', '111111',
  '000000', '1111', '2222', '3333', '4444', '5555',
  '0000', '1234', '12345', 'admin', 'user',
  // كلمات عربية شائعة بالإنجليزية
  'sooq', 'mazad', 'libya', 'car', 'auto',
];

/**
 * التحقق من كلمة المرور
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): PasswordValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // 1. فحص الحد الأدنى للطول
  if (!password || password.length < policy.minLength) {
    errors.push(`كلمة المرور يجب أن تكون ${policy.minLength} أحرف على الأقل`);
    return {
      isValid: false,
      errors,
      warnings,
      strength: 'weak',
      score: 0,
    };
  }

  // 2. فحص الطول الموصى به
  if (password.length < policy.recommendedLength) {
    warnings.push(`للأمان الأفضل، استخدم ${policy.recommendedLength} أحرف على الأقل`);
  } else {
    score += 20; // مكافأة للطول الجيد
  }

  // 3. فحص الأحرف الكبيرة
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
  }
  if (/[A-Z]/.test(password)) {
    score += 15;
  }

  // 4. فحص الأحرف الصغيرة
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل');
  }
  if (/[a-z]/.test(password)) {
    score += 15;
  }

  // 5. فحص الأرقام
  if (policy.requireNumber && !/\d/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
  }
  if (/\d/.test(password)) {
    score += 20;
  }

  // 6. فحص الرموز الخاصة
  if (policy.requireSpecialChar && !/[@$!%*?&#]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رمز خاص (@$!%*?&#)');
  }
  if (/[@$!%*?&#]/.test(password)) {
    score += 20;
  }

  // 7. فحص كلمات المرور الشائعة
  if (policy.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.includes(lowerPassword)) {
      errors.push('كلمة المرور هذه شائعة جداً وغير آمنة. اختر كلمة مرور أقوى');
    }

    // فحص الأنماط المتكررة
    if (/^(.)\1+$/.test(password)) {
      // مثل: 0000, 1111, aaaa
      errors.push('كلمة المرور لا يمكن أن تكون حرف واحد متكرر');
    }

    if (/^(012|123|234|345|456|567|678|789|890)+$/.test(password)) {
      // مثل: 123, 1234, 12345
      warnings.push('تجنب التسلسلات الرقمية البسيطة');
    }
  }

  // 8. حساب قوة كلمة المرور
  // مكافأة للطول الإضافي
  if (password.length >= 10) score += 10;
  if (password.length >= 12) score += 10;

  // تحديد القوة بناءً على النقاط
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (score >= 80) strength = 'very-strong';
  else if (score >= 60) strength = 'strong';
  else if (score >= 40) strength = 'medium';
  else strength = 'weak';

  // تحذير إذا كانت القوة ضعيفة
  if (strength === 'weak' && errors.length === 0) {
    warnings.push('كلمة المرور ضعيفة. استخدم مزيج من الأحرف والأرقام والرموز');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength,
    score,
  };
}

/**
 * فحص سريع لكلمة المرور - مُبسط للمستخدمين الليبيين
 * يرجع رسالة خطأ أو null إذا كانت صالحة
 * 
 * ملاحظة: تم تبسيط الفحص ليقبل أي كلمة مرور بطول 6 أحرف أو أكثر
 */
export function quickPasswordCheck(
  password: string,
  minLength: number = 6
): string | null {
  if (!password) {
    return 'كلمة المرور مطلوبة';
  }

  if (password.length < minLength) {
    return `كلمة المرور يجب أن تكون ${minLength} أحرف على الأقل`;
  }

  // تم تعطيل فحص الأرقام والكلمات الشائعة لتسهيل التسجيل
  // المستخدم يستطيع استخدام أي كلمة مرور بطول كافٍ

  return null; // كلمة المرور صالحة
}

/**
 * توليد كلمة مرور قوية عشوائية
 */
export function generateStrongPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@$!%*?&#';
  const allChars = uppercase + lowercase + numbers + special;

  let password = '';

  // ضمان وجود حرف واحد من كل نوع
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // ملء باقي كلمة المرور
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // خلط الأحرف
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * مقارنة كلمتي مرور (للتأكيد)
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * فحص إذا كانت كلمة المرور الجديدة مختلفة عن القديمة
 */
export function isPasswordDifferent(
  oldPassword: string,
  newPassword: string
): boolean {
  return oldPassword !== newPassword;
}
