import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { OpensooqNavbar } from '../../components/common';
import { useUserContext } from '../../contexts/UserContext';
import { useRouter } from 'next/router';

type Tx = {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'إيداع' | 'معاملة';
  method: string;
  amount: number;
  currency: 'LYD' | 'USD' | 'USDT';
  status: 'مكتمل' | 'قيد المعالجة' | 'مرفوض';
};

type WalletTransactionApiItem = {
  id: string;
  amount: number;
  type: string;
  status: string;
  currency: string;
  walletType?: string;
  description?: string | null;
  reference?: string | null;
  createdAt: string;
  paymentMethod?: { name?: string | null } | null;
};

const formatAmount = (amount: number, currency: 'LYD' | 'USD' | 'USDT' = 'LYD') => {
  const map: Record<string, string> = { LYD: 'د.ل', USD: '$', USDT: 'USDT' };
  const symbol = map[currency] ?? currency;
  return `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
};

export default function TransactionsPage() {
  const { user } = useUserContext();
  const router = useRouter();
  const _demoData: Tx[] = useMemo(
    () => [
      {
        id: 'tx-1009',
        date: '2025-08-29',
        type: 'إيداع',
        method: 'USDT (TRC20)',
        amount: 150,
        currency: 'USDT',
        status: 'مكتمل',
      },
      {
        id: 'tx-1008',
        date: '2025-08-25',
        type: 'إيداع',
        method: 'بايبال',
        amount: 50,
        currency: 'USD',
        status: 'قيد المعالجة',
      },
      {
        id: 'tx-1007',
        date: '2025-08-20',
        type: 'إيداع',
        method: 'بنك محلي',
        amount: 500,
        currency: 'LYD',
        status: 'مكتمل',
      },
      {
        id: 'tx-1006',
        date: '2025-08-18',
        type: 'إيداع',
        method: 'تعبئة رصيد ليبيانا',
        amount: 30,
        currency: 'LYD',
        status: 'مكتمل',
      },
      {
        id: 'tx-1005',
        date: '2025-08-15',
        type: 'إيداع',
        method: 'تحويل داخلي',
        amount: 75,
        currency: 'USD',
        status: 'مكتمل',
      },
      {
        id: 'tx-1004',
        date: '2025-08-10',
        type: 'إيداع',
        method: 'Payeer',
        amount: 25,
        currency: 'USD',
        status: 'مرفوض',
      },
      {
        id: 'tx-1003',
        date: '2025-08-06',
        type: 'إيداع',
        method: 'Wise',
        amount: 120,
        currency: 'USD',
        status: 'مكتمل',
      },
      {
        id: 'tx-1002',
        date: '2025-08-03',
        type: 'إيداع',
        method: 'تعبئة رصيد مدار',
        amount: 20,
        currency: 'LYD',
        status: 'مكتمل',
      },
      {
        id: 'tx-1001',
        date: '2025-08-01',
        type: 'إيداع',
        method: 'محفظة رقمية',
        amount: 40,
        currency: 'LYD',
        status: 'قيد المعالجة',
      },
    ],
    [],
  );

  const [typeFilter, setTypeFilter] = useState<'الكل' | 'إيداع' | 'معاملة'>('الكل');
  const [statusFilter, setStatusFilter] = useState<'الكل' | 'مكتمل' | 'قيد المعالجة' | 'مرفوض'>(
    'الكل',
  );
  const [walletFilter, setWalletFilter] = useState<'الكل' | 'محلي' | 'عالمي' | 'رقمي'>('الكل');

  // Real data state
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / limit)), [totalCount]);
  const abortRef = useRef<AbortController | null>(null);

  // Mappers between UI and API
  const mapTypeToApi = (val: 'الكل' | 'إيداع' | 'معاملة') =>
    val === 'إيداع' ? 'DEPOSIT' : val === 'معاملة' ? 'TRANSACTION' : undefined;
  const mapStatusToApi = (val: 'الكل' | 'مكتمل' | 'قيد المعالجة' | 'مرفوض') =>
    val === 'مكتمل' ? 'COMPLETED' : val === 'قيد المعالجة' ? 'PENDING' : val === 'مرفوض' ? 'FAILED' : undefined;
  const mapWalletToApi = (val: 'الكل' | 'محلي' | 'عالمي' | 'رقمي') =>
    val === 'محلي' ? 'LOCAL' : val === 'عالمي' ? 'GLOBAL' : val === 'رقمي' ? 'CRYPTO' : undefined;
  const toArabicType = (v: string) => (v === 'DEPOSIT' ? 'إيداع' : 'معاملة');
  const toArabicStatus = (v: string) => (v === 'COMPLETED' ? 'مكتمل' : v === 'PENDING' ? 'قيد المعالجة' : 'مرفوض');

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      const typeApi = mapTypeToApi(typeFilter);
      if (typeApi) params.set('type', typeApi);
      const statusApi = mapStatusToApi(statusFilter);
      if (statusApi) params.set('status', statusApi);
      const walletApi = mapWalletToApi(walletFilter);
      if (walletApi) params.set('walletType', walletApi);

      const res = await fetch(`/api/wallet/transactions/${user.id}?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list: WalletTransactionApiItem[] = json?.data?.transactions ?? [];
      setTotalCount(json?.data?.pagination?.totalCount ?? 0);
      const mapped: Tx[] = list.map((t) => ({
        id: t.id,
        date: new Date(t.createdAt).toISOString().slice(0, 10),
        type: toArabicType(t.type) as Tx['type'],
        method: t.paymentMethod?.name || 'غير محدد',
        amount: Number(t.amount) || 0,
        currency: (t.currency as Tx['currency']) || 'LYD',
        status: toArabicStatus(t.status) as Tx['status'],
      }));
      setTransactions(mapped);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError('فشل في جلب البيانات');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [user?.id, page, typeFilter, statusFilter, walletFilter]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter, walletFilter]);

  // Initialize from query (?walletType=LOCAL|GLOBAL|CRYPTO)
  useEffect(() => {
    const q = router.query?.walletType as string | undefined;
    if (!q) return;
    const val = q.toUpperCase();
    if (val === 'LOCAL') setWalletFilter('محلي');
    else if (val === 'GLOBAL') setWalletFilter('عالمي');
    else if (val === 'CRYPTO') setWalletFilter('رقمي');
  }, [router.query?.walletType]);

  // Fetch on mount and when deps change
  useEffect(() => {
    fetchTransactions();
    return () => abortRef.current?.abort();
  }, [fetchTransactions]);

  // Use server data directly in the table
  const filtered = transactions;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Head>
        <title>سجل المعاملات</title>
      </Head>
      <OpensooqNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">سجل المعاملات</h1>
            <p className="mt-1 text-sm text-gray-600">تتبع جميع عمليات الإيداع والمعاملات</p>
          </div>
          <Link
            href="/wallet"
            className="inline-flex items-center justify-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
          >
            العودة للمحفظة
          </Link>
        </header>

        <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="flex flex-col">
              <label className="mb-1 text-xs text-gray-500">نوع العملية</label>
              <select
                value={typeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setTypeFilter(e.target.value as 'الكل' | 'إيداع' | 'معاملة')
                }
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
              >
                <option>الكل</option>
                <option>إيداع</option>
                <option>معاملة</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs text-gray-500">حالة العملية</label>
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatusFilter(e.target.value as 'الكل' | 'مكتمل' | 'قيد المعالجة' | 'مرفوض')
                }
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
              >
                <option>الكل</option>
                <option>مكتمل</option>
                <option>قيد المعالجة</option>
                <option>مرفوض</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs text-gray-500">نوع المحفظة</label>
              <select
                value={walletFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setWalletFilter(e.target.value as 'الكل' | 'محلي' | 'عالمي' | 'رقمي')
                }
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
              >
                <option>الكل</option>
                <option>محلي</option>
                <option>عالمي</option>
                <option>رقمي</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-right">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">التاريخ</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">النوع</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">الطريقة</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">المبلغ</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">الحالة</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">المعرف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-sm">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        جارٍ التحميل...
                      </td>
                    </tr>
                  )}
                  {error && !loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  )}
                  {!loading && !error && filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        لا توجد معاملات
                      </td>
                    </tr>
                  )}
                  {!loading && !error &&
                    filtered.map((t) => (
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
                        <td className="px-4 py-3 font-mono text-gray-600">{t.id}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              الصفحة {page} من {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`rounded-md border px-3 py-1.5 ${page <= 1 ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
              >
                السابق
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={`rounded-md border px-3 py-1.5 ${page >= totalPages ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
              >
                التالي
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
