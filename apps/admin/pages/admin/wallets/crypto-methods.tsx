/**
 * صفحة إدارة وسائل الدفع الرقمية (كريبتو)
 * Cryptocurrency Payment Methods Management
 */
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CogIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface CryptoNetwork {
  id: string;
  name: string;
  nameAr: string;
  symbol: string;
  chainId?: number;
  explorerUrl?: string;
  avgConfirmationTime: string;
  avgFee: string;
  isActive: boolean;
}

interface CryptoMethod {
  id: string;
  name: string;
  nameAr: string;
  symbol: string;
  type: 'stablecoin' | 'cryptocurrency';
  networks: CryptoNetwork[];
  defaultNetwork: string;
  description: string;
  logo?: string;
  isActive: boolean;
  isPopular: boolean;
  // الحدود
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  // الرسوم
  depositFee: number;
  withdrawalFee: number;
  networkFee: number;
  processingTime: string;
  // المحفظة
  walletAddress?: string;
  privateKey?: string;
  // التكامل
  apiProvider?: string;
  apiKey?: string;
  webhookUrl?: string;
  // الحالة
  status: 'active' | 'maintenance' | 'disabled';
  lastBlockSync?: number;
  pendingDeposits: number;
  totalReceived: number;
}

const CRYPTO_NETWORKS: CryptoNetwork[] = [
  {
    id: 'trc20',
    name: 'TRON (TRC20)',
    nameAr: 'شبكة ترون',
    symbol: 'TRC20',
    explorerUrl: 'https://tronscan.org',
    avgConfirmationTime: '3-5 دقائق',
    avgFee: '$1-2',
    isActive: true,
  },
  {
    id: 'bep20',
    name: 'BNB Smart Chain (BEP20)',
    nameAr: 'شبكة بينانس',
    symbol: 'BEP20',
    chainId: 56,
    explorerUrl: 'https://bscscan.com',
    avgConfirmationTime: '5-15 دقيقة',
    avgFee: '$0.5-1',
    isActive: true,
  },
  {
    id: 'solana',
    name: 'Solana',
    nameAr: 'شبكة سولانا',
    symbol: 'SOL',
    explorerUrl: 'https://solscan.io',
    avgConfirmationTime: '1-2 دقيقة',
    avgFee: '$0.001',
    isActive: true,
  },
  {
    id: 'erc20',
    name: 'Ethereum (ERC20)',
    nameAr: 'شبكة إيثريوم',
    symbol: 'ERC20',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    avgConfirmationTime: '10-30 دقيقة',
    avgFee: '$5-50',
    isActive: false,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    nameAr: 'شبكة بوليجون',
    symbol: 'MATIC',
    chainId: 137,
    explorerUrl: 'https://polygonscan.com',
    avgConfirmationTime: '2-5 دقائق',
    avgFee: '$0.01',
    isActive: true,
  },
];

export default function CryptoMethodsPage() {
  const [methods, setMethods] = useState<CryptoMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<CryptoMethod | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'settings' | 'networks' | 'wallet'>('settings');

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/wallets/crypto-methods');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMethods(data.methods);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      // استخدام البيانات الافتراضية
    }

    // البيانات الافتراضية
    setMethods([
      {
        id: 'usdt',
        name: 'Tether USDT',
        nameAr: 'تيثر USDT',
        symbol: 'USDT',
        type: 'stablecoin',
        networks: CRYPTO_NETWORKS.filter((n) =>
          ['trc20', 'bep20', 'solana', 'erc20', 'polygon'].includes(n.id),
        ),
        defaultNetwork: 'trc20',
        description: 'العملة المستقرة الأكثر استخداماً - مرتبطة بالدولار الأمريكي 1:1',
        isActive: true,
        isPopular: true,
        minAmount: 10,
        maxAmount: 100000,
        dailyLimit: 100000,
        monthlyLimit: 1000000,
        depositFee: 0,
        withdrawalFee: 1,
        networkFee: 1,
        processingTime: '5-30 دقيقة',
        walletAddress: '',
        apiProvider: 'TronGrid',
        webhookUrl: '/api/webhooks/crypto/usdt',
        status: 'active',
        pendingDeposits: 0,
        totalReceived: 0,
      },
      {
        id: 'usdc',
        name: 'USD Coin',
        nameAr: 'يو اس دي كوين',
        symbol: 'USDC',
        type: 'stablecoin',
        networks: CRYPTO_NETWORKS.filter((n) => ['solana', 'erc20', 'polygon'].includes(n.id)),
        defaultNetwork: 'solana',
        description: 'عملة مستقرة من Circle - مدعومة بالكامل بالدولار',
        isActive: false,
        isPopular: false,
        minAmount: 10,
        maxAmount: 50000,
        dailyLimit: 50000,
        monthlyLimit: 500000,
        depositFee: 0,
        withdrawalFee: 0.5,
        networkFee: 0.5,
        processingTime: '2-15 دقيقة',
        status: 'disabled',
        pendingDeposits: 0,
        totalReceived: 0,
      },
      {
        id: 'btc',
        name: 'Bitcoin',
        nameAr: 'بيتكوين',
        symbol: 'BTC',
        type: 'cryptocurrency',
        networks: [
          {
            id: 'btc-mainnet',
            name: 'Bitcoin Mainnet',
            nameAr: 'شبكة بيتكوين الرئيسية',
            symbol: 'BTC',
            explorerUrl: 'https://blockstream.info',
            avgConfirmationTime: '10-60 دقيقة',
            avgFee: '$1-20',
            isActive: true,
          },
          {
            id: 'btc-lightning',
            name: 'Lightning Network',
            nameAr: 'شبكة البرق',
            symbol: 'LN-BTC',
            avgConfirmationTime: 'فوري',
            avgFee: '$0.001',
            isActive: false,
          },
        ],
        defaultNetwork: 'btc-mainnet',
        description: 'العملة الرقمية الأولى والأكثر شهرة',
        isActive: false,
        isPopular: true,
        minAmount: 0.0001,
        maxAmount: 10,
        dailyLimit: 10,
        monthlyLimit: 50,
        depositFee: 0,
        withdrawalFee: 0.0001,
        networkFee: 0.0001,
        processingTime: '10-60 دقيقة',
        status: 'disabled',
        pendingDeposits: 0,
        totalReceived: 0,
      },
    ]);
    setLoading(false);
  };

  const handleSaveMethod = async () => {
    if (!selectedMethod) return;

    try {
      setMethods((prev) => prev.map((m) => (m.id === selectedMethod.id ? selectedMethod : m)));
      setIsEditing(false);
      setSelectedMethod(null);
      alert('تم حفظ التغييرات بنجاح');
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const handleToggleActive = (methodId: string, currentStatus: boolean) => {
    setMethods((prev) =>
      prev.map((m) =>
        m.id === methodId
          ? {
              ...m,
              isActive: !currentStatus,
              status: !currentStatus ? 'active' : 'disabled',
            }
          : m,
      ),
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم النسخ!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'disabled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'maintenance':
        return 'صيانة';
      case 'disabled':
        return 'معطل';
      default:
        return status;
    }
  };

  const stats = {
    total: methods.length,
    active: methods.filter((m) => m.isActive).length,
    stablecoins: methods.filter((m) => m.type === 'stablecoin').length,
    crypto: methods.filter((m) => m.type === 'cryptocurrency').length,
  };

  return (
    <AdminLayout title="العملات الرقمية">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">وسائل الدفع الرقمية (كريبتو)</h2>
          <p className="text-sm text-slate-400">
            إدارة العملات الرقمية: USDT، USDC، Bitcoin، والشبكات المختلفة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadMethods}
            className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
          >
            <ArrowPathIcon className="h-4 w-4" />
            تحديث
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">إجمالي العملات</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-green-500/30 bg-green-900/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-400">{stats.active}</p>
              <p className="text-xs text-slate-400">نشطة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-blue-500/30 bg-blue-900/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-blue-400">{stats.stablecoins}</p>
              <p className="text-xs text-slate-400">عملات مستقرة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-orange-500/30 bg-orange-900/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <CurrencyDollarIcon className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-orange-400">{stats.crypto}</p>
              <p className="text-xs text-slate-400">عملات رقمية</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-900/10 p-4">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
        <div>
          <h4 className="font-medium text-yellow-400">تحذير أمني</h4>
          <p className="text-sm text-slate-400">
            احرص على تخزين المفاتيح الخاصة في مكان آمن. لا تشارك المفاتيح الخاصة مع أي شخص. استخدم
            محافظ باردة (Hardware Wallets) للمبالغ الكبيرة.
          </p>
        </div>
      </div>

      {/* Methods List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {methods.map((method) => (
            <div
              key={method.id}
              className={`rounded-xl border p-5 ${
                method.isActive
                  ? 'border-purple-500/30 bg-purple-900/10'
                  : 'border-slate-700 bg-slate-800 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-lg p-3 ${
                      method.type === 'stablecoin' ? 'bg-green-500/20' : 'bg-orange-500/20'
                    }`}
                  >
                    <CurrencyDollarIcon
                      className={`h-6 w-6 ${
                        method.type === 'stablecoin' ? 'text-green-400' : 'text-orange-400'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{method.nameAr}</h3>
                      <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                        {method.symbol}
                      </span>
                      {method.isPopular && (
                        <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                          شائع
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          method.type === 'stablecoin'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {method.type === 'stablecoin' ? 'مستقرة' : 'رقمية'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{method.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-1 text-xs ${getStatusColor(method.status)}`}
                  >
                    {getStatusLabel(method.status)}
                  </span>
                </div>
              </div>

              {/* Networks */}
              <div className="mt-4">
                <p className="mb-2 text-sm text-slate-400">الشبكات المدعومة:</p>
                <div className="flex flex-wrap gap-2">
                  {(method.networks || []).map((network) => (
                    <div
                      key={network.id}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                        network.id === method.defaultNetwork
                          ? 'border-purple-500/50 bg-purple-900/30'
                          : network.isActive
                            ? 'border-slate-600 bg-slate-700/50'
                            : 'border-slate-700 bg-slate-800/50 opacity-50'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          network.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`}
                      ></span>
                      <span className="text-sm text-white">{network.nameAr}</span>
                      <span className="text-xs text-slate-400">({network.symbol})</span>
                      {network.id === method.defaultNetwork && (
                        <span className="rounded bg-purple-500/30 px-1 text-xs text-purple-300">
                          افتراضي
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div className="rounded-lg bg-slate-700/50 p-3">
                  <p className="text-xs text-slate-400">الحد الأدنى</p>
                  <p className="font-semibold text-white">
                    {method.minAmount} {method.symbol}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-3">
                  <p className="text-xs text-slate-400">الحد الأقصى</p>
                  <p className="font-semibold text-white">
                    {method.maxAmount.toLocaleString()} {method.symbol}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-3">
                  <p className="text-xs text-slate-400">رسوم الإيداع</p>
                  <p className="font-semibold text-white">
                    {method.depositFee === 0 ? 'مجاني' : `${method.depositFee}%`}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-3">
                  <p className="text-xs text-slate-400">رسوم السحب</p>
                  <p className="font-semibold text-white">
                    {method.withdrawalFee} {method.symbol}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-3">
                  <p className="text-xs text-slate-400">وقت المعالجة</p>
                  <p className="font-semibold text-white">{method.processingTime}</p>
                </div>
              </div>

              {/* Wallet Address */}
              {method.walletAddress && (
                <div className="mt-4 rounded-lg bg-slate-700/30 p-3">
                  <p className="mb-1 text-xs text-slate-400">عنوان المحفظة:</p>
                  <div className="flex items-center gap-2">
                    <code
                      className="flex-1 rounded bg-slate-800 px-2 py-1 text-sm text-green-400"
                      dir="ltr"
                    >
                      {method.walletAddress}
                    </code>
                    <button
                      onClick={() => copyToClipboard(method.walletAddress || '')}
                      className="rounded bg-slate-700 p-2 text-slate-300 hover:bg-slate-600"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                    <button className="rounded bg-slate-700 p-2 text-slate-300 hover:bg-slate-600">
                      <QrCodeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedMethod(method);
                    setIsEditing(true);
                    setActiveTab('settings');
                  }}
                  className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600"
                >
                  <CogIcon className="h-4 w-4" />
                  إعدادات
                </button>
                <button
                  onClick={() => handleToggleActive(method.id, method.isActive)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs ${
                    method.isActive
                      ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                      : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                  }`}
                >
                  {method.isActive ? (
                    <>
                      <XCircleIcon className="h-4 w-4" />
                      تعطيل
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      تفعيل
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-slate-700 bg-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 p-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  إعدادات: {selectedMethod.nameAr} ({selectedMethod.symbol})
                </h3>
                <p className="text-xs text-slate-400">تكوين العملة والشبكات والمحفظة</p>
              </div>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedMethod(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-purple-500 text-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الإعدادات الأساسية
              </button>
              <button
                onClick={() => setActiveTab('networks')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'networks'
                    ? 'border-b-2 border-purple-500 text-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الشبكات
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'wallet'
                    ? 'border-b-2 border-purple-500 text-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                المحفظة
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">الحد الأدنى</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={selectedMethod.minAmount}
                        onChange={(e) =>
                          setSelectedMethod({
                            ...selectedMethod,
                            minAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">الحد الأقصى</label>
                      <input
                        type="number"
                        value={selectedMethod.maxAmount}
                        onChange={(e) =>
                          setSelectedMethod({
                            ...selectedMethod,
                            maxAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">الحد اليومي</label>
                      <input
                        type="number"
                        value={selectedMethod.dailyLimit}
                        onChange={(e) =>
                          setSelectedMethod({
                            ...selectedMethod,
                            dailyLimit: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">الحد الشهري</label>
                      <input
                        type="number"
                        value={selectedMethod.monthlyLimit}
                        onChange={(e) =>
                          setSelectedMethod({
                            ...selectedMethod,
                            monthlyLimit: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">رسوم الإيداع (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedMethod.depositFee}
                        onChange={(e) =>
                          setSelectedMethod({
                            ...selectedMethod,
                            depositFee: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">رسوم السحب</label>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedMethod.withdrawalFee}
                        onChange={(e) =>
                          setSelectedMethod({
                            ...selectedMethod,
                            withdrawalFee: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedMethod.isActive}
                        onChange={(e) =>
                          setSelectedMethod({
                            ...selectedMethod,
                            isActive: e.target.checked,
                            status: e.target.checked ? 'active' : 'disabled',
                          })
                        }
                        className="rounded border-slate-600 bg-slate-700"
                      />
                      <span className="text-sm text-slate-300">نشط</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedMethod.isPopular}
                        onChange={(e) =>
                          setSelectedMethod({ ...selectedMethod, isPopular: e.target.checked })
                        }
                        className="rounded border-slate-600 bg-slate-700"
                      />
                      <span className="text-sm text-slate-300">شائع</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Networks Tab */}
              {activeTab === 'networks' && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">الشبكة الافتراضية</label>
                    <select
                      value={selectedMethod.defaultNetwork}
                      onChange={(e) =>
                        setSelectedMethod({ ...selectedMethod, defaultNetwork: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                    >
                      {(selectedMethod.networks || [])
                        .filter((n) => n.isActive)
                        .map((network) => (
                          <option key={network.id} value={network.id}>
                            {network.nameAr} ({network.symbol})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <p className="mb-2 text-sm text-slate-400">الشبكات المتاحة:</p>
                    <div className="space-y-2">
                      {(selectedMethod.networks || []).map((network, index) => (
                        <div
                          key={network.id}
                          className={`flex items-center justify-between rounded-lg border p-3 ${
                            network.isActive
                              ? 'border-slate-600 bg-slate-700/50'
                              : 'border-slate-700 bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={network.isActive}
                              onChange={(e) => {
                                const updatedNetworks = [...(selectedMethod.networks || [])];
                                updatedNetworks[index] = { ...network, isActive: e.target.checked };
                                setSelectedMethod({ ...selectedMethod, networks: updatedNetworks });
                              }}
                              className="rounded border-slate-600 bg-slate-700"
                            />
                            <div>
                              <p className="text-sm font-medium text-white">{network.nameAr}</p>
                              <p className="text-xs text-slate-400">{network.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">
                              التأكيد: {network.avgConfirmationTime}
                            </p>
                            <p className="text-xs text-slate-400">الرسوم: {network.avgFee}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Tab */}
              {activeTab === 'wallet' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/10 p-3">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <ExclamationTriangleIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">تحذير أمني</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      لا تدخل المفتاح الخاص هنا إذا لم تكن متأكداً. استخدم خدمات إدارة المفاتيح
                      المتخصصة.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      عنوان المحفظة (للاستقبال)
                    </label>
                    <input
                      type="text"
                      value={selectedMethod.walletAddress || ''}
                      onChange={(e) =>
                        setSelectedMethod({ ...selectedMethod, walletAddress: e.target.value })
                      }
                      placeholder="أدخل عنوان المحفظة"
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      المفتاح الخاص (للسحب - اختياري)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showSecrets['privateKey'] ? 'text' : 'password'}
                        value={selectedMethod.privateKey || ''}
                        onChange={(e) =>
                          setSelectedMethod({ ...selectedMethod, privateKey: e.target.value })
                        }
                        placeholder="أدخل المفتاح الخاص"
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                        dir="ltr"
                      />
                      <button
                        onClick={() =>
                          setShowSecrets((prev) => ({ ...prev, privateKey: !prev.privateKey }))
                        }
                        className="rounded-lg bg-slate-700 p-2 text-slate-300 hover:bg-slate-600"
                      >
                        {showSecrets['privateKey'] ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">مزود API</label>
                    <input
                      type="text"
                      value={selectedMethod.apiProvider || ''}
                      onChange={(e) =>
                        setSelectedMethod({ ...selectedMethod, apiProvider: e.target.value })
                      }
                      placeholder="مثال: TronGrid, Infura, Alchemy"
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">مفتاح API</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showSecrets['apiKey'] ? 'text' : 'password'}
                        value={selectedMethod.apiKey || ''}
                        onChange={(e) =>
                          setSelectedMethod({ ...selectedMethod, apiKey: e.target.value })
                        }
                        placeholder="أدخل مفتاح API"
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      />
                      <button
                        onClick={() =>
                          setShowSecrets((prev) => ({ ...prev, apiKey: !prev.apiKey }))
                        }
                        className="rounded-lg bg-slate-700 p-2 text-slate-300 hover:bg-slate-600"
                      >
                        {showSecrets['apiKey'] ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-700 p-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedMethod(null);
                }}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveMethod}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
              >
                <ShieldCheckIcon className="h-4 w-4" />
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
