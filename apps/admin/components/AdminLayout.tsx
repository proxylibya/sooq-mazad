'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import NotificationDropdown from './notifications/NotificationDropdown';

interface AdminUser {
  id: string;
  name: string;
  role: string;
  permissions?: string[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'لوحة التحكم' }: AdminLayoutProps) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      if (res.ok) {
        const data = await res.json();
        setAdmin(data.admin);
      } else {
        router.push('/admin/login');
      }
    } catch {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{title} | سوق مزاد</title>
      </Head>

      <div className="min-h-screen bg-slate-900" dir="rtl">
        {/* Sidebar */}
        <AdminSidebar
          adminName={admin.name}
          adminRole={admin.role}
          adminPermissions={admin.permissions || []}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="min-h-screen transition-all duration-300 lg:mr-64">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-800/80 px-4 py-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white lg:hidden"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold text-white">{title}</h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                {/* نظام الإشعارات */}
                <NotificationDropdown />

                <span className="hidden text-sm text-slate-400 sm:inline-block">
                  مرحباً، <span className="text-white">{admin.name}</span>
                </span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </>
  );
}
