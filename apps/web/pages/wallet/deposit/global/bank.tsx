import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar, SearchableSelect } from '../../../../components/common';
import PhoneInputField from '../../../../components/PhoneInputField';
import { type Country } from '../../../../components/CountryCodeSelector';
import { processPhoneNumber } from '../../../../utils/phoneUtils';
import { globalBanks, GlobalBank, CountryBanksData } from '../../../../data/global-banks';

// الدول المطلوبة: العربية + الأفريقية + تركيا + إيطاليا + مالطا
const ALLOWED_COUNTRIES = [
  // الدول العربية
  'AE',
  'SA',
  'EG',
  'JO',
  'KW',
  'QA',
  'BH',
  'OM',
  'MA',
  'TN',
  'DZ',
  'LB',
  'SY',
  'IQ',
  'YE',
  'LY',
  'SD',
  'SO',
  'DJ',
  'KM',
  'MR',
  // الدول الأفريقية
  'NG',
  'ZA',
  'KE',
  'GH',
  'ET',
  'TZ',
  'UG',
  'RW',
  'SN',
  'CI',
  'ML',
  'BF',
  'NE',
  'TD',
  'CM',
  'CF',
  'GA',
  'GQ',
  'CG',
  'CD',
  'AO',
  'ZM',
  'ZW',
  'MW',
  'MZ',
  'MG',
  'MU',
  'SC',
  'BW',
  'NA',
  'SZ',
  'LS',
  // الدول الإضافية المطلوبة
  'TR',
  'IT',
  'MT',
];

interface DepositFormData {
  country: string;
  bank: string;
  amount: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  notes: string;
}

export default function BankDepositPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<DepositFormData>({
    country: '',
    bank: '',
    amount: '',
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    notes: '',
  });
  const [selectedBankDetails, setSelectedBankDetails] = useState<GlobalBank | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [dialCode, setDialCode] = useState('+218');

  // فلترة البنوك حسب الدول المسموحة
  const allowedBanks = Object.fromEntries(
    Object.entries(globalBanks).filter(([code]) => ALLOWED_COUNTRIES.includes(code)),
  );

  // تحضير خيارات الدول للمكون القابل للبحث
  const countryOptions = Object.entries(allowedBanks).map(([code, country]) => ({
    value: code,
    label: `${country.nameAr} (${country.currency})`,
    searchTerms: [country.name, country.nameAr, country.currency, code],
  }));

  // الحصول على البنوك للدولة المختارة
  const getCountryBanks = (countryCode: string): GlobalBank[] => {
    return allowedBanks[countryCode]?.banks || [];
  };

  // تحديث تفاصيل البنك المختار
  useEffect(() => {
    if (formData.country && formData.bank) {
      const banks = getCountryBanks(formData.country);
      const bank = banks.find((b) => b.id === formData.bank);
      setSelectedBankDetails(bank || null);
    } else {
      setSelectedBankDetails(null);
    }
  }, [formData.country, formData.bank]);

  // إعادة تعيين البنك عند تغيير الدولة
  useEffect(() => {
    if (formData.country) {
      setFormData((prev) => ({ ...prev, bank: '' }));
    }
  }, [formData.country]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value, bank: '' }));
  };

  const handleBankChange = (value: string) => {
    setFormData((prev) => ({ ...prev, bank: value }));
  };

  // تحضير خيارات البنوك للدولة المختارة
  const bankOptions = formData.country
    ? getCountryBanks(formData.country).map((bank) => ({
        value: bank.id,
        label: `${bank.nameAr} - ${bank.fees}`,
        searchTerms: [bank.name, bank.nameAr, bank.fees],
      }))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // تحقق من رقم الهاتف بصيغة موحّدة E.164
      if (!formData.senderPhone.trim()) {
        alert('رقم الهاتف مطلوب');
        setIsSubmitting(false);
        return;
      }
      const phoneResult = processPhoneNumber(dialCode + formData.senderPhone);
      if (!phoneResult.isValid) {
        alert(phoneResult.error || 'رقم الهاتف غير صحيح');
        setIsSubmitting(false);
        return;
      }

      // محاكاة إرسال البيانات
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // إنشاء رقم مرجع
      const refId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      setTransactionId(refId);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <Head>
          <title>تم إرسال طلب الإيداع بنجاح | سوق مزاد</title>
        </Head>
        <OpensooqNavbar />

        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="mb-4 text-2xl font-bold text-gray-900">تم إرسال طلب الإيداع بنجاح!</h1>
            <p className="mb-6 text-gray-600">
              سيتم مراجعة طلبك خلال 24 ساعة وسنرسل لك تأكيد عبر البريد الإلكتروني
            </p>

            <div className="mb-6 rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-sm text-gray-600">رقم المرجع</p>
              <p className="font-mono text-lg font-bold text-gray-900">{transactionId}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/wallet"
                className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition-colors hover:bg-green-700"
              >
                العودة للمحفظة
              </Link>
              <Link
                href="/wallet/transactions"
                className="rounded-xl border border-green-600 px-6 py-3 font-bold text-green-600 transition-colors hover:bg-green-50"
              >
                تتبع المعاملات
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Head>
        <title>إيداع عبر التحويل المصرفي | سوق مزاد</title>
        <meta
          name="description"
          content="قم بإيداع الأموال في محفظتك عبر التحويل المصرفي من البنوك العربية وتركيا وإيطاليا ومالطا"
        />
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <nav aria-label="breadcrumbs" className="mb-4 text-sm text-gray-500">
            <Link href="/wallet" className="transition-colors hover:text-blue-600">
              المحفظة
            </Link>
            <span className="mx-2 text-gray-300">/</span>
            <Link href="/wallet/deposit/global" className="transition-colors hover:text-blue-600">
              الإيداع العالمي
            </Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="font-medium text-gray-900">التحويل المصرفي</span>
          </nav>

          <h1 className="mb-3 text-3xl font-bold text-gray-900">إيداع عبر التحويل المصرفي</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            اختر البنك المناسب لك وقم بإيداع الأموال بأمان وسرعة
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* نموذج الإيداع */}
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-gray-900">معلومات الإيداع</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* اختيار الدولة */}
              <div>
                <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-700">
                  اختر الدولة *
                </label>
                <SearchableSelect
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleCountryChange}
                  options={countryOptions}
                  placeholder="-- اختر الدولة --"
                  searchPlaceholder="ابحث عن الدولة..."
                  required
                  className="w-full"
                />
              </div>

              {/* اختيار البنك */}
              {formData.country && (
                <div>
                  <label htmlFor="bank" className="mb-2 block text-sm font-medium text-gray-700">
                    اختر البنك *
                  </label>
                  <SearchableSelect
                    id="bank"
                    name="bank"
                    value={formData.bank}
                    onChange={handleBankChange}
                    options={bankOptions}
                    placeholder="-- اختر البنك --"
                    searchPlaceholder="ابحث عن البنك..."
                    required
                    className="w-full"
                  />
                </div>
              )}

              {/* مبلغ الإيداع */}
              <div>
                <label htmlFor="amount" className="mb-2 block text-sm font-medium text-gray-700">
                  مبلغ الإيداع *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="10"
                    step="0.01"
                    placeholder="أدخل المبلغ"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  {selectedBankDetails && (
                    <div className="absolute left-3 top-3 text-sm text-gray-500">
                      {allowedBanks[formData.country]?.currency}
                    </div>
                  )}
                </div>
              </div>

              {/* اسم المرسل */}
              <div>
                <label
                  htmlFor="senderName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  اسم المرسل *
                </label>
                <input
                  type="text"
                  id="senderName"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleInputChange}
                  required
                  placeholder="الاسم الكامل كما يظهر في البنك"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <label
                  htmlFor="senderEmail"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  id="senderEmail"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="example@email.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* رقم الهاتف */}
              <div>
                <label
                  htmlFor="senderPhone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  رقم الهاتف *
                </label>
                <PhoneInputField
                  value={formData.senderPhone}
                  onChange={(v: string) => setFormData((prev) => ({ ...prev, senderPhone: v }))}
                  onCountryChange={(c: Country) => setDialCode(c.code)}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              {/* ملاحظات */}
              <div>
                <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">
                  ملاحظات إضافية
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="أي معلومات إضافية تود إضافتها..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* زر الإرسال */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.country || !formData.bank || !formData.amount}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    جاري الإرسال...
                  </div>
                ) : (
                  'إرسال طلب الإيداع'
                )}
              </button>
            </form>
          </div>

          {/* تفاصيل البنك المختار */}
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-gray-900">تفاصيل التحويل</h2>

            {selectedBankDetails ? (
              <div className="space-y-4">
                {/* معلومات البنك */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 font-bold text-blue-900">{selectedBankDetails.nameAr}</h3>
                  <p className="text-sm text-blue-700">{selectedBankDetails.name}</p>
                </div>

                {/* تفاصيل التحويل */}
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-600">رمز SWIFT:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {selectedBankDetails.swift}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-600">رقم IBAN:</span>
                    <span className="font-mono text-sm font-bold text-gray-900">
                      {selectedBankDetails.iban}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-600">رقم الحساب:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {selectedBankDetails.accountNumber}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-600">اسم المستفيد:</span>
                    <span className="font-bold text-gray-900">
                      {selectedBankDetails.beneficiaryName}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-600">الرسوم:</span>
                    <span className="font-bold text-green-600">{selectedBankDetails.fees}</span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-600">وقت المعالجة:</span>
                    <span className="font-bold text-blue-600">
                      {selectedBankDetails.processingTime}
                    </span>
                  </div>
                </div>

                {/* عنوان البنك */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 font-bold text-gray-900">عنوان البنك:</h4>
                  <p className="text-sm text-gray-700">{selectedBankDetails.address}</p>
                </div>

                {/* تعليمات مهمة */}
                <div className="rounded-lg bg-yellow-50 p-4">
                  <h4 className="mb-2 font-bold text-yellow-800">تعليمات مهمة:</h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>• تأكد من إدخال جميع البيانات بدقة</li>
                    <li>• احتفظ بإيصال التحويل</li>
                    <li>• سيتم تأكيد الإيداع خلال {selectedBankDetails.processingTime}</li>
                    <li>• تواصل معنا في حالة وجود أي استفسار</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">اختر البنك</h3>
                <p className="text-gray-500">قم بتحديد الدولة والبنك لعرض تفاصيل التحويل</p>
              </div>
            )}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-900">معلومات مهمة</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-bold text-gray-800">الدول المدعومة:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• جميع الدول العربية</p>
                <p>• تركيا</p>
                <p>• إيطاليا</p>
                <p>• مالطا</p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-bold text-gray-800">أوقات المعالجة:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• البنوك العربية: 1-2 أيام عمل</p>
                <p>• البنوك الأوروبية: 1-3 أيام عمل</p>
                <p>• البنوك التركية: 1-2 أيام عمل</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
