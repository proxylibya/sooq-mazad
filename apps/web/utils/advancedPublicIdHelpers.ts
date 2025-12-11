/**
 * 🆔 نظام Public IDs المتقدم (9 خانات)
 * مثال: 540678925
 */

export const ID_RANGES = {
  USER: { START: 500000000, END: 599999999, PREFIX: '5' },
  WALLET: { START: 300000000, END: 399999999, PREFIX: '3' },
  TRANSACTION: { START: 700000000, END: 799999999, PREFIX: '7' },
  CRYPTO_WALLET: { START: 800000000, END: 899999999, PREFIX: '8' },
  DEPOSIT: { START: 600000000, END: 699999999, PREFIX: '6' },
  CAR: { START: 200000000, END: 299999999, PREFIX: '2' },
  AUCTION: { START: 100000000, END: 199999999, PREFIX: '1' },
} as const;

export type IdType = keyof typeof ID_RANGES;

/**
 * تنسيق ID بسيط - أرقام فقط بدون فواصل
 * @example formatPublicId(540678925) => "540678925"
 */
export const formatPublicId = (id: number | null | undefined): string => {
  if (!id) return '---';
  return String(id);
};

/**
 * تنسيق ID مع Hash
 * @example formatPublicIdWithHash(540678925) => "#540678925"
 */
export const formatPublicIdWithHash = (id: number | null | undefined): string => {
  if (!id) return '#---';
  return `#${id}`;
};

/**
 * تحديد النوع تلقائياً من الرقم الأول
 * @example detectIdType(540678925) => 'USER'
 * @example detectIdType(340567891) => 'WALLET'
 */
export const detectIdType = (id: number): IdType | null => {
  const firstDigit = String(id)[0];
  for (const [type, range] of Object.entries(ID_RANGES)) {
    if (firstDigit === range.PREFIX) return type as IdType;
  }
  return null;
};

/**
 * الحصول على اسم النوع بالعربي
 */
export const getIdTypeName = (id: number): string => {
  const type = detectIdType(id);
  if (!type) return 'غير معروف';
  
  const names: Record<IdType, string> = {
    USER: 'مستخدم',
    WALLET: 'محفظة',
    TRANSACTION: 'معاملة',
    CRYPTO_WALLET: 'محفظة USDT',
    DEPOSIT: 'إيداع',
    CAR: 'إعلان',
    AUCTION: 'مزاد',
  };
  
  return names[type];
};

/**
 * التحقق من صحة الرقم
 */
export const isValidPublicId = (id: number | string | null | undefined): boolean => {
  if (!id) return false;
  const num = Number(id);
  if (isNaN(num)) return false;
  return Object.values(ID_RANGES).some(r => num >= r.START && num <= r.END);
};

/**
 * التحقق من أنواع محددة
 */
export const isUserPublicId = (id: number): boolean => detectIdType(id) === 'USER';
export const isWalletPublicId = (id: number): boolean => detectIdType(id) === 'WALLET';
export const isTransactionPublicId = (id: number): boolean => detectIdType(id) === 'TRANSACTION';

/**
 * نسخ إلى الحافظة
 */
export const copyPublicIdToClipboard = async (id: number): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(String(id));
    return true;
  } catch (error) {
    console.error('فشل النسخ:', error);
    return false;
  }
};
