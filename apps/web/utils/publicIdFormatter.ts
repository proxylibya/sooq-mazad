/**
 * 🆔 نظام تنسيق المعرف العام - محدث للنظام الجديد
 * 
 * ⚠️ تحذير: هذا الملف للتوافق مع الكود القديم فقط
 * استخدم advancedPublicIdHelpers.ts للميزات الجديدة
 */

// إعادة تصدير من النظام الجديد
export { 
  formatPublicId,
  formatPublicIdWithHash,
  copyPublicIdToClipboard,
  isValidPublicId,
  isUserPublicId
} from './advancedPublicIdHelpers';

/**
 * تنسيق publicId مع بادئة "ID:" (للتوافق القديم)
 * @deprecated استخدم formatPublicId بدلاً منه
 */
export const formatPublicIdWithPrefix = (publicId: number | null | undefined): string => {
  if (!publicId) return 'ID: ---';
  return `ID: ${publicId}`;
};

/**
 * البحث عن مستخدم بواسطة publicId (للتوافق القديم)
 * @deprecated استخدم /api/user/search مباشرة
 */
export const searchUserByPublicId = async (publicId: number | string) => {
  try {
    const response = await fetch(`/api/user/search?publicId=${publicId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('خطأ في البحث عن المستخدم:', error);
    return { success: false, error: 'فشل البحث' };
  }
};
