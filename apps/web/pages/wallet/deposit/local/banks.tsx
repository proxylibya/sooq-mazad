import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../../../../components/common';
import BankLogo from '../../../../components/BankLogo';
import { libyanBanks } from '../../../../data/libyan-banks';

const formatAmount = (amount: number) => {
  return `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ل`;
};

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
      clipRule="evenodd"
    />
  </svg>
);

const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.814 3.720 10.764 9.155 12.559a.75.75 0 0 0 1.19 0C18.030 20.514 21.75 15.564 21.75 9.75a12.74 12.74 0 0 0-.635-3.985.75.75 0 0 0-.722-.515 11.209 11.209 0 0 1-7.877-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      clipRule="evenodd"
    />
  </svg>
);

const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
      clipRule="evenodd"
    />
    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
  </svg>
);

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
    <path
      fillRule="evenodd"
      d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
      clipRule="evenodd"
    />
  </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      clipRule="evenodd"
    />
  </svg>
);

export default function LocalBankDepositPage() {
  const router = useRouter();
  const { bank: bankId } = router.query;

  const selectedBank = useMemo(() => libyanBanks.find((b) => b.id === bankId), [bankId]);

  const [amount, setAmount] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderIban, setSenderIban] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const amountNum = Number(amount || 0);
  const errors = {
    amount: amount !== '' && amountNum < 50 ? 'الحد الأدنى للإيداع هو 50 د.ل' : undefined,
    senderName: senderName !== '' && senderName.length < 3 ? 'الاسم قصير جداً' : undefined,
    senderIban:
      senderIban !== '' && !/^LY[0-9]{2}[0-9A-Z]{19,21}$/i.test(senderIban.replace(/\s/g, ''))
        ? 'رقم IBAN غير صحيح'
        : undefined,
  };

  const isValid =
    amount !== '' &&
    !errors.amount &&
    senderName !== '' &&
    !errors.senderName &&
    senderIban !== '' &&
    !errors.senderIban;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitted(true);
  };

  if (!selectedBank) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Head>
          <title>إيداع محلي - البنوك الليبية | سوق مزاد</title>
        </Head>
        <OpensooqNavbar />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">لم يتم اختيار بنك</h1>
            <p className="mb-6 text-gray-600">يرجى العودة واختيار البنك المناسب</p>
            <Link
              href="/wallet/deposit/local"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              العودة لاختيار البنك
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Head>
          <title>تم إرسال طلب الإيداع | سوق مزاد</title>
        </Head>
        <OpensooqNavbar />
        <main className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-2xl border border-green-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">تم إرسال طلب الإيداع بنجاح</h1>
            <p className="mb-2 text-lg text-gray-700">المبلغ: {formatAmount(amountNum)}</p>
            <p className="mb-6 text-gray-600">البنك: {selectedBank.nameAr}</p>
            <div className="mb-8 rounded-xl bg-green-50 p-6">
              <p className="mb-2 text-sm font-semibold text-green-800">سيتم مراجعة طلبك خلال:</p>
              <p className="text-2xl font-bold text-green-900">10 دقائق - 3 ساعات</p>
              <p className="mt-2 text-xs text-green-700">
                سيتم إضافة الرصيد تلقائياً بعد التحقق من العملية
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/wallet/transactions"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                عرض سجل المعاملات
              </Link>
              <Link
                href="/wallet"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                العودة للمحفظة
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Head>
        <title>إيداع عبر {selectedBank.nameAr} | سوق مزاد</title>
        <meta
          name="description"
          content={`إيداع رصيد إلى محفظتك المحلية عبر ${selectedBank.nameAr}`}
        />
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <nav aria-label="breadcrumbs" className="mb-3 text-sm text-gray-500">
            <Link href="/wallet" className="hover:text-gray-700">
              المحفظة
            </Link>
            <span className="mx-2">/</span>
            <Link href="/wallet/deposit/local" className="hover:text-gray-700">
              الإيداع المحلي
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">إيداع بنكي</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-gray-900">إيداع عبر البنوك الليبية</h1>
          <p className="mt-2 text-gray-600">أكمل نموذج الإيداع بعد إتمام التحويل البنكي</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <BankLogo bankName={selectedBank.nameAr} size="large" />
                </div>
                <div className="flex-1">
                  <h2 className="mb-1 text-xl font-bold text-gray-900">{selectedBank.nameAr}</h2>
                  <p className="mb-2 text-sm text-gray-600">{selectedBank.nameEn}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                      كود: {selectedBank.code}
                    </span>
                    {selectedBank.swiftCode && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        SWIFT: {selectedBank.swiftCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-6 text-xl font-bold text-gray-900">تفاصيل التحويل</h3>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    المبلغ المحول (د.ل) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل المبلغ"
                    required
                  />
                  {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
                  <p className="mt-1 text-xs text-gray-500">الحد الأدنى: 50 د.ل</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    اسم صاحب الحساب المرسل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="الاسم الكامل كما في البطاقة"
                    required
                  />
                  {errors.senderName && (
                    <p className="mt-1 text-xs text-red-600">{errors.senderName}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    رقم IBAN المرسل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={senderIban}
                    onChange={(e) => setSenderIban(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="LY00 0000 0000 0000 0000 0000"
                    required
                  />
                  {errors.senderIban && (
                    <p className="mt-1 text-xs text-red-600">{errors.senderIban}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">يبدأ بـ LY متبوعاً بالأرقام</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    رقم المرجع / العملية (اختياري)
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="رقم المرجع إن وجد"
                  />
                  <p className="mt-1 text-xs text-gray-500">يساعد على تسريع عملية التحقق</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    إيصال التحويل (اختياري)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-gray-600 transition-colors hover:border-blue-400 hover:bg-blue-50"
                    >
                      <CameraIcon className="h-6 w-6" />
                      <span className="text-sm font-medium">
                        {receiptFile ? receiptFile.name : 'انقر لرفع صورة الإيصال'}
                      </span>
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">صيغ مدعومة: JPG, PNG, PDF</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أي ملاحظات تود إضافتها..."
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={!isValid}
                  className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  إرسال طلب الإيداع
                </button>
                <Link
                  href="/wallet/deposit/local"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  إلغاء
                </Link>
              </div>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-900">معلومات الإيداع</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <ClockIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">وقت المعالجة</p>
                    <p className="text-gray-600">10 دقائق - 3 ساعات عمل</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">الرسوم</p>
                    <p className="text-gray-600">0% من طرفنا - رسوم البنك فقط</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DocumentTextIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900">الحد الأدنى</p>
                    <p className="text-gray-600">50 د.ل</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h4 className="mb-3 text-sm font-bold text-amber-900">نصائح مهمة</h4>
              <ul className="space-y-2 text-xs text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600"></span>
                  <span>تأكد من صحة البيانات المدخلة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600"></span>
                  <span>احفظ إيصال التحويل للرجوع إليه</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600"></span>
                  <span>رفع صورة الإيصال يسرع عملية التحقق</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600"></span>
                  <span>تواصل مع الدعم عند أي استفسار</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
