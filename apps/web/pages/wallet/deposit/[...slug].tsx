import React, { useEffect, useMemo, useState, useCallback, memo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../../../components/common';
import BankLogo from '../../../components/BankLogo';
import { libyanBanks, getBanksByPopularity } from '../../../data/libyan-banks';
import QRCodeGenerator from '../../../components/QRCodeGenerator';
import { useUserContext } from '../../../contexts/UserContext';

// ============ Utilities ============
const formatAmount = (amount: number, currency: 'LYD' | 'USD' | 'USDT' = 'LYD') => {
  const map: Record<string, string> = { LYD: 'د.ل', USD: '$', USDT: 'USDT' };
  const symbol = map[currency] ?? currency;
  return `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
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

const useTrc20Address = () => {
  const [address, setAddress] = useState<string>('');
  useEffect(() => {
    try {
      const key = 'wallet.trc20Address';
      const existing = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      if (existing) {
        setAddress(existing);
        return;
      }
      const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let generated = 'T';
      for (let i = 0; i < 33; i++)
        generated += alphabet[Math.floor(Math.random() * alphabet.length)];
      setAddress(generated);
      if (typeof window !== 'undefined') window.localStorage.setItem(key, generated);
    } catch {}
  }, []);
  return address;
};

// ============ Types & Icons ============

type MethodKey =
  | 'local-banks'
  | 'local-libyana'
  | 'local-madar'
  | 'global-paypal'
  | 'global-payoneer'
  | 'global-wise'
  | 'global-payeer'
  | 'digital-usdt-trc20'
  | 'unknown';

type MethodMeta = {
  title: string;
  description: string;
  currency: 'LYD' | 'USD' | 'USDT';
  processingTime: string;
  fees: string;
  limits?: string;
  tips?: string[];
  badge?: string;
  color: 'blue' | 'emerald' | 'purple' | 'slate';
};

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

// ============ Page ============
export default function DepositDynamicPage() {
  const router = useRouter();
  const trc20Address = useTrc20Address();
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // استخراج معرف وسيلة الدفع من الـ URL
  const paymentMethodId = useMemo(() => {
    const slugs = (router.query.slug as string[] | undefined) ?? [];
    if (slugs.length >= 2) {
      return slugs[1]; // يعيد المعرف الفعلي مثل: pm_1234567890
    }
    return null;
  }, [router.query.slug]);

  // جلب معلومات وسيلة الدفع من API
  useEffect(() => {
    if (!paymentMethodId) {
      setLoading(false);
      return;
    }

    const fetchPaymentMethod = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/payment-methods/${paymentMethodId}`);

        if (!response.ok) {
          throw new Error('فشل في جلب معلومات وسيلة الدفع');
        }

        const result = await response.json();

        if (result.success) {
          setPaymentMethod(result.data);
        } else {
          setError('وسيلة الدفع غير متاحة');
        }
      } catch (err) {
        console.error('خطأ في جلب وسيلة الدفع:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethod();
  }, [paymentMethodId]);

  const methodKey: MethodKey = useMemo(() => {
    const slugs = (router.query.slug as string[] | undefined) ?? [];
    if (slugs.length >= 2) {
      const [a, b] = slugs;
      const key = `${a}-${b}`.toLowerCase();
      if (
        key === 'local-banks' ||
        key === 'local-libyana' ||
        key === 'local-madar' ||
        key === 'global-paypal' ||
        key === 'global-payoneer' ||
        key === 'global-wise' ||
        key === 'global-payeer' ||
        key === 'digital-usdt-trc20'
      )
        return key as MethodKey;
    }
    return 'unknown';
  }, [router.query.slug]);

  const meta: MethodMeta = useMemo(() => {
    switch (methodKey) {
      case 'local-banks':
        return {
          title: 'إيداع محلي — البنوك الليبية',
          description:
            'قم بالتحويل عبر أحد البنوك الليبية ثم أرسل تفاصيل العملية ليتم توثيقها سريعاً',
          currency: 'LYD',
          processingTime: 'من 10 دقائق إلى 3 ساعات (عمل)',
          fees: '0% من طرفنا — رسوم البنك حسب النظام',
          limits: 'الحد الأدنى: 50 د.ل — لا يوجد حد أقصى',
          tips: [
            'أدرج رقم المرجع إن توفر',
            'احفظ إيصال التحويل',
            'تحقق من اسم المستفيد قبل الإرسال',
          ],
          badge: 'رسمي',
          color: 'blue',
        };
      case 'local-libyana':
        return {
          title: 'إيداع محلي — تعبئة رصيد ليبيانا',
          description: 'استخدم بطاقة تعبئة ليبيانا لإضافة رصيد إلى محفظتك المحلية',
          currency: 'LYD',
          processingTime: 'فوري بعد التحقق',
          fees: '0% من طرفنا',
          limits: 'حسب قيمة البطاقة',
          tips: ['تحقق من صحة الأرقام', 'لا تشارك البطاقة بعد استخدامها'],
          badge: 'بطاقات',
          color: 'purple',
        };
      case 'local-madar':
        return {
          title: 'إيداع محلي — تعبئة رصيد مدار',
          description: 'استخدم بطاقة تعبئة مدار لإضافة رصيد إلى محفظتك المحلية',
          currency: 'LYD',
          processingTime: 'فوري بعد التحقق',
          fees: '0% من طرفنا',
          limits: 'حسب قيمة البطاقة',
          tips: ['تحقق من صحة الأرقام', 'لا تشارك البطاقة بعد استخدامها'],
          badge: 'بطاقات',
          color: 'emerald',
        };
      case 'global-paypal':
        return {
          title: 'إيداع عالمي — PayPal',
          description: 'أرسل دفعتك عبر PayPal مع تأكيد داخل الصفحة لتسريع المعالجة',
          currency: 'USD',
          processingTime: 'من 5 دقائق إلى ساعتين (عمل)',
          fees: 'رسوم PayPal القياسية',
          tips: ['استخدم الدفع كـ Goods & Services لتتبع أفضل', 'أدرج المعرّف في الملاحظة'],
          color: 'emerald',
        };
      case 'global-payoneer':
        return {
          title: 'إيداع عالمي — Payoneer',
          description: 'قدّم طلب استلام وسيتم تزويدك بالتعليمات اللازمة',
          currency: 'USD',
          processingTime: 'حتى 24 ساعة (عمل)',
          fees: 'رسوم Payoneer القياسية',
          tips: ['اكتب الغرض: Wallet Top-up', 'أدرج المعرّف إن أمكن'],
          color: 'emerald',
        };
      case 'global-wise':
        return {
          title: 'إيداع عالمي — Wise',
          description: 'حوّل بنكيًا دوليًا وأدرج رمز المرجع لضمان إضافة الرصيد سريعًا',
          currency: 'USD',
          processingTime: '1-2 أيام عمل حسب البنك',
          fees: 'رسوم التحويل البنكي حسب البنك',
          tips: ['أدرج المرجع في الحقل المخصص', 'التأكد من بيانات المستفيد'],
          color: 'emerald',
        };
      case 'global-payeer':
        return {
          title: 'إيداع عالمي — Payeer',
          description: 'أرسل إلى معرف محفظتنا ثم سجّل TxID لتأكيد العملية',
          currency: 'USD',
          processingTime: 'من 10 دقائق إلى ساعتين',
          fees: 'رسوم Payeer القياسية',
          tips: ['احفظ TxID', 'تأكد من العُملة الصحيحة USD'],
          color: 'emerald',
        };
      case 'digital-usdt-trc20':
        return {
          title: 'إيداع رقمي — USDT (TRC20)',
          description: 'أرسل USDT على شبكة TRC20 فقط إلى عنوانك المخصص ثم أدخل Tx Hash',
          currency: 'USDT',
          processingTime: 'عادةً خلال دقائق بعد التأكيدات',
          fees: 'رسوم شبكة TRON فقط',
          tips: ['شبكة TRC20 فقط', 'تحقق من الحد الأدنى قبل الإرسال'],
          color: 'purple',
        };
      default:
        return {
          title: 'وسيلة إيداع',
          description: 'اختر وسيلة من صفحة المحفظة للمتابعة',
          currency: 'LYD',
          processingTime: '-',
          fees: '-',
          color: 'slate',
        };
    }
  }, [methodKey]);

  const title = meta.title;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Head>
        <title>{title}</title>
      </Head>
      <OpensooqNavbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <nav className="text-xs text-gray-500">المحفظة / الإيداع</nav>
              <h1 className="mt-1 text-2xl font-extrabold text-gray-900">{title}</h1>
              <p className="mt-1 text-sm text-gray-600">{meta.description}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/wallet"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                العودة للمحفظة
              </Link>
              <Link
                href="/wallet/transactions"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                سجل المعاملات
              </Link>
            </div>
          </div>
        </header>

        {methodKey === 'digital-usdt-trc20' && (
          <section className="mb-6 rounded-2xl border border-indigo-200 bg-gradient-to-l from-indigo-50 to-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-indigo-800">إيداع USDT (TRC20)</h2>
                <p className="mt-1 text-sm text-indigo-700">
                  أرسل فقط على شبكة TRC20. عنوانك مخصص ويظهر أدناه مع رمز QR.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="break-all rounded-md bg-white/70 px-3 py-2 text-sm text-gray-900">
                  {trc20Address || 'جارٍ التحميل...'}
                </code>
                <button
                  onClick={async () => {
                    if (trc20Address) {
                      await copyToClipboard(trc20Address);
                    }
                  }}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  نسخ العنوان
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {methodKey === 'local-banks' && <LocalBanksForm />}
            {methodKey === 'local-libyana' && <LocalCardForm vendor="ليبيانا" />}
            {methodKey === 'local-madar' && <LocalCardForm vendor="مدار" />}

            {methodKey === 'global-paypal' && <PaypalForm />}
            {methodKey === 'global-payoneer' && <PayoneerForm />}
            {methodKey === 'global-wise' && <WiseForm />}
            {methodKey === 'global-payeer' && <PayeerForm />}

            {methodKey === 'digital-usdt-trc20' && <Trc20Form address={trc20Address} />}

            {methodKey === 'unknown' && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
                <p>لم يتم العثور على وسيلة الإيداع المطلوبة.</p>
                <p className="mt-2 text-sm">يرجى اختيار وسيلة من صفحة المحفظة.</p>
                <div className="mt-4">
                  <Link
                    href="/wallet"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    الذهاب إلى المحفظة
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-gray-900">تفاصيل الوسيلة</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">العملة</span>
                <span className="font-medium text-gray-900">{meta.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">زمن المعالجة</span>
                <span className="font-medium text-gray-900">{meta.processingTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">الرسوم</span>
                <span className="font-medium text-gray-900">{meta.fees}</span>
              </div>
              {meta.limits && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الحدود</span>
                  <span className="font-medium text-gray-900">{meta.limits}</span>
                </div>
              )}
            </div>
            {meta.tips && meta.tips.length > 0 && (
              <div className="mt-4 rounded-md bg-gray-50 p-3">
                <div className="mb-1 text-xs font-semibold text-gray-700">نصائح</div>
                <ul className="list-disc space-y-1 pr-5 text-xs text-gray-600">
                  {meta.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 rounded-md border border-dashed border-gray-300 p-3 text-xs text-gray-600">
              عند أي مشكلة، يرجى التواصل مع الدعم وتزويدنا بالمرجع أو TxID لتسريع المعالجة.
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

// ============ Shared UI ============
const SectionContainer = memo(function SectionContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">{children}</div>
    </section>
  );
});

const Field = memo(function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
});

const Actions = memo(function Actions({
  primaryText = 'متابعة',
  onSubmit,
  disabled,
}: {
  primaryText?: string;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <button
        onClick={onSubmit}
        disabled={disabled}
        className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${disabled ? 'cursor-not-allowed bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {primaryText}
      </button>
      <Link
        href="/wallet"
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        إلغاء
      </Link>
    </div>
  );
});

const SuccessBanner = memo(function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
      {message}
    </div>
  );
});

// ============ Local - Banks ============
const LocalBanksForm = memo(function LocalBanksForm() {
  const [selectedBankId, setSelectedBankId] = useState<string>(
    () => getBanksByPopularity()[0]?.id || '',
  );
  const [query, setQuery] = useState('');
  const banks = useMemo(() => {
    const base = getBanksByPopularity();
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (b) =>
        b.nameAr.toLowerCase().includes(q) ||
        b.nameEn.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q),
    );
  }, [query]);
  const selectedBank = useMemo(
    () => libyanBanks.find((b) => b.id === selectedBankId),
    [selectedBankId],
  );
  const [amount, setAmount] = useState('');
  const [iban, setIban] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const amountNum = Number(amount || 0);
  const errors = {
    amount: amount !== '' && amountNum < 5 ? 'الحد الأدنى للإيداع هو 5 د.ل' : undefined,
    iban:
      iban !== '' && !/^[A-Z]{2}[0-9A-Z]{12,32}$/i.test(iban.replace(/\s/g, ''))
        ? 'رقم IBAN غير صالح'
        : undefined,
  };
  const disabled = amount === '' || !!errors.amount || iban === '' || !!errors.iban;

  const submit = () => {
    setSubmitted(true);
  };

  return (
    <SectionContainer
      title="تحويل عبر البنوك الليبية"
      subtitle="أكمل التحويل من تطبيق البنك أو الفرع ثم أرسل تفاصيل العملية"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-800">اختيار البنك</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن بنك بالاسم أو الكود..."
              className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {banks.map((b) => {
              const selected = b.id === selectedBankId;
              return (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setSelectedBankId(b.id)}
                  className={`group relative aspect-square rounded-xl border-2 p-3 text-right transition-all duration-200 focus:outline-none ${
                    selected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-2 hover:border-blue-300'
                  }`}
                  aria-pressed={selected}
                >
                  <div className="flex h-full flex-col items-center justify-center">
                    <BankLogo bankName={b.nameAr} size="medium" />
                    <div className="mt-2 text-center text-xs font-semibold text-gray-900">
                      {b.nameAr}
                    </div>
                    <div className="mt-1 text-[10px] text-gray-500">{b.code}</div>
                  </div>
                  {selected && (
                    <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      محدد
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedBank && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-xs">
              <div className="text-gray-700">
                البنك المختار:{' '}
                <span className="font-semibold text-gray-900">{selectedBank.nameAr}</span> — الكود:{' '}
                <span className="font-mono">{selectedBank.code}</span>
              </div>
              <div className="hidden gap-2 sm:flex">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                  {selectedBank.type}
                </span>
                {selectedBank.swiftCode && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                    SWIFT: {selectedBank.swiftCode}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <Field label="المبلغ (LYD)" hint="الحد الأدنى 50 د.ل" error={errors.amount}>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
          />
        </Field>
        <Field label="رقم IBAN" hint="أدخل رقم IBAN الخاص بالحساب المحوَّل منه" error={errors.iban}>
          <input
            dir="ltr"
            placeholder="LY00 0000 0000 0000 0000 0000"
            value={iban}
            onChange={(e) => setIban(e.target.value.toUpperCase())}
            className="rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-gray-800"
          />
        </Field>
      </div>
      <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
        حساب الاستقبال: شركة سوق مزاد — تفاصيل الحساب تظهر بعد تأكيد الطلب. يرجى التأكد من إدراج رقم
        المرجع إن توفر.
      </div>
      <Actions primaryText="إرسال الطلب" onSubmit={submit} disabled={disabled} />
      {submitted && (
        <SuccessBanner
          message={`تم استلام طلب إيداع بنكي بقيمة ${formatAmount(amountNum, 'LYD')} (IBAN: ${iban}). سيتم المراجعة خلال وقت قصير.`}
        />
      )}
    </SectionContainer>
  );
});

// ============ Local - Libyana / Madar ============
const LocalCardForm = memo(function LocalCardForm({ vendor }: { vendor: 'ليبيانا' | 'مدار' }) {
  // مبسط: حقل رقم الكرت فقط + أزرار
  const [cardCode, setCardCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [txRef, setTxRef] = useState<string | null>(null);

  const isLibyana = vendor === 'ليبيانا';

  const buttonClass = isLibyana
    ? 'bg-purple-700 hover:bg-purple-800'
    : 'bg-emerald-600 hover:bg-emerald-700';
  const focusRingClass = isLibyana
    ? 'focus:ring-purple-500 focus:border-purple-500'
    : 'focus:ring-emerald-500 focus:border-emerald-500';

  // Validation
  const digits = cardCode.replace(/\D/g, '');
  const requiredLength = isLibyana ? 14 : 16;
  const cardError =
    cardCode !== '' && digits.length !== requiredLength ? `رقم كارت ${vendor} غير صحيح` : undefined;
  const disabled = digits.length !== requiredLength;

  const submit = useCallback(() => {
    const ref = `TOPUP-${isLibyana ? 'LBY' : 'MDR'}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setTxRef(ref);
    setSubmitted(true);
  }, [isLibyana]);

  const placeholder = isLibyana
    ? 'أدخل رقم كارت ليبيانا — 14 رقم'
    : 'أدخل رقم كارت المدار — 16 رقم';

  return (
    <SectionContainer title={`تعبئة رصيد ${vendor}`}>
      {/* Prominent card input */}
      <div className="mt-5">
        <Field label="ادخل الكرت" error={cardError}>
          <input
            dir="ltr"
            inputMode="numeric"
            placeholder={placeholder}
            value={cardCode}
            onChange={(e) => setCardCode(e.target.value)}
            className={`w-full rounded-xl border-2 border-gray-300 px-4 py-3 font-mono text-lg tracking-widest text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${focusRingClass}`}
          />
        </Field>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={submit}
          disabled={disabled}
          className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${buttonClass} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          تعبئة الرصيد
        </button>
        <Link
          href="/wallet"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          إلغاء
        </Link>
      </div>

      {submitted && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          تم تعبئة الرصيد بنجاح
        </div>
      )}
    </SectionContainer>
  );
});

// ============ Global - PayPal ============
const PaypalForm = () => {
  const [email] = useState('payments@sooq-mazad.example');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const num = Number(amount || 0);
  const errors = {
    amount: amount !== '' && num <= 0 ? 'حدد المبلغ بالدولار' : undefined,
  };
  const disabled = amount === '' || !!errors.amount;

  const submit = () => {
    setSubmitted(true);
  };

  return (
    <SectionContainer title="PayPal" subtitle="أرسل دفعتك إلى البريد التالي أو اطلب رابط دفع">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="بريد الاستلام">
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">{email}</code>
            <button
              onClick={async () => {
                await copyToClipboard(email);
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              نسخ
            </button>
          </div>
        </Field>
        <Field label="المبلغ (USD)" error={errors.amount}>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
          />
        </Field>
        <Field label="ملاحظة (اختياري)">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
          />
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setSubmitted(true)}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          طلب رابط دفع
        </button>
        <Actions primaryText="لقد دفعت — إرسال تأكيد" onSubmit={submit} disabled={disabled} />
      </div>
      {submitted && (
        <SuccessBanner
          message={`تم تسجيل طلب/تأكيد PayPal بقيمة ${formatAmount(num, 'USD')}. سنقوم بالمراجعة قريباً.`}
        />
      )}
    </SectionContainer>
  );
};

// ============ Global - Payoneer ============
const PayoneerForm = () => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const num = Number(amount || 0);
  const errors = {
    amount: amount !== '' && num <= 0 ? 'حدد المبلغ بالدولار' : undefined,
  };
  const disabled = amount === '' || !!errors.amount;

  const submit = () => setSubmitted(true);

  return (
    <SectionContainer
      title="Payoneer"
      subtitle="قدّم طلب استلام عبر Payoneer وسيتم تزويدك بالتفاصيل"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="المبلغ (USD)" error={errors.amount}>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
          />
        </Field>
        <Field label="ملاحظة (اختياري)">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
          />
        </Field>
      </div>
      <Actions primaryText="إرسال الطلب" onSubmit={submit} disabled={disabled} />
      {submitted && (
        <SuccessBanner
          message={`تم تسجيل طلب Payoneer بقيمة ${formatAmount(num, 'USD')}. سنرسل التفاصيل للبريد قريباً.`}
        />
      )}
    </SectionContainer>
  );
};

// ============ Global - Wise ============
const WiseForm = () => {
  const [amount, setAmount] = useState('');
  const [reference] = useState(() => `SM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  const [submitted, setSubmitted] = useState(false);

  const bankInfo = {
    beneficiary: 'Sooq Mazad LTD',
    iban: 'GB00-WISE-IBAN-XXXX',
    swift: 'TRWIGB2L',
    bank: 'Wise Europe SA',
  };

  const num = Number(amount || 0);
  const errors = {
    amount: amount !== '' && num <= 0 ? 'حدد المبلغ بالدولار' : undefined,
  };
  const disabled = amount === '' || !!errors.amount;

  const submit = () => setSubmitted(true);

  return (
    <SectionContainer
      title="Wise"
      subtitle="قم بالتحويل البنكي الدولي مع إدراج المرجع لسرعة المعالجة"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="المستفيد">
          <code className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">
            {bankInfo.beneficiary}
          </code>
        </Field>
        <Field label="IBAN / حساب">
          <code className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">
            {bankInfo.iban}
          </code>
        </Field>
        <Field label="SWIFT/BIC">
          <code className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">
            {bankInfo.swift}
          </code>
        </Field>
        <Field label="اسم البنك">
          <code className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">
            {bankInfo.bank}
          </code>
        </Field>
        <Field label="المبلغ (USD)" error={errors.amount}>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
          />
        </Field>
        <Field label="رمز مرجع التحويل">
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">
              {reference}
            </code>
            <button
              onClick={async () => {
                await copyToClipboard(reference);
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              نسخ
            </button>
          </div>
        </Field>
      </div>
      <Actions primaryText="سجلت التحويل" onSubmit={submit} disabled={disabled} />
      {submitted && (
        <SuccessBanner
          message={`تم تسجيل تحويل Wise بقيمة ${formatAmount(num, 'USD')} بالمرجع ${reference}. ستتم الإضافة بعد وصول التحويل.`}
        />
      )}
    </SectionContainer>
  );
};

// ============ Global - Payeer ============
const PayeerForm = () => {
  const [walletId] = useState('P123456789');
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const num = Number(amount || 0);
  const errors = {
    amount: amount !== '' && num <= 0 ? 'حدد المبلغ بالدولار' : undefined,
    txId: txId !== '' && txId.length < 6 ? 'معرف العملية قصير جداً' : undefined,
  };
  const disabled = amount === '' || !!errors.amount || txId === '' || !!errors.txId;

  const submit = () => setSubmitted(true);

  return (
    <SectionContainer title="Payeer" subtitle="أرسل إلى المحفظة التالية ثم سجّل بيانات العملية">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="معرف المحفظة">
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">
              {walletId}
            </code>
            <button
              onClick={async () => {
                await copyToClipboard(walletId);
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              نسخ
            </button>
          </div>
        </Field>
        <Field label="المبلغ (USD)" error={errors.amount}>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
          />
        </Field>
        <Field label="TxID معرف العملية" error={errors.txId}>
          <input
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
          />
        </Field>
      </div>
      <Actions primaryText="إرسال التأكيد" onSubmit={submit} disabled={disabled} />
      {submitted && (
        <SuccessBanner
          message={`تم تسجيل Payeer بقيمة ${formatAmount(num, 'USD')} (TxID: ${txId}). سيتم التأكيد قريباً.`}
        />
      )}
    </SectionContainer>
  );
};

// ============ Digital - USDT TRC20 ============
const Trc20Form = ({ address }: { address: string }) => {
  const { user } = useUserContext();
  const [amount, setAmount] = useState('');
  const [confirmedNetwork, setConfirmedNetwork] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiRef, setApiRef] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const num = Number(amount || 0);
  const errors = {
    amount: amount !== '' && num < 10 ? 'الحد الأدنى للإيداع 10 USDT' : undefined,
  };
  const disabled = amount === '' || !!errors.amount || !address || !user?.id || !confirmedNetwork;

  const copyAddress = async () => {
    if (!address) return;
    const ok = await copyToClipboard(address);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const submit = async () => {
    if (!user?.id) {
      setApiError('يجب تسجيل الدخول لإرسال التأكيد');
      return;
    }
    try {
      setSubmitting(true);
      setApiError(null);
      setApiRef(null);

      const resp = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: num,
          currency: 'USDT-TRC20',
          walletType: 'CRYPTO',
          paymentMethodId: 'USDT_TRC20',
          metadata: { address, network: 'TRC20' },
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.message || 'فشل إرسال التأكيد');
      }

      setSubmitted(true);
      setApiRef(data.data?.reference || null);
    } catch (e: any) {
      setApiError(e?.message || 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionContainer
      title="USDT — TRC20"
      subtitle="أرسل على شبكة TRC20 فقط، ثم أدخل بيانات العملية"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="عنوان الإيداع">
          <div className="flex flex-col gap-2">
            <code className="break-all rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">
              {address || 'جارٍ التحميل...'}
            </code>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyAddress}
                className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                نسخ العنوان
              </button>
              {copied && <span className="text-xs text-green-700">تم النسخ</span>}
              {address && (
                <a
                  href={`https://tronscan.org/#/address/${address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  فتح على Tronscan
                </a>
              )}
            </div>
          </div>
        </Field>
        <Field label="رمز QR">
          <div className="flex items-center gap-3">
            <QRCodeGenerator
              value={address ? `tron:${address}` : ''}
              size={160}
              className="bg-white"
              errorCorrectionLevel="M"
              lazy
            />
          </div>
        </Field>
        <Field label="المبلغ (USDT)" hint="الحد الأدنى 10 USDT" error={errors.amount}>
          <input
            type="number"
            min={10}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
          />
        </Field>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">
        <input
          id="confirm-trc20"
          type="checkbox"
          className="mt-0.5 h-4 w-4 cursor-pointer accent-indigo-600"
          checked={confirmedNetwork}
          onChange={(e) => setConfirmedNetwork(e.target.checked)}
        />
        <label htmlFor="confirm-trc20" className="cursor-pointer">
          أؤكد أنني سأرسل USDT على شبكة TRC20 فقط، وأفهم أن أي تحويل على شبكة مختلفة قد يضيع.
        </label>
      </div>
      <div className="mt-3 rounded-md bg-indigo-50 p-3 text-sm text-indigo-800">
        تنبيه: أي تحويل على شبكة غير TRC20 قد يضيع. تحقق من الحد الأدنى قبل الإرسال.
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={submit}
          disabled={disabled || submitting}
          className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${disabled || submitting ? 'cursor-not-allowed bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {submitting ? 'جارٍ الإرسال...' : 'إرسال التأكيد'}
        </button>
        <Link
          href="/wallet"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          إلغاء
        </Link>
      </div>
      {apiError && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {apiError}
        </div>
      )}
      {submitted && (
        <div>
          <SuccessBanner
            message={`تم تسجيل إيداع TRC20 بقيمة ${formatAmount(num, 'USDT')}. سيُضاف الرصيد بعد تأكيد الشبكة.`}
          />
          {apiRef && (
            <div className="mt-3 rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-800">
              مرجع العملية: <code className="font-mono">{apiRef}</code>
              <div className="mt-2">
                <Link
                  href="/wallet/transactions"
                  className="text-sm font-semibold text-indigo-700 hover:underline"
                >
                  عرض في سجل المعاملات
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </SectionContainer>
  );
};
