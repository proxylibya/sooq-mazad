import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { OpensooqNavbar } from '../../components/common';
import { useQuickNotifications } from '../../components/ui/EnhancedNotificationSystem';
import WalletQuickActions from '../../components/wallet/WalletQuickActions';
import { useUserContext } from '../../contexts/UserContext';
import { useMultiWalletBalance } from '../../hooks/useMultiWalletBalance';

// Currency formatter
const formatAmount = (amount: number, currency: 'LYD' | 'USD' | 'USDT' = 'LYD') => {
  const map: Record<string, string> = { LYD: 'د.ل', USD: '$', USDT: 'USDT' };
  const symbol = map[currency] ?? currency;
  return `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
};

type Tx = {
  id: string;
  date: string;
  type: 'إيداع' | 'معاملة';
  method: string;
  amount: number;
  currency: 'LYD' | 'USD' | 'USDT';
  status: 'مكتمل' | 'قيد المعالجة' | 'مرفوض';
};

const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
};

// Simple icon components (inline SVGs)
const LocalWalletIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M2.75 8A2.75 2.75 0 0 1 5.5 5.25h13a2.75 2.75 0 0 1 2.75 2.75v8A2.75 2.75 0 0 1 18.5 18.75h-13A2.75 2.75 0 0 1 2.75 16V8Zm2.75-.75A.75.75 0 0 0 4.75 8v8c0 .414.336.75.75.75h13a.75.75 0 0 0 .75-.75v-1.25H16a2.75 2.75 0 0 1 0-5.5h3.25V8a.75.75 0 0 0-.75-.75h-13ZM16 12.75h4a1.25 1.25 0 1 1 0 2.5h-4a1.25 1.25 0 1 1 0-2.5Z" />
  </svg>
);
const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm7.176 9a7.5 7.5 0 0 0-14.352 0h14.352Zm-14.352 1.5a7.5 7.5 0 0 0 14.352 0H4.824Z" />
  </svg>
);
const CryptoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2.25 3 7.5v9l9 5.25 9-5.25v-9L12 2.25Zm0 2.309L19.5 9v6L12 19.441 4.5 15V9L12 4.559Z" />
  </svg>
);

export default function WalletPage() {
  const router = useRouter();
  const { user } = useUserContext();
  const { walletData, isLoading: balancesLoading } = useMultiWalletBalance(user?.id);
  const [trc20Address, setTrc20Address] = useState<string>('');
  const [addressLoading, setAddressLoading] = useState<boolean>(false);
  const [recentTx, setRecentTx] = useState<Tx[]>([]);
  // const [txLoading, setTxLoading] = useState<boolean>(false);
  const notifications = useQuickNotifications();

  // Fetch TRC20 address from API
  useEffect(() => {
    const fetchAddress = async () => {
      if (!user?.id) {
        setTrc20Address('');
        return;
      }
      try {
        setAddressLoading(true);
        const res = await fetch(`/api/wallet/address/${user.id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const addr = payload?.data?.crypto?.address || '';
        setTrc20Address(addr);
      } catch {
        setTrc20Address('');
      } finally {
        setAddressLoading(false);
      }
    };
    fetchAddress();
  }, [user?.id]);

  // Fetch recent transactions from API
  useEffect(() => {
    const fetchRecent = async () => {
      if (!user?.id) {
        setRecentTx([]);
        return;
      }
      try {
        // setTxLoading(true);
        const res = await fetch(`/api/wallet/transactions/${user.id}?limit=5`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        interface ApiTransaction {
          id: string;
          createdAt: string;
          type: string;
          walletType?: string;
          amount: number;
          currency: string;
          status: string;
          paymentMethod?: { name?: string | null } | null;
        }
        const items = (payload?.data?.transactions ?? []) as ApiTransaction[];
        const mapType = (t: string): Tx['type'] => (t === 'DEPOSIT' ? 'إيداع' : 'معاملة');
        const mapStatus = (s: string): Tx['status'] =>
          s === 'COMPLETED' ? 'مكتمل' : s === 'PENDING' ? 'قيد المعالجة' : 'مرفوض';
        const mapped: Tx[] = items.map((it) => ({
          id: it.id,
          date: (it.createdAt ? new Date(it.createdAt) : new Date()).toISOString().slice(0, 10),
          type: mapType(it.type),
          method: it.paymentMethod?.name || it.walletType || '-',
          amount: Number(it.amount) || 0,
          currency: (it.currency || 'LYD') as Tx['currency'],
          status: mapStatus(it.status),
        }));
        setRecentTx(mapped);
      } catch {
        setRecentTx([]);
      } finally {
        // setTxLoading(false);
      }
    };
    fetchRecent();
  }, [user?.id]);

  // Helper to navigate on entire-card click
  const goto = (href: string) => {
    router.push(href);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Head>
        <title>المحفظة | نظرة عامة وإيداع ومعاملات</title>
      </Head>

      {/* Global Navbar visible on wallet and all subpages (included here for wallet) */}
      <OpensooqNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <nav aria-label="breadcrumbs" className="text-xs text-gray-500">
                الصفحة الرئيسية / المحفظة
              </nav>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">المحفظة</h1>
              <p className="mt-2 text-sm text-gray-600">
                تتبع أرصدتك، قم بالإيداع بسهولة، واستعرض معاملاتك في مكان واحد
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/wallet/transactions"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                سجل المعاملات
              </Link>
              <a
                href="#deposit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                بدء إيداع
              </a>
            </div>
          </div>
        </header>

        {/* Overview balances */}
        <section aria-labelledby="balances" className="mb-10">
          <div className="mb-6 flex items-center gap-4">
            <h2 id="balances" className="text-xl font-bold text-gray-900">
              نظرة عامة على الرصيد
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Local */}
            <div
              role="link"
              tabIndex={0}
              onClick={() => goto('/wallet/deposit/local')}
              onKeyDown={(e) => e.key === 'Enter' && goto('/wallet/deposit/local')}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-200"
              aria-label="فتح الإيداع للمحفظة المحلية"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-emerald-50">
                    <LocalWalletIcon className="h-4 w-4" />
                    <span>المحفظة المحلية</span>
                  </div>
                  <div className="flex items-baseline gap-2 text-2xl font-extrabold text-white">
                    <span dir="ltr">
                      {balancesLoading
                        ? '...'
                        : (walletData.local.balance || 0).toLocaleString('ar-EG', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                    </span>
                    <span className="text-lg font-bold text-white">دينار</span>
                  </div>
                  <p className="mt-1 text-xs text-white/80">العملة: الدينار الليبي (LYD)</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center justify-center rounded-md bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20 transition group-hover:bg-white/20">
                    ابدأ الإيداع
                  </span>
                </div>
              </div>
              <div className="pointer-events-none mt-4 rounded-lg border border-white/20 bg-white/10 p-3 text-xs text-white/90">
                انقر على البطاقة للانتقال إلى صفحة الإيداع المحلية
              </div>
            </div>
            {/* Global */}
            <div
              role="link"
              tabIndex={0}
              onClick={() => goto('/wallet/deposit/global')}
              onKeyDown={(e) => e.key === 'Enter' && goto('/wallet/deposit/global')}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-blue-600 p-5 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
              aria-label="فتح الإيداع للمحفظة العالمية"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-sky-50">
                    <GlobeIcon className="h-4 w-4" />
                    <span>المحفظة العالمية</span>
                  </div>
                  <div className="flex items-baseline gap-2 text-2xl font-extrabold text-white">
                    <span dir="ltr">
                      {balancesLoading
                        ? '...'
                        : (walletData.global.balance || 0).toLocaleString('ar-EG', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                    </span>
                    <span className="text-lg font-bold text-white">دولار</span>
                  </div>
                  <p className="mt-1 text-xs text-white/80">العملة: الدولار الأمريكي (USD)</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center justify-center rounded-md bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20 transition group-hover:bg-white/20">
                    ابدأ الإيداع
                  </span>
                </div>
              </div>
              <div className="pointer-events-none mt-4 rounded-lg border border-white/20 bg-white/10 p-3 text-xs text-white/90">
                انقر على البطاقة للانتقال إلى صفحة الإيداع العالمية
              </div>
            </div>
            {/* Digital */}
            <div
              role="link"
              tabIndex={0}
              onClick={() => goto('/wallet/deposit/digital/usdt-trc20')}
              onKeyDown={(e) => e.key === 'Enter' && goto('/wallet/deposit/digital/usdt-trc20')}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              aria-label="فتح الإيداع للمحفظة الرقمية"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-indigo-50">
                    <CryptoIcon className="h-4 w-4" />
                    <span>المحفظة الرقمية</span>
                  </div>
                  <div className="flex items-baseline gap-2 text-2xl font-extrabold text-white">
                    <span dir="ltr">
                      {balancesLoading
                        ? '...'
                        : (walletData.crypto.balance || 0).toLocaleString('ar-EG', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                    </span>
                    <span className="text-lg font-bold text-white">USDT</span>
                  </div>
                  <p className="mt-1 text-xs text-white/80">العملة: تيثر USDT (TRC20)</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center justify-center rounded-md bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20 transition group-hover:bg-white/20">
                    ابدأ الإيداع
                  </span>
                </div>
              </div>
              <div className="pointer-events-none mt-4 rounded-lg border border-white/20 bg-white/10 p-3 text-xs text-white/90">
                انقر على البطاقة للانتقال إلى صفحة الإيداع الرقمية
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions - أزرار سريعة */}
        <section className="mb-16">
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">الإجراءات السريعة</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <WalletQuickActions />
          </div>
        </section>

        {/* Deposit methods */}
        <section id="deposit" aria-labelledby="deposit-title" className="mb-20">
          <div className="mb-8 flex items-center gap-4">
            <h2 id="deposit-title" className="text-xl font-bold text-gray-900">
              وسائل الإيداع
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-200 to-transparent"></div>
          </div>
          <div className="rounded-3xl border-2 border-gray-100 bg-white p-8 shadow-lg">
            <div className="space-y-6">
              {/* Local methods */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">وسائل إيداع محلية</h3>
                  <span className="text-xs text-gray-500">داخل ليبيا</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Banks */}
                  <Link
                    href="/wallet/deposit/local/banks"
                    className="group relative block rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all duration-200 hover:border-2 hover:border-blue-300"
                  >
                    <div className="flex flex-col items-start gap-3">
                      <div className="flex w-full items-center justify-between">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          رسمي
                        </span>
                        <span className="text-[11px] text-gray-400">LYD</span>
                      </div>
                      <div>
                        <div className="text-base font-bold text-gray-900">عبر البنوك الليبية</div>
                        <p className="mt-1 text-xs text-gray-600">تحويل بنكي محلي مع توثيق فوري</p>
                      </div>
                      <div className="w-full">
                        <span className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white group-hover:bg-blue-700">
                          بدء الإيداع
                        </span>
                      </div>
                    </div>
                  </Link>
                  {/* Libyana */}
                  <Link
                    href="/wallet/deposit/local/libyana"
                    className="group relative block rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all duration-200 hover:border-2 hover:border-blue-300"
                  >
                    <div className="flex flex-col items-start gap-3">
                      <div className="flex w-full items-center justify-between">
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          كروت
                        </span>
                        <span className="text-[11px] text-gray-400">LYD</span>
                      </div>
                      <div>
                        <div className="text-base font-bold text-gray-900">تعبئة رصيد ليبيانا</div>
                        <p className="mt-1 text-xs text-gray-600">
                          أدخل رقم البطاقة لتعبئة رصيد المحفظة
                        </p>
                      </div>
                      <div className="w-full">
                        <span className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white group-hover:bg-blue-700">
                          بدء الإيداع
                        </span>
                      </div>
                    </div>
                  </Link>
                  {/* Madar */}
                  <Link
                    href="/wallet/deposit/local/madar"
                    className="group relative block rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all duration-200 hover:border-2 hover:border-blue-300"
                  >
                    <div className="flex flex-col items-start gap-3">
                      <div className="flex w-full items-center justify-between">
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          كروت
                        </span>
                        <span className="text-[11px] text-gray-400">LYD</span>
                      </div>
                      <div>
                        <div className="text-base font-bold text-gray-900">تعبئة رصيد مدار</div>
                        <p className="mt-1 text-xs text-gray-600">
                          أدخل رقم البطاقة لتعبئة رصيد المحفظة
                        </p>
                      </div>
                      <div className="w-full">
                        <span className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white group-hover:bg-blue-700">
                          بدء الإيداع
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Global methods */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">وسائل إيداع عالمية</h3>
                  <span className="text-xs text-gray-500">خارج ليبيا</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  {[
                    {
                      name: 'بايبال',
                      href: '/wallet/deposit/global/paypal',
                      desc: 'إيداع دولي عبر PayPal',
                    },
                    {
                      name: 'بايونير',
                      href: '/wallet/deposit/global/payoneer',
                      desc: 'استلام عبر Payoneer',
                    },
                    {
                      name: 'Wise',
                      href: '/wallet/deposit/global/wise',
                      desc: 'تحويل مصرفي دولي',
                    },
                    {
                      name: 'Payeer',
                      href: '/wallet/deposit/global/payeer',
                      desc: 'محفظة رقمية دولية',
                    },
                  ].map((m) => (
                    <Link
                      key={m.name}
                      href={m.href}
                      className="group relative block rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all duration-200 hover:border-2 hover:border-blue-300"
                    >
                      <div className="flex flex-col items-start gap-3">
                        <div className="flex w-full items-center justify-between">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                            عالمي
                          </span>
                          <span className="text-[11px] text-gray-400">USD</span>
                        </div>
                        <div>
                          <div className="text-base font-bold text-gray-900">{m.name}</div>
                          <p className="mt-1 text-xs text-gray-600">{m.desc}</p>
                        </div>
                        <div className="w-full">
                          <span className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white group-hover:bg-black">
                            طلب إيداع
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Digital crypto */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    وسائل إيداع رقمية (USDT)
                  </h3>
                  <Link
                    href="/wallet/deposit/digital"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    عرض التفاصيل
                    <svg
                      className="h-4 w-4 rtl:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Link
                    href="/wallet/deposit/digital/usdt-trc20"
                    className="group block rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-500 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">TRC20</div>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        مفضل
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">شبكة TRON</p>
                  </Link>

                  <Link
                    href="/wallet/deposit/digital/usdt-solana"
                    className="group block rounded-xl border border-gray-200 p-4 transition-all hover:border-purple-500 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">Solana</div>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                        سريع
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">شبكة Solana</p>
                  </Link>

                  <Link
                    href="/wallet/deposit/digital/usdt-bep20"
                    className="group block rounded-xl border border-gray-200 p-4 transition-all hover:border-amber-500 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">BEP20</div>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        شائع
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">BNB Smart Chain</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent transactions */}
        <section aria-labelledby="recent" className="mb-6">
          <div className="mb-8 flex items-center gap-4">
            <h2 id="recent" className="text-xl font-bold text-gray-900">
              أحدث المعاملات
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent"></div>
            <Link
              href="/wallet/transactions"
              className="text-sm font-semibold text-purple-700 hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-right">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">التاريخ</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">النوع</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">الطريقة</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">المبلغ</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-sm">
                  {recentTx.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{t.date}</td>
                      <td className="px-4 py-3 text-gray-800">{t.type}</td>
                      <td className="px-4 py-3 text-gray-800">{t.method}</td>
                      <td className="px-4 py-3 text-gray-800">
                        {formatAmount(t.amount, t.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            t.status === 'مكتمل'
                              ? 'inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700'
                              : t.status === 'قيد المعالجة'
                                ? 'inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700'
                                : 'inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700'
                          }
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
