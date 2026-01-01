/**
 * تعريف موحّد لأنواع الحسابات وأدوات المساعدة الخاصة بها
 * Centralized account type definitions and helpers
 */

// النوع الرسمي المعتمد لأنواع الحسابات (متوافق مع Prisma)
export type AccountType = 'REGULAR_USER' | 'TRANSPORT_OWNER' | 'COMPANY' | 'SHOWROOM';

// مصفوفة بجميع الأنواع المسموحة
export const ACCOUNT_TYPES: readonly AccountType[] = [
  'REGULAR_USER',
  'TRANSPORT_OWNER',
  'COMPANY',
  'SHOWROOM',
] as const;

/**
 * التحقق مما إذا كانت القيمة هي نوع حساب صالح
 */
export function isAccountType(value: any): value is AccountType {
  return typeof value === 'string' && (ACCOUNT_TYPES as readonly string[]).includes(value);
}

/**
 * تطبيع القيم القديمة أو غير المتسقة لأنواع الحسابات إلى القيم الرسمية
 * - INDIVIDUAL -> REGULAR_USER
 * - DEALER -> SHOWROOM (يُستخدم عادة كدلالة على معرض/تاجر سيارات)
 * - أي قيمة غير معروفة -> REGULAR_USER (افتراضي آمن)
 */
export function normalizeAccountType(value: string | null | undefined): AccountType {
  if (!value) return 'REGULAR_USER';

  // قيمة صحيحة بالفعل
  if (isAccountType(value)) return value;

  // خرائط legacy
  const legacy = value.toUpperCase().trim();
  if (legacy === 'INDIVIDUAL') return 'REGULAR_USER';
  if (legacy === 'DEALER') return 'SHOWROOM';

  // افتراضي آمن
  return 'REGULAR_USER';
}

/**
 * تسمية عربية لأنواع الحسابات (اختياري - مرجع سريع)
 */
export function accountTypeLabel(value: AccountType): string {
  switch (value) {
    case 'REGULAR_USER':
      return 'مستخدم عادي';
    case 'TRANSPORT_OWNER':
      return 'صاحب ساحبة - نقل';
    case 'COMPANY':
      return 'شركة';
    case 'SHOWROOM':
      return 'معرض سيارات';
    default:
      return 'مستخدم';
  }
}
