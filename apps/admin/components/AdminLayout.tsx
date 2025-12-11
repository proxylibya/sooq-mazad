'use client';

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && router.isReady) {
      checkAuth();
    }
  }, [mounted, router.isReady]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[aria-label="القائمة الشخصية"]')) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen]);

  const checkAuth = async () => {
    if (!mounted || !router.isReady) return;
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
        />

        {/* Main Content */}
        <main className="mr-64 min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-800/80 px-4 py-3 backdrop-blur-sm md:px-6">
            <div className="flex items-center justify-between gap-4">
              {/* Right Side - Title */}
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-lg font-bold text-white md:text-xl">{title}</h1>
                  <p className="hidden text-xs text-slate-400 sm:block">إدارة ومتابعة المزادات</p>
                </div>
              </div>

              {/* Center - Search Bar (hidden on mobile) */}
              <div className="hidden flex-1 max-w-md lg:flex lg:items-center lg:gap-2">
                <input
                  type="text"
                  placeholder="بحث سريع..."
                  className="search-input w-full rounded-lg border border-slate-600 bg-slate-700/50 py-2 px-4 text-sm text-white placeholder-slate-400 focus:bg-slate-700/70 focus:outline-none"
                />
                <button
                  className="flex-shrink-0 rounded-lg bg-blue-600 p-2.5 text-white transition-colors hover:bg-blue-700"
                  aria-label="بحث"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Left Side - Actions */}
              <div className="flex items-center gap-2">
                {/* Search Button (mobile only) */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="hover-scale rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white lg:hidden"
                  aria-label="بحث"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>

                {/* Quick Actions */}
                <button
                  onClick={() => router.push('/admin/auctions/create')}
                  className="hover-scale hidden rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white sm:block"
                  aria-label="إضافة مزاد"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>

                {/* Notifications */}
                <NotificationDropdown />

                {/* Settings */}
                <button
                  onClick={() => router.push('/admin/settings')}
                  className="hover-scale hidden rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white md:block"
                  aria-label="الإعدادات"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>

                {/* Divider */}
                <div className="hidden h-8 w-px bg-slate-700 sm:block"></div>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg p-1.5 pr-3 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                    aria-label="القائمة الشخصية"
                  >
                    <span className="hidden text-sm font-medium text-white sm:block">{admin?.name || 'Admin'}</span>
                    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ring-2 ring-slate-600">
                      <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                        {admin?.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* User Menu Dropdown */}
                  {userMenuOpen && (
                    <div className="dropdown-menu absolute left-0 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-800 py-2 shadow-xl">
                      <div className="border-b border-slate-700 px-4 py-2">
                        <p className="text-sm font-medium text-white">{admin?.name || 'Admin'}</p>
                        <p className="text-xs text-slate-400">{admin?.role || 'Administrator'}</p>
                      </div>
                      <button
                        onClick={() => router.push('/admin/profile')}
                        className="dropdown-item flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        الملف الشخصي
                      </button>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Search Bar */}
            {searchOpen && (
              <div className="mt-3 lg:hidden animate-slide-down">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="بحث سريع..."
                    className="search-input w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-sm text-white placeholder-slate-400 focus:bg-slate-700/70 focus:outline-none"
                  />
                  <button
                    className="flex-shrink-0 rounded-lg bg-blue-600 p-2.5 text-white transition-colors hover:bg-blue-700"
                    aria-label="بحث"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Page Content */}
          <div className="p-6 animate-fade-in-up">{children}</div>
        </main>
      </div>
    </>
  );
}
