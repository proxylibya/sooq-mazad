import { useEffect, useState } from 'react';
import { SessionManager } from '../utils/session-manager';
import { decodeUserObject } from '../utils/universalNameDecoder';
import type { User } from '../types/auth-unified';

// نوع بيانات hook
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  isManager: boolean;
  hasAdminAccess: boolean;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  updateProfileImage: (imageUrl: string) => void;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

// Hook المصادقة الرئيسي
const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // التحقق من client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // تحميل بيانات المستخدم من النظام الجديد
  useEffect(() => {
    if (!isClient) {
      // إبقاء loading: true حتى يكون client ready
      return;
    }

    const loadUserFromStorage = () => {
      try {
        const currentUser = SessionManager.getCurrentUser();
        if (currentUser) {
          // فك تشفير اسم المستخدم تلقائياً
          const decodedUser = decodeUserObject(currentUser) as User;
          setUser(decodedUser);
        }
      } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
        SessionManager.clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();

    // event listeners
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        loadUserFromStorage();
      }
    };

    const handleUserUpdated = (e: CustomEvent) => {
      if (e.detail) {
        setUser(e.detail);
      }
    };

    const handleLoginSuccess = (e: CustomEvent) => {
      if (e.detail) {
        setUser(e.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdated as EventListener);
    window.addEventListener('loginSuccess', handleLoginSuccess as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdated as EventListener);
      window.removeEventListener('loginSuccess', handleLoginSuccess as EventListener);
    };
  }, [isClient]);

  const updateUser = (userData: Partial<User>) => {
    if (!user || !isClient) return;

    SessionManager.updateUser(userData);
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
  };

  const setUserWrapper = (newUser: User | null) => {
    if (!isClient) return;
    
    setUser(newUser);
    
    if (newUser) {
      // حفظ المستخدم الجديد في localStorage والسيشن
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // إرسال حدث للمكونات الأخرى
      window.dispatchEvent(new CustomEvent('userUpdated', {
        detail: newUser
      }));
    } else {
      SessionManager.clearSession();
    }
  };

  const updateProfileImage = (imageUrl: string) => {
    SessionManager.updateProfileImage(imageUrl);
    updateUser({ profileImage: imageUrl });
  };

  const logout = async () => {
    if (!isClient) return;
    
    await SessionManager.logout('/');
    setUser(null);
  };

  return {
    user,
    loading,
    isLoading: loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || false,
    isSuperAdmin: user?.role === 'SUPER_ADMIN' || false,
    isModerator: user?.role === 'MODERATOR' || false,
    isManager: user?.role === 'MANAGER' || false,
    hasAdminAccess:
      ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'MANAGER'].includes(user?.role || '') || false,
    setUser: setUserWrapper,
    updateUser,
    updateProfileImage,
    logout,
    getToken: () => {
      if (isClient) {
        return SessionManager.getCurrentToken();
      }
      return null;
    },
  };
};

// تصدير افتراضي للتوافق
export default useAuth;

// تصدير مسمى للمرونة  
export { useAuth };
