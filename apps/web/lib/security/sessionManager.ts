/**
 * Session Manager - إعادة توجيه للنظام الموحد
 */
import { SessionData, UnifiedSessionSystem, User } from '../session/unified-session-system';

// تصدير الأنواع
export type { SessionData, User };

// تصدير الـ class
export { UnifiedSessionSystem };

// إنشاء instance افتراضي
export const sessionManager = new UnifiedSessionSystem();

// تصدير الـ class كـ default
export default UnifiedSessionSystem;

