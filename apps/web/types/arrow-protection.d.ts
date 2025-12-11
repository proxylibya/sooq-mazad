/**
 * 🛡️ أنواع البيانات لنظام حماية الأسهم
 * 
 * هذا الملف يحدد الأنواع المحمية للأسهم
 * ويمنع استخدام قيم خاطئة في TypeScript
 */

// القيم المحمية للأسهم - لا تغيرها!
export type ProtectedArrowPath = 
  | 'M15 19l-7-7 7-7'  // السهم الأيسر - يشير لليسار <
  | 'M9 5l7 7-7 7';    // السهم الأيمن - يشير لليمين >

// القيم المحظورة - ممنوع استخدامها
export type ForbiddenArrowPath = 
  | 'M9 5l7 7-7 7'     // ممنوع للسهم الأيسر
  | 'M15 19l-7-7 7-7'; // ممنوع للسهم الأيمن

// نوع محمي للأسهم
export interface ProtectedArrowConfig {
  readonly leftArrow: 'M15 19l-7-7 7-7';
  readonly rightArrow: 'M9 5l7 7-7 7';
}

// ثوابت محمية
export const PROTECTED_ARROWS: ProtectedArrowConfig = {
  leftArrow: 'M15 19l-7-7 7-7',
  rightArrow: 'M9 5l7 7-7 7',
} as const;

// نوع للتحقق من صحة الأسهم
export interface ArrowValidationResult {
  isValid: boolean;
  issues: string[];
  filePath: string;
}

// نوع لنتائج فحص الحماية
export interface ProtectionCheckResult {
  allValid: boolean;
  results: ArrowValidationResult[];
}

// دالة للتحقق من صحة مسار السهم
export function validateArrowPath(path: string, direction: 'left' | 'right'): boolean {
  if (direction === 'left') {
    return path === PROTECTED_ARROWS.leftArrow;
  } else {
    return path === PROTECTED_ARROWS.rightArrow;
  }
}

// دالة للحصول على المسار الصحيح
export function getCorrectArrowPath(direction: 'left' | 'right'): ProtectedArrowPath {
  return direction === 'left' ? PROTECTED_ARROWS.leftArrow : PROTECTED_ARROWS.rightArrow;
}

// تحذير TypeScript للمطورين
/**
 * ⚠️ تحذير مهم للمطورين:
 * 
 * هذه الأنواع محمية ولا يجب تغييرها!
 * 
 * ✅ الاستخدام الصحيح:
 * const leftArrow = PROTECTED_ARROWS.leftArrow;
 * const rightArrow = PROTECTED_ARROWS.rightArrow;
 * 
 * ❌ ممنوع:
 * const leftArrow = 'M9 5l7 7-7 7';  // هذا للسهم الأيمن!
 * const rightArrow = 'M15 19l-7-7 7-7'; // هذا للسهم الأيسر!
 * 
 * 📖 للمزيد من المعلومات:
 * راجع ملف ARROWS_FIX_SUMMARY.md
 */

export {};
