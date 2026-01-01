'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminRole } from '@prisma/client';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  avatar?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  refreshAdmin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  loading: true,
  hasPermission: () => false,
  refreshAdmin: async () => {},
  logout: async () => {},
});

export function AdminAuthProvider({
  children,
  initialAdmin,
}: {
  children: React.ReactNode;
  initialAdmin?: AdminUser | null;
}) {
  const [admin, setAdmin] = useState<AdminUser | null>(initialAdmin || null);
  const [loading, setLoading] = useState(!initialAdmin);

  const refreshAdmin = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.admin) {
          setAdmin(data.admin);
        } else {
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
    } catch (error) {
      console.error('Error refreshing admin:', error);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string) => {
    if (!admin) return false;
    return admin.permissions.includes(permission);
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        setAdmin(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (!initialAdmin) {
      refreshAdmin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAdmin]);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, hasPermission, refreshAdmin, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
