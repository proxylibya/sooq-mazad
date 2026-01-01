/**
 * دالة تحويل حالة السيارة من العربية إلى الإنجليزية
 * لضمان التوافق مع enum CarCondition في قاعدة البيانات
 * 
 * نظام موحد: خياران فقط - NEW (جديد) و USED (مستعمل)
 */

export type CarConditionEnum = 'NEW' | 'USED';

/**
 * تحويل حالة السيارة من العربية أو الإنجليزية إلى enum صحيح
 * @param condition - حالة السيارة بالعربية أو الإنجليزية
 * @returns CarConditionEnum - القيمة المناسبة لقاعدة البيانات
 */
export function convertConditionToEnum(condition: string): CarConditionEnum {
  if (!condition || typeof condition !== 'string') {
    return 'USED'; // افتراضي
  }

  const normalizedCondition = condition.trim();

  const conditionMap: { [key: string]: CarConditionEnum; } = {
    // العربية - القيم الجديدة
    جديد: 'NEW',
    مستعمل: 'USED',

    // الإنجليزية
    new: 'NEW',
    used: 'USED',
    NEW: 'NEW',
    USED: 'USED',

    // القيم القديمة - تحويل للنظام الجديد
    جديدة: 'NEW',
    مستعملة: 'USED',
    ممتازة: 'USED',
    'جيدة جداً': 'USED',
    جيدة: 'USED',
    مقبولة: 'USED',
    'تحتاج صيانة': 'USED',
    'يحتاج إصلاح': 'USED',
    'تحتاج إصلاح': 'USED',
    'يحتاج صيانة': 'USED',
    'بحاجة لصيانة': 'USED',
    'بحاجة إلى صيانة': 'USED',
    needs_repair: 'USED',
    'needs repair': 'USED',
    'need repair': 'USED',
    NEEDS_REPAIR: 'USED',
    excellent: 'USED',
    good: 'USED',
    fair: 'USED',
    poor: 'USED',
    ممتاز: 'USED',
    جيد: 'USED',
    'جيد جداً': 'USED',
    مقبول: 'USED',
    ضعيف: 'USED',
    EXCELLENT: 'USED',
    GOOD: 'USED',
    FAIR: 'USED',
    POOR: 'USED',
  };

  return conditionMap[normalizedCondition] || 'USED';
}

/**
 * تحويل حالة السيارة من enum إلى العربية للعرض
 * @param condition - CarConditionEnum
 * @returns string - النص بالعربية
 */
export function convertEnumToArabic(condition: CarConditionEnum | string): string {
  const arabicMap: Record<string, string> = {
    NEW: 'جديد',
    USED: 'مستعمل',
    new: 'جديد',
    used: 'مستعمل',
    // القيم القديمة
    NEEDS_REPAIR: 'مستعمل',
    EXCELLENT: 'مستعمل',
    GOOD: 'مستعمل',
    FAIR: 'مستعمل',
  };

  return arabicMap[condition] || 'مستعمل';
}

/**
 * التحقق من صحة قيمة الحالة
 * @param condition - الحالة المراد التحقق منها
 * @returns boolean - true إذا كانت صحيحة
 */
export function isValidCondition(condition: string): boolean {
  const validConditions = ['NEW', 'USED'];
  return validConditions.includes(convertConditionToEnum(condition));
}
