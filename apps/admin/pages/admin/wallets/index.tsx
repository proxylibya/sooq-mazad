/**
 * صفحة إدارة المحافظ - Enterprise Edition
 * نظام شامل لإدارة المحافظ الثلاث: المحلية، العالمية، الرقمية
 */
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  CogIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  EyeIcon,
  FunnelIcon,
  GlobeAltIcon,
  LockClosedIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

// أنواع المحافظ
type WalletType = 'ALL' | 'LOCAL' | 'GLOBAL' | 'CRYPTO';

interface WalletStats {
  // إجماليات عامة
  totalWallets: number;
  activeWallets: number;
  frozenWallets: number;

  // أرصدة حسب النوع
  localBalance: number;
  globalBalance: number;
  cryptoBalance: number;

  // إحصائيات الإيداع
  totalDeposits: number;
  pendingDeposits: number;
  todayDeposits: number;

  // إحصائيات السحب
  totalWithdrawals: number;
  pendingWithdrawals: number;
  todayWithdrawals: number;
}

interface WalletData {
  id: string;
  publicId: number;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  isActive: boolean;
  localBalance: number;
  globalBalance: number;
  cryptoBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  lastActivity: string;
  createdAt: string;
}

export default function WalletsPage() {
  const [stats, setStats] = useState<WalletStats>({
    totalWallets: 0,
    activeWallets: 0,
    frozenWallets: 0,
    localBalance: 0,
    globalBalance: 0,
    cryptoBalance: 0,
    totalDeposits: 0,
    pendingDeposits: 0,
    todayDeposits: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    todayWithdrawals: 0,
  });
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [walletTypeFilter, setWalletTypeFilter] = useState<WalletType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'FROZEN'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchWallets();
  }, [currentPage, walletTypeFilter, statusFilter]);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(walletTypeFilter !== 'ALL' && { walletType: walletTypeFilter }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/wallets?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // تحويل البيانات للشكل المطلوب
          const mappedWallets = (data.wallets || []).map((w: any) => ({
            id: w.id,
            publicId: w.publicId || 0,
            userId: w.user?.id || '',
            userName: w.user?.name || 'مستخدم غير معروف',
            userPhone: w.user?.phone || '',
            userEmail: w.user?.email || '',
            isActive: w.isActive,
            localBalance: w.localBalance || 0,
            globalBalance: w.globalBalance || 0,
            cryptoBalance: w.cryptoBalance || 0,
            totalDeposits: w.totalDeposits || 0,
            totalWithdrawals: w.totalWithdrawals || 0,
            lastActivity: w.updatedAt || w.createdAt,
            createdAt: w.createdAt,
          }));
          setWallets(mappedWallets);
          setTotalPages(data.pages || 1);

          // حساب الإحصائيات من البيانات
          calculateStats(mappedWallets);
        }
      }
    } catch (err) {
      console.error('Error fetching wallets:', err);
      // بيانات وهمية للتطوير
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockWallets: WalletData[] = [
      {
        id: 'wallet-001',
        publicId: 1001,
        userId: 'user-001',
        userName: 'محمد أحمد الليبي',
        userPhone: '+218912345678',
        userEmail: 'mohammed@example.com',
        isActive: true,
        localBalance: 15000,
        globalBalance: 250,
        cryptoBalance: 100,
        totalDeposits: 50000,
        totalWithdrawals: 20000,
        lastActivity: new Date().toISOString(),
        createdAt: '2024-01-01',
      },
      {
        id: 'wallet-002',
        publicId: 1002,
        userId: 'user-002',
        userName: 'علي حسن',
        userPhone: '+218923456789',
        userEmail: 'ali@example.com',
        isActive: true,
        localBalance: 8500,
        globalBalance: 0,
        cryptoBalance: 50,
        totalDeposits: 25000,
        totalWithdrawals: 12000,
        lastActivity: new Date().toISOString(),
        createdAt: '2024-01-05',
      },
      {
        id: 'wallet-003',
        publicId: 1003,
        userId: 'user-003',
        userName: 'سالم محمود',
        userPhone: '+218934567890',
        userEmail: 'salem@example.com',
        isActive: false,
        localBalance: 0,
        globalBalance: 0,
        cryptoBalance: 0,
        totalDeposits: 10000,
        totalWithdrawals: 10000,
        lastActivity: '2024-01-15',
        createdAt: '2024-01-10',
      },
      {
        id: 'wallet-004',
        publicId: 1004,
        userId: 'user-004',
        userName: 'أحمد الطرابلسي',
        userPhone: '+218945678901',
        userEmail: 'ahmed.t@example.com',
        isActive: true,
        localBalance: 25000,
        globalBalance: 500,
        cryptoBalance: 200,
        totalDeposits: 80000,
        totalWithdrawals: 30000,
        lastActivity: new Date().toISOString(),
        createdAt: '2024-01-02',
      },
    ];

    setWallets(mockWallets);
    calculateStats(mockWallets);
  };

  const calculateStats = (walletList: WalletData[]) => {
    const newStats: WalletStats = {
      totalWallets: walletList.length,
      activeWallets: walletList.filter((w) => w.isActive).length,
      frozenWallets: walletList.filter((w) => !w.isActive).length,
      localBalance: walletList.reduce((sum, w) => sum + w.localBalance, 0),
      globalBalance: walletList.reduce((sum, w) => sum + w.globalBalance, 0),
      cryptoBalance: walletList.reduce((sum, w) => sum + w.cryptoBalance, 0),
      totalDeposits: walletList.reduce((sum, w) => sum + w.totalDeposits, 0),
      pendingDeposits: 12500, // سيأتي من API
      todayDeposits: 5000, // سيأتي من API
      totalWithdrawals: walletList.reduce((sum, w) => sum + w.totalWithdrawals, 0),
      pendingWithdrawals: 8000, // سيأتي من API
      todayWithdrawals: 3000, // سيأتي من API
    };
    setStats(newStats);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchWallets();
  };

  const toggleWalletStatus = async (walletId: string, currentStatus: boolean) => {
    if (!confirm(currentStatus ? 'هل تريد تجميد هذه المحفظة؟' : 'هل تريد تفعيل هذه المحفظة؟'))
      return;

    try {
      const res = await fetch(`/api/admin/wallets?id=${walletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setWallets((prev) =>
          prev.map((w) => (w.id === walletId ? { ...w, isActive: !currentStatus } : w)),
        );
        alert(currentStatus ? 'تم تجميد المحفظة' : 'تم تفعيل المحفظة');
      }
    } catch (err) {
      alert('حدث خطأ أثناء تحديث حالة المحفظة');
    }
  };

  const formatLYD = (amount: number) => {
    return new Intl.NumberFormat('ar-LY').format(amount) + ' د.ل';
  };

  const formatUSD = (amount: number) => {
    return '$' + new Intl.NumberFormat('en-US').format(amount);
  };

  const formatUSDT = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' USDT';
  };

  const filteredWallets = wallets.filter((wallet) => {
    const matchesSearch =
      wallet.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.userPhone.includes(searchTerm) ||
      wallet.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      walletTypeFilter === 'ALL' ||
      (walletTypeFilter === 'LOCAL' && wallet.localBalance > 0) ||
      (walletTypeFilter === 'GLOBAL' && wallet.globalBalance > 0) ||
      (walletTypeFilter === 'CRYPTO' && wallet.cryptoBalance > 0);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && wallet.isActive) ||
      (statusFilter === 'FROZEN' && !wallet.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <AdminLayout title="إدارة المحافظ">
      {/* إحصائيات المحافظ الثلاث */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-white">ملخص الأرصدة حسب نوع المحفظة</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* المحفظة المحلية */}
          <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-2">
                  <BanknotesIcon className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-emerald-300">المحفظة المحلية</p>
                  <p className="text-2xl font-bold text-white">{formatLYD(stats.localBalance)}</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                LYD
              </span>
            </div>
            <div className="mt-3 text-xs text-emerald-400">
              بنوك ليبية - كروت ليبيانا - كروت مدار
            </div>
          </div>

          {/* المحفظة العالمية */}
          <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/20 p-2">
                  <GlobeAltIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-300">المحفظة العالمية</p>
                  <p className="text-2xl font-bold text-white">{formatUSD(stats.globalBalance)}</p>
                </div>
              </div>
              <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300">
                USD
              </span>
            </div>
            <div className="mt-3 text-xs text-blue-400">PayPal - Payoneer - Wise - Payeer</div>
          </div>

          {/* المحفظة الرقمية */}
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/20 p-2">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-300">المحفظة الرقمية</p>
                  <p className="text-2xl font-bold text-white">{formatUSDT(stats.cryptoBalance)}</p>
                </div>
              </div>
              <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300">
                USDT
              </span>
            </div>
            <div className="mt-3 text-xs text-purple-400">TRC20 - Solana - BEP20</div>
          </div>
        </div>
      </div>

      {/* إحصائيات عامة */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <WalletIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.totalWallets}</p>
              <p className="text-xs text-slate-400">إجمالي المحافظ</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <LockOpenIcon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.activeWallets}</p>
              <p className="text-xs text-slate-400">محافظ نشطة</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/20 p-2">
              <LockClosedIcon className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.frozenWallets}</p>
              <p className="text-xs text-slate-400">محافظ مجمدة</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2">
              <ArrowDownIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{formatLYD(stats.todayDeposits)}</p>
              <p className="text-xs text-slate-400">إيداعات اليوم</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <ClockIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{formatLYD(stats.pendingDeposits)}</p>
              <p className="text-xs text-slate-400">إيداعات معلقة</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <ArrowUpIcon className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{formatLYD(stats.pendingWithdrawals)}</p>
              <p className="text-xs text-slate-400">سحوبات معلقة</p>
            </div>
          </div>
        </div>
      </div>

      {/* الإجراءات السريعة */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/admin/wallets/deposits"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <ArrowDownIcon className="h-4 w-4" />
          الإيداعات
          {stats.pendingDeposits > 0 && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">معلقة</span>
          )}
        </Link>
        <Link
          href="/admin/wallets/withdrawals"
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
        >
          <ArrowUpIcon className="h-4 w-4" />
          طلبات السحب
          {stats.pendingWithdrawals > 0 && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">معلقة</span>
          )}
        </Link>
        <Link
          href="/admin/wallets/transactions"
          className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
        >
          <ChartBarIcon className="h-4 w-4" />
          سجل المعاملات
        </Link>
        <Link
          href="/admin/wallets/payment-methods"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <CreditCardIcon className="h-4 w-4" />
          طرق الدفع
        </Link>
        <Link
          href="/admin/wallets/settings"
          className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
        >
          <CogIcon className="h-4 w-4" />
          الإعدادات
        </Link>
      </div>

      {/* البحث والفلترة */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[200px] flex-1">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث بالاسم، الهاتف، البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-4 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-slate-400" />
          <select
            value={walletTypeFilter}
            onChange={(e) => setWalletTypeFilter(e.target.value as WalletType)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">جميع المحافظ</option>
            <option value="LOCAL">المحلية (LYD)</option>
            <option value="GLOBAL">العالمية (USD)</option>
            <option value="CRYPTO">الرقمية (USDT)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'FROZEN')}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="ACTIVE">نشطة</option>
            <option value="FROZEN">مجمدة</option>
          </select>
        </div>
      </div>

      {/* جدول المحافظ */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredWallets.length === 0 ? (
          <div className="py-12 text-center">
            <WalletIcon className="mx-auto h-12 w-12 text-slate-500" />
            <p className="mt-2 text-slate-400">لا توجد محافظ مطابقة للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-slate-700 bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    المستخدم
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    <span className="flex items-center gap-1">
                      <BanknotesIcon className="h-4 w-4 text-emerald-400" />
                      محلية (LYD)
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    <span className="flex items-center gap-1">
                      <GlobeAltIcon className="h-4 w-4 text-blue-400" />
                      عالمية (USD)
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    <span className="flex items-center gap-1">
                      <CurrencyDollarIcon className="h-4 w-4 text-purple-400" />
                      رقمية (USDT)
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    آخر نشاط
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredWallets.map((wallet) => (
                  <tr key={wallet.id} className="transition-colors hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div>
                        <Link
                          href={`/admin/wallets/${wallet.id}`}
                          className="font-medium text-white hover:text-blue-400"
                        >
                          {wallet.userName}
                        </Link>
                        <p className="text-xs text-slate-400">{wallet.userPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${wallet.localBalance > 0 ? 'text-emerald-400' : 'text-slate-500'}`}
                      >
                        {formatLYD(wallet.localBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${wallet.globalBalance > 0 ? 'text-blue-400' : 'text-slate-500'}`}
                      >
                        {formatUSD(wallet.globalBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${wallet.cryptoBalance > 0 ? 'text-purple-400' : 'text-slate-500'}`}
                      >
                        {formatUSDT(wallet.cryptoBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {wallet.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                          <LockOpenIcon className="h-3 w-3" />
                          نشطة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
                          <LockClosedIcon className="h-3 w-3" />
                          مجمدة
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(wallet.lastActivity).toLocaleDateString('ar-LY')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/wallets/${wallet.id}`}
                          className="rounded bg-blue-600 p-1.5 text-white transition-colors hover:bg-blue-700"
                          title="عرض التفاصيل"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => toggleWalletStatus(wallet.id, wallet.isActive)}
                          className={`rounded p-1.5 text-white transition-colors ${
                            wallet.isActive
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          title={wallet.isActive ? 'تجميد المحفظة' : 'تفعيل المحفظة'}
                        >
                          {wallet.isActive ? (
                            <LockClosedIcon className="h-4 w-4" />
                          ) : (
                            <LockOpenIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-700 px-4 py-3">
            <p className="text-sm text-slate-400">
              صفحة {currentPage} من {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-600 px-3 py-1 text-sm text-white disabled:opacity-50"
              >
                السابق
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-600 px-3 py-1 text-sm text-white disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
