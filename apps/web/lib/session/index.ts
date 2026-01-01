// @ts-nocheck
/**
 * 📦 نقطة الدخول الموحدة لنظام الجلسات
 * Enterprise Session Management System
 */

// تصدير النظام الأساسي
export * from './unified-session-system';
export * from './client-session-manager';
export * from './session-adapter';

// تصدير افتراضي
import ClientSessionManager from './client-session-manager';
export default ClientSessionManager;

// تصدير موحد للأنواع
export type {
  User,
  SessionData,
  TokenPayload,
  SessionConfig
} from './unified-session-system';

export type {
  ClientUser,
  ClientSession
} from './client-session-manager';

// تصدير مختصرات للوظائف الشائعة
export { SessionManager } from './session-adapter';
export { sessionSystem } from './unified-session-system';
export { ClientSessionManager } from './client-session-manager';

// دوال مساعدة سريعة
export const getCurrentUser = () => ClientSessionManager.getCurrentUser();
export const getAccessToken = () => ClientSessionManager.getAccessToken();
export const isAuthenticated = () => ClientSessionManager.isAuthenticated();
export const clearSession = () => ClientSessionManager.clearSession();
export const logout = (redirectTo?: string) => ClientSessionManager.logout(redirectTo);
