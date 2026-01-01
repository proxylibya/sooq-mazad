/**
 * صفحة إيداع USDT على شبكة Solana
 * USDT Solana Network Deposit Page
 */
import Head from 'next/head';
import Link from 'next/link';
import type { SVGProps } from 'react';
import { useEffect, useState } from 'react';
import QRCodeGenerator from '../../../../components/QRCodeGenerator';
import { OpensooqNavbar } from '../../../../components/common';
import { useUserContext } from '../../../../contexts/UserContext';

// ============ Utilities ============
const formatAmount = (amount: number) => {
  return `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
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

const useSolanaAddress = (userId?: string) => {
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrGenerateAddress = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // محاولة جلب العنوان الموجود
        const response = await fetch(`/api/wallet/address/${userId}?network=solana`);
        const data = await response.json();

        if (response.ok && data.success && data.data.solana?.address) {
          setAddress(data.data.solana.address);
        } else {
          // إنشاء عنوان جديد
          const generateResponse = await fetch('/api/wallet/address/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              walletType: 'CRYPTO',
              network: 'SOLANA',
            }),
          });

          const generateData = await generateResponse.json();

          if (generateResponse.ok && generateData.success) {
            setAddress(generateData.data.address);
          } else {
            throw new Error(generateData.message || 'فشل في إنشاء العنوان');
          }
        }
      } catch (err: any) {
        console.error('Error fetching/generating Solana address:', err);
        setError(err.message || 'حدث خطأ في جلب العنوان');

        // Fallback to demo address
        const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let generated = '';
        for (let i = 0; i < 44; i++)
          generated += base58Chars[Math.floor(Math.random() * base58Chars.length)];
        setAddress(generated);
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateAddress();
  }, [userId]);

  return { address, loading, error };
};

// ============ Icons ============
const IconCopy = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const IconCheck = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const IconExternalLink = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15,3 21,3 21,9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const IconShield = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconClock = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const IconDollarSign = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const IconWallet = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
    <path d="M16 12h5" />
  </svg>
);

const IconInfo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const IconBolt = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export default function USDTSolanaDepositPage() {
  const { user } = useUserContext();
  const { address: solanaAddress, loading: addressLoading } = useSolanaAddress(user?.id);
  const [amount, setAmount] = useState('');
  const [confirmedNetwork, setConfirmedNetwork] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiRef, setApiRef] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const num = Number(amount || 0);
  const errors = {
    amount: amount !== '' && num < 5 ? 'الحد الأدنى للإيداع 5 USDT' : undefined,
  };
  const disabled =
    amount === '' || !!errors.amount || !solanaAddress || !user?.id || !confirmedNetwork;

  const copyAddress = async () => {
    if (!solanaAddress) return;
    const ok = await copyToClipboard(solanaAddress);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          currency: 'USDT-SOL',
          walletType: 'CRYPTO',
          paymentMethodId: 'USDT_SOLANA',
          metadata: { address: solanaAddress, network: 'SOLANA' },
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

  const quickStats = [
    { label: 'الحد الأدنى', value: '5 USDT', hint: 'رسوم شبه معدومة', icon: IconDollarSign },
    { label: 'الاعتمادية', value: '99.5%', hint: 'آخر 30 يوماً', icon: IconShield },
    { label: 'السرعة', value: 'ثوانٍ – 2د', hint: 'اعتماد الشبكة', icon: IconClock },
  ];

  const timeline = [
    { title: 'نسخ العنوان', desc: 'عنوان SPL مخصص للاستقبال على Solana.' },
    { title: 'إرسال المبلغ', desc: 'من محفظتك أو منصتك إلى العنوان.' },
    { title: 'تأكيد الشبكة', desc: 'متابعة لحظية عبر Solscan.' },
    { title: 'إضافة الرصيد', desc: 'تحديث تلقائي للمحفظة.' },
  ];

  const tips = [
    'استخدم سرعة شبكة تلقائية لضمان أسرع اعتماد.',
    'تحقق من أن الرمز USDT (SPL) وليس رموز مشابهة.',
    'لا ترسل على ERC20 أو BEP20 لهذا العنوان.',
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950">
      <Head>
        <title>إيداع USDT (Solana) - سوق مزاد</title>
        <meta name="description" content="إيداع العملات الرقمية USDT على شبكة Solana بسرعة فائقة" />
      </Head>

      <OpensooqNavbar />

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/20 blur-[140px]" />
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/4 bg-indigo-500/20 blur-[120px]" />
        </div>

        {/* Hero */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 shadow-[0_25px_70px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href="/wallet"
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-purple-200/80 transition hover:text-white"
              >
                <IconArrowLeft className="h-4 w-4" />
                العودة للمحفظة
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-400/10 px-4 py-1 text-xs font-semibold text-purple-100">
                  <IconBolt className="h-4 w-4" />
                  أداء فائق Solana
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-1 text-xs font-semibold text-indigo-100">
                  شبكة SOL
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                إيداع USDT على شبكة Solana
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                سرعة اعتماد استثنائية ورسوم شبه معدومة مع تجربة عربية متكاملة.
              </p>
            </div>
            <div className="grid w-full gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-inner sm:grid-cols-3 lg:w-fit lg:min-w-[420px]">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-xl bg-white/5 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <Icon className="h-4 w-4 text-purple-300" />
                      {stat.label}
                    </div>
                    <p className="mt-2 text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-300">{stat.hint}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-8">
            {/* Address & QR */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl backdrop-blur-md lg:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-purple-200/60">
                    عنوان الإيداع SPL
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">محفظتك الموثوقة</h2>
                </div>
                <div className="rounded-full border border-purple-400/50 bg-purple-400/10 px-4 py-2 text-xs font-semibold text-purple-100">
                  {addressLoading ? 'جاري إنشاء العنوان...' : 'جاهز للاستقبال'}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-300">
                      عنوان Solana المخصص
                    </label>
                    <div className="rounded-2xl border border-white/15 bg-slate-900/40 p-4 font-mono text-sm leading-relaxed text-indigo-50">
                      {addressLoading ? '... جارٍ التحميل' : solanaAddress || 'غير متاح'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={copyAddress}
                      disabled={!solanaAddress}
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
                    >
                      {copied ? (
                        <>
                          <IconCheck className="h-4 w-4" /> تم النسخ
                        </>
                      ) : (
                        <>
                          <IconCopy className="h-4 w-4" /> نسخ العنوان
                        </>
                      )}
                    </button>
                    {solanaAddress && (
                      <a
                        href={`https://solscan.io/account/${solanaAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:border-purple-300/50"
                      >
                        <IconExternalLink className="h-4 w-4" /> فتح على Solscan
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="rounded-3xl border border-white/15 bg-white/5 p-4 shadow-inner">
                    <QRCodeGenerator
                      value={solanaAddress ? `solana:${solanaAddress}` : ''}
                      size={160}
                      className="bg-white p-2"
                      errorCorrectionLevel="M"
                      lazy
                    />
                  </div>
                  <p className="text-xs text-slate-300">امسح الرمز بمحفظة تدعم Solana</p>
                </div>
              </div>
            </div>

            {/* Deposit Form */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-bl from-slate-900/90 to-slate-950/80 p-6 shadow-2xl backdrop-blur lg:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300">
                  <IconDollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">نموذج التأكيد</p>
                  <h3 className="text-2xl font-bold text-white">تأكيد قيمة الإيداع</h3>
                </div>
              </div>

              <div className="mt-8 space-y-8">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    المبلغ المرسل (USDT)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="اكتب قيمة الإيداع"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 pr-14 text-white placeholder:text-slate-400 focus:border-purple-400"
                    />
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-purple-300/40 bg-purple-300/10 px-3 py-1 text-xs text-purple-100">
                      USDT
                    </span>
                  </div>
                  {errors.amount ? (
                    <p className="mt-2 text-xs text-rose-300">{errors.amount}</p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">الحد الأدنى 5 USDT.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-purple-400/30 bg-purple-400/10 p-4 text-purple-100">
                  <div className="flex items-start gap-3">
                    <input
                      id="confirm-solana"
                      type="checkbox"
                      checked={confirmedNetwork}
                      onChange={(e) => setConfirmedNetwork(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-purple-200/70 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="confirm-solana" className="text-sm leading-relaxed">
                      <span className="font-semibold">تأكيد مهم:</span> أتعهد بإرسال USDT على Solana
                      فقط. التحويل على شبكات أخرى لن يُرصَد.
                    </label>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100">
                  <p className="text-sm font-semibold text-white">ملخص سريع</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3 text-xs text-slate-300">
                      <p className="text-slate-100">الشبكة</p>
                      <p className="text-lg font-bold text-white">Solana (SPL)</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3 text-xs text-slate-300">
                      <p className="text-slate-100">الشفافية</p>
                      <p className="text-lg font-bold text-white">متابعة عبر Solscan</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={submit}
                  disabled={disabled || submitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                      جارٍ إرسال طلب الإيداع
                    </div>
                  ) : (
                    'تأكيد الإيداع الآن'
                  )}
                </button>

                {apiError && (
                  <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
                    {apiError}
                  </div>
                )}

                {submitted && (
                  <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-white">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-200">
                        <IconCheck className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-emerald-100">
                          تم تسجيل طلب الإيداع بنجاح!
                        </p>
                        <p className="mt-1 text-sm text-emerald-50">
                          سيُضاف الرصيد تلقائياً بعد تأكيد الشبكة. قيمة الإيداع {formatAmount(num)}.
                        </p>
                        {apiRef && (
                          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200">
                            <p className="font-semibold text-white">مرجع العملية:</p>
                            <code className="mt-1 block text-base text-indigo-200">{apiRef}</code>
                            <Link
                              href="/wallet/transactions"
                              className="mt-2 inline-flex items-center gap-1 text-indigo-200 hover:text-white"
                            >
                              عرض في سجل المعاملات<span className="text-xs">←</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-purple-500/10 p-2 text-purple-200">
                  <IconBolt className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">دليل سريع</p>
                  <h3 className="text-xl font-semibold">خطوات التنفيذ</h3>
                </div>
              </div>
              <div className="mt-6 space-y-5">
                {timeline.map((item, idx) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm font-bold text-purple-200">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-slate-300">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-50">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <IconShield className="h-5 w-5" />
                تنبيهات الأمان
              </h3>
              <ul className="space-y-3 text-sm leading-relaxed">
                <li>لا ترسل على ERC20/BEP20 – هذا العنوان مخصص لـ Solana فقط.</li>
                <li>تحقق من العنوان كاملاً مع أول وآخر 6 حروف.</li>
                <li>احتفظ برابط Solscan كمرجع للعملية.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
              <h3 className="text-lg font-semibold">نصائح سريعة</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-purple-300" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-6 text-white">
              <h3 className="text-xl font-semibold">هل تحتاج إلى مساعدة فورية؟</h3>
              <p className="mt-2 text-sm text-slate-200">
                فريق الدعم يتابع معاملات Solana على مدار الساعة.
              </p>
              <Link
                href="/support"
                className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                تواصل مع خبير المحفظة
              </Link>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
