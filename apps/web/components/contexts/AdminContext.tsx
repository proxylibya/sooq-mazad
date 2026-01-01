/**
 * سياق المشرف
 */

import { ReactNode, createContext, useCallback, useContext, useState } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin' | 'moderator';
  permissions: string[];
}

export interface AdminContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAdmin(null);
  }, []);

  const checkPermission = useCallback(
    (permission: string): boolean => {
      if (!admin) return false;
      if (admin.role === 'super_admin') return true;
      return admin.permissions.includes(permission);
    },
    [admin],
  );

  return (
    <AdminContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        login,
        logout,
        checkPermission,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

export default AdminContext;
