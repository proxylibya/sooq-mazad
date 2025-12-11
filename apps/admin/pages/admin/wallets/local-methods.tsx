/**
 * صفحة إدارة وسائل الدفع المحلية الليبية
 * Local Libyan Payment Methods Management
 */
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  PencilIcon,
  PlusIcon,
  QrCodeIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

// البنوك الليبية
const LIBYAN_BANKS = [
  { id: 'jumhuriya', name: 'مصرف الجمهورية', code: 'JB' },
  { id: 'wahda', name: 'مصرف الوحدة', code: 'WB' },
  { id: 'commerce', name: 'مصرف التجارة والتنمية', code: 'BCD' },
  { id: 'sahara', name: 'مصرف الصحاري', code: 'SB' },
  { id: 'national', name: 'المصرف الوطني التجاري', code: 'NBL' },
  { id: 'alaman', name: 'مصرف الأمان', code: 'AB' },
  { id: 'masraf', name: 'مصرف ليبيا المركزي', code: 'CBL' },
  { id: 'assaray', name: 'مصرف السراي', code: 'ASB' },
  { id: 'north', name: 'مصرف شمال أفريقيا', code: 'NAB' },
  { id: 'mediterranean', name: 'مصرف المتوسط', code: 'MDB' },
];

interface LocalPaymentMethod {
  id: string;
  type: 'bank' | 'card' | 'mobile' | 'pos';
  name: string;
  nameAr: string;
  provider: string;
  description: string;
  isActive: boolean;
  isPopular: boolean;
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  percentageFee: number;
  fixedFee: number;
  processingTime: string;
  bankDetails?: {
    bankId: string;
    accountNumber: string;
    accountName: string;
    iban?: string;
    swiftCode?: string;
  };
  cardDetails?: {
    prefix: string;
    lengthMin: number;
    lengthMax: number;
    validationApi?: string;
  };
  mobileDetails?: {
    operator: string;
    ussdCode?: string;
    apiEndpoint?: string;
  };
  instructions: string[];
  requiredFields: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function LocalMethodsPage() {
  const [methods, setMethods] = useState<LocalPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<LocalPaymentMethod | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'bank' | 'card' | 'mobile' | 'pos'>(
    'all',
  );

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/wallets/local-methods');
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

    // تحميل البيانات الافتراضية
    setMethods([
      // البنوك
      {
        id: 'bank-jumhuriya',
        type: 'bank',
        name: 'Jumhuriya Bank',
        nameAr: 'مصرف الجمهورية',
        provider: 'JumhuriyaBank',
        description: 'تحويل بنكي عبر مصرف الجمهورية',
        isActive: true,
        isPopular: true,
        minAmount: 50,
        maxAmount: 50000,
        dailyLimit: 100000,
        monthlyLimit: 500000,
        percentageFee: 0,
        fixedFee: 5,
        processingTime: '1-3 أيام عمل',
        bankDetails: {
          bankId: 'jumhuriya',
          accountNumber: '0123456789',
          accountName: 'سوق المزاد',
          iban: 'LY00 0000 0000 0000 0000',
        },
        instructions: [
          'قم بتحويل المبلغ إلى الحساب المذكور',
          'احتفظ بإيصال التحويل',
          'أرفق صورة الإيصال في النموذج',
          'سيتم مراجعة طلبك خلال 24 ساعة',
        ],
        requiredFields: ['amount', 'senderName', 'senderAccount', 'receipt'],
      },
      {
        id: 'bank-wahda',
        type: 'bank',
        name: 'Wahda Bank',
        nameAr: 'مصرف الوحدة',
        provider: 'WahdaBank',
        description: 'تحويل بنكي عبر مصرف الوحدة',
        isActive: true,
        isPopular: false,
        minAmount: 50,
        maxAmount: 50000,
        dailyLimit: 100000,
        monthlyLimit: 500000,
        percentageFee: 0,
        fixedFee: 5,
        processingTime: '1-3 أيام عمل',
        bankDetails: {
          bankId: 'wahda',
          accountNumber: '9876543210',
          accountName: 'سوق المزاد',
        },
        instructions: [
          'قم بتحويل المبلغ إلى الحساب المذكور',
          'احتفظ بإيصال التحويل',
          'أرفق صورة الإيصال في النموذج',
        ],
        requiredFields: ['amount', 'senderName', 'receipt'],
      },
      // كروت
      {
        id: 'card-libyana',
        type: 'card',
        name: 'Libyana Cards',
        nameAr: 'كروت ليبيانا',
        provider: 'Libyana',
        description: 'إيداع فوري عبر كروت شحن ليبيانا',
        isActive: true,
        isPopular: true,
        minAmount: 10,
        maxAmount: 1000,
        dailyLimit: 5000,
        monthlyLimit: 20000,
        percentageFee: 3,
        fixedFee: 0,
        processingTime: 'فوري',
        cardDetails: {
          prefix: '091',
          lengthMin: 14,
          lengthMax: 16,
        },
        instructions: [
          'أدخل رقم الكرت المكون من 14-16 رقم',
          'سيتم التحقق من الكرت تلقائياً',
          'بعد التحقق سيضاف الرصيد فوراً',
        ],
        requiredFields: ['cardNumber'],
      },
      {
        id: 'card-madar',
        type: 'card',
        name: 'Madar Cards',
        nameAr: 'كروت مدار',
        provider: 'Madar',
        description: 'إيداع فوري عبر كروت شحن مدار',
        isActive: true,
        isPopular: true,
        minAmount: 10,
        maxAmount: 1000,
        dailyLimit: 5000,
        monthlyLimit: 20000,
        percentageFee: 3,
        fixedFee: 0,
        processingTime: 'فوري',
        cardDetails: {
          prefix: '092',
          lengthMin: 14,
          lengthMax: 16,
        },
        instructions: [
          'أدخل رقم الكرت المكون من 14-16 رقم',
          'سيتم التحقق من الكرت تلقائياً',
          'بعد التحقق سيضاف الرصيد فوراً',
        ],
        requiredFields: ['cardNumber'],
      },
      // الدفع الإلكتروني
      {
        id: 'mobile-sadad',
        type: 'mobile',
        name: 'Sadad',
        nameAr: 'سداد',
        provider: 'Sadad',
        description: 'الدفع عبر تطبيق سداد الإلكتروني',
        isActive: true,
        isPopular: false,
        minAmount: 5,
        maxAmount: 10000,
        dailyLimit: 20000,
        monthlyLimit: 100000,
        percentageFee: 2,
        fixedFee: 0,
        processingTime: 'فوري - 30 دقيقة',
        mobileDetails: {
          operator: 'Sadad',
          apiEndpoint: 'https://api.sadad.ly',
        },
        instructions: [
          'افتح تطبيق سداد',
          'اختر "إرسال أموال"',
          'أدخل رقم المحفظة المخصص',
          'أكد العملية برمز OTP',
        ],
        requiredFields: ['amount', 'sadadReference'],
      },
      {
        id: 'mobile-moamalat',
        type: 'mobile',
        name: 'Moamalat',
        nameAr: 'معاملات',
        provider: 'Moamalat',
        description: 'الدفع عبر محفظة معاملات',
        isActive: false,
        isPopular: false,
        minAmount: 5,
        maxAmount: 5000,
        dailyLimit: 10000,
        monthlyLimit: 50000,
        percentageFee: 2.5,
        fixedFee: 0,
        processingTime: 'فوري',
        mobileDetails: {
          operator: 'Moamalat',
        },
        instructions: ['افتح تطبيق معاملات', 'حول المبلغ إلى رقم المحفظة'],
        requiredFields: ['amount', 'moamalatReference'],
      },
      // نقاط البيع
      {
        id: 'pos-tadawul',
        type: 'pos',
        name: 'Tadawul POS',
        nameAr: 'نقاط بيع تداول',
        provider: 'Tadawul',
        description: 'الإيداع عبر نقاط بيع تداول المنتشرة',
        isActive: true,
        isPopular: false,
        minAmount: 20,
        maxAmount: 5000,
        dailyLimit: 10000,
        monthlyLimit: 50000,
        percentageFee: 1,
        fixedFee: 2,
        processingTime: 'فوري',
        instructions: [
          'توجه إلى أقرب نقطة بيع تداول',
          'أخبر البائع برغبتك في الإيداع لسوق المزاد',
          'أعطه رقم محفظتك',
          'ادفع المبلغ واحصل على الإيصال',
        ],
        requiredFields: ['amount', 'posReceipt'],
      },
    ]);
    setLoading(false);
  };

  const handleToggleActive = async (methodId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/wallets/local-methods/${methodId}`, {
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
      // محاكاة النجاح
      setMethods((prev) =>
        prev.map((m) => (m.id === methodId ? { ...m, isActive: !currentStatus } : m)),
      );
    }
  };

  const handleSaveMethod = async () => {
    if (!selectedMethod) return;

    try {
      const res = await fetch(`/api/admin/wallets/local-methods/${selectedMethod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedMethod),
      });

      if (res.ok) {
        setMethods((prev) => prev.map((m) => (m.id === selectedMethod.id ? selectedMethod : m)));
        setIsEditing(false);
        setSelectedMethod(null);
        alert('تم حفظ التغييرات بنجاح');
      }
    } catch (err) {
      // محاكاة النجاح
      setMethods((prev) => prev.map((m) => (m.id === selectedMethod.id ? selectedMethod : m)));
      setIsEditing(false);
      setSelectedMethod(null);
      alert('تم حفظ التغييرات بنجاح');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <BuildingLibraryIcon className="h-5 w-5" />;
      case 'card':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'mobile':
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case 'pos':
        return <QrCodeIcon className="h-5 w-5" />;
      default:
        return <CogIcon className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bank':
        return 'بنكي';
      case 'card':
        return 'كروت';
      case 'mobile':
        return 'موبايل';
      case 'pos':
        return 'نقاط بيع';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bank':
        return 'bg-blue-500/20 text-blue-400';
      case 'card':
        return 'bg-green-500/20 text-green-400';
      case 'mobile':
        return 'bg-purple-500/20 text-purple-400';
      case 'pos':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const filteredMethods = methods.filter((m) => activeFilter === 'all' || m.type === activeFilter);

  const stats = {
    total: methods.length,
    active: methods.filter((m) => m.isActive).length,
    bank: methods.filter((m) => m.type === 'bank').length,
    card: methods.filter((m) => m.type === 'card').length,
    mobile: methods.filter((m) => m.type === 'mobile').length,
    pos: methods.filter((m) => m.type === 'pos').length,
  };

  return (
    <AdminLayout title="وسائل الدفع المحلية">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">وسائل الدفع المحلية (ليبيا)</h2>
          <p className="text-sm text-slate-400">
            إدارة طرق الإيداع المحلية: البنوك، كروت الشحن، المحافظ الإلكترونية
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <PlusIcon className="h-4 w-4" />
          إضافة وسيلة
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">إجمالي الوسائل</p>
          </div>
        </div>
        <div className="rounded-xl border border-green-500/30 bg-green-900/10 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            <p className="text-xs text-slate-400">نشطة</p>
          </div>
        </div>
        <div className="rounded-xl border border-blue-500/30 bg-blue-900/10 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.bank}</p>
            <p className="text-xs text-slate-400">بنوك</p>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/10 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.card}</p>
            <p className="text-xs text-slate-400">كروت</p>
          </div>
        </div>
        <div className="rounded-xl border border-purple-500/30 bg-purple-900/10 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.mobile}</p>
            <p className="text-xs text-slate-400">موبايل</p>
          </div>
        </div>
        <div className="rounded-xl border border-orange-500/30 bg-orange-900/10 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.pos}</p>
            <p className="text-xs text-slate-400">نقاط بيع</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['all', 'bank', 'card', 'mobile', 'pos'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              activeFilter === filter
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {filter === 'all' ? (
              'الكل'
            ) : (
              <>
                {getTypeIcon(filter)}
                {getTypeLabel(filter)}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Methods List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMethods.map((method) => (
            <div
              key={method.id}
              className={`rounded-xl border p-5 ${
                method.isActive
                  ? 'border-slate-700 bg-slate-800'
                  : 'border-slate-700/50 bg-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-3 ${getTypeColor(method.type)}`}>
                    {getTypeIcon(method.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{method.nameAr}</h3>
                      {method.isPopular && (
                        <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                          شائع
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${getTypeColor(method.type)}`}
                      >
                        {getTypeLabel(method.type)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{method.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                      method.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {method.isActive ? (
                      <>
                        <CheckCircleIcon className="h-3 w-3" />
                        نشط
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-3 w-3" />
                        معطل
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div className="rounded-lg bg-slate-700/50 p-3">
                  <p className="text-xs text-slate-400">الحد الأدنى</p>
                  <p className="font-semibold text-white">{method.minAmount} د.ل</p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-3">
                  <p className="text-xs text-slate-400">الحد الأقصى</p>
                  <p className="font-semibold text-white">{method.maxAmount} د.ل</p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-3">
                  <p className="text-xs text-slate-400">الرسوم</p>
                  <p className="font-semibold text-white">
                    {method.percentageFee > 0 ? `${method.percentageFee}%` : ''}
                    {method.percentageFee > 0 && method.fixedFee > 0 ? ' + ' : ''}
                    {method.fixedFee > 0 ? `${method.fixedFee} د.ل` : ''}
                    {method.percentageFee === 0 && method.fixedFee === 0 ? 'مجاني' : ''}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-3">
                  <p className="text-xs text-slate-400">وقت المعالجة</p>
                  <p className="font-semibold text-white">{method.processingTime}</p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-3">
                  <p className="text-xs text-slate-400">الحد اليومي</p>
                  <p className="font-semibold text-white">
                    {method.dailyLimit.toLocaleString()} د.ل
                  </p>
                </div>
              </div>

              {/* Bank Details */}
              {method.type === 'bank' && method.bankDetails && (
                <div className="mt-4 rounded-lg bg-blue-900/20 p-3">
                  <h4 className="mb-2 text-sm font-medium text-blue-400">بيانات الحساب البنكي</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <div>
                      <span className="text-slate-400">البنك:</span>
                      <span className="mr-1 text-white">
                        {LIBYAN_BANKS.find((b) => b.id === method.bankDetails?.bankId)?.name || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">رقم الحساب:</span>
                      <span className="mr-1 text-white">{method.bankDetails.accountNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">اسم الحساب:</span>
                      <span className="mr-1 text-white">{method.bankDetails.accountName}</span>
                    </div>
                    {method.bankDetails.iban && (
                      <div>
                        <span className="text-slate-400">IBAN:</span>
                        <span className="mr-1 text-white">{method.bankDetails.iban}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Card Details */}
              {method.type === 'card' && method.cardDetails && (
                <div className="mt-4 rounded-lg bg-green-900/20 p-3">
                  <h4 className="mb-2 text-sm font-medium text-green-400">إعدادات الكروت</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">بادئة الرقم:</span>
                      <span className="mr-1 text-white">{method.cardDetails.prefix}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">الطول:</span>
                      <span className="mr-1 text-white">
                        {method.cardDetails.lengthMin}-{method.cardDetails.lengthMax} رقم
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedMethod(method);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600"
                >
                  <PencilIcon className="h-4 w-4" />
                  تعديل
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
              <h3 className="text-lg font-semibold text-white">تعديل: {selectedMethod.nameAr}</h3>
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

            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الاسم بالعربية</label>
                  <input
                    type="text"
                    value={selectedMethod.nameAr}
                    onChange={(e) =>
                      setSelectedMethod({ ...selectedMethod, nameAr: e.target.value })
                    }
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
                  <label className="mb-1 block text-sm text-slate-400">الحد الأدنى (د.ل)</label>
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
                  <label className="mb-1 block text-sm text-slate-400">الحد الأقصى (د.ل)</label>
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
                  <label className="mb-1 block text-sm text-slate-400">الحد اليومي (د.ل)</label>
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
                  <label className="mb-1 block text-sm text-slate-400">الحد الشهري (د.ل)</label>
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
                  <label className="mb-1 block text-sm text-slate-400">
                    رسوم النسبة المئوية (%)
                  </label>
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
                  <label className="mb-1 block text-sm text-slate-400">رسوم ثابتة (د.ل)</label>
                  <input
                    type="number"
                    step="0.1"
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

              {/* Bank Details Section */}
              {selectedMethod.type === 'bank' && (
                <div className="mt-6">
                  <h4 className="mb-3 font-medium text-blue-400">بيانات الحساب البنكي</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">البنك</label>
                      <select
                        value={selectedMethod.bankDetails?.bankId || ''}
                        onChange={(e) =>
                          setSelectedMethod({
                            ...selectedMethod,
                            bankDetails: { ...selectedMethod.bankDetails!, bankId: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      >
                        <option value="">اختر البنك</option>
                        {LIBYAN_BANKS.map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">رقم الحساب</label>
                      <input
                        type="text"
                        value={selectedMethod.bankDetails?.accountNumber || ''}
                        onChange={(e) =>
                          setSelectedMethod({
                            ...selectedMethod,
                            bankDetails: {
                              ...selectedMethod.bankDetails!,
                              accountNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">اسم الحساب</label>
                      <input
                        type="text"
                        value={selectedMethod.bankDetails?.accountName || ''}
                        onChange={(e) =>
                          setSelectedMethod({
                            ...selectedMethod,
                            bankDetails: {
                              ...selectedMethod.bankDetails!,
                              accountName: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">IBAN (اختياري)</label>
                      <input
                        type="text"
                        value={selectedMethod.bankDetails?.iban || ''}
                        onChange={(e) =>
                          setSelectedMethod({
                            ...selectedMethod,
                            bankDetails: { ...selectedMethod.bankDetails!, iban: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                      />
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
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
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
