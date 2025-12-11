import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BuildingLibraryIcon,
  CreditCardIcon,
  PhoneIcon,
  CogIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatNumber } from '../../utils/numberUtils';

interface LocalWalletSectionProps {
  balance: number;
  currency: string;
  showBalance: boolean;
  onToggleBalance: () => void;
  transactions?: any[];
  isLoading?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  description: string | null;
  processingTime: string | null;
  percentageFee: number;
  fixedFee: number;
  category: string;
  isPopular: boolean;
}

const LocalWalletSection: React.FC<LocalWalletSectionProps> = ({
  balance,
  currency,
  showBalance,
  onToggleBalance,
  transactions = [],
  isLoading = false,
}) => {
  const [activeDepositMethod, setActiveDepositMethod] = useState<string | null>(null);
  const [depositMethods, setDepositMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  // جلب وسائل الدفع من API مع Caching
  const fetchPaymentMethods = useCallback(async () => {
    try {
      // محاولة جلب من Cache أولاً
      const cacheKey = 'local_payment_methods';
      const cached = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);

      // استخدام Cache إذا كان أقل من 5 دقائق
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < 5 * 60 * 1000) {
          // 5 دقائق
          setDepositMethods(JSON.parse(cached));
          setLoadingMethods(false);
          return;
        }
      }

      // جلب من API
      const response = await fetch('/api/payment-methods/active?category=local');

      if (!response.ok) {
        throw new Error('فشل في جلب وسائل الدفع');
      }

      const result = await response.json();

      if (result.success) {
        const methods = result.data.paymentMethods;
        setDepositMethods(methods);

        // حفظ في Cache
        sessionStorage.setItem(cacheKey, JSON.stringify(methods));
        sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
      }
    } catch (error) {
      console.error('خطأ في جلب وسائل الدفع:', error);
      // استخدام وسائل افتراضية في حالة الفشل
      setDepositMethods([]);
    } finally {
      setLoadingMethods(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // تحويل البيانات إلى Format مناسب للعرض
  const formattedMethods = depositMethods.map((method) => ({
    id: method.id,
    name: method.nameAr,
    description: method.description || 'وسيلة دفع محلية',
    icon: method.category === 'bank' ? BuildingLibraryIcon : CreditCardIcon,
    href: `/wallet/deposit/local/${method.id}`,
    processingTime: method.processingTime || 'حسب الوسيلة',
    fees:
      method.percentageFee > 0
        ? `${method.percentageFee}%${method.fixedFee > 0 ? ` + ${method.fixedFee} د.ل` : ''}`
        : method.fixedFee > 0
          ? `${method.fixedFee} د.ل`
          : 'مجاني',
    status: 'active',
    color: method.isPopular ? 'green' : 'blue',
  }));

  // آخر المعاملات المحلية
  const recentTransactions = [
    {
      id: 1,
      type: 'deposit',
      amount: 500,
      method: 'تحويل بنكي',
      status: 'completed',
      date: '2024-01-15',
      time: '14:30',
    },
    {
      id: 2,
      type: 'deposit',
      amount: 100,
      method: 'كروت ليبيانا',
      status: 'completed',
      date: '2024-01-14',
      time: '09:15',
    },
    {
      id: 3,
      type: 'withdrawal',
      amount: 50,
      method: 'سحب نقدي',
      status: 'pending',
      date: '2024-01-13',
      time: '16:45',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-green-200 bg-green-50';
      case 'coming_soon':
        return 'border-yellow-200 bg-yellow-50';
      case 'maintenance':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'متاح';
      case 'coming_soon':
        return 'قريباً';
      case 'maintenance':
        return 'صيانة';
      default:
        return 'غير متاح';
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس القسم */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-200 p-3">
              <BuildingLibraryIcon className="h-8 w-8 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-900">المحفظة المحلية</h2>
              <p className="text-emerald-700">إدارة أموالك بالدينار الليبي</p>
            </div>
          </div>
          <button
            onClick={onToggleBalance}
            className="rounded-lg bg-emerald-200 p-2 text-emerald-700 transition-colors hover:bg-emerald-300"
          >
            {showBalance ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        <div className="text-center">
          <div className="mb-2 text-4xl font-bold text-emerald-900">
            {isLoading ? (
              <div className="mx-auto h-12 w-48 animate-pulse rounded bg-emerald-200"></div>
            ) : showBalance ? (
              `${formatNumber(balance)} ${currency}`
            ) : (
              '••••••••'
            )}
          </div>
          <p className="text-emerald-700">الرصيد المتاح</p>
        </div>
      </div>

      {/* وسائل الإيداع */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <PlusIcon className="h-6 w-6 text-emerald-600" />
          <h3 className="text-xl font-bold text-gray-900">وسائل الإيداع</h3>
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            {loadingMethods ? '...' : formattedMethods.filter((m) => m.status === 'active').length}{' '}
            وسيلة متاحة
          </div>
        </div>

        {loadingMethods ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border-2 border-gray-200 bg-gray-100"
              ></div>
            ))}
          </div>
        ) : formattedMethods.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">لا توجد وسائل دفع متاحة حالياً</p>
            <p className="mt-2 text-sm text-gray-500">يرجى المحاولة لاحقاً أو التواصل مع الدعم</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {formattedMethods.map((method) => (
              <div
                key={method.id}
                className={`rounded-xl border-2 p-4 transition-all duration-200 ${
                  method.status === 'active'
                    ? 'cursor-pointer hover:scale-105 hover:shadow-lg'
                    : 'cursor-not-allowed opacity-60'
                } ${getStatusColor(method.status)}`}
              >
                {method.status === 'active' ? (
                  <Link href={method.href} className="block">
                    <div className="mb-3 flex items-center gap-3">
                      <div className={`rounded-lg p-2 bg-${method.color}-100`}>
                        <method.icon className={`h-6 w-6 text-${method.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">وقت المعالجة:</span>
                        <span className="font-medium">{method.processingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الرسوم:</span>
                        <span className="font-medium">{method.fees}</span>
                      </div>
                      {method.id === 'bank_transfer' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">الحد الأدنى:</span>
                          <span className="font-medium">50 د.ل</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <method.icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-700">{method.name}</h4>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                    <div className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                      {getStatusText(method.status)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* آخر المعاملات */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-6 w-6 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900">آخر المعاملات</h3>
          </div>
          <Link
            href="/wallet/transactions?type=local"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            عرض الكل
          </Link>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {transaction.type === 'deposit' ? (
                    <ArrowUpIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.type === 'deposit' ? 'إيداع' : 'سحب'} - {transaction.method}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.date} في {transaction.time}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'deposit' ? '+' : '-'}
                  {formatNumber(transaction.amount)} د.ل
                </p>
                <div className="flex items-center gap-1">
                  {transaction.status === 'completed' ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                  )}
                  <span
                    className={`text-xs ${
                      transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {transaction.status === 'completed' ? 'مكتملة' : 'قيد المعالجة'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* إعدادات المحفظة المحلية */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <CogIcon className="h-6 w-6 text-gray-600" />
          <h3 className="text-xl font-bold text-gray-900">إعدادات المحفظة المحلية</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href="/wallet/settings?section=local"
            className="rounded-lg border border-gray-200 p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50"
          >
            <div className="flex items-center gap-3">
              <CogIcon className="h-5 w-5 text-emerald-600" />
              <div>
                <h4 className="font-medium text-gray-900">إعدادات عامة</h4>
                <p className="text-sm text-gray-600">تخصيص إعدادات المحفظة المحلية</p>
              </div>
            </div>
          </Link>

          <Link
            href="/wallet/banks"
            className="rounded-lg border border-gray-200 p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50"
          >
            <div className="flex items-center gap-3">
              <BuildingLibraryIcon className="h-5 w-5 text-emerald-600" />
              <div>
                <h4 className="font-medium text-gray-900">البنوك المدعومة</h4>
                <p className="text-sm text-gray-600">عرض البنوك المتاحة للإيداع</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LocalWalletSection;
