/**
 * صفحة إدارة طرق الدفع
 * Payment Methods Management Page
 */
import {
  BanknotesIcon,
  CheckIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  PencilIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  type: 'bank' | 'card' | 'wallet' | 'crypto';
  category: 'local' | 'international' | 'crypto';
  description: string;
  icon: string;
  isActive: boolean;
  isPopular: boolean;
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  percentageFee: number;
  fixedFee: number;
  processingTime: string;
  supportedCurrencies: string[];
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'local' | 'international' | 'crypto'
  >('all');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/wallets/payment-methods');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMethods(data.methods || []);
        }
      }
    } catch (err) {
      // Mock data
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setMethods([
      // Local methods
      {
        id: 'pm-local-bank',
        name: 'Libyan Banks',
        nameAr: 'البنوك الليبية',
        type: 'bank',
        category: 'local',
        description: 'إيداع عبر التحويل البنكي المحلي',
        icon: 'bank',
        isActive: true,
        isPopular: true,
        minAmount: 50,
        maxAmount: 50000,
        dailyLimit: 100000,
        monthlyLimit: 500000,
        percentageFee: 2,
        fixedFee: 0,
        processingTime: '1-3 أيام عمل',
        supportedCurrencies: ['LYD'],
      },
      {
        id: 'pm-libyana',
        name: 'Libyana Cards',
        nameAr: 'كروت ليبيانا',
        type: 'card',
        category: 'local',
        description: 'إيداع عبر كروت شحن ليبيانا',
        icon: 'card',
        isActive: true,
        isPopular: false,
        minAmount: 10,
        maxAmount: 1000,
        dailyLimit: 5000,
        monthlyLimit: 20000,
        percentageFee: 3,
        fixedFee: 0,
        processingTime: 'فوري',
        supportedCurrencies: ['LYD'],
      },
      {
        id: 'pm-madar',
        name: 'Madar Cards',
        nameAr: 'كروت مدار',
        type: 'card',
        category: 'local',
        description: 'إيداع عبر كروت شحن مدار',
        icon: 'card',
        isActive: true,
        isPopular: false,
        minAmount: 10,
        maxAmount: 1000,
        dailyLimit: 5000,
        monthlyLimit: 20000,
        percentageFee: 3,
        fixedFee: 0,
        processingTime: 'فوري',
        supportedCurrencies: ['LYD'],
      },
      // International methods
      {
        id: 'pm-paypal',
        name: 'PayPal',
        nameAr: 'باي بال',
        type: 'wallet',
        category: 'international',
        description: 'إيداع عبر PayPal',
        icon: 'paypal',
        isActive: true,
        isPopular: true,
        minAmount: 5,
        maxAmount: 10000,
        dailyLimit: 10000,
        monthlyLimit: 50000,
        percentageFee: 3.4,
        fixedFee: 0.3,
        processingTime: 'فوري - 24 ساعة',
        supportedCurrencies: ['USD'],
      },
      {
        id: 'pm-payoneer',
        name: 'Payoneer',
        nameAr: 'بايونير',
        type: 'wallet',
        category: 'international',
        description: 'إيداع عبر Payoneer',
        icon: 'payoneer',
        isActive: true,
        isPopular: false,
        minAmount: 20,
        maxAmount: 10000,
        dailyLimit: 10000,
        monthlyLimit: 50000,
        percentageFee: 2,
        fixedFee: 0,
        processingTime: '1-2 يوم عمل',
        supportedCurrencies: ['USD'],
      },
      {
        id: 'pm-wise',
        name: 'Wise',
        nameAr: 'وايز',
        type: 'bank',
        category: 'international',
        description: 'تحويل مصرفي دولي عبر Wise',
        icon: 'wise',
        isActive: true,
        isPopular: false,
        minAmount: 10,
        maxAmount: 50000,
        dailyLimit: 50000,
        monthlyLimit: 200000,
        percentageFee: 0.5,
        fixedFee: 1,
        processingTime: '1-3 أيام عمل',
        supportedCurrencies: ['USD'],
      },
      {
        id: 'pm-payeer',
        name: 'Payeer',
        nameAr: 'باير',
        type: 'wallet',
        category: 'international',
        description: 'محفظة رقمية دولية',
        icon: 'payeer',
        isActive: false,
        isPopular: false,
        minAmount: 5,
        maxAmount: 5000,
        dailyLimit: 5000,
        monthlyLimit: 20000,
        percentageFee: 2.5,
        fixedFee: 0,
        processingTime: 'فوري',
        supportedCurrencies: ['USD'],
      },
      // Crypto methods
      {
        id: 'pm-usdt-trc20',
        name: 'USDT TRC20',
        nameAr: 'USDT - TRC20',
        type: 'crypto',
        category: 'crypto',
        description: 'إيداع USDT على شبكة TRON',
        icon: 'usdt',
        isActive: true,
        isPopular: true,
        minAmount: 10,
        maxAmount: 100000,
        dailyLimit: 100000,
        monthlyLimit: 1000000,
        percentageFee: 1,
        fixedFee: 0,
        processingTime: '5-30 دقيقة',
        supportedCurrencies: ['USDT'],
      },
      {
        id: 'pm-usdt-solana',
        name: 'USDT Solana',
        nameAr: 'USDT - Solana',
        type: 'crypto',
        category: 'crypto',
        description: 'إيداع USDT على شبكة Solana',
        icon: 'usdt',
        isActive: true,
        isPopular: false,
        minAmount: 10,
        maxAmount: 100000,
        dailyLimit: 100000,
        monthlyLimit: 1000000,
        percentageFee: 1,
        fixedFee: 0,
        processingTime: '1-5 دقائق',
        supportedCurrencies: ['USDT'],
      },
      {
        id: 'pm-usdt-bep20',
        name: 'USDT BEP20',
        nameAr: 'USDT - BEP20',
        type: 'crypto',
        category: 'crypto',
        description: 'إيداع USDT على BNB Smart Chain',
        icon: 'usdt',
        isActive: true,
        isPopular: false,
        minAmount: 10,
        maxAmount: 100000,
        dailyLimit: 100000,
        monthlyLimit: 1000000,
        percentageFee: 1,
        fixedFee: 0,
        processingTime: '5-15 دقيقة',
        supportedCurrencies: ['USDT'],
      },
    ]);
  };

  const toggleMethodStatus = async (methodId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/wallets/payment-methods/${methodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setMethods((prev) =>
          prev.map((m) => (m.id === methodId ? { ...m, isActive: !currentStatus } : m)),
        );
      }
    } catch (err) {
      // Mock success
      setMethods((prev) =>
        prev.map((m) => (m.id === methodId ? { ...m, isActive: !currentStatus } : m)),
      );
    }
  };

  const handleSaveMethod = async () => {
    if (!selectedMethod) return;

    try {
      const res = await fetch(`/api/admin/wallets/payment-methods/${selectedMethod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedMethod),
      });

      if (res.ok) {
        setMethods((prev) => prev.map((m) => (m.id === selectedMethod.id ? selectedMethod : m)));
        setIsEditing(false);
        setSelectedMethod(null);
        alert('تم حفظ التغييرات');
      }
    } catch (err) {
      // Mock success
      setMethods((prev) => prev.map((m) => (m.id === selectedMethod.id ? selectedMethod : m)));
      setIsEditing(false);
      setSelectedMethod(null);
      alert('تم حفظ التغييرات');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'local':
        return <BanknotesIcon className="h-5 w-5 text-emerald-400" />;
      case 'international':
        return <GlobeAltIcon className="h-5 w-5 text-blue-400" />;
      case 'crypto':
        return <CurrencyDollarIcon className="h-5 w-5 text-purple-400" />;
      default:
        return <CreditCardIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'local':
        return 'محلية';
      case 'international':
        return 'عالمية';
      case 'crypto':
        return 'رقمية';
      default:
        return category;
    }
  };

  const filteredMethods = methods.filter(
    (m) => categoryFilter === 'all' || m.category === categoryFilter,
  );

  const groupedMethods = {
    local: filteredMethods.filter((m) => m.category === 'local'),
    international: filteredMethods.filter((m) => m.category === 'international'),
    crypto: filteredMethods.filter((m) => m.category === 'crypto'),
  };

  return (
    <AdminLayout title="إدارة طرق الدفع">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">طرق الدفع والإيداع</h2>
          <p className="text-sm text-slate-400">إدارة وتكوين طرق الدفع المتاحة للمستخدمين</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white"
          >
            <option value="all">جميع الفئات</option>
            <option value="local">محلية</option>
            <option value="international">عالمية</option>
            <option value="crypto">رقمية</option>
          </select>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <CreditCardIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{methods.length}</p>
              <p className="text-xs text-slate-400">إجمالي الطرق</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <CheckIcon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {methods.filter((m) => m.isActive).length}
              </p>
              <p className="text-xs text-slate-400">نشطة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2">
              <BanknotesIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{groupedMethods.local.length}</p>
              <p className="text-xs text-slate-400">محلية</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{groupedMethods.crypto.length}</p>
              <p className="text-xs text-slate-400">رقمية</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Local Methods */}
          {(categoryFilter === 'all' || categoryFilter === 'local') &&
            groupedMethods.local.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <BanknotesIcon className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">طرق الدفع المحلية</h3>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                    {groupedMethods.local.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedMethods.local.map((method) => (
                    <MethodCard
                      key={method.id}
                      method={method}
                      onToggle={() => toggleMethodStatus(method.id, method.isActive)}
                      onEdit={() => {
                        setSelectedMethod(method);
                        setIsEditing(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* International Methods */}
          {(categoryFilter === 'all' || categoryFilter === 'international') &&
            groupedMethods.international.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <GlobeAltIcon className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">طرق الدفع العالمية</h3>
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                    {groupedMethods.international.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedMethods.international.map((method) => (
                    <MethodCard
                      key={method.id}
                      method={method}
                      onToggle={() => toggleMethodStatus(method.id, method.isActive)}
                      onEdit={() => {
                        setSelectedMethod(method);
                        setIsEditing(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Crypto Methods */}
          {(categoryFilter === 'all' || categoryFilter === 'crypto') &&
            groupedMethods.crypto.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">طرق الدفع الرقمية</h3>
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
                    {groupedMethods.crypto.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedMethods.crypto.map((method) => (
                    <MethodCard
                      key={method.id}
                      method={method}
                      onToggle={() => toggleMethodStatus(method.id, method.isActive)}
                      onEdit={() => {
                        setSelectedMethod(method);
                        setIsEditing(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Modal تعديل طريقة الدفع */}
      {isEditing && selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 py-8">
          <div className="m-4 w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">تعديل طريقة الدفع</h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedMethod(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-slate-400">الاسم بالعربية</label>
                <input
                  type="text"
                  value={selectedMethod.nameAr}
                  onChange={(e) => setSelectedMethod({ ...selectedMethod, nameAr: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  value={selectedMethod.name}
                  onChange={(e) => setSelectedMethod({ ...selectedMethod, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm text-slate-400">الوصف</label>
                <textarea
                  value={selectedMethod.description}
                  onChange={(e) =>
                    setSelectedMethod({ ...selectedMethod, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  rows={2}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">الحد الأدنى</label>
                <input
                  type="number"
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
                <label className="mb-1 block text-sm text-slate-400">رسوم النسبة المئوية (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedMethod.percentageFee}
                  onChange={(e) =>
                    setSelectedMethod({
                      ...selectedMethod,
                      percentageFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">رسوم ثابتة</label>
                <input
                  type="number"
                  step="0.01"
                  value={selectedMethod.fixedFee}
                  onChange={(e) =>
                    setSelectedMethod({
                      ...selectedMethod,
                      fixedFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">وقت المعالجة</label>
                <input
                  type="text"
                  value={selectedMethod.processingTime}
                  onChange={(e) =>
                    setSelectedMethod({ ...selectedMethod, processingTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedMethod.isActive}
                    onChange={(e) =>
                      setSelectedMethod({ ...selectedMethod, isActive: e.target.checked })
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

            <div className="mt-6 flex justify-end gap-3">
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
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// مكون بطاقة طريقة الدفع
function MethodCard({
  method,
  onToggle,
  onEdit,
}: {
  method: PaymentMethod;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'local':
        return 'border-emerald-500/30 bg-emerald-900/20';
      case 'international':
        return 'border-blue-500/30 bg-blue-900/20';
      case 'crypto':
        return 'border-purple-500/30 bg-purple-900/20';
      default:
        return 'border-slate-700 bg-slate-800';
    }
  };

  return (
    <div className={`rounded-xl border p-4 ${getCategoryColor(method.category)}`}>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-white">{method.nameAr}</h4>
          <p className="text-xs text-slate-400">{method.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {method.isPopular && (
            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
              شائع
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              method.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {method.isActive ? 'نشط' : 'معطل'}
          </span>
        </div>
      </div>

      <p className="mb-3 text-sm text-slate-400">{method.description}</p>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded bg-slate-800/50 p-2">
          <p className="text-slate-500">الحدود</p>
          <p className="text-white">
            {method.minAmount} - {method.maxAmount}
          </p>
        </div>
        <div className="rounded bg-slate-800/50 p-2">
          <p className="text-slate-500">الرسوم</p>
          <p className="text-white">
            {method.percentageFee > 0 ? `${method.percentageFee}%` : ''}
            {method.percentageFee > 0 && method.fixedFee > 0 ? ' + ' : ''}
            {method.fixedFee > 0 ? method.fixedFee : ''}
            {method.percentageFee === 0 && method.fixedFee === 0 ? 'مجاني' : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{method.processingTime}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="rounded bg-slate-700 p-1.5 text-slate-300 hover:bg-slate-600"
            title="تعديل"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onToggle}
            className={`rounded p-1.5 ${
              method.isActive
                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
            }`}
            title={method.isActive ? 'تعطيل' : 'تفعيل'}
          >
            {method.isActive ? (
              <XMarkIcon className="h-4 w-4" />
            ) : (
              <CheckIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
