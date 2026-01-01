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

const useTrc20Address = (userId?: string) => {
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

        const response = await fetch(`/api/wallet/address/${userId}?network=TRC20`);
        const data = await response.json();

        if (response.ok && data.success && data.data.crypto?.address) {
          setAddress(data.data.crypto.address);
        } else {
          const generateResponse = await fetch('/api/wallet/address/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              walletType: 'CRYPTO',
              network: 'TRC20',
            }),
          });

          const generateData = await generateResponse.json();

          if (generateResponse.ok && generateData.success) {
            setAddress(generateData.data.address);
          } else {
            throw new Error(generateData.message || 'فشل في إنشاء العنوان');
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في جلب العنوان';
        console.error('Error fetching/generating address:', err);
        setError(errorMessage);

        const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let generated = 'T';
        for (let i = 0; i < 33; i++)
          generated += alphabet[Math.floor(Math.random() * alphabet.length)];
        setAddress(generated);
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateAddress();
  }, [userId]);

  return { address, loading, error };
};

// ============ Icon Set (inline SVG for tight control) ============
const IconArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M5 12h14" />
    <path d="M12 5l-7 7 7 7" />
  </svg>
);

const IconWallet = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    <path d="M17 12h4" />
  </svg>
);

const IconCopy = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconExternalLink = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
  </svg>
);

const IconDollarSign = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconShield = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconClock = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const IconSpark = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93 7.76 7.76" />
    <path d="M16.24 16.24 19.07 19.07" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 19.07 7.76 16.24" />
    <path d="M16.24 7.76 19.07 4.93" />
  </svg>
);

const IconInfo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export default function USDTDepositPage() {
  const { user } = useUserContext();
  const {
    address: trc20Address,
    loading: addressLoading,
    error: addressError,
  } = useTrc20Address(user?.id);
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
  const disabled =
    amount === '' || !!errors.amount || !trc20Address || !user?.id || !confirmedNetwork;

  const copyAddress = async () => {
    if (!trc20Address) return;
    const ok = await copyToClipboard(trc20Address);
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
          currency: 'USDT-TRC20',
          walletType: 'CRYPTO',
          paymentMethodId: 'USDT_TRC20',
          metadata: { address: trc20Address, network: 'TRC20' },
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
    {
      label: 'الحد الأدنى',
      value: '10 USDT',
      hint: 'رصيد يبدأ من 10 فقط',
      icon: IconDollarSign,
    },
    {
      label: 'الاعتمادية',
      value: '99.2%',
      hint: 'نجاح خلال آخر 30 يوماً',
      icon: IconShield,
    },
    {
      label: 'زمن الاعتماد',
      value: '5 – 15 د',
      hint: 'متوسط تأكيد الشبكة',
      icon: IconClock,
    },
  ];

  const timeline = [
    {
      title: 'نسخ عنوان المحفظة',
      desc: 'يتم توليد عنوان مخصص لكل مستخدم مع مراقبة لحظية.',
    },
    {
      title: 'إرسال المبلغ',
      desc: 'أرسل USDT عبر محفظة TRON أو أي منصة تدعم TRC20.',
    },
    {
      title: 'تأكيد الشبكة',
      desc: 'نراقب الكتلة على Tronscan ونحدّث الحالة فور الاعتماد.',
    },
    {
      title: 'إضافة الرصيد',
      desc: 'يتم تنبيهك فور إضافة الرصيد للمحفظة الرقمية.',
    },
  ];

  const tips = [
    'استخدم رسوم شبكة متوسطة لضمان تأكيد سريع.',
    'تأكد من مطابقة العنوان بالكامل قبل الإرسال.',
    'لا تستخدم عنواناً واحداً لإيداعات متعددة في نفس اللحظة.',
    'أبلغ الدعم فوراً في حال تأخر التحويل أكثر من 30 دقيقة.',
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950">
      <Head>
        <title>إيداع USDT (TRC20) - سوق مزاد</title>
        <meta name="description" content="إيداع العملات الرقمية USDT على شبكة TRC20 بأمان وسرعة" />
      </Head>

      <OpensooqNavbar />

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[140px]" />
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/4 bg-indigo-500/20 blur-[120px]" />
        </div>

        {/* Hero */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 shadow-[0_25px_70px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href="/wallet"
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200/80 transition hover:text-white"
              >
                <IconArrowLeft className="h-4 w-4" />
                العودة للمحفظة
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1 text-xs font-semibold text-emerald-100">
                  <IconSpark className="h-4 w-4" />
                  مدعوم بتقنية TRON
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold text-cyan-100">
                  شبكة TRC20
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                إيداع التيثر USDT عبر شبكة TRC20
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                منصة إيداع رقمية بمستوى بنكي، مع مراقبة لحظية، حماية متعددة الطبقات، وتجربة عربية
                موجهة بالكامل لتجار سوق مزاد.
              </p>
            </div>
            <div className="grid w-full gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-inner sm:grid-cols-3 lg:w-fit lg:min-w-[420px]">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-xl bg-white/5 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <Icon className="h-4 w-4 text-cyan-300" />
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

        {!user?.id && (
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
            <p className="text-sm">لتوليد عنوان الإيداع والبدء، يرجى تسجيل الدخول أولاً.</p>
            <Link
              href="/login"
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-50 hover:bg-amber-500/30"
            >
              تسجيل الدخول
            </Link>
          </div>
        )}

        {/* Main Content Grid */}
        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-8">
            {/* Address & QR */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl backdrop-blur-md lg:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/60">
                    عنوان الإيداع الذكي
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">محفظتك المضمونة</h2>
                </div>
                <div className="rounded-full border border-cyan-400/50 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-100">
                  {addressLoading ? 'جاري إنشاء العنوان...' : 'جاهز للاستقبال'}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-300">
                      عنوان TRC20 المخصص
                    </label>
                    <div className="rounded-2xl border border-white/15 bg-slate-900/40 p-4 font-mono text-sm leading-relaxed text-cyan-50">
                      {addressLoading ? '... جارٍ التحميل' : trc20Address}
                    </div>
                    {addressError && <p className="mt-1 text-xs text-rose-300">{addressError}</p>}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={copyAddress}
                      disabled={!trc20Address}
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
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
                    {trc20Address && (
                      <a
                        href={`https://tronscan.org/#/address/${trc20Address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50"
                      >
                        <IconExternalLink className="h-4 w-4" />
                        فتح على Tronscan
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="rounded-3xl border border-white/15 bg-white/5 p-4 shadow-inner">
                    {trc20Address ? (
                      <QRCodeGenerator
                        value={`tron:${trc20Address}`}
                        size={160}
                        className="bg-white p-2"
                        errorCorrectionLevel="M"
                        lazy
                      />
                    ) : (
                      <div className="flex h-[160px] w-[160px] items-center justify-center rounded-xl bg-white/10">
                        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">امسح الرمز عبر أي محفظة TRON معتمدة</p>
                </div>
              </div>
            </div>

            {/* Deposit Form */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-bl from-slate-900/90 to-slate-950/80 p-6 shadow-2xl backdrop-blur lg:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
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
                      min="10"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="اكتب قيمة الإيداع"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 pr-14 text-white placeholder:text-slate-400 focus:border-cyan-400"
                    />
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                      USDT
                    </span>
                  </div>
                  {errors.amount ? (
                    <p className="mt-2 text-xs text-rose-300">{errors.amount}</p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">
                      الحد الأدنى 10 USDT، بدون حد أعلى.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
                  <div className="flex items-start gap-3">
                    <input
                      id="confirm-trc20"
                      type="checkbox"
                      checked={confirmedNetwork}
                      onChange={(e) => setConfirmedNetwork(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-amber-200/70 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="confirm-trc20" className="text-sm leading-relaxed">
                      <span className="font-semibold">تأكيد مهم جداً:</span> أقِر أنني سأرسل على
                      شبكة TRC20 فقط، وأدرك أن أي تحويل على ERC20 أو BEP20 لن يتم رصده وقد يؤدي
                      لفقدان المبلغ.
                    </label>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100">
                  <p className="text-sm font-semibold text-white">ملخص سريع</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3 text-xs text-slate-300">
                      <p className="text-slate-100">الشبكة</p>
                      <p className="text-lg font-bold text-white">TRON (TRC20)</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3 text-xs text-slate-300">
                      <p className="text-slate-100">الشفافية</p>
                      <p className="text-lg font-bold text-white">متابعة عبر Tronscan</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={submit}
                  disabled={disabled || submitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
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
                          سيتم متابعة العملية واعتماد الرصيد تلقائياً بعد تأكيد الشبكة. قيمة الإيداع
                          المسجلة {formatAmount(num)}.
                        </p>
                        {apiRef && (
                          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200">
                            <p className="font-semibold text-white">مرجع العملية:</p>
                            <code className="mt-1 block text-base text-cyan-200">{apiRef}</code>
                            <Link
                              href="/wallet/transactions"
                              className="mt-2 inline-flex items-center gap-1 text-cyan-200 hover:text-white"
                            >
                              عرض في سجل المعاملات
                              <span className="text-xs">←</span>
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
                <span className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-200">
                  <IconInfo className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">دليل سريع</p>
                  <h3 className="text-xl font-semibold">خطوات التنفيذ</h3>
                </div>
              </div>
              <div className="mt-6 space-y-5">
                {timeline.map((item, idx) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm font-bold text-cyan-200">
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
                <li>إرسال أي عملة غير USDT سيضيع تلقائياً.</li>
                <li>لا تستخدم الشبكات ERC20 / BEP20 لهذا العنوان.</li>
                <li>احفظ إيصال المعاملة أو رابط Tronscan كمرجع.</li>
                <li>تواصل مع الدعم في حال تجاوزت مدة المعالجة 30 دقيقة.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
              <h3 className="text-lg font-semibold">أسرار النجاح</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6 text-white">
              <h3 className="text-xl font-semibold">هل تحتاج إلى مساعدة فورية؟</h3>
              <p className="mt-2 text-sm text-slate-200">
                فريق الدعم يعمل على مدار الساعة لمتابعة معاملات المحفظة الرقمية.
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
