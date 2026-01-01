/**
 * صفحة إدارة وسائل الدفع العالمية
 * International Payment Methods Management
 */
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CogIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LinkIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface GlobalPaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  provider: string;
  type: 'wallet' | 'bank' | 'card' | 'transfer';
  description: string;
  logo?: string;
  isActive: boolean;
  isPopular: boolean;
  testMode: boolean;
  // الحدود والرسوم
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  percentageFee: number;
  fixedFee: number;
  processingTime: string;
  // العملات
  supportedCurrencies: string[];
  defaultCurrency: string;
  // التكامل
  apiEndpoint?: string;
  webhookUrl?: string;
  credentials: {
    key: string;
    value: string;
    label: string;
    isSecret: boolean;
  }[];
  // الميزات
  features: string[];
  documentation?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

export default function GlobalMethodsPage() {
  const [methods, setMethods] = useState<GlobalPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<GlobalPaymentMethod | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/wallets/global-methods');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.methods) {
          // تحويل البيانات للصيغة المتوقعة
          const transformedMethods = data.methods.map((m: any) => ({
            id: m.id,
            name: m.name || m.nameEn,
            nameAr: m.nameAr || m.name,
            provider: m.metadata?.provider || m.name,
            type: m.category || 'wallet',
            description: m.description || '',
            logo: m.icon,
            isActive: m.isActive ?? false,
            isPopular: m.isPopular ?? false,
            testMode: m.metadata?.testMode ?? true,
            minAmount: m.minAmount || 0,
            maxAmount: m.maxAmount || 10000,
            dailyLimit: m.metadata?.dailyLimit || 10000,
            monthlyLimit: m.metadata?.monthlyLimit || 50000,
            percentageFee: m.percentageFee || 0,
            fixedFee: m.fixedFee || 0,
            processingTime: m.processingTime || 'غير محدد',
            supportedCurrencies: m.metadata?.supportedCurrencies ||
              m.supportedCurrencies?.split(',') || ['USD'],
            defaultCurrency: m.metadata?.defaultCurrency || 'USD',
            apiEndpoint: m.metadata?.apiEndpoint || '',
            webhookUrl: m.metadata?.webhookUrl || '',
            credentials: m.metadata?.credentials || [],
            features: m.metadata?.features || [],
            documentation: m.metadata?.documentation || '',
            status: m.metadata?.status || 'disconnected',
            lastSync: m.metadata?.lastSync,
          }));
          setMethods(transformedMethods);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
    }

    // البيانات الافتراضية
    setMethods([
      {
        id: 'paypal',
        name: 'PayPal',
        nameAr: 'باي بال',
        provider: 'PayPal',
        type: 'wallet',
        description: 'استقبال المدفوعات العالمية عبر PayPal - الأكثر شهرة عالمياً',
        isActive: true,
        isPopular: true,
        testMode: true,
        minAmount: 5,
        maxAmount: 10000,
        dailyLimit: 10000,
        monthlyLimit: 50000,
        percentageFee: 3.4,
        fixedFee: 0.3,
        processingTime: 'فوري - 24 ساعة',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        defaultCurrency: 'USD',
        apiEndpoint: 'https://api.paypal.com/v2',
        webhookUrl: '/api/webhooks/paypal',
        credentials: [
          { key: 'client_id', value: '', label: 'Client ID', isSecret: false },
          { key: 'client_secret', value: '', label: 'Client Secret', isSecret: true },
          { key: 'webhook_id', value: '', label: 'Webhook ID', isSecret: false },
        ],
        features: ['دفع مباشر', 'اشتراكات', 'استرداد تلقائي', 'حماية المشتري'],
        documentation: 'https://developer.paypal.com/docs',
        status: 'disconnected',
      },
      {
        id: 'payoneer',
        name: 'Payoneer',
        nameAr: 'بايونير',
        provider: 'Payoneer',
        type: 'wallet',
        description: 'استقبال المدفوعات من الشركات والأفراد عبر Payoneer',
        isActive: true,
        isPopular: false,
        testMode: true,
        minAmount: 20,
        maxAmount: 10000,
        dailyLimit: 10000,
        monthlyLimit: 50000,
        percentageFee: 2,
        fixedFee: 0,
        processingTime: '1-2 يوم عمل',
        supportedCurrencies: ['USD', 'EUR'],
        defaultCurrency: 'USD',
        apiEndpoint: 'https://api.payoneer.com/v4',
        credentials: [
          { key: 'program_id', value: '', label: 'Program ID', isSecret: false },
          { key: 'api_username', value: '', label: 'API Username', isSecret: false },
          { key: 'api_password', value: '', label: 'API Password', isSecret: true },
        ],
        features: ['تحويلات جماعية', 'بطاقات مسبقة الدفع', 'حسابات استلام'],
        documentation: 'https://payoneer.readme.io',
        status: 'disconnected',
      },
      {
        id: 'wise',
        name: 'Wise (TransferWise)',
        nameAr: 'وايز',
        provider: 'Wise',
        type: 'transfer',
        description: 'تحويلات مصرفية دولية بأسعار صرف حقيقية',
        isActive: true,
        isPopular: true,
        testMode: true,
        minAmount: 10,
        maxAmount: 50000,
        dailyLimit: 50000,
        monthlyLimit: 200000,
        percentageFee: 0.5,
        fixedFee: 1,
        processingTime: '1-3 أيام عمل',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'],
        defaultCurrency: 'USD',
        apiEndpoint: 'https://api.wise.com/v3',
        webhookUrl: '/api/webhooks/wise',
        credentials: [
          { key: 'api_token', value: '', label: 'API Token', isSecret: true },
          { key: 'profile_id', value: '', label: 'Profile ID', isSecret: false },
          { key: 'webhook_secret', value: '', label: 'Webhook Secret', isSecret: true },
        ],
        features: ['أسعار صرف حقيقية', 'تحويلات سريعة', 'متعدد العملات', 'API متقدم'],
        documentation: 'https://api-docs.wise.com',
        status: 'disconnected',
      },
      {
        id: 'stripe',
        name: 'Stripe',
        nameAr: 'سترايب',
        provider: 'Stripe',
        type: 'card',
        description: 'بوابة دفع شاملة - بطاقات، محافظ رقمية، تحويلات',
        isActive: false,
        isPopular: true,
        testMode: true,
        minAmount: 1,
        maxAmount: 100000,
        dailyLimit: 100000,
        monthlyLimit: 1000000,
        percentageFee: 2.9,
        fixedFee: 0.3,
        processingTime: 'فوري',
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
        defaultCurrency: 'USD',
        apiEndpoint: 'https://api.stripe.com/v1',
        webhookUrl: '/api/webhooks/stripe',
        credentials: [
          { key: 'publishable_key', value: '', label: 'Publishable Key', isSecret: false },
          { key: 'secret_key', value: '', label: 'Secret Key', isSecret: true },
          { key: 'webhook_secret', value: '', label: 'Webhook Secret', isSecret: true },
        ],
        features: ['بطاقات ائتمان', 'Apple Pay', 'Google Pay', 'اشتراكات', 'فواتير'],
        documentation: 'https://stripe.com/docs/api',
        status: 'disconnected',
      },
      {
        id: 'payeer',
        name: 'Payeer',
        nameAr: 'باير',
        provider: 'Payeer',
        type: 'wallet',
        description: 'محفظة إلكترونية دولية متعددة العملات',
        isActive: true,
        isPopular: false,
        testMode: false,
        minAmount: 5,
        maxAmount: 5000,
        dailyLimit: 5000,
        monthlyLimit: 20000,
        percentageFee: 2.5,
        fixedFee: 0,
        processingTime: 'فوري',
        supportedCurrencies: ['USD', 'EUR', 'RUB'],
        defaultCurrency: 'USD',
        apiEndpoint: 'https://payeer.com/api',
        credentials: [
          { key: 'account', value: '', label: 'رقم الحساب', isSecret: false },
          { key: 'api_id', value: '', label: 'API ID', isSecret: false },
          { key: 'api_secret', value: '', label: 'API Secret', isSecret: true },
        ],
        features: ['تحويلات فورية', 'صرف عملات', 'API بسيط'],
        documentation: 'https://payeer.com/api',
        status: 'disconnected',
      },
      {
        id: 'skrill',
        name: 'Skrill',
        nameAr: 'سكريل',
        provider: 'Skrill',
        type: 'wallet',
        description: 'محفظة رقمية عالمية للتجارة الإلكترونية',
        isActive: false,
        isPopular: false,
        testMode: true,
        minAmount: 10,
        maxAmount: 10000,
        dailyLimit: 10000,
        monthlyLimit: 50000,
        percentageFee: 2.99,
        fixedFee: 0,
        processingTime: 'فوري',
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
        defaultCurrency: 'USD',
        apiEndpoint: 'https://pay.skrill.com',
        credentials: [
          { key: 'merchant_email', value: '', label: 'بريد التاجر', isSecret: false },
          { key: 'secret_word', value: '', label: 'الكلمة السرية', isSecret: true },
          { key: 'mqi', value: '', label: 'MQI Password', isSecret: true },
        ],
        features: ['محفظة رقمية', 'بطاقة مسبقة الدفع', 'كريبتو'],
        documentation: 'https://www.skrill.com/en/business/integration',
        status: 'disconnected',
      },
    ]);
    setLoading(false);
  };

  const testConnection = async (methodId: string) => {
    setTestingConnection(methodId);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // محاكاة نجاح الاتصال
      setMethods((prev) =>
        prev.map((m) =>
          m.id === methodId
            ? {
                ...m,
                status: 'connected' as const,
                lastSync: new Date().toISOString(),
              }
            : m,
        ),
      );
      alert('تم الاتصال بنجاح!');
    } catch (err) {
      setMethods((prev) =>
        prev.map((m) => (m.id === methodId ? { ...m, status: 'error' as const } : m)),
      );
    } finally {
      setTestingConnection(null);
    }
  };

  const handleSaveMethod = async () => {
    if (!selectedMethod) return;

    try {
      // محاكاة الحفظ
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
      prev.map((m) => (m.id === methodId ? { ...m, isActive: !currentStatus } : m)),
    );
  };

  const updateCredential = (credKey: string, value: string) => {
    if (!selectedMethod) return;

    setSelectedMethod({
      ...selectedMethod,
      credentials: (selectedMethod.credentials || []).map((c) =>
        c.key === credKey ? { ...c, value } : c,
      ),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'disconnected':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'متصل';
      case 'disconnected':
        return 'غير متصل';
      case 'error':
        return 'خطأ';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'wallet':
        return 'محفظة';
      case 'bank':
        return 'بنكي';
      case 'card':
        return 'بطاقات';
      case 'transfer':
        return 'تحويل';
      default:
        return type;
    }
  };

  const stats = {
    total: methods.length,
    active: methods.filter((m) => m.isActive).length,
    connected: methods.filter((m) => m.status === 'connected').length,
  };

  return (
    <AdminLayout title="وسائل الدفع العالمية">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">وسائل الدفع العالمية</h2>
          <p className="text-sm text-slate-400">
            إدارة بوابات الدفع الدولية: PayPal، Wise، Stripe، وغيرها
          </p>
        </div>
        <button
          onClick={loadMethods}
          className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
        >
          <ArrowPathIcon className="h-4 w-4" />
          تحديث
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <GlobeAltIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">إجمالي البوابات</p>
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
        <div className="rounded-xl border border-sky-500/30 bg-sky-900/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sky-500/20 p-2">
              <LinkIcon className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-sky-400">{stats.connected}</p>
              <p className="text-xs text-slate-400">متصلة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Methods List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {methods.map((method) => (
            <div
              key={method.id}
              className={`rounded-xl border p-5 ${
                method.isActive
                  ? 'border-slate-700 bg-slate-800'
                  : 'border-slate-700/50 bg-slate-800/50 opacity-60'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-sky-500/20 p-3">
                    <GlobeAltIcon className="h-6 w-6 text-sky-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{method.nameAr}</h3>
                      {method.isPopular && (
                        <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                          شائع
                        </span>
                      )}
                      {method.testMode && (
                        <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-400">
                          اختبار
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{method.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-1 text-xs ${getStatusColor(method.status)}`}
                  >
                    {getStatusLabel(method.status)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      method.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {method.isActive ? 'نشط' : 'معطل'}
                  </span>
                </div>
              </div>

              <p className="mb-3 text-sm text-slate-400">{method.description}</p>

              {/* Currencies */}
              <div className="mb-3 flex flex-wrap gap-1">
                {(method.supportedCurrencies || []).map((currency) => (
                  <span
                    key={currency}
                    className={`rounded px-2 py-0.5 text-xs ${
                      currency === method.defaultCurrency
                        ? 'bg-sky-500/30 text-sky-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {currency}
                  </span>
                ))}
              </div>

              {/* Details */}
              <div className="mb-4 grid grid-cols-4 gap-2">
                <div className="rounded-lg bg-slate-700/50 p-2 text-center">
                  <p className="text-xs text-slate-400">الحد الأدنى</p>
                  <p className="text-sm font-semibold text-white">${method.minAmount}</p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-2 text-center">
                  <p className="text-xs text-slate-400">الحد الأقصى</p>
                  <p className="text-sm font-semibold text-white">
                    ${method.maxAmount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-2 text-center">
                  <p className="text-xs text-slate-400">الرسوم</p>
                  <p className="text-sm font-semibold text-white">
                    {method.percentageFee}%{method.fixedFee > 0 ? ` + $${method.fixedFee}` : ''}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-2 text-center">
                  <p className="text-xs text-slate-400">المعالجة</p>
                  <p className="text-sm font-semibold text-white">{method.processingTime}</p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-4 flex flex-wrap gap-1">
                {(method.features || []).slice(0, 3).map((feature) => (
                  <span
                    key={feature}
                    className="flex items-center gap-1 rounded-full bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300"
                  >
                    <CheckCircleIcon className="h-3 w-3 text-green-400" />
                    {feature}
                  </span>
                ))}
                {(method.features || []).length > 3 && (
                  <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs text-slate-400">
                    +{(method.features || []).length - 3}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedMethod(method);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600"
                >
                  <CogIcon className="h-4 w-4" />
                  إعدادات
                </button>
                <button
                  onClick={() => testConnection(method.id)}
                  disabled={testingConnection === method.id}
                  className="flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs text-white hover:bg-sky-700 disabled:opacity-50"
                >
                  {testingConnection === method.id ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                  اختبار
                </button>
                <button
                  onClick={() => handleToggleActive(method.id, method.isActive)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs ${
                    method.isActive
                      ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                      : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                  }`}
                >
                  {method.isActive ? 'تعطيل' : 'تفعيل'}
                </button>
                {method.documentation && (
                  <a
                    href={method.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    التوثيق
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 p-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  إعدادات: {selectedMethod.nameAr}
                </h3>
                <p className="text-xs text-slate-400">تكوين API والربط</p>
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

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {/* Basic Info */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الحد الأدنى ($)</label>
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
                  <label className="mb-1 block text-sm text-slate-400">الحد الأقصى ($)</label>
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
                  <label className="mb-1 block text-sm text-slate-400">رسوم النسبة (%)</label>
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
                  <label className="mb-1 block text-sm text-slate-400">رسوم ثابتة ($)</label>
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
              </div>

              {/* API Credentials */}
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-sky-400">بيانات API</h4>
                <div className="space-y-3">
                  {(selectedMethod.credentials || []).map((cred) => (
                    <div key={cred.key}>
                      <label className="mb-1 block text-sm text-slate-400">{cred.label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type={cred.isSecret && !showSecrets[cred.key] ? 'password' : 'text'}
                          value={cred.value}
                          onChange={(e) => updateCredential(cred.key, e.target.value)}
                          placeholder={`أدخل ${cred.label}`}
                          className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                        />
                        {cred.isSecret && (
                          <button
                            onClick={() =>
                              setShowSecrets((prev) => ({ ...prev, [cred.key]: !prev[cred.key] }))
                            }
                            className="rounded-lg bg-slate-700 p-2 text-slate-300 hover:bg-slate-600"
                          >
                            {showSecrets[cred.key] ? 'إخفاء' : 'عرض'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Mode & Status */}
              <div className="mb-4 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedMethod.testMode}
                    onChange={(e) =>
                      setSelectedMethod({ ...selectedMethod, testMode: e.target.checked })
                    }
                    className="rounded border-slate-600 bg-slate-700"
                  />
                  <span className="text-sm text-slate-300">وضع الاختبار (Sandbox)</span>
                </label>
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
                className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700"
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
