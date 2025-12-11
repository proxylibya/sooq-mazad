/**
 * localStorage - إعادة توجيه للنظام الموحد
 */
import { safeLocalStorage, SafeLocalStorage } from './safeLocalStorage';

// إعادة تصدير CompareListStorage للتوافقية
export { CompareListStorage } from './unifiedLocalStorage';

export { SafeLocalStorage, safeLocalStorage };
export default safeLocalStorage;
