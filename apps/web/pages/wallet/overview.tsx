import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { OpensooqNavbar } from '../../components/common';
import { useUserContext } from '../../contexts/UserContext';
import { useMultiWalletBalance } from '../../hooks/useMultiWalletBalance';
import { useQuickNotifications } from '../../components/ui/EnhancedNotificationSystem';

// ============ Types ============
type TxMini = {
  id: string;
  createdAt: string;
  amount: number;
  currency: 'LYD' | 'USD' | 'USDT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | string;
  method: string;
};

// ============ Utilities ============
const formatAmount = (amount: number, currency: 'LYD' | 'USD' | 'USDT' = 'LYD') => {
  const map: Record<string, string> = { LYD: 'د.ل', USD: '$', USDT: 'USDT' };
  const symbol = map[currency] ?? currency;
  return `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
};

// Clipboard helper
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

// Fetch TRC20 address from API securely
const useServerTrc20Address = (userId?: string) => {
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const run = async () => {
      if (!userId) {
        setAddress('');
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/wallet/address/${userId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        setAddress(payload?.data?.crypto?.address || '');
      } catch {
        setAddress('');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [userId]);
  return { address, loading };
};

// ============ Icons ============
const IconWallet = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M2.75 8A2.75 2.75 0 0 1 5.5 5.25h13a2.75 2.75 0 0 1 2.75 2.75v8A2.75 2.75 0 0 1 18.5 18.75h-13A2.75 2.75 0 0 1 2.75 16V8Zm2.75-.75A.75.75 0 0 0 4.75 8v8c0 .414.336.75.75.75h13a.75.75 0 0 0 .75-.75v-1.25H16a2.75 2.75 0 0 1 0-5.5h3.25V8a.75.75 0 0 0-.75-.75h-13ZM16 12.75h4a1.25 1.25 0 1 1 0 2.5h-4a1.25 1.25 0 1 1 0-2.5Z" />
  </svg>
);
const IconBank = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2 3 7v2h18V7l-9-5Zm-7 9h2v8H5v-8Zm4 0h2v8H9v-8Zm4 0h2v8h-2v-8Zm4 0h2v8h-2v-8ZM3 21h18v1H3v-1Z" />
  </svg>
);
const IconCard = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M2 6.75A2.75 2.75 0 0 1 4.75 4h14.5A2.75 2.75 0 0 1 22 6.75v10.5A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V6.75ZM4 9h16V7H4v2Zm0 2v6.25c0 .414.336.75.75.75h14.5a.75.75 0 0 0 .75-.75V11H4Z" />
  </svg>
);
const IconGlobe = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm7.176 9a7.5 7.5 0 0 0-14.352 0h14.352Zm-14.352 1.5a7.5 7.5 0 0 0 14.352 0H4.824Z" />
  </svg>
);
const IconCrypto = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2.25 3 7.5v9l9 5.25 9-5.25v-9L12 2.25Zm0 2.309L19.5 9v6L12 19.441 4.5 15V9L12 4.559Z" />
  </svg>
);

// ============ Types ============

type Category = 'الكل' | 'محلي' | 'عالمي' | 'رقمي';

type Method = {
  key:
    | 'local-banks'
    | 'local-libyana'
    | 'local-madar'
    | 'global-paypal'
    | 'global-payoneer'
    | 'global-wise'
    | 'global-payeer'
    | 'digital-usdt-trc20';
  name: string;
  desc: string;
  href: string;
  currency: 'LYD' | 'USD' | 'USDT';
  badge: string;
  category: Exclude<Category, 'الكل'>;
  color: 'blue' | 'amber' | 'emerald' | 'slate' | 'purple';
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
};

// ============ Page ============
export default function WalletOverviewPage() {
  const { user } = useUserContext();
  const { walletData, isLoading: balancesLoading } = useMultiWalletBalance(user?.id);
  const { address: trc20Address, loading: addrLoading } = useServerTrc20Address(user?.id);
  const notifications = useQuickNotifications();

  const categories: Category[] = ['الكل', 'محلي', 'عالمي', 'رقمي'];
  const [active, setActive] = useState<Category>('الكل');

  // Recent transactions per wallet type (preview)
  const [recentLocal, setRecentLocal] = useState<TxMini[]>([]);
  const [recentGlobal, setRecentGlobal] = useState<TxMini[]>([]);
  const [recentCrypto, setRecentCrypto] = useState<TxMini[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const statusLabel = (s: string) =>
    s === 'COMPLETED' ? 'مكتمل' : s === 'PENDING' ? 'قيد المعالجة' : s === 'FAILED' ? 'مرفوض' : s === 'CANCELLED' ? 'ملغي' : 'غير معروف';

  useEffect(() => {
    const run = async () => {
      if (!user?.id) {
        setRecentLocal([]);
        setRecentGlobal([]);
        setRecentCrypto([]);
        return;
      }
      try {
        setTxLoading(true);
        setTxError(null);
        const make = async (walletType: 'LOCAL' | 'GLOBAL' | 'CRYPTO') => {
          const res = await fetch(`/api/wallet/transactions/${user.id}?walletType=${walletType}&limit=3`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const list = (json?.data?.transactions ?? []) as Array<{
            id: string;
            amount: number;
            currency: 'LYD' | 'USD' | 'USDT';
            status: string;
            createdAt: string;
            paymentMethod?: { name?: string | null } | null;
          }>;
          return list.map<TxMini>((t) => ({
            id: t.id,
            createdAt: t.createdAt,
            amount: Number(t.amount) || 0,
            currency: (t.currency as TxMini['currency']) || 'LYD',
            status: t.status,
            method: t.paymentMethod?.name || 'غير محدد',
          }));
        };

        const [loc, glo, cry] = await Promise.all([
          make('LOCAL'),
          make('GLOBAL'),
          make('CRYPTO'),
        ]);
        setRecentLocal(loc);
        setRecentGlobal(glo);
        setRecentCrypto(cry);
      } catch (e) {
        setTxError('فشل في جلب آخر المعاملات');
      } finally {
        setTxLoading(false);
      }
    };
    run();
  }, [user?.id]);

  const methods: Method[] = useMemo(
    () => [
      {
        key: 'local-banks',
        name: 'البنوك الليبية',
        desc: 'تحويل بنكي محلي مع توثيق سريع',
        href: '/wallet/deposit/local/banks',
        currency: 'LYD',
        badge: 'رسمي',
        category: 'محلي',
        color: 'blue',
        icon: IconBank,
      },
      {
        key: 'local-libyana',
        name: 'تعبئة رصيد ليبيانا',
        desc: 'أدخل رقم البطاقة لتعبئة المحفظة',
        href: '/wallet/deposit/local/libyana',
        currency: 'LYD',
        badge: 'بطاقات',
        category: 'محلي',
        color: 'amber',
        icon: IconCard,
      },
      {
        key: 'local-madar',
        name: 'تعبئة رصيد مدار',
        desc: 'أدخل رقم البطاقة لتعبئة المحفظة',
        href: '/wallet/deposit/local/madar',
        currency: 'LYD',
        badge: 'بطاقات',
        category: 'محلي',
        color: 'emerald',
        icon: IconCard,
      },
      {
        key: 'global-paypal',
        name: 'PayPal',
        desc: 'إيداع دولي عبر PayPal',
        href: '/wallet/deposit/global/paypal',
        currency: 'USD',
        badge: 'عالمي',
        category: 'عالمي',
        color: 'slate',
        icon: IconGlobe,
      },
      {
        key: 'global-payoneer',
        name: 'Payoneer',
        desc: 'استلام دولي عبر Payoneer',
        href: '/wallet/deposit/global/payoneer',
        currency: 'USD',
        badge: 'عالمي',
        category: 'عالمي',
        color: 'slate',
        icon: IconGlobe,
      },
      {
        key: 'global-wise',
        name: 'Wise',
        desc: 'تحويل مصرفي دولي',
        href: '/wallet/deposit/global/wise',
        currency: 'USD',
        badge: 'عالمي',
        category: 'عالمي',
        color: 'slate',
        icon: IconGlobe,
      },
      {
        key: 'global-payeer',
        name: 'Payeer',
        desc: 'محفظة رقمية دولية',
        href: '/wallet/deposit/global/payeer',
        currency: 'USD',
        badge: 'عالمي',
        category: 'عالمي',
        color: 'slate',
        icon: IconGlobe,
      },
      {
        key: 'digital-usdt-trc20',
        name: 'USDT - TRC20',
        desc: 'إيداع عملات رقمية (TRC20)',
        href: '/wallet/deposit/digital/usdt-trc20',
        currency: 'USDT',
        badge: 'رقمي',
        category: 'رقمي',
        color: 'purple',
        icon: IconCrypto,
      },
    ],
    [],
  );

  const shown = useMemo(
    () => (active === 'الكل' ? methods : methods.filter((m) => m.category === active)),
    [active, methods],
  );

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Head>
        <title>المحفظة — نظرة عامة متقدمة</title>
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <nav aria-label="breadcrumbs" className="text-xs text-gray-500">
                المحفظة / نظرة عامة على الرصيد
              </nav>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                نظرة عامة متقدمة
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                استعرض أرصدتك واختر وسيلة الإيداع المناسبة من بطاقات حديثة وجميلة
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/wallet"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                العودة للمحفظة
              </Link>
              <Link
                href="/wallet/transactions"
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                سجل المعاملات
              </Link>
            </div>
          </div>
        </header>

        {/* Balances summary */}
        <section className="mb-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-blue-700">
                    <IconWallet className="h-4 w-4" />
                    <span>المحفظة المحلية</span>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">
                    {balancesLoading
                      ? '...'
                      : formatAmount(walletData.local.balance || 0, 'LYD')}
                  </div>
                  <p className="mt-1 text-xs text-gray-600">الدينار الليبي (LYD)</p>
                </div>
                <span className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-blue-700/10 transition group-hover:bg-blue-700">
                  إيداع
                </span>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <IconGlobe className="h-4 w-4" />
                    <span>المحفظة العالمية</span>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">
                    {balancesLoading
                      ? '...'
                      : formatAmount(walletData.global.balance || 0, 'USD')}
                  </div>
                  <p className="mt-1 text-xs text-gray-600">الدولار الأمريكي (USD)</p>
                </div>
                <span className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-emerald-700/10 transition group-hover:bg-emerald-700">
                  إيداع
                </span>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-purple-700">
                    <IconCrypto className="h-4 w-4" />
                    <span>المحفظة الرقمية</span>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">
                    {balancesLoading
                      ? '...'
                      : formatAmount(walletData.crypto.balance || 0, 'USDT')}
                  </div>
                  <p className="mt-1 text-xs text-gray-600">تيثر USDT (TRC20)</p>
                </div>
                <span className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-purple-700/10 transition group-hover:bg-purple-700">
                  إيداع
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent transactions preview */}
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">آخر المعاملات</h2>
            <Link href="/wallet/transactions" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              عرض الكل
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Local */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 text-sm font-semibold text-gray-900">محلية (LYD)</div>
              {txLoading ? (
                <div className="py-4 text-sm text-gray-500">جارٍ التحميل...</div>
              ) : txError ? (
                <div className="py-4 text-sm text-red-600">{txError}</div>
              ) : recentLocal.length === 0 ? (
                <div className="py-4 text-sm text-gray-500">لا توجد معاملات</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentLocal.map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatAmount(t.amount, t.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(t.createdAt).toLocaleDateString('ar-EG-u-nu-latn')} • {t.method}
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        t.status === 'COMPLETED'
                          ? 'bg-green-50 text-green-700'
                          : t.status === 'PENDING'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                      }`}>
                        {statusLabel(t.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Global */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 text-sm font-semibold text-gray-900">عالمية (USD)</div>
              {txLoading ? (
                <div className="py-4 text-sm text-gray-500">جارٍ التحميل...</div>
              ) : txError ? (
                <div className="py-4 text-sm text-red-600">{txError}</div>
              ) : recentGlobal.length === 0 ? (
                <div className="py-4 text-sm text-gray-500">لا توجد معاملات</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentGlobal.map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatAmount(t.amount, t.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(t.createdAt).toLocaleDateString('ar-EG-u-nu-latn')} • {t.method}
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        t.status === 'COMPLETED'
                          ? 'bg-green-50 text-green-700'
                          : t.status === 'PENDING'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                      }`}>
                        {statusLabel(t.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Crypto */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 text-sm font-semibold text-gray-900">رقمية (USDT)</div>
              {txLoading ? (
                <div className="py-4 text-sm text-gray-500">جارٍ التحميل...</div>
              ) : txError ? (
                <div className="py-4 text-sm text-red-600">{txError}</div>
              ) : recentCrypto.length === 0 ? (
                <div className="py-4 text-sm text-gray-500">لا توجد معاملات</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentCrypto.map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatAmount(t.amount, t.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(t.createdAt).toLocaleDateString('ar-EG-u-nu-latn')} • {t.method}
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        t.status === 'COMPLETED'
                          ? 'bg-green-50 text-green-700'
                          : t.status === 'PENDING'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                      }`}>
                        {statusLabel(t.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                active === c
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Methods grid */}
        <section aria-labelledby="deposit-methods">
          <h2 id="deposit-methods" className="sr-only">
            وسائل الإيداع
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((m) => (
              <Link
                key={m.key}
                href={m.href}
                className="group relative block aspect-square overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all duration-200 hover:border-2 hover:border-blue-300"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        m.color === 'blue'
                          ? 'bg-blue-50 text-blue-700'
                          : m.color === 'amber'
                            ? 'bg-amber-50 text-amber-700'
                            : m.color === 'emerald'
                              ? 'bg-emerald-50 text-emerald-700'
                              : m.color === 'purple'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {m.badge}
                    </span>
                    <span className="text-[11px] text-gray-400">{m.currency}</span>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <m.icon
                      className={`h-6 w-6 ${
                        m.color === 'blue'
                          ? 'text-blue-600'
                          : m.color === 'amber'
                            ? 'text-amber-600'
                            : m.color === 'emerald'
                              ? 'text-emerald-600'
                              : m.color === 'purple'
                                ? 'text-purple-600'
                                : 'text-gray-700'
                      }`}
                    />
                    <div>
                      <div className="text-base font-bold text-gray-900">{m.name}</div>
                      <p className="mt-1 text-xs text-gray-600">{m.desc}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-3">
                    <span
                      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-xs font-semibold text-white transition ${
                        m.color === 'blue'
                          ? 'bg-blue-600 group-hover:bg-blue-700'
                          : m.color === 'amber'
                            ? 'bg-amber-600 group-hover:bg-amber-700'
                            : m.color === 'emerald'
                              ? 'bg-emerald-600 group-hover:bg-emerald-700'
                              : m.color === 'purple'
                                ? 'bg-purple-600 group-hover:bg-purple-700'
                                : 'bg-gray-900 group-hover:bg-black'
                      }`}
                    >
                      متابعة الإيداع
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Digital helper (optional quick view) */}
        <section className="mt-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-gray-900">
              عنوان USDT (TRC20) الخاص بك
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <code className="break-all rounded-md bg-gray-50 px-3 py-2 text-gray-800">
                {addrLoading ? 'جارٍ التحميل...' : trc20Address || 'غير متاح'}
              </code>
              <button
                onClick={async () => {
                  if (trc20Address) {
                    await copyToClipboard(trc20Address);
                    notifications.success('تم النسخ', 'تم نسخ العنوان');
                  }
                }}
                className="rounded-md bg-green-600 px-3 py-2 font-semibold text-white hover:bg-green-700"
              >
                نسخ العنوان
              </button>
              {trc20Address && (
                <a
                  href={`https://tronscan.org/#/address/${trc20Address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-gray-300 px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  فتح على Tronscan
                </a>
              )}
              <Link
                href="/wallet/deposit/digital/usdt-trc20"
              >
                الانتقال إلى صفحة الإرشادات
              </Link>
            </div>
            <p className="mt-2 text-xs text-gray-500">عنوان الإيداع يتم جلبه من الخادم بشكل آمن.</p>
          </div>
        </section>

        {/* Info box */}
        <section className="mt-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-sm">
            <div className="font-semibold text-gray-900">ملاحظات عامة</div>
            <ul className="mt-2 list-disc space-y-1 pr-5">
              <li>قد تختلف رسوم المعالجة حسب الوسيلة المختارة.</li>
              <li>تأكد من العملة والشبكة الصحيحة قبل إرسال أي تحويل.</li>
              <li>بعد الإرسال، يمكنك متابعة الحالة من سجل المعاملات.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
